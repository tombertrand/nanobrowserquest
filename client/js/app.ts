import * as _ from "lodash";

import { Types } from "../../shared/js/gametypes";
import { calculateLowerResistances } from "../../shared/js/types/resistance";
import { isValidAccountAddress, toString } from "../../shared/js/utils";
import storage from "./storage";
import Store from "./store";
import { TRANSITIONEND } from "./utils";

const networkDividerMap = {
  nano: 100000,
  ban: 10000,
};

class App {
  currentPage: number;
  blinkInterval: any;
  achievementTimeout: any;
  isParchmentReady: boolean;
  ready: boolean;
  storage: any;
  store: Store;
  watchNameInputInterval: NodeJS.Timer;
  frontPage: string;
  game: any;
  isMobile: any;
  isTablet: any;
  isDesktop: boolean;
  supportsWorkers: boolean;
  $play: JQuery<HTMLElement> | null;
  $loginNameInput: JQuery<HTMLElement> | null;
  $loginAccountInput: JQuery<HTMLElement> | null;
  $loginPasswordInput: JQuery<HTMLElement> | null;
  $createPasswordInput: JQuery<HTMLElement> | null;
  $createPasswordConfirmInput: JQuery<HTMLElement> | null;
  loginFormFields: any[];
  $nameInput: JQuery<HTMLElement> | null;
  $accountInput: JQuery<HTMLElement> | null;
  createNewCharacterFormFields: any[];
  getPlayButton: () => any;
  getUsernameField: () => any;
  getAccountField: () => any;
  getPasswordField: () => any;
  getPasswordConfirmField: () => any;
  starting: any;
  config: any;
  messageTimer: any;
  playButtonRestoreText: string;
  partyBlinkInterval: NodeJS.Timer;

  constructor() {
    this.currentPage = 1;
    this.blinkInterval = null;
    this.achievementTimeout = null;
    this.isParchmentReady = true;
    this.ready = false;
    this.storage = storage;
    this.store = new Store(this);
    this.getUsernameField = () => {};
    this.getPlayButton = () => {};
    this.getAccountField = () => {};
    this.getPasswordField = () => {};
    this.getPasswordConfirmField = () => {};
    this.isDesktop = true;
    this.supportsWorkers = false;
    this.$play = null;
    this.$loginNameInput = null;
    this.$loginAccountInput = null;
    this.$loginPasswordInput = null;
    this.$createPasswordInput = null;
    this.$createPasswordConfirmInput = null;
    this.$nameInput = null;
    this.$accountInput = null;
    this.loginFormFields = [];
    this.createNewCharacterFormFields = [];
    this.watchNameInputInterval = setInterval(this.toggleButton.bind(this), 100);
    this.playButtonRestoreText = "";
    this.partyBlinkInterval = null;

    const { name: playerName, account } = this.storage?.data?.player || {};

    if (playerName) {
      this.frontPage = "loadcharacter";

      $("#loginnameinput").val(playerName);
      if (account) {
        $("#loginaccountinput").val(account);
      }
    } else {
      this.frontPage = "createcharacter";
    }

    document.getElementById("parchment")!.className = this.frontPage;

    this.initFormFields();
  }

  setGame(game) {
    this.game = game;
    this.isMobile = this.game.renderer.mobile;
    this.isTablet = this.game.renderer.tablet;
    this.isDesktop = !(this.isMobile || this.isTablet);
    this.supportsWorkers = !!window.Worker;
    this.ready = true;
  }

  initContextMenu() {
    $.contextMenu({
      selector: "#canvas",
      animation: { duration: 25, show: "fadeIn", hide: "fadeOut" },
      build: _event => {
        const { x, y } = this.game.getMouseGridPosition();
        const player = this.game.getPlayerAt(x, y);
        const isInParty = !!player?.partyId;

        return player && player.id !== this.game.player.id
          ? {
              callback: function () {},
              items: {
                player: {
                  name: player.name,
                  disabled: true,
                },
                trade: {
                  name: `Trade`,
                  callback: () => {
                    this.game.say(`/trade ${player.name}`);
                  },
                },
                party: {
                  name: isInParty ? `In a party` : `Party `,
                  callback: () => {
                    if (!this.game.player.partyId) {
                      this.game.say(`/party create`);
                    }
                    this.game.say(`/party invite ${player.name}`);
                  },
                  disabled: isInParty,
                },
                equipment: {
                  name: `View equipment`,
                  callback: () => {
                    $("#otherplayer-name").html(`Equipment of <var>${player.name}</var>`);
                    this.openOtherPlayerEquipment(player);
                  },
                },
              },
            }
          : null;
      },
    });
  }

  initFormFields() {
    // Play button
    this.$play = $(".play");
    this.getPlayButton = function () {
      const activeForm = this.getActiveForm();
      return activeForm ? activeForm.find(".play span, .play.button div") : null;
    };
    this.setPlayButtonState(true);

    // Login form fields
    this.$loginNameInput = $("#loginnameinput");
    this.$loginAccountInput = $("#loginaccountinput");
    this.$loginPasswordInput = $("#loginpasswordinput");
    this.$createPasswordInput = $("#createpasswordinput");
    this.$createPasswordConfirmInput = $("#createpasswordconfirminput");
    this.loginFormFields = [
      this.$loginNameInput,
      this.$loginAccountInput,
      this.$loginPasswordInput,
      this.$createPasswordInput,
      this.$createPasswordConfirmInput,
    ];

    // Create new character form fields
    this.$nameInput = $("#nameinput");
    this.$accountInput = $("#accountinput");
    this.createNewCharacterFormFields = [this.$nameInput, this.$accountInput, this.$createPasswordInput];

    // Functions to return the proper username / account fields to use, depending on which form
    // (login or create new character) is currently active.
    this.getUsernameField = () => {
      if (this.$nameInput.is(":visible")) {
        return this.$nameInput;
      }

      if (this.$loginNameInput.is(":visible")) {
        return this.$loginNameInput;
      }

      if (this.$nameInput.val()) {
        return this.$nameInput;
      }

      return this.$loginNameInput;
    };
    this.getAccountField = () => {
      if (this.$accountInput.val()) {
        return this.$accountInput;
      }
      if (this.$loginAccountInput.val()) {
        return this.$loginAccountInput;
      }

      return this.$accountInput;
    };
    this.getPasswordField = () => {
      if (this.$loginPasswordInput.is(":visible")) {
        return this.$loginPasswordInput;
      }
      if (this.$createPasswordInput.is(":visible")) {
        return this.$createPasswordInput;
      }
      return undefined;
    };
    this.getPasswordConfirmField = () => {
      return this.$createPasswordConfirmInput;
    };

    $("#have-account").on("click", () => {
      $("#accountinput").addClass("visible");
      $("#have-account").removeClass("visible");
    });

    this.setFocus();
  }

