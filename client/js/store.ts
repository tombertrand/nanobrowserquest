import BigNumber from "bignumber.js";

import { Types } from "../../shared/js/gametypes";
import { copyToClipboard, raiToRaw } from "./utils";

interface StoreItem extends BackendStoreItem {
  id: number;
  icon: string;
  name: string;
  description: string;
  confirmedMessage: string;
  requiresInventorySlot: boolean;
}

interface BackendStoreItem {
  id: number;
  nano: number;
  ban: number;
  usd: number;
  usdRegular?: number;
  isAvailable: boolean;
}

class Store {
  depositAccount: null | string;
  storeItems: Partial<StoreItem>[];
  app: any;

  constructor(app) {
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
            As a thank you bonus you've also received 10 High class upgrade scrolls`.trim(),
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
        id: Types.Store.SCROLLUPGRADEBLESSED,
        icon: "scrollupgradeblessed",
        name: "Blessed High class upgrade scrolls",
        description: "Pack of 5 blessed scrolls giving a higher chance of successful upgrade (4-6%)",
        confirmedMessage: "5 Blessed High class upgrade scrolls were added to your inventory.",
        requiresInventorySlot: true,
      },
      // {
      //   id: Types.Store.SCROLLUPGRADEMEDIUM,
      //   icon: "scrollupgrademedium",
      //   name: "Medium class upgrade scrolls",
      //   description: "Pack of 10 scrolls",
      //   confirmedMessage: "10 Medium class upgrade scrolls were added to your inventory.",
      //   requiresInventorySlot: true,
      // },
      {
        id: Types.Store.CAPE,
        icon: "cape",
        name: "Cape",
        description: "A cape adds a random bonus (attack, defense or exp) when your character is in a party.",
        confirmedMessage: "A cape was added to your inventory.",
        requiresInventorySlot: true,
      },
    ];
  }

  openStore() {
    this.app.hideWindows();
    this.app.game.client.sendStoreItems();

    $("#store, #store-item-list").addClass("active");

    return;
  }

  addStoreItems(items: BackendStoreItem[]) {
    this.storeItems = this.storeItems.map(item => {
      const { nano, ban, usd, usdRegular, isAvailable } = items.find(({ id }) => item.id === id);

      item.nano = nano;
      item.ban = ban;
      item.usd = usd;
      item.usdRegular = usdRegular;
      item.isAvailable = isAvailable;

      return item;
    });

    this.storeItems.forEach(({ id, icon, name, description, nano, ban, usd, usdRegular, isAvailable }) => {
      const isLocked = id === Types.Store.EXPANSION1 && !this.app.game.player.expansion1;
      const isDisabled = !isAvailable || (id === Types.Store.EXPANSION1 && this.app.game.player.expansion1);
      const price = this.app.game.network === "nano" ? nano : ban;

      // ${id === Types.Store.EXPANSION1 ? ' <img src="img/common/50-off.png" width="50" height="31">' : ""}
      const item = $("<div/>", {
        class: `item-wrapper item-name-${icon}`,
        html: `
            <div class="item-icon">
              <div class="${icon} ${isLocked ? "locked" : "unlocked"}"></div>
            </div>
            <p class="name">${name}</p>
            ${description ? `<p class="description">${description}</p>` : ""}
            <p class="prices">
              ${this.app.getCurrencyPrefix()}${price}${this.app.getCurrencySuffix()}
              <span class="usd"> / $${usd.toFixed(2)}</span>
              ${usdRegular ? `<span class="usd line-through">$${usdRegular.toFixed(2)}</span>` : ""}
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
  }

  closeStore() {
    $("#store, #store-item-list, #store-item-purchase").removeClass("active");
    $("#store-item-list").empty();
  }

  selectStoreItemPurchase(id: number) {
    const self = this;

    $("#store-item-list").removeClass("active");
    $("#store-item-purchase").empty().addClass("active");

    const item = this.storeItems.find(({ id: itemId }) => id === itemId)!;
    const { icon, name, description, requiresInventorySlot } = item;
    const price = item[this.app.game.network];

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
            <p class="name">Send ${this.app.getCurrencyPrefix()}<b>${price}</b>${this.app.getCurrencySuffix()} to</p>
            <p class="nano-account">${self.depositAccount}</p>
            <br/>
            <p class="name"><img src="img/common/spinner2.gif"> Waiting for transaction</p>
            <br/>
            <p class="note note-high-resolution">* Make sure you send the exact amount to your deposit account</p>
          `,
      }).appendTo("#store-item-purchase");

      $("<div/>", {
        class: "item-wrapper waiting-for-transaction",
        html: `
          <p class="note note-high-resolution">Scan the QR code with Natrium.</p>
          <div id="qrcode"></div>
          <div class="or-line hide-on-mobile"><span>OR</span></div>
          <div id="store-account-button"></div>
          <div class="or-line hide-on-mobile"><span>OR</span></div>
          <p class="note note-high-resolution">Use 
            <a href="https://nault.cc/send?to=${self.depositAccount}&amount=${price}" target="_blank">Nault.cc</a> to send the amount
          </p>
          <p class="note note-high-resolution">* Not sure? <a href="https://www.youtube.com/watch?v=rvdOzv0pnSw" target="_blank">Watch a tutorial</a></p>
        `,
      }).appendTo("#store-item-purchase");

      let copyTimeout: any = undefined;
      $("<button/>", {
        class: "btn",
        text: "Copy to Clipboard",
        click: function () {
          copyToClipboard(self.depositAccount!);
          $(this).text("Copied!").addClass("disabled");
          clearTimeout(copyTimeout);
          copyTimeout = setTimeout(() => {
            $(this).text("Copy to Clipboard").removeClass("disabled");
          }, 3000);
        },
      }).appendTo("#store-account-button");

      const { network } = this.app.game;

      const text = `${network}:${this.depositAccount}?amount=${new BigNumber(raiToRaw(price, network)).toString(10)}`;

      $("#qrcode").qrcode({ width: 130, height: 130, text });
    } else {
    }
  }

  purchaseCompleted(payment: any) {
    const item = this.storeItems.find(({ id }) => payment.id === id)!;
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
            <a href="https://${this.app.game.explorer}.com/block/${payment.hash}" target="_blank">${payment.hash}</a>
          </p>
          <p class="description">${confirmedMessage}</p>
        `,
    }).appendTo("#store-item-purchase");
  }

  purchaseError(error: any) {
    const { message = "An error happened. Try again later or contact the game admin if it persists." } = error || {};

    $(".waiting-for-transaction").remove();
    $("<div/>", {
      class: "item-wrapper item-wrapper-large",
      html: `
          <p class="description">${message}</p>
        `,
    }).appendTo("#store-item-purchase");
  }
}

export default Store;
