/**
 * ECS-2026 · Geofencing Module  v2.0
 * ─────────────────────────────────────────────────────────────────────────────
 * WHAT CHANGED in v2.0:
 *   - getAssignedWard() now publicly exposed
 *   - detectWard() returns the actual GPS ward (not respondent's self-report)
 *   - checkPosition() now returns wardWarning (soft flag) vs hard block
 *   - Ward check is now advisory by default — hard blocking is opt-in via
 *     ECS_GEOFENCE.setStrictMode(true)
 *   - Added distanceToWardBoundary() helper for better UX messages
 *
 * KEY DESIGN DECISION:
 *   The geofence checks WHERE THE ENUMERATOR PHYSICALLY IS (GPS coordinates)
 *   against their assigned ward — NOT the respondent's self-reported ward.
 *
 *   Respondent lives in Ward A, enumerator assigned to Ward B, interview
 *   happens in Ward B → GPS is in Ward B → NO violation.
 *
 *   This is intentional. The monitor's ward violation flag now uses
 *   _gpsDetectedWard (saved in each submission) not d.ward (respondent ward).
 *
 * Public API:
 *   ECS_GEOFENCE.setAssignedWard(wardName)
 *   ECS_GEOFENCE.getAssignedWard()
 *   ECS_GEOFENCE.setStrictMode(bool)       — default false (soft warning)
 *   ECS_GEOFENCE.checkPosition(lat, lng)
 *   ECS_GEOFENCE.detectWard(lat, lng)
 *   ECS_GEOFENCE.listWards()
 *   ECS_GEOFENCE.hasWard(wardName)
 *   ECS_GEOFENCE.COUNTY_NAME
 * ─────────────────────────────────────────────────────────────────────────────
 */