  center() {
    window.scrollTo(0, 1);
  }

  canStartGame() {
    if (this.isDesktop) {
      return this.game && this.game.map && this.game.map.isLoaded;
    } else {
      return this.game;
    }
  }

  tryStartingGame() {
    if (this.starting) return; // Already loading

    var self = this;
    var action = this.$nameInput.val() ? "create" : "login";
    var username = this.getUsernameField().val();
    var account = this.getAccountField().val();
    var password = this.getPasswordField() ? this.getPasswordField().val() : undefined;
    var passwordConfirm = this.getPasswordConfirmField().is(":visible")
      ? this.getPasswordConfirmField().val()
      : undefined;
    var [network] = account?.split("_") || [];
    if (!network) {
      network = "nano";
      if (window.location.hostname === "bananobrowserquest.com") {
        network = "ban";
      }
    }

    if (!this.validateFormFields({ username, account, password, passwordConfirm })) return;

    this.setPlayButtonState(false);

    if (!this.ready || !this.canStartGame()) {
      var watchCanStart = setInterval(function () {
        console.debug("waiting...");
        if (self.canStartGame()) {
          clearInterval(watchCanStart);
          self.startGame(action, username, account, network, password);
        }
      }, 100);
    } else {
      this.startGame(action, username, account, network, password);
    }
  }

  startGame(action, username, account, network, password) {
    var self = this;
    if (username && !this.game.started) {
      this.game.setPlayerAccount({ username, account, network, password });

      let config = { host: "localhost", port: 8000 };
      if (process.env.NODE_ENV !== "development") {
        config = { host: "", port: 8000 };

        if (window.location.host.endsWith("bananobrowserquest.com")) {
          config.host = window.location.host.replace("ba", "");
        }
      }

      this.game.setServerOptions(config.host, config.port);

      if (!self.isDesktop) {
        // On mobile and tablet we load the map after the player has clicked
        // on the login/create button instead of loading it in a web worker.
        // See initGame in main.js.
        self.game.loadMap();
      }

      this.center();

      this.game.connect(action, function (result) {
        if (result.reason) {
          switch (result.reason) {
            case "invalidlogin":
              // Login information was not correct (either username or password)
              self.addValidationError(null, "The username or address you entered is incorrect.");
              self.getUsernameField().focus();
              self.setPlayButtonState(true);
              break;
            case "userexists":
              // Attempted to create a new user, but the username was taken
              self.addValidationError(self.getUsernameField(), "The username you entered is not available.");
              self.setPlayButtonState(true);
              break;
            case "invalidusername":
              // The username contains characters that are not allowed (rejected by the sanitizer)
              self.addValidationError(self.getUsernameField(), "The username you entered contains invalid characters.");
              self.setPlayButtonState(true);
              break;
            case "loggedin":
              // Attempted to log in with the same user multiple times simultaneously
              self.addValidationError(
                self.getUsernameField(),
                "A player with the specified username is already logged in.",
              );
              self.setPlayButtonState(true);
              break;
            case "banned-cheating-1":
            case "banned-cheating-365":
            case "banned-misbehaved-1":
            case "banned-misbehaved-365":
              $("." + result.reason).show();
              self.toggleScrollContent("banned");
              break;
            case "invalidconnection":
              self.animateParchment("loadcharacter", "invalidconnection");
              break;
            case "passwordcreate":
              self.animateParchment("createcharacter", "createpassword");
              break;
            case "passwordlogin":
              self.animateParchment("loadcharacter", "enterpassword");
              break;
            case "passwordinvalid":
              self.addValidationError(null, "The password is incorrect.");
              self.setPlayButtonState(true);
              break;
            default:
              self.addValidationError(
                null,
                "Failed to launch the game: " + (result.reason ? result.reason : "(reason unknown)"),
              );
              self.setPlayButtonState(true);
              break;
          }
        }
      });
    }
  }

  start() {
    this.hideIntro();
    $("body").addClass("started");

    // Cleanup the login form events
    $(document).off(".loginform");

    this.initDialog();
    this.initContextMenu();
  }

  initDialog() {
    const self = this;
    $("#dialog-delete-item").dialog({
      dialogClass: "no-close",
      autoOpen: false,
      draggable: false,
      title: "Delete item",
      buttons: [
        {
          text: "Cancel",
          class: "btn btn-default",
          click: function () {
            self.game.slotToDelete = null;
            $(this).dialog("close");
          },
        },
        {
          text: "Ok",
          class: "btn",
          click: function () {
            self.game.deleteItemFromSlot();
            $(this).dialog("close");
          },
        },
      ],
    });
    $("#dialog-delete-item").text("Are you sure you want to delete this item?");

    $("#dialog-merchant-item").dialog({
      dialogClass: "no-close",
      autoOpen: false,
      draggable: false,
      title: "Sell item to merchant",
      buttons: [
        {
          text: "Cancel",
          class: "btn btn-default",
          click: function () {
            self.game.confirmedSoldItemToMerchant = null;
            $(this).dialog("close");
          },
        },
        {
          text: "Ok",
          class: "btn",
          click: function () {
            const { fromSlot, toSlot, transferedQuantity, confirmed } = self.game.confirmedSoldItemToMerchant;
            self.game.dropItem(fromSlot, toSlot, transferedQuantity, confirmed);
            self.game.confirmedSoldItemToMerchant = null;
            $(this).dialog("close");
          },
        },
      ],
    });
    $("#dialog-merchant-item").text("Are you sure you want to sell this item to the merchant?");
    $(".ui-dialog-buttonset").find(".ui-button").removeClass("ui-button ui-corner-all ui-widget");
  }

  setPlayButtonState(enabled) {
    var $playButton = this.getPlayButton();
    if (!$playButton) return;

    if ($playButton.find(".link").text() !== "Loading...") {
      this.playButtonRestoreText = $playButton.find(".link").text();
    }

    if (enabled) {
      this.starting = false;
      this.$play!.removeClass("loading");
      $playButton.off("click").on("click", () => {
        this.tryStartingGame();
      });
      if (!$playButton.hasClass("button")) {
        $playButton.find(".link").text(this.playButtonRestoreText);
      }
    } else {
      // Loading state
      this.starting = true;
      this.$play!.addClass("loading");
      $playButton.unbind("click");

      if (!$playButton.hasClass("button")) {
        $playButton.find(".link").text("Loading...");
      }
    }
  }

