define(["../../shared/js/gametypes"], function () {
  var Store = Class.extend({
    init: function (app) {
      this.app = app;
      this.depositAccount = null;

      this.storeItems = [
        {
          id: Types.Store.EXPANSION1,
          icon: "expansion1",
          name: "Freezing Lands Expansion",
          description: "Continue the adventure, waypoints will be unlocked.",
          confirmedMessage: `The Freezing Lands Expansion has been unlocked.<br/>
            You can now access the expansion using the waypoint.<br/>
            As a thank you bonus you've also received 5 High class upgrade scrolls`.trim(),
          requiresInventorySlot: true,
        },
        {
          id: Types.Store.SCROLLUPGRADEBLESSED,
          icon: "scrollupgradeblessed",
          name: "Blessed High class upgrade scrolls",
          description: "Pack of 5 blessed scrolls giving a higher chance of successful upgrade (4-6%)",
          confirmedMessage: "5 Blessed High class upgrade scrolls were added to your inventory.",
          requiresInventorySlot: true,
        },
        {
          id: Types.Store.SCROLLUPGRADEHIGH,
          icon: "scrollupgradehigh",
          name: "High class upgrade scrolls",
          description: "Pack of 10 scrolls",
          confirmedMessage: "10 High class upgrade scrolls were added to your inventory.",
          requiresInventorySlot: true,
        },
        {
          id: Types.Store.SCROLLUPGRADEMEDIUM,
          icon: "scrollupgrademedium",
          name: "Medium class upgrade scrolls",
          description: "Pack of 10 scrolls",
          confirmedMessage: "10 Medium class upgrade scrolls were added to your inventory.",
          requiresInventorySlot: true,
        },
        // {
        //   id: Types.Store.CAPE,
        //   icon: "cape",
        //   name: "Cape",
        //   description:
        //     "A cape adds a random bonus to your character. When upgraded to +7 the cape adds 2 bonuses, +8 adds 3 bonuses, etc.",
        //   confirmedMessage: "A cape was added to your inventory.",
        //   requiresInventorySlot: true,
        // },
      ];
    },

    openStore: function () {
      this.app.hideWindows();
      this.app.game.client.sendStoreItems();

      $("#store, #store-item-list").addClass("active");

      return;
    },

    addStoreItems: function (items) {
      this.storeItems = this.storeItems.map(item => {
        const { xno, usd, isAvailable } = items.find(({ id }) => item.id === id);

        item.xno = xno;
        item.usd = usd;
        item.isAvailable = isAvailable;

        return item;
      });

      this.storeItems.forEach(({ id, icon, name, description, xno, usd, isAvailable }) => {
        const isLocked = id === Types.Store.EXPANSION1 && !this.app.game.player.expansion1;
        const isDisabled = !isAvailable || (id === Types.Store.EXPANSION1 && this.app.game.player.expansion1);

        const item = $("<div/>", {
          class: `item-wrapper item-name-${icon}`,
          html: `
            <div class="item-icon">
              <div class="${icon} ${isLocked ? "locked" : "unlocked"}"></div>
            </div>
            <p class="name">${name}</p>
            ${description ? `<p class="description">${description}</p>` : ""}
            <p class="prices">
              <span class="xno">Ӿ${xno}</span>
              <span class="usd"> / $${usd.toFixed(2)}</span>
            </p>
            `,
        });

        item.append(
          $("<button/>", {
            class: `btn ${isDisabled ? "disabled" : ""}`,
            text: isAvailable ? (isDisabled ? "Purchased" : "Purchase") : "Available soon",
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

      this.app.game.client.sendPurchaseCreate(id, this.depositAccount);

      $(".close")
        .off(".purchase-cancel")
        .on("click.purchase-cancel", () => {
          this.app.game.client.sendPurchaseCancel(this.depositAccount);
          $(".close").off(".purchase-cancel");
        });

      $("<div/>", {
        class: "item-wrapper purchased-item",
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
      }
    },

    purchaseCompleted: function (payment) {
      const item = this.storeItems.find(({ id }) => payment.id === id);
      const { id, icon, name, description, confirmedMessage } = item;
      const isLocked = id !== Types.Store.EXPANSION1;

      this.app.game.tryUnlockingAchievement("XNO");

      $("#store-item-purchase").empty();
      $("<div/>", {
        class: "item-wrapper item-wrapper-full",
        html: `
          <p class="title">Transaction confirmed!</p>
          <div class="item-icon">
              <div class="${icon} ${isLocked ? "locked" : "unlocked"}"></div>
          </div>
          <p class="name">${name}</p>
          ${description ? `<p class="description">${description}</p>` : ""}
          <p class="description overflow-text">
            <a href="https://nanolooker.com/block/${payment.hash}" target="_blank">${payment.hash}</a>
          </p>
          <p class="description">${confirmedMessage}</p>
        `,
      }).appendTo("#store-item-purchase");
    },

    purchaseError: function (error) {
      const { message = "An error happened. Try again later or contact the game admin if it persists." } = error || {};

      $(".waiting-for-transaction").remove();
      $("<div/>", {
        class: "item-wrapper item-wrapper-large",
        html: `
          <p class="description">${message}</p>
        `,
      }).appendTo("#store-item-purchase");
    },
  });

  return Store;
});
