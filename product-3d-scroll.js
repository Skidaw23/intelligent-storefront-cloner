// Scroll-driven 3D image sequence player
// This script binds to elements rendered by the product-3d-scroll.liquid section.
// It loads image sequences lazily and updates frames based on scroll position.

(() => {
  /**
   * Detects WebP support.  Returns a Promise that resolves to true if the
   * browser can display WebP images.
   */
  function supportsWebP() {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => {
        const result = image.width > 0 && image.height > 0;
        resolve(result);
      };
      image.onerror = () => resolve(false);
      // A tiny WebP image
      image.src =
        "data:image/webp;base64,UklGRiIAAABXRUJQVlA4TCEAAAAvAAAAAAfQ//73v/+BiOh/AAA=";
    });
  }

  /**
   * Throttles a function using requestAnimationFrame.  Ensures that the handler
   * is invoked at most once per frame.
   */
  function rafThrottle(fn) {
    let raf = null;
    return (...args) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        fn(...args);
        raf = null;
      });
    };
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const useWebP = await supportsWebP();
    const ext = useWebP ? "webp" : "jpg";

    const containers = document.querySelectorAll(
      ".product-3d-scroll-wrapper .scroll-frames"
    );
    containers.forEach((container) => {
      const frameCount = parseInt(container.dataset.frameCount, 10);
      const baseUrl = container.dataset.baseUrl;
      const sectionId = container.dataset.sectionId;
      const enableTouch =
        typeof window[`product3dTouch${sectionId}`] !== "undefined";
      const img = container.querySelector("img");
      const frames = new Array(frameCount);
      let currentFrame = 0;

      /**
       * Preloads the specified frame index.  Converts the local index to the
       * actual file name based on extension and naming convention.
       */
      function preloadFrame(index) {
        if (index < 0 || index >= frameCount) return;
        if (frames[index]) return;
        const url = `${baseUrl}frame${index + 1}.${ext}`;
        const image = new Image();
        image.src = url;
        // assign directly to frames array to avoid caching the Image object
        frames[index] = url;
      }

      // Preload the first few frames for quick interaction
      for (let i = 0; i < Math.min(4, frameCount); i++) {
        preloadFrame(i);
      }
      img.src = frames[0];

      // Cache wrapper metrics
      const wrapper = container.closest(".product-3d-scroll-wrapper");

      function updateFrame() {
        const wrapperTop = wrapper.offsetTop;
        const wrapperHeight = wrapper.offsetHeight;
        const viewportHeight = window.innerHeight;
        const scrollY = window.scrollY;
        const relative =
          (scrollY - wrapperTop) / (wrapperHeight - viewportHeight);
        const progress = Math.min(1, Math.max(0, relative));
        const index = Math.max(
          0,
          Math.min(frameCount - 1, Math.floor(progress * frameCount))
        );
        if (index !== currentFrame) {
          // Preload current and next frame for smoother animation
          preloadFrame(index);
          preloadFrame(index + 1);
          img.src = frames[index] || `${baseUrl}frame${index + 1}.${ext}`;
          currentFrame = index;
        }
      }

      // Throttle scroll handler
      const handleScroll = rafThrottle(updateFrame);
      window.addEventListener("scroll", handleScroll, { passive: true });
      window.addEventListener("resize", handleScroll);

      // Touch drag rotation
      if (enableTouch) {
        let dragging = false;
        let lastX = 0;
        const sensitivity = 5; // pixels per frame

        const startDrag = (e) => {
          dragging = true;
          lastX = e.touches ? e.touches[0].clientX : e.clientX;
        };
        const moveDrag = (e) => {
          if (!dragging) return;
          const x = e.touches ? e.touches[0].clientX : e.clientX;
          const dx = x - lastX;
          lastX = x;
          const delta = Math.round(dx / sensitivity);
          if (delta !== 0) {
            currentFrame = (currentFrame - delta) % frameCount;
            if (currentFrame < 0) currentFrame += frameCount;
            preloadFrame(currentFrame);
            img.src =
              frames[currentFrame] ||
              `${baseUrl}frame${currentFrame + 1}.${ext}`;
          }
        };
        const endDrag = () => {
          dragging = false;
        };

        container.addEventListener("mousedown", (e) => {
          e.preventDefault();
          startDrag(e);
        });
        container.addEventListener("mousemove", moveDrag);
        container.addEventListener("mouseup", endDrag);
        container.addEventListener("mouseleave", endDrag);
        container.addEventListener("touchstart", (e) => {
          e.preventDefault();
          startDrag(e);
        });
        container.addEventListener("touchmove", moveDrag, { passive: false });
        container.addEventListener("touchend", endDrag);
      }
    });
  });
})();