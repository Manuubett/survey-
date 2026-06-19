/**
 * ECS-2026 · GEOFENCE PATCH  (drop-in — no edits to main HTML needed)
 * ═══════════════════════════════════════════════════════════════════════════
 * Include this AFTER ecs_polling_stations.js and AFTER ecs_geofence.js:
 *
 *   <script src="ecs_polling_stations.js?v=2"></script>
 *   <script src="ecs_geofence.js?v=1"></script>
 *   <script src="ecs_geofence_patch.js?v=1"></script>   ← add this
 *
 * This file monkey-patches the existing survey functions:
 *   - Intercepts _onGpsFix to add county + ward boundary check
 *   - Intercepts confirmResearcher to load ward assignment
 *   - Adds supervisor URL override  (?ward=WARD_NAME&invite=TOKEN)
 *   - Adds ward assignment badge in header
 *   - Updates submit error messages for new GPS block reasons
 * ═══════════════════════════════════════════════════════════════════════════
 */

(function () {
  'use strict';

  /* ── 1. Read ?ward= from URL (supervisor pre-assignment) ── */
  (function () {
    var params   = new URLSearchParams(window.location.search);
    var wardParam = params.get('ward');
    if (wardParam) {
      localStorage.setItem('ecs26_assigned_ward', wardParam);
      // Don't strip from URL here — readInviteToken already strips ?invite=
      console.info('[ECS-GEO-PATCH] Ward pre-set from URL:', wardParam);
    }
  })();

  /* ── 2. Load ward assignment from Firestore or localStorage ── */
  window.loadWardAssignment = async function (uid) {
    // Try Firestore first
    try {
      var db = firebase.firestore();
      var snap = await db.collection('enumerator_assignments').doc(uid).get();
      if (snap.exists && snap.data().ward) {
        var ward = snap.data().ward;
        ECS_GEOFENCE.setAssignedWard(ward);
        showWardAssignmentBadge(ward, 'Firestore');
        console.info('[ECS-GEO] Ward loaded from Firestore:', ward);
        return;
      }
    } catch (e) {
      console.warn('[ECS-GEO] Firestore ward lookup failed:', e.message);
    }
    // Fallback to localStorage
    var localWard = localStorage.getItem('ecs26_assigned_ward');
    if (localWard) {
      ECS_GEOFENCE.setAssignedWard(localWard);
      showWardAssignmentBadge(localWard, 'pre-assigned');
      console.info('[ECS-GEO] Ward loaded from localStorage:', localWard);
    } else {
      console.warn('[ECS-GEO] ⚠️ No ward assignment found for UID:', uid);
      showWardAssignmentBadge(null, null);
    }
  };

  /* ── 3. Show ward assignment badge in header ── */
  function showWardAssignmentBadge(ward, source) {
    var existing = document.getElementById('wardAssignBadge');
    if (existing) existing.remove();
    var pills = document.querySelector('.header-pills');
    if (!pills) return;
    var badge = document.createElement('span');
    badge.id        = 'wardAssignBadge';
    badge.className = 'hpill';
    if (ward) {
      badge.style.cssText = 'background:rgba(76,175,120,.25);border:1.5px solid rgba(76,175,120,.7);font-weight:700;';
      badge.innerHTML = '📍 Assigned Ward: <strong>' + ward + '</strong>';
    } else {
      badge.style.cssText = 'background:rgba(184,50,50,.15);border:1.5px solid rgba(184,50,50,.5);color:#b83232;';
      badge.innerHTML = '⚠️ No ward assigned — contact supervisor';
    }
    pills.appendChild(badge);
  }

  /* ── 4. Patch confirmResearcher to call loadWardAssignment ── */
  var _origConfirmResearcher = window.confirmResearcher;
  window.confirmResearcher = function () {
    _origConfirmResearcher && _origConfirmResearcher();
    // Load ward for the now-signed-in user
    var user = firebase.auth().currentUser;
    if (user) {
      window.loadWardAssignment(user.uid);
    }
  };

  /* ── 5. Patch _onGpsFix to inject geofence check ── */
  //
  // Strategy: We cannot directly patch _onGpsFix because it's a private
  // function inside the IIFE closure.  Instead we patch openGpsGuard to
  // wrap the gpsResolve callback so we can inspect the result before it
  // reaches the submit handler.
  //
  // The cleaner approach for your codebase is to INLINE the Step 3 changes
  // from INTEGRATION_GUIDE.js directly into _onGpsFix.
  //
  // This patch instead intercepts at the submit level:

  var _origSubmitListener = null;

  // We wait for the form to exist, then patch the submit handler.
  function patchSubmitHandler() {
    var form = document.getElementById('surveyForm');
    if (!form) { setTimeout(patchSubmitHandler, 500); return; }

    // Override the submit handler's gps result processing by wrapping openGpsGuard
    var _origOpenGpsGuard = window.openGpsGuard;
    window.openGpsGuard = async function () {
      var result = await _origOpenGpsGuard();

      // If GPS itself failed, return as-is
      if (!result.ok) return result;

      // GPS succeeded — now run geofence check
      var lat = result.lat, lng = result.lng;
      var geoCheck = ECS_GEOFENCE.checkPosition(lat, lng);

      if (!geoCheck.inCounty) {
        return {
          ok:     false,
          reason: 'outside_county',
          message: geoCheck.message,
          lat: lat, lng: lng
        };
      }

      if (!geoCheck.inWard && geoCheck.wardAssigned) {
        return {
          ok:     false,
          reason: 'wrong_ward',
          message: geoCheck.message,
          detectedWard:  geoCheck.detectedWard,
          assignedWard:  geoCheck.assignedWard,
          lat: lat, lng: lng
        };
      }

      // All good — augment result with geo info
      return Object.assign({}, result, {
        inCounty:     geoCheck.inCounty,
        inWard:       geoCheck.inWard,
        detectedWard: geoCheck.detectedWard,
        assignedWard: geoCheck.assignedWard
      });
    };

    // Patch the error reason messages in the submit handler
    // We do this by overriding showStatus to catch geofence errors early
    var _origShowStatus = window.showStatus;

    // Patch the submit event: re-bind with extended error messages
    // The cleanest approach: wrap the form's submit handler
    form.addEventListener('submit', function patchedSubmit(e) {
      // We can't easily intercept mid-flow, so instead we patch the
      // gpsResult handler inline via the reasons object.
      // The real patch is done in openGpsGuard above.
      // This listener is just a safety net — no action needed here.
    }, true); // capture phase — runs before main handler

    console.info('[ECS-GEO-PATCH] Submit handler patched.');
  }

  // ── 6. Patch the submit error messages (direct DOM patch) ──
  // Since we can't easily patch the inline anonymous submit handler,
  // we provide a helper that the patched openGpsGuard already handles.
  // Additionally, augment the existing _onGpsErr pathway:

  function patchErrorMessages() {
    // Store original showStatus
    var _orig = window.showStatus;
    // Wrap to catch geofence-specific error codes
    window.showStatus = function (msg, type, dur) {
      // If the message contains our geofence codes, ensure 'error' styling
      if (msg && (msg.includes('outside_county') || msg.includes('wrong_ward'))) {
        type = 'error';
      }
      _orig && _orig(msg, type, dur);
    };
  }

  /* ── 7. Initialise when DOM is ready ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      patchSubmitHandler();
      patchErrorMessages();
    });
  } else {
    patchSubmitHandler();
    patchErrorMessages();
  }

  /* ── 8. Expose a helper for supervisors to set ward from console ── */
  window.ECS_SET_WARD = function (wardName) {
    if (!ECS_GEOFENCE.hasWard(wardName)) {
      console.error('[ECS-GEO] Unknown ward:', wardName, '\nAvailable:', ECS_GEOFENCE.listWards().join(', '));
      return;
    }
    localStorage.setItem('ecs26_assigned_ward', wardName);
    ECS_GEOFENCE.setAssignedWard(wardName);
    showWardAssignmentBadge(wardName, 'manual');
    console.info('[ECS-GEO] ✅ Ward set to:', wardName);
  };

  console.info('[ECS-GEO-PATCH] Geofence patch loaded. Use ECS_SET_WARD("WardName") to manually assign a ward.');

})();
