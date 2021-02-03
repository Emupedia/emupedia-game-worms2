var access_token;
function googlePlusSignIn(authResult)
{
    $("#nickname").modal('hide');
    if (authResult['access_token'])
    {
        access_token = authResult['access_token'];
        //if (Client.socket)
        //{
        //    Client.socket.emit(Events.lobby.GOOGLE_PLUS_LOGIN, access_token);
        //}
    } else if (authResult['error'])
    {
        console.log(authResult['error']);
    }
}
(function ()
{
    var Settings;
    (function (Settings)
    {
        Settings.PLAYER_TURN_TIME = 45 * 1000;
        Settings.TURN_TIME_WARING = 5;
        Settings.SOUND = true;
        Settings.NODE_SERVER_IP = 'worms.ciaranmccann.me';
        Settings.LEADERBOARD_API_URL = 'http://worms.ciaranmccann.me';
        Settings.NODE_SERVER_PORT = '8080';
        Settings.DEVELOPMENT_MODE = false;
        Settings.LOG = false;
        Settings.BUILD_MANIFEST_FILE = false;
        Settings.REMOTE_ASSERT_SERVER = "assets/";
        Settings.API_KEY = "AIzaSyA1aZhcIhRQ2gbmyxV5t9pGK47hGsiIO7U";
        Settings.PHYSICS_DEBUG_MODE = false;
        Settings.RUN_UNIT_TEST_ONLY = !true;
        Settings.NETWORKED_GAME_QUALITY_LEVELS = {
            HIGH: 0,
            MEDIUM: 1,
            LOW: 2
        };
        Settings.NETWORKED_GAME_QUALITY = Settings.NETWORKED_GAME_QUALITY_LEVELS.HIGH;
        function getSettingsFromUrl()
        {
            var argv = getUrlVars();
            var commands = [
                "physicsDebugDraw",
                "devMode",
                "unitTest",
                "sound"
            ];
            if (argv[commands[0]] == "true")
            {
                Settings.PHYSICS_DEBUG_MODE = true;
            }
            if (argv[commands[1]] == "true")
            {
                Settings.DEVELOPMENT_MODE = true;
            }
            if (argv[commands[2]] == "true")
            {
                var testWindow = window.open('test.html', '|UnitTests', 'height=1000,width=700,top:100%');
                testWindow.location.reload();
            }
            if (argv[commands[3]] == "false")
            {
                Settings.SOUND = false;
            }
            Logger.log(" Notice: argv are as follows " + commands);
        }
        Settings.getSettingsFromUrl = getSettingsFromUrl;
        function getUrlVars()
        {
            var vars = {
            };
            window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value)
            {
                vars[key] = value;
                return true;
            });
            return vars;
        }
        Settings.getUrlVars = getUrlVars;
    })(Settings || (Settings = {}));
    var b2Vec2 = Box2D.Common.Math.b2Vec2, b2BodyDef = Box2D.Dynamics.b2BodyDef, b2Body = Box2D.Dynamics.b2Body, b2FixtureDef = Box2D.Dynamics.b2FixtureDef, b2Fixture = Box2D.Dynamics.b2Fixture, b2World = Box2D.Dynamics.b2World, b2MassData = Box2D.Collision.Shapes.b2MassData, b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape, b2CircleShape = Box2D.Collision.Shapes.b2CircleShape, b2DebugDraw = Box2D.Dynamics.b2DebugDraw, b2AABB = Box2D.Collision.b2AABB, b2ContactListener = Box2D.Dynamics.b2ContactListener, b2RayCastInput = Box2D.Collision.b2RayCastInput, b2DistanceJointDef = Box2D.Dynamics.Joints.b2DistanceJointDef, b2RayCastOutput = Box2D.Collision.b2RayCastOutput, b2RevoluteJointDef = Box2D.Dynamics.Joints.b2RevoluteJointDef, b2RevoluteJoint = Box2D.Dynamics.Joints.b2RevoluteJoint, b2SimplexVertex = Box2D.Collision.b2SimplexVertex, b2WorldManifold = Box2D.Collision.b2WorldManifold, b2Shape = Box2D.Collision.Shapes.b2Shape;
    var Physics;
    (function (Physics)
    {
        Physics.worldScale;
        Physics.world;
        Physics.debugDraw;
        Physics.fastAcessList = [];
        function addToFastAcessList(body)
        {
            Physics.fastAcessList.push(body);
        }
        Physics.addToFastAcessList = addToFastAcessList;
        function removeToFastAcessList(body)
        {
            for (var b in Physics.fastAcessList)
            {
                if (Physics.fastAcessList[b] === body)
                {
                    Utilies.deleteFromCollection(Physics.fastAcessList, b);
                }
            }
        }
        Physics.removeToFastAcessList = removeToFastAcessList;
        function init(ctx)
        {
            Physics.worldScale = 30;
            Physics.world = new b2World(new b2Vec2(0, 10), true);
            Physics.debugDraw = new b2DebugDraw();
            Physics.debugDraw.SetSprite(ctx);
            Physics.debugDraw.SetDrawScale(Physics.worldScale);
            Physics.debugDraw.SetFillAlpha(0.3);
            Physics.debugDraw.SetLineThickness(1.0);
            Physics.debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
            Physics.world.SetDebugDraw(Physics.debugDraw);
            var listener = new b2ContactListener();
            listener.BeginContact = function (contact)
            {
                if (contact.GetFixtureA().GetBody().GetUserData() != null && contact.GetFixtureA().GetBody().GetUserData().beginContact != null)
                {
                    contact.GetFixtureA().GetBody().GetUserData().beginContact(contact);
                }
                if (contact.GetFixtureB().GetBody().GetUserData() != null && contact.GetFixtureB().GetBody().GetUserData().beginContact != null)
                {
                    contact.GetFixtureB().GetBody().GetUserData().beginContact(contact);
                }
            };
            listener.EndContact = function (contact)
            {
                if (contact.GetFixtureA().GetBody().GetUserData() != null && contact.GetFixtureA().GetBody().GetUserData().endContact != null)
                {
                    contact.GetFixtureA().GetBody().GetUserData().endContact(contact);
                }
                if (contact.GetFixtureB().GetBody().GetUserData() != null && contact.GetFixtureB().GetBody().GetUserData().endContact != null)
                {
                    contact.GetFixtureB().GetBody().GetUserData().endContact(contact);
                }
            };
            listener.PostSolve = function (contact, impulse)
            {
                if (contact.GetFixtureA().GetBody().GetUserData() != null && contact.GetFixtureA().GetBody().GetUserData().postSolve != null)
                {
                    contact.GetFixtureA().GetBody().GetUserData().postSolve(contact, impulse);
                }
                if (contact.GetFixtureB().GetBody().GetUserData() != null && contact.GetFixtureB().GetBody().GetUserData().postSolve != null)
                {
                    contact.GetFixtureB().GetBody().GetUserData().postSolve(contact, impulse);
                }
            };
            listener.PreSolve = function (contact)
            {
                if (contact.GetFixtureA().GetBody().GetUserData() != null && contact.GetFixtureA().GetBody().GetUserData().preSolve != null)
                {
                    contact.GetFixtureA().GetBody().GetUserData().preSolve(contact);
                }
                if (contact.GetFixtureB().GetBody().GetUserData() != null && contact.GetFixtureB().GetBody().GetUserData().preSolve != null)
                {
                    contact.GetFixtureB().GetBody().GetUserData().preSolve(contact);
                }
            };
            Physics.world.SetContactListener(listener);
        }
        Physics.init = init;
        function isCollisionBetweenTypes(objType1, objType2, contact)
        {
            var obj1 = contact.GetFixtureA().GetBody().GetUserData();
            var obj2 = contact.GetFixtureB().GetBody().GetUserData();
            if ((obj1 instanceof objType1 || obj1 instanceof objType2) && (obj2 instanceof objType1 || obj2 instanceof objType2))
            {
                return true;
            } else
            {
                return false;
            }
        }
        Physics.isCollisionBetweenTypes = isCollisionBetweenTypes;
        function shotRay(startPiontInMeters, endPiontInMeters)
        {
            var input = new b2RayCastInput();
            var output = new b2RayCastOutput();
            var intersectionPoint = new b2Vec2();
            var normalEnd = new b2Vec2();
            var intersectionNormal = new b2Vec2();
            endPiontInMeters.Multiply(30);
            endPiontInMeters.Add(startPiontInMeters);
            input.p1 = startPiontInMeters;
            input.p2 = endPiontInMeters;
            input.maxFraction = 1;
            var closestFraction = 1;
            var bodyFound = false;
            var b = new b2BodyDef();
            var f = new b2FixtureDef();
            for (b = Physics.world.GetBodyList() ; b; b = b.GetNext())
            {
                for (f = b.GetFixtureList() ; f; f = f.GetNext())
                {
                    if (!f.RayCast(output, input))
                    {
                        continue;
                    } else if (output.fraction < closestFraction && output.fraction > 0)
                    {
                        if (output.fraction > 0.001)
                        {
                            closestFraction = output.fraction;
                            intersectionNormal = output.normal;
                            bodyFound = true;
                        }
                    }
                }
            }
            intersectionPoint.x = startPiontInMeters.x + closestFraction * (endPiontInMeters.x - startPiontInMeters.x);
            intersectionPoint.y = startPiontInMeters.y + closestFraction * (endPiontInMeters.y - startPiontInMeters.y);
            if (bodyFound)
            {
                return intersectionPoint;
            }
            return null;
        }
        Physics.shotRay = shotRay;
        function applyToNearByObjects(epicenter, effectedRadius, funcToApplyToEach)
        {
            var aabb = new b2AABB();
            aabb.lowerBound.Set(epicenter.x - effectedRadius, epicenter.y - effectedRadius);
            aabb.upperBound.Set(epicenter.x + effectedRadius, epicenter.y + effectedRadius);
            Physics.world.QueryAABB(function (fixture)
            {
                funcToApplyToEach(fixture, epicenter);
                return true;
            }, aabb);
        }
        Physics.applyToNearByObjects = applyToNearByObjects;
        function pixelToMeters(pixels)
        {
            return pixels / Physics.worldScale;
        }
        Physics.pixelToMeters = pixelToMeters;
        function metersToPixels(meters)
        {
            return meters * Physics.worldScale;
        }
        Physics.metersToPixels = metersToPixels;
        function vectorPixelToMeters(vPixels)
        {
            return new b2Vec2(vPixels.x / Physics.worldScale, vPixels.y / Physics.worldScale);
        }
        Physics.vectorPixelToMeters = vectorPixelToMeters;
        function vectorMetersToPixels(vMeters)
        {
            return new b2Vec2(vMeters.x * Physics.worldScale, vMeters.y * Physics.worldScale);
        }
        Physics.vectorMetersToPixels = vectorMetersToPixels;
        function bodyToDrawingPixelCoordinates(body)
        {
            var pos = body.GetPosition();
            var radius = body.GetFixtureList().GetShape().GetRadius();
            pos.x -= radius;
            pos.y -= radius;
            return Physics.vectorMetersToPixels(pos);
        }
        Physics.bodyToDrawingPixelCoordinates = bodyToDrawingPixelCoordinates;
    })(Physics || (Physics = {}));
    var BodyDataPacket = (function ()
    {
        function BodyDataPacket(body)
        {
            if (typeof body == "string")
            {
                this.fromJSON(body);
            } else
            {
                this.pX = body.GetPosition().x;
                this.pY = body.GetPosition().y;
            }
        }
        BodyDataPacket.prototype.override = function (body)
        {
            if (body)
            {
                body.SetPosition(new b2Vec2(this.pX, this.pY));
            }
        };
        BodyDataPacket.prototype.toJSON = function ()
        {
            if (Settings.NETWORKED_GAME_QUALITY_LEVELS.HIGH == Settings.NETWORKED_GAME_QUALITY)
            {
                return (Math.floor(this.pX * 10000) / 10000) + "," + (Math.floor(this.pY * 10000) / 10000);
            } else if (Settings.NETWORKED_GAME_QUALITY_LEVELS.MEDIUM == Settings.NETWORKED_GAME_QUALITY)
            {
                return (Math.floor(this.pX * 1000) / 1000) + "," + (Math.floor(this.pY * 1000) / 1000);
            } else if (Settings.NETWORKED_GAME_QUALITY_LEVELS.LOW == Settings.NETWORKED_GAME_QUALITY)
            {
                return (Math.floor(this.pX * 100) / 100) + "," + (Math.floor(this.pY * 100) / 100);
            }
        };
        BodyDataPacket.prototype.fromJSON = function (data)
        {
            var v = data.split(",");
            this.pX = parseFloat(v[0]);
            this.pY = parseFloat(v[1]);
        };
        return BodyDataPacket;
    })();
    var PhysiscsDataPacket = (function ()
    {
        function PhysiscsDataPacket(bodies)
        {
            this.bodyDataPackets = [];
            if (typeof bodies == "string")
            {
                this.fromJSON(bodies);
            } else
            {
                for (var b in bodies)
                {
                    this.bodyDataPackets.push(new BodyDataPacket(bodies[b]));
                }
            }
        }
        PhysiscsDataPacket.prototype.override = function (bodies)
        {
            for (var b in this.bodyDataPackets)
            {
                this.bodyDataPackets[b].override(bodies[b]);
            }
        };
        PhysiscsDataPacket.prototype.toJSON = function ()
        {
            var data = "";
            for (var b in this.bodyDataPackets)
            {
                data += this.bodyDataPackets[b].toJSON() + ":";
            }
            return data;
        };
        PhysiscsDataPacket.prototype.fromJSON = function (data)
        {
            var vectors = data.split(":");
            for (var i in vectors)
            {
                if (vectors[i] != "")
                {
                    this.bodyDataPackets.push(new BodyDataPacket(vectors[i]));
                }
            }
        };
        return PhysiscsDataPacket;
    })();
    String.prototype.format = function ()
    {
        var numbers = [];
        for (var _i = 0; _i < (arguments.length - 0) ; _i++)
        {
            numbers[_i] = arguments[_i + 0];
        }
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number)
        {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    };
    var Notify;
    (function (Notify)
    {
        Notify.locked = false;
        Notify.levels = {
            sucess: "alert-success",
            warn: "alert-warn",
            error: "alert-error"
        };
        function display(header, message, autoHideTime, cssStyle, doNotOverWrite)
        {
            if (typeof autoHideTime === "undefined") { autoHideTime = 2800; }
            if (typeof cssStyle === "undefined") { cssStyle = Notify.levels.sucess; }
            if (typeof doNotOverWrite === "undefined") { doNotOverWrite = false; }
            if (!Notify.locked)
            {
                Notify.locked = doNotOverWrite;
                $("#notifaction").removeClass(Notify.levels.warn);
                $("#notifaction").removeClass(Notify.levels.error);
                $("#notifaction").removeClass(Notify.levels.sucess);
                $("#notifaction").addClass(cssStyle);
                $("#notifaction strong").empty();
                $("#notifaction strong").html(header);
                $("#notifaction p").empty();
                $("#notifaction p").html(message);
                $("#notifaction").animate({
                    top: (parseInt($("#notifaction").css("height"))) + "px"
                }, 400, function ()
                {
                    if (autoHideTime > 0)
                    {
                        setTimeout(hide, autoHideTime);
                    }
                });
            }
        }
        Notify.display = display;
        function hide(callback)
        {
            if (!Notify.locked)
            {
                $("#notifaction").animate({
                    top: (-parseInt($("#notifaction").css("height"))) - 100 + "px"
                }, 400, function ()
                {
                    Notify.locked = false;
                    if (callback != null)
                    {
                        callback();
                    }
                });
            }
        }
        Notify.hide = hide;
    })(Notify || (Notify = {}));
    var Utilies;
    (function (Utilies)
    {
        function copy(newObject, oldObject)
        {
            for (var member in oldObject)
            {
                if (typeof (oldObject[member]) == "object")
                {
                    try
                    {
                        newObject[member] = copy(newObject[member], oldObject[member]);
                    } catch (e)
                    {
                    }
                } else
                {
                    try
                    {
                        newObject[member] = oldObject[member];
                    } catch (e)
                    {
                    }
                }
            }
            return newObject;
        }
        Utilies.copy = copy;
        ;
        function sign(x)
        {
            return x > 0 ? 1 : x < 0 ? -1 : 0;
        }
        Utilies.sign = sign;
        function findByValue(needle, haystack, haystackProperity)
        {
            for (var i = 0; i < haystack.length; i++)
            {
                if (haystack[i][haystackProperity] === needle)
                {
                    return haystack[i];
                }
            }
            throw "Couldn't find object with proerpty " + haystackProperity + " equal to " + needle;
        }
        Utilies.findByValue = findByValue;
        function random(min, max)
        {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        Utilies.random = random;
        function pickRandom(collection)
        {
            return collection[random(0, collection.length - 1)];
        }
        Utilies.pickRandom = pickRandom;
        var pickUnqineCollection = [];
        function pickUnqine(collection, stringId)
        {
            if (pickUnqineCollection[stringId])
            {
                var items = pickUnqineCollection[stringId];
                if (items.length <= 0)
                {
                    Logger.error("Out of unqine items in collection " + stringId);
                    return;
                }
                var index = random(0, items.length - 1);
                var unqineItem = items[index];
                deleteFromCollection(items, index);
                return unqineItem;
            } else
            {
                pickUnqineCollection[stringId] = collection;
                return pickUnqine(collection, stringId);
            }
        }
        Utilies.pickUnqine = pickUnqine;
        function pickRandomSound(collection)
        {
            var sound = AssetManager.getSound(collection[random(0, collection.length - 1)]);
            if (!sound.play)
            {
                Logger.warn(" Somthing looks dogoy with the sound object " + sound);
            }
            return sound;
        }
        Utilies.pickRandomSound = pickRandomSound;
        function deleteFromCollection(collection, indexToRemove)
        {
            delete collection[indexToRemove];
            collection.splice(indexToRemove, 1);
        }
        Utilies.deleteFromCollection = deleteFromCollection;
        function isBetweenRange(value, rangeMax, rangeMin)
        {
            return value >= rangeMin && value <= rangeMax;
        }
        Utilies.isBetweenRange = isBetweenRange;
        function angleToVector(angle)
        {
            return new b2Vec2(Math.cos(angle), Math.sin(angle));
        }
        Utilies.angleToVector = angleToVector;
        function vectorToAngle(vector)
        {
            return Math.atan2(vector.y, vector.x);
        }
        Utilies.vectorToAngle = vectorToAngle;
        function toRadians(angleInDegrees)
        {
            return angleInDegrees * (Math.PI / 180);
        }
        Utilies.toRadians = toRadians;
        function toDegrees(angleInRdains)
        {
            return angleInRdains * (180 / Math.PI);
        }
        Utilies.toDegrees = toDegrees;
        function compress(s)
        {
            var dict = {
            };
            var data = (s + "").split("");
            var out = [];
            var currChar;
            var phrase = data[0];
            var code = 256;
            for (var i = 1; i < data.length; i++)
            {
                currChar = data[i];
                if (dict[phrase + currChar] != null)
                {
                    phrase += currChar;
                } else
                {
                    out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
                    dict[phrase + currChar] = code;
                    code++;
                    phrase = currChar;
                }
            }
            out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
            for (var i = 0; i < out.length; i++)
            {
                out[i] = String.fromCharCode(out[i]);
            }
            return out.join("");
        }
        Utilies.compress = compress;
        function decompress(s)
        {
            var dict = {
            };
            var data = (s + "").split("");
            var currChar = data[0];
            var oldPhrase = currChar;
            var out = [
                currChar
            ];
            var code = 256;
            var phrase;
            for (var i = 1; i < data.length; i++)
            {
                var currCode = data[i].charCodeAt(0);
                if (currCode < 256)
                {
                    phrase = data[i];
                } else
                {
                    phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
                }
                out.push(phrase);
                currChar = phrase.charAt(0);
                dict[code] = oldPhrase + currChar;
                code++;
                oldPhrase = phrase;
            }
            return out.join("");
        }
        Utilies.decompress = decompress;
        function isNumber(n)
        {
            return !isNaN(parseFloat(n)) && isFinite(n);
        }
        Utilies.isNumber = isNumber;
    })(Utilies || (Utilies = {}));
    var Logger;
    (function (Logger)
    {
        function log(message)
        {
            if (Settings.DEVELOPMENT_MODE || Settings.LOG)
            {
                console.info(message);
            }
        }
        Logger.log = log;
        function warn(message)
        {
            if (Settings.DEVELOPMENT_MODE || Settings.LOG)
            {
                console.warn(message);
            }
        }
        Logger.warn = warn;
        function debug(message)
        {
            if (Settings.DEVELOPMENT_MODE || Settings.LOG)
            {
                console.log(message);
            }
        }
        Logger.debug = debug;
        function error(message)
        {
            if (Settings.DEVELOPMENT_MODE || Settings.LOG)
            {
                console.error(message);
            }
        }
        Logger.error = error;
    })(Logger || (Logger = {}));
    var TouchUI;
    (function (TouchUI)
    {
        var isFireHeld = false;
        var isJumpPressed = false;
        function isTouchDevice()
        {
            return 'ontouchstart' in window || navigator.msMaxTouchPoints;
        }
        TouchUI.isTouchDevice = isTouchDevice;
        ;
        function init()
        {
            if (TouchUI.isTouchDevice())
            {
                var fireButtonCssId = "touchFireButton";
                var jumpButtonCssId = "touchJump";
                $('body').append("<div class=touchButton id=" + fireButtonCssId + ">Fire</div>");
                $('body').append("<div class=touchButton id=" + jumpButtonCssId + ">Jump</div>");
                $("#" + fireButtonCssId).bind('touchstart', function (e)
                {
                    e.preventDefault();
                    isFireHeld = true;
                    Logger.log("touchstarted");
                });
                $("#" + fireButtonCssId).bind("touchend", function (e)
                {
                    isFireHeld = false;
                    Logger.log("touchend");
                });
                $("#" + jumpButtonCssId).bind('touchstart', function (e)
                {
                    e.preventDefault();
                    isJumpPressed = true;
                });
                $("#" + jumpButtonCssId).bind("touchend", function (e)
                {
                    isJumpPressed = false;
                });
            }
        }
        TouchUI.init = init;
        function isFireButtonDown(reset)
        {
            if (typeof reset === "undefined") { reset = false; }
            if (isFireHeld && reset)
            {
                isFireHeld = false;
                return true;
            }
            return isFireHeld;
        }
        TouchUI.isFireButtonDown = isFireButtonDown;
        function isJumpDown(reset)
        {
            if (typeof reset === "undefined") { reset = false; }
            if (isJumpPressed && reset)
            {
                isJumpPressed = false;
                return true;
            }
            return isJumpPressed;
        }
        TouchUI.isJumpDown = isJumpDown;
    })(TouchUI || (TouchUI = {}));
    var keyboard;
    (function (keyboard)
    {
        keyboard.keys = [];
        (function ()
        {
            $(window).keydown(function (e)
            {
                keyboard.keys[e.which] = true;
            });
            $(window).keyup(function (e)
            {
                delete keyboard.keys[e.which];
            });
        })();
        function isKeyDown(keyCode, actLikeKeyPress)
        {
            if (typeof actLikeKeyPress === "undefined") { actLikeKeyPress = false; }
            for (var key in keyboard.keys)
            {
                if (key == keyCode)
                {
                    if (actLikeKeyPress)
                    {
                        delete keyboard.keys[key];
                    }
                    return true;
                }
            }
            return false;
        }
        keyboard.isKeyDown = isKeyDown;
        function getKeyName(keycode)
        {
            for (var i in keyboard.keyCodes)
            {
                if (keyboard.keyCodes[i] == keycode)
                {
                    return i;
                }
            }
        }
        keyboard.getKeyName = getKeyName;
        keyboard.keyCodes = {
            'Backspace': 8,
            'Tab': 9,
            'Enter': 13,
            'Shift': 16,
            'Ctrl': 17,
            'Alt': 18,
            'Pause': 19,
            'Capslock': 20,
            'Esc': 27,
            'Pageup': 33,
            'Space': 32,
            'Pagedown': 34,
            'End': 35,
            'Home': 36,
            'Leftarrow': 37,
            'Uparrow': 38,
            'Rightarrow': 39,
            'Downarrow': 40,
            'Insert': 45,
            'Delete': 46,
            '0': 48,
            '1': 49,
            '2': 50,
            '3': 51,
            '4': 52,
            '5': 53,
            '6': 54,
            '7': 55,
            '8': 56,
            '9': 57,
            'a': 65,
            'b': 66,
            'c': 67,
            'd': 68,
            'e': 101,
            'f': 70,
            'g': 71,
            'h': 72,
            'i': 73,
            'j': 74,
            'k': 75,
            'l': 76,
            'm': 77,
            'n': 78,
            'o': 79,
            'p': 80,
            'q': 81,
            'r': 82,
            's': 83,
            't': 84,
            'u': 85,
            'v': 86,
            'w': 87,
            'x': 88,
            'y': 89,
            'z': 90,
            'numpad0': 96,
            'numpad1': 97,
            'numpad2': 98,
            'numpad3': 99,
            'numpad4': 100,
            'numpad6': 102,
            'numpad7': 103,
            'numpad8': 104,
            'numpad9': 105,
            'Multiply': 106,
            'Plus': 107,
            'Minut': 109,
            'Dot': 110,
            'Slash1': 111,
            'F1': 112,
            'F2': 113,
            'F3': 114,
            'F4': 115,
            'F5': 116,
            'F6': 117,
            'F7': 118,
            'F8': 119,
            'F9': 120,
            'F10': 121,
            'F11': 122,
            'F12': 123,
            'equal': 187,
            'Coma': 188,
            'Slash': 191,
            'Backslash': 220
        };
    })(keyboard || (keyboard = {}));
    var Camera = (function ()
    {
        function Camera(levelWidth, levelHeight, vpWidth, vpHeight)
        {
            this.levelWidth = levelWidth;
            this.levelHeight = levelHeight;
            this.vpWidth = vpWidth;
            this.vpHeight = vpHeight;
            this.position = new b2Vec2(0, 0);
            this.panPosition = new b2Vec2(0, 0);
            this.panSpeed = 6.1;
            this.toPanOrNotToPan = false;
        }
        Camera.prototype.update = function ()
        {
            if (this.toPanOrNotToPan)
            {
                if (this.panPosition.x > this.position.x)
                {
                    this.incrementX(this.panSpeed);
                }
                if (this.panPosition.x < this.position.x)
                {
                    this.incrementX(-this.panSpeed);
                }
                if (this.panPosition.y > this.position.y)
                {
                    this.incrementY(this.panSpeed);
                }
                if (this.panPosition.y < this.position.y)
                {
                    this.incrementY(-this.panSpeed);
                }
            }
        };
        Camera.prototype.cancelPan = function ()
        {
            this.toPanOrNotToPan = false;
        };
        Camera.prototype.panToPosition = function (vector)
        {
            vector.x -= this.vpWidth / 2;
            vector.y -= this.vpHeight / 2;
            var currentPos = this.position.Copy();
            currentPos.Subtract(vector);
            var diff = currentPos.Length() / 25;
            this.panSpeed = diff;
            this.panPosition.x = vector.x;
            this.toPanOrNotToPan = true;
            this.panPosition.y = vector.y;
        };
        Camera.prototype.getX = function ()
        {
            return this.position.x;
        };
        Camera.prototype.getY = function ()
        {
            return this.position.y;
        };
        Camera.prototype.setX = function (x)
        {
            if (this.vpWidth + x <= this.levelWidth && x >= 0)
            {
                this.position.x = x;
                return true;
            }
            return false;
        };
        Camera.prototype.setY = function (y)
        {
            if (this.vpHeight + y <= this.levelHeight && y >= 0)
            {
                this.position.y = y;
                return true;
            }
            return false;
        };
        Camera.prototype.incrementX = function (x)
        {
            return this.setX(this.position.x + x);
        };
        Camera.prototype.incrementY = function (y)
        {
            return this.setY(this.position.y + y);
        };
        return Camera;
    })();
    var PreRenderer = (function ()
    {
        function PreRenderer() { }
        PreRenderer.prototype.createPreRenderCanvas = function (width, height)
        {
            var bufferCanvas = document.createElement('canvas');
            bufferCanvas.width = width;
            bufferCanvas.height = height;
            return bufferCanvas.getContext("2d");
        };
        PreRenderer.prototype.render = function (drawFunc, width, height, canvas)
        {
            if (typeof canvas === "undefined") { canvas = null; }
            width += 2;
            height += 2;
            var ctx;
            if (canvas)
            {
                ctx = canvas.getContext('2d');
            } else
            {
                ctx = this.createPreRenderCanvas(width, height);
                ctx.translate(1, 1);
            }
            drawFunc(ctx);
            return ctx.canvas;
        };
        PreRenderer.prototype.renderAnimation = function (drawFuncsCollection, width, height)
        {
            var ctx = this.createPreRenderCanvas(width, height);
            for (var i in drawFuncsCollection)
            {
                drawFuncsCollection[i].call(ctx);
                ctx.translate(0, height);
            }
            return ctx.canvas;
        };
        return PreRenderer;
    })();
    var Graphics;
    (function (Graphics)
    {
        Graphics.stats;
        Graphics.preRenderer = new PreRenderer();
        function init()
        {
            if (Settings.DEVELOPMENT_MODE)
            {
                Graphics.stats = new Stats();
                Graphics.stats.domElement.style.position = 'absolute';
                Graphics.stats.domElement.style.left = '0px';
                Graphics.stats.domElement.style.top = '0px';
                document.body.appendChild(Graphics.stats.domElement);
            }
            window.requestAnimationFrame = (function ()
            {
                return window.requestAnimationFrame || (window).webkitRequestAnimationFrame || (window).mozRequestAnimationFrame || (window).oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback, element)
                {
                    window.setTimeout(callback, 1000 / 60);
                    return true;
                };
            })();
        }
        Graphics.init = init;
        function roundRect(ctx, x, y, w, h, r)
        {
            if (w < 2 * r)
            {
                r = w / 2;
            }
            if (h < 2 * r)
            {
                r = h / 2;
            }
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.arcTo(x + w, y, x + w, y + h, r);
            ctx.arcTo(x + w, y + h, x, y + h, r);
            ctx.arcTo(x, y + h, x, y, r);
            ctx.arcTo(x, y, x + w, y, r);
            ctx.closePath();
            return ctx;
        }
        Graphics.roundRect = roundRect;
        function createCanvas(name)
        {
            var canvas = document.createElement('canvas');
            canvas.id = name;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            canvas.style.position = "absolute";
            canvas.style.left = "0px";
            canvas.style.top = "0px";
            window.document.body.appendChild(canvas);
            $('body').on('contextmenu', "#" + name, function (e)
            {
                return false;
            });
            return canvas;
        }
        Graphics.createCanvas = createCanvas;
    })(Graphics || (Graphics = {}));
    var __extends = this.__extends || function (d, b)
    {
        function __() { this.constructor = d; }
        __.prototype = b.prototype;
        d.prototype = new __();
    };
    var Sound = (function ()
    {
        function Sound(buffer)
        {
            this.buffer = buffer;
            this.playing = false;
            if (!this.buffer)
            {
                Logger.error("buffer null");
            }
        }
        Sound.prototype.play = function (volume, time, allowSoundOverLay)
        {
            try{
                if (typeof volume === "undefined") { volume = 1; }
                if (typeof time === "undefined") { time = 0; }
                if (typeof allowSoundOverLay === "undefined") { allowSoundOverLay = false; }
                var _this = this;
                if (Settings.SOUND && this.buffer != null)
                {
                    if (this.playing == false || allowSoundOverLay == true)
                    {
                        this.source = Sound.context.createBufferSource();
                        this.source.buffer = this.buffer;
                        var gainNode = Sound.context.createGainNode();
                        this.source.connect(gainNode);
                        gainNode.connect(Sound.context.destination);
                        gainNode.gain.value = volume;
                        this.source.noteOn(time);
                        this.playing = true;
                        var bufferLenght = this.buffer.duration;
                        setTimeout(function ()
                        {
                            _this.playing = false;
                        }, bufferLenght * 1000);
                    }
                } else
                {
                    Logger.debug("Sounds are currently disabled");
                }
            }catch(e){
                Logger.debug(e);
            }
        };
        Sound.prototype.isPlaying = function ()
        {
            return this.playing;
        };
        Sound.prototype.pause = function ()
        {
            if (Settings.SOUND && this.buffer != null)
            {
                this.source.noteOff(0);
            }
        };
        return Sound;
    })();
    var SoundFallback = (function (_super)
    {
        __extends(SoundFallback, _super);
        function SoundFallback(soundSrc)
        {
            _super.call(this, soundSrc);
            this.load(soundSrc);
        }
        SoundFallback.prototype.load = function (soundSrc)
        {
            var _this = this;
            this.audio = document.createElement("Audio");
            $(this.audio).on("loadeddata", function ()
            {
                AssetManager.numAssetsLoaded++;
                Logger.log(" Sound loaded " + _this.audio.src);
            });
            this.audio.onerror = function ()
            {
                Logger.error(" Sound failed to load " + _this.audio.src);
            };
            this.audio.src = soundSrc;
            $('body').append(this.audio);
        };
        SoundFallback.prototype.play = function (volume, time, allowSoundOverLay)
        {
            if (typeof volume === "undefined") { volume = 1; }
            if (typeof time === "undefined") { time = 0; }
            if (typeof allowSoundOverLay === "undefined") { allowSoundOverLay = false; }
            if (Settings.SOUND)
            {
                {
                    this.audio.volume = volume;
                    this.audio.play();
                    this.playing = true;
                }
            } else
            {
                Logger.debug("Sounds are currently disabled");
            }
        };
        SoundFallback.prototype.isPlaying = function ()
        {
            return this.playing;
        };
        SoundFallback.prototype.pause = function ()
        {
            if (Settings.SOUND)
            {
                this.audio.pause();
            }
        };
        return SoundFallback;
    })(Sound);
    var AssetManager;
    (function (AssetManager)
    {
        AssetManager.numAssetsLoaded = 0;
        var imagesToBeLoaded = [
            Settings.REMOTE_ASSERT_SERVER + "images/menu/stick.png"
        ];
        var audioToBeLoaded = [
            Settings.REMOTE_ASSERT_SERVER + "sounds/CursorSelect.wav",
            Settings.REMOTE_ASSERT_SERVER + "sounds/explosion1.wav",
            Settings.REMOTE_ASSERT_SERVER + "sounds/explosion2.wav",
            Settings.REMOTE_ASSERT_SERVER + "sounds/explosion3.wav",
            Settings.REMOTE_ASSERT_SERVER + "sounds/WalkExpand.wav",
            Settings.REMOTE_ASSERT_SERVER + "sounds/WalkCompress.wav",
            Settings.REMOTE_ASSERT_SERVER + "sounds/drill.wav",
            Settings.REMOTE_ASSERT_SERVER + "sounds/JUMP1.WAV",
            Settings.REMOTE_ASSERT_SERVER + "sounds/TIMERTICK.WAV",
            Settings.REMOTE_ASSERT_SERVER + "sounds/holygrenade.wav",
            Settings.REMOTE_ASSERT_SERVER + "sounds/Speech/Irish/hurry.wav",
            Settings.REMOTE_ASSERT_SERVER + "sounds/Speech/Irish/ohdear.wav",
            Settings.REMOTE_ASSERT_SERVER + "sounds/Speech/Irish/fire.wav",
            Settings.REMOTE_ASSERT_SERVER + "sounds/Speech/Irish/victory.wav",
            Settings.REMOTE_ASSERT_SERVER + "sounds/Speech/Irish/ow1.wav",
            Settings.REMOTE_ASSERT_SERVER + "sounds/Speech/Irish/ow2.wav",
            Settings.REMOTE_ASSERT_SERVER + "sounds/Speech/Irish/ow3.wav",
            Settings.REMOTE_ASSERT_SERVER + "sounds/Speech/Irish/byebye.wav",
            Settings.REMOTE_ASSERT_SERVER + "sounds/Speech/Irish/traitor.wav",
            Settings.REMOTE_ASSERT_SERVER + "sounds/Speech/Irish/youllregretthat.wav",
            Settings.REMOTE_ASSERT_SERVER + "sounds/Speech/Irish/justyouwait.wav",
            Settings.REMOTE_ASSERT_SERVER + "sounds/Speech/Irish/watchthis.wav",
            Settings.REMOTE_ASSERT_SERVER + "sounds/Speech/Irish/fatality.wav",
            Settings.REMOTE_ASSERT_SERVER + "sounds/Speech/Irish/laugh.wav",
            Settings.REMOTE_ASSERT_SERVER + "sounds/Speech/Irish/incoming.wav",
            Settings.REMOTE_ASSERT_SERVER + "sounds/Speech/Irish/grenade.wav",
            Settings.REMOTE_ASSERT_SERVER + "sounds/Speech/Irish/yessir.wav",
            Settings.REMOTE_ASSERT_SERVER + "sounds/cantclickhere.wav",
            Settings.REMOTE_ASSERT_SERVER + "sounds/StartRound.wav",
            Settings.REMOTE_ASSERT_SERVER + "sounds/JetPackLoop1.wav",
            Settings.REMOTE_ASSERT_SERVER + "sounds/JetPackLoop2.wav",
            Settings.REMOTE_ASSERT_SERVER + "sounds/fuse.wav",
            Settings.REMOTE_ASSERT_SERVER + "sounds/fanfare/Ireland.wav",
            Settings.REMOTE_ASSERT_SERVER + "sounds/NinjaRopeFire.wav",
            Settings.REMOTE_ASSERT_SERVER + "sounds/NinjaRopeImpact.wav",
            Settings.REMOTE_ASSERT_SERVER + "sounds/ROCKETPOWERUP.wav",
            Settings.REMOTE_ASSERT_SERVER + "sounds/HOLYGRENADEIMPACT.wav",
            Settings.REMOTE_ASSERT_SERVER + "sounds/GRENADEIMPACT.wav",
            Settings.REMOTE_ASSERT_SERVER + "sounds/WormLanding.wav",
            Settings.REMOTE_ASSERT_SERVER + "sounds/THROWPOWERUP.wav",
            Settings.REMOTE_ASSERT_SERVER + "sounds/THROWRELEASE.wav",
            Settings.REMOTE_ASSERT_SERVER + "sounds/SHOTGUNRELOAD.wav",
            Settings.REMOTE_ASSERT_SERVER + "sounds/ShotGunFire.wav",
            Settings.REMOTE_ASSERT_SERVER + "sounds/MiniGunFire.wav"
        ];
        AssetManager.images = [];
        AssetManager.sounds = [];
        function isReady()
        {
            return (AssetManager.numAssetsLoaded) == imagesToBeLoaded.length + audioToBeLoaded.length;
        }
        AssetManager.isReady = isReady;
        function getPerAssetsLoaded()
        {
            return ((AssetManager.numAssetsLoaded) / (imagesToBeLoaded.length + audioToBeLoaded.length)) * 100;
        }
        AssetManager.getPerAssetsLoaded = getPerAssetsLoaded;
        function getImage(s)
        {
            return AssetManager.images[s];
        }
        AssetManager.getImage = getImage;
        function getSound(s)
        {
            if (AssetManager.sounds[s] == null)
            {
                return new Sound(null);
            }
            return AssetManager.sounds[s];
        }
        AssetManager.getSound = getSound;
        function loadImages(sources)
        {
            var images = [];
            var loadedImages = 0;
            var numImages = 0;
            for (var src in sources)
            {
                numImages++;
            }
            for (var src in sources)
            {
                var name = sources[src].match("[a-z,A-Z,0-9]+[.]png")[0].replace(".png", "");
                if (images[name] == null)
                {
                    images[name] = new Image();
                    if (Settings.BUILD_MANIFEST_FILE)
                    {
                        $('body').append(images[name]);
                    }
                    images[name].onload = function ()
                    {
                        Logger.log(" Image " + this.src + " loaded sucessfully ");
                        if (++loadedImages >= numImages)
                        {
                            for (var img in images)
                            {
                                AssetManager.images[img] = images[img];
                            }
                        }
                        AssetManager.numAssetsLoaded++;
                    };
                } else
                {
                    Logger.error("Image " + sources[src] + " has the same name as" + images[name].src);
                }
                images[name].src = sources[src];
            }
        }
        AssetManager.loadImages = loadImages;
        function addSpritesDefToLoadList()
        {
            for (var sprite in Sprites.worms)
            {
                imagesToBeLoaded.push(Settings.REMOTE_ASSERT_SERVER + "images/" + Sprites.worms[sprite].imageName + ".png");
            }
            for (var sprite in Sprites.weaponIcons)
            {
                imagesToBeLoaded.push(Settings.REMOTE_ASSERT_SERVER + "images/weaponicons/" + Sprites.weaponIcons[sprite].imageName + ".png");
            }
            for (var sprite in Sprites.weapons)
            {
                imagesToBeLoaded.push(Settings.REMOTE_ASSERT_SERVER + "images/" + Sprites.weapons[sprite].imageName + ".png");
            }
            for (var sprite in Sprites.particleEffects)
            {
                imagesToBeLoaded.push(Settings.REMOTE_ASSERT_SERVER + "images/" + Sprites.particleEffects[sprite].imageName + ".png");
            }
            for (var map in Maps)
            {
                imagesToBeLoaded.push(Settings.REMOTE_ASSERT_SERVER + "images/levels/" + Maps[map].terrainImage + ".png");
                imagesToBeLoaded.push(Settings.REMOTE_ASSERT_SERVER + "images/levels/" + Maps[map].smallImage + ".png");
            }
        }
        AssetManager.addSpritesDefToLoadList = addSpritesDefToLoadList;
        function loadAssets()
        {
            addSpritesDefToLoadList();
            loadImages(imagesToBeLoaded);
            loadSounds(audioToBeLoaded);
        }
        AssetManager.loadAssets = loadAssets;
        function loadSounds(sources)
        {
            try
            {
                if (Settings.BUILD_MANIFEST_FILE)
                {
                    throw "LOL";
                }
                Sound.context = new webkitAudioContext();
                var bufferLoader = new BufferLoader(Sound.context, sources, function (bufferList)
                {
                    for (var i = 0; i < bufferList.length; i++)
                    {
                        AssetManager.sounds[bufferList[i].name] = new Sound(bufferList[i].buffer);
                        AssetManager.numAssetsLoaded++;
                    }
                });
                bufferLoader.load();
            } catch (e)
            {
                console.log('Web Audio API is not supported in this browser');
                try
                {
                    var testForAudio = new Audio();
                    for (var src in sources)
                    {
                        var name = sources[src].match("[a-z,A-Z,0-9]+[.]")[0].replace(".", "");
                        if ($.browser.msie)
                        {
                            sources[src] = sources[src].replace(".wav", ".mp3");
                            sources[src] = sources[src].replace(".WAV", ".mp3");
                        }
                        if ($.browser.msie && parseInt(src) >= 40)
                        {
                            AssetManager.numAssetsLoaded += sources.length - parseInt(src);
                            break;
                        }
                        AssetManager.sounds[name] = new SoundFallback(sources[src]);
                    }
                } catch (e)
                {
                    alert("The browser or device your using doesn't seem to like any type of HTML5 audio, sorry");
                    AssetManager.numAssetsLoaded += sources.length;
                }
            }
        }
        AssetManager.loadSounds = loadSounds;
    })(AssetManager || (AssetManager = {}));
    var TerrainBoundary = (function ()
    {
        function TerrainBoundary(worldWidth, worldHeight)
        {
            this.worldWidth = worldWidth;
            this.worldHeight = worldHeight;
            var topPositionY = Physics.pixelToMeters(worldHeight / 5);
            var sidesPositionX = Physics.pixelToMeters(worldWidth / 5);
            var fixDef = new b2FixtureDef();
            fixDef.density = 1.0;
            fixDef.friction = 1.0;
            fixDef.restitution = 0.0;
            fixDef.shape = new b2PolygonShape();
            fixDef.shape.SetAsBox(Physics.pixelToMeters(worldWidth) + sidesPositionX * 2, 0.5);
            var bodyDef = new b2BodyDef();
            bodyDef.type = b2Body.b2_staticBody;
            bodyDef.position.x = -sidesPositionX;
            bodyDef.position.y = Physics.pixelToMeters(worldHeight);
            var bottom = Physics.world.CreateBody(bodyDef).CreateFixture(fixDef).GetBody();
            bottom.SetUserData(this);
            bodyDef.position.x = -sidesPositionX;
            bodyDef.position.y = -topPositionY;
            fixDef.shape.SetAsBox(Physics.pixelToMeters(worldWidth) + sidesPositionX * 2, 0.5);
            var body = Physics.world.CreateBody(bodyDef).CreateFixture(fixDef).GetBody();
            body.SetUserData(null);
            bodyDef.position.x = -sidesPositionX;
            bodyDef.position.y = -topPositionY;
            fixDef.shape.SetAsBox(0.5, Physics.pixelToMeters(worldHeight) + topPositionY);
            body = Physics.world.CreateBody(bodyDef).CreateFixture(fixDef).GetBody();
            bodyDef.position.x = Physics.pixelToMeters(worldWidth) + sidesPositionX;
            bodyDef.position.y = -topPositionY;
            fixDef.shape.SetAsBox(0.5, Physics.pixelToMeters(worldHeight) + topPositionY);
            body = Physics.world.CreateBody(bodyDef).CreateFixture(fixDef).GetBody();
        }
        TerrainBoundary.prototype.beginContact = function (contact)
        {
            var obj1 = contact.GetFixtureA().GetBody().GetUserData();
            var obj2 = contact.GetFixtureB().GetBody().GetUserData();
            if (obj1 instanceof Worm)
            {
                obj1.hit(obj1.getHealth());
            } else if (obj2 instanceof Worm)
            {
                obj2.hit(obj2.getHealth());
            }
        };
        return TerrainBoundary;
    })();
    var Sprites;
    (function (Sprites)
    {
        Sprites.weaponIcons = {
            holyGernade: {
                imageName: "iconhgrenade"
            },
            gernade: {
                imageName: "icongrenade"
            },
            drill: {
                imageName: "drill"
            },
            dynamite: {
                imageName: "icondynamite"
            },
            ninjaRope: {
                imageName: "iconrope"
            },
            jetPack: {
                imageName: "iconjetpack"
            },
            shotgun: {
                imageName: "iconshotgun"
            },
            minigun: {
                imageName: "iconminigun"
            },
            bazooka: {
                imageName: "iconbazooka"
            }
        };
        Sprites.weapons = {
            jetPackFlamesDown: {
                imageName: "wjetflmd",
                frameY: 0,
                frameCount: 6,
                msPerFrame: 100
            },
            jetPackFlamesSide: {
                imageName: "wjetflmb",
                frameY: 0,
                frameCount: 6,
                msPerFrame: 60
            },
            holyGernade: {
                imageName: "hgrenade",
                frameY: 0,
                frameCount: 32,
                msPerFrame: 10
            },
            missle: {
                imageName: "missile",
                frameY: 9,
                frameCount: 32,
                msPerFrame: 10
            },
            gernade: {
                imageName: "grenade",
                frameY: 0,
                frameCount: 32,
                msPerFrame: 10
            },
            dynamite: {
                imageName: "dynamite",
                frameY: 0,
                frameCount: 129,
                msPerFrame: 50
            },
            redTarget: {
                imageName: "crshairr",
                frameY: 0,
                frameCount: 32,
                msPerFrame: 50
            },
            arrow: {
                imageName: "arrowdnb",
                frameY: 0,
                frameCount: 30,
                msPerFrame: 10
            },
            ninjaRopeTip: {
                imageName: "ropecuff",
                frameY: 0,
                frameCount: 112,
                msPerFrame: 10
            }
        };
        Sprites.worms = {
            idle1: {
                imageName: "wselbak",
                frameY: 0,
                frameCount: 12,
                msPerFrame: 200
            },
            drilling: {
                imageName: "wdrill",
                frameY: 0,
                frameCount: 4,
                msPerFrame: 100
            },
            walking: {
                imageName: "wwalk",
                frameY: 0,
                frameCount: 15,
                msPerFrame: 50
            },
            falling: {
                imageName: "wfall",
                frameY: 0,
                frameCount: 2,
                msPerFrame: 100
            },
            jumpBegin: {
                imageName: "wflyup",
                frameY: 0,
                frameCount: 2,
                msPerFrame: 100
            },
            takeOutHolyGernade: {
                imageName: "whgrlnk",
                frameY: 0,
                frameCount: 10,
                msPerFrame: 50
            },
            takeOutDynamite: {
                imageName: "wdynlnk",
                frameY: 0,
                frameCount: 10,
                msPerFrame: 50
            },
            aimHolyGernade: {
                imageName: "wthrhgr",
                frameY: 30 / 2,
                frameCount: 32,
                msPerFrame: 100
            },
            takeOutDrill: {
                imageName: "wdrllnk",
                frameY: 0,
                frameCount: 13,
                msPerFrame: 60
            },
            die: {
                imageName: "wdie",
                frameY: 0,
                frameCount: 60,
                msPerFrame: 5
            },
            weWon: {
                imageName: "wwinner",
                frameY: 0,
                frameCount: 14,
                msPerFrame: 25
            },
            hurt: {
                imageName: "wbrth2",
                frameY: 0,
                frameCount: 13,
                msPerFrame: 150
            },
            takeOutGernade: {
                imageName: "wgrnlnk",
                frameY: 0,
                frameCount: 10,
                msPerFrame: 50
            },
            takeNinjaRope: {
                imageName: "wbatlnk",
                frameY: 0,
                frameCount: 10,
                msPerFrame: 50
            },
            aimNinjaRope: {
                imageName: "wbataim",
                frameY: 32 / 2,
                frameCount: 32,
                msPerFrame: 50
            },
            aimGernade: {
                imageName: "wthrgrn",
                frameY: 30 / 2,
                frameCount: 32,
                msPerFrame: 100
            },
            takeOutJetPack: {
                imageName: "wjetlnk",
                frameY: 0,
                frameCount: 10,
                msPerFrame: 50
            },
            defualtJetPack: {
                imageName: "wjetbak",
                frameY: 0,
                frameCount: 10,
                msPerFrame: 50
            },
            aimingShotgun: {
                imageName: "wshotp",
                frameY: 32 / 2,
                frameCount: 32,
                msPerFrame: 50
            },
            shotgunTakeOut: {
                imageName: "wshglnk",
                frameY: 0,
                frameCount: 10,
                msPerFrame: 60
            },
            shotgunFireAnimation1: {
                imageName: "wshotf",
                frameY: 0,
                frameCount: 32,
                msPerFrame: 60
            },
            shotgunFirePump: {
                imageName: "wshotg",
                frameY: 0,
                frameCount: 32,
                msPerFrame: 60
            },
            minigunAim: {
                imageName: "wmini",
                frameY: 32 / 2,
                frameCount: 32,
                msPerFrame: 60
            },
            minigunFire: {
                imageName: "wminif",
                frameY: 0,
                frameCount: 32,
                msPerFrame: 60
            },
            minigunTakeOut: {
                imageName: "wmgnlnk",
                frameY: 0,
                frameCount: 10,
                msPerFrame: 60
            },
            takeOutBazooka: {
                imageName: "wbazlnk",
                frameY: 0,
                frameCount: 7,
                msPerFrame: 60
            },
            aimBazooka: {
                imageName: "wbaz",
                frameY: 32 / 2,
                frameCount: 32,
                msPerFrame: 60
            },
            wbackflp: {
                imageName: "wbackflp",
                frameY: 0,
                frameCount: 22,
                msPerFrame: 50
            }
        };
        Sprites.particleEffects = {
            eclipse: {
                imageName: "elipse75",
                frameY: 0,
                frameCount: 10,
                msPerFrame: 20
            },
            cirlce1: {
                imageName: "circl100",
                frameY: 0,
                frameCount: 4,
                msPerFrame: 20
            },
            wordBiff: {
                imageName: "exbiff",
                frameY: 0,
                frameCount: 12,
                msPerFrame: 20
            },
            flame1: {
                imageName: "flame1",
                frameY: 0,
                frameCount: 32,
                msPerFrame: 50
            },
            smoke75: {
                imageName: "smklt75",
                frameY: 0,
                frameCount: 28,
                msPerFrame: 50
            },
            wave: {
                imageName: "water3",
                frameY: 0,
                frameCount: 12,
                msPerFrame: 50
            },
            blob: {
                imageName: "blob",
                frameY: 0,
                frameCount: 16,
                msPerFrame: 50
            },
            clouds: {
                imageName: "clouds",
                frameY: 0,
                frameCount: 20,
                msPerFrame: 60
            },
            cloudm: {
                imageName: "cloudm",
                frameY: 0,
                frameCount: 20,
                msPerFrame: 60
            },
            cloudl: {
                imageName: "cloudl",
                frameY: 0,
                frameCount: 20,
                msPerFrame: 20
            },
            grave1: {
                imageName: "grave1",
                frameY: 0,
                frameCount: 20,
                msPerFrame: 20
            },
            grave2: {
                imageName: "grave2",
                frameY: 0,
                frameCount: 20,
                msPerFrame: 20
            },
            grave3: {
                imageName: "grave3",
                frameY: 0,
                frameCount: 20,
                msPerFrame: 20
            },
            grave4: {
                imageName: "grave4",
                frameY: 0,
                frameCount: 20,
                msPerFrame: 20
            },
            grave5: {
                imageName: "grave5",
                frameY: 0,
                frameCount: 20,
                msPerFrame: 20
            },
            grave6: {
                imageName: "grave6",
                frameY: 0,
                frameCount: 20,
                msPerFrame: 20
            }
        };
    })(Sprites || (Sprites = {}));
    var Sprite = (function ()
    {
        function Sprite(spriteDef, noLoop)
        {
            if (typeof noLoop === "undefined") { noLoop = false; }
            this.frameIncremeter = 1;
            this.lastUpdateTime = 0;
            this.accumulateDelta = 0;
            this.isSpriteLocked = false;
            this.setSpriteDef(spriteDef);
            this.noLoop = noLoop;
        }
        Sprite.prototype.update = function ()
        {
            if (this.finished == false)
            {
                var delta = Date.now() - this.lastUpdateTime;
                if (this.accumulateDelta > this.spriteDef.msPerFrame)
                {
                    this.accumulateDelta = 0;
                    this.currentFrameY += this.frameIncremeter;
                    if (this.currentFrameY >= this.spriteDef.frameCount)
                    {
                        if (this.noLoop)
                        {
                            this.finished = true;
                            if (this.onFinishFunc != null)
                            {
                                this.onFinishFunc();
                                this.onFinishFunc = null;
                                return;
                            }
                        }
                        this.currentFrameY = this.spriteDef.frameY;
                    }
                } else
                {
                    this.accumulateDelta += delta;
                }
                this.lastUpdateTime = Date.now();
            }
        };
        Sprite.prototype.drawOnCenter = function (ctx, x, y, spriteToCenterOn)
        {
            if (this.finished == false)
            {
                ctx.save();
                ctx.translate((spriteToCenterOn.getImage().width - this.getImage().width) / 2, (spriteToCenterOn.getFrameHeight() - this.getFrameHeight()) / 2);
                this.draw(ctx, x, y);
                ctx.restore();
            }
        };
        Sprite.prototype.draw = function (ctx, x, y)
        {
            var tmpCurrentFrameY = Math.floor(this.currentFrameY);
            if (tmpCurrentFrameY >= 0)
            {
                ctx.drawImage(this.image, 0, tmpCurrentFrameY * this.frameHeight, this.image.width, this.frameHeight, Math.floor(x), Math.floor(y), this.image.width, this.frameHeight);
            }
        };
        Sprite.prototype.getImage = function ()
        {
            return this.image;
        };
        Sprite.prototype.getCurrentFrame = function ()
        {
            return this.currentFrameY;
        };
        Sprite.prototype.setCurrentFrame = function (frame)
        {
            if (frame >= 0 && frame < this.spriteDef.frameCount)
            {
                this.currentFrameY = frame;
            }
        };
        Sprite.prototype.setNoLoop = function (val)
        {
            this.noLoop = val;
        };
        Sprite.prototype.getFrameHeight = function ()
        {
            return this.frameHeight;
        };
        Sprite.prototype.getFrameWidth = function ()
        {
            return this.image.width;
        };
        Sprite.prototype.getTotalFrames = function ()
        {
            return this.spriteDef.frameCount;
        };
        Sprite.prototype.onAnimationFinish = function (func)
        {
            if (this.isSpriteLocked == false)
            {
                this.onFinishFunc = func;
            }
        };
        Sprite.prototype.setSpriteDef = function (spriteDef, lockSprite, noLoop)
        {
            if (typeof lockSprite === "undefined") { lockSprite = false; }
            if (typeof noLoop === "undefined") { noLoop = false; }
            if (spriteDef != this.spriteDef)
            {
                if (this.isSpriteLocked == false)
                {
                    this.noLoop = noLoop;
                    this.finished = false;
                    this.spriteDef = spriteDef;
                    this.currentFrameY = spriteDef.frameY;
                    this.isSpriteLocked = lockSprite;
                    this.image = AssetManager.getImage(spriteDef.imageName);
                    this.frameHeight = this.image.height / spriteDef.frameCount;
                }
            }
            if (this.spriteDef == spriteDef)
            {
                this.isSpriteLocked = lockSprite;
            }
        };
        Sprite.prototype.swapSpriteSheet = function (spriteSheet)
        {
            var currentFrame = this.getCurrentFrame();
            this.setSpriteDef(spriteSheet);
            this.setCurrentFrame(currentFrame);
            this.finished = true;
        };
        return Sprite;
    })();
    var Waves = (function ()
    {
        function Waves()
        {
            this.wave = new Sprite(Sprites.particleEffects.wave);
            var wave2 = Sprites.particleEffects.wave;
            wave2.frameY = 2;
            this.wave2 = new Sprite(wave2);
        }
        Waves.prototype.update = function ()
        {
            this.wave.update();
            this.wave2.update();
        };
        Waves.prototype.drawBackgroundWaves = function (ctx, x, y, w)
        {
            y -= 35;
            ctx.fillRect(x, y, w, 400);
            var waveY = y - this.wave.getFrameHeight() * 0.5;
            for (var i = 0; i < w; i += this.wave.getFrameWidth())
            {
                this.wave.draw(ctx, i, waveY);
            }
        };
        Waves.prototype.draw = function (ctx, x, y, w)
        {
            var waveY = y - this.wave.getFrameHeight() * 0.5;
            for (var i = 0; i < w; i += this.wave.getFrameWidth())
            {
                this.wave2.draw(ctx, i - 1, waveY);
            }
            waveY = y + this.wave.getFrameHeight() * 0.5;
            for (var i = 0; i < w; i += this.wave.getFrameWidth())
            {
                this.wave.draw(ctx, i - 1, waveY);
            }
        };
        return Waves;
    })();
    var Terrain = (function ()
    {
        function Terrain(canvas, terrainImage, world, scale)
        {
            this.deformTerrainBatchList = [];
            this.world = world;
            this.scale = scale;
            this.Offset = new b2Vec2(2300, 1300);
            this.drawingCanvas = canvas;
            this.drawingCanvasContext = this.drawingCanvas.getContext("2d");
            this.TERRAIN_RECT_HEIGHT = 5;
            this.bufferCanvas = document.createElement('canvas');
            this.bufferCanvas.width = this.Offset.x + (terrainImage.width * 1.5);
            this.bufferCanvas.height = this.Offset.y + (terrainImage.height * 1.5);
            this.boundary = new TerrainBoundary(this.bufferCanvas.width + this.Offset.x, this.bufferCanvas.height + 100);
            this.bufferCanvasContext = this.bufferCanvas.getContext('2d');
            this.bufferCanvasContext.fillStyle = 'rgba(0,0,0,255)';
            this.bufferCanvasContext.drawImage(terrainImage, this.Offset.x, this.Offset.y, this.bufferCanvas.width - this.Offset.x, this.bufferCanvas.height - this.Offset.y);
            this.terrainData = this.bufferCanvasContext.getImageData(this.Offset.x, this.Offset.y, this.bufferCanvas.width - this.Offset.x, this.bufferCanvas.height - this.Offset.y);
            this.createTerrainPhysics(0, 0, this.bufferCanvas.width - this.Offset.x, this.bufferCanvas.height - this.Offset.y, this.terrainData.data, world, scale);
            this.bufferCanvasContext.globalCompositeOperation = "destination-out";
            this.wave = new Waves();
        }
        Terrain.prototype.getWidth = function ()
        {
            return this.boundary.worldWidth;
        };
        Terrain.prototype.getHeight = function ()
        {
            return this.boundary.worldHeight;
        };
        Terrain.prototype.createTerrainPhysics = function (x, y, width, height, data, world, worldScale)
        {
            var _this = this;
            x = Math.floor(x);
            y = Math.floor(y);
            width = width * 4;
            height = height;
            var theAlphaByte = 3;
            var rectWidth = 0;
            var rectheight = this.TERRAIN_RECT_HEIGHT;
            var fixDef = new b2FixtureDef();
            fixDef.density = 1.0;
            fixDef.friction = 1.0;
            fixDef.restitution = 0.0;
            fixDef.shape = new b2PolygonShape();
            var bodyDef = new b2BodyDef();
            bodyDef.type = b2Body.b2_staticBody;
            var bodiesCreated = 0;
            var makeBlock = function ()
            {
                fixDef.shape.SetAsBox((rectWidth / worldScale) / 2, (rectheight / worldScale) / 2);
                bodyDef.position.x = ((xPos / 4) - (rectWidth / 2)) / worldScale;
                bodyDef.position.y = ((yPos - rectheight) / worldScale);
                var offset = Physics.vectorPixelToMeters(_this.Offset);
                bodyDef.position.x += offset.x;
                bodyDef.position.y += offset.y;
                var b = world.CreateBody(bodyDef).CreateFixture(fixDef).GetBody();
                b.SetUserData(_this);
            };
            for (var yPos = y; yPos <= height; yPos += rectheight)
            {
                rectWidth = 0;
                for (var xPos = x; xPos <= width; xPos += 4)
                {
                    if (data[xPos + (yPos * width) + theAlphaByte] == 255)
                    {
                        rectWidth++;
                        if (rectWidth >= this.drawingCanvas.width)
                        {
                            makeBlock();
                            rectWidth = 0;
                        }
                    } else if (rectWidth > 1)
                    {
                        makeBlock();
                        bodiesCreated++;
                        rectWidth = 0;
                    }
                }
            }
            Logger.log("Current body count " + bodiesCreated);
        };
        Terrain.prototype.addToDeformBatch = function (x, y, r)
        {
            this.deformTerrainBatchList.push({
                xPos: x,
                yPos: y,
                radius: r
            });
        };
        Terrain.prototype.addRectToDeformBatch = function (x, y, w, h)
        {
            this.deformTerrainBatchList.push({
                xPos: x,
                yPos: y,
                radius: h,
                width: w
            });
        };
        Terrain.prototype.deformRegionBatch = function ()
        {
            var _this = this;
            var lenghtCache = this.deformTerrainBatchList.length;
            var angle = Math.PI * 2;
            this.bufferCanvasContext.beginPath();
            for (var i = 0; i < lenghtCache; i++)
            {
                var tmp = this.deformTerrainBatchList[i];
                if (tmp.width)
                {
                    this.bufferCanvasContext.fillRect(tmp.xPos - tmp.width / 2, tmp.yPos, tmp.width, tmp.radius);
                } else
                {
                    this.bufferCanvasContext.arc(tmp.xPos, tmp.yPos, tmp.radius, angle, 0, true);
                }
            }
            this.bufferCanvasContext.closePath();
            this.bufferCanvasContext.fill();
            this.terrainData = this.bufferCanvasContext.getImageData(this.Offset.x, this.Offset.y, this.bufferCanvas.width, this.bufferCanvas.height);
            for (var i = 0; i < lenghtCache; i++)
            {
                var tmp = this.deformTerrainBatchList[i];
                var normalizedRadis = Math.floor(tmp.radius / this.TERRAIN_RECT_HEIGHT) * this.TERRAIN_RECT_HEIGHT;
                var y = Math.floor(tmp.yPos / this.TERRAIN_RECT_HEIGHT) * this.TERRAIN_RECT_HEIGHT;
                var aabb = new b2AABB();
                aabb.lowerBound.Set(0, Physics.pixelToMeters(y - normalizedRadis));
                aabb.upperBound.Set(Physics.pixelToMeters(this.bufferCanvas.width), Physics.pixelToMeters(y + normalizedRadis));
                Physics.world.QueryAABB(function (fixture)
                {
                    if (fixture.GetBody().GetType() == b2Body.b2_staticBody && fixture.GetBody().GetUserData() instanceof Terrain)
                    {
                        _this.world.DestroyBody(fixture.GetBody());
                    }
                    return true;
                }, aabb);
                this.createTerrainPhysics(0, Physics.metersToPixels(aabb.lowerBound.y) - this.Offset.y, this.bufferCanvas.width, Physics.metersToPixels(aabb.upperBound.y) + (this.TERRAIN_RECT_HEIGHT * 2) - this.Offset.y, this.terrainData.data, this.world, this.scale);
            }
            this.deformTerrainBatchList = [];
        };
        Terrain.prototype.update = function ()
        {
            if (this.deformTerrainBatchList.length > 0)
            {
                this.deformRegionBatch();
            }
            this.wave.update();
        };
        Terrain.prototype.draw = function (ctx)
        {
            var y = GameInstance.camera.getY();
            var x = GameInstance.camera.getX();
            var w = this.drawingCanvas.width;
            var h = this.drawingCanvas.height;
            if (y + this.drawingCanvas.height > this.bufferCanvas.height)
            {
                var diff = (y + this.drawingCanvas.height) - this.bufferCanvas.height;
                h -= diff;
            }
            if (x + this.drawingCanvas.width > this.bufferCanvas.width)
            {
                var diff = (x + this.drawingCanvas.width) - this.bufferCanvas.width;
                w -= diff;
            }
            ctx.drawImage(this.bufferCanvas, x, y, w, h, 0, -5, w, h);
        };
        return Terrain;
    })();
    var Timer = (function ()
    {
        function Timer(timePeriod)
        {
            this.delta = 0;
            this.timePeriod = timePeriod;
            this.timeSinceLastUpdate = this.getTimeNow();
            this.isTimerPaused = false;
            this.accumulatedTime = 0;
        }
        Timer.prototype.pause = function ()
        {
            this.isTimerPaused = true;
        };
        Timer.prototype.hasTimePeriodPassed = function (rest)
        {
            if (typeof rest === "undefined") { rest = true; }
            if (this.delta > this.timePeriod)
            {
                if (rest)
                {
                    this.delta = 0;
                }
                return true;
            } else
            {
                return false;
            }
        };
        Timer.prototype.reset = function ()
        {
            this.delta = 0;
            this.timeSinceLastUpdate = this.getTimeNow();
            this.isTimerPaused = false;
            this.accumulatedTime = 0;
        };
        Timer.prototype.getAccumulatedTime = function ()
        {
            return this.accumulatedTime;
        };
        Timer.prototype.getTimeLeft = function ()
        {
            return this.timePeriod - this.delta;
        };
        Timer.prototype.getTimeLeftInSec = function ()
        {
            return (this.timePeriod - this.delta) / 60;
        };
        Timer.prototype.getTimeNow = function ()
        {
            return Date.now();
        };
        Timer.prototype.update = function ()
        {
            if (this.isTimerPaused == false)
            {
                this.delta += this.getTimeNow() - this.timeSinceLastUpdate;
                this.timeSinceLastUpdate = this.getTimeNow();
                this.accumulatedTime += this.delta;
            }
        };
        return Timer;
    })();
    var ToostMessage = (function ()
    {
        function ToostMessage(pos, message, color, time, speed)
        {
            if (typeof time === "undefined") { time = 2700; }
            if (typeof speed === "undefined") { speed = 0.7; }
            this.finished = false;
            this.color = color;
            this.pos = pos;
            this.message = message;
            this.speed = speed;
            if (Utilies.isNumber(this.message))
            {
                this.message = Math.floor(this.message);
                this.box = this.preRenderNumberBox();
            } else
            {
                this.box = this.preRenderMessageBox();
            }
            this.pos.x -= this.box.width / 2;
            this.pos.y -= this.box.height * 2;
            this.timer = new Timer(time);
        }
        ToostMessage.prototype.preRenderNumberBox = function ()
        {
            var healthBoxWidth = 39;
            var healthBoxHeight = 18;
            return Graphics.preRenderer.render(function (ctx)
            {
                ctx.fillStyle = '#1A1110';
                ctx.strokeStyle = "#eee";
                Graphics.roundRect(ctx, 0, 0, healthBoxWidth, healthBoxHeight, 4).fill();
                Graphics.roundRect(ctx, 0, 0, healthBoxWidth, healthBoxHeight, 4).stroke();
            }, 39, 20);
        };
        ToostMessage.prototype.preRenderMessageBox = function ()
        {
            var _this = this;
            var nameBoxWidth = this.message.length * 10;
            return Graphics.preRenderer.render(function (ctx)
            {
                ctx.fillStyle = '#1A1110';
                ctx.strokeStyle = "#eee";
                ctx.font = 'bold 16.5px Sans-Serif';
                ctx.textAlign = 'center';
                Graphics.roundRect(ctx, 0, 0, nameBoxWidth, 20, 4).fill();
                Graphics.roundRect(ctx, 0, 0, nameBoxWidth, 20, 4).stroke();
                ctx.fillStyle = _this.color;
                ctx.fillText(_this.message, (_this.message.length * 10) / 2, 15);
            }, nameBoxWidth, 20);
        };
        ToostMessage.prototype.draw = function (ctx)
        {
            ctx.drawImage(this.box, this.pos.x, this.pos.y);
            ctx.fillStyle = this.color;
            if (Utilies.isNumber(this.message))
            {
                ctx.fillText(this.message, this.pos.x + (this.box.width / 2), this.pos.y + (this.box.height / 1.4));
            }
        };
        ToostMessage.prototype.onAnimationFinish = function (func)
        {
            this.onFinishFunc = func;
        };
        ToostMessage.prototype.update = function ()
        {
            this.timer.update();
            if (this.timer.hasTimePeriodPassed())
            {
                this.finished = true;
                if (this.onFinishFunc)
                {
                    this.onFinishFunc();
                }
            }
            this.pos.y -= this.speed;
        };
        return ToostMessage;
    })();
    var ForceIndicator = (function ()
    {
        function ForceIndicator(maxForceForWeapon)
        {
            this.forceMax = maxForceForWeapon;
            this.forcePercentage = 1;
            this.sprite = new Sprite(Sprites.particleEffects.blob);
            this.needReRender = true;
            this.renderCanvas = null;
        }
        ForceIndicator.prototype.isRequired = function ()
        {
            return this.forceMax != 0;
        };
        ForceIndicator.prototype.draw = function (ctx, worm)
        {
            var _this = this;
            if (this.isCharging() && this.isRequired())
            {
                if (this.needReRender)
                {
                    this.renderCanvas = Graphics.preRenderer.render(function (context)
                    {
                        _this.sprite.draw(context, 0, (_this.forcePercentage / 100) * 100);
                        _this.needReRender = false;
                    }, this.sprite.getFrameWidth(), 200, this.renderCanvas);
                }
                var radius = worm.fixture.GetShape().GetRadius() * Physics.worldScale;
                var wormPos = Physics.vectorMetersToPixels(worm.body.GetPosition().Copy());
                var targetDir = worm.target.getTargetDirection().Copy();
                targetDir.Multiply(16);
                targetDir.Add(wormPos);
                ctx.save();
                ctx.translate(targetDir.x, targetDir.y);
                ctx.rotate(Utilies.vectorToAngle(worm.target.getTargetDirection().Copy()) + Utilies.toRadians(-90));
                ctx.drawImage(this.renderCanvas, -radius, -radius, this.renderCanvas.width, this.renderCanvas.height);
                ctx.restore();
            }
        };
        ForceIndicator.prototype.charge = function (rate)
        {
            if (this.isRequired())
            {
                AssetManager.getSound("THROWPOWERUP").play();
                this.forcePercentage += rate;
                this.sprite.setCurrentFrame(this.sprite.getCurrentFrame() + 0.4);
                this.needReRender = true;
                if (this.forcePercentage > 100)
                {
                    this.forcePercentage = 100;
                    return true;
                }
            }
        };
        ForceIndicator.prototype.isCharging = function ()
        {
            return this.forcePercentage > 1;
        };
        ForceIndicator.prototype.setMaxForce = function (forceScalerMax)
        {
            this.forceMax = forceScalerMax;
        };
        ForceIndicator.prototype.reset = function ()
        {
            if (this.isRequired() && this.forcePercentage > 1)
            {
                this.forcePercentage = 1;
                AssetManager.getSound("THROWPOWERUP").pause();
                AssetManager.getSound("THROWRELEASE").play();
                this.renderCanvas.getContext('2d').clearRect(0, 0, this.renderCanvas.width, this.renderCanvas.height);
                this.sprite.currentFrameY = 0;
            }
        };
        ForceIndicator.prototype.getForce = function ()
        {
            return (this.forcePercentage / 100) * this.forceMax;
        };
        return ForceIndicator;
    })();
    var BaseWeapon = (function ()
    {
        function BaseWeapon(name, ammo, iconSprite, takeOutAnimation, takeAimAnimation)
        {
            this.name = name;
            this.ammo = ammo;
            this.takeOutAnimations = takeOutAnimation;
            this.takeAimAnimations = takeAimAnimation;
            this.iconImage = AssetManager.getImage(iconSprite.imageName);
            this.requiresAiming = true;
            this.setIsActive(false);
            this.forceIndicator = new ForceIndicator(0);
        }
        BaseWeapon.prototype.getForceIndicator = function ()
        {
            return this.forceIndicator;
        };
        BaseWeapon.prototype.getIsActive = function ()
        {
            return this.isActive;
        };
        BaseWeapon.prototype.setIsActive = function (val)
        {
            this.isActive = val;
        };
        BaseWeapon.prototype.deactivate = function ()
        {
        };
        BaseWeapon.prototype.activate = function (worm)
        {
            this.setIsActive(true);
            this.ammo--;
            this.worm = worm;
            Logger.debug(this.name + " was activated ");
        };
        BaseWeapon.prototype.update = function ()
        {
        };
        BaseWeapon.prototype.draw = function (ctx)
        {
        };
        return BaseWeapon;
    })();
    var Drill = (function (_super)
    {
        __extends(Drill, _super);
        function Drill(ammo, name, icon, takeOutAnimation, actionAnimation)
        {
            if (typeof name === "undefined") { name = "Drill"; }
            if (typeof icon === "undefined") { icon = Sprites.weaponIcons.drill; }
            if (typeof takeOutAnimation === "undefined") { takeOutAnimation = Sprites.worms.takeOutDrill; }
            if (typeof actionAnimation === "undefined") { actionAnimation = Sprites.worms.drilling; }
            _super.call(this, "Drill", ammo, icon, takeOutAnimation, actionAnimation);
            this.timeBetweenExploisionsTimer = new Timer(450);
            this.useDurationTimer = new Timer(5200);
            this.requiresAiming = false;
        }
        Drill.prototype.activate = function (worm)
        {
            if (this.ammo > 0)
            {
                _super.prototype.activate.call(this, worm);
                this.useDurationTimer.reset();
                this.timeBetweenExploisionsTimer.reset();
                this.worm.setSpriteDef(this.takeAimAnimations, true, false);
                return true;
            } else
            {
                return false;
            }
        };
        Drill.prototype.deactivate = function ()
        {
            this.setIsActive(false);
            Logger.debug(" deactivedate ");
            this.worm.setSpriteDef(this.takeAimAnimations, false);
        };
        Drill.prototype.update = function ()
        {
            if (this.getIsActive())
            {
                var weaponUseDuration = this.useDurationTimer.hasTimePeriodPassed();
                if (weaponUseDuration)
                {
                    this.deactivate();
                }
                AssetManager.getSound("drill").play();
                if (this.timeBetweenExploisionsTimer.hasTimePeriodPassed())
                {
                    GameInstance.terrain.addToDeformBatch(Physics.metersToPixels(this.worm.body.GetPosition().x), Physics.metersToPixels(this.worm.body.GetPosition().y), 25);
                }
                this.useDurationTimer.update();
                this.timeBetweenExploisionsTimer.update();
            }
        };
        return Drill;
    })(BaseWeapon);
    var Effects;
    (function (Effects)
    {
        function explosion(epicenter, explosionRadius, effectedRadius, explosiveForce, maxDamage, entityThatCausedExplosion, soundEffectToPlay, particleEffectType)
        {
            if (typeof entityThatCausedExplosion === "undefined") { entityThatCausedExplosion = null; }
            if (typeof soundEffectToPlay === "undefined") { soundEffectToPlay = AssetManager.getSound("explosion" + Utilies.random(1, 3)); }
            if (typeof particleEffectType === "undefined") { particleEffectType = ParticleEffect; }
            var posX = Physics.metersToPixels(Math.floor(epicenter.x));
            var posY = Physics.metersToPixels(Math.floor(epicenter.y));
            GameInstance.terrain.addToDeformBatch(posX, posY, explosionRadius);
            Physics.applyToNearByObjects(epicenter, effectedRadius, function (fixture, epicenter)
            {
                if (fixture.GetBody().GetType() != b2Body.b2_staticBody && fixture.GetBody().GetUserData() instanceof Worm)
                {
                    var direction = fixture.GetBody().GetPosition().Copy();
                    direction.x = Math.floor(direction.x);
                    direction.y = Math.floor(direction.y);
                    direction.Subtract(epicenter);
                    var forceVec = direction.Copy();
                    var diff = effectedRadius - direction.Length();
                    if (diff < 0)
                    {
                        diff = 0;
                    }
                    var distanceFromEpicenter = diff / effectedRadius;
                    fixture.GetBody().GetUserData().hit(maxDamage * distanceFromEpicenter, entityThatCausedExplosion);
                    forceVec.Normalize();
                    forceVec.Multiply(explosiveForce * distanceFromEpicenter);
                    if (fixture.GetBody().GetUserData().isDead == true)
                    {
                        forceVec.x = 0;
                        forceVec.y /= 10;
                    }
                    fixture.GetBody().ApplyImpulse(forceVec, fixture.GetBody().GetPosition());
                }
            });
            var particleAnimation = new particleEffectType(posX, posY);
            GameInstance.particleEffectMgmt.add(particleAnimation);
            if (soundEffectToPlay != null)
            {
                soundEffectToPlay.play();
            }
            return particleAnimation;
        }
        Effects.explosion = explosion;
    })(Effects || (Effects = {}));
    var ThrowableWeapon = (function (_super)
    {
        __extends(ThrowableWeapon, _super);
        function ThrowableWeapon(name, ammo, iconSpriteDef, weaponSpriteDef, takeOutAnimation, takeAimAnimation)
        {
            _super.call(this, name, ammo, iconSpriteDef, takeOutAnimation, takeAimAnimation);
            this.forceIndicator.setMaxForce(40);
            this.sprite = new Sprite(weaponSpriteDef);
            this.explosionRadius = 40;
            this.effectedRadius = Physics.pixelToMeters(50);
            this.explosiveForce = 50;
            this.maxDamage = 30;
            this.detonationTimer = new Timer(5000);
            this.hasImpacted = 0;
            this.impactSound = "GRENADEIMPACT";
        }
        ThrowableWeapon.DENSITY = 50;
        ThrowableWeapon.preRender = function preRender()
        {
            var timerBoxWidth = 20;
            var timerBoxHeight = 22;
            return Graphics.preRenderer.render(function (ctx)
            {
                ctx.fillStyle = '#1A1110';
                ctx.strokeStyle = "#eee";
                Graphics.roundRect(ctx, 0, 0, timerBoxWidth, timerBoxHeight, 4).fill();
                Graphics.roundRect(ctx, 0, 0, timerBoxWidth, timerBoxHeight, 4).stroke();
            }, timerBoxWidth + 3, timerBoxHeight + 3);
        };
        ThrowableWeapon.numberBox = ThrowableWeapon.preRender();
        ThrowableWeapon.prototype.beginContact = function (contact)
        {
            if (this.hasImpacted == 0)
            {
                AssetManager.getSound(this.impactSound).play(0.6);
            }
            this.hasImpacted++;
        };
        ThrowableWeapon.prototype.endContact = function (contact)
        {
            this.hasImpacted--;
        };
        ThrowableWeapon.prototype.deactivate = function ()
        {
            Logger.debug(this.name + " was deactivated ");
            this.setIsActive(false);
            _super.prototype.deactivate.call(this);
        };
        ThrowableWeapon.prototype.setupPhysicsBodies = function (initalPosition, initalVelocity)
        {
            var image = this.sprite.getImage();
            var fixDef = new b2FixtureDef();
            fixDef.density = ThrowableWeapon.DENSITY;
            fixDef.friction = 3.5;
            fixDef.restitution = 0.6;
            fixDef.shape = new b2CircleShape((image.width / 4) / Physics.worldScale);
            var bodyDef = new b2BodyDef();
            bodyDef.type = b2Body.b2_dynamicBody;
            bodyDef.position = initalPosition;
            if ((this instanceof Dynamite) == false)
            {
                bodyDef.angle = Utilies.vectorToAngle(initalVelocity);
            }
            this.fixture = Physics.world.CreateBody(bodyDef).CreateFixture(fixDef);
            this.body = this.fixture.GetBody();
            this.body.SetLinearVelocity(initalVelocity);
            if ((this instanceof Dynamite) == false)
            {
                if (initalVelocity.x >= 0)
                {
                    this.body.SetAngularVelocity(0.7);
                } else
                {
                    this.body.SetAngularVelocity(-0.7);
                }
            }
            this.body.SetUserData(this);
            Physics.addToFastAcessList(this.body);
        };
        ThrowableWeapon.prototype.setupDirectionAndForce = function (worm)
        {
            var initalVelocity = worm.target.getTargetDirection().Copy();
            initalVelocity.Multiply(1.5);
            var initalPosition = worm.body.GetPosition();
            initalPosition.Add(initalVelocity);
            initalVelocity = worm.target.getTargetDirection().Copy();
            initalVelocity.Multiply(this.forceIndicator.getForce());
            this.setupPhysicsBodies(initalPosition, initalVelocity);
        };
        ThrowableWeapon.prototype.playWormVoice = function ()
        {
            Utilies.pickRandomSound([
                "watchthis",
                "fire",
                "grenade",
                "incoming",
                "laugh"
            ]).play();
        };
        ThrowableWeapon.prototype.activate = function (worm)
        {
            if (this.ammo > 0 && this.getIsActive() == false)
            {
                this.detonationTimer.reset();
                this.playWormVoice();
                _super.prototype.activate.call(this, worm);
                this.setupDirectionAndForce(worm);
            } else
            {
                AssetManager.getSound("cantclickhere").play();
            }
        };
        ThrowableWeapon.prototype.detonate = function ()
        {
            GameInstance.state.tiggerNextTurn();
            var animation = Effects.explosion(this.body.GetPosition(), this.explosionRadius, this.effectedRadius, this.explosiveForce, this.maxDamage, this.worm);
            Physics.removeToFastAcessList(this.body);
            Physics.world.DestroyBody(this.body);
            this.deactivate();
            this.worm.team.weaponManager.getListOfWeapons()[6].deactivate();
        };
        ThrowableWeapon.prototype.update = function ()
        {
            if (this.getIsActive())
            {
                if (this.detonationTimer.hasTimePeriodPassed())
                {
                    this.detonate();
                }
                this.detonationTimer.update();
            }
        };
        ThrowableWeapon.prototype.draw = function (ctx)
        {
            if (this.getIsActive())
            {
                ctx.save();
                var wormPosInPixels = Physics.vectorMetersToPixels(this.body.GetPosition());
                ctx.translate(wormPosInPixels.x, wormPosInPixels.y);
                ctx.save();
                ctx.rotate(this.body.GetAngle());
                var radius = this.fixture.GetShape().GetRadius() * 2 * Physics.worldScale;
                this.sprite.draw(ctx, -radius, -radius);
                ctx.restore();
                ctx.drawImage(ThrowableWeapon.numberBox, 10, -40);
                ctx.fillStyle = 'rgba(255,0,0,255)';
                var secoundsLeft = Math.floor(this.detonationTimer.getTimeLeftInSec() / 10);
                if (secoundsLeft < 0)
                {
                    secoundsLeft = 0;
                }
                ctx.fillText(secoundsLeft, 22, -22);
                ctx.restore();
            }
        };
        return ThrowableWeapon;
    })(BaseWeapon);
    var HolyGrenade = (function (_super)
    {
        __extends(HolyGrenade, _super);
        function HolyGrenade(ammo)
        {
            _super.call(this, "Holy Grenade", ammo, Sprites.weaponIcons.holyGernade, Sprites.weapons.holyGernade, Sprites.worms.takeOutHolyGernade, Sprites.worms.aimHolyGernade);
            this.explosionRadius = 145;
            this.effectedRadius = Physics.pixelToMeters(360);
            this.explosiveForce = 120;
            this.maxDamage = 50;
            this.detonationTimer = new Timer(6000);
            this.impactSound = "HOLYGRENADEIMPACT";
        }
        HolyGrenade.prototype.update = function ()
        {
            if (this.getIsActive() && this.detonationTimer.getTimeLeftInSec() / 10 <= 2)
            {
                AssetManager.getSound("holygrenade").play();
            }
            _super.prototype.update.call(this);
        };
        return HolyGrenade;
    })(ThrowableWeapon);
    var HandGrenade = (function (_super)
    {
        __extends(HandGrenade, _super);
        function HandGrenade(ammo)
        {
            _super.call(this, "Hand Grenade", ammo, Sprites.weaponIcons.gernade, Sprites.weapons.gernade, Sprites.worms.takeOutGernade, Sprites.worms.aimGernade);
            this.explosionRadius = 80;
            this.effectedRadius = Physics.pixelToMeters(200);
            this.explosiveForce = 80;
            this.maxDamage = 25;
            this.detonationTimer = new Timer(4000);
            this.impactSound = "GRENADEIMPACT";
        }
        HandGrenade.prototype.deactivate = function ()
        {
            _super.prototype.deactivate.call(this);
        };
        return HandGrenade;
    })(ThrowableWeapon);
    var Dynamite = (function (_super)
    {
        __extends(Dynamite, _super);
        function Dynamite(ammo)
        {
            var modifedSpriteDef = Utilies.copy(new Object(), Sprites.worms.takeOutDynamite);
            modifedSpriteDef.frameY = modifedSpriteDef.frameCount - 1;
            _super.call(this, "Dynamite", ammo, Sprites.weaponIcons.dynamite, Sprites.weapons.dynamite, Sprites.worms.takeOutDynamite, modifedSpriteDef);
            this.explosionRadius = 100;
            this.effectedRadius = Physics.pixelToMeters(this.explosionRadius * 1.8);
            this.explosiveForce = 95;
            this.requiresAiming = false;
        }
        Dynamite.prototype.playWormVoice = function ()
        {
            Utilies.pickRandomSound([
                "laugh"
            ]).play();
        };
        Dynamite.prototype.setupDirectionAndForce = function (worm)
        {
            var initalPosition = worm.body.GetPosition();
            this.setupPhysicsBodies(initalPosition, new b2Vec2(0, 0));
            this.body.SetFixedRotation(true);
        };
        Dynamite.prototype.update = function ()
        {
            if (this.getIsActive())
            {
                this.sprite.update();
                AssetManager.getSound("fuse").play(1);
                _super.prototype.update.call(this);
            }
        };
        return Dynamite;
    })(ThrowableWeapon);
    var NinjaRope = (function (_super)
    {
        __extends(NinjaRope, _super);
        function NinjaRope(ammo)
        {
            _super.call(this, "Ninja Rope", ammo, Sprites.weaponIcons.ninjaRope, Sprites.worms.takeNinjaRope, Sprites.worms.aimNinjaRope);
            this.ropeTip = new Sprite(Sprites.weapons.ninjaRopeTip);
            this.ropeJoints = [];
            this.ropeNots = [];
            this.lastRopeDef;
        }
        NinjaRope.prototype.update = function ()
        {
            if (this.isActive)
            {
                if (keyboard.isKeyDown(Controls.aimUp.keyboard))
                {
                    this.contract();
                    Client.sendImmediately(Events.client.CURRENT_WORM_ACTION, new InstructionChain("getWeapon.contract"));
                } else if (keyboard.isKeyDown(Controls.aimDown.keyboard))
                {
                    this.expand();
                    Client.sendImmediately(Events.client.CURRENT_WORM_ACTION, new InstructionChain("getWeapon.expand"));
                }
            }
        };
        NinjaRope.prototype.activate = function (worm)
        {
            this.worm = worm;
            if (this.ammo > 0 && !this.getIsActive())
            {
                AssetManager.getSound("NinjaRopeFire").play();
                var dir = worm.target.getTargetDirection().Copy();
                var contact = Physics.shotRay(worm.body.GetPosition(), dir);
                if (contact)
                {
                    this.ammo--;
                    this.isActive = true;
                    var fixDef = new b2FixtureDef();
                    fixDef.density = 10.5;
                    fixDef.friction = 1.0;
                    fixDef.restitution = 0.3;
                    fixDef.shape = new b2PolygonShape();
                    fixDef.shape.SetAsBox(0.2, 0.2);
                    var bodyDef = new b2BodyDef();
                    bodyDef.type = b2Body.b2_staticBody;
                    bodyDef.position.x = contact.x;
                    bodyDef.position.y = contact.y;
                    this.anchor = Physics.world.CreateBody(bodyDef).CreateFixture(fixDef).GetBody();
                    this.ropeNots.push(this.anchor);
                    fixDef.shape = new b2CircleShape(0.15);
                    var ropeDef = new b2DistanceJointDef();
                    ropeDef.frequencyHz = 10.0;
                    ropeDef.dampingRatio = 50.0;
                    var prevBody = this.anchor;
                    var direction = this.anchor.GetPosition().Copy();
                    var wormPos = worm.body.GetPosition().Copy();
                    wormPos.Subtract(direction);
                    var distance = 5;
                    if (wormPos.Length() > distance)
                    {
                        distance = Math.floor(wormPos.Length() / 0.5);
                    }
                    wormPos.Normalize();
                    direction = wormPos;
                    for (var i = 1; i < distance; ++i)
                    {
                        var bd = new b2BodyDef();
                        bd.type = b2Body.b2_dynamicBody;
                        var pos = this.anchor.GetPosition().Copy();
                        var dScaled = direction.Copy();
                        dScaled.Multiply(0.5 * i);
                        pos.Add(dScaled);
                        bd.position.SetV(pos);
                        var nextBody;
                        if (i == distance - 1)
                        {
                            ropeDef.frequencyHz = 25.0;
                            nextBody = worm.body;
                        } else
                        {
                            nextBody = Physics.world.CreateBody(bd);
                            nextBody.CreateFixture(fixDef);
                            nextBody.SetFixedRotation(true);
                            this.lastRopeDef = ropeDef;
                            this.ropeNots.push(nextBody);
                        }
                        ropeDef.bodyA = prevBody;
                        ropeDef.bodyB = nextBody;
                        var joint = Physics.world.CreateJoint(ropeDef);
                        this.ropeJoints.push(joint);
                        joint.SetLength(0.02);
                        prevBody = nextBody;
                    }
                }
            } else if (this.getIsActive())
            {
                this.deactivate();
            }
        };
        NinjaRope.prototype.deactivate = function ()
        {
            this.setIsActive(false);
            this.destory();
        };
        NinjaRope.prototype.destory = function ()
        {
            for (var i = 0; i < this.ropeNots.length; i++)
            {
                if ((this.ropeNots[i].GetUserData() instanceof Worm) == false)
                {
                    Physics.world.DestroyBody(this.ropeNots[i]);
                }
            }
            for (var i = 0; i < this.ropeJoints.length; i++)
            {
                Physics.world.DestroyJoint(this.ropeJoints[i]);
            }
            this.ropeNots = [];
            this.ropeJoints = [];
        };
        NinjaRope.prototype.contract = function ()
        {
            if (this.ropeJoints.length > 3 && this.ropeNots.length > 3)
            {
                var lastJoint = this.ropeJoints[this.ropeJoints.length - 2];
                var lastBody = this.ropeNots.pop();
                Physics.world.DestroyBody(lastBody);
                this.lastRopeDef.bodyA = this.ropeNots[this.ropeNots.length - 1];
                this.lastRopeDef.bodyB = this.worm.body;
                var joint = Physics.world.CreateJoint(this.lastRopeDef);
                joint.SetLength(0.02);
                Physics.world.DestroyJoint(this.ropeJoints.pop());
                Physics.world.DestroyJoint(this.ropeJoints.pop());
                this.ropeJoints.push(joint);
                joint.SetLength(0.2);
            }
        };
        NinjaRope.prototype.expand = function ()
        {
            if (this.ropeJoints.length < 40 && this.ropeNots.length < 40)
            {
                Physics.world.DestroyJoint(this.ropeJoints.pop());
                var lastBody = this.ropeNots[this.ropeNots.length - 1];
                var lastJoint = this.ropeJoints[this.ropeJoints.length - 1];
                var fixDef = new b2FixtureDef();
                fixDef.density = 0.5;
                fixDef.friction = 1.0;
                fixDef.restitution = 0.0;
                fixDef.shape = new b2CircleShape(0.15);
                var bd = new b2BodyDef();
                bd.type = b2Body.b2_dynamicBody;
                var direction = this.worm.body.GetPosition().Copy();
                var wormPos = lastBody.GetPosition().Copy();
                wormPos.Subtract(direction);
                wormPos.Multiply(0.8);
                wormPos.Add(this.worm.body.GetPosition());
                bd.position.SetV(wormPos);
                var nextBody = Physics.world.CreateBody(bd);
                nextBody.CreateFixture(fixDef);
                nextBody.SetFixedRotation(true);
                this.lastRopeDef.bodyA = lastBody;
                this.lastRopeDef.bodyB = nextBody;
                this.ropeNots.push(nextBody);
                var joint = Physics.world.CreateJoint(this.lastRopeDef);
                this.ropeJoints.push(joint);
                joint.SetLength(0.3);
                this.lastRopeDef.bodyA = nextBody;
                this.lastRopeDef.bodyB = this.worm.body;
                this.playerJoint = Physics.world.CreateJoint(this.lastRopeDef);
                this.ropeJoints.push(this.playerJoint);
            }
        };
        NinjaRope.prototype.draw = function (ctx)
        {
            if (this.getIsActive())
            {
                var context = ctx;
                context.strokeStyle = "rgb(255, 255, 255)";
                context.lineWidth = 4;
                for (var i = 0; i < this.ropeNots.length - 2; i += 2)
                {
                    var p1 = Physics.vectorMetersToPixels(this.ropeNots[i].GetPosition());
                    var p2 = Physics.vectorMetersToPixels(this.ropeNots[i + 2].GetPosition());
                    context.beginPath();
                    context.moveTo(p1.x, p1.y);
                    context.lineTo(p2.x, p2.y);
                    context.closePath();
                    context.stroke();
                    if (i == 0)
                    {
                        var dir = p2.Copy();
                        dir.Subtract(p1);
                        var angle = Utilies.vectorToAngle(dir) + Utilies.toRadians(-90);
                        ctx.save();
                        ctx.translate(p1.x, p1.y);
                        ctx.rotate(angle);
                        this.ropeTip.draw(ctx, -10, -10);
                        ctx.restore();
                    }
                }
                var p1 = Physics.vectorMetersToPixels(this.ropeNots[this.ropeNots.length - 2].GetPosition());
                var p2 = Physics.vectorMetersToPixels(this.ropeNots[this.ropeNots.length - 1].GetPosition());
                context.beginPath();
                context.moveTo(p1.x, p1.y);
                context.lineTo(p2.x, p2.y);
                context.closePath();
                context.stroke();
                var p1 = Physics.vectorMetersToPixels(this.ropeNots[this.ropeNots.length - 1].GetPosition());
                var p2 = Physics.vectorMetersToPixels(this.worm.body.GetPosition());
                context.beginPath();
                context.moveTo(p1.x, p1.y);
                context.lineTo(p2.x, p2.y);
                context.closePath();
                context.stroke();
                _super.prototype.draw.call(this, ctx);
            }
        };
        return NinjaRope;
    })(BaseWeapon);
    var JetPack = (function (_super)
    {
        __extends(JetPack, _super);
        function JetPack(ammo)
        {
            _super.call(this, "Jet Pack", ammo, Sprites.weaponIcons.jetPack, Sprites.worms.takeOutJetPack, Sprites.worms.defualtJetPack);
            this.thurstScaler = 0.15 * Worm.DENSITY;
            this.forceDir = new b2Vec2(0, 0);
            this.bottomflame = new Sprite(Sprites.weapons.jetPackFlamesDown);
            this.sideflame = new Sprite(Sprites.weapons.jetPackFlamesSide);
            this.requiresAiming = false;
            this.INITAL_FUEL = 20;
            this.fuel = this.INITAL_FUEL;
        }
        JetPack.prototype.activate = function (worm)
        {
            if (this.getIsActive())
            {
                this.setIsActive(false);
            } else
            {
                _super.prototype.activate.call(this, worm);
            }
        };
        JetPack.prototype.draw = function (ctx)
        {
            if (this.isActive)
            {
                if (this.forceDir.y != 0)
                {
                    var pos = Physics.vectorMetersToPixels(this.worm.body.GetPosition());
                    pos.x -= (this.bottomflame.getImage().width / 2) + this.worm.direction * 10;
                    pos.y -= 4;
                    this.bottomflame.draw(ctx, pos.x, pos.y);
                }
                if (this.forceDir.x != 0)
                {
                    var pos = Physics.vectorMetersToPixels(this.worm.body.GetPosition());
                    pos.x -= this.worm.direction * 13;
                    pos.y -= 15;
                    ctx.save();
                    ctx.translate(pos.x, pos.y);
                    if (this.worm.direction == Worm.DIRECTION.right)
                    {
                        ctx.scale(-1, 1);
                    }
                    this.sideflame.draw(ctx, 0, 0);
                    ctx.restore();
                }
                var pos = Physics.vectorMetersToPixels(this.worm.body.GetPosition());
                ctx.save();
                ctx.translate(pos.x, pos.y);
                ctx.drawImage(ThrowableWeapon.numberBox, 30, -40);
                ctx.fillStyle = 'rgba(255,0,0,255)';
                ctx.fillText(Math.floor(this.fuel), 42, -20);
                ctx.restore();
                this.forceDir = new b2Vec2(0, 0);
            }
        };
        JetPack.prototype.up = function ()
        {
            this.forceDir.y = -1;
        };
        JetPack.prototype.left = function ()
        {
            this.forceDir.x = -1.2;
            this.worm.direction = -1;
        };
        JetPack.prototype.right = function ()
        {
            this.forceDir.x = 1.2;
            this.worm.direction = 1;
        };
        JetPack.prototype.deactivate = function ()
        {
            this.setIsActive(false);
            this.fuel = this.INITAL_FUEL;
            _super.prototype.deactivate.call(this);
        };
        JetPack.prototype.update = function ()
        {
            if (this.fuel <= 0)
            {
                this.deactivate();
                Client.sendImmediately(Events.client.CURRENT_WORM_ACTION, new InstructionChain("getWeapon.deactivate"));
            }
            if (this.isActive)
            {
                if (keyboard.isKeyDown(Controls.aimUp.keyboard))
                {
                    this.up();
                    Client.sendImmediately(Events.client.CURRENT_WORM_ACTION, new InstructionChain("getWeapon.up"));
                }
                if (keyboard.isKeyDown(Controls.walkLeft.keyboard))
                {
                    this.left();
                    Client.sendImmediately(Events.client.CURRENT_WORM_ACTION, new InstructionChain("getWeapon.left"));
                }
                if (keyboard.isKeyDown(Controls.walkRight.keyboard))
                {
                    this.right();
                    Client.sendImmediately(Events.client.CURRENT_WORM_ACTION, new InstructionChain("getWeapon.right"));
                }
                if (this.forceDir.Length() > 0)
                {
                    Utilies.pickRandomSound([
                        "JetPackLoop1",
                        "JetPackLoop2"
                    ]).play();
                    this.fuel -= 0.09;
                    this.forceDir.Multiply(this.thurstScaler);
                    this.worm.body.ApplyImpulse(this.forceDir, this.worm.body.GetWorldCenter());
                }
                this.worm.setSpriteDef(Sprites.worms.defualtJetPack);
                this.worm.finished = true;
                if (this.forceDir.y != 0)
                {
                    this.bottomflame.update();
                }
                if (this.forceDir.x != 0)
                {
                    this.sideflame.update();
                }
            }
        };
        return JetPack;
    })(BaseWeapon);
    var RayWeapon = (function (_super)
    {
        __extends(RayWeapon, _super);
        function RayWeapon(name, ammo, iconSpriteDef, takeOutAnimation, takeAimAnimation)
        {
            _super.call(this, name, ammo, iconSpriteDef, takeOutAnimation, takeAimAnimation);
            this.damageToTerrainRadius = 30;
            this.damgeToWorm = 10;
        }
        RayWeapon.prototype.update = function ()
        {
            _super.prototype.update.call(this);
            return (this.ammo != 0) && this.getIsActive();
        };
        return RayWeapon;
    })(BaseWeapon);
    var Shotgun = (function (_super)
    {
        __extends(Shotgun, _super);
        function Shotgun(ammo)
        {
            _super.call(this, "Shotgun", ammo, Sprites.weaponIcons.shotgun, Sprites.worms.shotgunTakeOut, Sprites.worms.aimingShotgun);
            this.fireAnimations = [
                Sprites.worms.shotgunFirePump,
                Sprites.worms.aimingShotgun,
                Sprites.worms.shotgunFireAnimation1
            ];
            this.fireAnimationIndex = 0;
            this.damageToTerrainRadius = 30;
            this.damgeToWorm = 30;
            this.forceScaler = 40;
            this.animationSheetChangeTimer = new Timer(300);
            this.shotsTaken = 0;
        }
        Shotgun.prototype.activate = function (worm)
        {
            if (this.getIsActive() == false)
            {
                _super.prototype.activate.call(this, worm);
                this.animationSheetChangeTimer.reset();
                this.fireAnimationIndex = 0;
                AssetManager.getSound("SHOTGUNRELOAD").play(1, 0.3);
                this.shotsTaken++;
            }
        };
        Shotgun.prototype.update = function ()
        {
            var _this = this;
            if (_super.prototype.update.call(this))
            {
                this.animationSheetChangeTimer.update();
                if (this.animationSheetChangeTimer.hasTimePeriodPassed())
                {
                    this.worm.swapSpriteSheet(this.fireAnimations[this.fireAnimationIndex]);
                    this.fireAnimationIndex++;
                }
                if (this.fireAnimationIndex >= this.fireAnimations.length)
                {
                    var hitPiont = Physics.shotRay(this.worm.body.GetPosition(), this.worm.target.getTargetDirection().Copy());
                    if (hitPiont)
                    {
                        Effects.explosion(hitPiont, this.damageToTerrainRadius, 1, this.forceScaler, this.damgeToWorm, this.worm, AssetManager.getSound("ShotGunFire"));
                    } else
                    {
                        AssetManager.getSound("ShotGunFire").play();
                    }
                    this.animationSheetChangeTimer.pause();
                    this.fireAnimationIndex = 0;
                    setTimeout(function ()
                    {
                        _this.setIsActive(false);
                        _this.worm.swapSpriteSheet(_this.fireAnimations[_this.fireAnimationIndex]);
                        if (_this.shotsTaken >= 2)
                        {
                            _this.shotsTaken = 0;
                            GameInstance.state.tiggerNextTurn();
                        }
                    }, 400);
                }
            }
        };
        return Shotgun;
    })(RayWeapon);
    var Minigun = (function (_super)
    {
        __extends(Minigun, _super);
        function Minigun(ammo)
        {
            _super.call(this, "Minigun", ammo, Sprites.weaponIcons.minigun, Sprites.worms.minigunTakeOut, Sprites.worms.minigunAim);
            this.damageToTerrainRadius = 30;
            this.damgeToWorm = 30;
            this.forceScaler = 30;
            this.fireRate = new Timer(300);
        }
        Minigun.prototype.activate = function (worm)
        {
            var _this = this;
            _super.prototype.activate.call(this, worm);
            this.worm.swapSpriteSheet(Sprites.worms.minigunFire);
            setTimeout(function ()
            {
                _this.setIsActive(false);
                GameInstance.state.tiggerNextTurn();
                _this.worm.swapSpriteSheet(_this.takeAimAnimations);
            }, 1000);
            AssetManager.getSound("MiniGunFire").play();
        };
        Minigun.prototype.update = function ()
        {
            if (_super.prototype.update.call(this))
            {
                this.fireRate.update();
                if (this.fireRate.hasTimePeriodPassed())
                {
                    var hitPiont = Physics.shotRay(this.worm.body.GetPosition(), this.worm.target.getTargetDirection().Copy());
                    if (hitPiont)
                    {
                        Effects.explosion(hitPiont, this.damageToTerrainRadius, 1, this.forceScaler, this.damgeToWorm, this.worm, null);
                    }
                }
            }
        };
        return Minigun;
    })(RayWeapon);
    var ProjectileWeapon = (function (_super)
    {
        __extends(ProjectileWeapon, _super);
        function ProjectileWeapon(name, ammo, iconSpriteDef, weaponSpriteDef, takeOutAnimation, takeAimAnimation)
        {
            _super.call(this, name, ammo, iconSpriteDef, takeOutAnimation, takeAimAnimation);
            this.projectileSprite = new Sprite(weaponSpriteDef);
            this.effectedRadius = Physics.pixelToMeters(60);
            this.explosionRadius = 70;
            this.explosiveForce = 60;
            this.maxDamage = 50;
            this.forceIndicator.setMaxForce(120);
        }
        ProjectileWeapon.prototype.setupDirectionAndForce = function (worm)
        {
            var initalVelocity = worm.target.getTargetDirection().Copy();
            initalVelocity.Multiply(1.5);
            var initalPosition = worm.body.GetPosition();
            initalPosition.Add(initalVelocity);
            initalVelocity = worm.target.getTargetDirection().Copy();
            initalVelocity.Multiply(this.forceIndicator.getForce());
            this.setupPhysicsBodies(initalPosition, initalVelocity);
        };
        ProjectileWeapon.prototype.setupPhysicsBodies = function (initalPosition, initalVelocity)
        {
            var image = this.projectileSprite.getImage();
            var fixDef = new b2FixtureDef();
            fixDef.density = 50.0;
            fixDef.friction = 3.5;
            fixDef.restitution = 0.6;
            fixDef.shape = new b2CircleShape((image.width / 4) / Physics.worldScale);
            var bodyDef = new b2BodyDef();
            bodyDef.type = b2Body.b2_dynamicBody;
            bodyDef.position = initalPosition;
            bodyDef.angle = Utilies.vectorToAngle(initalVelocity);
            this.fixture = Physics.world.CreateBody(bodyDef).CreateFixture(fixDef);
            this.body = this.fixture.GetBody();
            this.body.ApplyImpulse(initalVelocity, this.body.GetPosition());
            if (initalVelocity.x >= 0)
            {
                this.body.SetAngularVelocity(0.7);
            } else
            {
                this.body.SetAngularVelocity(-0.7);
            }
            this.body.SetUserData(this);
            Physics.addToFastAcessList(this.body);
        };
        ProjectileWeapon.prototype.beginContact = function (contact)
        {
            if (this.isActive && this.isLive)
            {
                GameInstance.state.tiggerNextTurn();
                var animation = Effects.explosion(this.body.GetPosition(), this.explosionRadius, this.effectedRadius, this.explosiveForce, this.maxDamage, this.worm);
                this.deactivate();
            }
        };
        ProjectileWeapon.prototype.deactivate = function ()
        {
            _super.prototype.deactivate.call(this);
            Logger.debug(this.name + " was deactivated ");
            this.isLive = false;
        };
        ProjectileWeapon.prototype.activate = function (worm)
        {
            if (GameInstance.state.getCurrentPlayer().getTeam().getCurrentWorm() == worm && this.ammo > 0 && this.getIsActive() == false)
            {
                this.isLive = true;
                _super.prototype.activate.call(this, worm);
                this.setupDirectionAndForce(worm);
            }
        };
        ProjectileWeapon.prototype.update = function ()
        {
            if (!this.isLive && this.isActive)
            {
                Physics.removeToFastAcessList(this.body);
                Physics.world.DestroyBody(this.body);
                this.isActive = false;
            }
        };
        ProjectileWeapon.prototype.draw = function (ctx)
        {
            if (this.isActive && this.isLive)
            {
                ctx.save();
                ctx.translate(this.body.GetPosition().x * Physics.worldScale, this.body.GetPosition().y * Physics.worldScale);
                ctx.rotate(this.body.GetAngle());
                var radius = this.fixture.GetShape().GetRadius() * 2 * Physics.worldScale;
                this.projectileSprite.draw(ctx, -this.projectileSprite.getFrameWidth() / 2, -this.projectileSprite.getFrameHeight() / 1.5);
                ctx.restore();
            }
        };
        return ProjectileWeapon;
    })(BaseWeapon);
    var Bazzoka = (function (_super)
    {
        __extends(Bazzoka, _super);
        function Bazzoka(ammo)
        {
            _super.call(this, "Bazooka", ammo, Sprites.weaponIcons.bazooka, Sprites.weapons.missle, Sprites.worms.takeOutBazooka, Sprites.worms.aimBazooka);
        }
        return Bazzoka;
    })(ProjectileWeapon);
    var WeaponManager = (function ()
    {
        function WeaponManager()
        {
            this.weaponsAndTools = [
                new Shotgun(99),
                new HandGrenade(20),
                new HolyGrenade(2),
                new Dynamite(5),
                new JetPack(5),
                new Minigun(4),
                new NinjaRope(50),
                new Drill(3),
                new Bazzoka(15)
            ];
            this.currentWeaponIndex = 1;
        }
        WeaponManager.prototype.checkWeaponHasAmmo = function (weaponIndex)
        {
            if (this.weaponsAndTools[weaponIndex].ammo)
            {
                return true;
            }
            return false;
        };
        WeaponManager.prototype.getCurrentWeapon = function ()
        {
            return this.weaponsAndTools[this.currentWeaponIndex];
        };
        WeaponManager.prototype.setCurrentWeapon = function (index)
        {
            if (this.getCurrentWeapon().getIsActive() == false || this.getCurrentWeapon() instanceof JetPack || this.getCurrentWeapon() instanceof NinjaRope)
            {
                if (this.getCurrentWeapon() instanceof NinjaRope)
                {
                    this.getCurrentWeapon().deactivate();
                }
                this.currentWeaponIndex = index;
            }
        };
        WeaponManager.prototype.getListOfWeapons = function ()
        {
            return this.weaponsAndTools;
        };
        return WeaponManager;
    })();
    var PhysicsSprite = (function (_super)
    {
        __extends(PhysicsSprite, _super);
        function PhysicsSprite(initalPos, initalVelocity, spriteDef)
        {
            _super.call(this, spriteDef);
            this.position = initalPos;
            this.velocity = initalVelocity;
        }
        PhysicsSprite.prototype.draw = function (ctx, x, y)
        {
            if (typeof x === "undefined") { x = this.position.x; }
            if (typeof y === "undefined") { y = this.position.y; }
            _super.prototype.draw.call(this, ctx, x, y);
        };
        PhysicsSprite.prototype.physics = function ()
        {
            var t = 0.016;
            var g = new b2Vec2(0, 9.81);
            var at = g.Copy();
            this.velocity.Add(at);
            var vt = this.velocity.Copy();
            vt.Multiply(t);
            this.position.Add(vt);
        };
        PhysicsSprite.prototype.update = function ()
        {
            this.physics();
            _super.prototype.update.call(this);
        };
        return PhysicsSprite;
    })(Sprite);
    var BounceArrow = (function (_super)
    {
        __extends(BounceArrow, _super);
        function BounceArrow(initalPos)
        {
            initalPos.x -= 15;
            initalPos.y -= 120;
            this.initalPos = initalPos;
            _super.call(this, Sprites.weapons.arrow);
        }
        BounceArrow.prototype.draw = function (ctx)
        {
            if (this.finished == false)
            {
                _super.prototype.draw.call(this, ctx, this.initalPos.x, this.initalPos.y);
            }
        };
        BounceArrow.prototype.physics = function ()
        {
        };
        return BounceArrow;
    })(Sprite);
    var Team = (function ()
    {
        function Team(playerId)
        {
            this.color = Utilies.pickUnqine([
                "#FA6C1D",
                "#12AB00",
                "#B46DD2",
                "#B31A35",
                "#23A3C6",
                "#9A4C44"
            ], "colors");
            this.graveStone = Utilies.pickUnqine([
                "grave1",
                "grave2",
                "grave3",
                "grave4",
                "grave5",
                "grave6"
            ], "gravestones");
            this.name = "Team " + Team.teamCount;
            this.teamId = playerId;
            Team.teamCount++;
            this.weaponManager = new WeaponManager();
            this.currentWorm = 0;
            this.initalNumberOfWorms = 4;
            this.worms = new Array(this.initalNumberOfWorms);
            for (var i = 0; i < this.initalNumberOfWorms; i++)
            {
                var tmp = Game.map.getNextSpawnPoint();
                this.worms[i] = (new Worm(this, tmp.x, tmp.y));
            }
        }
        Team.teamCount = 0;
        Team.prototype.getTeamNetData = function ()
        {
            var packet = {
            };
            for (var w in this.worms)
            {
                packet[w] = this.worms[w].getWormNetData();
            }
            return packet;
        };
        Team.prototype.setTeamNetData = function (packetStream)
        {
            for (var w in packetStream)
            {
                this.worms[w].setWormNetData(packetStream[w]);
            }
        };
        Team.prototype.getPercentageHealth = function ()
        {
            var totalHealth = 0;
            for (var worm in this.worms)
            {
                totalHealth += this.worms[worm].health;
            }
            return totalHealth / this.initalNumberOfWorms;
        };
        Team.prototype.areAllWormsDead = function ()
        {
            for (var worm in this.worms)
            {
                if (this.worms[worm].isDead == false)
                {
                    return false;
                }
            }
            return true;
        };
        Team.prototype.getCurrentWorm = function ()
        {
            return this.worms[this.currentWorm];
        };
        Team.prototype.nextWorm = function ()
        {
            if (this.currentWorm + 1 == this.worms.length)
            {
                this.currentWorm = 0;
            } else
            {
                this.currentWorm++;
            }
            if (this.worms[this.currentWorm].isDead)
            {
                this.nextWorm();
            } else
            {
                this.worms[this.currentWorm].activeWorm();
            }
        };
        Team.prototype.getWeaponManager = function ()
        {
            return this.weaponManager;
        };
        Team.prototype.setCurrentWorm = function (wormIndex)
        {
            this.currentWorm = wormIndex;
        };
        Team.prototype.getWorms = function ()
        {
            return this.worms;
        };
        Team.prototype.celebrate = function ()
        {
            for (var w in this.worms)
            {
                var worm = this.worms[w];
                worm.setSpriteDef(Sprites.worms.weWon, true);
            }
            GameInstance.camera.panToPosition(Physics.vectorMetersToPixels(this.worms[0].body.GetPosition()));
            AssetManager.getSound("victory").play(1, 15);
            AssetManager.getSound("Ireland").play(1, 16);
        };
        Team.prototype.update = function ()
        {
            var cachedLenght = this.worms.length;
            for (var i = 0; i < cachedLenght; i++)
            {
                this.worms[i].update();
            }
        };
        Team.prototype.draw = function (ctx)
        {
            var cachedLenght = this.worms.length;
            for (var i = 0; i < cachedLenght; i++)
            {
                this.worms[i].draw(ctx);
            }
        };
        return Team;
    })();
    var TeamDataPacket = (function ()
    {
        function TeamDataPacket(team)
        {
            this.graveStone = team.graveStone;
            this.name = team.name;
            this.color = team.color;
            this.wormsDataPacket = [];
            for (var w in team.worms)
            {
                this.wormsDataPacket.push(new WormDataPacket(team.worms[w]));
            }
        }
        TeamDataPacket.prototype.override = function (team)
        {
            team.name = this.name;
            team.graveStone = this.graveStone;
            team.color = this.color;
            for (var w in this.wormsDataPacket)
            {
                this.wormsDataPacket[w].override(team.getWorms()[w]);
            }
        };
        return TeamDataPacket;
    })();
    var NameGenerator;
    (function (NameGenerator)
    {
        var randomNamesList = [
            "Anders Hejlsberg",
            "Ted Henter",
            "Andy Hertzfeld",
            "Rich Hickey",
            "Grace Hopper",
            "Dave Hyatt",
            "Miguel de Icaza",
            "Roberto Ierusalimschy",
            "Dan Ingalls",
            "Toru Iwatani",
            "Bo Jangeborg",
            "Paul Jardetzky",
            "Lynne Jolitz",
            "William Jolitz",
            "Bill Joy",
            "Mitch Kapor",
            "Phil Katz",
            "Alan Kay",
            "Mel Kaye",
            "Brian Kernighan",
            "Dennis Ritchie",
            "Jim Knopf",
            "Andre LaMothe",
            "Leslie Lamport",
            "Butler Lampson",
            "Sam Lantinga",
            "Chris Lattner",
            "Samuel J Leffler",
            "Rasmus Lerdorf",
            "Linus torvalds"
        ];
        var nameDataSrc = "http://en.wikipedia.org/w/api.php?format=json&action=query&titles=List_of_programmers&prop=revisions&rvprop=content";
        function init(callback)
        {
        }
        NameGenerator.init = init;
        function randomName()
        {
            if (randomNamesList.length == 0)
            {
                return "Error with genertor";
            }
            return Utilies.pickUnqine(randomNamesList, "names");
        }
        NameGenerator.randomName = randomName;
    })(NameGenerator || (NameGenerator = {}));
    var WormAnimationManger = (function ()
    {
        function WormAnimationManger(worm)
        {
            this.worm = worm;
            this.currentState = WormAnimationManger.WORM_STATE.idle;
            this.idleTimer = new Timer(100);
            this.previouslySelectedWeapon = this.worm.team.getWeaponManager().getCurrentWeapon();
        }
        WormAnimationManger.WORM_STATE = {
            idle: 0,
            walking: 1,
            jumping: 2,
            failing: 3,
            aiming: 4
        };
        WormAnimationManger.playerAttentionSemaphore = 0;
        WormAnimationManger.prototype.setState = function (state)
        {
            this.currentState = state;
        };
        WormAnimationManger.prototype.getState = function ()
        {
            return this.currentState;
        };
        WormAnimationManger.prototype.setIdleAnimation = function ()
        {
            var _this = this;
            if (this.worm.isActiveWorm() && this.worm.spriteDef != Sprites.worms.die)
            {
                this.worm.setSpriteDef(this.worm.team.getWeaponManager().getCurrentWeapon().takeOutAnimations, false, true);
                this.worm.onAnimationFinish(function ()
                {
                    _this.worm.setSpriteDef(_this.worm.team.getWeaponManager().getCurrentWeapon().takeAimAnimations);
                    _this.worm.setCurrentFrame(_this.worm.target.previousSpriteFrame);
                    _this.worm.finished = true;
                    _this.currentState = WormAnimationManger.WORM_STATE.aiming;
                });
            } else
            {
                if (this.worm.health > 30)
                {
                    this.worm.setSpriteDef(Sprites.worms.idle1);
                } else
                {
                    this.worm.setSpriteDef(Sprites.worms.hurt);
                }
            }
        };
        WormAnimationManger.prototype.update = function ()
        {
            var _this = this;
            if (GameInstance.wormManager.areAllWormsStationary() && this.worm.health == 0 && WormAnimationManger.playerAttentionSemaphore == 0 && this.worm.spriteDef != Sprites.worms.die)
            {
                WormAnimationManger.playerAttentionSemaphore++;
                GameInstance.camera.panToPosition(Physics.vectorMetersToPixels(this.worm.body.GetPosition()));
                this.worm.onAnimationFinish(function ()
                {
                    _this.worm.isDead = true;
                    var effectedRadius = Physics.pixelToMeters(50);
                    var maxDamage = 10;
                    var explosiveForce = 20;
                    var explosionRadius = 40;
                    var animation = Effects.explosion(_this.worm.body.GetPosition(), explosionRadius, effectedRadius, explosiveForce, maxDamage);
                    animation.onAnimationFinish(function ()
                    {
                        WormAnimationManger.playerAttentionSemaphore--;
                    });
                });
                this.worm.setSpriteDef(Sprites.worms.die, true, true);
                this.worm.setNoLoop(true);
                Utilies.pickRandomSound([
                    "byebye",
                    "ohdear",
                    "fatality"
                ]).play(1, 2);
            }
            if (GameInstance.wormManager.areAllWormsStationary() && this.worm.damageTake > 0)
            {
                WormAnimationManger.playerAttentionSemaphore++;
                var animation = new ToostMessage(Physics.vectorMetersToPixels(this.worm.body.GetPosition()), this.worm.damageTake, this.worm.team.color);
                animation.onAnimationFinish(function ()
                {
                    WormAnimationManger.playerAttentionSemaphore--;
                    GameInstance.healthMenu.update(_this.worm.team);
                    if (GameInstance.state.getCurrentPlayer().getTeam().getCurrentWorm() == _this.worm)
                    {
                        GameInstance.state.tiggerNextTurn();
                    }
                });
                GameInstance.particleEffectMgmt.add(animation);
                this.worm.setHealth(this.worm.getHealth() - this.worm.damageTake);
                this.worm.damageTake = 0;
            }
            if (this.previouslySelectedWeapon != this.worm.team.getWeaponManager().getCurrentWeapon())
            {
                this.previouslySelectedWeapon = this.worm.team.getWeaponManager().getCurrentWeapon();
                this.setIdleAnimation();
            }
            if (this.currentState == WormAnimationManger.WORM_STATE.walking)
            {
                this.worm.setSpriteDef(Sprites.worms.walking);
                this.idleTimer.reset();
            }
            if (this.worm.canJump == 0 && this.worm.body.GetLinearVelocity().y > 0)
            {
                this.worm.setSpriteDef(Sprites.worms.falling);
                this.currentState = WormAnimationManger.WORM_STATE.failing;
                this.idleTimer.reset();
            } else if (this.worm.canJump == 0 && this.worm.body.GetLinearVelocity().y < 0)
            {
                this.worm.setSpriteDef(Sprites.worms.jumpBegin);
                this.currentState = WormAnimationManger.WORM_STATE.jumping;
                this.idleTimer.reset();
            }
            if (this.idleTimer.hasTimePeriodPassed())
            {
                this.idleTimer.pause();
                this.setIdleAnimation();
            }
            this.idleTimer.update();
        };
        return WormAnimationManger;
    })();
    var Target = (function (_super)
    {
        __extends(Target, _super);
        function Target(worm)
        {
            _super.call(this, new b2Vec2(0, 0), Physics.vectorMetersToPixels(worm.body.GetPosition()), Sprites.weapons.redTarget);
            this.targetDirection = new b2Vec2(1, 0.0);
            this.rotationRate = 4;
            this.worm = worm;
            this.direction = this.worm.direction;
        }
        Target.prototype.draw = function (ctx)
        {
            if (this.worm.isActiveWorm() && this.worm.getWeapon().requiresAiming)
            {
                var radius = this.worm.fixture.GetShape().GetRadius() * Physics.worldScale;
                var wormPos = Physics.vectorMetersToPixels(this.worm.body.GetPosition());
                var targetDir = this.targetDirection.Copy();
                targetDir.Multiply(95);
                targetDir.Add(wormPos);
                _super.prototype.draw.call(this, ctx, targetDir.x - radius, targetDir.y - (radius * 2));
            }
        };
        Target.prototype.getTargetDirection = function ()
        {
            return this.targetDirection;
        };
        Target.prototype.setTargetDirection = function (vector)
        {
            this.targetDirection = vector;
        };
        Target.prototype.changeDirection = function (dir)
        {
            var td = this.targetDirection.Copy();
            var currentAngle = Utilies.toDegrees(Utilies.vectorToAngle(td));
            if (dir == Worm.DIRECTION.left && this.direction != dir)
            {
                this.direction = dir;
                var currentAngle = Utilies.toDegrees(Utilies.toRadians(180) - Utilies.vectorToAngle(td));
                this.targetDirection = Utilies.angleToVector(Utilies.toRadians(currentAngle));
            } else if (dir == Worm.DIRECTION.right && this.direction != dir)
            {
                this.direction = dir;
                var currentAngle = Utilies.toDegrees(Utilies.toRadians(-180) - Utilies.vectorToAngle(td));
                this.targetDirection = Utilies.angleToVector(Utilies.toRadians(currentAngle));
            }
        };
        Target.prototype.aim = function (upOrDown)
        {
            upOrDown *= this.worm.direction;
            var td = this.targetDirection.Copy();
            var currentAngle = Utilies.toDegrees(Utilies.toRadians(this.rotationRate * upOrDown) + Utilies.vectorToAngle(td));
            this.worm.setCurrentFrame(this.worm.getCurrentFrame() + (Utilies.sign(upOrDown * -this.worm.direction) * 0.6));
            if (this.worm.getTotalFrames() >= 32)
            {
                this.previousSpriteFrame = this.worm.getCurrentFrame();
            }
            if (this.direction == Worm.DIRECTION.right)
            {
                if (currentAngle > -90 && currentAngle < 90)
                {
                    this.targetDirection = Utilies.angleToVector(Utilies.toRadians(currentAngle));
                }
            } else
            {
                if ((currentAngle > 90) || (currentAngle < -90))
                {
                    this.targetDirection = Utilies.angleToVector(Utilies.toRadians(currentAngle));
                }
            }
        };
        return Target;
    })(PhysicsSprite);
    var Worm = (function (_super)
    {
        __extends(Worm, _super);
        function Worm(team, x, y)
        {
            _super.call(this, Sprites.worms.idle1);
            this.name = NameGenerator.randomName();
            this.health = 80;
            this.damageTake = 0;
            this.team = team;
            x = Physics.pixelToMeters(x);
            y = Physics.pixelToMeters(y);
            var circleRadius = (AssetManager.getImage(this.spriteDef.imageName).width / 2) / Physics.worldScale;
            var fixDef = new b2FixtureDef();
            fixDef.density = Worm.DENSITY;
            fixDef.friction = 1.0;
            fixDef.restitution = 0.1;
            fixDef.shape = new b2CircleShape(circleRadius);
            fixDef.shape.SetLocalPosition(new b2Vec2(0, (circleRadius) * -1));
            var bodyDef = new b2BodyDef();
            bodyDef.type = b2Body.b2_dynamicBody;
            bodyDef.position.x = x;
            bodyDef.position.y = y;
            this.fixture = Physics.world.CreateBody(bodyDef).CreateFixture(fixDef);
            this.body = this.fixture.GetBody();
            this.body.SetFixedRotation(true);
            this.body.SetSleepingAllowed(false);
            this.direction = 1;
            this.speed = 1.2;
            fixDef.shape = new b2PolygonShape();
            fixDef.shape.SetAsBox(circleRadius / 2, circleRadius / 4);
            fixDef.isSensor = true;
            this.footSensor = this.body.CreateFixture(fixDef);
            this.body.SetUserData(this);
            this.stateAnimationMgmt = new WormAnimationManger(this);
            this.canJump = 0;
            this.target = new Target(this);
            this.isDead = false;
            this.soundDelayTimer = new Timer(200);
            this.preRendering();
            this.fallHeight = this.body.GetPosition().y;
            Physics.addToFastAcessList(this.body);
        }
        Worm.DENSITY = 10.0;
        Worm.DIRECTION = {
            left: -1,
            right: 1
        };
        Worm.prototype.getWormNetData = function ()
        {
            return {
                "x": this.body.GetPosition().x,
                "y": this.body.GetPosition().y,
                "arrow": this.arrow
            };
        };
        Worm.prototype.setWormNetData = function (packetStream)
        {
            Logger.log(" old pos " + this.body.m_xf.position.x + " new pos " + packetStream.x);
            this.body.SetPosition(new b2Vec2(packetStream.x, packetStream.y));
        };
        Worm.prototype.preRendering = function ()
        {
            var _this = this;
            var nameBoxWidth = this.name.length * 10;
            var healthBoxWidth = 39;
            var healthBoxHeight = 18;
            this.nameBox = Graphics.preRenderer.render(function (ctx)
            {
                ctx.fillStyle = '#1A1110';
                ctx.strokeStyle = "#eee";
                ctx.font = 'bold 16.5px Sans-Serif';
                ctx.textAlign = 'center';
                Graphics.roundRect(ctx, 0, 0, nameBoxWidth, 20, 4).fill();
                Graphics.roundRect(ctx, 0, 0, nameBoxWidth, 20, 4).stroke();
                ctx.fillStyle = _this.team.color;
                ctx.fillText(_this.name, (_this.name.length * 10) / 2, 15);
            }, nameBoxWidth, 20);
            this.healthBox = Graphics.preRenderer.render(function (ctx)
            {
                ctx.fillStyle = '#1A1110';
                ctx.strokeStyle = "#eee";
                ctx.font = 'bold 16.5px Sans-Serif';
                ctx.textAlign = 'center';
                Graphics.roundRect(ctx, 0, 0, healthBoxWidth, healthBoxHeight, 4).fill();
                Graphics.roundRect(ctx, 0, 0, healthBoxWidth, healthBoxHeight, 4).stroke();
                ctx.fillStyle = _this.team.color;
                ctx.fillText(Math.floor(_this.health), healthBoxWidth / 2, healthBoxHeight - 3);
            }, 39, 20);
        };
        Worm.prototype.getHealth = function ()
        {
            return this.health;
        };
        Worm.prototype.setHealth = function (health)
        {
            if (health > 0)
            {
                this.health = health;
            } else
            {
                this.health = 0;
            }
            this.preRendering();
        };
        Worm.prototype.getWeapon = function ()
        {
            return this.team.getWeaponManager().getCurrentWeapon();
        };
        Worm.prototype.beginContact = function (contact)
        {
            if (Physics.isCollisionBetweenTypes(Terrain, Worm, contact))
            {
                if (this.footSensor == contact.GetFixtureA() || this.footSensor == contact.GetFixtureB())
                {
                    this.canJump++;
                    if (this.spriteDef == Sprites.worms.wbackflp)
                    {
                        this.setSpriteDef(Sprites.worms.wbackflp, false);
                        this.setSpriteDef(Sprites.worms.idle1, false);
                    }
                }
            }
        };
        Worm.prototype.endContact = function (contact)
        {
            if (Physics.isCollisionBetweenTypes(Terrain, Worm, contact))
            {
                if (this.footSensor == contact.GetFixtureA() || this.footSensor == contact.GetFixtureB())
                {
                    this.canJump--;
                }
            }
        };
        Worm.prototype.postSolve = function (contact, impulse)
        {
            if (contact.GetFixtureA() instanceof BaseWeapon == false && contact.GetFixtureB() instanceof BaseWeapon == false)
            {
                var impactTheroshold = 8 * Worm.DENSITY;
                if ((this.getWeapon() instanceof JetPack) && this.getWeapon().getIsActive())
                {
                    impactTheroshold += 2 * Worm.DENSITY;
                }
                if ((this.getWeapon() instanceof NinjaRope) == false || this.getWeapon().getIsActive() == false)
                {
                    if (impulse.normalImpulses[0] > impactTheroshold)
                    {
                        var damage = Math.round(impulse.normalImpulses[0]) / Worm.DENSITY;
                        Logger.log(damage);
                        if (damage > 10)
                        {
                            damage = 10;
                        }
                        this.hit(damage);
                    }
                    if (impulse.normalImpulses[0] > 25)
                    {
                        AssetManager.getSound("WormLanding").play();
                    }
                }
            }
        };
        Worm.prototype.isStationary = function ()
        {
            var isStationary = this.body.GetLinearVelocity().Length() == 0 || Utilies.isBetweenRange(this.body.GetLinearVelocity().y, 0.001, -0.001) && Utilies.isBetweenRange(this.body.GetLinearVelocity().x, 0.001, -0.001);
            return isStationary;
        };
        Worm.prototype.fire = function ()
        {
            if (GameInstance.state.hasNextTurnBeenTiggered() == false)
            {
                var weapon = this.team.getWeaponManager().getCurrentWeapon();
                weapon.activate(this);
                if (this.arrow)
                {
                    this.arrow.finished = true;
                }
                weapon.getForceIndicator().reset();
            }
        };
        Worm.prototype.playWalkingSound = function ()
        {
            if (this.soundDelayTimer.hasTimePeriodPassed())
            {
                if (this.spriteDef == Sprites.worms.walking)
                {
                    if (_super.prototype.getCurrentFrame.call(this) % 5 == 0)
                    {
                        AssetManager.getSound("WalkCompress").play(0.5);
                    } else
                    {
                        AssetManager.getSound("WalkExpand").play(0.5);
                    }
                }
            }
        };
        Worm.prototype.walkLeft = function ()
        {
            if (WormAnimationManger.playerAttentionSemaphore == 0)
            {
                var currentPos = this.body.GetPosition();
                this.direction = Worm.DIRECTION.left;
                this.target.changeDirection(Worm.DIRECTION.left);
                this.stateAnimationMgmt.setState(WormAnimationManger.WORM_STATE.walking);
                _super.prototype.update.call(this);
                this.body.SetPosition(new b2Vec2(currentPos.x - this.speed / Physics.worldScale, currentPos.y));
                this.playWalkingSound();
            }
            if (this.arrow)
            {
                this.arrow.finished = true;
            }
        };
        Worm.prototype.walkRight = function ()
        {
            if (WormAnimationManger.playerAttentionSemaphore == 0)
            {
                var currentPos = this.body.GetPosition();
                this.direction = Worm.DIRECTION.right;
                this.target.changeDirection(Worm.DIRECTION.right);
                this.stateAnimationMgmt.setState(WormAnimationManger.WORM_STATE.walking);
                _super.prototype.update.call(this);
                this.body.SetPosition(new b2Vec2(currentPos.x + this.speed / Physics.worldScale, currentPos.y));
                this.playWalkingSound();
                if (this.arrow)
                {
                    this.arrow.finished = true;
                }
            }
        };
        Worm.prototype.jump = function ()
        {
            if (WormAnimationManger.playerAttentionSemaphore == 0)
            {
                if (this.canJump > 0)
                {
                    var currentPos = this.body.GetPosition();
                    var forces = new b2Vec2(this.direction, -2);
                    forces.Multiply(1.5 * Worm.DENSITY);
                    this.body.ApplyImpulse(forces, this.body.GetPosition());
                }
                if (this.arrow)
                {
                    this.arrow.finished = true;
                }
            }
        };
        Worm.prototype.backFlip = function ()
        {
            var _this = this;
            if (WormAnimationManger.playerAttentionSemaphore == 0)
            {
                if (this.canJump > 0)
                {
                    this.onAnimationFinish(function ()
                    {
                        _this.setSpriteDef(Sprites.worms.wbackflp, false);
                        _this.setSpriteDef(Sprites.worms.idle1, false);
                    });
                    this.setSpriteDef(Sprites.worms.wbackflp, true, true);
                    var currentPos = this.body.GetPosition();
                    var forces = new b2Vec2(this.direction * -1, -2);
                    forces.Multiply(2.3 * Worm.DENSITY);
                    this.body.ApplyImpulse(forces, this.body.GetPosition());
                }
                if (this.arrow)
                {
                    this.arrow.finished = true;
                }
            }
        };
        Worm.prototype.hit = function (damage, worm, overrideClientOnlyUse)
        {
            if (typeof worm === "undefined") { worm = null; }
            if (typeof overrideClientOnlyUse === "undefined") { overrideClientOnlyUse = false; }
            {
                if (this.isDead == false)
                {
                    if (overrideClientOnlyUse || Client.isClientsTurn())
                    {
                        console.log("CLIENT HIT");
                        this.damageTake += damage;
                        GameInstance.wormManager.syncHit(this.name, damage);
                        AssetManager.getSound("ow" + Utilies.random(1, 2)).play(0.8);
                    }
                    if (this.getWeapon() instanceof JetPack)
                    {
                        this.getWeapon().deactivate();
                    }
                    if (worm && worm != this && worm.team == this.team)
                    {
                        AssetManager.getSound("traitor").play(0.8, 10);
                    } else if (worm)
                    {
                        Utilies.pickRandomSound([
                            "justyouwait",
                            "youllregretthat"
                        ]).play(0.8, 10);
                    }
                }
            }
        };
        Worm.prototype.activeWorm = function ()
        {
            {
                var pos = Physics.vectorMetersToPixels(this.body.GetPosition());
                this.arrow = new BounceArrow(pos);
                GameInstance.miscellaneousEffects.add(this.arrow);
            }
        };
        Worm.prototype.isActiveWorm = function ()
        {
            return this.team.getCurrentWorm() == this && GameInstance.state.getCurrentPlayer().getTeam() == this.team;
        };
        Worm.prototype.update = function ()
        {
            if (this.isDead == false)
            {
                this.soundDelayTimer.update();
                this.stateAnimationMgmt.update();
                _super.prototype.update.call(this);
                this.stateAnimationMgmt.setState(WormAnimationManger.WORM_STATE.idle);
                if (this.isActiveWorm())
                {
                    this.team.getWeaponManager().getCurrentWeapon().update();
                }
                this.target.update();
            } else
            {
                if (Sprites.worms.die == this.spriteDef)
                {
                    this.setSpriteDef(Sprites.worms.die, false);
                    this.setSpriteDef(Sprites.particleEffects[this.team.graveStone], true);
                }
                if (this.getCurrentFrame() >= this.getTotalFrames() - 1)
                {
                    this.setCurrentFrame(this.getTotalFrames() - 1);
                    this.frameIncremeter *= -1;
                } else if (this.getCurrentFrame() <= 0)
                {
                    this.setCurrentFrame(0);
                    this.frameIncremeter *= -1;
                }
                _super.prototype.update.call(this);
            }
        };
        Worm.prototype.draw = function (ctx)
        {
            this.team.getWeaponManager().getCurrentWeapon().draw(ctx);
            if (Sprites.worms.weWon != this.spriteDef && this.isActiveWorm())
            {
                if (this.isDead == false && Client.isClientsTurn())
                {
                    this.target.draw(ctx);
                }
            }
            ctx.save();
            var radius = this.fixture.GetShape().GetRadius() * Physics.worldScale;
            ctx.translate(Physics.metersToPixels(this.body.GetPosition().x), Physics.metersToPixels(this.body.GetPosition().y));
            ctx.save();
            if (this.direction == Worm.DIRECTION.right)
            {
                ctx.scale(-1, 1);
            }
            _super.prototype.draw.call(this, ctx, -this.getFrameWidth() / 2, -this.getFrameHeight() / 1.5);
            ctx.restore();
            if (this.isDead == false)
            {
                var nameBoxX = -radius * this.name.length / 2.6;
                var nameBoxY = -radius * 6;
                ctx.drawImage(this.nameBox, nameBoxX, nameBoxY);
                ctx.drawImage(this.healthBox, -radius * 1.5, -radius * 4);
            }
            ctx.restore();
            if (this.isActiveWorm())
            {
                this.getWeapon().getForceIndicator().draw(ctx, this);
            }
        };
        return Worm;
    })(Sprite);
    var WormDataPacket = (function ()
    {
        function WormDataPacket(worm)
        {
            this.name = worm.name;
            this.position = worm.body.GetPosition();
        }
        WormDataPacket.prototype.override = function (worm)
        {
            worm.name = this.name;
            worm.body.SetPosition(new b2Vec2(this.position.x, this.position.y));
            worm.preRendering();
        };
        return WormDataPacket;
    })();
    var Controls;
    (function (Controls)
    {
        Controls.toggleWeaponMenu = {
            gamepad: -1,
            keyboard: 101,
            mouse: 3
        };
        Controls.walkLeft = {
            gamepad: -1,
            keyboard: 65,
            mouse: -1
        };
        Controls.walkRight = {
            gamepad: -1,
            keyboard: 68,
            mouse: -1
        };
        Controls.jump = {
            gamepad: -1,
            keyboard: 32,
            mouse: -1
        };
        Controls.backFlip = {
            gamepad: -1,
            keyboard: keyboard.keyCodes.Backspace,
            mouse: -1
        };
        Controls.aimUp = {
            gamepad: -1,
            keyboard: 87,
            mouse: -1
        };
        Controls.aimDown = {
            gamepad: -1,
            keyboard: 83,
            mouse: -1
        };
        Controls.fire = {
            gamepad: -1,
            keyboard: 13,
            mouse: 1
        };
        function checkControls(control, key)
        {
            return (key == control.gamepad || key == control.keyboard || key == control.mouse);
        }
        Controls.checkControls = checkControls;
    })(Controls || (Controls = {}));
    var WeaponsMenu = (function ()
    {
        function WeaponsMenu()
        {
            var _this = this;
            this.cssId = "weaponsMenu";
            this.toggleButtonCssId = "weaponsMenuBtn";
            $('body').append("<div id=" + this.cssId + "><div id=" + this.toggleButtonCssId + ">Weapons Menu</div><div id=content></div></div>");
            this.htmlElement = $("#" + this.cssId);
            $('#' + this.toggleButtonCssId).click(function ()
            {
                if (Client.isClientsTurn())
                {
                    _this.toggle();
                }
            });
            var _this = this;
            $(window).keypress(function (event)
            {
                if (Client.isClientsTurn() && Controls.checkControls(Controls.toggleWeaponMenu, event.which))
                {
                    _this.toggle();
                }
            });
            $('body').mousedown(function (event)
            {
                if (Client.isClientsTurn() && Controls.checkControls(Controls.toggleWeaponMenu, event.which))
                {
                    _this.toggle();
                }
            });
            $('body').on('contextmenu', "#" + this.cssId, function (e)
            {
                return false;
            });
            this.isVisable = false;
        }
        WeaponsMenu.prototype.selectWeapon = function (weaponId)
        {
            var weaponMgmt = GameInstance.state.getCurrentPlayer().getTeam().getWeaponManager();
            if (weaponMgmt.checkWeaponHasAmmo(weaponId))
            {
                weaponMgmt.setCurrentWeapon(weaponId);
                Client.sendImmediately(Events.client.ACTION, new InstructionChain("state.getCurrentPlayer.getTeam.getWeaponManager.setCurrentWeapon", [
                    weaponId
                ]));
            }
        };
        WeaponsMenu.prototype.show = function ()
        {
            this.htmlElement.show();
        };
        WeaponsMenu.prototype.refresh = function ()
        {
            var weaponMgmt = GameInstance.state.getCurrentPlayer().getTeam().getWeaponManager();
            this.populateMenu(weaponMgmt.getListOfWeapons());
        };
        WeaponsMenu.prototype.toggle = function ()
        {
            this.refresh();
            var moveAmountInPx;
            if (this.isVisable)
            {
                moveAmountInPx = "0px";
                this.isVisable = false;
            } else
            {
                moveAmountInPx = "-275px";
                this.isVisable = true;
            }
            this.htmlElement.animate({
                marginLeft: moveAmountInPx
            }, 400);
        };
        WeaponsMenu.prototype.populateMenu = function (listOfWeapons)
        {
            var html = "<ul class = \"thumbnails\" >";
            for (var weapon in listOfWeapons)
            {
                var currentWeapon = listOfWeapons[weapon];
                var cssClassType = "ammo";
                if (currentWeapon.ammo <= 0)
                {
                    cssClassType = "noAmmo";
                    weapon = "-1";
                }
                html += "<li class=span1 id=" + weapon + ">";
                html += "<a  class=\"thumbnail " + cssClassType + "\" id=" + weapon + " value=" + currentWeapon.name + "  title= " + currentWeapon.name + "><span class=ammoCount> " + currentWeapon.ammo + "</span><img title= " + currentWeapon.name + " src=" + currentWeapon.iconImage.src + " alt=" + currentWeapon.name + "></a>";
                html += "</li>";
            }
            html += "</ul>";
            $($(this.htmlElement).children().get(1)).empty();
            $($(this.htmlElement).children().get(1)).append(html);
            var _this = this;
            $("#" + this.cssId + " li").click(function ()
            {
                var weaponId = parseInt($(this).attr('id'));
                if (weaponId == -1)
                {
                    AssetManager.getSound("cantclickhere").play();
                    return;
                }
                AssetManager.getSound("CursorSelect").play();
                _this.selectWeapon(weaponId);
                _this.toggle();
            });
        };
        return WeaponsMenu;
    })();
    var GamePad = (function ()
    {
        function GamePad()
        {
            this.isConnected = false;
            this.pad = null;
        }
        GamePad.numPads = 0;
        GamePad.prototype.connect = function ()
        {
            try
            {
                (navigator).webkitGetGamepads();
            } catch (e)
            {
                return false;
            }
            var gamepadSupportAvailable = !!(navigator).webkitGetGamepads || !!(navigator).webkitGamepads || (navigator).webkitGamepads[0] != undefined;
            if (gamepadSupportAvailable == false || this.isConnected)
            {
                return false;
            } else
            {
                var pads = (navigator).webkitGetGamepads();
                if (pads[GamePad.numPads] != undefined)
                {
                    this.padNumber = GamePad.numPads;
                    this.pad = pads[GamePad.numPads];
                    this.isConnected = true;
                    GamePad.numPads++;
                }
            }
        };
        GamePad.prototype.update = function ()
        {
            if (this.isConnected)
            {
                this.pad = (navigator).webkitGetGamepads()[this.padNumber];
            }
        };
        GamePad.prototype.isButtonPressed = function (buttonId)
        {
            if (this.isConnected)
            {
                return this.pad.buttons[buttonId] && (this.pad.buttons[buttonId] == 1);
            } else
            {
                return false;
            }
        };
        GamePad.prototype.getAxis = function (axisId)
        {
            if (this.isConnected)
            {
                if (typeof this.pad.axes[axisId] != 'undefined')
                {
                    return this.pad.axes[axisId];
                }
            }
            return false;
        };
        return GamePad;
    })();
    function Stick(maxLength, active)
    {
        if (typeof active === "undefined") { active = false; }
        this.active = active;
        this.atLimit = false;
        this.length = 1;
        this.maxLength = maxLength;
        this.limit = {
            x: 0,
            y: 0
        };
        this.input = {
            x: 0,
            y: 0
        };
    }
    ;
    Stick.prototype.getRadians = function (x, y)
    {
        return Math.atan2(x, -y);
    };
    Stick.prototype.getVectorFromRadians = function (radians, length)
    {
        length = (Number(length) || 1);
        return {
            x: (Math.sin(radians) * length),
            y: (-Math.cos(radians) * length)
        };
    };
    Stick.prototype.getVectorLength = function (v)
    {
        return Math.sqrt((v.x * v.x) + (v.y * v.y));
    };
    Stick.prototype.getVectorNormal = function (v)
    {
        var len = this.getVectorLength(v);
        if (len === 0)
        {
            return v;
        } else
        {
            return {
                x: (v.x * (1 / len)),
                y: (v.y * (1 / len))
            };
        }
    };
    Stick.prototype.setLimitXY = function (x, y)
    {
        this.limit = {
            x: x,
            y: y
        };
    };
    Stick.prototype.setInputXY = function (x, y)
    {
        this.input = {
            x: x,
            y: y
        };
    };
    Stick.prototype.subtractVectors = function (v1, v2)
    {
        return {
            x: (v1.x - v2.x),
            y: (v1.y - v2.y)
        };
    };
    Stick.prototype.update = function ()
    {
        var diff = this.subtractVectors(this.input, this.limit);
        var length = this.getVectorLength(diff);
        if (Math.round(length) >= this.maxLength)
        {
            length = this.maxLength;
            var rads = this.getRadians(diff.x, diff.y);
            this.atLimit = true;
            this.input = this.getVectorFromRadians(rads, length);
            this.input.x += this.limit.x;
            this.input.y += this.limit.y;
        } else
        {
            this.atLimit = false;
        }
        this.length = length;
        this.normal = this.getVectorNormal(diff);
    };
    function TwinStickControls(canvas)
    {
        this.limitSize = 64;
        this.inputSize = 36;
        this.sticks = [
            new Stick(this.inputSize)
        ];
        var _this = this;
        canvas.addEventListener("touchstart", function (e)
        {
            e.preventDefault();
            for (var i = 0; i < e.touches.length; ++i)
            {
                var stick = _this.sticks[i];
                var touch = e.touches[i];
                stick.setLimitXY(touch.pageX, touch.pageY);
                stick.setInputXY(touch.pageX, touch.pageY);
                stick.active = true;
            }
        });
        document.addEventListener("touchmove", function (e)
        {
            e.preventDefault();
            for (var i = 0; i < e.touches.length; ++i)
            {
                var stick = _this.sticks[i];
                var touch = e.touches[i];
                stick.setInputXY(touch.pageX, touch.pageY);
            }
        });
        document.addEventListener("touchend", function (e)
        {
            var touches = e.changedTouches;
            for (var i = 0; i < touches.length; ++i)
            {
                var stick = _this.sticks[i];
                stick.active = false;
            }
        });
    }
    TwinStickControls.prototype.update = function ()
    {
        for (var i = 0; i < this.sticks.length; ++i)
        {
            this.sticks[i].update();
        }
    };
    TwinStickControls.prototype.getNormal = function (stickId)
    {
        if (this.sticks[stickId].active && this.sticks[stickId].length > 30)
        {
            return this.sticks[stickId].normal;
        }
        return {
            "x": 0,
            "y": 0
        };
    };
    TwinStickControls.prototype.draw = function (context)
    {
        for (var i = 0; i < this.sticks.length; ++i)
        {
            var stick = this.sticks[i];
            if (stick.active)
            {
                context.save();
                context.beginPath();
                context.arc(stick.limit.x, stick.limit.y, this.limitSize, 0, (Math.PI * 2), true);
                context.lineWidth = 3;
                if (stick.atLimit)
                {
                    context.strokeStyle = "#08c";
                } else
                {
                    context.strokeStyle = "rgb(0, 0, 0)";
                }
                context.stroke();
                context.beginPath();
                context.arc(stick.limit.x, stick.limit.y, (this.limitSize / 2), 0, (Math.PI * 2), true);
                context.lineWidth = 2;
                context.strokeStyle = "rgb(200, 200, 200)";
                context.stroke();
                context.drawImage(AssetManager.getImage("stick"), stick.input.x - (this.inputSize), stick.input.y - (this.inputSize), this.inputSize * 2, this.inputSize * 2);
                context.restore();
            }
        }
    };
    var Player = (function ()
    {
        function Player(playerId)
        {
            if (typeof playerId === "undefined")
            {
                playerId = Utilies.pickUnqine([
                    1,
                    2,
                    3,
                    4
                ], "playerids");
            }
            var _this = this;
            this.id = playerId;
            this.team = new Team(playerId);
            $(window).keyup(function (e)
            {
                if (e.which == Controls.fire.keyboard)
                {
                    var wormWeapon = _this.team.getCurrentWorm().getWeapon();
                    if (wormWeapon.getForceIndicator().isRequired() && wormWeapon.getForceIndicator().getForce() > 1 && wormWeapon.getIsActive() == false)
                    {
                        _this.team.getCurrentWorm().fire();
                        Client.sendImmediately(Events.client.CURRENT_WORM_ACTION, new InstructionChain("fire"));
                        GameInstance.weaponMenu.refresh();
                    }
                }
            });
            this.timer = new Timer(10);
            this.gamePad = new GamePad();
        }
        Player.prototype.getPlayerNetData = function ()
        {
            return this.team.getTeamNetData();
        };
        Player.prototype.setPlayerNetData = function (data)
        {
            this.team.setTeamNetData(data);
        };
        Player.prototype.getTeam = function ()
        {
            return this.team;
        };
        Player.prototype.weaponFireOrCharge = function ()
        {
            var wormWeapon = this.team.getCurrentWorm().getWeapon();
            if (wormWeapon.getForceIndicator().isRequired() && wormWeapon.getIsActive() == false)
            {
                if (wormWeapon.ammo > 0 && this.team.getCurrentWorm().getWeapon().getForceIndicator().charge(3))
                {
                    this.team.getCurrentWorm().fire();
                    GameInstance.weaponMenu.refresh();
                } else if (wormWeapon.ammo <= 0)
                {
                    Notify.display("Out of Ammo", "No more ammo left in your " + wormWeapon.name + " Select a new weapon ", 5000);
                    AssetManager.getSound("cantclickhere").play();
                }
            } else
            {
                this.team.getCurrentWorm().fire();
                GameInstance.weaponMenu.refresh();
            }
        };
        Player.prototype.update = function ()
        {
            this.timer.update();
            this.gamePad.connect();
            this.gamePad.update();
            var onlineSpefic = Client.isClientsTurn();
            if (onlineSpefic && GameInstance.state.getCurrentPlayer() == this && GameInstance.state.hasNextTurnBeenTiggered() == false)
            {
                if (keyboard.isKeyDown(Controls.jump.keyboard, true) || this.gamePad.isButtonPressed(0) || TouchUI.isJumpDown(true))
                {
                    this.team.getCurrentWorm().jump();
                    Client.sendImmediately(Events.client.CURRENT_WORM_ACTION, new InstructionChain("jump"));
                }
                if (keyboard.isKeyDown(Controls.backFlip.keyboard, true) || this.gamePad.isButtonPressed(0))
                {
                    this.team.getCurrentWorm().backFlip();
                    Client.sendImmediately(Events.client.CURRENT_WORM_ACTION, new InstructionChain("backFlip"));
                }
                if (keyboard.isKeyDown(Controls.walkLeft.keyboard) || this.gamePad.isButtonPressed(14) || this.gamePad.getAxis(0) > 0.5 || GameInstance.sticks.getNormal(0).x < -0.5)
                {
                    this.team.getCurrentWorm().walkLeft();
                    Client.sendImmediately(Events.client.CURRENT_WORM_ACTION, new InstructionChain("walkLeft"));
                }
                if (keyboard.isKeyDown(Controls.walkRight.keyboard) || this.gamePad.isButtonPressed(15) || this.gamePad.getAxis(0) > 0.5 || GameInstance.sticks.getNormal(0).x > 0.5)
                {
                    this.team.getCurrentWorm().walkRight();
                    Client.sendImmediately(Events.client.CURRENT_WORM_ACTION, new InstructionChain("walkRight"));
                }
                if (keyboard.isKeyDown(Controls.aimUp.keyboard) || this.gamePad.getAxis(2) >= 0.2 || this.gamePad.getAxis(3) >= 0.2 || GameInstance.sticks.getNormal(0).y < -0.6)
                {
                    var currentWrom = this.team.getCurrentWorm();
                    currentWrom.target.aim(-0.8);
                    Client.sendImmediately(Events.client.CURRENT_WORM_ACTION, new InstructionChain("target.aim", [
                        -0.8
                    ]));
                }
                if (keyboard.isKeyDown(Controls.aimDown.keyboard) || this.gamePad.getAxis(2) <= -0.2 || this.gamePad.getAxis(3) <= -0.2 || GameInstance.sticks.getNormal(0).y > 0.6)
                {
                    var currentWrom = this.team.getCurrentWorm();
                    currentWrom.target.aim(0.8);
                    Client.sendImmediately(Events.client.CURRENT_WORM_ACTION, new InstructionChain("target.aim", [
                        0.8
                    ]));
                }
                if (keyboard.isKeyDown(Controls.fire.keyboard, true) || this.gamePad.isButtonPressed(7) || TouchUI.isFireButtonDown())
                {
                    this.weaponFireOrCharge();
                    Client.sendImmediately(Events.client.ACTION, new InstructionChain("state.getCurrentPlayer.weaponFireOrCharge"));
                } else
                {
                    if (TouchUI.isTouchDevice())
                    {
                        var wormWeapon = this.team.getCurrentWorm().getWeapon();
                        if (!TouchUI.isFireButtonDown() && wormWeapon.getForceIndicator().isRequired() && wormWeapon.getForceIndicator().getForce() > 5 && wormWeapon.getIsActive() == false)
                        {
                            this.team.getCurrentWorm().fire();
                            Client.sendImmediately(Events.client.CURRENT_WORM_ACTION, new InstructionChain("fire"));
                            GameInstance.weaponMenu.refresh();
                        }
                    }
                }
            }
            var fastestWorm = GameInstance.wormManager.findFastestMovingWorm();
            if (GameInstance.state.physicsWorldSettled && fastestWorm != null && fastestWorm.body.GetLinearVelocity().Length() > 3)
            {
                GameInstance.camera.panToPosition(Physics.vectorMetersToPixels(fastestWorm.body.GetPosition()));
            }
            if (GameInstance.state.hasNextTurnBeenTiggered() == false)
            {
                if (keyboard.isKeyDown(38))
                {
                    GameInstance.camera.cancelPan();
                    GameInstance.camera.incrementY(-15);
                }
                if (keyboard.isKeyDown(40))
                {
                    GameInstance.camera.cancelPan();
                    GameInstance.camera.incrementY(15);
                }
                if (keyboard.isKeyDown(37))
                {
                    GameInstance.camera.cancelPan();
                    GameInstance.camera.incrementX(-15);
                }
                if (keyboard.isKeyDown(39))
                {
                    GameInstance.camera.cancelPan();
                    GameInstance.camera.incrementX(15);
                }
                var currentWorm = this.team.getCurrentWorm();
                if (GameInstance.state.physicsWorldSettled && currentWorm.body.GetLinearVelocity().Length() >= 0.1)
                {
                    GameInstance.camera.panToPosition(Physics.vectorMetersToPixels(currentWorm.body.GetPosition()));
                } else if (GameInstance.state.physicsWorldSettled && (this.getTeam().getWeaponManager().getCurrentWeapon() instanceof ThrowableWeapon || this.getTeam().getWeaponManager().getCurrentWeapon() instanceof ProjectileWeapon) && this.getTeam().getWeaponManager().getCurrentWeapon().getIsActive())
                {
                    var weapon = this.getTeam().getWeaponManager().getCurrentWeapon();
                    GameInstance.camera.panToPosition(Physics.vectorMetersToPixels(weapon.body.GetPosition()));
                }
            }
            this.team.update();
        };
        Player.prototype.draw = function (ctx)
        {
            this.team.draw(ctx);
        };
        return Player;
    })();
    var PlayerDataPacket = (function ()
    {
        function PlayerDataPacket(player)
        {
            this.teamDataPacket = new TeamDataPacket(player.getTeam());
        }
        PlayerDataPacket.prototype.override = function (player)
        {
            this.teamDataPacket.override(player.getTeam());
        };
        return PlayerDataPacket;
    })();
    var Events;
    (function (Events)
    {
        Events.lobby = {
            CREATE_GAME_LOBBY: "createLob",
            UPDATE_USER_COUNT: "newConnect",
            GOOGLE_PLUS_LOGIN: "gp"
        };
        Events.gameLobby = {
            PLAYER_JOIN: "pJoin",
            START_GAME_FOR_OTHER_CLIENTS: "startForOther",
            START_GAME_HOST: "startG",
            PLAYER_DISCONNECTED: "pd"
        };
        Events.client = {
            UPDATE_ALL_GAME_LOBBIES: "updateLobs",
            ASSIGN_USER_ID: "assignId",
            ACTION: "a",
            UPDATE: "u",
            GET_GAME_TIME: "t",
            CURRENT_WORM_ACTION: "wa"
        };
        Events.server = {
        };
    })(Events || (Events = {}));
    if (typeof exports != 'undefined')
    {
        (module).exports = Events;
    }
    var InstructionChain = (function ()
    {
        function InstructionChain(instructionChain, args)
        {
            if (typeof instructionChain === "undefined") { instructionChain = ""; }
            if (typeof args === "undefined") { args = []; }
            this.iC = instructionChain.split('.');
            this.a = args;
        }
        InstructionChain.prototype.callFunc = function (objectToApplyInstruction)
        {
            var obj = objectToApplyInstruction;
            var objMethod;
            var objCalledMethod;
            if (this.iC.length > 1)
            {
                for (var i = 0; i < this.iC.length - 1; i++)
                {
                    if (typeof obj[this.iC[i]] == "function")
                    {
                        obj = obj[this.iC[i]].call(obj);
                    } else
                    {
                        obj = obj[this.iC[i]];
                    }
                }
                objMethod = this.iC[this.iC.length - 1];
            } else
            {
                obj = objectToApplyInstruction;
                objMethod = this.iC[0];
            }
            obj[objMethod].call(obj, this.a);
        };
        return InstructionChain;
    })();
    var Client;
    (function (Client)
    {
        Client.socket;
        Client.id;
        var packetRateLimiter;
        var previous = "";
        function connectionToServer(ip, port)
        {
            try
            {
                var dest = ip + ":" + port;
                Logger.debug(" Client connecting to " + dest);
                Client.socket = io.connect(dest);
                Client.socket.on(Events.client.ASSIGN_USER_ID, function (id)
                {
                    Logger.debug(" Your have been assigned an id " + id);
                    Client.id = id;
                });
                Client.socket.on('disconnect', function ()
                {
                    Notify.display("Bad News :(", "So it looks like the game server has crashed or maybe your internet connection has been cut? " + "Either way this game is over, so refresh this page now. The server will have rebooted by the time you read this hopefully.", -1, Notify.levels.error, true);
                    GameInstance.state.isStarted = false;
                });
                Client.socket.on(Events.client.ACTION, function (packet)
                {
                    var instructionSet = Utilies.copy(new InstructionChain(), packet);
                    instructionSet.callFunc(GameInstance);
                });
                Client.socket.on(Events.client.CURRENT_WORM_ACTION, function (packet)
                {
                    var instructionSet = Utilies.copy(new InstructionChain(), packet);
                    instructionSet.callFunc(GameInstance.state.getCurrentPlayer().getTeam().getCurrentWorm());
                });
                Client.socket.on(Events.client.UPDATE, function (packet)
                {
                    var physicsDataPacket = new PhysiscsDataPacket(packet);
                    physicsDataPacket.override(Physics.fastAcessList);
                });
                if (Settings.NETWORKED_GAME_QUALITY_LEVELS.HIGH == Settings.NETWORKED_GAME_QUALITY)
                {
                    packetRateLimiter = new Timer(12);
                } else if (Settings.NETWORKED_GAME_QUALITY_LEVELS.MEDIUM == Settings.NETWORKED_GAME_QUALITY)
                {
                    packetRateLimiter = new Timer(100);
                } else if (Settings.NETWORKED_GAME_QUALITY_LEVELS.LOW == Settings.NETWORKED_GAME_QUALITY)
                {
                    packetRateLimiter = new Timer(1000);
                }
                return true;
            } catch (e)
            {
                return false;
            }
        }
        Client.connectionToServer = connectionToServer;
        function sendRateLimited(event, packet)
        {
            packetRateLimiter.update();
            if (GameInstance.gameType == Game.types.ONLINE_GAME && packetRateLimiter.hasTimePeriodPassed())
            {
                if (previous != packet)
                {
                    Client.socket.emit(event, packet);
                    previous = packet;
                }
            }
        }
        Client.sendRateLimited = sendRateLimited;
        function isClientsTurn()
        {
            return GameInstance.gameType == Game.types.LOCAL_GAME || GameInstance.lobby.client_GameLobby.currentPlayerId == Client.id;
        }
        Client.isClientsTurn = isClientsTurn;
        function sendImmediately(event, packet, rateLimiter)
        {
            if (typeof rateLimiter === "undefined") { rateLimiter = 0; }
            if (GameInstance.gameType == Game.types.ONLINE_GAME)
            {
                Client.socket.emit(event, packet);
            }
        }
        Client.sendImmediately = sendImmediately;
    })(Client || (Client = {}));
    var NetworkTimer = (function (_super)
    {
        __extends(NetworkTimer, _super);
        function NetworkTimer(gameTurnTimeDuraction)
        {
            _super.call(this, gameTurnTimeDuraction);
            this.packetRateTimer = new Timer(1000);
            this.currentServerTime = Date.now();
        }
        NetworkTimer.prototype.update = function ()
        {
            var _this = this;
            this.packetRateTimer.update();
            _super.prototype.update.call(this);
            if (this.packetRateTimer.hasTimePeriodPassed())
            {
                Client.socket.emit(Events.client.GET_GAME_TIME, '', function (data)
                {
                    _this.currentServerTime = data;
                });
            }
        };
        NetworkTimer.prototype.getTimeNow = function ()
        {
            return this.currentServerTime;
        };
        return NetworkTimer;
    })(Timer);
    var CountDownTimer = (function ()
    {
        function CountDownTimer()
        {
            if (GameInstance.gameType == Game.types.ONLINE_GAME)
            {
                this.timer = new NetworkTimer(Settings.PLAYER_TURN_TIME);
            } else
            {
                this.timer = new Timer(Settings.PLAYER_TURN_TIME);
            }
            this.previousSecound = this.timer.timePeriod;
            $('#turnTimeCounter').hide();
        }
        CountDownTimer.prototype.show = function ()
        {
            $('#turnTimeCounter').show();
        };
        CountDownTimer.prototype.update = function ()
        {
            if (Settings.DEVELOPMENT_MODE)
            {
                this.timer.pause();
            }
            this.timer.update();
            var timeLeft = Math.floor(this.timer.getTimeLeft() / 1000);
            if (timeLeft != this.previousSecound && timeLeft >= 0)
            {
                if (timeLeft == 5)
                {
                    AssetManager.getSound("hurry").play();
                }
                this.previousSecound = timeLeft;
                $('#turnTimeCounter').html(timeLeft);
                if (timeLeft < Settings.TURN_TIME_WARING && timeLeft >= 0)
                {
                    $('#turnTimeCounter').css("background", "red");
                    AssetManager.getSound("TIMERTICK").play(0.3);
                } else
                {
                    $('#turnTimeCounter').css("background", "black");
                }
            }
            if (this.timer.hasTimePeriodPassed(false))
            {
                this.timer.pause();
                GameInstance.state.timerTiggerNextTurn();
            }
        };
        return CountDownTimer;
    })();
    var Particle = (function (_super)
    {
        __extends(Particle, _super);
        function Particle(initalPos, initalVelocity, spriteDef)
        {
            if (typeof spriteDef === "undefined") { spriteDef = Sprites.particleEffects.flame1; }
            _super.call(this, initalPos, initalVelocity, spriteDef);
            this.setNoLoop(true);
        }
        return Particle;
    })(PhysicsSprite);
    var Cloud = (function (_super)
    {
        __extends(Cloud, _super);
        function Cloud()
        {
            var initalPos = new b2Vec2(Utilies.random(0, GameInstance.camera.levelWidth), Utilies.random(GameInstance.terrain.Offset.y - 900, GameInstance.terrain.Offset.y - 220));
            var initalVelocity = new b2Vec2(Utilies.random(3, 7) * 0.4, 0);
            var spriteDef = Utilies.pickRandom([
                Sprites.particleEffects.cloudl,
                Sprites.particleEffects.cloudm,
                Sprites.particleEffects.clouds
            ]);
            _super.call(this, initalPos, initalVelocity, spriteDef);
        }
        Cloud.prototype.physics = function ()
        {
        };
        Cloud.prototype.update = function ()
        {
            if (this.getCurrentFrame() >= this.getTotalFrames() - 1)
            {
                this.setCurrentFrame(this.getTotalFrames() - 1);
                this.frameIncremeter *= -1;
            } else if (this.getCurrentFrame() <= 0)
            {
                this.setCurrentFrame(0);
                this.frameIncremeter *= -1;
            }
            _super.prototype.update.call(this);
            this.position.x += this.velocity.x;
            if (this.position.x > GameInstance.camera.levelWidth)
            {
                this.position.x = 0;
            }
        };
        return Cloud;
    })(PhysicsSprite);
    var ParticleEffect = (function ()
    {
        function ParticleEffect(x, y)
        {
            this.x = x;
            this.y = y;
            this.eclipse = new Sprite(Sprites.particleEffects.eclipse, true);
            this.cirlce = new Sprite(Sprites.particleEffects.cirlce1, true);
            this.word = new Sprite(Sprites.particleEffects.wordBiff, true);
            this.center = new b2Vec2(this.eclipse.getImage().width / 2, this.eclipse.getFrameHeight() / 2);
            this.finished = false;
            this.particles = [];
            for (var p = 9; p >= 0; p--)
            {
                this.particles.push(new Particle(new b2Vec2(x + this.center.x, y + this.center.y), new b2Vec2(Utilies.random(-300, 300), Utilies.random(-500, 0))));
            }
        }
        ParticleEffect.prototype.draw = function (ctx)
        {
            ctx.save();
            ctx.translate(-this.eclipse.getImage().width / 2, -this.eclipse.getFrameHeight() / 2);
            for (var p = this.particles.length - 1; p >= 0; p--)
            {
                this.particles[p].draw(ctx);
            }
            this.cirlce.drawOnCenter(ctx, this.x, this.y, this.eclipse);
            if (this.eclipse.finished == false)
            {
                this.eclipse.draw(ctx, this.x, this.y);
            }
            this.word.drawOnCenter(ctx, this.x, this.y, this.eclipse);
            ctx.restore();
        };
        ParticleEffect.prototype.update = function ()
        {
            this.eclipse.update();
            this.cirlce.update();
            this.word.update();
            for (var p = this.particles.length - 1; p >= 0; p--)
            {
                this.particles[p].update();
            }
            this.finished = this.particles[0].finished;
            if (this.finished)
            {
                if (this.onFinished)
                {
                    this.onFinished();
                }
            }
        };
        ParticleEffect.prototype.onAnimationFinish = function (func)
        {
            this.onFinished = func;
        };
        return ParticleEffect;
    })();
    var EffectsManager = (function ()
    {
        function EffectsManager()
        {
            this.particleEffects = [];
        }
        EffectsManager.prototype.add = function (effect)
        {
            this.particleEffects.push(effect);
        };
        EffectsManager.prototype.stopAll = function ()
        {
            for (var i = this.particleEffects.length - 1; i >= 0; i--)
            {
                this.particleEffects[i].finished = true;
            }
        };
        EffectsManager.prototype.draw = function (ctx)
        {
            for (var i = this.particleEffects.length - 1; i >= 0; i--)
            {
                this.particleEffects[i].draw(ctx);
            }
        };
        EffectsManager.prototype.areAllAnimationsFinished = function ()
        {
            return (this.particleEffects.length == 0);
        };
        EffectsManager.prototype.update = function ()
        {
            for (var i = this.particleEffects.length - 1; i >= 0; i--)
            {
                this.particleEffects[i].update();
                if (this.particleEffects[i].finished == true)
                {
                    Utilies.deleteFromCollection(this.particleEffects, i);
                }
            }
        };
        return EffectsManager;
    })();
    var HealthMenu = (function ()
    {
        function HealthMenu(players)
        {
            var html = "";
            for (var p in players)
            {
                var team = players[p].getTeam();
                html += "<li><span> " + team.name + " </span><img src=" + Settings.REMOTE_ASSERT_SERVER + "images/Ireland.png> " + "<span id='" + team.teamId + "' class=health style=width:" + team.getPercentageHealth() + "%;background:" + team.color + "  ></span></li>";
            }
            $('.healthMenu').html(html);
            this.hide();
        }
        HealthMenu.prototype.show = function ()
        {
            $('.healthMenu').show();
        };
        HealthMenu.prototype.hide = function ()
        {
            $('.healthMenu').hide();
        };
        HealthMenu.prototype.update = function (teamRef)
        {
            $('#' + teamRef.teamId).animate({
                width: teamRef.getPercentageHealth() + "%"
            }, 300);
        };
        return HealthMenu;
    })();
    var Map = (function ()
    {
        function Map(mapDef)
        {
            this.mapDef = mapDef;
            this.currentSpawn = 0;
        }
        Map.prototype.getNextSpawnPoint = function ()
        {
            return Utilies.pickUnqine(this.mapDef.spawnPionts, "spanwPionts");
        };
        Map.prototype.getBackgroundCss = function ()
        {
            return this.mapDef.backgroundGraidentCss;
        };
        Map.prototype.getTerrainImg = function ()
        {
            return AssetManager.getImage(this.mapDef.terrainImage);
        };
        Map.prototype.getName = function ()
        {
            return this.mapDef.name;
        };
        return Map;
    })();
    var Maps;
    (function (Maps)
    {
        Maps.priates = {
            smallImage: "smalllevel2",
            name: "priates",
            terrainImage: "level2",
            spawnPionts: [
                {
                    "x": 2354.354715233633,
                    "y": 2618.472692554285
                },
                {
                    "x": 2464.354715233633,
                    "y": 2167.472692554285
                },
                {
                    "x": 2569.354715233633,
                    "y": 1700.472692554285
                },
                {
                    "x": 2991.354715233633,
                    "y": 1523.472692554285
                },
                {
                    "x": 3472.354715233633,
                    "y": 1446.472692554285
                },
                {
                    "x": 3350.354715233633,
                    "y": 1563.472692554285
                },
                {
                    "x": 3838.354715233633,
                    "y": 1737.472692554285
                },
                {
                    "x": 3708.354715233633,
                    "y": 1635.472692554285
                },
                {
                    "x": 4212.354715233633,
                    "y": 1812.472692554285
                },
                {
                    "x": 4041.354715233633,
                    "y": 2140.472692554285
                },
                {
                    "x": 3735.354715233633,
                    "y": 2289.472692554285
                },
                {
                    "x": 3474.354715233633,
                    "y": 2115.472692554285
                },
                {
                    "x": 3411.354715233633,
                    "y": 1877.472692554285
                },
                {
                    "x": 2830.354715233633,
                    "y": 2699.472692554285
                },
                {
                    "x": 3160.354715233633,
                    "y": 2814.472692554285
                },
                {
                    "x": 3334.354715233633,
                    "y": 2499.472692554285
                },
                {
                    "x": 3617.354715233633,
                    "y": 2728.472692554285
                },
                {
                    "x": 3846.354715233633,
                    "y": 2826.472692554285
                },
                {
                    "x": 4346.354715233633,
                    "y": 2542.472692554285
                },
                {
                    "x": 4494.354715233633,
                    "y": 2577.472692554285
                },
                {
                    "x": 4666.354715233633,
                    "y": 2275.472692554285
                },
                {
                    "x": 4837.354715233633,
                    "y": 2650.472692554285
                },
                {
                    "x": 4977.354715233633,
                    "y": 2916.472692554285
                },
                {
                    "x": 5096.354715233633,
                    "y": 2320.472692554285
                },
                {
                    "x": 4571.354715233633,
                    "y": 1886.472692554285
                },
                {
                    "x": 4741.354715233633,
                    "y": 1670.472692554285
                },
                {
                    "x": 4392.354715233633,
                    "y": 1478.472692554285
                },
                {
                    "x": 4183.354715233633,
                    "y": 1824.472692554285
                }
            ],
            info: " Pritaes and shit "
        };
        Maps.smallCastle = {
            smallImage: "smalllevel3",
            name: "smallCastle",
            terrainImage: "level3",
            spawnPionts: [
                {
                    "x": 4546.690106970014,
                    "y": 2074.3098930299857
                },
                {
                    "x": 3117.8659123194716,
                    "y": 1458.5519380287974
                },
                {
                    "x": 3413.8659123194716,
                    "y": 1431.5519380287974
                },
                {
                    "x": 3620.8659123194716,
                    "y": 1523.5519380287974
                },
                {
                    "x": 3592.8659123194716,
                    "y": 2120.5519380287974
                },
                {
                    "x": 3299.8659123194716,
                    "y": 1969.5519380287974
                },
                {
                    "x": 3954.8659123194716,
                    "y": 2063.5519380287974
                },
                {
                    "x": 4225.865912319472,
                    "y": 2055.5519380287974
                },
                {
                    "x": 4435.865912319472,
                    "y": 1788.5519380287974
                },
                {
                    "x": 4717.865912319472,
                    "y": 1756.5519380287974
                },
                {
                    "x": 5013.865912319472,
                    "y": 2288.5519380287974
                },
                {
                    "x": 2677.8659123194716,
                    "y": 2078.5519380287974
                },
                {
                    "x": 2907.8659123194716,
                    "y": 2054.5519380287974
                },
                {
                    "x": 2494.8659123194716,
                    "y": 2243.5519380287974
                },
                {
                    "x": 3458.3488516009033,
                    "y": 2071.095649019126
                },
                {
                    "x": 3711.3488516009033,
                    "y": 2038.095649019126
                },
                {
                    "x": 2560.3488516009033,
                    "y": 2174.095649019126
                },
                {
                    "x": 4829.348851600904,
                    "y": 2103.095649019126
                },
                {
                    "x": 5081.348851600904,
                    "y": 1837.095649019126
                },
                {
                    "x": 4950.348851600904,
                    "y": 1825.095649019126
                },
                {
                    "x": 3838.0478527182613,
                    "y": 2085.391330583362
                }
            ],
            info: " Pritaes and shit "
        };
        Maps.ship = {
            smallImage: "smalllevel5",
            name: "ships",
            terrainImage: "level5",
            spawnPionts: [
                {
                    "x": 3917.7393193496255,
                    "y": 1794.696499546532
                },
                {
                    "x": 4070.7393193496255,
                    "y": 1544.696499546532
                },
                {
                    "x": 4109.7393193496255,
                    "y": 1870.696499546532
                },
                {
                    "x": 4000.7393193496255,
                    "y": 1924.696499546532
                },
                {
                    "x": 4337.7393193496255,
                    "y": 1836.696499546532
                },
                {
                    "x": 4753.7393193496255,
                    "y": 1830.696499546532
                },
                {
                    "x": 4681.7393193496255,
                    "y": 1931.696499546532
                },
                {
                    "x": 4856.7393193496255,
                    "y": 1925.696499546532
                },
                {
                    "x": 4652.7393193496255,
                    "y": 1402.696499546532
                },
                {
                    "x": 4166.7393193496255,
                    "y": 1376.696499546532
                },
                {
                    "x": 5047.7393193496255,
                    "y": 1802.696499546532
                },
                {
                    "x": 5095.7393193496255,
                    "y": 2291.6964995465323
                },
                {
                    "x": 4890.7393193496255,
                    "y": 2286.6964995465323
                },
                {
                    "x": 4133.7393193496255,
                    "y": 1527.696499546532
                },
                {
                    "x": 3794.7393193496255,
                    "y": 1309.696499546532
                },
                {
                    "x": 3655.7393193496255,
                    "y": 1324.696499546532
                },
                {
                    "x": 3387.7393193496255,
                    "y": 1770.696499546532
                },
                {
                    "x": 3576.7393193496255,
                    "y": 1788.696499546532
                },
                {
                    "x": 3283.7393193496255,
                    "y": 1311.696499546532
                },
                {
                    "x": 3118.7393193496255,
                    "y": 1321.696499546532
                },
                {
                    "x": 2957.7393193496255,
                    "y": 1531.696499546532
                },
                {
                    "x": 2900.7393193496255,
                    "y": 1625.696499546532
                },
                {
                    "x": 2627.7393193496255,
                    "y": 1544.696499546532
                },
                {
                    "x": 2649.7393193496255,
                    "y": 1882.696499546532
                },
                {
                    "x": 2553.7393193496255,
                    "y": 1761.696499546532
                },
                {
                    "x": 2328.7393193496255,
                    "y": 1747.696499546532
                }
            ],
            info: " Pritaes and shit "
        };
        Maps.titanic = {
            smallImage: "smalllevel20",
            name: "titanic",
            terrainImage: "level20",
            spawnPionts: [
                {
                    "x": 2837.874947626356,
                    "y": 2603.847317090144
                },
                {
                    "x": 2836.874947626356,
                    "y": 2298.847317090144
                },
                {
                    "x": 3167.874947626356,
                    "y": 2439.847317090144
                },
                {
                    "x": 4065.874947626356,
                    "y": 2845.847317090144
                },
                {
                    "x": 4391.8749476263565,
                    "y": 2906.847317090144
                },
                {
                    "x": 3995.874947626356,
                    "y": 2215.847317090144
                },
                {
                    "x": 3078.874947626356,
                    "y": 2136.847317090144
                },
                {
                    "x": 2541.874947626356,
                    "y": 1475.8473170901438
                },
                {
                    "x": 3068.874947626356,
                    "y": 1629.8473170901438
                },
                {
                    "x": 3435.874947626356,
                    "y": 1802.8473170901438
                },
                {
                    "x": 3134.874947626356,
                    "y": 2025.8473170901438
                },
                {
                    "x": 3983.874947626356,
                    "y": 1586.8473170901438
                },
                {
                    "x": 4202.8749476263565,
                    "y": 2070.847317090144
                },
                {
                    "x": 4517.8749476263565,
                    "y": 1824.8473170901438
                },
                {
                    "x": 4625.8749476263565,
                    "y": 2115.847317090144
                },
                {
                    "x": 5037.8749476263565,
                    "y": 2054.847317090144
                },
                {
                    "x": 4446.8749476263565,
                    "y": 2716.847317090144
                },
                {
                    "x": 5607.8749476263565,
                    "y": 2310.847317090144
                },
                {
                    "x": 6161.8749476263565,
                    "y": 2180.847317090144
                },
                {
                    "x": 3439.8749476263565,
                    "y": 2440.847317090144
                },
                {
                    "x": 4275.8749476263565,
                    "y": 1939.8473170901438
                },
                {
                    "x": 4759.8749476263565,
                    "y": 2079.847317090144
                },
                {
                    "x": 5342.8749476263565,
                    "y": 2402.847317090144
                },
                {
                    "x": 3627.8749476263565,
                    "y": 2906.847317090144
                },
                {
                    "x": 3402.8749476263565,
                    "y": 2547.847317090144
                }
            ],
            info: " Pritaes and shit "
        };
        Maps.castle = {
            smallImage: "smallcastles",
            name: "castles",
            terrainImage: "castles",
            spawnPionts: [
                {
                    "x": 4283.071330850913,
                    "y": 1770.856404391271
                },
                {
                    "x": 4414.071330850911,
                    "y": 1886.856404391271
                },
                {
                    "x": 4649.071330850913,
                    "y": 2048.856404391271
                },
                {
                    "x": 4896.071330850913,
                    "y": 1333.856404391271
                },
                {
                    "x": 4657.071330850913,
                    "y": 1442.856404391271
                },
                {
                    "x": 4588.071330850913,
                    "y": 1624.856404391271
                },
                {
                    "x": 4838.071330850913,
                    "y": 1768.856404391271
                },
                {
                    "x": 4749.071330850913,
                    "y": 2221.856404391271
                },
                {
                    "x": 5046.071330850913,
                    "y": 2215.856404391271
                },
                {
                    "x": 4920.071330850913,
                    "y": 1672.856404391271
                },
                {
                    "x": 3925.0713308509134,
                    "y": 1431.856404391271
                },
                {
                    "x": 4018.0713308509134,
                    "y": 1286.856404391271
                },
                {
                    "x": 3763.0713308509134,
                    "y": 1676.856404391271
                },
                {
                    "x": 3681.0713308509134,
                    "y": 2073.856404391271
                },
                {
                    "x": 3877.0713308509134,
                    "y": 2055.856404391271
                },
                {
                    "x": 3309.0713308509134,
                    "y": 2044.856404391271
                },
                {
                    "x": 3502.0713308509134,
                    "y": 2177.856404391271
                },
                {
                    "x": 4167.071330850913,
                    "y": 1958.856404391271
                },
                {
                    "x": 2938.0713308509134,
                    "y": 1663.856404391271
                },
                {
                    "x": 2852.0713308509134,
                    "y": 2095.856404391271
                },
                {
                    "x": 2660.0713308509134,
                    "y": 2106.856404391271
                },
                {
                    "x": 2428.0713308509134,
                    "y": 2063.856404391271
                },
                {
                    "x": 2517.0713308509134,
                    "y": 1522.856404391271
                },
                {
                    "x": 2793.0713308509134,
                    "y": 1345.856404391271
                },
                {
                    "x": 2914.0713308509134,
                    "y": 1442.856404391271
                },
                {
                    "x": 3357.0713308509134,
                    "y": 1310.856404391271
                },
                {
                    "x": 3112.0713308509134,
                    "y": 1286.856404391271
                }
            ],
            info: " castle "
        };
    })(Maps || (Maps = {}));
    var GameStateManager = (function ()
    {
        function GameStateManager()
        {
            this.nextTurnTrigger = false;
            this.currentPlayerIndex = 0;
            this.isStarted = false;
            this.physicsWorldSettled = false;
        }
        GameStateManager.prototype.init = function (players)
        {
            this.players = players;
            this.isStarted = true;
        };
        GameStateManager.prototype.tiggerNextTurn = function ()
        {
            GameInstance.miscellaneousEffects.stopAll();
            this.nextTurnTrigger = true;
        };
        GameStateManager.prototype.timerTiggerNextTurn = function ()
        {
            GameInstance.wormManager.deactivedAllNonTimeBasedWeapons();
            this.tiggerNextTurn();
        };
        GameStateManager.prototype.hasNextTurnBeenTiggered = function ()
        {
            return this.nextTurnTrigger;
        };
        GameStateManager.prototype.readyForNextTurn = function ()
        {
            if (this.nextTurnTrigger)
            {
                if (GameInstance.particleEffectMgmt.areAllAnimationsFinished() && GameInstance.wormManager.areAllWormsReadyForNextTurn())
                {
                    this.nextTurnTrigger = false;
                    return true;
                }
            }
            return false;
        };
        GameStateManager.prototype.getCurrentPlayer = function ()
        {
            return this.players[this.currentPlayerIndex];
        };
        GameStateManager.prototype.nextPlayer = function ()
        {
            this.nextTurnTrigger = false;
            if (this.currentPlayerIndex + 1 == this.players.length)
            {
                this.currentPlayerIndex = 0;
            } else
            {
                this.currentPlayerIndex++;
            }
            if (this.getCurrentPlayer().getTeam().getPercentageHealth() <= 0)
            {
                return null;
            }
            this.getCurrentPlayer().getTeam().nextWorm();
            GameInstance.camera.cancelPan();
            GameInstance.camera.panToPosition(Physics.vectorMetersToPixels(this.getCurrentPlayer().getTeam().getCurrentWorm().body.GetPosition()));
            return this.getCurrentPlayer().id;
        };
        GameStateManager.prototype.checkForWinner = function ()
        {
            var playersStillLive = [];
            for (var i = this.players.length - 1; i >= 0; --i)
            {
                if (this.players[i].getTeam().areAllWormsDead() == false)
                {
                    playersStillLive.push(this.players[i]);
                }
            }
            if (playersStillLive.length == 1)
            {
                return playersStillLive[0];
            }
            return null;
        };
        return GameStateManager;
    })();
    var WormManager = (function ()
    {
        function WormManager(players)
        {
            this.allWorms = [];
            for (var i = 0; i < players.length; i++)
            {
                var worms = players[i].getTeam().getWorms();
                for (var j = 0; j < worms.length; j++)
                {
                    this.allWorms.push(worms[j]);
                }
            }
            Logger.log(this.allWorms);
        }
        WormManager.prototype.findWormWithName = function (name)
        {
            for (var i = this.allWorms.length - 1; i >= 0; --i)
            {
                if (this.allWorms[i].name == name)
                {
                    return this.allWorms[i];
                }
            }
            Logger.error("Unable to find worm with name " + name);
        };
        WormManager.prototype.areAllWormsReadyForNextTurn = function ()
        {
            return WormAnimationManger.playerAttentionSemaphore == 0 && this.areAllWormsStationary() && this.areAllWormsDamageTaken() && this.areAllWeaponsDeactived();
        };
        WormManager.prototype.areAllWormsStationary = function ()
        {
            for (var i = this.allWorms.length - 1; i >= 0; --i)
            {
                if (this.allWorms[i].isStationary() == false)
                {
                    return false;
                }
            }
            return true;
        };
        WormManager.prototype.findFastestMovingWorm = function ()
        {
            var highestVecloity = 0;
            var wormWithHighestVelocity = null;
            var lenght = 0;
            for (var i = this.allWorms.length - 1; i >= 0; --i)
            {
                lenght = this.allWorms[i].body.GetLinearVelocity().Length();
                if (lenght > highestVecloity)
                {
                    highestVecloity = lenght;
                    wormWithHighestVelocity = this.allWorms[i];
                }
            }
            return wormWithHighestVelocity;
        };
        WormManager.prototype.areAllWeaponsDeactived = function ()
        {
            for (var i = this.allWorms.length - 1; i >= 0; --i)
            {
                if (this.allWorms[i].team.getWeaponManager().getCurrentWeapon().getIsActive() == true)
                {
                    return false;
                }
            }
            return true;
        };
        WormManager.prototype.deactivedAllNonTimeBasedWeapons = function ()
        {
            for (var i = this.allWorms.length - 1; i >= 0; --i)
            {
                var weapon = this.allWorms[i].team.getWeaponManager().getCurrentWeapon();
                if (weapon.getIsActive() == true)
                {
                    if ((weapon instanceof ThrowableWeapon || weapon instanceof ProjectileWeapon) == false)
                    {
                        weapon.deactivate();
                    }
                }
            }
            return true;
        };
        WormManager.prototype.areAllWormsDamageTaken = function ()
        {
            for (var i = 0; i < this.allWorms.length; i++)
            {
                if (this.allWorms[i].damageTake != 0)
                {
                    return false;
                }
                if (this.allWorms[i].getHealth() == 0 && this.allWorms[i].damageTake == 0 && this.allWorms[i].isDead == false)
                {
                    return false;
                }
            }
            return true;
        };
        WormManager.prototype.syncHit = function (wormName, damage)
        {
            if (Client.isClientsTurn())
            {
                var parameters = [
                    wormName,
                    damage
                ];
                Client.sendImmediately(Events.client.ACTION, new InstructionChain("wormManager.syncHit", parameters));
            } else
            {
                var damage = wormName[1];
                var wormName = wormName[0];
                var worm = GameInstance.wormManager.findWormWithName(wormName);
                if (worm)
                {
                    worm.damageTake += damage;
                    worm.hit(0, null);
                }
            }
        };
        return WormManager;
    })();

    function googlePlusdisconnectUser(access_token)
    {
        var revokeUrl = 'https://accounts.google.com/o/oauth2/revoke?token=' + access_token;
        var revokeAppPermssion = function ()
        {
            $.ajax({
                type: 'GET',
                url: revokeUrl,
                async: false,
                contentType: "application/json",
                dataType: 'jsonp',
                success: function (nullResponse)
                {
                    Notify.display("Google+ Token Revoked", "All your user data has now been removed from the database and this app no longer has permission to use your Google+ sign to rank you in the leaderboard", 11000);
                },
                error: function (e)
                {
                    Notify.display("Unsuccessful", "Somthing went wrong and we couldn't revoke the token try this <a href=https://plus.google.com/apps >https://plus.google.com/apps</a>. Though your information has been removed from the leaderboards", 11000, Notify.levels.error);
                }
            });
        };
        $.ajax({
            url: Settings.LEADERBOARD_API_URL + "/remove/" + access_token,
            dataType: 'jsonp',
            success: revokeAppPermssion
        });
    }
    var LeaderBoardView = (function ()
    {
        function LeaderBoardView()
        {
            this.leaderBoardView = '<div id="leaderBoards" style="display:none">' + '<table id=' + LeaderBoardView.CSS_ID.LEADERBOARDS_TABLE.replace('#', '') + ' class="table table-striped table-bordered" > ' + '<thead>  <tr>  <th>Player</th>  <th>Matchs Won</th> </tr>  </thead>  ' + '<tbody></tbody></table>' + '</div>';
            this.profileView = '<div id="profile" style="display:none">' + '<p>If you would like to remove <strong>All</strong> trace of your leaderboard rankings, you can revoke your Google+ token<br>  <br><a href="#" class="btn" id="googlePlusdisconnectUser">Revoke</a></p>' + '</div>';
        }
        LeaderBoardView.CSS_ID = {
            LEADERBOARDS_TABLE: "#leaderBoardsTable tbody"
        };
        LeaderBoardView.prototype.getView = function ()
        {
            return this.leaderBoardView;
        };
        LeaderBoardView.prototype.getProfileView = function ()
        {
            return this.profileView;
        };
        LeaderBoardView.prototype.populateTable = function (userData)
        {
            $(LeaderBoardView.CSS_ID.LEADERBOARDS_TABLE).empty();
            for (var player in userData)
            {
                if (userData[player]["name"] != "")
                {
                    $(LeaderBoardView.CSS_ID.LEADERBOARDS_TABLE).append(' <tr> <td><img width=30 height=30 src=' + userData[player]["image"] + ' /> <span> ' + userData[player]["name"] + '</td> <td> ' + userData[player]["score"] + '</span></td>  </tr>');
                }
            }
            $(LobbyMenu.CSS_ID.LOBBY_TABLE).append('</tbody></table>');
        };
        LeaderBoardView.prototype.update = function ()
        {
            var _this = this;
            var callback = function (leaderBoardData)
            {
                var leaderBoardData = JSON.parse(leaderBoardData);
                var combinedUserData = [];
                var dataLoadCount = 0;
                for (var player in leaderBoardData)
                {
                    combinedUserData[leaderBoardData[player]["userId"]] = {
                        "image": "",
                        "name": "",
                        "score": leaderBoardData[player]["winCount"]
                    };
                    var url = "https://www.googleapis.com/plus/v1/people/" + leaderBoardData[player]["userId"] + "/?key=" + Settings.API_KEY;
                    $.ajax({
                        url: url,
                        dataType: 'jsonp',
                        success: function (userDataFromGoogle)
                        {
                            if (userDataFromGoogle.id)
                            {
                                combinedUserData[userDataFromGoogle.id].image = userDataFromGoogle.image.url;
                                combinedUserData[userDataFromGoogle.id].name = userDataFromGoogle.displayName;
                            }
                            dataLoadCount++;
                            if (dataLoadCount == leaderBoardData.length)
                            {
                                _this.populateTable(combinedUserData);
                            }
                        }
                    });
                }
            };
            $.ajax({
                url: Settings.LEADERBOARD_API_URL + '/getLeaderBoard',
                dataType: 'jsonp',
                success: callback
            });
        };
        return LeaderBoardView;
    })();
    var LobbyMenu = (function ()
    {
        function LobbyMenu(lobby)
        {
            this.lobbyRef = lobby;
            this.leaderBoardView = new LeaderBoardView();
            this.view = '<span class="label label-success" style="float:left;padding:3px;text-align:center;">Connected users   <span class="badge badge-inverse" id=' + LobbyMenu.CSS_ID.USER_COUNT_BOX.replace('#', '') + '></span></span><br>';
            this.view += '<div class="navbar" id="onlineMenu">' + '<div class="navbar-inner">' + '  <div class="nav-collapse collapse navbar-responsive-collapse">' + ' <ul class="nav">' + '<li class="active"><a href="#" value="#lobbies">Game Lobbies</a></li>' + '<li><a href="#"  value="#leaderBoards">Leaderboards</a></li>' + ' </ul>' + ' <ul class="nav pull-right">' + ' <li><a href="#"  value="#profile">Profiles</a></li>' + '</ul></div></div></div></div>';
            this.view += ' <div style="text-align:center" id="tabContainer" >';
            this.view += '<div id="lobbies"><div style="overflow-y:scroll;max-height:235px">' + '<table id=' + LobbyMenu.CSS_ID.LOBBY_TABLE.replace('#', '') + ' class="table table-striped table-bordered" style="margin-bottom:0px" > <thead>  <tr>  <th>Game Lobby</th>  <th>Number of Players</th>  <th> Status </th>   <th>Join</th>  </tr>  </thead>  ' + '<tbody></tbody></table></div><br>' + '<div class="alert alert-success" id="' + LobbyMenu.CSS_ID.INFO_BOX.replace('#', '') + '"></div>' + '<a class="btn btn-primary btn-large" id=' + LobbyMenu.CSS_ID.QUICK_PLAY_BTN.replace('#', '') + ' style="text-align:center">Quick Play</a>' + '<a class="btn btn-primary btn-large" id=' + LobbyMenu.CSS_ID.CREATE_BTN.replace('#', '') + ' style="text-align:center">Create Lobby</a>' + '</div>';
            this.view += this.leaderBoardView.getView();
            this.view += this.leaderBoardView.getProfileView();
            this.view += '</div>';
        }
        LobbyMenu.CSS_ID = {
            QUICK_PLAY_BTN: "#quickPlay",
            LOBBY_TABLE: "#lobbyList tbody",
            CREATE_BTN: "#create",
            JOIN_BTN: ".join",
            INFO_BOX: "#infoBox",
            CREATE_LOBBY_POP_UP: "#createLobby",
            NICKNAME_PICK_UP: "#nickname",
            CREATE_LOBBY_FORM: "#createLobbyForm",
            CREATE_LOBBY_FORM_SUBMIT: "#submit",
            USER_COUNT_BOX: "#userCount",
            LEADERBOARDS_TABLE: "#leaderBoards"
        };
        LobbyMenu.prototype.updateUserCountUI = function (userCount)
        {
            $(LobbyMenu.CSS_ID.USER_COUNT_BOX).empty();
            $(LobbyMenu.CSS_ID.USER_COUNT_BOX).append(userCount);
        };
        LobbyMenu.prototype.bind = function ()
        {
            var _this = this;
            $('#googlePlusdisconnectUser').click(function ()
            {
                googlePlusdisconnectUser(access_token);
            });
            var _this = this;
            $('#onlineMenu a').click(function (e)
            {
                e.preventDefault();
                _this.leaderBoardView.update();
                $('.nav').children().removeClass('active');
                $(this).parent().addClass('active');
                $($(this).attr('value')).show();
                $($(this).attr('value')).siblings().hide();
            });
            $(LobbyMenu.CSS_ID.QUICK_PLAY_BTN).click(function ()
            {
                $(LobbyMenu.CSS_ID.QUICK_PLAY_BTN).unbind();
                AssetManager.getSound("CursorSelect").play();
                _this.lobbyRef.client_joinQuickGame();
            });
            $(LobbyMenu.CSS_ID.CREATE_BTN).click(function ()
            {
                $(LobbyMenu.CSS_ID.CREATE_LOBBY_POP_UP).modal('show');
                var levelSelector = new SettingsMenu();
                if ($('#mapSelector').length == 0)
                {
                    $('.modal-body').prepend(levelSelector.getView());
                    levelSelector.bind(function ()
                    {
                        AssetManager.getSound("CursorSelect").play();
                    });
                }
                $(LobbyMenu.CSS_ID.CREATE_LOBBY_FORM_SUBMIT).click(function (e)
                {
                    $(LobbyMenu.CSS_ID.CREATE_LOBBY_FORM_SUBMIT).unbind();
                    var name = $(LobbyMenu.CSS_ID.CREATE_LOBBY_FORM + " #inputName").val();
                    var playerCount = $(LobbyMenu.CSS_ID.CREATE_LOBBY_FORM + " #inputPlayers").val();
                    _this.lobbyRef.client_createGameLobby(name, playerCount, levelSelector.getLevelName());
                    AssetManager.getSound("CursorSelect").play();
                });
                AssetManager.getSound("CursorSelect").play();
            });
        };
        LobbyMenu.prototype.displayMessage = function (msg)
        {
            $(LobbyMenu.CSS_ID.INFO_BOX).empty();
            $(LobbyMenu.CSS_ID.INFO_BOX).append(msg);
        };
        LobbyMenu.prototype.show = function (callback)
        {
            var _this = this;
            $('.slide').fadeOut('normal', function ()
            {
                $('.slide').empty();
                $('.slide').append(_this.view);
                $(LobbyMenu.CSS_ID.NICKNAME_PICK_UP).modal('show');
                _this.updateLobbyListUI(_this.lobbyRef);
                _this.updateUserCountUI(_this.lobbyRef.userCount);
                _this.displayMessage(" Select a game lobby or create one ");
                _this.bind();
                $('.slide').fadeIn('slow');
            });
        };
        LobbyMenu.prototype.updateLobbyListUI = function (lobby)
        {
            $(LobbyMenu.CSS_ID.LOBBY_TABLE).empty();
            var gameLobbies = lobby.getGameLobbies();
            for (var gameLobby in gameLobbies)
            {
                var lob = gameLobbies[gameLobby];
                var disableButton = "";
                if (lob.contains(Client.id) || lob.status == GameLobby.LOBBY_STATS.GAME_IN_PLAY)
                {
                    disableButton = 'disabled="disabled"';
                }
                var status = "Waitting";
                var buttonText = " Join game ";
                if (lob.status == GameLobby.LOBBY_STATS.GAME_IN_PLAY)
                {
                    status = "Playing";
                }
                $(LobbyMenu.CSS_ID.LOBBY_TABLE).append(' <tr><td>' + gameLobbies[gameLobby].name + '</td> ' + ' <td> ' + gameLobbies[gameLobby].getNumberOfPlayers() + ' / ' + gameLobbies[gameLobby].getPlayerSlots() + ' </td>   ' + ' <td>' + status + '</td> ' + ' <td><button ' + disableButton + ' class="btn btn-mini btn-success ' + LobbyMenu.CSS_ID.JOIN_BTN.replace('.', '') + '"  value=' + gameLobbies[gameLobby].id + ' type="button"> ' + buttonText + '</button></td> ');
            }
            $(LobbyMenu.CSS_ID.LOBBY_TABLE).append('</tbody></table>');
            var _this = this;
            $(LobbyMenu.CSS_ID.JOIN_BTN).click(function ()
            {
                AssetManager.getSound("CursorSelect").play();
                _this.lobbyRef.client_joinGameLobby($(this).attr('value'));
            });
        };
        return LobbyMenu;
    })();
    var ServerSettings;
    (function (ServerSettings)
    {
        ServerSettings.DEVELOPMENT_MODE = false;
        ServerSettings.MAX_PLAYERS_PER_LOBBY = 4;
        ServerSettings.MAX_USERS = 1000;
        ServerSettings.LEADERBOARDS_API = "http://worms.ciaranmccann.me/";
    })(ServerSettings || (ServerSettings = {}));
    if (typeof exports != 'undefined')
    {
        (module).exports = ServerSettings;
    }
    try
    {
        eval("var ServerSettings = require('./ServerSettings');var Util = require('util');");
    } catch (e)
    {
    }
    var ServerUtilies;
    (function (ServerUtilies)
    {
        function findByValue(needle, haystack, haystackProperity)
        {
            for (var i = 0; i < haystack.length; i++)
            {
                if (haystack[i][haystackProperity] === needle)
                {
                    return haystack[i];
                }
            }
            throw "Couldn't find object with proerpty " + haystackProperity + " equal to " + needle;
        }
        ServerUtilies.findByValue = findByValue;
        function deleteFromCollection(collection, indexToRemove)
        {
            delete collection[indexToRemove];
            collection.splice(indexToRemove, 1);
        }
        ServerUtilies.deleteFromCollection = deleteFromCollection;
        function createToken()
        {
            return Math.random().toString(36).substr(2);
        }
        ServerUtilies.createToken = createToken;
        function info(io, message)
        {
            if (ServerSettings.DEVELOPMENT_MODE)
            {
                io.log.info(Util.format("@ " + message));
            }
        }
        ServerUtilies.info = info;
        function warn(io, message)
        {
            if (Settings.DEVELOPMENT_MODE)
            {
                io.log.warn(Util.format("@ " + message));
            }
        }
        ServerUtilies.warn = warn;
        function debug(io, message)
        {
            if (ServerSettings.DEVELOPMENT_MODE)
            {
                io.log.debug(Util.format("@ " + message));
            }
        }
        ServerUtilies.debug = debug;
        function error(io, message)
        {
            if (ServerSettings.DEVELOPMENT_MODE)
            {
                io.log.error(Util.format("@ " + message));
            }
        }
        ServerUtilies.error = error;
    })(ServerUtilies || (ServerUtilies = {}));
    if (typeof exports != 'undefined')
    {
        (module).exports = ServerUtilies;
    }
    try
    {
        eval(" var Events = require('./Events');var ServerUtilies = require('./ServerUtilies');var Util = require('util');var ServerSettings = require('./ServerSettings');");
    } catch (error)
    {
    }
    var SOCKET_STORAGE_GAMELOBBY_ID = 'gameLobbyId';
    var GameLobby = (function ()
    {
        function GameLobby(name, numberOfPlayers, mapName)
        {
            if (typeof mapName === "undefined") { mapName = "priates"; }
            this.name = name;
            this.mapName = mapName;
            this.playerIds = [];
            this.gameLobbyCapacity = numberOfPlayers;
            this.currentPlayerId = "";
            this.status = GameLobby.LOBBY_STATS.WATTING_FOR_PLAYERS;
        }
        GameLobby.LOBBY_STATS = {
            WATTING_FOR_PLAYERS: 0,
            GAME_IN_PLAY: 1
        };
        GameLobby.gameLobbiesCounter = 0;
        GameLobby.prototype.getNumberOfPlayers = function ()
        {
            return this.gameLobbyCapacity;
        };
        GameLobby.prototype.getPlayerSlots = function ()
        {
            return this.playerIds.length;
        };
        GameLobby.prototype.server_init = function ()
        {
            this.id = ServerUtilies.createToken() + GameLobby.gameLobbiesCounter;
            GameLobby.gameLobbiesCounter++;
        };
        GameLobby.prototype.client_init = function ()
        {
            Client.socket.on(Events.gameLobby.START_GAME_HOST, function (data)
            {
                var gameLobby = (Utilies.copy(new GameLobby(null, null), data));
                Game.map = new Map(Maps[gameLobby.mapName]);
                GameInstance.lobby.client_GameLobby = gameLobby;
                GameInstance.start(gameLobby.playerIds);
                Client.socket.emit(Events.gameLobby.START_GAME_FOR_OTHER_CLIENTS, {
                    "lobby": gameLobby,
                    "gameData": GameInstance.getGameNetData()
                });
            });
            Client.socket.on(Events.gameLobby.START_GAME_FOR_OTHER_CLIENTS, function (data)
            {
                var gameLobby = (Utilies.copy(new GameLobby(null, null), data.lobby));
                Game.map = new Map(Maps[gameLobby.mapName]);
                GameInstance.lobby.client_GameLobby = gameLobby;
                for (var i = 0; i < gameLobby.playerIds.length; i++)
                {
                    GameInstance.players.push(new Player(gameLobby.playerIds[i]));
                }
                GameInstance.setGameNetData(data.gameData);
                GameInstance.start();
            });
            Client.socket.on(Events.gameLobby.PLAYER_DISCONNECTED, function (playerId)
            {
                Logger.log("Events.gameLobby.PLAYER_DISCONNECTED " + playerId);
                for (var j = GameInstance.players.length - 1; j >= 0; j--)
                {
                    if (GameInstance.players[j].id == playerId)
                    {
                        Notify.display(GameInstance.players[j].getTeam().name + " has disconnected ", "Looks like you were too much competition for them. They just gave up, well done!! Although they might have just lost connection... though we will say you won =)", 13000);
                        var worms = GameInstance.players[j].getTeam().getWorms();
                        for (var i = 0; i < worms.length; i++)
                        {
                            worms[i].hit(999, null, true);
                        }
                        if (GameInstance.players[j].id == GameInstance.state.getCurrentPlayer().id)
                        {
                            GameInstance.state.tiggerNextTurn();
                        }
                        return;
                    }
                }
            });
        };
        GameLobby.prototype.contains = function (playerId)
        {
            for (var i in this.playerIds)
            {
                if (this.playerIds[i] == playerId)
                {
                    return true;
                }
            }
            return false;
        };
        GameLobby.prototype.isLobbyEmpty = function ()
        {
            return (this.playerIds.length == 0);
        };
        GameLobby.prototype.join = function (userId, googleUserId, socket)
        {
            if (this.contains(userId) == false && this.status == GameLobby.LOBBY_STATS.WATTING_FOR_PLAYERS)
            {
                console.log("Player " + googleUserId + " added to gamelobby " + this.id + " and name " + this.name);
                socket.join(this.id);
                {
                    this.currentPlayerId = userId;
                }
                socket.set(SOCKET_STORAGE_GAMELOBBY_ID, this.id);
                this.playerIds.push(userId);
                if (this.isFull())
                {
                    socket.emit(Events.gameLobby.START_GAME_HOST, this);
                    this.status = GameLobby.LOBBY_STATS.GAME_IN_PLAY;
                } else
                {
                    this.status = GameLobby.LOBBY_STATS.WATTING_FOR_PLAYERS;
                }
            }
        };
        GameLobby.prototype.remove = function (userId)
        {
            var index = this.playerIds.indexOf(userId);
            if (index >= 0)
            {
                ServerUtilies.deleteFromCollection(this.playerIds, index);
            }
        };
        GameLobby.prototype.isFull = function ()
        {
            return this.gameLobbyCapacity == this.playerIds.length;
        };
        return GameLobby;
    })();
    if (typeof exports != 'undefined')
    {
        (module).exports = GameLobby;
    }
    try
    {
        var check = require('validator').check;
        var sanitize = require('validator').sanitize;
        var curl = require('node-curl');
        eval("var GameLobby = require('./GameLobby');var Events = require('./Events'); " + " var ServerSettings = require('./ServerSettings'); var ServerUtilies = require('./ServerUtilies'); " + "var Util = require('util');var server = require('./Server'); var server = require('./server'); ");
    } catch (error)
    {
    }
    var Lobby = (function ()
    {
        function Lobby()
        {
            this.userCount = 0;
            this.gameLobbies = {
            };
            this.client_GameLobby = new GameLobby(null, null);
        }
        Lobby.prototype.onConnection = function (socket, io)
        {
            this.userCount++;
            if (this.userCount > this.highestUserCount)
            {
                this.highestUserCount = this.userCount;
            }
            var token = ServerUtilies.createToken() + this.userCount;
            socket.set('userId', token, function ()
            {
                io.log.info(Util.format("User connected and assigned ID " + token + " from " + socket.handshake.address.address));
            });
            socket.emit(Events.client.ASSIGN_USER_ID, token);
            io.sockets.emit(Events.lobby.UPDATE_USER_COUNT, this.userCount);
            socket.emit(Events.client.UPDATE_ALL_GAME_LOBBIES, JSON.stringify(this.getGameLobbies()));
        };
        Lobby.prototype.onDisconnection = function (socket, io)
        {
            var _this = this;
            socket.on('disconnect', function ()
            {
                ServerUtilies.info(io, " User exit ");
                _this.userCount--;
                io.sockets.emit(Events.lobby.UPDATE_USER_COUNT, _this.userCount);
                _this.server_removePlayerFormCurrentLobby(socket);
            });
        };
        Lobby.prototype.server_removePlayerFormCurrentLobby = function (socket)
        {
            var _this = this;
            socket.get('userId', function (err, userId)
            {
                socket.get('gameLobbyId', function (err, gameLobbyId)
                {
                    if (gameLobbyId)
                    {
                        socket.broadcast.to(gameLobbyId).emit(Events.gameLobby.PLAYER_DISCONNECTED, userId);
                        socket.leave(gameLobbyId);
                        if (_this.gameLobbies[gameLobbyId])
                        {
                            _this.gameLobbies[gameLobbyId].remove(userId);
                            if (_this.gameLobbies[gameLobbyId].isLobbyEmpty())
                            {
                                delete _this.gameLobbies[gameLobbyId];
                                io.sockets.emit(Events.client.UPDATE_ALL_GAME_LOBBIES, JSON.stringify(_this.getGameLobbies()));
                            }
                        }
                    }
                });
            });
        };
        Lobby.prototype.server_init = function (socket, io)
        {
            var _this = this;
            socket.on(Events.lobby.CREATE_GAME_LOBBY, function (data)
            {
                _this.server_removePlayerFormCurrentLobby(socket);
                data.nPlayers = sanitize(data.nPlayers).xss();
                data.name = sanitize(data.name).xss();
                data.name = data.name.substring(0, 20);
                data.mapName = sanitize(data.mapName).xss();
                if (data.nPlayers > ServerSettings.MAX_PLAYERS_PER_LOBBY || data.nPlayers < 2)
                {
                    data.nPlayers = 4;
                }
                socket.get('userId', function (err, userId)
                {
                    socket.get('googleUserId', function (err, googleUserId)
                    {
                        io.log.info(Util.format("@ Create lobby by user with ID [%s] with name  [%s] using map ", data.name, googleUserId, data.mapName));
                        var newGameLobby = _this.server_createGameLobby(data.name, parseInt(data.nPlayers), data.mapName);
                        newGameLobby.join(userId, googleUserId, socket);
                        console.log(" Lobby list " + _this.gameLobbies);
                        io.sockets.emit(Events.client.UPDATE_ALL_GAME_LOBBIES, JSON.stringify(_this.getGameLobbies()));
                    });
                });
            });
            socket.on(Events.lobby.GOOGLE_PLUS_LOGIN, function (googleAuthToken)
            {
            });
            socket.on(Events.gameLobby.PLAYER_JOIN, function (gamelobbyId)
            {
                _this.server_removePlayerFormCurrentLobby(socket);
                io.log.info(Util.format("@ Events.client.JOIN_GAME_LOBBY " + gamelobbyId));
                socket.get('userId', function (err, userId)
                {
                    socket.get('googleUserId', function (err, googleUserId)
                    {
                        var gamelobby = _this.gameLobbies[gamelobbyId];
                        gamelobby.join(userId, googleUserId, socket);
                        io.sockets.emit(Events.client.UPDATE_ALL_GAME_LOBBIES, JSON.stringify(_this.getGameLobbies()));
                    });
                });
            });
            socket.on(Events.gameLobby.START_GAME_FOR_OTHER_CLIENTS, function (data)
            {
                socket.get('userId', function (err, userId)
                {
                    socket.get('gameLobbyId', function (err, gameLobbyId)
                    {
                        io.log.info(Util.format("@ Events.gameLobby.START_GAME_FOR_OTHER_CLIENTS " + userId + " for lobby " + gameLobbyId + "   " + data));
                        socket.broadcast.to(gameLobbyId).emit(Events.gameLobby.START_GAME_FOR_OTHER_CLIENTS, data);
                    });
                });
            });
            socket.on(Events.client.UPDATE, function (data)
            {
                socket.get('userId', function (err, userId)
                {
                    socket.get('gameLobbyId', function (err, gameLobbyId)
                    {
                        io.log.info(Util.format("@ UPDATE   " + data));
                        socket.broadcast.to(gameLobbyId).emit(Events.client.UPDATE, data);
                    });
                });
            });
            socket.on(Events.client.ACTION, function (data)
            {
                socket.get('userId', function (err, userId)
                {
                    socket.get('gameLobbyId', function (err, gameLobbyId)
                    {
                        io.log.info(Util.format("@ Events.gameLobby.UPDATE from userId " + userId + " for lobby " + gameLobbyId + "   " + data));
                        socket.broadcast.to(gameLobbyId).emit(Events.client.ACTION, data);
                    });
                });
            });
            socket.on(Events.client.CURRENT_WORM_ACTION, function (data)
            {
                socket.get('userId', function (err, userId)
                {
                    socket.get('gameLobbyId', function (err, gameLobbyId)
                    {
                        io.log.info(Util.format("@ Events.client.CURRENT_WORM_ACTION" + userId + " for lobby " + gameLobbyId + "   " + data));
                        socket.broadcast.to(gameLobbyId).emit(Events.client.CURRENT_WORM_ACTION, data);
                    });
                });
            });
        };
        Lobby.prototype.client_init = function ()
        {
            var _this = this;
            this.menu = new LobbyMenu(this);
            if (!Client.connectionToServer(Settings.NODE_SERVER_IP, Settings.NODE_SERVER_PORT))
            {
                return false;
            }
            GameInstance.gameType = Game.types.ONLINE_GAME;
            Client.socket.on(Events.lobby.UPDATE_USER_COUNT, function (userCount)
            {
                Logger.log("Events.lobby.NEW_USER_CONNECTED " + userCount);
                _this.userCount = userCount;
                _this.menu.updateUserCountUI(_this.userCount);
            });
            Client.socket.on(Events.client.UPDATE_ALL_GAME_LOBBIES, function (data)
            {
                Logger.debug(" Events.client.UPDATE_ALL_GAME_LOBBIES " + data);
                var gameLobbyList = JSON.parse(data);
                var updatedGameLobbies = {
                };
                for (var gameLobby in gameLobbyList)
                {
                    updatedGameLobbies[gameLobby] = (Utilies.copy(new GameLobby(null, null), gameLobbyList[gameLobby]));
                }
                _this.gameLobbies = updatedGameLobbies;
                _this.menu.updateLobbyListUI(_this);
            });
            this.client_GameLobby.client_init();
        };
        Lobby.prototype.getGameLobbies = function ()
        {
            return this.gameLobbies;
        };
        Lobby.prototype.client_createGameLobby = function (name, numberOfPlayers, mapName)
        {
            this.menu.displayMessage(" Waiing on more players.... ");
            Client.socket.emit(Events.lobby.CREATE_GAME_LOBBY, {
                "name": name,
                "nPlayers": numberOfPlayers,
                "mapName": mapName
            });
        };
        Lobby.prototype.server_createGameLobby = function (name, numberOfPlayers, mapName)
        {
            var newGameLobby = new GameLobby(name, numberOfPlayers, mapName);
            newGameLobby.server_init();
            this.gameLobbies[newGameLobby.id] = newGameLobby;
            return this.gameLobbies[newGameLobby.id];
        };
        Lobby.prototype.client_joinGameLobby = function (lobbyId)
        {
            this.menu.displayMessage(" Waiting on more players.... ");
            Client.socket.emit(Events.gameLobby.PLAYER_JOIN, lobbyId);
        };
        Lobby.prototype.client_joinQuickGame = function ()
        {
            for (var i in this.gameLobbies)
            {
                var lob = this.gameLobbies[i];
                if (lob.isFull() == false)
                {
                    if (lob.contains(Client.id))
                    {
                        Notify.display("Your already join the lobby", "Still waiting for players");
                    } else
                    {
                        this.menu.displayMessage(" Waiting on more players.... ");
                        Client.socket.emit(Events.gameLobby.PLAYER_JOIN, lob.id);
                        return true;
                    }
                }
            }
            this.client_createGameLobby("Default QuickGame", 2, Maps.smallCastle.name);
        };
        return Lobby;
    })();
    if (typeof exports != 'undefined')
    {
        (module).exports = Lobby;
    }
    var Tutorial = (function ()
    {
        function Tutorial()
        {
            this.currentCommand = -1;
            this.isFinished = false;
        }
        Tutorial.prototype.nextCommand = function ()
        {
            this.currentCommand++;
            if (tutorialCommandBank.length == this.currentCommand)
            {
                this.isFinished = true;
                GameInstance.miscellaneousEffects.stopAll();
            }
        };
        Tutorial.prototype.displayCommandMessage = function (currentCommand, displayTime)
        {
            Notify.hide(function ()
            {
                Notify.display(tutorialCommandBank[currentCommand].header, tutorialCommandBank[currentCommand].message, displayTime);
            });
        };
        Tutorial.prototype.update = function ()
        {
            var _this = this;
            var displayTime = -1;
            if (this.currentCommand == -1)
            {
                this.currentCommand = 0;
                this.displayCommandMessage(this.currentCommand, displayTime);
                GameInstance.gameTimer.timer.pause();
            }
            if (this.isFinished == false && tutorialCommandBank[this.currentCommand].detection())
            {
                if (this.timeOut == null)
                {
                    this.timeOut = setTimeout(function ()
                    {
                        _this.nextCommand();
                        if (_this.currentCommand == tutorialCommandBank.length - 1)
                        {
                            displayTime = 9000;
                        }
                        if (_this.isFinished == false)
                        {
                            _this.displayCommandMessage(_this.currentCommand, displayTime);
                        }
                        clearTimeout(_this.timeOut);
                        _this.timeOut = null;
                    }, 2000);
                }
            }
        };
        return Tutorial;
    })();
    var tutorialCommandBank = [
        {
            header: "Movement 101",
            message: " Move left press <strong>" + keyboard.getKeyName(Controls.walkLeft.keyboard) + "</strong> and move right press <strong>" + keyboard.getKeyName(Controls.walkRight.keyboard) + "</strong>",
            detection: function ()
            {
                if (keyboard.isKeyDown(Controls.walkLeft.keyboard) || keyboard.isKeyDown(Controls.walkRight.keyboard))
                {
                    return true;
                }
            }
        },
        {
            header: "Jumping",
            message: "Cool, alright now press <strong>" + keyboard.getKeyName(Controls.jump.keyboard) + "</strong> to jump",
            detection: function ()
            {
                if (keyboard.isKeyDown(Controls.jump.keyboard))
                {
                    return true;
                }
            }
        },
        {
            header: "BackFlip",
            message: "Try a backflip now press <strong>" + keyboard.getKeyName(Controls.backFlip.keyboard) + "</strong>",
            detection: function ()
            {
                if (keyboard.isKeyDown(Controls.backFlip.keyboard))
                {
                    return true;
                }
            }
        },
        {
            header: "Aiming",
            message: " Now, see the red target circle near you? <strong>" + keyboard.getKeyName(Controls.aimUp.keyboard) + "</strong> and <strong>" + keyboard.getKeyName(Controls.aimDown.keyboard) + "</strong> to rotate it around.",
            detection: function ()
            {
                if (keyboard.isKeyDown(Controls.aimDown.keyboard) || keyboard.isKeyDown(Controls.aimUp.keyboard))
                {
                    return true;
                }
            }
        },
        {
            header: "Weapon Selection",
            message: " Lets have some fun! Pick a weapon by pressing <strong>" + keyboard.getKeyName(Controls.toggleWeaponMenu.keyboard) + "</strong> or right mouse click. Click on the Holy Gernade in the menu",
            detection: function ()
            {
                if (GameInstance.state.getCurrentPlayer().getTeam().getWeaponManager().getCurrentWeapon() instanceof HolyGrenade)
                {
                    return true;
                }
            }
        },
        {
            header: "Firing weapon",
            message: "Now take aim using the red target. Hold <strong>" + keyboard.getKeyName(Controls.fire.keyboard) + "</strong> and then release it to throw gernade",
            detection: function ()
            {
                if (GameInstance.state.getCurrentPlayer().getTeam().getWeaponManager().getCurrentWeapon().isActive)
                {
                    return true;
                }
            }
        },
        {
            header: "Looking around the map",
            message: "You can move the camera around using the arrow keys, give it a shot",
            detection: function ()
            {
                if (keyboard.isKeyDown(keyboard.keyCodes.Leftarrow) || keyboard.isKeyDown(keyboard.keyCodes.Downarrow) || keyboard.isKeyDown(keyboard.keyCodes.Rightarrow) || keyboard.isKeyDown(keyboard.keyCodes.Uparrow))
                {
                    return true;
                }
            }
        },
        {
            header: "Jetpack",
            message: "So select the Jetpack from the weapons menu, press <strong>" + keyboard.getKeyName(Controls.fire.keyboard) + "</strong> and then use directional keys to move",
            detection: function ()
            {
                var weapon = GameInstance.state.getCurrentPlayer().getTeam().getWeaponManager().getCurrentWeapon();
                if (weapon.isActive && weapon instanceof JetPack)
                {
                    return true;
                }
            }
        },
        {
            header: "Awesome!",
            message: "Well Done! Your finished the tutorial, you can just mess around or start a new game",
            detection: function ()
            {
                return true;
            }
        }
    ];
    var Game = (function ()
    {
        function Game()
        {
            var _this = this;
            Graphics.init();
            this.gameType = Game.types.LOCAL_GAME;
            this.actionCanvas = Graphics.createCanvas("action");
            this.actionCanvasContext = this.actionCanvas.getContext("2d");
            this.sticks = new TwinStickControls(this.actionCanvas);
            this.setupCanvas();
            $(window).resize(function ()
            {
                _this.setupCanvas();
            });
            document.addEventListener("fullscreenchange", function ()
            {
                _this.setupCanvas();
            }, false);
            document.addEventListener("mozfullscreenchange", function ()
            {
                _this.setupCanvas();
            }, false);
            document.addEventListener("webkitfullscreenchange", function ()
            {
                _this.setupCanvas();
            }, false);
            Physics.init(this.actionCanvasContext);
            this.state = new GameStateManager();
            this.players = [];
            this.spawns = [];
            if (Settings.DEVELOPMENT_MODE && this.particleEffectMgmt != null)
            {
                window.addEventListener("click", function (evt)
                {
                    _this.particleEffectMgmt.add(new ParticleEffect(_this.camera.getX() + evt.pageX, _this.camera.getY() + evt.pageY));
                    _this.spawns.push(new b2Vec2(_this.camera.getX() + evt.pageX, _this.camera.getY() + evt.pageY));
                    Logger.log(JSON.stringify(_this.spawns));
                }, false);
            }
            this.lobby = new Lobby();
        }
        Game.types = {
            ONLINE_GAME: 0,
            LOCAL_GAME: 1
        };
        Game.map = new Map(Maps.castle);
        Game.prototype.getGameNetData = function ()
        {
            return new GameDataPacket(this);
        };
        Game.prototype.setGameNetData = function (data)
        {
            var gameDataPacket = Utilies.copy(new GameDataPacket(this), data);
            gameDataPacket.override(this);
        };
        Game.prototype.setupCanvas = function ()
        {
            this.actionCanvas.width = $(window).width();
            this.actionCanvas.height = $(window).height();
            this.actionCanvasContext.font = 'bold 16px Sans-Serif';
            this.actionCanvasContext.textAlign = 'center';
            this.actionCanvasContext.fillStyle = "#384084";
        };
        Game.prototype.goFullScreen = function ()
        {
        };
        Game.prototype.start = function (playerIds)
        {
            if (typeof playerIds === "undefined") { playerIds = null; }
            var _this = this;
            this.terrain = new Terrain(this.actionCanvas, Game.map.getTerrainImg(), Physics.world, Physics.worldScale);
            this.camera = new Camera(this.terrain.getWidth(), this.terrain.getHeight(), this.actionCanvas.width, this.actionCanvas.height);
            this.camera.setX(this.terrain.getWidth() / 2);
            this.camera.setY(this.terrain.getHeight() / 2);
            if (this.gameType == Game.types.LOCAL_GAME)
            {
                for (var i = 0; i < 2; i++)
                {
                    this.players.push(new Player());
                }
            } else if (this.gameType == Game.types.ONLINE_GAME && playerIds != null)
            {
                for (var i = 0; i < playerIds.length; i++)
                {
                    this.players.push(new Player(playerIds[i]));
                }
            }
            this.state.init(this.players);
            this.wormManager = new WormManager(this.players);
            this.weaponMenu = new WeaponsMenu();
            this.healthMenu = new HealthMenu(this.players);
            this.gameTimer = new CountDownTimer();
            this.particleEffectMgmt = new EffectsManager();
            this.miscellaneousEffects = new EffectsManager();
            this.enviormentEffects = new EffectsManager();
            for (var i = 0; i < 15; i++)
            {
                this.enviormentEffects.add(new Cloud());
            }
            this.healthMenu.show();
            this.gameTimer.show();
            this.weaponMenu.show();
            if (this.gameType == Game.types.ONLINE_GAME)
            {
                StartMenu.callback();
            }
            $(document).keydown(function (e)
            {
                if (e.keyCode == keyboard.keyCodes.Backspace)
                {
                    e.preventDefault();
                }
            });
            TouchUI.init();
            setTimeout(function ()
            {
                _this.state.physicsWorldSettled = true;
            }, 1200);
            this.nextTurn();
        };
        Game.prototype.nextTurn = function ()
        {
            var id = this.state.nextPlayer();
            if (id == null)
            {
                this.nextTurn();
            } else
            {
                Logger.log(" Player was " + this.lobby.client_GameLobby.currentPlayerId + " player is now " + id);
                this.lobby.client_GameLobby.currentPlayerId = id;
                this.gameTimer.timer.reset();
                AssetManager.getSound("yessir").play();
                if (this.tutorial == null && Client.isClientsTurn())
                {
                    Notify.display("Time's a ticking", "Its your go " + this.state.getCurrentPlayer().getTeam().name, 9000);
                } else if (this.tutorial == null)
                {
                    GameInstance.miscellaneousEffects.stopAll();
                    Notify.display(this.state.getCurrentPlayer().getTeam().name + "'s turn", "Sit back relax and enjoy the show", 9000, Notify.levels.warn);
                }
            }
        };
        Game.prototype.update = function ()
        {
            if (this.state.isStarted)
            {
                if (this.winner == null)
                {
                    this.winner = this.state.checkForWinner();
                    if (this.winner)
                    {
                        this.gameTimer.timer.pause();
                        this.winner.getTeam().celebrate();
                        if (this.winner.id == Client.id && access_token && GameInstance.gameType != Game.types.LOCAL_GAME)
                        {
                            Notify.display("Congratulations you won!", "", -1, Notify.levels.sucess, true);
                            $.ajax({
                                url: "http://worms.ciaranmccann.me/updateUser/" + access_token,
                                dataType: 'jsonp'
                            });
                        } else
                        {
                            Notify.display("Unlucky you lost, better luck next time", "", -1, Notify.levels.error, true);
                        }
                    }
                }
                if (this.state.readyForNextTurn() && this.winner == null)
                {
                    if (Client.isClientsTurn())
                    {
                        Client.sendImmediately(Events.client.ACTION, new InstructionChain("nextTurn"));
                        this.nextTurn();
                    }
                }
                if (this.tutorial != null)
                {
                    this.tutorial.update();
                }
                for (var i = this.players.length - 1; i >= 0; --i)
                {
                    this.players[i].update();
                }
                this.terrain.update();
                this.camera.update();
                this.particleEffectMgmt.update();
                this.miscellaneousEffects.update();
                this.enviormentEffects.update();
                this.gameTimer.update();
                if (Client.isClientsTurn())
                {
                    GameInstance.sticks.update();
                }
            }
        };
        Game.prototype.step = function ()
        {
            if (this.state.isStarted)
            {
                Physics.world.Step((1 / 60), 10, 10);
                if (this.gameType == Game.types.ONLINE_GAME && this.lobby.client_GameLobby.currentPlayerId == Client.id)
                {
                    Client.sendRateLimited(Events.client.UPDATE, new PhysiscsDataPacket(Physics.fastAcessList).toJSON());
                }
            }
        };
        Game.prototype.draw = function ()
        {
            this.actionCanvasContext.clearRect(0, 0, this.actionCanvas.width, this.actionCanvas.height);
            this.actionCanvasContext.save();
            this.actionCanvasContext.translate(-this.camera.getX(), -this.camera.getY());
            this.enviormentEffects.draw(this.actionCanvasContext);
            this.terrain.wave.drawBackgroundWaves(this.actionCanvasContext, 0, this.terrain.bufferCanvas.height, this.terrain.getWidth());
            this.actionCanvasContext.restore();
            this.terrain.draw(this.actionCanvasContext);
            this.actionCanvasContext.save();
            this.actionCanvasContext.translate(-this.camera.getX(), -this.camera.getY());
            this.terrain.wave.draw(this.actionCanvasContext, this.camera.getX(), this.terrain.bufferCanvas.height, this.terrain.getWidth());
            if (Settings.PHYSICS_DEBUG_MODE)
            {
                Physics.world.DrawDebugData();
            }
            for (var i = this.players.length - 1; i >= 0; --i)
            {
                this.players[i].draw(this.actionCanvasContext);
            }
            this.miscellaneousEffects.draw(this.actionCanvasContext);
            this.particleEffectMgmt.draw(this.actionCanvasContext);
            this.actionCanvasContext.restore();
            if (Client.isClientsTurn())
            {
                GameInstance.sticks.draw(this.actionCanvasContext);
            }
        };
        return Game;
    })();
    var GameDataPacket = (function ()
    {
        function GameDataPacket(game, physics)
        {
            if (typeof physics === "undefined") { physics = Physics; }
            this.players = [];
            for (var p in game.players)
            {
                this.players.push(new PlayerDataPacket(game.players[p]));
            }
        }
        GameDataPacket.prototype.override = function (game, physics)
        {
            if (typeof physics === "undefined") { physics = Physics; }
            for (var p in this.players)
            {
                this.players[p].override(game.players[p]);
            }
        };
        return GameDataPacket;
    })();
    var SettingsMenu = (function ()
    {
        function SettingsMenu()
        {
            this.CSS_ID = {
                MAP_LIST_DIV: "#maps"
            };
            this.levelName = Maps.priates.name;
            this.view = '<div id="mapSelector"><h1 style="text-align: center">Select a Map</h1><p> <div class="row-fluid" style="text-align: center"><ul class="thumbnails"></p>';
            for (var map in Maps)
            {
                this.view += this.addMapItem(Maps[map], map);
            }
            this.view += '</ul></div><p style="text-align: center"> All map images were sourced from <a href="http://wmdb.org/">http://wmdb.org/</a></p></div>';
        }
        SettingsMenu.prototype.addMapItem = function (map, name)
        {
            var item = '<li class="span4" style="width:30%"><a href="#" class="thumbnail" id={1}>' + '<img style="width: 160px; height: 80px;" src={0}> </a></li>';
            item = item.format(AssetManager.getImage(map.smallImage).src, name);
            return item;
        };
        SettingsMenu.prototype.bind = function (callback)
        {
            var _this = this;
            $('a.thumbnail').click(function ()
            {
                var levelId = $(this).attr('id');
                $('a.thumbnail').css({
                    "background": "white"
                });
                $(this).css({
                    "background": "yellow"
                });
                _this.levelName = levelId;
                Game.map = new Map(Maps[levelId]);
                callback();
            });
        };
        SettingsMenu.prototype.getLevelName = function ()
        {
            return this.levelName;
        };
        SettingsMenu.prototype.getView = function ()
        {
            return this.view;
        };
        return SettingsMenu;
    })();
    var StartMenu = (function ()
    {
        function StartMenu()
        {
            this.controlsView = '<div style="text-align:center">' + ' <p>Just incase you have never played the original worms armageddon, its a turn base deathmatch game. Where you control a team of worms. Use whatever weapons you have to destroy the enemy. <p><br>' + '<p><kbd> Space' + '</kbd>  <kbd> ' + String.fromCharCode(Controls.walkLeft.keyboard) + '</kbd> <kbd> ' + String.fromCharCode(Controls.walkRight.keyboard) + '</kbd> - Jump, Left, Right. <br> <br>' + ' <kbd>' + String.fromCharCode(Controls.aimUp.keyboard) + '</kbd> ' + ' <kbd>' + String.fromCharCode(Controls.aimDown.keyboard) + '</kbd> ' + ' - Aim up and down. </p><br>' + ' <kbd>' + String.fromCharCode(Controls.toggleWeaponMenu.keyboard) + '</kbd> or right mouse - Weapon Menu. </p><br>' + ' <kbd>Enter</kbd> - Fire weapon. </p><p></p><br>' + '<a class="btn btn-primary btn-large" id="startLocal" style="text-align:center">Lets play!</a></div>';
        }
        StartMenu.prototype.hide = function ()
        {
            $('#startMenu').remove();
        };
        StartMenu.prototype.onGameReady = function (callback)
        {
            var _this = this;
            var _this = this;
            StartMenu.callback = callback;
            if (!Settings.DEVELOPMENT_MODE)
            {
                var loading = setInterval(function ()
                {
                    $('#notice').empty();
                    if (AssetManager.getPerAssetsLoaded() >= 100)
                    {
                        clearInterval(loading);
                        _this.settingsMenu = new SettingsMenu();
                        $('#startLocal').removeAttr("disabled");
                        $('#startOnline').removeAttr("disabled");
                        if ($.browser.msie)
                        {
                            $('#startTutorial').removeAttr("disabled");
                            $('#notice').append('<div class="alert alert-error" style="text-align:center">' + '<strong>Bad news :( </strong> Your using Internet explorer, the game preformance will be hurt. For best preformance use ' + '<a href="https://www.google.com/intl/en/chrome/browser/">Chrome</a> or <a href="http://www.mozilla.org/en-US/firefox/new/">FireFox</a>. </div> ');
                        } else if (TouchUI.isTouchDevice())
                        {
                            $('#notice').append('<div class="alert alert-error" style="text-align:center">' + '<strong>Hey tablet user</strong> There may be performance problems and some missing features in the tablet version. You can still play though!</div> ');
                        } else
                        {
                            $('#startTutorial').removeAttr("disabled");
                            $('#notice').append('<div class="alert alert-success" style="text-align:center"> <strong> Games loaded and your ready to play!! </strong><br> Also thanks for using a modern browser. <a href="#" id="awesome">Your awesome!</a></div> ');
                            $('#awesome').click(function ()
                            {
                                Notify.display("Awesome!", "<img src='../college/fyp/images/awesome.jpg'/>", 5000);
                            });
                        }
                    } else
                    {
                        $('#notice').append('<div class="alert alert-info" style="text-align:center"> <strong> Stand back! I\'m loading game assets! </strong>' + '<div class="progress progress-striped active"><div class="bar" style="width: ' + AssetManager.getPerAssetsLoaded() + '%;"></div></div></div> ');
                    }
                }, 500);
                $('#startLocal').click(function ()
                {
                    if (AssetManager.isReady())
                    {
                        $('#startLocal').off('click');
                        AssetManager.getSound("CursorSelect").play();
                        $('.slide').empty();
                        $('.slide').append(_this.settingsMenu.getView());
                        _this.settingsMenu.bind(function ()
                        {
                            AssetManager.getSound("CursorSelect").play();
                            _this.controlsMenu(callback);
                        });
                    }
                });
                $('#startOnline').click(function ()
                {
                    $('#startOnline').off('click');
                    if (AssetManager.isReady())
                    {
                        if (GameInstance.lobby.client_init() != false)
                        {
                            $('#notice').empty();
                            GameInstance.lobby.menu.show(callback);
                            AssetManager.getSound("CursorSelect").play();
                        } else
                        {
                            $('#notice').empty();
                            $('#notice').append('<div class="alert alert-error"> <strong> Oh Dear! </strong> Looks like the multiplayer server is down. Try a local game for a while?</div> ');
                        }
                    }
                });
                $('#startTutorial').click(function ()
                {
                    $('#startTutorial').off('click');
                    if (AssetManager.isReady())
                    {
                        AssetManager.getSound("CursorSelect").play();
                        GameInstance.tutorial = new Tutorial();
                        _this.controlsMenu(callback);
                    }
                });
            } else
            {
                var loading = setInterval(function ()
                {
                    if (AssetManager.getPerAssetsLoaded() == 100)
                    {
                        clearInterval(loading);
                        callback();
                    }
                }, 2);
            }
        };
        StartMenu.prototype.controlsMenu = function (callback)
        {
            var _this = this;
            $('.slide').fadeOut('normal', function ()
            {
                $('.slide').empty();
                $('.slide').append(_this.controlsView);
                $('.slide').fadeIn('slow');
                $('#startLocal').click(function ()
                {
                    $('#startLocal').unbind();
                    $('#splashScreen').remove();
                    $('#startMenu').fadeOut('normal');
                    AssetManager.getSound("CursorSelect").play();
                    AssetManager.getSound("StartRound").play(1, 0.5);
                    callback();
                });
            });
        };
        return StartMenu;
    })();
    var GameInstance;
    $(document).ready(function ()
    {
        Settings.getSettingsFromUrl();
        if (!Settings.RUN_UNIT_TEST_ONLY)
        {
            var startMenu = new StartMenu();
            GameInstance = new Game();
            AssetManager.loadAssets();
            startMenu.onGameReady(function ()
            {
                startMenu.hide();
                if (GameInstance.state.isStarted == false)
                {
                    GameInstance.start();
                }
                function gameloop()
                {
                    if (Settings.DEVELOPMENT_MODE)
                    {
                        Graphics.stats.update();
                    }
                    GameInstance.step();
                    GameInstance.update();
                    GameInstance.draw();
                    window.requestAnimationFrame(gameloop);
                }
                gameloop();
            });
        }
    });
})();