  updatePartyMembers(members: { id: number; name: string }[]) {
    const partyHtml = members
      .map(({ id, name }) => {
        const isPartyLeader = this.game.player.partyLeader?.name === name;
        const isSelf = this.game.player.name === name;

        return `<div>
      <div class="player-name ${isSelf ? "self" : ""}">
        ${isPartyLeader ? "<span class='party-leader'>[P]</span>" : ""}${name}
      </div>
      <div class="player-health-bar-container">
        <div id="player-health-${id}" class="player-health"></div>
        <div class="player-health-bar"></div>
      </div>
    </div>`;
      })
      .join("");

    $("#party-player-list").empty().html(partyHtml);
  }

  updatePartyHealthBar(member: { id: number; hp: number; mHp: number }) {
    const { id, hp, mHp } = member;

    $(`#player-health-${id}`).css("width", `${Math.floor((hp * 100) / mHp)}%`);
  }

  removePartyHealthBar() {
    $("#party-player-list").empty();
  }

  getActiveForm() {
    if (this.loginFormActive()) return $("#loadcharacter");
    else if (this.createNewCharacterFormActive()) return $("#createcharacter");
    else if (this.createPasswordFormActive()) return $("#createpassword");
    else if (this.enterPasswordFormActive()) return $("#enterpassword");
    else return null;
  }

  loginFormActive() {
    return $("#parchment").hasClass("loadcharacter");
  }

  createNewCharacterFormActive() {
    return $("#parchment").hasClass("createcharacter");
  }

  createPasswordFormActive() {
    return $("#parchment").hasClass("createpassword");
  }

  enterPasswordFormActive() {
    return $("#parchment").hasClass("enterpassword");
  }

  /**
   * Performs some basic validation on the login / create new character forms (required fields are filled
   * out, account match looks valid). Assumes either the login or the create new character form
   * is currently active.
   */
  validateFormFields({ username, account, password, passwordConfirm }) {
    this.clearValidationErrors();

    if (!username) {
      this.addValidationError(this.getUsernameField(), "Enter a character name.");
      return false;
    }

    if (account && !isValidAccountAddress(account)) {
      this.addValidationError(
        this.getAccountField(),
        `Enter a valid address starting with "nano_" or leave the field empty.`,
      );
      return false;
    }

    if (typeof password === "string" && (password.length < 4 || password.length > 24)) {
      this.addValidationError(this.getPasswordField(), "Password must be between 4 and 24 characters.");
      return false;
    } else if (typeof passwordConfirm === "string" && (passwordConfirm.length < 4 || passwordConfirm.length > 24)) {
      this.addValidationError(this.getPasswordConfirmField(), "Password confirm must be between 4 and 24 characters.");
      return false;
    } else if (typeof password === "string" && typeof passwordConfirm === "string" && password !== passwordConfirm) {
      this.addValidationError(this.getPasswordConfirmField(), "Password confirm must be the same as the password.");
      return false;
    }

    return true;
  }

  addValidationError(field, errorText) {
    const validationSummary = $(".validation-summary:visible");

    $("<span/>", {
      class: "validation-error blink",
      text: errorText,
    }).appendTo(validationSummary);

    if (field) {
      if (!this.game.started) {
        field.addClass("field-error").select();
      }
      field.on("keypress.validation", () => {
        field.removeClass("field-error").off(".validation");
        $(".validation-error").remove();
      });
    }
  }

  clearValidationErrors() {
    var fields = this.loginFormActive() ? this.loginFormFields : this.createNewCharacterFormFields;
    $.each(fields, function (i, field) {
      field.removeClass("field-error");
    });
    $(".validation-error").remove();
  }

  setMouseCoordinates(event) {
    var gamePos = $("#container").offset();
    var scale = this.game.renderer.getScaleFactor();
    var width = this.game.renderer.getWidth();
    var height = this.game.renderer.getHeight();
    var mouse = this.game.mouse;

    if (!gamePos) return;

    mouse.x = event.pageX - gamePos.left - (this.isMobile ? 0 : 5 * scale);
    mouse.y = event.pageY - gamePos.top - (this.isMobile ? 0 : 7 * scale);

    if (mouse.x <= 0) {
      mouse.x = 0;
    } else if (mouse.x >= width) {
      mouse.x = width - 1;
    }

    if (mouse.y <= 0) {
      mouse.y = 0;
    } else if (mouse.y >= height) {
      mouse.y = height - 1;
    }
  }

  //Init the hud that makes it show what creature you are mousing over and attacking
  initTargetHud() {
    var self = this;
    // var healthMaxWidth = $("#inspector .health")!.width() - 12 * scale;
    // var timeout;

    this.game.player?.onSetTarget(function (target, name) {
      if (
        target.id === self.game.player.id ||
        target.kind === Types.Entities.TREE ||
        target.kind === Types.Entities.GATEWAYFX ||
        target.kind === Types.Entities.GATE
      ) {
        return;
      }

      const inspector = $("#inspector");

      const isPlayer = target.kind === Types.Entities.WARRIOR;

      const alias = isPlayer
        ? target.name
        : Types.getAliasFromName(Types.getKindAsString(target.kind)) || target.name || name;

      inspector.find(".name").toggleClass("mob", !isPlayer).text(`${alias}`);
      inspector.find(".name").toggleClass("is-boss", Types.isBoss(target.kind));
      inspector.find(".health").toggleClass("is-mini-boss", Types.isMiniBoss(target));
      inspector.find(".resistances").empty();

      //Show how much Health creature has left. Currently does nost work. The reason health doesn't currently go down has to do with the lines below down to initExpBar...
      if (target.hitPoints) {
        inspector.find(".health").css("width", Math.round((target.hitPoints / target.maxHitPoints) * 100) + "%");
      } else {
        inspector.find(".health").css("width", "0%");
      }

      let htmlEnchants = [];
      if (target?.enchants) {
        target?.enchants.map((enchant: Enchant) => {
          const display = Types.enchantToDisplayMap[enchant];
          htmlEnchants.push(`<span class="${enchant}">${display}</span>`);
        });
      }
      const level = !isPlayer ? Types.getMobLevel(target.kind) : target.level;
      if (level) {
        htmlEnchants.push(`<span class="">lv.${level}</span>`);
      }

      inspector.find(".enchants").html(htmlEnchants.join("<span>&bull;</span>"));

      let htmlResistances = [];
      if (target?.resistances) {
        Object.entries(calculateLowerResistances(target.resistances, self.game.player.bonus)).map(
          ([type, percentage]: any) => {
            if (!percentage) return;

            const display = Types.resistanceToDisplayMap[type];

            // percentage -=
            //   self.game.player.bonus[`lower${_.capitalize(display)}Resistance`] +
            //   self.game.player.bonus.lowerAllResistance;

            // if (percentage <= 0) return;

            const prefix = percentage === 100 ? "Immuned to" : "Resistance to";

            htmlResistances.push(
              `<span class="${display}">${prefix} ${_.capitalize(display)} ${
                percentage !== 100 ? `${percentage}%` : ""
              }</span>`,
            );
          },
        );
      }
      inspector.find(".resistances").html(htmlResistances.join("<span>&bull;</span>"));

      inspector.fadeIn("fast");
    });

    self.game.onUpdateTarget(function (target) {
      // Only update the inspector if target is the current inspected target
      if (self.game.player.inspecting?.id !== target.id) {
        return;
      }

      $("#inspector .health").css("width", Math.round((target.hitPoints / target.maxHitPoints) * 100) + "%");

      self.game.player.skillTargetId = null;
    });
  }

