define(function () {
  var Store = Class.extend({
    init: function (app) {
      this.app = app;
      this.expansion1 = 0;
      this.depositAccount = null;

      this.storeItems = [
        {
          id: 1,
          icon: "expansion1",
          name: "Freezing Lands Expansion",
          description: "Continue the adventure, waypoints will be unlocked. Requires lv.20 to enter.",
          confirmedMessage: "The Freezing Lands Expansion has been unlocked.",
          requiresInventorySlot: false,
          xno: 0.00001,
          usd: 5,
        },
        {
          id: 2,
          icon: "scrollupgradehigh",
          name: "High class upgrade scrolls",
          description: "Pack of 10 scrolls",
          confirmedMessage: "10 High class upgrade scrolls were added to your inventory.",
          requiresInventorySlot: true,
          xno: 0.00002,
          usd: 1.0,
        },
        {
          id: 3,
          icon: "cape",
          name: "Cape",
          description:
            "A cape adds a random bonus to your character. When upgraded to +7 the cape adds 2 bonuses, +8 adds 3 bonuses, etc.",
          confirmedMessage: "A cape was added to your inventory.",
          requiresInventorySlot: true,
          xno: 0.00003,
          usd: 1.25,
        },
      ];
    },

    openStore: function () {
      return;
      this.app.hideWindows();

      $("#store, #store-item-list").addClass("active");

      this.storeItems.forEach(({ id, icon, name, description, xno, usd }) => {
        const item = $("<div/>", {
          class: "item-wrapper",
          html: `
            <div class="item-icon">
              <div class="${icon} locked"></div>
            </div>
            <p class="name">${name}</p>
            ${description ? `<p class="description">${description}</p>` : ""}
            <p class="prices">
              <span class="xno">Ӿ${xno}</span> /
              <span>$${usd.toFixed(2)}</span>
            </p>
            `,
        });

        const isDisabled = id === 1 && this.expansion1;

        item.append(
          $("<button/>", {
            class: `btn ${isDisabled ? "disabled" : ""}`,
            text: isDisabled ? "Purchased" : "Purchase",
            click: () => {
              if (isDisabled) return;
              this.selectStoreItemPurchase(id);
            },
          }),
        );

        item.appendTo("#store-item-list");
      });
    },

    closeStore: function () {
      $("#store, #store-item-list, #store-item-purchase").removeClass("active");
      $("#store-item-list").empty();
    },

    selectStoreItemPurchase: function (id) {
      const self = this;

      $("#store-item-list").removeClass("active");
      $("#store-item-purchase").empty().addClass("active");

      const item = this.storeItems.find(({ id: itemId }) => id === itemId);
      const { icon, name, description, xno, requiresInventorySlot } = item;

      this.app.game.client.sendStoreRegisterPurchase(id, this.depositAccount);

      $("<div/>", {
        class: "item-wrapper",
        html: `
            <div class="item-icon">
              <div class="${icon} locked"></div>
            </div>
            <p class="name">${name}</p>
            ${description ? `<p class="description">${description}</p>` : ""}
          `,
      }).appendTo("#store-item-purchase");

      if (requiresInventorySlot && this.app.game.player.inventory.length >= 24) {
        $("<div/>", {
          class: "item-wrapper item-wrapper-large",
          html: `
            <p class="description">Your inventory is full, delete an item before going through with the transaction.</p>
          `,
        }).appendTo("#store-item-purchase");
      } else if (this.depositAccount) {
        $("<div/>", {
          class: "item-wrapper waiting-for-transaction",
          html: `
            <p class="description">Send <b><span class="xno">Ӿ</span>${xno}</b></p>
            <p class="note note-high-resolution">* By scanning the QR code with Natrium, the amount will be auto-added. If you use another wallet make sure you send the exact amount.</p>
            <p class="note note-low-resolution">* Make sure you send the exact amount.</p>
            <br/>
            <p class="name"><img src="img/common/spinner2.gif"> Waiting for transaction</p>
          `,
        }).appendTo("#store-item-purchase");

        $("<div/>", {
          class: "item-wrapper waiting-for-transaction",
          html: `
          <div id="qrcode"></div>
          <p class="nano-account">${this.depositAccount}</p>
          <div id="store-account-button"></div>
        `,
        }).appendTo("#store-item-purchase");

        const copyTimeout = null;
        $("<button/>", {
          class: "btn",
          text: "Copy to Clipboard",
          click: function () {
            copyToClipboard(self.depositAccount);
            $(this).text("Copied!").addClass("disabled");
            clearTimeout(copyTimeout);
            copyTimeout = setTimeout(() => {
              $(this).text("Copy to Clipboard").removeClass("disabled");
            }, 3000);
          },
        }).appendTo("#store-account-button");

        const text = `nano:${this.depositAccount}?amount=${new BigNumber(raiToRaw(xno)).toString(10)}`;

        $("#qrcode").qrcode({ width: 130, height: 130, text });
      } else {
        $("<div/>", {
          class: "item-wrapper item-wrapper-large",
          html: `
            <p class="description">An error happened. Try again later or contact the game admin if it persists.</p>
          `,
        }).appendTo("#store-item-purchase");
      }
    },

    selectStoreItemPurchaseConfirmed: function (id) {
      const item = this.storeItems.find(({ id: itemId }) => id === itemId);

      const { confirmedMessage } = item;

      $(".waiting-for-transaction").remove();
      $("<div/>", {
        class: "item-wrapper item-wrapper-large",
        html: `
          <p class="name">Transaction confirmed!</p>
          <p class="description">${confirmedMessage}</p>
        `,
      }).appendTo("#store-item-purchase");
    },
  });

  return Store;
});
