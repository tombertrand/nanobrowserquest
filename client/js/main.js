define(["jquery", "app", "entrypoint", "lib/jquery-ui", "lib/jquery.ui.touch-punch", "lib/jquery.qrcode"], function (
  $,

  App,
  EntryPoint,
  jqueryUI,
  touchPunch,
  qrcode,
) {
  var app, game;

  var initApp = function () {
    $(document).ready(function () {
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

      $("body").click(function (event) {
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
          if ($("#transaction-hash").text() || $("#transaction-hash1").text()) {
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

      $("#create-new span").click(function () {
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

      var data = app.storage.data;
      if (data.hasAlreadyPlayed) {
        if (data.player.name && data.player.name !== "") {
          $("#playername").html(data.player.name);
          // @NOTE Delete this?
          // $("#playerimage").attr("src", data.player.image);
        }
      }

      $(".play span").click(function (event) {
        app.tryStartingGame();
      });

      document.addEventListener("touchstart", function () {}, false);

      $("#resize-check").bind("transitionend", app.resizeUi.bind(app));
      $("#resize-check").bind("webkitTransitionEnd", app.resizeUi.bind(app));
      $("#resize-check").bind("oTransitionEnd", app.resizeUi.bind(app));

      $("#minimize").on("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        app.hideChat();
      });

      log.info("App initialized.");

      $("#chatinput").on("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).focus();
      });

      initGame();
    });
  };

  var initGame = function () {
    require(["game"], function (Game) {
      var canvas = document.getElementById("entities"),
        background = document.getElementById("background"),
        foreground = document.getElementById("foreground"),
        input = document.getElementById("chatinput");

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
        var entry = new EntryPoint();
        entry.execute(game);

        game.chat_callback(null, null, `Welcome ${game.player.name}`, "world");
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

      game.onGameCompleted(function ({ hash, hash1, fightAgain, show = false }) {
        if (hash) {
          $("#completed")
            .find("#transaction-hash")
            .attr("href", "https://nanolooker.com/block/" + hash)
            .text(hash);
          $("#container-payout-hash").show();
        }
        if (hash1) {
          $("#completed")
            .find("#transaction-hash1")
            .attr("href", "https://nanolooker.com/block/" + hash1)
            .text(hash1);
          $("#container-payout-hash1").show();
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

      game.onPlayerInvincible(function () {
        $("#hitpoints").toggleClass("invincible");
      });

      game.onChatMessage(function (entityId, name, message, type) {
        if (!$("#text-window").is(":visible") && name !== game.storage.data.player.name && type !== "world") {
          $("#chatbutton").addClass("blink");
        }

        const textList = $("#text-list");
        let scrollToBottom = false;
        if (textList[0].scrollHeight - textList.scrollTop() - Math.floor(textList.outerHeight()) <= 10) {
          scrollToBottom = true;
        }

        let className = name === game.storage.data.player.name ? "active" : "";
        if (type === "world") {
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

      game.onNbPlayersChange(function (worldPlayers, totalPlayers, players) {
        var setWorldPlayersString = function (string) {
          $("#instance-population").find("span:nth-child(2)").text(string);
          $("#player-count").find("span:nth-child(2)").text(string);
        };
        // var setTotalPlayersString = function (string) {
        //   $("#world-population").find("span:nth-child(2)").text(string);
        // };

        $("#player-count").find("span.count").text(worldPlayers);

        $("#instance-population").find("span").text(worldPlayers);
        if (worldPlayers == 1) {
          setWorldPlayersString("player");
        } else {
          setWorldPlayersString("players");
        }

        $("#player-list").empty();
        if (Array.isArray(players)) {
          players.forEach(({ name, level, hash, hash1 }) => {
            $("<div/>", {
              class: name === game.storage.data.player.name ? "active" : "",
              html: `
                <span>${name}</span>
                ${hash ? '<span class="xno-payout" title="Killed the Skeleton King and received a payout"></span>' : ""}
                ${hash1 ? '<span class="xno-payout" title="Killed the Necromancer and received a payout"></span>' : ""}
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

      game.onGuildPopulationChange(function (guildName, guildPopulation) {
        // var setGuildPlayersString = function (string) {
        //   $("#guild-population").find("span:nth-child(2)").text(string);
        // };
        // $("#guild-population").addClass("visible");
        // $("#guild-population").find("span").text(guildPopulation);
        // $("#guild-name").text(guildName);
        // if (guildPopulation == 1) {
        //   setGuildPlayersString("player");
        // } else {
        //   setGuildPlayersString("players");
        // }
      });

      game.onAchievementUnlock(function (id, name, nano) {
        app.unlockAchievement(id, name, nano);
      });

      game.onNotification(app.showMessage);

      app.snowfall();

      app.initHealthBar();
      app.initTargetHud();
      app.initExpBar();
      app.initPlayerInfo();

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
          if (game && !app.dropDialogPopuped) {
            game.pvpFlag = event.shiftKey;
            game.click();
          }
          // app.hideWindows();
        });

        // @NOTE Only draggable / resizable for desktop size
        $("#text-window")
          .draggable()
          .resizable({
            // maxHeight: $("#container").height() / 2,
            // maxWidth: $("#container").width() * 0.75,
            minHeight: $("#container").height() / 4,
            minWidth: $("#container").width() / 3,
          });
      }

      $("body").unbind("click");
      $("body").click(function (event) {
        var hasClosedParchment = false;

        if ($("#parchment").hasClass("credits")) {
          if (game.started) {
            app.closeInGameScroll("credits");
            hasClosedParchment = true;
          } else {
            app.toggleScrollContent("credits");
          }
        }

        if ($("#parchment").hasClass("legal")) {
          if (game.started) {
            app.closeInGameScroll("legal");
            hasClosedParchment = true;
          } else {
            app.toggleScrollContent("legal");
          }
        }

        if ($("#parchment").hasClass("about")) {
          if (game.started) {
            app.closeInGameScroll("about");
            hasClosedParchment = true;
          } else {
            app.toggleScrollContent("about");
          }
        }

        if (event.target.id === "foreground") {
          game.click();
        }
      });

      $("#respawn").click(function (event) {
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

        if (!game.player) {
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
        var key = e.which,
          $chat = $("#chatinput");

        if (key === Types.Keys.ENTER) {
          if (!$("#text-window").is(":visible")) {
            app.showChat();
          }
        } else if (key === 16) game.pvpFlag = true;
        if (game.started && !$("#chatinput").is(":focus")) {
          if (!game.player) {
            // Return if player is dead
            return;
          }

          pos = {
            x: game.player.gridX,
            y: game.player.gridY,
          };
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
            case Types.Keys.M:
              $("#mute-button").click();
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
          $chat = $("#chatinput"),
          placeholder = $(this).attr("placeholder");

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

      $("#chatinput").focus(function (e) {
        var placeholder = $(this).attr("placeholder");

        if (!Detect.isFirefoxAndroid()) {
          $(this).val(placeholder);
        }

        if ($(this).val() === placeholder) {
          this.setSelectionRange(0, 0);
        }
      });

      $("#nameinput").focusin(function () {
        $("#name-tooltip").addClass("visible");
      });

      $("#nameinput").focusout(function () {
        $("#name-tooltip").removeClass("visible");
      });

      $("#nameinput").keypress(function (event) {
        $("#name-tooltip").removeClass("visible");
      });

      $("#mute-button").click(function () {
        app.toggleMute();
      });

      $(document).bind("keydown", function (e) {
        var key = e.which,
          $chat = $("#chatinput");

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
            _.each(game.player.attackers, function (attacker) {
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

      $("#healthbar").click(function (e) {
        var hb = $("#healthbar"),
          hp = $("#hitpoints"),
          hpg = $("#hpguide");

        var hbp = hb.position(),
          hpp = hp.position();

        if (e.offsetX >= hpp.left && e.offsetX < hb.width()) {
          if (hpg.css("display") === "none") {
            hpg.css("display", "block");

            setInterval(function () {
              if (
                game.player.hitPoints / game.player.maxHitPoints <= game.hpGuide &&
                game.healShortCut >= 0 &&
                Types.isHealingItem(game.player.inventory[game.healShortCut]) &&
                game.player.inventoryCount[game.healShortCut] > 0
              ) {
                game.eat(game.healShortCut);
              }
            }, 100);
          }
          hpg.css("left", e.offsetX + "px");

          game.hpGuide = (e.offsetX - hpp.left) / (hb.width() - hpp.left);
        }

        return false;
      });
      if (game.renderer.tablet) {
        $("body").addClass("tablet");
      }
    });
  };

  initApp();
});
