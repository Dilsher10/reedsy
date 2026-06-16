(function () {
  'use strict';

  var reedsy = window.Reedsy = window.Reedsy || {};
  reedsy.trackingManager = reedsy.trackingManager || {
    trackSignup: function () {}
  };

  window.ReedsyAnalyticsManager = window.ReedsyAnalyticsManager || function () {
    return {
      track: function () {},
      page: function () {}
    };
  };

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
      return;
    }
    callback();
  }

  function setHidden(element, hidden) {
    if (!element) return;
    element.classList.toggle('hidden', hidden);
  }

  function loadLazyMedia(root) {
    var scope = root || document;

    scope.querySelectorAll('[data-src]').forEach(function (element) {
      if (!element.getAttribute('src')) {
        element.setAttribute('src', element.getAttribute('data-src'));
      }
    });

    scope.querySelectorAll('[data-srcset]').forEach(function (element) {
      if (!element.getAttribute('srcset')) {
        element.setAttribute('srcset', element.getAttribute('data-srcset'));
      }
    });

    scope.querySelectorAll('video').forEach(function (video) {
      var changed = false;

      if (video.dataset.poster && !video.getAttribute('poster')) {
        video.setAttribute('poster', video.dataset.poster);
      }

      video.querySelectorAll('source[data-src]').forEach(function (source) {
        if (!source.getAttribute('src')) {
          source.setAttribute('src', source.getAttribute('data-src'));
          changed = true;
        }
      });

      if (changed) video.load();
      if (video.autoplay) {
        video.play().catch(function () {});
      }
    });
  }

  function normalizeLinks() {
    document.querySelectorAll('a[href^="/"]').forEach(function (link) {
      link.href = 'https://reedsy.com' + link.getAttribute('href');
    });

    document.querySelectorAll('form[action^="/"]').forEach(function (form) {
      form.dataset.remoteAction = 'https://reedsy.com' + form.getAttribute('action');
    });
  }

  function initModals() {
    function openModal(id) {
      var modal = document.getElementById(id);
      if (!modal) return;
      modal.classList.add('visible', 'pop-in');
      modal.style.display = 'flex';
      modal.style.opacity = '1';
      document.body.classList.add('overflow-hidden');
      loadLazyMedia(modal);
      var firstInput = modal.querySelector('input:not([type="hidden"]), button, a');
      if (firstInput) firstInput.focus({ preventScroll: true });
    }

    function closeModal(modal) {
      if (!modal) return;
      modal.classList.remove('visible', 'pop-in');
      modal.style.display = '';
      modal.style.opacity = '';
      document.body.classList.remove('overflow-hidden');
    }

    window.showSignupModal = function () {
      openModal('signup-modal');
    };

    window.setTimeout(function () {
      openModal('exit-modal');
    }, 10000);

    document.querySelectorAll('[data-modal-trigger]').forEach(function (trigger) {
      trigger.addEventListener('click', function (event) {
        event.preventDefault();
        openModal(trigger.getAttribute('data-modal-trigger'));
      });
    });

    document.querySelectorAll('[data-modal-close], .modal-overlay').forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        closeModal(trigger.closest('.modal'));
      });
    });

    document.querySelectorAll('.reedsy-modal--close, .reedsy-modal--overlay').forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        var modal = trigger.closest('.reedsy-modal');
        closeModal(modal);
      });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      document.querySelectorAll('.modal.visible, .reedsy-modal.visible').forEach(function (modal) {
        modal.classList.remove('visible', 'pop-in');
      });
      document.body.classList.remove('overflow-hidden');
    });
  }

  function initMobileNav() {
    var nav = document.querySelector('.nav-mobile');
    if (!nav) return;

    var clonedLinks = nav.querySelector('.cloned-nav-links');
    var sourceLinks = document.querySelector('.nav-top .nav-links');
    if (clonedLinks && sourceLinks && !clonedLinks.children.length) {
      sourceLinks.querySelectorAll(':scope > .nav-link').forEach(function (link) {
        var clone = document.createElement('div');
        clone.className = 'nav-link';

        var sourceAnchor = link.querySelector(':scope > a');
        var label = document.createElement('p');
        label.className = 'nav-link-text';
        label.textContent = sourceAnchor ? sourceAnchor.textContent.trim() : 'Menu';
        clone.appendChild(label);

        var inner = document.createElement('div');
        inner.className = 'nav-link-inner';
        link.querySelectorAll('.nav-cell').forEach(function (cell) {
          inner.appendChild(cell.cloneNode(true));
        });

        if (!inner.children.length && sourceAnchor) {
          inner.appendChild(sourceAnchor.cloneNode(true));
        }

        clone.appendChild(inner);
        clonedLinks.appendChild(clone);
      });
    }

    document.querySelectorAll('.nav-trigger').forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        nav.classList.add('active');
        document.body.classList.add('overflow-hidden');
      });
    });

    nav.querySelectorAll('.nav-close').forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        nav.classList.remove('active');
        document.body.classList.remove('overflow-hidden');
      });
    });

    nav.addEventListener('click', function (event) {
      if (event.target === nav) {
        nav.classList.remove('active');
        document.body.classList.remove('overflow-hidden');
      }
    });

    nav.querySelectorAll('.nav-link-text').forEach(function (label) {
      label.addEventListener('click', function () {
        label.closest('.nav-link').classList.toggle('active');
      });
    });
  }

  function initTabs() {
    document.querySelectorAll('.tabs-manager').forEach(function (manager) {
      var tabs = manager.querySelectorAll('.tab');
      var navItems = manager.querySelectorAll('.tab-nav[data-tab]');
      if (!tabs.length || !navItems.length) return;

      function activate(tabId) {
        tabs.forEach(function (tab) {
          tab.classList.toggle('active', tab.id === tabId);
        });
        navItems.forEach(function (item) {
          item.classList.toggle('active', item.dataset.tab === tabId);
        });
      }

      navItems.forEach(function (item) {
        item.addEventListener('click', function () {
          activate(item.dataset.tab);
          item.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        });
      });

      activate(navItems[0].dataset.tab);
    });
  }

  function initSignupForms() {
    document.querySelectorAll('[data-swap-container]').forEach(function (form) {
      var emailRow = form.querySelector('.urf-email');
      var socialRow = form.querySelector('.urf-social');
      var fakeSubmit = form.querySelector('.urf-submit [data-swap-trigger]');
      var realSubmit = form.querySelector('.urf-submit input[type="submit"]');
      var back = emailRow ? emailRow.querySelector('[data-swap-trigger]') : null;
      var startsWithEmail = form.classList.contains('urf-show-email') || (emailRow && !emailRow.classList.contains('hidden'));

      function showEmail(show) {
        setHidden(emailRow, !show);
        setHidden(socialRow, show);
        setHidden(fakeSubmit, show);
        setHidden(realSubmit, !show);
        if (emailRow && show) {
          var input = emailRow.querySelector('input[type="email"]');
          if (input) input.focus();
        }
      }

      if (fakeSubmit) {
        fakeSubmit.addEventListener('click', function (event) {
          event.preventDefault();
          showEmail(true);
        });
      }

      if (back) {
        back.addEventListener('click', function (event) {
          event.preventDefault();
          showEmail(false);
        });
      }

      form.addEventListener('submit', function (event) {
        var email = form.querySelector('input[type="email"]');
        if (email && !email.checkValidity()) return;

        if (form.dataset.remoteAction) {
          event.preventDefault();
          showFormMessage(form, 'Thanks, your email is ready. Continue on Reedsy to finish signing up.');
        }
      });

      showEmail(Boolean(startsWithEmail));
    });
  }

  function showFormMessage(form, message) {
    var existing = form.querySelector('.form-message');
    if (!existing) {
      existing = document.createElement('p');
      existing.className = 'form-message small fgColor-success mt-sm';
      form.appendChild(existing);
    }
    existing.textContent = message;
  }

  function initTypeOnText() {
    var wrapper = document.querySelector('[data-type-on-text]');
    if (!wrapper) return;

    var display = wrapper.querySelector('[data-text-display]');
    var items = Array.prototype.slice.call(wrapper.querySelectorAll('[data-text]'));
    var imageRoot = document.querySelector('[data-type-on-text-images]');
    var index = 0;
    var timeoutId;

    if (!display || !items.length) return;

    function setActiveImage(item) {
      if (!imageRoot) return;
      imageRoot.querySelectorAll('img').forEach(function (image) {
        image.classList.toggle('active', image.id === item.dataset.image);
      });
    }

    function typeWord(word, position, done) {
      display.textContent = word.slice(0, position);

      if (position < word.length) {
        timeoutId = setTimeout(function () {
          typeWord(word, position + 1, done);
        }, 95);
        return;
      }

      timeoutId = setTimeout(done, 1200);
    }

    function eraseWord(word, position, done) {
      display.textContent = word.slice(0, position);

      if (position > 0) {
        timeoutId = setTimeout(function () {
          eraseWord(word, position - 1, done);
        }, 55);
        return;
      }

      timeoutId = setTimeout(done, 180);
    }

    function play() {
      var item = items[index % items.length];
      var word = item.dataset.text || '';

      setActiveImage(item);
      typeWord(word, 0, function () {
        eraseWord(word, word.length, function () {
          index += 1;
          play();
        });
      });
    }

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      display.textContent = items[0].dataset.text || '';
      setActiveImage(items[0]);
      return;
    }

    window.addEventListener('beforeunload', function () {
      clearTimeout(timeoutId);
    });

    play();
  }

  function initReviews() {
    document.querySelectorAll('[data-toggle-target-id]').forEach(function (button) {
      button.addEventListener('click', function () {
        var target = document.getElementById(button.dataset.toggleTargetId);
        if (!target) return;
        target.classList.toggle('active');
        button.textContent = target.classList.contains('active') ? 'Read less' : 'Read more';
      });
    });
  }

  function initShowcase() {
    document.querySelectorAll('.showcase-shortcode').forEach(function (showcase) {
      var container = showcase.querySelector('.scroll-container');
      var track = showcase.querySelector('.showcase-grid');
      if (!container || !track) return;

      container.classList.add('showcase-slider');

      if (!container.querySelector('.showcase-nav-prev')) {
        var prevButton = document.createElement('button');
        prevButton.className = 'showcase-nav-btn showcase-nav-prev';
        prevButton.type = 'button';
        prevButton.setAttribute('aria-label', 'Previous showcase card');
        prevButton.innerHTML = '<span aria-hidden="true">&lsaquo;</span>';
        container.appendChild(prevButton);
      }

      if (!container.querySelector('.showcase-nav-next')) {
        var nextButton = document.createElement('button');
        nextButton.className = 'showcase-nav-btn showcase-nav-next';
        nextButton.type = 'button';
        nextButton.setAttribute('aria-label', 'Next showcase card');
        nextButton.innerHTML = '<span aria-hidden="true">&rsaquo;</span>';
        container.appendChild(nextButton);
      }

      var slides = track.querySelectorAll('.showcase-slide');
      if (!slides.length) return;
      var prev = container.querySelector('.showcase-nav-prev');
      var next = container.querySelector('.showcase-nav-next');
      var isDragging = false;
      var dragStartX = 0;
      var dragStartScroll = 0;

      function getSlideStep() {
        if (slides.length < 2) return slides[0].offsetWidth || 320;
        return slides[1].offsetLeft - slides[0].offsetLeft;
      }

      function getActiveIndex() {
        var center = track.scrollLeft + track.clientWidth / 2;
        var activeIndex = 0;
        var activeDistance = Infinity;

        slides.forEach(function (slide, index) {
          var slideCenter = slide.offsetLeft + slide.offsetWidth / 2;
          var distance = Math.abs(center - slideCenter);

          if (distance < activeDistance) {
            activeDistance = distance;
            activeIndex = index;
          }
        });

        return activeIndex;
      }

      function updateState() {
        var activeIndex = getActiveIndex();

        slides.forEach(function (slide, index) {
          slide.classList.toggle('active', index === activeIndex);
        });

        prev.disabled = track.scrollLeft <= 4;
        next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      }

      function scrollToIndex(index) {
        var target = slides[Math.max(0, Math.min(index, slides.length - 1))];
        if (!target) return;

        track.scrollTo({
          left: target.offsetLeft - (track.clientWidth - target.offsetWidth) / 2,
          behavior: 'smooth'
        });
      }

      prev.addEventListener('click', function () {
        scrollToIndex(getActiveIndex() - 1);
      });

      next.addEventListener('click', function () {
        scrollToIndex(getActiveIndex() + 1);
      });

      track.addEventListener('mouseover', function (event) {
        var slide = event.target.closest('.showcase-slide');
        if (!slide || !track.contains(slide)) return;
        slides.forEach(function (item) {
          item.classList.toggle('active', item === slide);
        });
      });

      track.addEventListener('scroll', function () {
        window.requestAnimationFrame(updateState);
      }, { passive: true });

      track.addEventListener('pointerdown', function (event) {
        isDragging = true;
        dragStartX = event.clientX;
        dragStartScroll = track.scrollLeft;
        track.classList.add('is-dragging');
        track.setPointerCapture(event.pointerId);
      });

      track.addEventListener('pointermove', function (event) {
        if (!isDragging) return;
        event.preventDefault();
        track.scrollLeft = dragStartScroll - (event.clientX - dragStartX);
      });

      function stopDragging(event) {
        if (!isDragging) return;
        isDragging = false;
        track.classList.remove('is-dragging');
        if (event && track.hasPointerCapture(event.pointerId)) {
          track.releasePointerCapture(event.pointerId);
        }
        scrollToIndex(getActiveIndex());
      }

      track.addEventListener('pointerup', stopDragging);
      track.addEventListener('pointercancel', stopDragging);
      track.addEventListener('mouseleave', stopDragging);

      track.addEventListener('keydown', function (event) {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          scrollToIndex(getActiveIndex() - 1);
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          scrollToIndex(getActiveIndex() + 1);
        }
      });

      track.setAttribute('tabindex', '0');
      track.style.scrollBehavior = 'smooth';
      updateState();

      window.addEventListener('resize', function () {
        scrollToIndex(getActiveIndex());
        updateState();
      });
    });
  }

  ready(function () {
    normalizeLinks();
    loadLazyMedia();
    initModals();
    initMobileNav();
    initTabs();
    initSignupForms();
    initTypeOnText();
    initReviews();
    initShowcase();
  });
})();
