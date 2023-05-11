import "jquery-ui/ui/widgets/draggable";
import "jquery-ui/ui/widgets/droppable";
import "jquery-ui/ui/widgets/resizable";
import "jquery-ui/ui/widgets/tooltip";
import "jquery-ui/ui/widgets/dialog";
import "jquery-ui/ui/widgets/slider";
import "jquery-countdown";
import "jquery.qrcode";
import "jquery-ui-touch-punch";
import "jquery-contextmenu";
import "../css/main.css";
import "../css/achievements.css";
import "../css/inspector.css";
import "../css/store.css";
import "../css/party.css";
import "../css/settings.css";
import "../css/skills.css";
import "jquery-ui/themes/base/all.css";
import "jquery-contextmenu/dist/jquery.contextMenu.css";
import "../css/contextmenu.css";
import "../css/gold.css";

import * as Sentry from "@sentry/browser";

import { Types } from "../../shared/js/gametypes";
import { MERCHANT_SLOT_RANGE } from "../../shared/js/slots";
import App from "./app";
import Detect from "./detect";
import Game from "./game";
import { TRANSITIONEND } from "./utils";

var app: App;
var game: Game;

var initApp = function () {
  Sentry.init({
    dsn: process.env.SENTRY_DNS,
    beforeSend: (event, hint) => {
      if (process.env.NODE_ENV === "development") {
        console.error(hint.originalException || hint.syntheticException);
        return null;
      }
      return event;
    },
  });

  $(document).ready(function () {
    // @ts-ignore
    app = new App();
    app.center();

    if (Detect.isWindows()) {
      // Workaround for graphical glitches on text
      $("body").addClass("windows");
    }

    if (Detect.isOpera()) {
      // Fix for no pointer events
      $("body").addClass("opera");
    }

    if (Detect.isFirefoxAndroid()) {
      // Remove chat placeholder
      $("#chatinput").removeAttr("placeholder");
    }

    $("body").click(function () {
      if ($("#parchment").hasClass("credits")) {
        app.toggleScrollContent("credits");
      }

      if ($("#parchment").hasClass("legal")) {
        app.toggleScrollContent("legal");
      }

      if ($("#parchment").hasClass("about")) {
        app.toggleScrollContent("about");
      }
    });

    $(".barbutton").click(function () {
      $(this).toggleClass("active");
    });

    $("#chatbutton").on("click", () => {
      if ($("#chatbutton").hasClass("active")) {
        app.showChat();
      } else {
        app.hideChat();
      }
    });

    $("#achievementsbutton").click(function () {
      let isOpened = $("#achievements").hasClass("active");

      app.hideWindows();
      if (!isOpened) {
        app.toggleAchievements();
      }

      if (app.blinkInterval) {
        clearInterval(app.blinkInterval);
      }
      $(this).removeClass("blink");
    });

    $("#completedbutton").click(function () {
      let isOpened = $("#completed").hasClass("active") || $("#parchment").hasClass("about");
      $("#completed").removeClass("boss-check");

      app.hideWindows();
      if (!isOpened) {
        if ($("#transaction-hash").text()) {
          app.toggleCompleted();
        } else {
          app.toggleAbout();
        }
      }

      // if (app.blinkInterval) {
      //   clearInterval(app.blinkInterval);
      // }
      // $(this).removeClass("blink");
    });

    $("#player-count").on("click", function () {
      app.togglePopulationInfo($("#population").hasClass("visible"));
    });

    $("#bar-container").click(function (e) {
      e.preventDefault();
      e.stopPropagation();
    });

    $("#healthbar, #hitpoints").click(function () {
      app.togglePlayerInfo();
    });

    $("#weapon, #armor").on("click", () => {
      app.toggleInventory(true);
    });

    $("#skill-attack").click(function () {
      game.useSkill(1);
    });

    $("#skill-defense").on("click", () => {
      game.useSkill(2);
    });

    $(".clickable").click(function (event) {
      event.stopPropagation();
    });

    $("#toggle-credits").click(function () {
      app.toggleScrollContent("credits");
    });

    $("#toggle-legal").click(function () {
      app.toggleScrollContent("legal");
      if (game.renderer.mobile) {
        if ($("#parchment").hasClass("legal")) {
          $(this).text("close");
        } else {
          $(this).text("Privacy");
        }
      }
    });

    $("#create-new > .link").click(function () {
      app.animateParchment("loadcharacter", "confirmation");
    });

    $("#create-new-account span").click(function () {
      app.animateParchment("createcharacter", "createaccount");
    });

    $("#create-new-account-ok span").click(function () {
      app.animateParchment("createaccount", "createcharacter");
    });

    $("#continue span").click(function () {
      app.storage.clear();
      app.animateParchment("confirmation", "createcharacter");
      $("body").removeClass("returning");
      app.clearValidationErrors();
    });

    $("#cancel span").click(function () {
      app.animateParchment("confirmation", "loadcharacter");
    });

    $("#back-to-login .link").on("click", function () {
      $("#nameinput").val("");
      $("#accountinput").val("");
      app.animateParchment("createcharacter", "loadcharacter");
    });

    $(".ribbon").click(function () {
      app.toggleScrollContent("about");
    });

    $("#nameinput").bind("keyup", function () {
      app.toggleButton();
    });
    $("#accountinput").bind("keyup", function () {
      app.toggleButton();
    });

    $("#previous").click(function () {
      var $achievements = $("#achievements");

      if (app.currentPage === 1) {
        return false;
      } else {
        app.currentPage -= 1;
        $achievements.removeClass().addClass("active page" + app.currentPage);
      }
    });

    $("#next").click(function () {
      var $achievements = $("#achievements"),
        $lists = $("#lists"),
        nbPages = $lists.children("ul").length;

      if (app.currentPage === nbPages) {
        return false;
      } else {
        app.currentPage += 1;
        $achievements.removeClass().addClass("active page" + app.currentPage);
      }
    });

    $("#notifications div").bind(TRANSITIONEND, app.resetMessagesPosition.bind(app));

    $(".close").click(function (e) {
      e.preventDefault();
      e.stopPropagation();
      app.hideWindows();
    });

    $(".twitter").click(function () {
      var url = $(this).attr("href");

      app.openPopup("twitter", url);
      return false;
    });

    $(".facebook").click(function () {
      var url = $(this).attr("href");

      app.openPopup("facebook", url);
      return false;
    });

    const { data } = app.storage;
    const { name: playerName, image: playerImage } = data?.player || {};
    const parchmentClass = $("#parchment").attr("class");
    const parchment = $(`article#${parchmentClass}`);

    // if (data.hasAlreadyPlayed) {
    if (playerName) {
      parchment.find(".playername").text(playerName).show();
      parchment.find(".no-playername").hide();
      $("#loginnameinput").hide();
      $("#loginaccountinput").hide();
      // parchment.find(".login-play-link").hide();
      parchment.find(".login-play-button").show();
    } else {
      parchment.find(".playername").hide();
      parchment.find(".no-playername").show();
      // parchment.find(".login-play-link").show();
      // parchment.find(".login-play-button").hide();
    }

    console.log("~~~playerImage", playerImage);

    if (playerImage) {
      $(".playerimage").attr("src", playerImage);
      // parchment.find(".playerimage").attr("src", playerImage).show();
    } else {
      $(".playerimage").hide();
    }
    // }

    $("#forget-player .link").on("click", () => {
      $(".playerimage").hide();

      const clickedParchmentClass = $("#parchment").attr("class");
      const clickedParchment = $(`article#${clickedParchmentClass}`);

      console.log("~~~~clickedParchment", clickedParchment);
      console.log("~~~~clickedParchmentClass", clickedParchmentClass);

      clickedParchment.find(".no-playername").show();
      $("#loginnameinput").val("").show();
      $("#loginaccountinput").val("").show();
      // clickedParchment.find(".login-play-link").show();

      clickedParchment.find(".playername").hide();
      clickedParchment.find(".playerimage").hide();
      clickedParchment.find(".login-play-button").show();
      $("#forget-player").hide();

      app.animateParchment("loadcharacter", "loadcharacter");
    });

    // $("#running-coder .link").on("click", () => {
    //   $("#loginnameinput").val("running-coder").show();
    //   $("#loginaccountinput").val("nano_3j6ht184dt4imk5na1oyduxrzc6otig1iydfdaa4sgszne88ehcdbtp3c5y3").show();
    //   app.tryStartingGame();
    // });

    // $("#banano .link").on("click", () => {
    //   $("#loginnameinput").val("banano").show();
    //   $("#loginaccountinput").val("ban_1questzx4ym4ncmswhz3r4upwrxosh1hnic8ry8sbh694r48ajq95d1ckpay").show();
    //   app.tryStartingGame();
    // });

    // $("#running-coder1 .link").on("click", () => {
    //   $("#loginnameinput").val("running-coder1").show();
    //   $("#loginaccountinput").val("nano_3j6ht184dt4imk5na1oyduxrzc6otig1iydfdaa4sgszne88ehcdbtp3c5y3").show();
    //   app.tryStartingGame();
    // });

    // $("#hello .link").on("click", () => {
    //   $("#loginnameinput").val("hello").show();
    //   $("#loginaccountinput").val("nano_3j6ht184dt4imk5na1oyduxrzc6otig1iydfdaa4sgszne88ehcdbtp3c5y3").show();
    //   app.tryStartingGame();
    // });

    $(".play span").click(function () {
      app.tryStartingGame();
    });

    document.addEventListener("touchstart", function () {}, false);

    $("#resize-check").bind(TRANSITIONEND, app.resizeUi.bind(app));

    $("#minimize").on("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      app.hideChat();
    });

    console.info("App initialized.");

    initGame();
  });
};

