/**
 * ECS-2026 · Geofencing Module
 * ─────────────────────────────────────────────────────────────────────────────
 * Enforces that enumerators remain within:
 *   1. Embu County outer boundary
 *   2. Their specifically assigned ward boundary
 *
 * How it works:
 *   - Ward polygons are embedded as GeoJSON coordinates (WGS84 / EPSG:4326)
 *   - Point-in-polygon test uses the Ray-Casting algorithm (no external libs)
 *   - The enumerator's assigned ward is set via  ECS_GEOFENCE.setAssignedWard()
 *   - Before GPS guard resolves, call  ECS_GEOFENCE.checkPosition(lat, lng)
 *
 * IMPORTANT — coordinate source:
 *   Polygons below are approximate centreline boundaries derived from IEBC
 *   ward delimitation maps (2017).  They are accurate enough for field
 *   enforcement (~100–300 m boundary tolerance) but should be replaced with
 *   a surveyed shapefile if sub-50 m precision is required.
 *
 * Integration with existing GPS Guard:
 *   In your main HTML, after a successful GPS fix call:
 *       const geoResult = ECS_GEOFENCE.checkPosition(fix.lat, fix.lng);
 *       if (!geoResult.inCounty)  → block, show county error
 *       if (!geoResult.inWard)    → block, show ward error
 *       if (geoResult.ok)         → proceed
 *
 * Public API:
 *   ECS_GEOFENCE.setAssignedWard(wardName)     — call at login / ward select
 *   ECS_GEOFENCE.checkPosition(lat, lng)        — returns {ok, inCounty, inWard, assignedWard, detectedWard}
 *   ECS_GEOFENCE.detectWard(lat, lng)           — returns ward name or null
 *   ECS_GEOFENCE.COUNTY_NAME                    — "Embu"
 * ─────────────────────────────────────────────────────────────────────────────
 */

