// PubSub system for Royal Equips theme
window.theme = window.theme || {};

window.theme.PubSub = (function() {
  const events = {};

  return {
    subscribe: function(event, callback) {
      if (!events[event]) {
        events[event] = [];
      }
      events[event].push(callback);
      
      // Return unsubscribe function
      return function() {
        const index = events[event].indexOf(callback);
        if (index > -1) {
          events[event].splice(index, 1);
        }
      };
    },

    publish: function(event, data) {
      if (!events[event]) {
        return;
      }
      
      events[event].forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in PubSub callback:', error);
        }
      });
    },

    clear: function(event) {
      if (event) {
        events[event] = [];
      } else {
        for (let key in events) {
          events[key] = [];
        }
      }
    }
  };
})();

// Common events
window.theme.PubSub.EVENTS = {
  CART_UPDATED: 'cart:updated',
  PRODUCT_ADDED: 'product:added',
  VARIANT_CHANGED: 'variant:changed',
  MODAL_OPENED: 'modal:opened',
  MODAL_CLOSED: 'modal:closed',
  SECTION_LOADED: 'section:loaded',
  FILTER_APPLIED: 'filter:applied',
  SEARCH_PERFORMED: 'search:performed'
};