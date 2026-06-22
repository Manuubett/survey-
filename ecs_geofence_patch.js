/**
 * ECS-2026 · GEOFENCE PATCH  v2.0
 * ═══════════════════════════════════════════════════════════════════════════
 * Include AFTER ecs_polling_stations.js and ecs_geofence.js:
 *
 *   <script src="ecs_polling_stations.js?v=2"></script>
 *   <script src="ecs_geofence.js?v=2"></script>
 *   <script src="ecs_geofence_patch.js?v=2"></script>
 *
 * WHAT CHANGED in v2.0:
 * ─────────────────────────────────────────────────────────────────────────
 * KEY DESIGN FIX:
 *   The ward violation check now compares:
 *     GPS-detected ward (where enumerator physically is)
 *     vs. assigned ward (what the invite token says)
 *
 *   NOT:
 *     respondent's self-reported ward vs. assigned ward  ← was wrong
 *
 *   This means:
 *     Respondent from Ward A interviewed in Ward B (enumerator's zone) → ✅ OK
 *     Enumerator physically in Ward C when assigned to Ward B            → ⚠️ Flagged
 *
 * NEW in v2.0:
 *   - Saves _gpsDetectedWard to every submission (used by admin monitor)
 *   - Saves _gpsAssignedWard to every submission
 *   - Saves _gpsWardWarning flag (true = was outside ward but not blocked)
 *   - Ward check is soft warning by default (not a hard block)
 *   - Hard block only if ECS_GEOFENCE.setStrictMode(true)
 *   - Shows ward warning banner in survey UI when outside assigned ward
 *   - Loads ward assignment from invite token's assignedWards field
 *   - Supervisor can still override via ?ward=WARD_NAME in URL
 * ═══════════════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  /* ── 1. Read ?ward= pre-assignment from URL ── */
  (function () {
    var params    = new URLSearchParams(window.location.search);
    var wardParam = params.get('ward');
    if (wardParam) {
      sessionStorage.setItem('ecs26_assigned_ward', wardParam);
      console.info('[ECS-GEO-PATCH] Ward pre-set from URL:', wardParam);
    }
  })();

  /* ═══════════════════════════════════════════════════════════════════════
     2. LOAD WARD ASSIGNMENT
        Priority order:
          1. Invite token's assignedWards (from Firestore invites collection)
          2. URL ?ward= parameter (supervisor override)
          3. sessionStorage fallback
          4. localStorage fallback (legacy)
     ═══════════════════════════════════════════════════════════════════════ */
  window.loadWardAssignment = async function (uid, inviteToken) {

    /* ── 2a. Try to get ward from the invite token in Firestore ── */
    if (inviteToken) {
      try {
        var db   = firebase.firestore();
        var snap = await db.collection('invites').doc(inviteToken).get();
        if (snap.exists) {
          var inviteData    = snap.data();
          var assignedWards = inviteData.assignedWards; // array or null

          if (assignedWards && assignedWards.length > 0) {
            /*
             * If the enumerator has multiple wards assigned we set the FIRST
             * as the primary for GPS checks. The full array is used for
             * monitor-side multi-ward validation.
             * For single-ward assignments this is straightforward.
             */
            var primaryWard = assignedWards[0];
            ECS_GEOFENCE.setAssignedWard(primaryWard);
            sessionStorage.setItem('ecs26_assigned_ward',       primaryWard);
            sessionStorage.setItem('ecs26_assigned_wards_json', JSON.stringify(assignedWards));
            _showWardBadge(assignedWards, 'invite token');
            console.info('[ECS-GEO] Ward(s) loaded from invite token:', assignedWards);
            return;
          } else {
            /* Token exists but has no ward restriction → unrestricted */
            ECS_GEOFENCE.setAssignedWard(null);
            _showWardBadge(null, 'unrestricted');
            console.info('[ECS-GEO] Invite token has no ward restriction — unrestricted access.');
            return;
          }
        }
      } catch (e) {
        console.warn('[ECS-GEO] Could not read invite token from Firestore:', e.message);
      }
    }

    /* ── 2b. Try Firestore enumerator_assignments collection (legacy) ── */
    if (uid) {
      try {
        var db2  = firebase.firestore();
        var snap2 = await db2.collection('enumerator_assignments').doc(uid).get();
        if (snap2.exists && snap2.data().ward) {
          var ward = snap2.data().ward;
          ECS_GEOFENCE.setAssignedWard(ward);
          sessionStorage.setItem('ecs26_assigned_ward', ward);
          _showWardBadge([ward], 'Firestore assignment');
          console.info('[ECS-GEO] Ward loaded from Firestore assignment:', ward);
          return;
        }
      } catch (e) {
        console.warn('[ECS-GEO] Firestore assignment lookup failed:', e.message);
      }
    }

    /* ── 2c. sessionStorage / localStorage fallback ── */
    var localWard = sessionStorage.getItem('ecs26_assigned_ward')
                 || localStorage.getItem('ecs26_assigned_ward');
    if (localWard) {
      ECS_GEOFENCE.setAssignedWard(localWard);
      _showWardBadge([localWard], 'cached');
      console.info('[ECS-GEO] Ward loaded from cache:', localWard);
    } else {
      ECS_GEOFENCE.setAssignedWard(null);
      _showWardBadge(null, null);
      console.warn('[ECS-GEO] No ward assignment found — unrestricted mode.');
    }
  };

  /* ── Helper: get all assigned wards as array ── */
  function getAllAssignedWards() {
    try {
      var json = sessionStorage.getItem('ecs26_assigned_wards_json');
      if (json) return JSON.parse(json);
    } catch (e) {}
    var single = ECS_GEOFENCE.getAssignedWard();
    return single ? [single] : null;
  }

  /* ── Expose for use in collectData() ── */
  window.ECS_GET_ASSIGNED_WARDS = getAllAssignedWards;

  /* ═══════════════════════════════════════════════════════════════════════
     3. WARD ASSIGNMENT BADGE IN SURVEY HEADER
     ═══════════════════════════════════════════════════════════════════════ */
  function _showWardBadge(wards, source) {
    var existing = document.getElementById('wardAssignBadge');
    if (existing) existing.remove();
    var pills = document.querySelector('.header-pills');
    if (!pills) return;
    var badge       = document.createElement('span');
    badge.id        = 'wardAssignBadge';
    badge.className = 'hpill';
    if (wards && wards.length) {
      badge.style.cssText = 'background:rgba(76,175,120,.25);border:1.5px solid rgba(76,175,120,.7);font-weight:700;';
      badge.innerHTML = '📍 Ward' + (wards.length > 1 ? 's' : '') + ': <strong>'
        + wards.join(', ') + '</strong>';
    } else {
      badge.style.cssText = 'background:rgba(200,150,62,.15);border:1.5px solid rgba(200,150,62,.5);color:#8a5a00;';
      badge.innerHTML = '🌐 Unrestricted access';
    }
    pills.appendChild(badge);
  }

  /* ═══════════════════════════════════════════════════════════════════════
     4. WARD WARNING BANNER (shown during GPS fix if outside assigned ward)
        This is a soft warning — enumerator can still submit.
        The flag is saved to the submission for monitor review.
     ═══════════════════════════════════════════════════════════════════════ */
  function _showWardWarningBanner(geoResult) {
    var existing = document.getElementById('wardWarnBanner');
    if (existing) existing.remove();
    if (!geoResult.wardWarning) return;

    var banner         = document.createElement('div');
    banner.id          = 'wardWarnBanner';
    banner.style.cssText = [
      'position:sticky', 'top:0', 'z-index:198',
      'background:#fff8ee', 'border-bottom:2px solid #c8963e',
      'padding:10px 20px', 'font-size:14px', 'color:#7a4f0a',
      'display:flex', 'align-items:center', 'gap:10px'
    ].join(';');

    var msg = '⚠️ ' + geoResult.message;
    banner.innerHTML = '<span style="font-size:18px;flex-shrink:0;">⚠️</span>'
      + '<span style="flex:1;">' + _esc(geoResult.message.replace('⚠️ ', '')) + '</span>'
      + '<button onclick="this.parentNode.remove()" style="background:none;border:none;'
      + 'cursor:pointer;font-size:18px;color:#7a4f0a;padding:4px 8px;'
      + 'min-width:44px;min-height:44px;display:flex;align-items:center;justify-content:center;">✕</button>';

    /* Insert after GPS bar or at top of body */
    var gpsBar = document.getElementById('gpsBar');
    if (gpsBar && gpsBar.parentNode) {
      gpsBar.parentNode.insertBefore(banner, gpsBar.nextSibling);
    } else {
      document.body.insertBefore(banner, document.body.firstChild);
    }
  }

  function _esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  /* ═══════════════════════════════════════════════════════════════════════
     5. PATCH confirmResearcher — load ward assignment after login
     ═══════════════════════════════════════════════════════════════════════ */
  var _origConfirmResearcher = window.confirmResearcher;
  window.confirmResearcher = function () {
    _origConfirmResearcher && _origConfirmResearcher.apply(this, arguments);
    var user  = firebase.auth().currentUser;
    var token = sessionStorage.getItem('ecs26_invite') || null;
    if (user) {
      window.loadWardAssignment(user.uid, token);
    }
  };

  /* ═══════════════════════════════════════════════════════════════════════
     6. PATCH openGpsGuard — inject geofence check after GPS fix
        SOFT MODE (default): ward mismatch = warning + allow submit
        STRICT MODE: ward mismatch = hard block
     ═══════════════════════════════════════════════════════════════════════ */
  function patchGpsGuard() {
    var _origOpenGpsGuard = window.openGpsGuard;
    if (!_origOpenGpsGuard) {
      setTimeout(patchGpsGuard, 300);
      return;
    }

    window.openGpsGuard = async function () {
      var result = await _origOpenGpsGuard();

      /* GPS itself failed — return as-is */
      if (!result || !result.ok) return result;

      /* GPS succeeded — run geofence check */
      var geoCheck = ECS_GEOFENCE.checkPosition(result.lat, result.lng);

      /* ── County check (always hard block) ── */
      if (!geoCheck.inCounty) {
        return {
          ok:      false,
          reason:  'outside_county',
          message: geoCheck.message,
          lat:     result.lat,
          lng:     result.lng
        };
      }

      /* ── Ward check ── */
      if (geoCheck.wardBlocked) {
        /* STRICT MODE: hard block */
        return {
          ok:           false,
          reason:       'wrong_ward',
          message:      geoCheck.message,
          detectedWard: geoCheck.detectedWard,
          assignedWard: geoCheck.assignedWard,
          lat:          result.lat,
          lng:          result.lng
        };
      }

      /* LENIENT MODE: soft warning — show banner, allow submission */
      if (geoCheck.wardWarning) {
        _showWardWarningBanner(geoCheck);
      }

      /*
       * Augment the GPS result with geofence data.
       * These fields will be picked up by collectData() and saved
       * to Firestore so the admin monitor can do GPS-based
       * ward violation detection — NOT based on respondent's ward.
       */
      return Object.assign({}, result, {
        inCounty:       geoCheck.inCounty,
        inWard:         geoCheck.inWard,
        wardWarning:    geoCheck.wardWarning,   // true = outside but allowed
        detectedWard:   geoCheck.detectedWard,  // GPS ward (NOT respondent ward)
        assignedWard:   geoCheck.assignedWard,
        distToAssigned: geoCheck.distToAssigned,
        geoMessage:     geoCheck.message
      });
    };

    console.info('[ECS-GEO-PATCH] openGpsGuard patched with geofence check.');
  }

  /* ═══════════════════════════════════════════════════════════════════════
     7. PATCH collectData — save GPS-detected ward fields to submission
        These fields are what the admin monitor uses for violation detection.
        _gpsDetectedWard = where the enumerator physically was (from GPS)
        _gpsAssignedWard = what they were assigned to (from invite token)
        _gpsWardWarning  = true if they were outside their ward but submitted
     ═══════════════════════════════════════════════════════════════════════ */
  function patchCollectData() {
    var _origCollectData = window.collectData;
    if (!_origCollectData) {
      setTimeout(patchCollectData, 300);
      return;
    }

    window.collectData = function () {
      var data = _origCollectData.apply(this, arguments);

      /* Read the last GPS fix from the global capturedGps object */
      var gps = window.capturedGps || null;

      if (gps && typeof ECS_GEOFENCE !== 'undefined') {
        var geoCheck = ECS_GEOFENCE.checkPosition(gps.lat, gps.lng);

        /*
         * CRITICAL FIELDS for admin monitor ward violation detection:
         *
         * _gpsDetectedWard: the ward the enumerator was physically standing in
         *                   (from GPS coordinates via point-in-polygon)
         *                   The monitor compares THIS to _gpsAssignedWard —
         *                   NOT d.ward (which is the respondent's home ward).
         *
         * _gpsAssignedWard: the ward they were supposed to be in
         *
         * _gpsWardWarning:  true if they were outside their assigned ward
         *                   but submitted anyway (lenient mode)
         *
         * _gpsAssignedWards: full array of assigned wards from invite token
         */
        data._gpsDetectedWard   = geoCheck.detectedWard   || null;
        data._gpsAssignedWard   = geoCheck.assignedWard   || null;
        data._gpsWardWarning    = geoCheck.wardWarning     || false;
        data._gpsInWard         = geoCheck.inWard          || false;
        data._gpsInCounty       = geoCheck.inCounty        || false;
        data._gpsDistToAssigned = geoCheck.distToAssigned  || null;
        data._gpsAssignedWards  = getAllAssignedWards()     || null;
      } else {
        /* GPS not available */
        data._gpsDetectedWard   = null;
        data._gpsAssignedWard   = ECS_GEOFENCE ? ECS_GEOFENCE.getAssignedWard() : null;
        data._gpsWardWarning    = false;
        data._gpsInWard         = null;
        data._gpsInCounty       = null;
        data._gpsDistToAssigned = null;
        data._gpsAssignedWards  = getAllAssignedWards() || null;
      }

      return data;
    };

    console.info('[ECS-GEO-PATCH] collectData patched — GPS ward fields will be saved.');
  }

  /* ═══════════════════════════════════════════════════════════════════════
     8. PATCH submit error messages for geofence reasons
     ═══════════════════════════════════════════════════════════════════════ */
  function patchSubmitErrors() {
    var form = document.getElementById('surveyForm');
    if (!form) { setTimeout(patchSubmitErrors, 400); return; }

    /*
     * The main submit handler already handles gpsResult.ok === false
     * and shows reasons['cancelled'], reasons['distance'], reasons['gps_error'].
     * We extend it by wrapping showStatus to catch our new reason codes
     * that flow through the same pathway.
     *
     * The actual error message is carried in gpsResult.message (set in
     * patchGpsGuard above), so the submit handler's generic error text
     * gets replaced by our detailed geofence message.
     */
    var _origSubmitListeners = form._ecs_submit_patched;
    if (_origSubmitListeners) return; // already patched
    form._ecs_submit_patched = true;

    form.addEventListener('submit', function geoSubmitPatch(e) {
      /* We intercept in CAPTURE phase (runs before main handler).
         We can't stop the main handler, but we extend the reason map
         by monkey-patching showStatus temporarily. */
      var _origShow = window.showStatus;
      window.showStatus = function (msg, type, dur) {
        /* The main handler builds error msgs from a reasons map.
           If it doesn't know 'outside_county' or 'wrong_ward',
           it falls through to a generic message.
           We detect that and replace with our geofence message. */
        _origShow && _origShow(msg, type, dur);
        window.showStatus = _origShow; // restore immediately
      };
    }, true /* capture */);

    console.info('[ECS-GEO-PATCH] Submit error messages patched.');
  }

  /* ═══════════════════════════════════════════════════════════════════════
     9. EXTEND the main submit handler's reasons map
        The cleanest approach: override the anonymous submit listener's
        fallback by extending the gpsResult reason descriptions BEFORE
        the handler reads them. We do this by patching after DOM ready.
     ═══════════════════════════════════════════════════════════════════════ */
  function extendSubmitReasons() {
    /*
     * The main HTML's submit listener has this pattern:
     *   const reasons = { cancelled:'...', distance:'...', gps_error:'...' };
     *   showStatus('❌ ' + (reasons[gpsResult.reason] || 'GPS check failed.'), 'error');
     *
     * Since gpsResult now carries a .message field from patchGpsGuard,
     * and the reason is 'outside_county' or 'wrong_ward' (not in reasons{}),
     * the handler would show 'GPS check failed.' as fallback.
     *
     * Fix: we override the form submit listener to use gpsResult.message
     * when available. We do this by wrapping openGpsGuard to attach
     * the message to window._lastGpsMessage, then patching showStatus
     * to use it when the generic fallback fires.
     */
    var _patched = window.openGpsGuard;
    window.openGpsGuard = async function () {
      var res = await _patched.apply(this, arguments);
      if (res && !res.ok && res.message) {
        window._lastGeoFenceMsg = res.message;
      } else {
        window._lastGeoFenceMsg = null;
      }
      return res;
    };

    /* Wrap showStatus to substitute geofence message when relevant */
    var _origShow2 = window.showStatus;
    window.showStatus = function (msg, type, dur) {
      if (window._lastGeoFenceMsg && msg && msg.includes('GPS check failed')) {
        msg = '❌ ' + window._lastGeoFenceMsg;
        window._lastGeoFenceMsg = null;
      }
      _origShow2 && _origShow2(msg, type, dur);
    };
  }

  /* ═══════════════════════════════════════════════════════════════════════
     10. SUPERVISOR CONSOLE TOOLS
     ═══════════════════════════════════════════════════════════════════════ */
  window.ECS_SET_WARD = function (wardName) {
    if (!ECS_GEOFENCE.hasWard(wardName)) {
      console.error('[ECS-GEO] Unknown ward:', wardName,
        '\nAvailable:', ECS_GEOFENCE.listWards().join(', '));
      return;
    }
    sessionStorage.setItem('ecs26_assigned_ward', wardName);
    sessionStorage.setItem('ecs26_assigned_wards_json', JSON.stringify([wardName]));
    ECS_GEOFENCE.setAssignedWard(wardName);
    console.info('[ECS-GEO] ✅ Ward manually set to:', wardName);
  };

  window.ECS_SET_STRICT = function (on) {
    ECS_GEOFENCE.setStrictMode(on !== false);
    console.info('[ECS-GEO] Strict mode:', ECS_GEOFENCE.getStrictMode() ? 'ON' : 'OFF');
  };

  window.ECS_CHECK_POS = function (lat, lng) {
    var r = ECS_GEOFENCE.checkPosition(lat, lng);
    console.table({
      'In County':       r.inCounty,
      'In Ward':         r.inWard,
      'Ward Warning':    r.wardWarning,
      'Ward Blocked':    r.wardBlocked,
      'Assigned Ward':   r.assignedWard,
      'Detected Ward':   r.detectedWard,
      'Nearest Ward':    r.nearestWard,
      'Dist to Assigned':r.distToAssigned ? r.distToAssigned + 'm' : 'N/A',
      'Message':         r.message
    });
    return r;
  };

  /* ═══════════════════════════════════════════════════════════════════════
     11. INITIALISE
     ═══════════════════════════════════════════════════════════════════════ */
  function init() {
    patchGpsGuard();
    patchCollectData();
    patchSubmitErrors();
    extendSubmitReasons();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  console.info('[ECS-GEO-PATCH] Geofence patch v2.0 loaded.');
  console.info('[ECS-GEO-PATCH] Console tools: ECS_SET_WARD(), ECS_SET_STRICT(), ECS_CHECK_POS()');

})();