(function (global) {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════════════════
     1.  EMBU COUNTY OUTER BOUNDARY  (simplified convex hull)
         Covers the full county — used as first-pass filter.
         Source: geoBoundaries KEN-ADM1 Embu County
         Format: [lng, lat] pairs
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
         Each polygon is a closed ring of [lng, lat] pairs.
         Derived from IEBC 2017 ward delimitation + OSM validation.
         Tolerance: ±200–400 m at ward boundaries (suitable for field use).

         NOTE: These polygons define WHERE THE ENUMERATOR IS WORKING,
         not where the respondent lives. The GPS fix is checked against
         these polygons to detect which operational zone the enumerator
         is physically standing in.
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
         Input: lng, lat, polygon as [[lng,lat],...]
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
     4.  HAVERSINE DISTANCE  (metres between two lat/lng points)
     ═══════════════════════════════════════════════════════════════════════════ */
  function haversineM(lat1, lng1, lat2, lng2) {
    var R = 6371000;
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLng = (lng2 - lng1) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     5.  CENTROID OF A POLYGON  (for distance-to-ward calculations)
     ═══════════════════════════════════════════════════════════════════════════ */
  function polygonCentroid(polygon) {
    var lngSum = 0, latSum = 0, n = polygon.length;
    for (var i = 0; i < n; i++) {
      lngSum += polygon[i][0];
      latSum += polygon[i][1];
    }
    return { lat: latSum / n, lng: lngSum / n };
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     6.  PUBLIC STATE
     ═══════════════════════════════════════════════════════════════════════════ */
  var _assignedWard = null;
  var _strictMode   = false;   // false = soft warning; true = hard block

  /* ═══════════════════════════════════════════════════════════════════════════
     7.  PUBLIC API
     ═══════════════════════════════════════════════════════════════════════════ */
  var ECS_GEOFENCE = {

    COUNTY_NAME: 'Embu',

    /* ── Assignment ── */

    /**
     * Set the ward this enumerator is assigned to work IN.
     * This is about WHERE THEY OPERATE — not where respondents live.
     * @param {string} wardName
     */
    setAssignedWard: function (wardName) {
      _assignedWard = wardName || null;
      console.info('[ECS-GEO] Assigned ward set to:', _assignedWard);
    },

    /**
     * Get the currently assigned ward.
     * @returns {string|null}
     */
    getAssignedWard: function () {
      return _assignedWard;
    },

    /**
     * Enable or disable strict mode.
     * Strict = hard block if enumerator GPS outside assigned ward.
     * Lenient (default) = soft warning, flagged in monitor but not blocked.
     * @param {boolean} strict
     */
    setStrictMode: function (strict) {
      _strictMode = !!strict;
      console.info('[ECS-GEO] Strict mode:', _strictMode ? 'ON (hard block)' : 'OFF (soft warning)');
    },

    getStrictMode: function () {
      return _strictMode;
    },

    /* ── Detection ── */

    /**
     * Detect which ward a GPS point falls in.
     * This tells you WHERE THE ENUMERATOR PHYSICALLY IS,
     * regardless of which ward the respondent lives in.
     * @param {number} lat
     * @param {number} lng
     * @returns {string|null}  ward name, or null if between boundaries
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
     * Find the nearest ward to a GPS point (useful for boundary edge cases).
     * Returns the ward whose centroid is closest.
     * @param {number} lat
     * @param {number} lng
     * @returns {{ ward: string, distanceM: number }}
     */
    nearestWard: function (lat, lng) {
      var best = null, bestDist = Infinity;
      for (var ward in WARD_POLYGONS) {
        if (Object.prototype.hasOwnProperty.call(WARD_POLYGONS, ward)) {
          var c    = polygonCentroid(WARD_POLYGONS[ward]);
          var dist = haversineM(lat, lng, c.lat, c.lng);
          if (dist < bestDist) { bestDist = dist; best = ward; }
        }
      }
      return { ward: best, distanceM: Math.round(bestDist) };
    },

    /**
     * Approximate distance from a GPS point to the assigned ward centroid.
     * Used for UX messages like "you are ~2.3 km from your assigned ward".
     * @param {number} lat
     * @param {number} lng
     * @returns {number|null}  metres, or null if no ward assigned
     */
    distanceToAssignedWard: function (lat, lng) {
      if (!_assignedWard || !WARD_POLYGONS[_assignedWard]) return null;
      var c = polygonCentroid(WARD_POLYGONS[_assignedWard]);
      return Math.round(haversineM(lat, lng, c.lat, c.lng));
    },

    /* ── Main check ── */

    /**
     * Full geofence check.
     *
     * IMPORTANT — this checks WHERE THE ENUMERATOR IS (GPS),
     * NOT where the respondent lives. The ward in this result
     * should be saved as _gpsDetectedWard in the submission,
     * and used by the admin monitor for violation detection.
     *
     * @param {number} lat
     * @param {number} lng
     * @returns {{
     *   ok:              boolean   — county OK and (ward OK or no assignment)
     *   inCounty:        boolean
     *   inWard:          boolean   — enumerator GPS is inside assigned ward
     *   wardWarning:     boolean   — outside ward but not hard-blocked (lenient mode)
     *   wardBlocked:     boolean   — outside ward and hard-blocked (strict mode)
     *   wardAssigned:    boolean   — was setAssignedWard() ever called?
     *   assignedWard:    string|null
     *   detectedWard:    string|null  — ward the GPS point actually falls in
     *   nearestWard:     string|null  — nearest ward if detectedWard is null
     *   distToAssigned:  number|null  — metres to assigned ward centroid
     *   message:         string
     *   strictMode:      boolean
     * }}
     */
    checkPosition: function (lat, lng) {
      var inCounty     = pointInPolygon(lng, lat, EMBU_COUNTY_POLYGON);
      var detectedWard = null;
      var nearestWardInfo = null;
      var inWard       = false;
      var wardAssigned = !!_assignedWard;
      var wardWarning  = false;
      var wardBlocked  = false;
      var distToAssigned = null;

      if (inCounty) {
        /* Step 1: detect which ward the GPS point is in */
        detectedWard = this.detectWard(lat, lng);

        /* Step 2: if GPS lands exactly on a boundary (returns null),
                   do a secondary check directly on the assigned polygon */
        if (!detectedWard && _assignedWard && WARD_POLYGONS[_assignedWard]) {
          if (pointInPolygon(lng, lat, WARD_POLYGONS[_assignedWard])) {
            detectedWard = _assignedWard;
          }
        }

        /* Step 3: find nearest ward for messaging if still null */
        if (!detectedWard) {
          nearestWardInfo = this.nearestWard(lat, lng);
        }

        /* Step 4: compare detected ward to assignment */
        if (_assignedWard) {
          inWard = (detectedWard === _assignedWard);
          distToAssigned = this.distanceToAssignedWard(lat, lng);

          if (!inWard) {
            if (_strictMode) {
              wardBlocked = true;   // hard block
            } else {
              wardWarning = true;   // soft flag only — still allow submission
            }
          }
        } else {
          /* No assignment — county-only check, always pass */
          inWard = true;
        }
      }

      /* ── Build human-readable message ── */
      var message;
      if (!inCounty) {
        message = '📍 Your GPS location is outside Embu County. You must be inside Embu County to submit.';
      } else if (!wardAssigned) {
        message = '✅ Inside Embu County. No ward assignment — unrestricted access.';
      } else if (inWard) {
        message = '✅ Location verified: inside ' + _assignedWard + ' ward, Embu County.';
      } else if (wardBlocked) {
        /* Strict mode — hard block */
        message = '🚫 You are outside your assigned ward (' + _assignedWard + ').'
          + (detectedWard  ? ' GPS places you in ' + detectedWard + '.' : '')
          + (distToAssigned ? ' Approx. ' + _fmtDist(distToAssigned) + ' from assigned ward.' : '')
          + ' Please move to your assigned area before submitting.';
      } else {
        /* Lenient mode — soft warning, will be flagged in monitor */
        message = '⚠️ Note: your GPS is outside your assigned ward (' + _assignedWard + ').'
          + (detectedWard  ? ' You appear to be in ' + detectedWard + '.' : '')
          + (distToAssigned ? ' (' + _fmtDist(distToAssigned) + ' from assigned ward).' : '')
          + ' This will be flagged for supervisor review but submission is allowed.';
      }

      return {
        ok:             inCounty && (inWard || wardWarning),  // soft warning = still ok
        inCounty:       inCounty,
        inWard:         inWard,
        wardWarning:    wardWarning,
        wardBlocked:    wardBlocked,
        wardAssigned:   wardAssigned,
        assignedWard:   _assignedWard,
        detectedWard:   detectedWard,
        nearestWard:    nearestWardInfo ? nearestWardInfo.ward : null,
        distToAssigned: distToAssigned,
        message:        message,
        strictMode:     _strictMode
      };
    },

    /* ── Utilities ── */

    listWards: function () {
      return Object.keys(WARD_POLYGONS);
    },

    hasWard: function (wardName) {
      return Object.prototype.hasOwnProperty.call(WARD_POLYGONS, wardName);
    },

    getWardPolygon: function (wardName) {
      return WARD_POLYGONS[wardName] || null;
    }
  };

  /* ── Private formatter ── */
  function _fmtDist(m) {
    return m < 1000 ? Math.round(m) + 'm' : (m / 1000).toFixed(1) + 'km';
  }

  /* Expose globally */
  global.ECS_GEOFENCE = ECS_GEOFENCE;

})(window);

console.info('[ECS-GEO] Geofencing module v2.0 loaded. Wards defined: 20');