  initExpBar() {
    var self = this;
    var maxHeight = $("#expbar").height() || 0;

    this.game.onPlayerExpChange(function (expInThisLevel, expForLevelUp) {
      var barHeight = Math.round((maxHeight / expForLevelUp) * (expInThisLevel > 0 ? expInThisLevel : 0));
      $("#expbar").css("height", barHeight + "px");
    });

    $("#expbar").mouseover(function () {
      if (!self.game.player) return;
      var expInThisLevel = self.game.player.experience - Types.expForLevel[self.game.player.level - 1];
      var expForLevelUp = Types.expForLevel[self.game.player.level] - Types.expForLevel[self.game.player.level - 1];
      var expPercentThisLevel = (100 * expInThisLevel) / expForLevelUp;
      var expPercentAsString = `${expPercentThisLevel * 100}`;

      let message = `You are level ${self.game.player.level}.`;
      if (!isNaN(expForLevelUp)) {
        message += ` ${parseInt(expPercentAsString, 10) / 100} % of this level done.`;
      }

      self.game.showNotification(message);
    });
  }

  initHealthBar() {
    var scale = this.game.renderer.getScaleFactor();
    var healthMaxWidth = $("#healthbar").width()! - 12 * scale;

    this.game.onPlayerHealthChange(function (hp, maxHitPoints) {
      var barWidth = Math.round((healthMaxWidth / maxHitPoints) * (hp > 0 ? hp : 0));
      $("#hitpoints").css("width", barWidth + "px");
    });

    this.game.onPlayerHurt(this.blinkHealthBar.bind(this));
  }

  initPlayerInfo() {
    const self = this;
    const { account, network } = this.game;
    const { name } = this.game.player;

    $("#player-username").text(name);
    $("#completedbutton").addClass(network);

    const input = $("#player-account-input");
    const confirmBtn = $("#player-account-confirm");
    const linkBtn = $("#player-account-link");

    if (account) {
      linkBtn.show();
      confirmBtn.hide();
      input.val(account).attr("readonly", "readonly");
      linkBtn.off(".open").on("click.open", () => {
        window.open(`https://${this.game.explorer}.com/account/${account}`, "_blank");
      });
    } else {
      confirmBtn.attr("disabled", "disabled").addClass("disabled btn-default");
      linkBtn.hide();
      input.off(".validate").on("input.validate", () => {
        const value = input.val() as string;
        const isValid = isValidAccountAddress(value);

        input.removeClass("field-error");
        $(".validation-error").remove();

        if (!isValid) {
          confirmBtn.attr("disabled", "disabled").addClass("disabled btn-default");
          self.addValidationError($("#player-account-input"), `Enter a valid address starting with "nano_"`);
        } else {
          confirmBtn.removeAttr("disabled").removeClass("disabled btn-default");
        }
      });

      confirmBtn.off(".confirm").on("click.confirm", function (e) {
        e.preventDefault();
        const value = input.val() as string;

        if (!isValidAccountAddress(value)) {
          self.addValidationError($("#player-account-input"), `Enter a valid address starting with "nano_"`);
        } else {
          self.game.client.sendAccount(value);
        }
      });
    }
  }

  blinkHealthBar() {
    var $hitpoints = $("#hitpoints");

    $hitpoints.addClass("white");
    setTimeout(function () {
      $hitpoints.removeClass("white");
    }, 500);
  }

  toggleButton() {
    var name = $("#parchment input").val() as string;
    var $play = $("#createcharacter .play");

    if (name?.length > 0) {
      $play.removeClass("disabled");
      $("#character").removeClass("disabled");
    } else {
      $play.addClass("disabled");
      $("#character").addClass("disabled");
    }
  }

  hideIntro() {
    clearInterval(this.watchNameInputInterval);
    $("body").removeClass("intro");
    setTimeout(function () {
      $("body").addClass("game");
    }, 500);
  }