var initGame = function () {
  var canvas = document.getElementById("entities"),
    background = document.getElementById("background"),
    foreground = document.getElementById("foreground"),
    input = document.getElementById("chatinput");

  // @ts-ignore
  game = new Game(app);
  game.setup("#bubbles", canvas, background, foreground, input);
  game.setStorage(app.storage);
  game.setStore(app.store);
  app.setGame(game);

  if (app.isDesktop && app.supportsWorkers) {
    game.loadMap();
  }

  game.onGameStart(function () {
    app.initEquipmentIcons();

    if (game.hasNeverStarted) {
      game.chat_callback({ message: `Welcome ${game.player.name}`, type: "event" });
    }
  });

  game.onDisconnect(function (message) {
    $("#gold-death-wrapper").hide();
    $("#death")
      .find("p")
      .first()
      .html(message + "<em>Please reload the page.</em>");
    $("#respawn").hide();
  });

  game.onPlayerDeath(function (gold) {
    if ($("body").hasClass("credits")) {
      $("body").removeClass("credits");
    }
    $("body").addClass("death");

    $("#gold-death-wrapper").toggleClass("visible", !!gold);
    $("#gold-death").text(game.formatGold(gold));
  });

  game.onGameCompleted(function ({ hash, fightAgain, show = false }) {
    if (hash) {
      game.player.hash = hash;
      $("#completed").find("#transaction-hash").attr("href", `https://${game.explorer}.com/block/${hash}`).text(hash);
      $("#container-payout-hash").show();
    }

    $("#completedbutton").addClass("completed");

    if (show) {
      $("#completed").addClass("active");
      $("#completedbutton").addClass("active");
    }

    if (fightAgain) {
      $("#completed").addClass("boss-check");

      $("#fight-again")
        .off("click")
        .on("click", function () {
          game.client.sendBossCheck(true);
          app.hideWindows();
        });
    }
  });

  game.onMissingAccount(function () {
    $("#missing-account").addClass("active");

    $("#missing-account-btn")
      .off("click")
      .on("click", function () {
        game.client.sendBossCheck(true);
        app.hideWindows();
      });
  });

  game.onBossCheckFailed(function (message) {
    $("#min-level").text(message);
    $("#failed").addClass("active");
  });

  game.onPlayerEquipmentChange(function () {
    app.initEquipmentIcons();
  });

  game.onPlayerStartInvincible(function () {
    $("#hitpoints").addClass("invincible");
  });

  game.onPlayerStopInvincible(function () {
    $("#hitpoints").removeClass("invincible");
  });

  game.onChatMessage(function ({ name, message, type }: { name: string; message: string; type: ChatType }) {
    if (!$("#text-window").is(":visible") && !["event", "loot", "info"].includes(type)) {
      $("#chatbutton").addClass("blink");
    }

    const textList = $("#text-list");
    let scrollToBottom = false;
    if (textList[0].scrollHeight - textList.scrollTop() - Math.floor(textList.outerHeight()) <= 100) {
      scrollToBottom = true;
    }

    let className = name === game.storage.data.player.name ? "active" : "";
    if (type) {
      className = type;
    }

    $("<div/>", {
      class: className,
      html: `<span>${name ? `${name}: ` : ""}</span><span>${message}</span>`,
    }).appendTo("#text-list");

    const messages = $("#text-list > div");
    if (messages.length > 100) {
      messages.first().remove();
    }

    if (scrollToBottom) {
      app.scrollChatToBottom();
    }
  });

  game.onNbPlayersChange(function () {
    if ($("#party").hasClass("active")) {
      app.updatePartyPanel();
    }
    if ($("#population").hasClass("visible")) {
      app.updatePopulationList();
    }

    var setWorldPlayersString = function (string) {
      $("#instance-population").find("span:nth-child(2)").text(string);
      $("#player-count").find("span:nth-child(2)").text(string);
    };

    $("#player-count").find("span.count").text(game.worldPlayers.length);

    $("#instance-population").find("span").text(game.worldPlayers.length);
    if (game.worldPlayers.length === 1) {
      setWorldPlayersString("player");
    } else {
      setWorldPlayersString("players");
    }
  });

  game.onAchievementUnlock(function (id, name, payout) {
    app.unlockAchievement(id, name, payout);
  });

  game.onNotification(app.showMessage.bind(app));

  app.initHealthBar();
  app.initTargetHud();
  app.initExpBar();

  $("#nameinput").val("");
  // $("#accountinput").val("");
  // $("#chatbox").val("");

  if (game.renderer.mobile || game.renderer.tablet) {
    $("#foreground").bind("touchstart", function (event) {
      app.center();
      app.setMouseCoordinates(event.originalEvent.touches[0]);
      game.click();
      // app.hideWindows();
    });
  } else {
    $("#foreground").click(function (event) {
      app.center();
      app.setMouseCoordinates(event);
      if (game) {
        game.pvpFlag = game.player?.level >= 9 && event.shiftKey;
        game.click();
      }
      // app.hideWindows();
    });

    $("#text-window")
      .draggable()
      .resizable({
        minHeight: $("#container").height() / 4,
        minWidth: $("#container").width() / 3,
      });
  }

  $("body")
    .off("click")
    .on("click", function (event) {
      if ($("#parchment").hasClass("credits")) {
        if (game.started) {
          app.closeInGameScroll("credits");
        } else {
          app.toggleScrollContent("credits");
        }
      }

      if ($("#parchment").hasClass("legal")) {
        if (game.started) {
          app.closeInGameScroll("legal");
        } else {
          app.toggleScrollContent("legal");
        }
      }

      if ($("#parchment").hasClass("about")) {
        if (game.started) {
          app.closeInGameScroll("about");
        } else {
          app.toggleScrollContent("about");
        }
      }

      if (event.target.id === "foreground") {
        game.click();
      }
    });

  $("#respawn").click(function () {
    game.audioManager.playSound("revive");
    game.respawn();
    $("body").removeClass("death");
  });

  $(document).mousemove(function (event) {
    app.setMouseCoordinates(event);
    if (game.started) {
      game.pvpFlag = game.player?.level >= 9 && event.shiftKey;
      game.movecursor();
    }
  });

  $(document).keyup(function (e) {
    var key = e.which;

    if (!game.player || game.player.isDead) {
      // Return if player is dead
      return;
    }

    if (game.started && !$("#chatbox").hasClass("active")) {
      switch (key) {
        case Types.Keys.LEFT:
        case Types.Keys.A:
          game.player.moveLeft = false;
          game.player.disableKeyboardNpcTalk = false;
          break;
        case Types.Keys.RIGHT:
        case Types.Keys.D:
          game.player.moveRight = false;
          game.player.disableKeyboardNpcTalk = false;
          break;
        case Types.Keys.UP:
        case Types.Keys.W:
          game.player.moveUp = false;
          game.player.disableKeyboardNpcTalk = false;
          break;
        case Types.Keys.DOWN:
        case Types.Keys.S:
          game.player.moveDown = false;
          game.player.disableKeyboardNpcTalk = false;
          break;
        case Types.Keys[1]:
        case Types.Keys.KEYPAD_1:
          game.useSkill(1);
          break;
        case Types.Keys[2]:
        case Types.Keys.KEYPAD_2:
          game.useSkill(2);
          break;
        default:
          break;
      }
    }
  });

  $(document).on("keydown", e => {
    if (!game.started) return;
    if ($("#chatinput").is(":focus")) return;

    if (!game.player || game.player.isDead) {
      // Return if player is dead
      return;
    }

    switch (e.keyCode) {
      case Types.Keys.ESC:
        app.hideWindows();
        break;
      case Types.Keys.ENTER:
        if ($(".ui-dialog").is(":visible")) {
          if ($("#dialog-delete-item").dialog("isOpen")) {
            game.deleteItemFromSlot();
            $("#dialog-delete-item").dialog("close");
          } else if ($("#dialog-merchant-item").dialog("isOpen")) {
            const { fromSlot, toSlot, transferedQuantity, confirmed } = game.confirmedSoldItemToMerchant;
            game.dropItem(fromSlot, toSlot, transferedQuantity, confirmed);
            game.confirmedSoldItemToMerchant = null;
            $("#dialog-merchant-item").dialog("close");
          }
        } else if (!$("#text-window").is(":visible")) {
          app.showChat();
        }
        break;
      case Types.Keys.SHIFT:
        game.pvpFlag = game.player?.level >= 9;
        break;
      case Types.Keys.DELETE:
      case Types.Keys.BACKSPACE:
        if (typeof game.hoverSlotToDelete === "number") {
          if ($("#merchant").hasClass("visible")) {
            game.dropItem(game.hoverSlotToDelete, MERCHANT_SLOT_RANGE);
          } else {
            game.dropItem(game.hoverSlotToDelete, -1);
          }
        }
        break;
      case Types.Keys.LEFT:
      case Types.Keys.A:
        game.player.moveLeft = true;
        break;
      case Types.Keys.RIGHT:
      case Types.Keys.D:
        game.player.moveRight = true;
        break;
      case Types.Keys.UP:
      case Types.Keys.W:
        game.player.moveUp = true;
        break;
      case Types.Keys.DOWN:
      case Types.Keys.S:
        game.player.moveDown = true;
        break;
      case Types.Keys[1]:
      case Types.Keys.KEYPAD_1:
        game.useSkill(1);
        break;
      case Types.Keys[2]:
      case Types.Keys.KEYPAD_2:
        game.useSkill(2);
        break;
      case Types.Keys.SPACE:
        game.makePlayerAttackNext();
        break;
      case Types.Keys.I:
        app.toggleInventory(true);
        break;
      case Types.Keys.C:
        app.togglePlayerInfo();
        break;
      case Types.Keys.Q:
        $("#achievementsbutton").click();
        break;
      case Types.Keys.H:
        $("#completedbutton").click();
        break;
      case Types.Keys.O:
        $("#settings-button").click();
        break;
      case Types.Keys.P:
        $("#party-button").trigger("click");
        break;
      default:
        break;
    }
  });

  $(document).on("keyup", e => {
    if (e.keyCode === Types.Keys.SHIFT) game.pvpFlag = false;
  });

  $("#chatinput").on("keydown", e => {
    const $chat = $("#chatinput");

    if (e.keyCode === Types.Keys.ENTER) {
      if ($chat.val() !== "") {
        if (game.player) {
          game.say($chat.val());
        }
        $chat.val("");
      } else {
        e.stopPropagation();
        app.hideChat();
      }
    } else if (e.keyCode === Types.Keys.ESC) {
      app.hideChat();
      $chat.val("");
    }
  });

  $("#settings-button").on("click", () => {
    app.toggleSettings();
  });

  $("#party-button").on("click", () => {
    app.toggleParty();
  });

  $("#mute-music-checkbox").on("change", function () {
    app.toggleMuteMusic();
  });

  $("#mute-sound-checkbox").on("change", function () {
    app.toggleMuteSound();
  });

  $("#entity-name-checkbox").on("change", function () {
    app.toggleEntityName();
  });

  $("#damage-info-checkbox").on("change", function () {
    app.toggleDamageInfo();
  });

  $("#anvil-odds-checkbox").on("change", function () {
    app.toggleAnvilOdds();
  });

  $(document).on("keydown.loginform", function (e) {
    if (e.keyCode === Types.Keys.ENTER) {
      if (
        !game.started &&
        (app.loginFormActive() ||
          app.createNewCharacterFormActive() ||
          app.createPasswordFormActive() ||
          app.enterPasswordFormActive())
      ) {
        if (document.activeElement.tagName === "INPUT") {
          $(document.activeElement).trigger("blur"); // exit keyboard on mobile
        }
        app.tryStartingGame();
        return false;
      }
    }

    // The following may be uncommented for debugging purposes.
    //
    // if(key === Types.Keys.SPACE && game.started) { // Space
    //     game.togglePathingGrid();
    //     return false;
    // }
    // if(key === 70 && game.started) { // F
    //     game.toggleDebugInfo();
    //     return false;
    // }
  });
};

initApp();