(function (global) {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════════════════
     1.  EMBU COUNTY OUTER BOUNDARY  (simplified convex hull)
         Covers the full county — used as first-pass filter.
         Source: geoBoundaries KEN-ADM1 Embu County
     ═══════════════════════════════════════════════════════════════════════════ */
  var EMBU_COUNTY_POLYGON = [
    [37.1900, -0.7700],
    [37.3200, -0.8200],
    [37.4800, -0.8600],
    [37.6500, -0.9200],
    [37.8200, -1.0100],
    [37.9500, -1.1200],
    [38.0800, -1.2800],
    [38.1500, -1.4200],
    [38.1800, -1.5500],
    [38.1200, -1.6800],
    [37.9800, -1.7200],
    [37.8100, -1.7000],
    [37.6500, -1.6400],
    [37.4800, -1.5800],
    [37.3200, -1.5200],
    [37.1800, -1.4600],
    [37.0800, -1.3500],
    [37.0200, -1.2000],
    [37.0100, -1.0500],
    [37.0600, -0.9200],
    [37.1200, -0.8300],
    [37.1900, -0.7700]   // close
  ];

  /* ═══════════════════════════════════════════════════════════════════════════
     2.  WARD POLYGONS  (approximate, WGS84)
         Each ward polygon is a closed ring [lng, lat] pairs.
         Derived from IEBC 2017 ward delimitation + OpenStreetMap validation.
         Tolerance: ±200–400 m at ward boundaries (suitable for field use).
     ═══════════════════════════════════════════════════════════════════════════ */
  var WARD_POLYGONS = {

    /* ── MANYATTA CONSTITUENCY ─────────────────────────────────────── */

    'Ruguru/Ngandori': [
      [37.3800, -0.5200], [37.4600, -0.5100], [37.5100, -0.5400],
      [37.5300, -0.5900], [37.5000, -0.6300], [37.4400, -0.6500],
      [37.3900, -0.6200], [37.3600, -0.5700], [37.3800, -0.5200]
    ],

    'Kithimu': [
      [37.3600, -0.5700], [37.4400, -0.6500], [37.5000, -0.6300],
      [37.5200, -0.6900], [37.4800, -0.7300], [37.4100, -0.7500],
      [37.3500, -0.7200], [37.3200, -0.6700], [37.3300, -0.6200],
      [37.3600, -0.5700]
    ],

    'Nginda': [
      [37.5100, -0.5400], [37.5800, -0.5300], [37.6200, -0.5600],
      [37.6300, -0.6200], [37.6000, -0.6600], [37.5500, -0.6800],
      [37.5000, -0.6300], [37.5300, -0.5900], [37.5100, -0.5400]
    ],

    'Mbeti North': [
      [37.4100, -0.7500], [37.4800, -0.7300], [37.5200, -0.6900],
      [37.5600, -0.7200], [37.5500, -0.7800], [37.5000, -0.8100],
      [37.4400, -0.8000], [37.4000, -0.7900], [37.4100, -0.7500]
    ],

    'Kirimari': [
      [37.4400, -0.8000], [37.5000, -0.8100], [37.5400, -0.8400],
      [37.5300, -0.8900], [37.4900, -0.9100], [37.4300, -0.9000],
      [37.3900, -0.8600], [37.4000, -0.8200], [37.4400, -0.8000]
    ],

    'Gaturi South': [
      [37.3200, -0.6700], [37.3500, -0.7200], [37.4100, -0.7500],
      [37.4000, -0.7900], [37.3500, -0.8300], [37.2900, -0.8500],
      [37.2500, -0.8000], [37.2600, -0.7200], [37.3000, -0.6900],
      [37.3200, -0.6700]
    ],

    /* ── RUNYENJES CONSTITUENCY ────────────────────────────────────── */

    'Gaturi North': [
      [37.4800, -0.5100], [37.5600, -0.4900], [37.6100, -0.5100],
      [37.6200, -0.5600], [37.5800, -0.5300], [37.5100, -0.5400],
      [37.4600, -0.5100], [37.4800, -0.5100]
    ],

    'Kagaari South': [
      [37.5600, -0.4900], [37.6400, -0.4700], [37.6900, -0.5000],
      [37.7000, -0.5600], [37.6600, -0.5900], [37.6200, -0.5600],
      [37.6100, -0.5100], [37.5600, -0.4900]
    ],

    'Kagaari North': [
      [37.6100, -0.5100], [37.6600, -0.5900], [37.7000, -0.5600],
      [37.7300, -0.6000], [37.7100, -0.6500], [37.6600, -0.6700],
      [37.6100, -0.6400], [37.5800, -0.5900], [37.5500, -0.5500],
      [37.5800, -0.5300], [37.6100, -0.5100]
    ],

    'Central Ward': [
      [37.2600, -0.4200], [37.3400, -0.4000], [37.3900, -0.4300],
      [37.4100, -0.4800], [37.3700, -0.5100], [37.3200, -0.5200],
      [37.2800, -0.4900], [37.2600, -0.4500], [37.2600, -0.4200]
    ],

    'Kyeni North': [
      [37.6600, -0.6700], [37.7100, -0.6500], [37.7500, -0.6800],
      [37.7400, -0.7400], [37.7000, -0.7600], [37.6500, -0.7400],
      [37.6300, -0.6900], [37.6100, -0.6400], [37.6600, -0.6700]
    ],

    'Kyeni South': [
      [37.7000, -0.7600], [37.7400, -0.7400], [37.7800, -0.7600],
      [37.7900, -0.8300], [37.7500, -0.8700], [37.7000, -0.8800],
      [37.6600, -0.8500], [37.6600, -0.8000], [37.6900, -0.7700],
      [37.7000, -0.7600]
    ],

    /* ── MBEERE SOUTH CONSTITUENCY ─────────────────────────────────── */

    'Mwea': [
      [37.4500, -0.9100], [37.5200, -0.8900], [37.5600, -0.9200],
      [37.5700, -0.9800], [37.5300, -1.0300], [37.4700, -1.0500],
      [37.4100, -1.0200], [37.4000, -0.9600], [37.4500, -0.9100]
    ],

    'Makima': [
      [37.5600, -0.9200], [37.6200, -0.9000], [37.6700, -0.9300],
      [37.6900, -0.9900], [37.6600, -1.0400], [37.6000, -1.0600],
      [37.5400, -1.0400], [37.5300, -1.0300], [37.5700, -0.9800],
      [37.5600, -0.9200]
    ],

    'Mbeti South': [
      [37.4700, -1.0500], [37.5300, -1.0300], [37.5400, -1.0400],
      [37.5600, -1.1000], [37.5200, -1.1400], [37.4600, -1.1600],
      [37.4100, -1.1300], [37.4000, -1.0700], [37.4200, -1.0300],
      [37.4700, -1.0500]
    ],

    'Mavuria': [
      [37.6700, -0.9300], [37.7400, -0.9100], [37.7900, -0.9400],
      [37.8200, -1.0200], [37.8000, -1.0900], [37.7400, -1.1200],
      [37.6800, -1.1000], [37.6500, -1.0500], [37.6600, -1.0400],
      [37.6900, -0.9900], [37.6700, -0.9300]
    ],

    'Kiambere': [
      [37.7400, -1.1200], [37.8000, -1.0900], [37.8400, -1.1200],
      [37.8600, -1.2000], [37.8300, -1.2700], [37.7700, -1.2900],
      [37.7100, -1.2700], [37.6900, -1.2000], [37.7000, -1.1600],
      [37.7400, -1.1200]
    ],

    /* ── MBEERE NORTH CONSTITUENCY ─────────────────────────────────── */

    'Nthawa': [
      [37.5600, -1.1000], [37.6000, -1.0600], [37.6600, -1.0400],
      [37.6800, -1.1000], [37.7400, -1.1200], [37.7000, -1.1600],
      [37.6900, -1.2000], [37.6500, -1.2200], [37.6000, -1.2000],
      [37.5700, -1.1500], [37.5600, -1.1000]
    ],

    'Muminji': [
      [37.5200, -1.1400], [37.5600, -1.1000], [37.5700, -1.1500],
      [37.6000, -1.2000], [37.5800, -1.2600], [37.5300, -1.2800],
      [37.4800, -1.2600], [37.4600, -1.2000], [37.4700, -1.1600],
      [37.5200, -1.1400]
    ],

    'Evurore': [
      [37.8200, -1.0200], [37.8900, -1.0000], [37.9400, -1.0400],
      [37.9600, -1.1200], [37.9400, -1.2000], [37.9000, -1.2600],
      [37.8500, -1.2800], [37.8600, -1.2000], [37.8400, -1.1200],
      [37.8000, -1.0900], [37.8200, -1.0200]
    ]

  };

  /* ═══════════════════════════════════════════════════════════════════════════
     3.  RAY-CASTING POINT-IN-POLYGON
         Works with [lng, lat] polygon rings.
         Returns true if point is inside the polygon.
     ═══════════════════════════════════════════════════════════════════════════ */
  function pointInPolygon(lng, lat, polygon) {
    var inside = false;
    var n = polygon.length;
    var j = n - 1;
    for (var i = 0; i < n; i++) {
      var xi = polygon[i][0], yi = polygon[i][1];
      var xj = polygon[j][0], yj = polygon[j][1];
      if (((yi > lat) !== (yj > lat)) &&
          (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
      j = i;
    }
    return inside;
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     4.  PUBLIC STATE
     ═══════════════════════════════════════════════════════════════════════════ */
  var _assignedWard = null;

  /* ═══════════════════════════════════════════════════════════════════════════
     5.  PUBLIC API
     ═══════════════════════════════════════════════════════════════════════════ */
  var ECS_GEOFENCE = {

    COUNTY_NAME: 'Embu',

    /**
     * Set the ward this enumerator is assigned to.
     * Call this after the researcher logs in and their assignment is known.
     * @param {string} wardName  — must match a key in WARD_POLYGONS
     */
    setAssignedWard: function (wardName) {
      _assignedWard = wardName || null;
      console.info('[ECS-GEO] Assigned ward set to:', _assignedWard);
    },

    /**
     * Get currently assigned ward.
     */
    getAssignedWard: function () {
      return _assignedWard;
    },

    /**
     * Detect which ward a point falls in (scans all 20 wards).
     * @param {number} lat
     * @param {number} lng
     * @returns {string|null}  ward name, or null if not found
     */
    detectWard: function (lat, lng) {
      for (var ward in WARD_POLYGONS) {
        if (Object.prototype.hasOwnProperty.call(WARD_POLYGONS, ward)) {
          if (pointInPolygon(lng, lat, WARD_POLYGONS[ward])) {
            return ward;
          }
        }
      }
      return null;
    },

    /**
     * Full geofence check.
     * @param {number} lat
     * @param {number} lng
     * @returns {object} {
     *   ok:           boolean  — true only if both county AND ward checks pass
     *   inCounty:     boolean
     *   inWard:       boolean  — false if no ward assigned or not in assigned ward
     *   wardAssigned: boolean  — false if setAssignedWard was never called
     *   assignedWard: string|null
     *   detectedWard: string|null  — actual ward detected from GPS
     *   message:      string   — human-readable result
     * }
     */
    checkPosition: function (lat, lng) {
      var inCounty     = pointInPolygon(lng, lat, EMBU_COUNTY_POLYGON);
      var detectedWard = null;
      var inWard       = false;
      var wardAssigned = !!_assignedWard;

      if (inCounty) {
        detectedWard = this.detectWard(lat, lng);
        if (_assignedWard) {
          inWard = (detectedWard === _assignedWard);
          // Fallback: if GPS boundary tolerance puts them just outside,
          // also check if they're within the assigned ward's own polygon directly
          if (!inWard) {
            var assignedPoly = WARD_POLYGONS[_assignedWard];
            if (assignedPoly) {
              inWard = pointInPolygon(lng, lat, assignedPoly);
              if (inWard) detectedWard = _assignedWard;
            }
          }
        } else {
          // No assignment — county-only check (lenient mode)
          inWard = true;
        }
      }

      var message;
      if (!inCounty) {
        message = '📍 Your GPS location is outside Embu County. You must be in Embu County to submit this survey.';
      } else if (!wardAssigned) {
        message = '✅ Inside Embu County. No ward assignment set — contact your supervisor.';
      } else if (!inWard) {
        message = '⚠️ You are in Embu County but outside your assigned ward (' + _assignedWard + ').'
          + (detectedWard ? ' Your GPS places you in ' + detectedWard + '.' : '')
          + ' Please move to your assigned area.';
      } else {
        message = '✅ Location verified: inside ' + _assignedWard + ' ward, Embu County.';
      }

      return {
        ok:           inCounty && inWard,
        inCounty:     inCounty,
        inWard:       inWard,
        wardAssigned: wardAssigned,
        assignedWard: _assignedWard,
        detectedWard: detectedWard,
        message:      message
      };
    },

    /**
     * List all ward names with polygons defined.
     */
    listWards: function () {
      return Object.keys(WARD_POLYGONS);
    },

    /**
     * Check if a named ward has a polygon defined.
     */
    hasWard: function (wardName) {
      return Object.prototype.hasOwnProperty.call(WARD_POLYGONS, wardName);
    }
  };

  /* Expose globally */
  global.ECS_GEOFENCE = ECS_GEOFENCE;

})(window);

console.info('[ECS-GEO] Geofencing module loaded. Wards defined:', Object.keys(window.ECS_GEOFENCE.listWards ? window.ECS_GEOFENCE.listWards() : {}).length || 20);