  scrollChatToBottom() {
    const chatBox = document.getElementById("text-list");
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  showChat() {
    if (!this.game.started) return;

    $("#chatbutton").addClass("active").removeClass("blink");
    $("#text-window").show();

    this.scrollChatToBottom();
    $("#chatinput").trigger("focus");
  }

  hideChat() {
    if (!this.game.started) return;

    $("#chatinput").trigger("blur");
    $("#chatbutton").removeClass("active");
    $("#text-window").hide();
  }

  toggleInstructions() {
    $("#instructions").toggleClass("active");
  }

  toggleAchievements() {
    this.hideWindows();
    this.resetAchievementPage();
    $("#achievements").toggleClass("active");
  }

  toggleCompleted() {
    $("#completed").toggleClass("active");
  }

  toggleAbout() {
    if ($("body").hasClass("about")) {
      this.closeInGameScroll("about");
    } else {
      this.toggleScrollContent("about");
    }
  }

  toggleSettings() {
    const isActive = $("#settings").hasClass("active");
    this.hideWindows();
    $("#settings").toggleClass("active", !isActive);

    const input = $("#player-account-input");
    const inputIsReadonly = !!input.attr("readonly");

    if (!isActive) {
      if (!inputIsReadonly) {
        input.val("").removeClass("field-error");
        $(".validation-error").remove();
      }
    }
  }

  toggleParty() {
    const isActive = $("#party").hasClass("active");
    this.hideWindows();
    $("#party").toggleClass("active", !isActive);

    if (!isActive) {
      clearInterval(this.partyBlinkInterval);
      $("#party-button").removeClass("blink");
      this.updatePartyPanel();
    }
  }

  updatePartyPanel() {
    const filteredPlayers = this.game.worldPlayers.filter(({ name }) => name !== this.game.player.name);

    let partyPlayers = [];
    let otherPlayers = [];
    let partyPlayersHtml = "";
    let otherPlayersHtml = "";

    const { partyId, partyLeader } = this.game.player;
    const isPartyLeader = partyId ? partyLeader?.name === this.game.player.name : false;

    if (partyId) {
      filteredPlayers.map(player => {
        if (player.partyId === partyId) {
          partyPlayers.push(player);
        } else {
          otherPlayers.push(player);
        }
      });
    } else {
      otherPlayers = filteredPlayers;
    }

    partyPlayersHtml += '<div class="party-header">Your party</div>';

    if (this.game.partyInvites.length) {
      this.game.partyInvites.forEach(({ name, partyId: joinPartyId }) => {
        partyPlayersHtml += `
        <div class="row">
          <div class="player-name">
            ${name} invites you
          </div>
          <div>
            <button class="btn small" data-party-refuse="${joinPartyId}">Refuse</button>
            <button class="btn small" data-party-join="${joinPartyId}">Join</button>
          </div>
        </div>
      `;
      });
    } else if (partyPlayers.length) {
      partyPlayers.forEach(({ name, level, hash, network }) => {
        partyPlayersHtml += `
        <div class="row">
          <div class="player-name party">
            ${
              partyLeader.name === name ? "<span class='party-leader'>[P]</span>" : ""
            } ${name} <span class="payout-icon ${network} ${hash ? "completed" : ""}"></span> lv.${level}
          </div>
          ${isPartyLeader ? `<button class="btn small" data-party-remove="${name}">Remove</button>` : ""}
        </div>
      `;
      });
    } else {
      partyPlayersHtml += `<div class="party-empty">${
        partyId
          ? "No players in your party"
          : `You are not in a party<br/><br/><button class="btn small" data-party-create="">Create party</button>`
      }</div>`;
    }

    if (partyId) {
      partyPlayersHtml += `
      <div class="row row-around">
        <button class="btn small" data-party-leave="">Leave</button>
        ${
          isPartyLeader && partyPlayers.length ? `<button class="btn small" data-party-disband="">Disband</button>` : ""
        }
      </div>
      `;
    }

    otherPlayersHtml += '<div class="party-header">World players</div>';

    if (otherPlayers.length) {
      otherPlayers.forEach(({ name, level, hash, partyId: isInParty, network }) => {
        const isInviteSent = this.game.partyInvitees.includes(name);
        otherPlayersHtml += `
        <div class="row ${partyId ? "" : "row-around"}">
          <div class="player-name">
            ${name} <span class="payout-icon ${network} ${hash ? "completed" : ""}"></span> lv.${level}
          </div>
          ${partyId && isInParty ? `<div>In a party</div>` : ""}
          ${
            !isInParty && isPartyLeader
              ? `<button class="btn small ${isInviteSent ? "disabled" : ""}" data-party-invite="${name}" ${
                  isInviteSent ? "disabled" : ""
                }">Invite${isInviteSent ? " sent" : ""}</button>`
              : ""
          }
        </div>
      `;
      });
    } else {
      otherPlayersHtml += `<div class="party-empty">No other player online</div>`;
    }

    $("#party-players").html(partyPlayersHtml);
    $("#other-players").html(otherPlayersHtml);

    if (!partyId) {
      $("#party-players [data-party-create]")
        .off("click")
        .on("click", e => {
          $(e.currentTarget).addClass("disabled").attr("disabled", "disabled");
          this.game.client.sendPartyCreate();
        });

      $("#party-players [data-party-join]")
        .off("click")
        .on("click", e => {
          $(e.currentTarget).addClass("disabled").attr("disabled", "disabled");
          const joinPartyId = $(e.currentTarget).data("party-join");
          this.game.client.sendPartyJoin(joinPartyId);
        });

      $("#party-players [data-party-refuse]")
        .off("click")
        .on("click", e => {
          $(e.currentTarget).addClass("disabled").attr("disabled", "disabled");
          const refusePartyId = $(e.currentTarget).data("party-refuse");
          this.game.client.sendPartyRefuse(refusePartyId);
        });
    } else {
      $("#party-players [data-party-leave]")
        .off("click")
        .on("click", e => {
          $(e.currentTarget).addClass("disabled").attr("disabled", "disabled");
          this.game.client.sendPartyLeave();
        });
    }

    if (isPartyLeader) {
      $("#other-players [data-party-invite]")
        .off("click")
        .on("click", e => {
          $(e.currentTarget).addClass("disabled").attr("disabled", "disabled").text("Invite sent");
          const playerName = $(e.currentTarget).data("party-invite");
          this.game.client.sendPartyInvite(playerName);
          this.game.partyInvitees.push(playerName);
        });

      $("#party-players [data-party-remove]")
        .off("click")
        .on("click", e => {
          $(e.currentTarget).addClass("disabled").attr("disabled", "disabled");
          const playerName = $(e.currentTarget).data("party-remove");
          this.game.client.sendPartyRemove(playerName);
        });

      $("#party-players [data-party-disband]")
        .off("click")
        .on("click", e => {
          $(e.currentTarget).addClass("disabled").attr("disabled", "disabled");
          this.game.client.sendPartyDisband();
        });
    }
  }

  resetAchievementPage() {
    var self = this;
    var $achievements = $("#achievements");

    if ($achievements.hasClass("active")) {
      $achievements.bind(TRANSITIONEND, function () {
        $achievements.removeClass("page" + self.currentPage).addClass("page1");
        self.currentPage = 1;
        $achievements.unbind(TRANSITIONEND);
      });
    }

    this.game.initAchievements();
  }

  updatePopulationList() {
    $("#player-list").empty();
    if (Array.isArray(this.game.worldPlayers)) {
      this.game.worldPlayers.forEach(({ name, level, hash, network }) => {
        let className = "";
        if (name === this.game.storage.data.player.name) {
          className = "active";
        } else if (this.game.player.partyMembers?.find(({ name: playerName }) => playerName === name)) {
          className = "party";
        }

        $("<div/>", {
          class: className,
          html: `
            <span>${name}</span>
            <span class="payout-icon ${network} ${hash ? "completed" : ""}" title="${
            hash
              ? `Killed the Skeleton King and received a ${network} payout`
              : `Did not complete the game to receive a ${network} payout`
          }"></span>
            <span>lv.${level}</span>
          `,
        }).appendTo("#player-list");
      });
    }
  }

  initEquipmentIcons() {
    var scale = this.game.renderer.getScaleFactor();
    var getIconPath = function (spriteName) {
      return "img/" + scale + "/item-" + spriteName + ".png";
    };
    var weapon = this.game.player.getWeaponName();
    var weaponLevel = this.game.player.getWeaponLevel();
    var weaponBonus = this.game.player.getWeaponBonus();
    var weaponSocket = this.game.player.getWeaponSocket();

    var armor = this.game.player.getArmorName();
    var armorLevel = this.game.player.getArmorLevel();
    var armorBonus = this.game.player.getArmorBonus();
    var armorSocket = this.game.player.getArmorSocket();
    var weaponPath = getIconPath(weapon);
    var armorPath = getIconPath(armor);

    $("#weapon")
      .css("background-image", 'url("' + weaponPath + '")')
      .attr("data-item", weapon)
      .attr("data-level", weaponLevel)
      .attr("data-bonus", toString(weaponBonus))
      .attr("data-socket", toString(weaponSocket));

    if (armor !== "firefox") {
      $("#armor")
        .css("background-image", 'url("' + armorPath + '")')
        .attr("data-item", armor)
        .attr("data-level", armorLevel)
        .attr("data-bonus", toString(armorBonus))
        .attr("data-socket", toString(armorSocket));
    }
  }

  hideWindows() {
    if ($("#achievements").hasClass("active")) {
      $("#achievements").removeClass("active");
      $("#achievementsbutton").removeClass("active");
    }

    $("#player").removeClass("visible");

    if ($("#instructions").hasClass("active")) {
      this.toggleInstructions();
    }
    if ($("body").hasClass("credits")) {
      this.closeInGameScroll("credits");
    }
    if ($("body").hasClass("legal")) {
      this.closeInGameScroll("legal");
    }
    if ($("body").hasClass("about")) {
      this.closeInGameScroll("about");
    }
    if ($("#completed").hasClass("active")) {
      this.toggleCompleted();
      $("#completedbutton").removeClass("active");
    }
    if ($("#missing-account").hasClass("active")) {
      $("#missing-account").removeClass("active");
    }
    if ($("#about").hasClass("active")) {
      this.toggleAbout();
      $("#completedbutton").removeClass("active");
    }
    if ($("#failed").hasClass("active")) {
      $("#failed").removeClass("active");
    }
    if ($("#population").hasClass("visible")) {
      $("#population").removeClass("visible");
    }
    if ($("#upgrade").hasClass("visible")) {
      this.closeUpgrade();
    }
    if ($("#trade").hasClass("visible")) {
      this.closeTrade();
    }
    if ($("#merchant").hasClass("visible")) {
      this.closeMerchant();
    }
    if ($("#inventory").hasClass("visible")) {
      this.closeInventory();
    }
    if ($("#waypoint").hasClass("visible")) {
      this.closeWaypoint();
    }
    if ($("#stash").hasClass("visible")) {
      this.closeStash();
    }
    if ($("#store").hasClass("active")) {
      this.store.closeStore();
    }
    if ($("#otherplayer-equipment").hasClass("visible")) {
      $("#otherplayer-equipment").removeClass("visible");
    }
    if ($("#settings").hasClass("active")) {
      $("#settings").removeClass("active");
      $("#settings-button").removeClass("active");
    }
    if ($("#party").hasClass("active")) {
      $("#party").removeClass("active");
      $("#party-button").removeClass("active");
    }

    $("#container").removeClass("prevent-click");

    this.closeOtherPlayerEquipment();

    // if ($("#store").hasClass('visible')) {
    //   // this.game.client.sendPurchaseCancel(this.game.depositAccount);
    // }
  }

  showAchievementNotification(id, name) {
    var $notif = $("#achievement-notification"),
      $name = $notif.find(".name"),
      $button = $("#achievementsbutton");

    $notif.removeClass().addClass("active achievement" + id);
    $name.text(name);
    if (this.game.storage.getAchievementCount() === 1) {
      this.blinkInterval = setInterval(function () {
        $button.toggleClass("blink");
      }, 500);
    }

    clearTimeout(this.achievementTimeout);
    this.achievementTimeout = setTimeout(function () {
      $notif.removeClass("active");
      $button.removeClass("blink");
    }, 5000);
  }

  displayUnlockedAchievement(id) {
    var $achievement = $("#achievements li.achievement" + id),
      achievement = this.game.getAchievementById(id);

    if (achievement && achievement.hidden) {
      this.setAchievementData($achievement, achievement.name, achievement.desc, achievement[this.game.network]);
    }
    $achievement.addClass("unlocked");
  }

  unlockAchievement(id, name, payout) {
    this.showAchievementNotification(id, name);
    this.displayUnlockedAchievement(id);

    var nb = parseInt($("#unlocked-achievements").text());
    const totalPayout = parseInt(
      `${parseFloat($("#unlocked-payout-achievements").text()) * networkDividerMap[this.game.network]}`,
      10,
    );
    $("#unlocked-achievements").text(nb + 1);
    $("#unlocked-payout-achievements").text((totalPayout + (payout || 0)) / networkDividerMap[this.game.network]);
  }

  initAchievementList(achievements) {
    var self = this,
      $lists = $("#lists"),
      $page = $("#page-tmpl"),
      $achievement = $("#achievement-tmpl"),
      page = 0,
      count = 0,
      $p: JQuery<HTMLElement> | null = null;

    $lists.empty();

    var totalPayout = 0;
    const domain = this.game.network === "ban" ? `BananoBrowserQuest` : "NanoBrowserQuest";
    const currency = this.game.network === "ban" ? `ban` : "xno";
    _.each(achievements, function (achievement) {
      count++;

      var $a = $achievement.clone();
      $a.removeAttr("id");
      $a.addClass("achievement" + count);
      if (!achievement.hidden) {
        self.setAchievementData($a, achievement.name, achievement.desc, achievement[self.game.network]);
      }

      $a.find(".twitter").attr(
        "href",
        `https://twitter.com/share?url=https%3A%2F%2F${domain.toLowerCase()}.com&text=I%20unlocked%20the%20%27` +
          achievement.name +
          `%27%20achievement%20on%20%23${domain}%20%23BrowserQuest%20$${currency}`,
      );
      $a.show();
      $a.find("a").click(function () {
        var url = $(this).attr("href");

        self.openPopup("twitter", url);
        return false;
      });

      totalPayout += achievement[self.game.network] || 0;

      if ((count - 1) % 4 === 0) {
        page++;
        $p = $page.clone();
        $p.attr("id", "page" + page);
        $p.show();
        $lists.append($p);
      }
      $p!.append($a);
    });

