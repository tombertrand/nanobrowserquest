import "jquery-ui/ui/widgets/draggable";
import "jquery-ui/ui/widgets/droppable";
import "jquery-ui/ui/widgets/resizable";
import "jquery-ui/ui/widgets/tooltip";
import "jquery-ui/ui/widgets/dialog";
import "jquery-ui/ui/widgets/slider";
import "jquery-countdown";
import "jquery.qrcode";
import "jquery-ui-touch-punch";
import "../css/main.css";
import "../css/achievements.css";
import "../css/store.css";
import "../css/party.css";
import "../css/settings.css";
import "jquery-ui/themes/base/all.css";

import * as Sentry from "@sentry/browser";
import * as _ from "lodash";

import { ChatType } from "../../server/js/types";
import { Types } from "../../shared/js/gametypes";
import App from "./app";
import Character from "./character";
import Detect from "./detect";
import Game from "./game";
import { TRANSITIONEND } from "./utils";

import type { App as AppType } from "./types/app";
import type { Game as GameType } from "./types/game";

var app: AppType;
var game: GameType;

var initApp = function () {
  Sentry.init({
    dsn: process.env.NODE_ENV !== "development" ? process.env.SENTRY_DNS : "",
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

    $("#chatbutton").click(function () {
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

    $("#player-count").click(function () {
      app.togglePopulationInfo();
    });

    $("#bar-container").click(function (e) {
      e.preventDefault();
      e.stopPropagation();
    });

    $("#healthbar, #hitpoints").click(function () {
      app.togglePlayerInfo();
    });

    $("#weapon, #armor").click(function () {
      if ($("#population").hasClass("visible")) {
        $("#population").removeClass("visible");
      }
      app.toggleInventory();
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

    $("#back-to-login span").click(function () {
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
    if (data.hasAlreadyPlayed) {
      if (data?.player?.name && data?.player?.image) {
        $("#loginnameinput").hide();
        $("#loginaccountinput").hide();
        $("#login-play-link").hide();
        $("#no-playername").hide();

        $("#login-play-button").show();
        $("#forget-player").show();
        $("#playername").html(data.player.name).show();
        $("#playerimage").attr("src", data.player.image).show();
      }
    }

    $("#forget-player .link").on("click", () => {
      app.storage.clear();

      $("#no-playername").show();
      $("#loginnameinput").val("").show();
      $("#loginaccountinput").val("").show();
      $("#login-play-link").show();

      $("#playername").hide();
      $("#playerimage").hide();
      $("#login-play-button").hide();
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

    // $("#aaa1 .link").on("click", () => {
    //   $("#loginnameinput").val("aaa1").show();
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

    $("#chatinput").on("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      $(this).focus();
    });

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
    game.chat_callback({ message: `Welcome ${game.player.name}`, type: "event" });
  });

  game.onDisconnect(function (message) {
    $("#death")
      .find("p")
      .html(message + "<em>Please reload the page.</em>");
    $("#respawn").hide();
  });

  game.onPlayerDeath(function () {
    if ($("body").hasClass("credits")) {
      $("body").removeClass("credits");
    }
    $("body").addClass("death");
  });

  game.onGameCompleted(function ({ hash, fightAgain, show = false }) {
    if (hash) {
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

      $("#fight-again").click(function () {
        game.client.sendBossCheck(true);
        app.hideWindows();
      });
    }
  });

  game.onBossCheckFailed(function (message) {
    $("#failed").addClass("active").find("p").text(message);
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
    if (!$("#text-window").is(":visible") && !["event", "loot"].includes(type)) {
      $("#chatbutton").addClass("blink");
    }

    const textList = $("#text-list");
    let scrollToBottom = false;
    if (textList[0].scrollHeight - textList.scrollTop() - Math.floor(textList.outerHeight()) <= 10) {
      scrollToBottom = true;
    }

    let className = name === game.storage.data.player.name ? "active" : "";
    if (type) {
      className = type;
    }

    $("<div/>", {
      class: className,
      html: `${name ? `<span>${name}:</span>` : ""}<span>${message}</span>`,
    }).appendTo("#text-list");

    const messages = $("#text-list > div");
    if (messages.length > 50) {
      messages.first().remove();
    }

    if (scrollToBottom) {
      textList.scrollTop(textList[0].scrollHeight);
    }
  });

  game.onNbPlayersChange(function () {
    var setWorldPlayersString = function (string) {
      $("#instance-population").find("span:nth-child(2)").text(string);
      $("#player-count").find("span:nth-child(2)").text(string);
    };
    // var setTotalPlayersString = function (string) {
    //   $("#world-population").find("span:nth-child(2)").text(string);
    // };

    $("#player-count").find("span.count").text(game.worldPlayers.length);

    $("#instance-population").find("span").text(game.worldPlayers.length);
    if (game.worldPlayers.length === 1) {
      setWorldPlayersString("player");
    } else {
      setWorldPlayersString("players");
    }

    $("#player-list").empty();
    if (Array.isArray(game.worldPlayers)) {
      game.worldPlayers.forEach(({ name, level, hash, network }) => {
        let className = "";
        if (name === game.storage.data.player.name) {
          className = "active";
        } else if (game.player.partyMembers?.find(({ name: playerName }) => playerName === name)) {
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

    // $("#world-population").find("span:nth-child(1)").text(totalPlayers);
    // if (totalPlayers == 1) {
    //   setTotalPlayersString("player");
    // } else {
    //   setTotalPlayersString("players");
    // }
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
        game.pvpFlag = event.shiftKey;
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
      game.pvpFlag = event.shiftKey;
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
        case Types.Keys.KEYPAD_4:
          game.player.moveLeft = false;
          game.player.disableKeyboardNpcTalk = false;
          break;
        case Types.Keys.RIGHT:
        case Types.Keys.D:
        case Types.Keys.KEYPAD_6:
          game.player.moveRight = false;
          game.player.disableKeyboardNpcTalk = false;
          break;
        case Types.Keys.UP:
        case Types.Keys.W:
        case Types.Keys.KEYPAD_8:
          game.player.moveUp = false;
          game.player.disableKeyboardNpcTalk = false;
          break;
        case Types.Keys.DOWN:
        case Types.Keys.S:
        case Types.Keys.KEYPAD_2:
          game.player.moveDown = false;
          game.player.disableKeyboardNpcTalk = false;
          break;
        default:
          break;
      }
    }
  });

  $(document).keydown(function (e) {
    var key = e.which;

    if (key === Types.Keys.ENTER) {
      if ($(".ui-dialog").is(":visible")) {
        $("#dialog-delete-item").dialog("close");
        game.deleteItemFromSlot();
      } else if (!$("#text-window").is(":visible")) {
        app.showChat();
      }
    } else if (key === 16) {
      game.pvpFlag = true;
    }

    if (game.started && !$("#chatinput").is(":focus")) {
      if (!game.player || game.player.isDead) {
        // Return if player is dead
        return;
      }

      switch (key) {
        case Types.Keys.LEFT:
        case Types.Keys.A:
        case Types.Keys.KEYPAD_4:
          game.player.moveLeft = true;
          break;
        case Types.Keys.RIGHT:
        case Types.Keys.D:
        case Types.Keys.KEYPAD_6:
          game.player.moveRight = true;
          break;
        case Types.Keys.UP:
        case Types.Keys.W:
        case Types.Keys.KEYPAD_8:
          game.player.moveUp = true;
          break;
        case Types.Keys.DOWN:
        case Types.Keys.S:
        case Types.Keys.KEYPAD_2:
          game.player.moveDown = true;
          break;
        case Types.Keys.SPACE:
          game.makePlayerAttackNext();
          break;
        case Types.Keys.I:
          $("#weapon").click();
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
          $("#player-count").click();
          break;
        default:
          break;
      }
    }
  });

  $(document).keyup(function (e) {
    var key = e.which;

    if (key === 16) game.pvpFlag = false;
  });
  $("#chatinput").keydown(function (e) {
    var key = e.which,
      $chat = $("#chatinput");

    //   if (!(e.shiftKey && e.keyCode === 16) && e.keyCode !== 9) {
    //        if ($(this).val() === placeholder) {
    //           $(this).val('');
    //            $(this).removeAttr('placeholder');
    //            $(this).removeClass('placeholder');
    //        }
    //    }

    if (key === 13) {
      if ($chat.val() !== "") {
        if (game.player) {
          game.say($chat.val());
        }
        $chat.val("");
        // app.hideChat();
        $("#foreground").focus();
        return false;
      } else {
        app.hideChat();
        return false;
      }
    }

    if (key === 27) {
      app.hideChat();
      return false;
    }
  });

  $("#nameinput").focusin(function () {
    $("#name-tooltip").addClass("visible");
  });

  $("#nameinput").focusout(function () {
    $("#name-tooltip").removeClass("visible");
  });

  $("#nameinput").keypress(function () {
    $("#name-tooltip").removeClass("visible");
  });

  $("#settings-button").on("click", () => {
    app.toggleSettings();
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

  $(document).bind("keydown", function (e) {
    var key = e.which;
    var $chat = $("#chatinput");

    if (key === 13) {
      // Enter
      if (game.started) {
        $chat.focus();
        return false;
      } else {
        if (app.loginFormActive() || app.createNewCharacterFormActive()) {
          $("input").blur(); // exit keyboard on mobile
          app.tryStartingGame();
          return false; // prevent form submit
        }
      }
    }

    if ($("#chatinput:focus").length == 0 && $("#nameinput:focus").length == 0) {
      if (key === 27) {
        // ESC
        app.hideWindows();
        _.each(game.player.attackers, function (attacker: Character) {
          attacker.stop();
        });
        return false;
      }

      // The following may be uncommented for debugging purposes.
      //
      // if(key === 32 && game.started) { // Space
      //     game.togglePathingGrid();
      //     return false;
      // }
      // if(key === 70 && game.started) { // F
      //     game.toggleDebugInfo();
      //     return false;
      // }
    }
  });

  // $("#healthbar").click(function (e) {
  //   var hb = $("#healthbar");
  //   var hp = $("#hitpoints");
  //   var hpg = $("#hpguide");

  //   var hbp = hb.position();
  //   var hpp = hp.position();

  //   if (e.offsetX >= hpp.left && e.offsetX < hb.width()) {
  //     if (hpg.css("display") === "none") {
  //       hpg.css("display", "block");

  //       setInterval(function () {
  //         if (
  //           game.player.hitPoints / game.player.maxHitPoints <= game.hpGuide &&
  //           game.healShortCut >= 0 &&
  //           Types.isHealingItem(game.player.inventory[game.healShortCut]) &&
  //           game.player.inventoryCount[game.healShortCut] > 0
  //         ) {
  //           game.eat(game.healShortCut);
  //         }
  //       }, 100);
  //     }
  //     hpg.css("left", e.offsetX + "px");

  //     game.hpGuide = (e.offsetX - hpp.left) / (hb.width() - hpp.left);
  //   }

  //   return false;
  // });
  // if (game.renderer.tablet) {
  //   $("body").addClass("tablet");
  // }
};

initApp();