    $("#total-achievements").text($("#achievements").find("li").length);
    $("#total-payout-achievements").html(`
        ${this.getCurrencyPrefix()}
        <span>${totalPayout / networkDividerMap[this.game.network]}</span>
        ${this.getCurrencySuffix()}
      `);
  }

  getCurrencyPrefix() {
    if (this.game.network === "ban") {
      return "";
    } else {
      return '<span class="arial-font">Ӿ</span> ';
    }
  }

  getCurrencySuffix() {
    if (this.game.network === "ban") {
      return " BAN";
    } else {
      return "";
    }
  }

  initUnlockedAchievements(ids, totalPayout) {
    var self = this;

    _.each(ids, function (id) {
      self.displayUnlockedAchievement(id);
    });
    $("#unlocked-achievements").text(ids.length);
    $("#unlocked-payout-achievements").text(totalPayout / networkDividerMap[this.game.network]);
  }

  setAchievementData($el, name, desc, payout) {
    $el.find(".achievement-name").html(name);
    $el.find(".achievement-description").html(desc);
    $el.find(".achievement-payout").html(`
        ${payout ? this.getCurrencyPrefix() : ""}
        <span>${payout ? payout / networkDividerMap[this.game.network] : ""}</span>
        ${payout ? this.getCurrencySuffix() : ""}
      `);
  }

  initNanoPotions() {
    $(".item-potion").addClass(this.game.network);
  }

  initTradePlayer1StatusButton() {
    $("#trade-player1-status-button")
      .off("click")
      .on("click", ({ target }) => {
        // Both player accepted, do nothing
        if ($(target).hasClass("disabled") && $("#trade-player2-status").text() === "Accepted") {
          return;
        }

        $(target).toggleClass("disabled");
        const isAccepted = $(target).hasClass("disabled");

        this.game.client.sendTradePlayer1Status(isAccepted);
      });
  }

  updateNanoPotions(nanoPotions) {
    for (var i = 0; i < nanoPotions; i++) {
      if (i === 5) break;
      $("#potion-count").find(`.item-potion:eq(${i})`).addClass("active");
    }
  }

  updateGems(gems) {
    $("#achievements-unlocks-count")
      .find(".item-gem")
      .each((index, element) => {
        if (gems[index] !== 0) {
          $(element).addClass("active");
        }
      });
  }

  updateArtifact(_artifact) {
    // @TODO Update an artifact grayed out "map"?
  }

  toggleScrollContent(content) {
    var currentState = $("#parchment").attr("class");

    if (this.game.started) {
      $("#parchment").removeClass().addClass(content);

      $("body").removeClass("credits legal about").toggleClass(content);

      if (!this.game.player) {
        $("body").toggleClass("death");
      }

      if (content !== "about") {
        $("#completedbutton").removeClass("active");
      }
    } else {
      if (currentState !== "animate") {
        if (currentState === content) {
          this.animateParchment(currentState, this.frontPage);
        } else {
          this.animateParchment(currentState, content);
        }
      }
    }
  }

  closeInGameScroll(content: string) {
    $("body").removeClass(content);
    $("#parchment").removeClass(content);

    if (!this.game.player) {
      $("body").addClass("death");
    }
    if (content === "about") {
      $("#completedbutton").removeClass("active");
    }
  }

  togglePopulationInfo(isVisible) {
    this.hideWindows();

    $("#population").toggleClass("visible", !isVisible);

    if (!isVisible) {
      this.updatePopulationList();
    }
  }

  togglePlayerInfo() {
    $("#player").toggleClass("visible");
  }

  toggleMuteMusic() {
    const isEnabled = $("#mute-music-checkbox").is(":checked");
    this.storage.setMusicEnabled(isEnabled);

    if (isEnabled) {
      this.game.audioManager.enableMusic();
    } else {
      this.game.audioManager.disableMusic();
    }
  }

  toggleMuteSound() {
    const isEnabled = $("#mute-sound-checkbox").is(":checked");
    this.storage.setSoundEnabled(isEnabled);

    if (isEnabled) {
      this.game.audioManager.enableSound();
    } else {
      this.game.audioManager.disableSound();
    }
  }

  toggleEntityName() {
    const isChecked = $("#entity-name-checkbox").is(":checked");

    this.storage.setShowEntityNameEnabled(isChecked);
    this.game.renderer.setDrawEntityName(isChecked);
  }

  toggleDamageInfo() {
    const isChecked = $("#damage-info-checkbox").is(":checked");

    this.storage.setShowDamageInfoEnabled(isChecked);
    this.game.infoManager.setShowDamageInfo(isChecked);
  }

  togglePvP() {
    const isChecked = $("#pvp-checkbox").is(":checked");

    this.game.pvp = isChecked;
    this.game.client.sendSettings({ pvp: isChecked });
  }

  toggleAnvilOdds() {
    const isChecked = $("#anvil-odds-checkbox").is(":checked");

    this.storage.setShowAnvilOddsEnabled(isChecked);
    this.game.setShowAnvilOdds(isChecked);
  }

  toggleHealthAboveBars() {
    const isChecked = $("#health-above-bars-checkbox").is(":checked");

    this.storage.setShowHealthAboveBarsEnabled(isChecked);
    this.game.setShowHealthAboveBars(isChecked);
  }

  openInventory(onlyInventory = false) {
    if ($("#inventory").hasClass("visible")) return;

    if (onlyInventory) {
      this.hideWindows();
      $("#player").addClass("visible");
      $("#inventory .close").addClass("visible");
    }

    $("#inventory").addClass("visible");

    if ($("#upgrade").hasClass("visible")) {
      $("#inventory").addClass("upgrade");
    } else if ($("#trade").hasClass("visible")) {
      $("#inventory").addClass("trade");
    } else if ($("#merchant").hasClass("visible")) {
      $("#inventory").addClass("merchant");
    }

    this.game.initDraggable();
  }

  closeInventory() {
    if (!$("#inventory").hasClass("visible")) return;

    $("#inventory").removeClass("visible upgrade trade merchant");
    $("#inventory .close").removeClass("visible");
    $("#player").removeClass("visible");

    // clear tooltips
    $(".ui-helper-hidden-accessible").empty();

    this.hideWindows();
    this.game.destroyDraggable();
  }

  toggleInventory(onlyInventory = false) {
    if (
      $("#inventory").hasClass("visible") &&
      ($("#inventory").hasClass("upgrade") ||
        $("#inventory").hasClass("trade") ||
        $("#inventory").hasClass("merchant") ||
        $("#stash").hasClass("visible"))
    ) {
      this.hideWindows();
      this.openInventory(onlyInventory);
    } else {
      if (!$("#inventory").hasClass("visible")) {
        this.openInventory(onlyInventory);
      } else {
        this.closeInventory();
      }
    }
  }

  openOtherPlayerEquipment(player) {
    this.hideWindows();

    this.game.initOtherPlayerEquipmentSlots(player);
    $("#otherplayer-equipment").addClass("visible");
  }

  closeOtherPlayerEquipment() {
    $("#otherplayer-equipment").removeClass("visible");
  }

  openStash() {
    this.hideWindows();

    $("#stash").addClass("visible");
    this.openInventory();
  }

  closeStash() {
    $("#stash").removeClass("visible");
    this.closeInventory();
  }

  openTrade() {
    if ($("#trade").hasClass("visible")) return;
    this.hideWindows();

    $("#trade").addClass("visible");
    this.openInventory();
  }

  // @NOTE Do not re-send trade if both players accepted
  closeTrade(isCompleted = false) {
    if (!$("#trade").hasClass("visible")) return;

    $("#trade").removeClass("visible");
    this.closeInventory();

    $("#gold-player1-amount").text("0");
    $("#gold-player2-amount").text("0");

    if (!isCompleted) {
      this.game.client.sendTradeClose();
    }

    $("#trade-player1-item .item-slot").empty();
    $("#trade-player2-item .item-slot").empty();
    $("#trade-player1-item .item-trade").removeClass("item-not-droppable");
    $("#trade-player1-status").find(".btn").removeClass("disabled");
    $("#trade-player2-status").text("Waiting ...");
  }

  openMerchant() {
    if ($("#merchant").hasClass("visible")) return;

    this.hideWindows();
    this.toggleMerchant();
    this.openInventory();
  }

  closeMerchant() {
    if (!$("#merchant").hasClass("visible")) return;

    this.toggleMerchant();
    this.closeInventory();
  }

  toggleMerchant() {
    this.game.confirmedSoldItemToMerchant = null;

    $("#merchant").toggleClass("visible");
  }

  openUpgrade() {
    if ($("#upgrade").hasClass("visible")) return;

    this.hideWindows();

    $("#upgrade").addClass("visible");
    this.openInventory();
  }

  closeUpgrade() {
    if (!$("#upgrade").hasClass("visible")) return;
    $("#upgrade").removeClass("visible");

    this.closeInventory();

    if (this.game.player.upgrade.length) {
      this.game.client.sendMoveItemsToInventory("upgrade");
    }
    $(".item-scroll").empty();
    $("#upgrade .item-slot").removeClass("item-upgrade-success-slot item-upgrade-fail-slot");
  }

  openWaypoint(activeWaypoint) {
    this.hideWindows();

    $("#waypoint").find(".active").removeClass("active");
    if (activeWaypoint) {
      $(`#waypoint-${activeWaypoint.id}`).addClass("active");
    }
    $("#waypoint").addClass("visible");

    $("#foreground")
      .off(".waypoint")
      .on("click.waypoint", () => {
        this.closeWaypoint();
        $("#foreground").off(".waypoint");
      });
  }

  closeWaypoint() {
    $("#waypoint").find(".active").removeClass("active");
    $("#waypoint").removeClass("visible");
  }

  openPopup(type, url) {
    var h = $(window).height() || 0,
      w = $(window).width() || 0,
      popupHeight,
      popupWidth,
      top,
      left;

    switch (type) {
      case "twitter":
        popupHeight = 450;
        popupWidth = 550;
        break;
      case "facebook":
        popupHeight = 400;
        popupWidth = 580;
        break;
    }

    top = h / 2 - popupHeight / 2;
    left = w / 2 - popupWidth / 2;

    var newWindow = window.open(
      url,
      "name",
      "height=" + popupHeight + ",width=" + popupWidth + ",top=" + top + ",left=" + left,
    );

    newWindow?.focus();
  }

  animateParchment(origin, destination) {
    var self = this;
    var $parchment = $("#parchment");
    var duration = 1;

    this.clearValidationErrors();

    if (this.isMobile) {
      $parchment.removeClass(origin).addClass(destination);
    } else {
      if (this.isParchmentReady) {
        if (this.isTablet) {
          duration = 0;
        }
        this.isParchmentReady = !this.isParchmentReady;

        $parchment.removeClass();
        $parchment.toggleClass("animate");

        setTimeout(function () {
          $("#parchment").toggleClass("animate");
          $parchment.addClass(destination);
          self.setPlayButtonState(true);

          self.setFocus();
        }, duration * 1000);

        setTimeout(function () {
          self.isParchmentReady = !self.isParchmentReady;
        }, duration * 1000);
      }
    }
  }

  setFocus() {
    if ($("#nameinput").is(":visible")) {
      $("#nameinput").trigger("focus");
    } else if ($("#loginnameinput").is(":visible")) {
      $("#loginnameinput").trigger("focus");
    } else if ($("#loginpasswordinput").is(":visible")) {
      $("#loginpasswordinput").trigger("focus");
    } else if ($("#createpasswordinput").is(":visible")) {
      $("#createpasswordinput").trigger("focus");
    }
  }

  animateMessages() {
    var $messages = $("#notifications div");

    $messages.addClass("top");
  }

  resetMessagesPosition() {
    var message = $("#message2").text();

    $("#notifications div").removeClass("top");
    $("#message2").text("");
    $("#message1").text(message);
  }

  showMessage(message, timeout) {
    var $wrapper = $("#notifications div");
    var $message = $("#notifications #message2");

    this.animateMessages();
    $message.text(message);
    if (this.messageTimer) {
      this.resetMessageTimer();
    }

    this.messageTimer = setTimeout(function () {
      $wrapper.addClass("top");
    }, timeout || 5000);
  }

  resetMessageTimer() {
    clearTimeout(this.messageTimer);
  }

  resizeUi() {
    if (this.game) {
      if (this.game.started) {
        this.game.resize();
        this.initHealthBar();
        this.initTargetHud();
        this.initExpBar();
        this.game.updateBars();
      } else {
        var newScale = this.game.renderer.getScaleFactor();
        this.game.renderer.rescale(newScale);
      }
    }
  }
}

export default App;
