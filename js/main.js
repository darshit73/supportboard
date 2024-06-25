
/*
 * ==========================================================
 * MAIN SCRIPT
 * ==========================================================
 *
 * Main JavaScript file. This file is shared by frond-end and back-end. © 2017-2024 board.support. All rights reserved.
 * 
 */

'use strict';

(function ($) {

    var version = '3.7.3';
    var main;
    var global;
    var upload_target;
    var admin = false;
    var tickets = false;
    var timeout = false;
    var timeout_typing = false;
    var timeout_label_date = [false, false];
    var interval = false;
    var timeout_debounce = [];
    var previous_search;
    var sb_current_user = false;
    var chat;
    var chat_editor;
    var chat_textarea;
    var chat_header;
    var chat_status;
    var chat_emoji;
    var chat_scroll_area;
    var label_date;
    var label_date_items = false;
    var label_date_show = false;
    var label_date_history = [9999999, ''];
    var document_title = document.title;
    var CHAT_SETTINGS = {};
    var mobile = $(window).width() < 465;
    var mobile = $(window).width() < 465;
    var bot_id;
    var force_action = '';
    var dialogflow_human_takeover;
    var agents_online = false;
    var ND = 'undefined';
    var cookies_supported = true;
    var utc_offset = (new Date()).getTimezoneOffset() * 60000;
    var cloud_data = false;
    var articles_page = false;
    var ajax_calls;
    var audio_recorder_dom;
    var audio_recorder_dom_time;
    var audio_recorder;
    var audio_recorder_chunks;
    var audio_recorder_time = [0, false];
    var audio_recorder_time_player = [0, false];
    var audio_recorder_stream;
    var prevent_focusout = false;
    var init_push_notifications = false;
    var conversation_update_last_check = 0;

    /*
    * ----------------------------------------------------------
    * EXTERNAL PLUGINS
    * ----------------------------------------------------------
    */

    // Auto Expand Scroll Area | Schiocco
    $.fn.extend({ manualExpandTextarea: function () { var t = this[0]; t.style.height = "auto", t.style.maxHeight = "25px"; window.getComputedStyle(t); t.style.height = (t.scrollHeight > 350 ? 350 : t.scrollHeight) + "px", t.style.maxHeight = "", $(t).trigger("textareaChanged") }, autoExpandTextarea: function () { var t = this[0]; t.addEventListener("input", function (e) { $(t).manualExpandTextarea() }, !1) } });

    // Autolink-js
    (function () { var t = [].slice; String.prototype.autoLink = function () { var n, a, r, i, c, e, l; return e = /(^||[\s\n]|<[A-Za-z]*\/?>)((?:https?|ftp):\/\/[\-A-Z0-9+\u0026\u2019@#\/%?=()~_|!:,.;]*[\-A-Z0-9+\u0026@#\/%=~_|])/gi, 0 < (c = 1 <= arguments.length ? t.call(arguments, 0) : []).length ? (i = c[0], n = i.callback, r = function () { var t; for (a in t = [], i) l = i[a], "callback" !== a && t.push(" " + a + "='" + l + "'"); return t }().join(""), this.replace(e, function (t, a, i) { return "" + a + (("function" == typeof n ? n(i) : void 0) || "<a href='" + i + "'" + r + ">" + i + "</a>") })) : this.replace(e, "$1<a href='$2'>$2</a>") } }).call(this);

    /*
    * ----------------------------------------------------------
    * FUNCTIONS
    * ----------------------------------------------------------
    */

    var SBF = {
        visibility_status: 'visible',

        // Main Ajax function
        ajax: function (data, onSuccess = false) {
            if (ajax_calls) {
                ajax_calls[0].push(data);
                ajax_calls[1].push(onSuccess);
            } else {
                ajax_calls = [[data], [onSuccess]];
                setTimeout(() => {
                    let onSuccessCalls = ajax_calls[1];
                    let data_auto = { 'login-cookie': SBF.loginCookie() }
                    if (activeUser()) {
                        data_auto.user_id = activeUser().id;
                    }
                    if (typeof SB_LANG != ND) {
                        data_auto.language = SB_LANG;
                    }
                    if (cloud_data) {
                        data_auto.cloud = cloud_data;
                    }
                    if (location.search.includes('debug')) {
                        data_auto.debug = true;
                    }
                    $.ajax({
                        method: 'POST',
                        url: SB_AJAX_URL,
                        data: $.extend({ function: 'ajax_calls', calls: ajax_calls[0] }, data_auto)
                    }).done((response) => {
                        let result;
                        if (Array.isArray(response)) {
                            result = response;
                        } else if (response === 'invalid-session') {
                            setTimeout(() => { SBF.reset() }, 1000);
                        } else {
                            try {
                                result = typeof response === 'string' || response instanceof String ? JSON.parse(response) : response;
                            } catch (e) {
                                if (admin) {
                                    SBAdmin.conversations.busy = false;
                                    SBApps.dialogflow.smart_reply_busy = false;
                                }
                                SBChat.is_busy_update = false;
                                SBChat.busy(false);
                                console.log(response);
                                SBF.error(response.length > 500 ? response.substr(0, 500) + '... Check the console for more details.' : response, `SBF.ajax.${data.function}`);
                                return;
                            }
                        }
                        for (var i = 0; i < result.length; i++) {
                            let result_sub = result[i];
                            if (!Array.isArray(result_sub)) {
                                result_sub = result;
                            }
                            if (result_sub[0] == 'success') {
                                onSuccess = onSuccessCalls[i];
                                if (onSuccess) {
                                    onSuccess(result_sub[1]);
                                }
                            } else if (SBF.errorValidation(result_sub)) {
                                if (onSuccess) {
                                    onSuccess(result_sub);
                                }
                            } else {
                                if (admin) {
                                    if (result_sub[1] == 'security-error') {
                                        setTimeout(() => { SBF.reset() }, 1000);
                                    }
                                    SBAdmin.conversations.busy = false;
                                }
                                SBChat.is_busy_update = false;
                                SBChat.busy(false);
                                let result_sub_arr = JSON.parse(result_sub);
                                if (Array.isArray(result_sub_arr) && result_sub_arr[0] == 'error' && result_sub_arr[2] && result_sub_arr[3]) {
                                    SBF.error(result_sub_arr[3], result_sub_arr[2]);
                                } else {
                                    SBF.error(JSON.stringify(result_sub).replace(/\\/g, "").replace(/\"/g, "").replace(/\[/g, "").replace(/\]/g, "").replace('error,', ''), data.function);
                                }
                            }
                        }
                    });
                    ajax_calls = false;
                }, 100);
            }
        },

        // Cors function
        cors: function (method = 'GET', url, onSuccess) {
            let xhr = new XMLHttpRequest();
            if ('withCredentials' in xhr) {
                xhr.open(method, url, true);
            } else if (typeof XDomainRequest != ND) {
                xhr = new XDomainRequest();
                xhr.open(method, url);
            } else {
                return false;
            }
            xhr.onload = function () {
                onSuccess(xhr.responseText);
            };
            xhr.onerror = function () {
                return false;
            };
            xhr.send();
        },

        // Uploads
        upload: function (form, onSuccess) {
            if (cloud_data) form.append('cloud', cloud_data);
            jQuery.ajax({
                url: SB_URL + '/include/upload.php',
                cache: false,
                contentType: false,
                processData: false,
                data: form,
                type: 'POST',
                success: function (response) {
                    onSuccess(response);
                }
            });
        },

        // UTC Time
        UTC: function (datetime) {
            return new Date(datetime).getTime() - utc_offset;
        },

        // Check if a variable is null or empty
        null: function (obj) { if (typeof (obj) !== ND && obj !== null && obj !== 'null' && obj !== false && (obj.length > 0 || typeof (obj) == 'number' || typeof (obj.length) == ND) && obj !== ND) return false; else return true; },

        // Deactivate and hide the elements
        deactivateAll: function () {
            global.find('.sb-popup, .sb-tooltip, .sb-list .sb-menu, .sb-select ul').sbActive(false);
        },

        // Deselect the content of the target
        deselectAll: function () {
            if (window.getSelection) {
                window.getSelection().removeAllRanges();
            } else if (document.selection) {
                document.selection.empty();
            }
        },

        // Get URL parameters
        getURL: function (name = false, url = false) {
            if (!url) {
                url = location.search;
            }
            if (name == false) {
                var c = url.split('?').pop().split('&');
                var p = {};
                for (var i = 0; i < c.length; i++) {
                    var d = c[i].split('=');
                    p[d[0]] = SBF.escape(d[1]);
                }
                return p;
            }
            if (url.indexOf('?') > 0) {
                url = url.substr(0, url.indexOf('?'));
            }
            return SBF.escape(decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(url) || [, ""])[1].replace(/\+/g, '%20') || ""));
        },

        URL: function () {
            return window.location.href.substr(0, window.location.href.indexOf('?'));
        },

        // Convert a string to slug and inverse
        stringToSlug: function (string) {
            string = string.trim();
            string = string.toLowerCase();
            var from = "åàáãäâèéëêìíïîòóöôùúüûñç·/_,:;";
            var to = "aaaaaaeeeeiiiioooouuuunc------";
            for (var i = 0, l = from.length; i < l; i++) {
                string = string.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
            }
            return string.replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+/, '').replace(/-+$/, '').replace(/ /g, '');
        },

        slugToString: function (string) {
            string = string.replace(/_/g, ' ').replace(/-/g, ' ');
            return string.charAt(0).toUpperCase() + string.slice(1);
        },

        // Random string
        random: function () {
            let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
            let result = '';
            for (var i = 5; i > 0; --i) result += chars[Math.floor(Math.random() * 62)];
            return result;
        },

        // Check if a user type is an agent
        isAgent: function (user_type) {
            return user_type == 'agent' || user_type == 'admin' || user_type == 'bot';
        },

        // Get cors elapsed of a given date from now
        beautifyTime: function (datetime, extended = false, future = false) {
            let date;
            if (datetime == '0000-00-00 00:00:00') return '';
            if (datetime.indexOf('-') > 0) {
                let arr = datetime.split(/[- :]/);
                date = new Date(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5]);
            } else {
                let arr = datetime.split(/[. :]/);
                date = new Date(arr[2], arr[1] - 1, arr[0], arr[3], arr[4], arr[5]);
            }
            let now = new Date();
            let date_string = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()));
            let diff_days = ((now - date_string) / 86400000) * (future ? -1 : 1);
            let days = [sb_('Sunday'), sb_('Monday'), sb_('Tuesday'), sb_('Wednesday'), sb_('Thursday'), sb_('Friday'), sb_('Saturday')];
            let time = date_string.toLocaleTimeString(navigator.language, { hour: '2-digit', minute: '2-digit' });
            if (time.charAt(0) === '0' && (time.includes('PM') || time.includes('AM'))) time = time.substring(1);
            if (diff_days < 1 && now.getDate() == date_string.getDate()) {
                return extended ? `<span>${sb_('Today')}</span> <span>${time}</span>` : `<span data-today>${time}</span>`;
            } else if (diff_days < 7) {
                return `<span>${days[date_string.getDay()]}</span>${extended ? ` <span>${time}</span>` : ''}`;
            } else {
                return `<span>${date_string.toLocaleDateString()}</span>${extended ? ` <span>${time}</span>` : ''}`;
            }
        },

        // Get the unix timestamp value of a date string with format yyyy-mm-dd hh:mm:ss
        unix: function (datetime) {
            let arr = datetime.split(/[- :]/);
            return Date.UTC(arr[0], arr[1] - 1, arr[2], arr[3], arr[4], arr[5]);
        },

        // Generate a string containing the agent location and time
        getLocationTimeString: function (details, onSuccess) {
            if (details.timezone) {
                let location = {};
                location.timezone = details.timezone.value;
                location.country = details.country ? details.country.value : location.timezone.split('/')[0].replace(/_/g, ' ');
                location.city = details.city ? details.city.value : location.timezone.split('/')[1].replace(/_/g, ' ');
                SBF.cors('GET', 'https://worldtimeapi.org/api/timezone/' + location.timezone, function (response) {
                    response = JSON.parse(response);
                    if (SBF.null(response) || response.error) {
                        SBF.error(response, 'SBF.getLocationTimeString()');
                        onSuccess(responseonSuccess);
                    } else {
                        let datetime = response.datetime.replace('T', ' ');
                        onSuccess(`${new Date(datetime.substr(0, datetime.indexOf('.'))).toLocaleString([], { hour: '2-digit', minute: '2-digit' })} ${sb_('in')} ${location.city ? location.city : ''}${location.country ? ', ' + location.country : ''}`);
                    }
                });
            }
        },

        // Date string
        dateDB: function (date) {
            if (date == 'now') {
                date = (new Date).toISOString().replace('T', ' ');
                if (date.indexOf('.') > 0) {
                    date = date.substr(0, date.indexOf('.'));
                }
                return date;
            } else {
                return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
            }
        },

        // Set and get users last activity
        updateUsersActivity: function (user_id, return_user_id, onSuccess) {
            if (SBPusher.active) {
                onSuccess(SBPusher.online_ids.includes(return_user_id) ? 'online' : 'offline');
            } else {
                SBF.ajax({
                    function: 'update-users-last-activity',
                    user_id: user_id,
                    return_user_id: return_user_id,
                    check_slack: !admin && CHAT_SETTINGS.slack_active
                }, (response) => {
                    if (response === 'online') {
                        onSuccess('online');
                    } else {
                        onSuccess('offline');
                    }
                });
            }
        },

        // Search functions
        search: function (search, searchFunction) {
            search = search.toLowerCase();
            if (search == previous_search) {
                global.find('.sb-search-btn i').sbLoading(false);
                return;
            }
            clearTimeout(timeout);
            timeout = setTimeout(function () {
                previous_search = search;
                searchFunction();
            }, 500);
        },

        searchClear: function (icon, onSuccess) {
            let search = $(icon).next().val();
            if (search) {
                $(icon).next().val('');
                onSuccess();
            }
        },

        // Support Board error js reporting
        error: function (message, function_name) {
            let is_full_error = message.includes(function_name);
            if (admin && SBAdmin.is_logout) {
                return;
            }
            if (message instanceof Error) {
                message = message.message;
            }
            if (message[message.length - 1] == '.') {
                message = message.slice(0, -1);
            }
            if (admin && message && !function_name.includes('update-users-last-activity') && !function_name.startsWith('security-error')) {
                SBAdmin.infoPanel(`<pre>${is_full_error ? `` : `[Error] [${function_name}] `}${message}. Check the console for more details.</pre>`, 'info', false, 'error');
            }
            global.find('.sb-loading').sbLoading(false);
            SBChat.busy(false);
            SBF.event('SBError', { message: message, function_name: function_name });
            throw new Error(is_full_error ? message : `Support Board Error [${function_name}]: ${message}.`);
        },

        errorValidation: function (response, code = true) {
            return Array.isArray(response) && response[0] === 'validation-error' && (code === true || response[1] == code);
        },

        // Login
        loginForm: function (button, area = false, onSuccess = false) {
            button = $(button);
            if (!button.sbLoading()) {
                if (area === false) area = button.closest('.sb-rich-login'); else area = $(area);
                let email = $.trim(area.find('#email input').val());
                let password = $.trim(area.find('#password input').val());
                if (!email || !password) {
                    area.find('.sb-info').html(sb_('Please insert email and password.')).sbActive(true);
                } else {
                    SBF.ajax({
                        function: 'login',
                        email: email,
                        password: password
                    }, (response) => {
                        if (response && Array.isArray(response)) {
                            if (!admin && this.isAgent(response[0].user_type)) {
                                SBForm.showErrorMessage(area, 'You cannot sign in as an agent.');
                                SBChat.scrollBottom();
                            } else {
                                let user = new SBUser(response[0]);
                                user.set('conversation_id', SBChat.conversation ? SBChat.conversation.id : false);
                                this.loginCookie(response[1]);
                                this.event('SBLoginForm', user);
                                if (onSuccess) {
                                    onSuccess(response);
                                }
                            }
                            if (SBF.setting('wp-users-system') == 'wp') {
                                SBApps.wordpress.ajax('wp-login', { user: email, password: password });
                            }
                        } else {
                            area.find('.sb-info').html(sb_(response === 'ip-ban' ? 'Too many login attempts. Please retry again in a few hours.' : 'Invalid email or password.')).sbActive(true);
                            if (!admin) {
                                SBChat.scrollBottom();
                            }
                        }
                        button.sbLoading(false);
                    });
                    area.find('.sb-info').html('').sbActive(false);
                    button.sbLoading(true);
                }
            }
        },

        // Set the login cookie
        loginCookie: function (value = false) {
            if (value === false) { return this.cookie('sb-login') ? this.cookie('sb-login') : storage('login'); }
            if (CHAT_SETTINGS.cloud) {
                storage('login', value);
            } else {
                this.cookie('sb-login', value, 3650, 'set');
            }
        },

        // Login
        login: function (email = '', password = '', user_id = '', token = '', onSuccess = false) {
            SBF.ajax({
                function: 'login',
                email: email,
                password: password,
                user_id: user_id,
                token: token
            }, (response) => {
                if (response != false && Array.isArray(response)) {
                    this.loginCookie(response[1]);
                    if (onSuccess) {
                        onSuccess(response);
                    }
                    return true;
                } else {
                    return false;
                }
            });
        },

        // Logout
        logout: function (reload = true) {
            SBChat.stopRealTime();
            this.cookie('sb-login', '', '', false);
            this.cookie('sb-cloud', '', '', false);
            storage('open-conversation', '');
            storage('login', '');
            SBChat.conversations = false;
            activeUser(false);
            if (typeof sb_beams_client !== ND) {
                sb_beams_client.stop();
            }
            if (typeof SB_AJAX_URL !== ND) {
                SBF.ajax({
                    function: 'logout'
                }, () => {
                    SBF.event('SBLogout');
                    if (reload) {
                        setTimeout(() => { location.reload() }, 500);
                    }
                });
            }
        },

        // Return the active user
        activeUser: function () {
            return activeUser();
        },

        // Get the active user
        getActiveUser: function (database = false, onSuccess) {
            let app_login = SBApps.login();
            if (!app_login && (storage('wp-login') || storage('whmcs-login') || storage('perfex-login') || storage('aecommerce-login'))) {
                this.cookie('sb-login', '', '', 'delete');
                activeUser(false);
                storage('login', '');
                storage('wp-login', '');
                storage('whmcs-login', '');
                storage('perfex-login', '');
                storage('aecommerce-login', '');
            }
            SBF.ajax({
                function: 'get-active-user',
                db: database,
                login_app: JSON.stringify(app_login),
                user_token: SBF.getURL('token')
            }, (response) => {
                if (!response) {
                    onSuccess();
                    return false;
                } else {
                    if (response.cookie) SBF.loginCookie(response.cookie);
                    if (response.user_type) {
                        if (!admin && SBF.isAgent(response.user_type)) {
                            let message = 'You are logged in as both agent and user. Logout or use another browser, Incognito or Private mode, to login as user. Force a logout by running the function SBF.reset() in the console.';
                            if (!storage('double-login-alert')) {
                                storage('double-login-alert', true);
                                alert(message);
                            }
                            console.warn('Support Board: ' + message);
                            SBF.event('SBDoubleLoginError');
                        } else {
                            activeUser(new SBUser(response, response.phone ? { phone: response.phone } : {}));
                            SBPusher.start();
                            if (app_login) {
                                storage(app_login[1] + '-login', true);
                            }
                            onSuccess();
                            SBF.event('SBActiveUserLoaded', response);
                        }
                    }
                }
            });
        },

        // Clean
        reset: function () {
            let cookies = ['sb-login', 'sb-cloud', 'sb-dialogflow-disabled'];
            for (var i = 0; i < cookies.length; i++) {
                this.cookie(cookies[i], '', 0, false);
            }
            try { localStorage.removeItem('support-board') } catch (e) { }
            this.logout();
        },

        // Lightbox
        lightbox: function (content) {
            let lightbox = $(admin ? global : main).find('.sb-lightbox-media');
            lightbox.sbActive(true).find(' > div').html(content);
            if (admin) {
                SBAdmin.open_popup = lightbox;
            }
        },

        // Manage the local storage
        storage: function (key, value = ND) {
            try { if (typeof localStorage == ND) return false } catch (e) { return false }
            let settings = localStorage.getItem('support-board');
            if (settings === null) {
                settings = {};
            } else {
                settings = JSON.parse(settings);
            }
            if (value === ND) {
                return key in settings ? settings[key] : false;
            } else {
                if (!value) {
                    delete settings[key];
                } else {
                    settings[key] = value;
                }
                localStorage.setItem('support-board', JSON.stringify(settings));
            }
        },

        // Save the current time or check if the saved time is older than the given hours
        storageTime: function (key, hours = false) {
            let today = new Date();
            if (hours === false) {
                storage(key, today.getTime());
            } else {
                if (storage(key) == false) {
                    return true;
                }
                if ((today.getTime() - storage(key)) > (3600000 * hours)) {
                    storage(key, false);
                    return true;
                }
                return false;
            }
        },

        // Set or get a cookie
        cookie: function (name, value = false, expiration_days = false, action = 'get', seconds = false) {
            let cookie_https = location.protocol == 'https:' ? 'SameSite=None;Secure;' : '';
            let settings = window[admin ? 'SB_ADMIN_SETTINGS' : 'CHAT_SETTINGS'];
            let domain = settings && settings.cookie_domain ? 'domain=' + settings.cookie_domain + ';' : '';
            if (action == 'get') {
                if (!cookies_supported) {
                    return this.storage(name);
                }
                let cookies = document.cookie.split(';');
                for (var i = 0; i < cookies.length; i++) {
                    var cookie = cookies[i];
                    while (cookie.charAt(0) == ' ') {
                        cookie = cookie.substring(1);
                    }
                    if (cookie.indexOf(name) == 0) {
                        let value = cookie.substring(name.length + 1, cookie.length);
                        return this.null(value) ? false : value;
                    }
                }
                return false;
            } else if (action == 'set') {
                if (!cookies_supported) {
                    this.storage(name, value);
                } else {
                    let date = new Date();
                    date.setTime(date.getTime() + (expiration_days * (seconds ? 1 : 86400) * 1000));
                    document.cookie = name + "=" + value + ";expires=" + date.toUTCString() + ";path=/;" + cookie_https + domain;
                }
            } else if (this.cookie(name)) {
                if (!cookies_supported) {
                    this.storage(name, '');
                } else {
                    document.cookie = name + "=" + value + ";expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/;" + cookie_https + domain;
                }
            }
        },

        // Return a front setting or set it
        setting: function (key, value = -1) {
            if (value !== -1) {
                if (typeof CHAT_SETTINGS !== ND) CHAT_SETTINGS[key] = value;
            } else return typeof CHAT_SETTINGS !== ND && key in CHAT_SETTINGS ? CHAT_SETTINGS[key] : false;
        },

        // Return the shortcode array
        shortcode: function (shortcode) {
            return SBRichMessages.shortcode(shortcode);
        },

        // Events and webhooks
        event: function (name, parameters) {
            $(document).trigger(name, parameters);
            let webhooks = admin ? (typeof SB_ADMIN_SETTINGS === ND ? false : SB_ADMIN_SETTINGS.webhooks) : CHAT_SETTINGS.webhooks;
            let webhooks_list = { SBSMSSent: 'sms-sent', SBLoginForm: 'login', SBRegistrationForm: 'registration', SBUserDeleted: 'user-deleted', SBNewMessagesReceived: 'new-messages', SBNewConversationReceived: 'new-conversation', SBSlackMessageSent: 'slack-message-sent', SBMessageDeleted: 'message-deleted', SBRichMessageSubmit: 'rich-message', SBNewEmailAddress: 'new-email-address' };
            if (webhooks && name in webhooks_list) {
                if (webhooks !== true) {
                    if (!Array.isArray(webhooks)) {
                        webhooks = webhooks.replace(/ /g, '').split(',');
                    }
                    if (!webhooks.includes(webhooks_list[name])) {
                        return;
                    }
                }
                SBF.ajax({
                    function: 'webhooks',
                    function_name: name,
                    parameters: parameters
                });
            }
        },

        // Translate a string
        translate: function (string) {
            if ((!admin && SBF.null(CHAT_SETTINGS)) || (admin && typeof SB_TRANSLATIONS === ND)) {
                return string;
            }
            let translations = admin ? SB_TRANSLATIONS : CHAT_SETTINGS.translations;
            if (translations && translations[string]) {
                return translations[string] ? translations[string] : string;
            } else {
                return string;
            }
        },

        // Escape a string
        escape: function (string) {
            return string ? string.replace(/</ig, '&lt;').replace(/javascript:|onclick|onerror|ontoggle|onmouseover|onload|oncontextmenu|ondblclick|onmousedown|onmouseenter|onmouseleave|onmousemove|onmouseout|onmouseup/ig, '') : '';
        },

        // Visibility change function
        visibilityChange: function (visibility = '') {
            this.visibility_status = visibility;
            let is_admin = admin && typeof SBAdmin !== ND;
            if (visibility == 'hidden') {
                if (!admin) {
                    SBChat.stopRealTime();
                }
                SBChat.tab_active = false;
                this.visibility_was_hidden = true;
            } else {
                if (activeUser() && !admin) {
                    SBChat.startRealTime();
                }
                SBChat.tab_active = true;
                clearInterval(interval);
                clearInterval(SBChat.audio_interval);
                if (SBChat.conversation) {
                    SBChat.conversation.updateMessagesStatus();
                    if (SBChat.chat_open || admin) {
                        SBChat.updateNotifications(SBChat.conversation.id);
                    }
                    if (is_admin) {
                        setTimeout(() => {
                            SBAdmin.conversations.notificationsCounterReset(SBChat.conversation.id);
                        }, 2000);
                    }
                }
                if (is_admin && (Date.now() - (mobile ? 60000 : 180000)) > conversation_update_last_check) {
                    SBAdmin.conversations.update();
                    conversation_update_last_check = Date.now();
                }
                document.title = document_title;
                this.serviceWorker.closeNotifications();
            }
        },

        // Convert a settings string to an Array
        settingsStringToArray: function (string) {
            if (this.null(string)) {
                return [];
            }
            let result = [];
            string = string.split(',');
            for (var i = 0; i < string.length; i++) {
                let values = string[i].split(':');
                result[values[0]] = values[1] == 'false' ? false : values[1] == 'true' ? true : values[1];
            }
            return result;
        },

        // Open a browser window
        openWindow: function (link, width = 550, height = 350) {
            let left = (screen.width / 2) - (width / 2);
            let top = (screen.height / 2) - (height / 2);
            window.open(link, 'targetWindow', 'toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=' + width + ',height=' + height + ', top=' + top + ', left=' + left);
            return false;
        },

        // Convert a date to local time
        convertUTCDateToLocalDate: function (datetime, UTCoffset = 0) {
            datetime = new Date(datetime); // Y/m/d H:i:s
            datetime = new Date(datetime.getTime() + UTCoffset * 3600000);
            return new Date(datetime.getTime() + utc_offset * -1);
        },

        // Load a JS or CSS file
        loadResource: function (src, js = false, onLoad = false, content = false) {
            let resource = document.createElement(js ? 'script' : 'link');
            if (src) {
                if (js) resource.src = src; else resource.href = src;
                resource.type = js ? 'text/javascript' : 'text/css';
            } else {
                resource.innerHTML = content;
            }
            if (onLoad) {
                resource.onload = function () {
                    onLoad();
                }
            }
            if (!js) {
                resource.rel = 'stylesheet';
            }
            document.head.appendChild(resource);
        },

        // Debounce
        debounce: function (bounceFunction, id, interval = 500) {
            if (!(id in timeout_debounce)) {
                timeout_debounce[id] = true;
                bounceFunction();
                setTimeout(() => {
                    delete timeout_debounce[id];
                }, interval);
            }
        },

        // Push Notifications
        serviceWorker: {
            sw: false,
            timeout: false,

            init: function () {
                if (navigator.serviceWorker) {
                    navigator.serviceWorker.register(admin || typeof SB_CLOUD_SW != 'undefined' ? SB_URL.replace('/script', '') + '/sw.js?v=' + version : CHAT_SETTINGS.push_notifications_url + '?v=' + version).then((registration) => {
                        registration.update();
                        this.sw = registration;
                    }).catch(function (error) {
                        console.warn(error);
                    });
                }
            },

            initPushNotifications: function () {
                if ((admin && (SB_ADMIN_SETTINGS.push_notifications_provider == 'pusher' || SB_ADMIN_SETTINGS.push_notifications_provider != 'onesignal')) || (!admin && (CHAT_SETTINGS.push_notifications_provider == 'pusher' || CHAT_SETTINGS.push_notifications_provider != 'pushalert'))) { // Deprecated: remove || CHAT_SETTINGS.push_notifications_provider != '' and || SB_ADMIN_SETTINGS.push_notifications_provider != 'pushalert'
                    SBPusher.initPushNotifications();
                } else {
                    $.getScript('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js', () => {
                        window.OneSignalDeferred = window.OneSignalDeferred || [];
                        OneSignalDeferred.push((OneSignal) => {
                            OneSignal.init({
                                appId: SB_ADMIN_SETTINGS.push_notifications_id
                            });
                        });
                        OneSignalDeferred.push((OneSignal) => {
                            OneSignal.User.PushSubscription.addEventListener('change', (event) => {
                                if (event.current.optedIn) {
                                    let external_id = (admin && SB_ADMIN_SETTINGS.cloud ? SB_ADMIN_SETTINGS.cloud.cloud_user_id + '-' : (!admin && CHAT_SETTINGS.cloud ? CHAT_SETTINGS.cloud.cloud_user_id + '-' : '')) + (admin ? SB_ACTIVE_AGENT.id : activeUser().id);
                                    if (external_id == 1) {
                                        external_id = 'SB-1';
                                    }
                                    OneSignal.User.addTag('user_type', admin ? 'agents' : 'users');
                                    OneSignal.login(external_id);
                                }
                                SBF.event('SBPushNotificationSubscription', event.current);
                            });
                        });
                        init_push_notifications = false;
                    });
                }
            },

            closeNotifications: function (index = 0) {
                if (this.sw) {
                    this.sw.getNotifications().then((notifications) => {
                        if (notifications.length) {
                            for (let i = 0; i < notifications.length; i += 1) {
                                notifications[i].close();
                            }
                        } else if (index < 500) {
                            setTimeout(() => {
                                this.closeNotifications(index + 1);
                            }, 10);
                        }
                    });
                }
            },

            pushNotification: function (message, interests = false) {
                let icon = admin ? SB_ACTIVE_AGENT.profile_image : activeUser().image;
                SBF.ajax({
                    function: 'push-notification',
                    title: admin ? SB_ACTIVE_AGENT.full_name : activeUser().name,
                    message: (new SBMessage()).strip(message),
                    icon: icon.indexOf('user.svg') > 0 ? CHAT_SETTINGS.notifications_icon : icon,
                    interests: interests ? interests : SBChat.getRecipientUserID(),
                    conversation_id: SBChat.conversation ? SBChat.conversation.id : false
                }, (response) => {
                    return response
                });
            }
        }
    }

    /*
    * ----------------------------------------------------------
    * PUSHER
    * ----------------------------------------------------------
    */

    var SBPusher = {
        channels: {},
        channels_presence: [],
        active: false,
        pusher: false,
        started: false,
        pusher_beams: false,
        initialized: false,
        online_ids: [],
        beams_loaded: false,

        // Initialize Pusher
        init: function (onSuccess = false) {
            if (SBPusher.active) {
                if (this.pusher) {
                    return onSuccess ? onSuccess() : true;
                } else if (onSuccess) {
                    $(window).one('SBPusherInit', () => {
                        onSuccess();
                    });
                } else {
                    return;
                }
                this.initialized = true;
                if (typeof Pusher === ND) {
                    $.getScript('https://js.pusher.com/7.0/pusher.min.js', () => {
                        this.init_2();
                    }, true);
                } else {
                    this.init_2();
                }
            }
        },

        init_2: function () {
            this.pusher = new Pusher(admin ? SB_ADMIN_SETTINGS.pusher_key : CHAT_SETTINGS.pusher_key, { cluster: admin ? SB_ADMIN_SETTINGS.pusher_cluster : CHAT_SETTINGS.pusher_cluster, authEndpoint: SB_URL + '/include/pusher.php', auth: { params: { login: SBF.loginCookie(), cloud_user_id: CHAT_SETTINGS.cloud ? CHAT_SETTINGS.cloud.cloud_user_id : false } } });
            SBF.event('SBPusherInit');
        },

        // Initialize Push notifications
        initPushNotifications: function () {
            if (activeUser() || admin) {
                if (this.beams_loaded) {
                    this.initPushNotifications_2();
                } else {
                    $.getScript('https://js.pusher.com/beams/2.0.0-beta.0/push-notifications-cdn.js', () => {
                        this.initPushNotifications_2();
                    }, true);
                }
            }
        },

        initPushNotifications_2: function () {
            window.navigator.serviceWorker.ready.then((serviceWorkerRegistration) => {
                this.pusher_beams = new PusherPushNotifications.Client({
                    instanceId: admin ? SB_ADMIN_SETTINGS.push_notifications_id : CHAT_SETTINGS.push_notifications_id,
                    serviceWorkerRegistration: serviceWorkerRegistration,
                });
                SBF.serviceWorker.closeNotifications();
                this.pusher_beams.start().then(() => this.pusher_beams.setDeviceInterests(admin ? [SB_ACTIVE_AGENT.id, 'agents'] : [activeUser().id, 'users'])).catch(console.error);
                init_push_notifications = false;
            });
        },

        // Start Pusher and Push notifications
        start: function () {
            if (!admin && !this.started && activeUser()) {
                if (this.active) {
                    this.init(() => {
                        this.event('client-typing', (response) => {
                            if (response.user_id == SBChat.agent_id && SBChat.conversation && response.conversation_id == SBChat.conversation.id) {
                                SBChat.typing(-1, 'start');
                                clearTimeout(timeout_typing);
                                timeout_typing = setTimeout(() => { SBChat.typing(-1, 'stop') }, 1000);
                            }
                        });
                        this.event('new-message', (response) => {
                            if (response && activeUser() && response.conversation_id && (!activeUser().getConversationByID(response.conversation_id) || !SBChat.conversation || SBChat.conversation.id != response.conversation_id)) {
                                SBChat.updateConversations();
                            } else {
                                SBChat.update();
                            }
                        });
                        this.presence(1, () => {
                            this.started = true;
                            SBChat.automations.runAll();
                        });
                    });
                }
                if (CHAT_SETTINGS.push_notifications_users) {
                    if (CHAT_SETTINGS.push_notifications_provider == 'pusher' || CHAT_SETTINGS.push_notifications_provider != 'onesignal') { // Deprecated: remove || CHAT_SETTINGS.push_notifications != ''
                        if (typeof Notification != ND && Notification.permission == 'granted') {
                            this.initPushNotifications();
                        } else {
                            init_push_notifications = true;
                        }
                    }
                }
            }
        },

        // Subscribe to a channel
        subscribe: function (channel_name, onSuccess = false) {
            if (!this.pusher) {
                return this.init(() => { this.subscribe(channel_name, onSuccess) });
            }
            channel_name = this.cloudChannelRename(channel_name);
            let channel = this.pusher.subscribe(channel_name);
            channel.bind('pusher:subscription_error', (error) => {
                return console.log(error);
            });
            channel.bind('pusher:subscription_succeeded', () => {
                this.channels[channel_name] = channel;
                if (onSuccess) onSuccess();
            })
        },

        // Add event listener for a channel
        event: function (event, callback, channel = 'private-user-' + activeUser().id) {
            if (!this.pusher) {
                return this.init(() => { this.event(event, callback, channel) });
            }
            let channel_original = channel;
            channel = this.cloudChannelRename(channel);
            if (channel in this.channels) {
                this.channels[channel].unbind(event);
                this.channels[channel].bind(event, (data) => {
                    callback(data);
                });
            } else {
                this.subscribe(channel_original, () => { this.event(event, callback, channel_original) });
            }
        },

        // Trigger an event
        trigger: function (event, data = {}, channel = 'private-user-' + activeUser().id) {
            if (event.indexOf('client-') == 0) {
                return this.channels[this.cloudChannelRename(channel)].trigger(event, data);
            } else {
                SBF.ajax({
                    function: 'pusher-trigger',
                    channel: channel,
                    event: event,
                    data: data
                }, (response) => {
                    return response
                });
            }
        },

        // Presence  
        presence: function (index = 1, onSuccess) {
            if (!this.pusher) {
                return this.init(() => { this.presence() });
            }
            let channel = this.pusher.subscribe(this.cloudChannelRename('presence-' + index));
            channel.bind('pusher:subscription_succeeded', (members) => {
                if (members.count > 98) {
                    return this.subscribe(index + 1);
                }
                members.each((member) => {
                    if (this.presenceCheck(member)) {
                        this.online_ids.push(member.id);
                    }
                });
                SBChat.updateUsersActivity();
                if (onSuccess) {
                    onSuccess();
                }
            })
            channel.bind('pusher:subscription_error', (error) => {
                return console.log(error);
            });
            channel.bind('pusher:member_added', (member) => {
                if (this.presenceCheck(member)) {
                    this.presenceAdd(member.id);
                }
                if (admin && SBF.storageTime('online-user-notification-' + member.id, 24)) {
                    SBAdmin.users.onlineUserNotification(member);
                    SBF.storageTime('online-user-notification-' + member.id);
                }
            });
            channel.bind('pusher:member_removed', (member) => {
                this.presenceRemove(member.id);
            });
            this.channels_presence.push(channel);
            if (!admin && CHAT_SETTINGS.slack_active) {
                this.event('add-user-presence', (response) => {
                    this.presenceAdd(response.agent_id)
                });
                SBF.ajax({
                    function: 'slack-presence',
                    list: true
                }, (response) => {
                    for (var i = 0; i < response.length; i++) {
                        this.presenceAdd(response[i]);
                    }
                    SBChat.updateUsersActivity();
                });
            }
        },

        presenceCheck: function (member) {
            let agent = SBF.isAgent(member.info.user_type);
            return ((admin && !agent) || (!admin && agent)) && !this.online_ids.includes(member.id);
        },

        presenceAdd: function (user_id) {
            if (typeof user_id != ND && !this.online_ids.includes(user_id)) {
                this.online_ids.push(user_id);
                this.presenceUpdateAdmin(user_id);
                SBChat.updateUsersActivity();
            }
        },

        presenceRemove: function (user_id) {
            if (typeof user_id == ND) {
                return;
            }
            let index = this.online_ids.indexOf(user_id);
            if (index !== -1) {
                this.online_ids.splice(index, 1);
                this.presenceUpdateAdmin(user_id);
                SBChat.updateUsersActivity();
            } else if (admin) {
                global.find(`.sb-conversation-busy[data-agent="${user_id}"]`).remove();
            }
        },

        presenceUnsubscribe: function () {
            for (var i = 0; i < this.channels_presence.length; i++) {
                this.channels_presence[i].unsubscribe(this.cloudChannelRename('presence-' + (i + 1)));
            }
        },

        presenceUpdateAdmin: function (user_id) {
            if (admin) {
                if (global.find('.sb-area-users.sb-active').length) {
                    SBAdmin.users.update();
                }
                if (activeUser() && activeUser().id == user_id) {
                    SBAdmin.users.updateUsersActivity();
                }
            }
        },

        cloudChannelRename: function (channel) {
            return (CHAT_SETTINGS.cloud || (admin && SB_ADMIN_SETTINGS.cloud)) ? channel + '-' + (admin ? SB_ADMIN_SETTINGS.cloud.cloud_user_id : CHAT_SETTINGS.cloud.cloud_user_id) : channel;
        }
    }

    /*
    * ----------------------------------------------------------
    * GLOBAL FUNCTIONS
    * ----------------------------------------------------------
    */

    window.SBF = SBF;
    window.SBPusher = SBPusher;
    window.sb_current_user = sb_current_user;

    /*
    * ----------------------------------------------------------
    * JQUERY FUNCTIONS
    * ----------------------------------------------------------
    */

    $.fn.sbActive = function (show = -1) {
        if (show === -1) {
            return $(this).hasClass('sb-active');
        }
        $(this).setClass('sb-active', show);
        return this;
    };

    $.fn.sbLoading = function (value = 'check') {
        if (value == 'check') {
            return $(this).hasClass('sb-loading');
        } else {
            $(this).setClass('sb-loading', value);
        }
        return this;
    }

    $.fn.sbTogglePopup = function (button = false) {
        let showed = true;
        if (admin) SBAdmin.open_popup = false;
        if ($(this).sbActive()) {
            $(this).sbActive(false);
            global.removeClass('sb-popup-active');
            showed = false;
        } else {
            global.addClass('sb-popup-active');
            global.find('.sb-popup').sbActive(false);
            if (button) $(this).css('left', $(button).offset().left + 15).sbActive(true);
            if (admin) setTimeout(() => { SBAdmin.open_popup = this }, 500);
            SBF.deselectAll();
        }
        return showed;
    };

    $.fn.sbUploadFiles = function (onSuccess) {
        let files = $(this).prop('files');
        for (var i = 0; i < files.length; i++) {
            let file = files[i];
            let size_mb = file.size / (1024 ** 2);
            let max_size = admin ? SB_ADMIN_SETTINGS.max_file_size : CHAT_SETTINGS.max_file_size;
            if (size_mb > max_size) {
                let message = sb_('Maximum upload size is {R}MB. File size: {R2}MB.').replace('{R}', max_size).replace('{R2}', size_mb.toFixed(2));
                if (admin) {
                    SBAdmin.infoPanel(message, 'info');
                } else {
                    alert(message);
                }
            }
            let form = new FormData();
            form.append('file', file);
            SBF.upload(form, onSuccess);
        }
        $(this).value = '';
    }

    $.fn.setProfile = function (name = false, profile_image = false) {
        if (SBF.null(name)) {
            name = activeUser() ? activeUser().name : '';
        }
        if (SBF.null(profile_image)) {
            profile_image = activeUser() ? activeUser().image : SB_URL + '/media/user.svg';
        }
        if (name) {
            $(this).removeClass('sb-profile-empty');
        }
        $(this).find('img').attr('src', profile_image);
        $(this).find('.sb-name').html(name);
        return this;
    }

    $.fn.setClass = function (class_name, add = true) {
        if (add) {
            $(this).addClass(class_name);
        } else {
            $(this).removeClass(class_name);
        }
        return this;
    }

    /*
    * ----------------------------------------------------------
    * FUNCTIONS
    * ----------------------------------------------------------
    */

    function sbDelta(e) {
        let delta = e.originalEvent.wheelDelta;
        if (typeof delta == ND) {
            delta = e.originalEvent.deltaY;
        }
        if (typeof delta == ND) {
            delta = e.originalEvent.detail * -1;
        }
        return delta;
    }

    function loading(element) {
        if ($(element).sbLoading()) return true;
        else $(element).sbLoading(true);
        return false;
    }

    function storage(key, value = ND) {
        return SBF.storage(key, value);
    }

    function sb_(string) {
        return SBF.translate(string);
    }

    function activeUser(value = -1) {
        if (value === -1) {
            return window.sb_current_user;
        } else {
            window.sb_current_user = value;
        }
    }

    function setAudio() {
        let volume = admin ? SB_ADMIN_SETTINGS.sound.volume : CHAT_SETTINGS.sound.volume;
        if (SBChat.audio && volume) {
            SBChat.audio.volume = volume;
        }
    }

    function getMinutesSeconds(seconds) {
        let minutes = Math.floor(seconds / 60);
        seconds = seconds - minutes * 60;
        return (minutes ? minutes : '0') + ':' + (seconds < 10 ? '0' + seconds : seconds);
    }

    /* 
    * ----------------------------------------------------------
    * USER
    * ----------------------------------------------------------
    */

    class SBUser {
        constructor(details = {}, extra = {}) {
            this.details = details;
            this.extra = extra;
            this.conversations = [];
            this.processArray(details);
        }

        get id() {
            return this.get('id') ? this.get('id') : this.get('user_id');
        }

        get type() {
            return this.get('user_type');
        }

        get email() {
            return this.get('email');
        }

        get name() {
            return this.details.first_name ? this.details.first_name + (this.details.last_name ? ' ' + this.details.last_name : '') : '';
        }

        get nameBeautified() {
            let default_name = admin ? SB_ADMIN_SETTINGS.visitor_default_name : CHAT_SETTINGS.visitor_default_name;
            return !default_name || (this.details.last_name && this.details.last_name.charAt(0) != '#') ? this.name : default_name;
        }

        get image() {
            return this.get('profile_image');
        }

        get language() {
            let language = this.getExtra('language');
            if (!language) {
                language = this.getExtra('browser_language');
            }
            return language ? language.value.toLowerCase() : '';
        }

        get(id) {
            if (id in this.details && !SBF.null(this.details[id])) {
                return this.details[id];
            }
            return '';
        }

        getExtra(id) {
            if (id in this.extra && !SBF.null(this.extra[id])) {
                return this.extra[id];
            }
            return '';
        }

        set(id, value) {
            this.details[id] = value;
        }

        setExtra(id, value) {
            this.extra[id] = value;
        }

        // Initialization
        processArray(details) {
            if (details && details.details) {
                for (var i = 0; i < details.details.length; i++) {
                    this.setExtra(details.details[i].slug, details.details[i]);
                }
                delete details.details;
                this.details = details;
            }
        }

        // Update the user details and extra details
        update(onSuccess) {
            if (this.id) {
                SBF.ajax({
                    function: 'get-user',
                    user_id: this.id,
                    extra: true
                }, (response) => {
                    this.processArray(response);
                    onSuccess();
                });
            } else {
                SBF.error('Missing user ID', 'SBUser.update');
            }
        }

        // Get user conversations
        getConversations(onSuccess = false, exclude_id) {
            if (this.id) {
                SBF.ajax({
                    function: 'get-user-conversations',
                    user_id: this.id,
                    exclude_id: exclude_id,
                    agent: SBF.isAgent(this.type)
                }, (response) => {
                    if (!SBF.errorValidation(response)) {
                        let conversations = [];
                        for (var i = 0; i < response.length; i++) {
                            if (SBChat.isConversationAllowed(response[i].source, response[i].conversation_status_code)) {
                                conversations.push(new SBConversation([new SBMessage(response[i])], response[i]));
                            }
                        }
                        this.conversations = conversations;
                        if (onSuccess) {
                            onSuccess(conversations);
                        }
                    }
                });
            } else {
                SBF.error('Missing user ID', 'SBUser.getConversations');
            }
        }

        // Get conversations code
        getConversationsCode(conversations = false) {
            let code = '';
            let active_conversation_id = SBChat.conversation ? SBChat.conversation.id : -1;
            if (!conversations) {
                conversations = this.conversations;
            }
            for (var i = 0; i < conversations.length; i++) {
                if (conversations[i] instanceof SBConversation) {
                    if (!admin && !SBChat.isConversationAllowed(conversations[i].get('source'), conversations[i].status_code)) {
                        continue;
                    }
                    let red_notifications = 0;
                    let is_active_conversation = active_conversation_id == conversations[i].id;
                    if (!admin && !is_active_conversation) {
                        for (var j = 0; j < SBChat.notifications.length; j++) {
                            if (SBChat.notifications[j][0] == conversations[i].id) {
                                red_notifications++;
                            }
                        }
                    }
                    code += `<li ${is_active_conversation ? 'class="sb-active" ' : ''}data-conversation-status="${is_active_conversation ? 0 : conversations[i].status_code}" data-conversation-id="${conversations[i].id}" data-department="${conversations[i].get('department')}">${conversations[i].getCode()}${red_notifications ? '<span data-count="' + red_notifications + '">' + red_notifications + '</span>' : ''}</li>`;
                } else {
                    SBF.error('Conversation not of type SBConversation', 'SBUser.getConversationsCode');
                }
            }
            return code;
        }

        // Get single conversation
        getFullConversation(conversation_id = false, onSuccess = false) {
            if (conversation_id !== false) {
                SBF.ajax({
                    function: 'get-conversation',
                    conversation_id: conversation_id
                }, (response) => {
                    let messages = [];
                    if (response) {
                        if (response === 'agent-not-authorized') {
                            window.location.href = SBF.URL();
                            return;
                        }
                        for (var i = 0; i < response.messages.length; i++) {
                            messages.push(new SBMessage(response.messages[i]));
                        }
                    }
                    if (onSuccess) {
                        onSuccess(new SBConversation(messages, response ? response.details : false));
                    }
                });
            } else {
                SBF.error('Missing conversation ID', 'SBUser.getFullConversation');
            }
        }

        getConversationByID(conversation_id, index = false) {
            for (var i = 0; i < this.conversations.length; i++) {
                if (this.conversations[i].id == conversation_id) {
                    return index ? i : this.conversations[i];
                }
            }
            return false;
        }

        // Add a new conversation
        addConversation(conversation) {
            if (conversation instanceof SBConversation) {
                let conversation_id = conversation.id;
                let is_new = true;
                for (var i = 0; i < this.conversations.length; i++) {
                    if (this.conversations[i].id == conversation_id) {
                        this.conversations[i] = conversation;
                        is_new = false;
                        break;
                    }
                }
                if (is_new) {
                    this.conversations.unshift(conversation);
                }
                return is_new;
            } else {
                SBF.error('Conversation not of type SBConversation', 'SBUser.addConversation');
            }
        }

        // Remove a conversation
        removeConversation(conversation_id) {
            let index = this.getConversationByID(conversation_id, true);
            if (index !== false) {
                this.conversations.splice(index, 1);
            }
        }

        // Get the last conversation
        getLastConversation() {
            return this.isConversationsEmpty() ? false : this.conversations[this.conversations.length - 1];
        }

        // Check if the conversation array is empty
        isConversationsEmpty() {
            return this.conversations.length == 0;
        }

        // Check if the extra array is empty
        isExtraEmpty() {
            return Object.keys(this.extra).length === 0 && this.extra.constructor === Object;
        }

        // Delete the user
        delete(onSuccess) {
            if (this.id) {
                SBF.ajax({
                    function: 'delete-user',
                    user_id: this.id
                }, () => {
                    SBF.event('SBUserDeleted', this.id);
                    onSuccess();
                    return true;
                });
            } else {
                SBF.error('Missing user ID', 'SBUser.delete');
            }
        }
    }
    window.SBUser = SBUser;

    /* 
    * ----------------------------------------------------------
    * MESSAGE
    * ----------------------------------------------------------
    */

    class SBMessage {
        constructor(details = {}) {
            this.details = Object.assign({}, details);
            let keys = ['message_status_code', 'message_id', 'message_profile_image', 'message_first_name', 'message_last_name', 'message_user_id', 'message_user_type'];
            let keys_delete = ['source', 'extra', 'title', 'tags', 'agent_id', 'department', 'last_update_time', 'conversation_creation_time', 'conversation_id', 'conversation_status_code', 'conversation_user_id'];
            for (var i = 0; i < keys.length; i++) {
                if (details[keys[i]]) {
                    this.details[keys[i].replace('message_', '')] = details[keys[i]];
                }
                delete this.details[keys[i]];
            }
            if (this.details.first_name) {
                this.details.full_name = this.details.first_name + (this.details.last_name ? ' ' + this.details.last_name : '');
            }
            if (details.last_update_time) {
                this.details.creation_time = details.last_update_time;
            }
            for (var i = 0; i < keys_delete.length; i++) {
                delete this.details[keys_delete[i]];
            }
            let payload = this.get('payload');
            if (payload) {
                try {
                    var json = JSON.parse(this.get('payload').replace("\\'", "'"));
                    if (json && typeof json === 'object') {
                        payload = json;
                    } else {
                        payload = {};
                    }
                } catch (e) {
                    payload = {};
                }
            } else {
                payload = {};
            }
            this.set('payload', payload);
        }

        get id() {
            return this.get('id');
        }

        get attachments() {
            return !SBF.null(this.details.attachments) ? JSON.parse(this.details.attachments) : [];
        }

        get message() {
            return this.get('message');
        }

        get(id) {
            if (id in this.details && !SBF.null(this.details[id])) return this.details[id];
            else return '';
        }

        set(id, value) {
            this.details[id] = value;
        }

        payload(key = false, value = false) {
            let payload = this.get('payload');
            if (key !== false && value !== false) {
                payload[key] = value;
                this.set('payload', payload);
            } else if (key !== false) {
                return key in payload ? payload[key] : (payload.id && payload.id == key ? payload : false);
            }
            return payload;
        }

        getCode(translation = false) {
            let agent = SBF.isAgent(this.details.user_type);
            let message = translation ? this.get('translation') : (this.message ? this.message : '');
            let admin_menu = admin ? SBAdmin.conversations.messageMenu(agent, message) : '';
            let attachments = this.attachments;
            let attachments_code = '';
            let media_code = '';
            let thumb = (admin && SB_ADMIN_SETTINGS.show_profile_images) || (!admin && ((agent && !CHAT_SETTINGS.hide_agents_thumb) || (!agent && CHAT_SETTINGS.display_users_thumb))) ? `<div class="sb-thumb"><img loading="lazy" src="${this.details['profile_image']}"><div class="sb-tooltip"><div>${this.details['full_name']}</div></div></div>` : '';
            let css = ((admin && agent) || (!admin && !agent) ? 'sb-right' : '') + (thumb ? ' sb-thumb-active' : '');
            let type = '';
            let name = (!admin && agent && CHAT_SETTINGS.sender_name) || (admin && SB_ADMIN_SETTINGS.sender_name == 'chat-admin') ? `<span class="sb-agent-name">${this.get('full_name')}</span>` : '';
            let delivery_failed = admin ? this.payload().delivery_failed : false;
            if (!message && !attachments.length) {
                return '';
            }

            // Rich Messages
            if (agent) {
                message = message.replace(/\n/g, '<br>');
                let shortcodes = message.match(/\[.+?\]/g) || [];
                let rich = false;
                let count = shortcodes.length;
                for (var i = 0; i < count; i++) {
                    let settings = SBRichMessages.shortcode(shortcodes[i]);
                    if (settings[0]) {
                        let rich_message = SBRichMessages.generate(settings[1], settings[0]);
                        if (rich_message) {
                            if (message.charAt(0) != '[') {
                                rich_message = rich_message.replace('sb-rich-message', 'sb-rich-message sb-margin-top');
                            }
                            if (message.charAt(message.length - 1) != ']') {
                                rich_message = rich_message.replace('sb-rich-message', 'sb-rich-message sb-margin-bottom');
                            }
                            message = message.replace(shortcodes[i], '{{RM}}');
                            message = this.render(message).replace('{{RM}}', rich_message);
                            rich = true;
                            type = `data-type="${settings[0]}"`;
                        }
                    }
                }
                if (rich) {
                    css += ' sb-rich-cnt';
                    if (count > 1) {
                        type = 'data-type="multiple"';
                    }
                }
                if (!count) {
                    message = this.render(message);
                }
            } else {
                message = this.render(message);
            }

            // Attachments
            if (attachments.length) {
                attachments_code = '<div class="sb-message-attachments">';
                for (var i = 0; i < attachments.length; i++) {
                    let url = attachments[i][1];
                    let url_and_name = url + attachments[i][0];
                    if (/.jpg|.jpeg|.png|.gif|.webp/.test(url_and_name)) {
                        let size = '';
                        if (attachments[i].length > 2) {
                            size = attachments[i][2].split('|');
                            size = `width="${size[0]}" style="aspect-ratio: ${size[0]} / ${size[1]}"`;
                        }
                        media_code += `<div class="sb-image${url_and_name.includes('.png') ? ' sb-image-png' : (url.includes('sticker_') ? ' sb-image-sticker' : '')}"><img loading="lazy" src="${url}" ${size}/></div>`;
                    } else if (/.mp3|.ogg|.wav/.test(url_and_name) || url.includes('voice_message')) {
                        if ((admin && !SB_ADMIN_SETTINGS.speech_recognition) || (!admin && !CHAT_SETTINGS.speech_recognition)) {
                            message = '';
                        }
                        attachments_code += `<div class="sb-player"><div class="sb-player-btn sb-icon-play"></div><div class="sb-player-speed"><div class="sb-player-speed-number">1</div><div class="sb-icon-close"></div></div><div class="sb-player-download sb-icon-arrow-down"></div><audio><source src="${url}" type="audio/mpeg"></audio></div>`;
                    } else {
                        attachments_code += `<a rel="noopener" target="_blank" href="${url}">${attachments[i][0]}</a>`;
                    }
                }
                attachments_code += '</div>';
            }

            // Message creation
            return `<div data-id="${this.details.id}" class="${css}" ${type}>${thumb}<div class="sb-cnt"><div class="sb-message${media_code && !message ? ' sb-message-media' : ''}"${delivery_failed ? ' style="opacity:.7"' : ''}>${delivery_failed ? SBAdmin.conversations.getDeliveryFailedMessage(delivery_failed) : ''}${(name + message + media_code).trim()}</div>${attachments_code}<div class="sb-time">${SBF.beautifyTime(this.details.creation_time, true)}${admin && agent && this.details.status_code == 2 ? '<i class="sb-icon-check"></i>' : ''}</div></div>${admin_menu}</div>`;
        }

        render(message = false) {
            if (message === false) {
                message = '' + this.details.message;
            }
            let len = message.length;

            // Code block
            let codes = message.match(/```[\s\S]*```/) || [];
            for (var i = 0; i < codes.length; i++) {
                message = message.replace(codes[i], '[code-' + i + ']');
            }

            // Breakline
            message = message.replace(/(?:\r\n|\r|\n)/g, '<br>');

            // Bold
            message = message.replace(/\*([^\**]+)\*/g, "<b>$1</b>");

            // Italic
            message = message.replace(/\__([^\____]+)\__/g, "<i>$1</i>");

            // Strikethrough
            message = message.replace(/\~([^\~~]+)\~/g, "<del>$1</del>");

            // Code
            message = message.replace(/\`([^\``]+)\`/g, "<code>$1</code>");

            // Single emoji
            if (((len == 6 || len == 5) && message.startsWith('&#x')) || len < 3 && message.match(/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/)) {
                message = `<span class="emoji-large">${message}</span>`;
            }

            // Links
            if (message.includes('](http')) {
                let temp = message.split('[');
                message = '';
                for (var i = 0; i < temp.length; i++) {
                    if (temp[i].includes('](http')) {
                        temp[i] = temp[i].substring(temp[i].indexOf('](') + 2, temp[i].length - 1);
                    }
                    message += temp[i];
                }
            }
            if (message.includes('www.')) {
                message = message.replaceAll('www.', 'https://www.').replaceAll('https://https:', 'https:').replaceAll('http://https:', 'http:');
            }
            if (message.includes('http')) {
                message = message.autoLink({ target: '_blank' });
            }

            // Code block restore
            for (var i = 0; i < codes.length; i++) {
                message = message.replace('[code-' + i + ']', '<pre>' + $.trim($.trim(codes[i]).substr(3, codes[i].length - 6).replace(/(?:\r\n|\r|\n)/g, '<br>')) + '</pre>');
            }

            return message.replace(/&amp;lt;/g, '&lt;');
        }

        strip(message = false) {
            if (message === false) {
                message = '' + this.details.message;
            }
            let replaces = [message.match(/\*([^\**]+)\*/g), message.match(/\__([^\____]+)\__/g), message.match(/\~([^\~~]+)\~/g), message.match(/\`([^\``]+)\`/g)];
            let chars = ['*', '__', '~', '`'];
            for (var i = 0; i < replaces.length; i++) {
                let items = replaces[i];
                if (!SBF.null(items)) {
                    for (var y = 0; y < items.length; y++) {
                        message = message.replace(items[y], items[y].replaceAll(chars[i], ''));
                    }
                }
            }
            return message;
        }
    }
    window.SBMessage = SBMessage;

    /* 
    * ----------------------------------------------------------
    * CONVERSATION
    * ----------------------------------------------------------
    */

    class SBConversation {
        constructor(messages, details) {
            this.details = SBF.null(details) ? {} : details;
            if (Array.isArray(messages)) {
                this.messages = [];
                if (messages.length) {
                    if (messages[0] instanceof SBMessage) {
                        this.messages = messages;
                    } else {
                        SBF.error('Messages not of type SBMessage', 'SBConversation.constructor');
                    }
                }
            } else {
                SBF.error('Message array not of type Array', 'SBConversation.constructor');
            }
            let keys = ['conversation_id', 'conversation_user_id', 'conversation_first_name', 'conversation_last_name', 'conversation_profile_image', 'conversation_user_type', 'conversation_creation_time', 'conversation_status_code'];
            for (var i = 0; i < keys.length; i++) {
                if (details[keys[i]]) {
                    this.details[keys[i].replace('conversation_', '')] = details[keys[i]];
                }
                delete this.details[keys[i]];
            }
            if (details) {
                this.details.tags = 'tags' in details ? (typeof details.tags === 'string' ? details.tags.split(',') : details.tags) : [];
            }
        }

        get id() {
            return this.get('id');
        }

        get status_code() {
            return this.get('status_code');
        }

        get(id) {
            if (id in this.details && !SBF.null(this.details[id])) {
                return this.details[id];
            }
            if (id == 'title') {
                if (this.details.title) {
                    return this.details.title;
                } else if (this.details.first_name) {
                    return this.details.first_name + ' ' + this.details.last_name;
                } else if (this.messages.length) {
                    return this.messages[0].get('full_name');
                }
            }
            return '';
        }

        set(id, value) {
            this.details[id] = value;
        }

        getMessage(id) {
            for (var i = 0; i < this.messages.length; i++) {
                if (this.messages[i].id == id) {
                    this.messages[i].set('index', i);
                    return this.messages[i];
                }
            }
            return false;
        }

        getLastMessage() {
            let index = this.messages.length - 1;
            for (var i = index; i > -1; i--) {
                if (this.messages[i].message || this.messages[i].attachments.length) {
                    return this.messages[i];
                }
            }
            return false;
        }

        getLastUserMessage(index = false, agent = false) {
            if (index === false) {
                index = this.messages.length - 1;
            }
            for (var i = index; i > -1; i--) {
                let message = this.messages[i];
                let user_type = message.get('user_type');
                if ((message.message || message.attachments.length) && ((!agent && !SBF.isAgent(user_type)) || (agent === true && (user_type == 'agent' || user_type == 'admin')) || (agent == 'bot' && user_type == 'bot') || (agent == 'no-bot' && user_type != 'bot') || (agent == 'all' && SBF.isAgent(user_type)))) {
                    this.messages[i].set('index', i - 1);
                    return this.messages[i];
                }
            }
            return false;
        }

        getNextMessage(message_id, user_type = false) {
            let count = this.messages.length;
            for (var i = 0; i < count; i++) {
                if (this.messages[i].id == message_id && i < (count - 1)) {
                    for (var j = i + 1; j < count; j++) {
                        let message = this.messages[j];
                        let message_user_type = message.get('user_type');
                        let next_message = this.messages[i + 1];
                        if (!user_type || (user_type == 'agent' && SBF.isAgent(message_user_type)) || (user_type == 'user' && !SBF.isAgent(message_user_type))) {
                            return next_message;
                        }
                    }
                    break;
                }
            }
            return false;
        }

        getUserMessages(user_type = 'user') {
            let results = [];
            let checks = user_type == 'user' ? ['visitor', 'lead', 'user'] : (user_type == 'agents' ? ['agent', 'admin'] : ['bot']);
            for (var i = 0; i < this.messages.length; i++) {
                if (checks.includes(this.messages[i].get('user_type'))) {
                    this.messages[i].set('index', i);
                    results.push(this.messages[i]);
                }
            }
            return results;
        }

        updateMessage(id, message) {
            if (message instanceof SBMessage) {
                for (var i = 0; i < this.messages.length; i++) {
                    if (this.messages[i].id == id) {
                        this.messages[i] = message;
                        return true;
                    }
                }
            } else {
                SBF.error('Message not of type SBMessage', 'SBConversation.updateMessage');
            }
            return false;
        }

        addMessages(messages) {
            if (Array.isArray(messages)) {
                for (var i = 0; i < messages.length; i++) {
                    if (messages[i] instanceof SBMessage) {
                        this.messages.push(messages[i]);
                    }
                }
            } else {
                if (messages instanceof SBMessage) {
                    this.messages.push(messages);
                } else {
                    SBF.error('Messages not of type SBMessage', 'SBConversation.addMessages()');
                }
            }
            return this;
        }

        getCode(text_only = false) {
            let message = this.getLastMessage();
            if (message) {
                let text = message.message;
                if (admin) {
                    let payload = message.payload();
                    let is_agent = SBF.isAgent(message.get('user_type'));
                    text = payload.preview ? payload.preview : (!is_agent && payload.translation && payload['translation-language'] == SB_ADMIN_SETTINGS.active_agent_language ? payload.translation : (is_agent && payload['original-message'] && payload['original-message-language'] == SB_ADMIN_SETTINGS.active_agent_language ? payload['original-message'] : text));
                }
                if (text.indexOf('[') !== false) {
                    let shortcodes = text.match(/\[.+?\]/g) || [];
                    if (shortcodes.length) {
                        let shortcode = SBRichMessages.shortcode(shortcodes[0]);
                        if (shortcode[0]) {
                            text = text.replace(shortcodes[0], sb_(SBF.null(shortcode[1].message) ? (SBF.null(shortcode[1].title) ? (SBF.null(shortcode[1].name) ? (SBF.null(shortcode[1].link) ? sb_(SBF.slugToString(shortcode[0])) : shortcode[1].link) : shortcode[1].name) : shortcode[1].title) : shortcode[1].message));
                        }
                    }
                }
                if (!text && message.attachments.length) {
                    for (var i = 0; i < message.attachments.length; i++) {
                        text += message.attachments[i][0] + ' ';
                    }
                }
                text = (new SBMessage()).strip(text.length > 114 ? text.substr(0, 114) + ' ...' : text);
                if (text_only) {
                    return text;
                }
                let title = this.get('title');
                if (!title || (activeUser() && activeUser().name == title) || (tickets && CHAT_SETTINGS.tickets_conversations_title_user)) {
                    title = activeUser() && message.get('user_id') == activeUser().id ? sb_('You') : message.get('full_name');
                }
                return `<div class="sb-conversation-item" data-user-id="${this.get('user_id')}"><img loading="lazy" src="${message.get('profile_image')}"><div><span class="sb-name">${title}</span><span class="sb-time">${SBF.beautifyTime(message.get('creation_time'))}</span></div><div class="sb-message">${text}</div></div>`;
            }
            return '';
        }

        deleteMessage(id) {
            for (var i = 0; i < this.messages.length; i++) {
                if (this.messages[i].id == id) {
                    this.messages.splice(i, 1);
                    return true;
                }
            }
            return false;
        }

        searchMessages(search, exact_match = false) {
            let results = [];
            for (var i = 0; i < this.messages.length; i++) {
                let message = this.messages[i].message;
                if ((exact_match && message == search) || (!exact_match && message.includes(search))) {
                    this.messages[i].set('index', i);
                    results.push(this.messages[i]);
                }
            }
            return results;
        }

        getAttachments() {
            let list = [];
            for (var i = 0; i < this.messages.length; i++) {
                let attachments = this.messages[i].attachments;
                for (var j = 0; j < attachments.length; j++) {
                    let link = attachments[j][1];
                    list.push([attachments[j][0], link, link.substr(link.lastIndexOf('.') + 1), this.messages[i].id]);
                }
            }
            return list;
        }

        updateMessagesStatus(ids = false) {
            if (ids) {
                for (var i = 0; i < this.messages.length; i++) {
                    let id = this.messages[i].id;
                    if (ids.includes(id)) {
                        let div = chat.find(`[data-id="${id}"] .sb-time`);
                        if (!div.find('i').length) div.append('<i class="sb-icon-check"></i>');
                    }
                }
            } else if (!admin && SBF.visibility_status == 'visible') {
                ids = [];
                for (var i = 0; i < this.messages.length; i++) {
                    let message = this.messages[i];
                    if (SBF.isAgent(message.get('user_type')) && message.status_code != 2) {
                        ids.push(message.id);
                        message.set('status_code', 2);
                    }
                }
                if (ids.length) SBF.ajax({ function: 'update-messages-status', message_ids: ids });
            }
        }
    }
    window.SBConversation = SBConversation;

    /* 
    * ----------------------------------------------------------
    * CHAT
    * ----------------------------------------------------------
    */

    var SBChat = {
        rich_messages_list: ['chips', 'buttons', 'select', 'inputs', 'table', 'list'],
        emoji_options: { range: 0, range_limit: 47, list: [], list_now: [], touch: false },
        initialized: false,
        editor_listening: false,
        conversation: false,
        is_busy: false,
        is_busy_update: false,
        is_busy_populate: false,
        chat_open: false,
        real_time: false,
        agent_id: -1,
        agent_online: false,
        user_online: false,
        expanded: false,
        main_header: true,
        start_header: false,
        desktop_notifications: false,
        flash_notifications: false,
        id_last_message: 0,
        id_last_message_conversation: 0,
        datetime_last_message_conversation: '2000-01-01 00:00:00',
        audio: false,
        audio_interval: false,
        tab_active: true,
        notifications: storage('notifications') ? storage('notifications') : [],
        typing_settings: { typing: false, sent: false, timeout: false },
        email_sent: false,
        dashboard: false,
        articles: false,
        articles_allowed_ids: false,
        articles_category: false,
        slack_channel: [-1, -1],
        skip: false,
        queue_interval: false,
        departments: false,
        default_department: null,
        default_agent: null,
        default_tags: null,
        offline_message_set: false,

        // Send a message
        sendMessage: function (user_id = -1, message = '', attachments = [], onSuccess = false, payload = false, conversation_status_code = false) {
            let is_dialogflow_human_takeover = dialogflow_human_takeover && SBApps.dialogflow.active();
            let is_return = false;
            let conversation = this.conversation;

            // Check settings and contents
            if (!activeUser() && !admin) {
                this.addUserAndLogin(() => {
                    return this.sendMessage(user_id, message, attachments, onSuccess, payload);
                }, true);
                return;
            }
            if (!conversation) {
                let last_conversation = admin ? false : activeUser().getLastConversation();
                if (last_conversation && force_action != 'new-conversation' && (!SBChat.default_department || SBChat.default_department == last_conversation.get('department')) && (!SBChat.default_agent || SBChat.default_agent == last_conversation.get('agent_id'))) {
                    this.openConversation(last_conversation.id);
                    this.setConversation(last_conversation);
                    force_action = false;
                } else {
                    this.newConversation(conversation_status_code, user_id, '', [], (admin && SB_ACTIVE_AGENT.department ? SB_ACTIVE_AGENT.department : null), null, () => {
                        return this.sendMessage(user_id, message, attachments, onSuccess, payload);
                    });
                    return;
                }
            }
            this.calculateLabelDateFirst();
            if (user_id == -1) {
                user_id = admin ? SB_ACTIVE_AGENT.id : activeUser().id;
            }
            let is_user = user_id != bot_id;
            if (!message && !attachments.length) {
                message = chat_textarea.val().trim();
                chat_editor.find('.sb-attachments > div').each(function () {
                    let attachment = [$(this).attr('data-name'), $(this).attr('data-value')];
                    if ($(this).attr('data-size')) {
                        attachment.push($(this).attr('data-size'));
                    }
                    attachments.push(attachment);
                });
                if (admin && SBAdmin.must_translate && message) {
                    SBApps.dialogflow.translate([message], activeUser().language, (response) => {
                        if (response.length) {
                            let language = admin ? SB_ADMIN_SETTINGS.active_agent_language : activeUser().language;
                            if (payload) {
                                payload['original-message'] = message;
                                payload['original-message-language'] = language;
                            } else {
                                payload = { 'original-message': message, 'original-message-language': language };
                            }
                            if (response[0]) {
                                message = response[0];
                            }
                        }
                        this.sendMessage(user_id, message, attachments, onSuccess, payload, conversation_status_code);
                    });
                    is_return = true;
                }
            }
            this.busy(true);
            if (is_user) {
                chat_textarea.val('').css('height', '');
                chat_editor.find('.sb-attachments').html('');
            }
            chat_editor.sbActive(false);
            if (is_return) {
                return;
            }
            if (conversation_status_code === false && user_id == bot_id) {
                conversation_status_code = 'skip';
            }
            if (!admin && is_user && !is_dialogflow_human_takeover) {
                conversation_status_code = 2;
            }

            // Send message
            if (message || attachments.length || payload) {
                let message_response = { user_id: user_id, user: activeUser(), conversation_id: conversation.id, conversation: conversation, conversation_status_code: conversation_status_code, attachments: attachments };
                SBF.ajax({
                    function: 'send-message',
                    user_id: user_id,
                    conversation_id: conversation.id,
                    message: message,
                    attachments: attachments,
                    conversation_status_code: conversation_status_code,
                    queue: !admin && CHAT_SETTINGS.queue && is_user,
                    payload: payload,
                    recipient_id: admin ? activeUser().id : false
                }, (response) => {
                    let send_slack = admin || !is_dialogflow_human_takeover || response.human_takeover_active

                    // Update the dashboard conversations area
                    if (!admin && user_id == bot_id) {
                        if (this.dashboard) {
                            this.updateConversations();
                        } else if (!this.chat_open) {
                            this.updateNotifications(conversation.id, response.id);
                        }
                    }

                    // Update the chat current conversation
                    if ((admin && !this.user_online) || (!admin && !this.agent_online)) {
                        this.update();
                    }

                    // Follow up and offline messages
                    if (!admin && is_user && !dialogflow_human_takeover) {
                        this.followUp();
                        this.offlineMessage();
                    }

                    // Dialogflow
                    if (!admin && is_user && (!payload || (payload.id != 'sb-human-takeover' && SBF.null(payload['skip-dialogflow'])))) {
                        SBApps.dialogflow.message(message, attachments);
                    }

                    // Slack and visitor to lead
                    if (!admin && is_user && activeUser().type == 'visitor') {
                        SBF.ajax({ function: 'update-user-to-lead', user_id: user_id }, () => {
                            activeUser().set('user_type', 'lead');
                            if (CHAT_SETTINGS.slack_active && send_slack) {
                                this.slackMessage(user_id, activeUser().name, activeUser().image, message, attachments);
                            }
                        });
                    } else if (send_slack && !this.skip) {
                        if (admin && SB_ADMIN_SETTINGS.slack_active) {
                            this.slackMessage(activeUser().id, SB_ACTIVE_AGENT.full_name, SB_ACTIVE_AGENT.profile_image, message, attachments);
                        } else if (CHAT_SETTINGS.slack_active) {
                            this.slackMessage(activeUser().id, (is_user ? activeUser().name : CHAT_SETTINGS.bot_name), (is_user ? activeUser().image : CHAT_SETTINGS.bot_image), message, attachments);
                        }
                    }

                    // Language detection
                    if (is_user && CHAT_SETTINGS.language_detection && conversation && message.split(' ').length > 1 && !SBF.storage('language-detection-completed')) {
                        SBF.ajax({ function: 'google-language-detection-update-user', user_id: user_id, string: message, token: SBApps.dialogflow.token }, (response) => {
                            if (response) {
                                CHAT_SETTINGS.translations = response;
                            }
                        });
                        SBF.storage('language-detection-completed', true);
                    }

                    // Articles
                    if (this.articles && !admin && CHAT_SETTINGS.articles && !CHAT_SETTINGS.office_hours && !this.isInitDashboard()) {
                        setTimeout(() => {
                            if (this.conversation && conversation.id == this.conversation.id) {
                                this.sendMessage(bot_id, '[articles]');
                                this.scrollBottom();
                                this.articles = false;
                            }
                        }, 5000);
                    }

                    // Queue
                    if (response.queue) {
                        this.queue(this.conversation.id);
                    }

                    // Events
                    message_response.message = response.message;
                    message_response.message_id = response.id;
                    SBF.event('SBMessageSent', message_response);
                    if (tickets) {
                        SBTickets.onMessageSent();
                    }
                    if (onSuccess) {
                        onSuccess(message_response);
                    }
                    if (response.notifications.length) {
                        SBF.event('SBNotificationsSent', response.notifications);
                    }

                    // Miscellaneous
                    if (this.skip) {
                        this.skip = false;
                    }
                    this.busy(false);
                });

                // Display the message as sending in progress
                if (is_user) {
                    message = SBF.escape(message);
                    chat.append((new SBMessage({ id: 'sending', profile_image: (admin ? SB_ACTIVE_AGENT.profile_image : activeUser().image), full_name: admin ? SB_ACTIVE_AGENT.full_name : activeUser().name, creation_time: '0000-00-00 00:00:00', message: message.replaceAll('<', '&lt;'), user_type: (admin ? 'agent' : 'user') })).getCode().replace('<div class="sb-time"></div>', `<div class="sb-time">${sb_('Sending')}<i></i></div>`));
                }
                if (!this.dashboard && (is_user || this.isBottom())) {
                    this.scrollBottom();
                }
            } else {
                this.busy(false);
            }
        },

        // Update message
        updateMessage: function (message_id, message = '') {
            SBF.ajax({
                function: 'update-message',
                message_id: message_id,
                message: message
            });
        },

        // Email notifications
        sendEmail: function (message, attachments, send_to_active_user = false, onSuccess = false) {
            let recipient_id = send_to_active_user ? (send_to_active_user === true ? activeUser().id : send_to_active_user) : this.getRecipientUserID();
            if (!admin && !isNaN(recipient_id) && this.agent_online) {
                return false;
            }
            SBF.ajax({
                function: 'create-email',
                recipient_id: recipient_id,
                sender_name: admin ? (send_to_active_user ? SB_ACTIVE_AGENT.full_name : activeUser().name) : (send_to_active_user ? CHAT_SETTINGS.bot_name : activeUser().name),
                sender_profile_image: admin ? (send_to_active_user ? SB_ACTIVE_AGENT.profile_image : activeUser().name) : (send_to_active_user ? CHAT_SETTINGS.bot_image : activeUser().image),
                message: message,
                attachments: attachments,
                department: this.conversation ? this.conversation.get('department') : false,
                conversation_id: this.conversation ? this.conversation.id : false
            }, (response) => {
                if (onSuccess) onSuccess(response);
            });
        },

        // SMS notifications
        sendSMS: function (message) {
            let recipient_id = this.getRecipientUserID();
            if (!admin && !isNaN(recipient_id) && this.agent_online) return false;
            SBF.ajax({
                function: 'send-sms',
                to: recipient_id,
                message: message,
                conversation_id: this.conversation ? this.conversation.id : false
            }, (response) => {
                if (response.status == 'sent' || response.status == 'queued') {
                    SBF.event('SBSMSSent', { recipient_id: this.getRecipientUserID(), message: message, response: response });
                } else if (response.message) {
                    SBF.error(response.message, 'SBChat.sendSMS');
                }
            });
        },

        // Desktop notifications
        desktopNotification: function (title, message, icon, conversation_id = false, user_id = false) {
            if (Notification.permission !== 'granted') {
                Notification.requestPermission();
            } else {
                let notify = SBF.serviceWorker.sw.showNotification(title, {
                    body: (new SBMessage()).strip(message),
                    icon: icon.indexOf('user.svg') > 0 ? CHAT_SETTINGS.notifications_icon : icon
                });
                notify.onclick = () => {
                    if (admin) {
                        if (conversation_id) {
                            SBAdmin.conversations.openConversation(conversation_id, user_id == false ? activeUser().id : user_id);
                            SBAdmin.conversations.update();
                        } else if (user_id) {
                            SBAdmin.profile.show(user_id);
                        }
                    } else {
                        this.start();
                    }
                    window.focus();
                }
            }
        },

        // Returns the recipient user ID 
        getRecipientUserID: function () {
            return admin ? activeUser().id : (this.lastAgent(false) ? this.lastAgent(false).user_id : (SBF.null(this.conversation.get('agent_id')) ? (SBF.null(this.conversation.get('department')) ? 'agents' : 'department-' + this.conversation.get('department')) : this.conversation.get('agent_id')));
        },

        // Editor submit message
        submit: function () {
            if (!this.is_busy) {
                if (audio_recorder_dom && audio_recorder_dom.sbActive()) {
                    let button = audio_recorder_dom.find('.sb-btn-mic');
                    audio_recorder_dom.sbActive(false);
                    if (button.hasClass('sb-icon-pause')) {
                        button.click();
                    }
                    setTimeout(() => {
                        if (audio_recorder_chunks.length) {
                            let form = new FormData();
                            let is_wav = this.conversation && this.conversation.get('source') == 'ig';
                            form.append('file', new File([new Blob(audio_recorder_chunks, { type: is_wav ? 'audio/wav' : 'audio/mp3' })], 'voice_message.' + (is_wav ? 'wav' : 'mp3')));
                            SBF.upload(form, (response) => {
                                SBChat.uploadResponse(response);
                                this.submit();
                            });
                        } else {
                            this.submit();
                        }
                        audio_recorder_dom.find('.sb-icon-close').click();
                    }, 100);
                    return;
                }
                this.sendMessage();
                if (CHAT_SETTINGS.cron_email_piping_active) {
                    setInterval(() => {
                        SBF.ajax({ function: 'email-piping' });
                    }, 60000);
                    CHAT_SETTINGS.cron_email_piping_active = false;
                }
                if (init_push_notifications) {
                    SBF.serviceWorker.initPushNotifications();
                }
            }
        },

        // Initialize the chat
        initChat: function () {
            if (admin) return;
            SBF.getActiveUser(true, () => {
                let active = activeUser() !== false;
                let user_type = active ? activeUser().type : false;
                if (!tickets && CHAT_SETTINGS.popup && !storage('popup') && (!mobile || !CHAT_SETTINGS.popup_mobile_hidden)) {
                    this.popup();
                }
                SBChat.automations.runAll();
                if (!tickets && CHAT_SETTINGS.privacy && !CHAT_SETTINGS.registration_required && !storage('privacy-approved')) {
                    this.privacy();
                    return;
                }
                if (typeof Notification !== ND && !CHAT_SETTINGS.push_notifications_users && (['all', 'users'].includes(CHAT_SETTINGS.desktop_notifications) || (admin && CHAT_SETTINGS.desktop_notifications == 'agents'))) {
                    this.desktop_notifications = true;
                }
                if (['all', 'users'].includes(CHAT_SETTINGS.flash_notifications) || (admin && CHAT_SETTINGS.flash_notifications == 'agents')) {
                    this.flash_notifications = true;
                }
                if (this.registration(true) && !tickets) {
                    this.registration();
                    if (!active && CHAT_SETTINGS.visitors_registration) {
                        this.addUserAndLogin();
                    }
                    return;
                }
                if (!active && (typeof SB_WP_WAITING_LIST !== ND || CHAT_SETTINGS.visitors_registration || CHAT_SETTINGS.welcome || CHAT_SETTINGS.subscribe || tickets) && (!tickets || !CHAT_SETTINGS.tickets_registration_required)) {
                    this.addUserAndLogin(() => {
                        this.welcome();
                        this.subscribe();
                        SBApps.woocommerce.waitingList();
                        this.finalizeInit();
                    });
                } else if (!this.conversation && active) {
                    this.populateConversations();
                } else {
                    this.finalizeInit();
                }
                if (CHAT_SETTINGS.header_name && active && user_type == 'user' && !tickets) {
                    chat_header.find('.sb-title').html(`${sb_('Hello')} ${activeUser().nameBeautified}!`);
                }
                this.welcome();
                this.subscribe();
                if (!SBPusher.active) {
                    setInterval(() => {
                        this.updateConversations();
                        this.updateUsersActivity();
                    }, 10200);
                }
                SBApps.woocommerce.waitingList();
                this.scrollBottom(true);
            });
        },

        finalizeInit: function () {
            if (!this.initialized) {
                main.attr('style', '');
                if (!admin && !tickets) {
                    if (this.isInitDashboard()) {
                        this.showDashboard();
                    }
                    if (!mobile && window.innerHeight < 760) {
                        main.find(' > .sb-body').css('max-height', (window.innerHeight - 130) + 'px');
                    }
                }
                this.initialized = true;
                if (!admin) {
                    if (activeUser() && !this.registration(true)) {
                        if (storage('open-conversation')) {
                            this.openConversation(storage('open-conversation'));
                        }
                        if (SBF.getURL('conversation')) {
                            this.openConversation(SBF.getURL('conversation'));
                        }
                    }
                    if (!this.chat_open && ((!mobile && storage('chat-open')) || SBF.getURL('chat') == 'open') || SBF.getURL('conversation')) {
                        setTimeout(() => { this.start(); }, 500);
                    }
                    if (CHAT_SETTINGS.woocommerce_returning_visitor) {
                        if (storage('returning-visitor') === false) {
                            SBF.storageTime('returning-visitor');
                        } else if (SBF.storageTime('returning-visitor', 24) && !storage('returning-visitor-processed')) {
                            setTimeout(() => {
                                SBF.ajax({
                                    function: 'woocommerce-returning-visitor'
                                }, () => {
                                    storage('returning-visitor-processed', true);
                                });
                            }, 15000);
                        }
                    }
                    if (CHAT_SETTINGS.timetable_type) {
                        SBChat.offlineMessage();
                    }
                    if (CHAT_SETTINGS.queue_human_takeover && SBApps.dialogflow.humanTakeoverActive()) {
                        CHAT_SETTINGS.queue = true;
                    }
                    $(window).on('resize', function () {
                        if (!mobile && window.innerHeight < 760) {
                            main.find(' > .sb-body').css('max-height', (window.innerHeight - 130) + 'px');
                        }
                    });
                }
                if (tickets) {
                    SBTickets.init();
                }
                SBF.event('SBInit');
            }
        },

        // Initialize the chat settings and open the chat
        start: function () {
            if (this.initialized) {
                this.populate();
                this.headerAgent();
                this.updateUsersActivity();
                this.startRealTime();
                this.popup(true);
                if (this.conversation) {
                    this.updateNotifications(this.conversation.id);
                }
                main.sbActive(true);
                $('body').addClass('sb-chat-open');
                this.chat_open = true;
                if (CHAT_SETTINGS.welcome_trigger == 'open') {
                    this.welcome();
                }
                SBApps.martfury.privateChat();
                this.calculateLabelDates();
            }
        },

        // Open or close the chat
        open: function (open = true) {
            if (open && !this.chat_open) {
                this.start();
                this.chat_open = true;
                this.startRealTime();
                main.sbActive(true);
                $('body').addClass('sb-chat-open');
                storage('chat-open', true);
                if (this.conversation) {
                    storage('last-open-message', this.conversation.getLastMessage().id);
                }
                if (mobile) {
                    history.pushState({ 'chat-open': true }, '', '');
                }
                SBF.event('SBChatOpen');
            } else if (!open && this.chat_open) {
                main.sbActive(false);
                this.stopRealTime();
                this.chat_open = false;
                storage('chat-open', false);
                $('body').removeClass('sb-chat-open');
                SBF.event('SBChatClose');
            }
        },

        // Get a full conversation and display it in the chat
        openConversation: function (conversation_id) {
            activeUser().getFullConversation(conversation_id, (response) => {
                if (!response.id || !SBChat.isConversationAllowed(response.get('source'), response.status_code)) {
                    storage('open-conversation', '');
                    return false;
                }
                this.setConversation(response);
                this.hideDashboard();
                this.populate();
                this.main_header = false;
                if (storage('chat-open')) {
                    SBChat.open();
                }
                if (storage('queue') == conversation_id) {
                    this.queue(conversation_id);
                }
                if (this.chat_open || tickets) {
                    this.updateNotifications(conversation_id);
                }
                if (tickets) {
                    SBTickets.activateConversation(response);
                }
                storage('open-conversation', conversation_id);
                SBF.event('SBConversationOpen', response);
            });
        },

        // Update the active conversation with the latest messages
        update: function () {
            if (this.conversation) {
                if (this.is_busy_update) return;
                let last_message = this.conversation.getLastMessage();
                let is_update = false;
                SBF.ajax({
                    function: 'get-new-messages',
                    conversation_id: this.conversation.id,
                    datetime: this.datetime_last_message_conversation,
                    last_id: this.id_last_message_conversation
                }, (response) => {
                    let count = response.length;
                    this.is_busy_update = false;
                    if (this.conversation) {
                        if (Array.isArray(response) && count > 0 && (!last_message || last_message.id != response[count - 1].id || last_message.message != response[count - 1].message || last_message.payload != response[count - 1].payload || last_message.attachments != response[count - 1].attachments)) {
                            let code = '';
                            let messages = [];
                            let id_check = [];
                            let dialogflow_activation = false;

                            // Generate and add the new messages
                            this.calculateLabelDateFirst();
                            for (var i = 0; i < count; i++) {
                                if (!id_check.includes(response[i].id)) {
                                    let message = new SBMessage(response[i]);
                                    let payload = message.payload();
                                    this.id_last_message_conversation = message.id;
                                    this.datetime_last_message_conversation = message.get('creation_time');

                                    // Payload
                                    if (!['boolean', 'string'].includes(typeof payload)) {
                                        if (payload.event) {
                                            let event = payload.event;
                                            if ((event == 'delete-message' && this.conversation.getMessage(message.id) !== false) || (!admin && !message.message && !message.attachments.length && !payload)) {
                                                this.deleteMessage(message.id);
                                            }
                                            if (event == 'woocommerce-update-cart' && !admin) {
                                                SBApps.woocommerce.updateCart(payload.action, payload.id);
                                            }
                                            if (!SBApps.dialogflow.active() && (event == 'conversation-status-update-3' || event == 'conversation-status-update-4' || event == 'activate-bot')) {
                                                SBApps.dialogflow.active('activate');
                                                dialogflow_activation = true;
                                            }
                                            if (event == 'conversation-status-update-3' && ((!tickets && CHAT_SETTINGS.close_chat) || (tickets && CHAT_SETTINGS.tickets_close))) {
                                                this.closeChat(false);
                                                return;
                                            }
                                        }
                                        if (payload['human-takeover'] && CHAT_SETTINGS.queue_human_takeover) {
                                            CHAT_SETTINGS.queue = true;
                                            SBChat.queue(SBChat.conversation.id);
                                        }
                                    }

                                    // Message
                                    if (this.conversation.getMessage(response[i].id)) {
                                        this.conversation.updateMessage(message.id, message);
                                        chat.find(`[data-id="${message.id}"]`).replaceWith(message.getCode());
                                        is_update = true;
                                    } else {
                                        if (message.message || message.attachments.length) {
                                            chat.find(`[data-id="sending"]`).remove();
                                        }
                                        if (this.conversation.id == response[i].conversation_id) {
                                            this.conversation.addMessages(message);
                                            code += message.getCode();
                                            is_update = false;
                                        }
                                    }
                                    this.conversation.updateMessagesStatus();
                                    messages.push(message);
                                    id_check.push(message.id);
                                    if (this.chat_open) {
                                        storage('last-open-message', message.id);
                                    }
                                    if (!admin && ((this.dashboard || !this.chat_open || !this.tab_active) && (message.get('user_id') != activeUser().id) && (message.message || message.attachments.length))) {
                                        this.updateNotifications(this.conversation.id, message.id);
                                    }
                                }
                            }
                            chat.append(code);

                            // Update status code
                            let last_message = this.conversation.getLastMessage();
                            let user_type = last_message ? last_message.get('user_type') : false;
                            let is_agent = SBF.isAgent(user_type);
                            if (!admin && is_agent && user_type != 'bot') {
                                if (this.chat_open) {
                                    if (last_message && last_message.message.indexOf('sb-rich-success') == -1) {
                                        this.setConversationStatus(0);
                                    }
                                    if (CHAT_SETTINGS.follow) {
                                        clearTimeout(timeout);
                                    }
                                }
                                if (!dialogflow_activation) {
                                    SBApps.dialogflow.active(false);
                                }
                            }

                            // Queue
                            if (storage('queue') == this.conversation.id && is_agent && user_type != 'bot') {
                                this.queue('clear');
                            }

                            // Flash notifications
                            if (!(SBF.null(messages[0].message) && SBF.null(messages[0].attachments)) || count != 1) {
                                if (!admin && !this.tab_active) {
                                    this.flashNotification();
                                }

                                // Sound notifications
                                if (this.audio && ((!admin && (is_agent || user_type == 'bot')) || (admin && !SBF.isAgent(user_type)))) {
                                    this.playSound();
                                }
                            }

                            // Miscellaneous
                            this.headerAgent();
                            if (!this.dashboard && !is_update) {
                                this.scrollBottom();
                                setTimeout(() => { this.scrollBottom() }, 300);
                            }
                            if (CHAT_SETTINGS.auto_open && (this.dashboard || !this.chat_open)) {
                                this.open();
                            }
                            this.typing(-1, 'stop');
                            this.busy(false);
                            SBF.event('SBNewMessagesReceived', { messages: messages, conversation_id: this.conversation.id });
                            if (tickets) {
                                SBTickets.onNewMessageReceived(messages[0], this.conversation.id);
                            }
                        }
                    }
                });
                this.is_busy_update = true;
                setTimeout(() => { this.is_busy_update = false }, 5000);
            } else {
                this.updateConversations();
            }
        },

        // Update the user conversations list with the latest conversations and messages
        updateConversations: function () {
            if (activeUser()) {
                SBF.ajax({
                    function: 'get-new-user-conversations',
                    datetime: this.id_last_message
                }, (response) => {
                    if (response.length) {
                        this.id_last_message = response[0].message_id;
                        if (this.chat_open) {
                            storage('last-open-message', this.id_last_message);
                        }
                        for (var i = 0; i < response.length; i++) {
                            let status_code = response[i].conversation_status_code;
                            if (!SBChat.isConversationAllowed(response[i].source, status_code)) {
                                continue;
                            }
                            let conversation_id = response[i].conversation_id;
                            let message = new SBMessage(response[i]);
                            let conversation = new SBConversation([message], response[i]);
                            let is_new = activeUser().addConversation(conversation);

                            // Red notifications
                            if (response[i].message_user_id != activeUser().id && (this.conversation.id != conversation_id || !this.chat_open) && (message.message || message.attachments.length)) {
                                this.updateNotifications(conversation_id, message.id);
                                if (CHAT_SETTINGS.auto_open) {
                                    this.open();
                                }
                            }

                            // Payload
                            let payload = message.payload();
                            if (typeof payload !== 'boolean' && payload.event) {
                                let event = payload.event;
                                if (event == 'open-chat') {
                                    if (this.conversation.id != conversation_id || this.dashboard) {
                                        this.openConversation(conversation_id);
                                    }
                                    if (!mobile) {
                                        setTimeout(() => { this.open() }, 500);
                                    }
                                }
                                if (!message.message && !message.attachments.length) {
                                    continue;
                                }
                            }

                            if (!this.tab_active) {

                                // Desktop notifications
                                if (this.desktop_notifications) {
                                    SBChat.desktopNotification(message.get('full_name'), message.message, message.get('profile_image'));
                                }

                                // Flash notifications
                                if (this.flash_notifications) {
                                    this.flashNotification();
                                }

                                // Sound notifications
                                if (!admin && this.audio && CHAT_SETTINGS.sound && (!this.chat_open || this.dashboard || this.conversation.id != conversation_id) && !(SBF.null(message.message) && SBF.null(message.attachments))) {
                                    this.playSound();
                                }
                            }
                            if (is_new) {
                                SBF.event('SBNewConversationReceived', conversation);
                            }
                            if (tickets) {
                                SBTickets.onConversationReceived(conversation);
                            }
                        }
                        if (this.conversation) {
                            this.conversation.updateMessagesStatus();
                        }
                        main.find('.sb-user-conversations').html(activeUser().getConversationsCode());
                        main.find('.sb-dashboard-conversations').setClass('sb-conversations-hidden', main.find('.sb-user-conversations > li').length > 3);
                    }
                });
            }
        },

        // Generate the conversation code and display it
        populate: function () {
            if (this.conversation) {
                let code = '';
                let notify = chat.find(' > .sb-notify-message');
                let last_date = false;
                let conversation_id = this.conversation.id;
                for (var i = 0; i < this.conversation.messages.length; i++) {
                    let message = this.conversation.messages[i];
                    let current_date = SBF.beautifyTime(message.get('creation_time'));
                    if (current_date.includes('today')) {
                        current_date = `<span>${sb_('Today')}</span>`;
                    }
                    if (current_date != last_date && (message.message || message.attachments.length)) {
                        code += `<div class="sb-label-date">${current_date}</div>`;
                        last_date = current_date;
                    }
                    code += message.getCode();
                }
                chat.html((notify.length ? notify[0].outerHTML : '') + code);
                if (!this.dashboard) {
                    this.scrollBottom();
                    this.calculateLabelDates();
                    if ((admin && SB_ADMIN_SETTINGS.notify_email_cron) || (!admin && CHAT_SETTINGS.notify_email_cron)) {
                        let last_message = this.conversation.getLastUserMessage(false, !admin);
                        if (last_message && last_message.id != storage('email-cron-' + conversation_id)) {
                            SBF.ajax({ function: 'remove-email-cron', conversation_id: conversation_id });
                            storage('email-cron-' + conversation_id, last_message.id);
                        }
                    }
                }
            } else if (activeUser() && !activeUser().isConversationsEmpty()) {
                if (CHAT_SETTINGS.disable_dashboard) {
                    this.openConversation(activeUser().conversations[0].id);
                } else {
                    this.showDashboard();
                }
            }
        },

        // Populate the dashboard with all conversations
        populateConversations: function (onSuccess = false) {
            if (!this.is_busy_populate && activeUser()) {
                this.is_busy_populate = true;
                setTimeout(() => { this.is_busy_populate = false }, 5000);
                activeUser().getConversations((response) => {
                    let count = response.length;
                    let converstion_ids = [];
                    if (count) {
                        let now = Date.now();
                        let last_message = response[0].messages[0];
                        this.id_last_message = last_message.id;
                        for (var i = 0; i < count; i++) {
                            converstion_ids.push(response[i].id);
                            if (!tickets && (response[i].status_code == 1 && storage('last-open-message') != last_message.id) && (!this.conversation || this.conversation.id != response[i].id)) {
                                this.updateNotifications(response[i].id, last_message.id);
                            }
                            if (!mobile && (now - SBF.UTC(response[i].messages[0].get('creation_time'))) < 6000) {
                                this.open();
                            }
                        }
                        main.find('.sb-user-conversations').html(activeUser().getConversationsCode());
                        main.find('.sb-dashboard-conversations').setClass('sb-conversations-hidden', main.find('.sb-user-conversations > li').length > 3);
                    }
                    main.setClass('sb-no-conversations', !count);
                    if ((!this.initialized || force_action == 'open-conversation') && count == 1 && !this.isInitDashboard() && !storage('open-conversation')) {
                        this.openConversation(activeUser().conversations[0].id);
                        if (force_action == 'open-conversation') {
                            force_action = '';
                        }
                    }
                    for (var i = 0; i < SBChat.notifications.length; i++) {
                        this.updateNotifications(SBChat.notifications[i][0], converstion_ids.includes(SBChat.notifications[i][0]) ? SBChat.notifications[i][1] : false);
                    }
                    if (onSuccess) {
                        onSuccess(response);
                    }
                    this.finalizeInit();
                    SBF.event('SBPopulateConversations', { conversations: response });
                });
            }
        },

        // Create a new conversation and optionally send the first message
        newConversation: function (status_code, user_id = - 1, message = '', attachments = [], department = null, agent_id = null, onSuccess = false) {
            if (activeUser()) {
                SBF.ajax({
                    function: 'new-conversation',
                    status_code: status_code,
                    title: tickets ? main.find('.sb-ticket-title input').val() : null,
                    department: SBF.null(department) ? this.default_department : department,
                    agent_id: SBF.null(agent_id) ? this.default_agent : agent_id,
                    tags: this.default_tags,
                    source: tickets ? 'tk' : ''
                }, (response) => {
                    if (SBF.errorValidation(response, 'user-not-found')) {
                        this.addUserAndLogin(() => {
                            this.newConversation(status_code, user_id, message, attachments, department, agent_id, onSuccess);
                        });
                        return;
                    }
                    let conversation = new SBConversation([], response.details);
                    this.setConversation(conversation);
                    if (message || attachments.length) {
                        this.sendMessage(user_id, message, attachments);
                    }
                    if (user_id != bot_id) {
                        setTimeout(() => { this.queue(conversation.id) }, 1000);
                    }
                    activeUser().conversations.push(conversation);
                    if (onSuccess) {
                        onSuccess(conversation);
                    }
                });

            } else {
                SBF.error('activeUser() not setted', 'SBChat.newConversation');
            }
        },

        // Set an existing conversation as active conversation
        setConversation: function (conversation) {
            if (conversation instanceof SBConversation) {
                let conversations = activeUser().conversations;
                this.conversation = conversation;
                this.id_last_message_conversation = !this.conversation.getLastMessage() ? 0 : this.conversation.getLastMessage().id;
                this.datetime_last_message_conversation = this.conversation.getLastMessage() == false ? '2000-01-01 00:00:00' : this.conversation.getLastMessage().get('creation_time');
                if (conversation.id != this.conversation.id) {
                    this.queue(conversation.id);
                }
                for (var i = 0; i < conversations.length; i++) {
                    if (conversations[i].id == conversation.id) {
                        conversations[i] = conversation;
                        break;
                    }
                }
                storage('open-conversation', conversation.id);
                SBF.event('SBActiveConversationChanged', conversation);
            } else {
                SBF.error('Value not of type SBConversation', 'SBChat.setConversation');
            }
        },

        // Manage all the queue functionalities
        queue: function (conversation_id) {
            if (conversation_id == 'clear') {
                main.removeClass('sb-notify-active sb-queue-active');
                chat.find(' > .sb-notify-message').remove();
                clearInterval(this.queue_interval);
                this.queue_interval = false;
                storage('queue', '');
                if (CHAT_SETTINGS.queue_sound && !SBChat.tab_active) {
                    SBChat.playSound(999);
                }
                return;
            }
            if (!admin && CHAT_SETTINGS.queue) {
                SBF.ajax({
                    function: 'queue',
                    conversation_id: conversation_id,
                    department: this.conversation.get('department')
                }, (response) => {
                    chat.find(' > .sb-notify-message').remove();
                    let position = response[0];
                    if (position == 0) {
                        this.queue('clear');
                    } else {
                        let time = (!CHAT_SETTINGS.queue_response_time ? 5 : parseInt(CHAT_SETTINGS.queue_response_time)) * position;
                        let text = sb_(!CHAT_SETTINGS.queue_message ? 'Please wait for an agent. You are number {position} in the queue. Your waiting time is approximately {minutes} minutes.' : CHAT_SETTINGS.queue_message).replace('{position}', '<b>' + position + '</b>').replace('{minutes}', '<b>' + time + '</b>');
                        if (response[1]) {
                            chat.prepend(`<div class="sb-notify-message sb-rich-cnt"><div class="sb-cnt"><div class="sb-message">${text}</div></div></div>`);
                        }
                        if (this.queue_interval === false) {
                            this.queue_interval = setInterval(() => { this.queue(conversation_id) }, 10100);
                            if (response[1]) {
                                main.addClass('sb-notify-active sb-queue-active');
                            }
                            storage('queue', conversation_id);
                        }
                    }
                    SBF.event('SBQueueUpdate', position);
                });
            }
        },

        // Get the departments details and generate the department code
        getDepartmentCode(department_id, onSuccess) {
            if (this.departments) {
                if (department_id == 'all') {
                    let code = '';
                    for (var key in this.departments) {
                        this.getDepartmentCode(this.departments[key].id, (response) => { code += response; });
                    };
                    onSuccess(code);
                } else {
                    onSuccess(`<div data-color="${this.departments[department_id].color}">${this.departments[department_id].image ? `<img loading="lazy" src="${this.departments[department_id].image}" />` : ''}<div>${this.departments[department_id].name}<div></div>`);
                }
            } else {
                SBF.ajax({
                    function: 'get-departments'
                }, (response) => {
                    if (response) {
                        this.departments = response;
                        this.getDepartmentCode(department_id, onSuccess);
                    }
                });
            }
        },

        // Start and stop the real time check of new messages
        startRealTime: function () {
            if (SBPusher.active) return;
            this.stopRealTime();
            this.real_time = setInterval(() => {
                this.update();
                this.typing(admin ? (activeUser() ? activeUser().id : -1) : this.agent_id, 'check');
            }, 1000);
        },

        stopRealTime: function () {
            clearInterval(this.real_time);
        },

        // Check if the agent is online and set the online status of the active user
        updateUsersActivity: function () {
            if (activeUser()) {
                SBF.updateUsersActivity(activeUser().id, this.agent_id, (response) => {
                    if (!this.typing_settings.typing) {
                        if (response == 'online' || this.agent_id == bot_id) {
                            $(chat_status).addClass('sb-status-online').html(sb_('Online'));
                            this.agent_online = this.agent_id != bot_id;
                        } else {
                            $(chat_status).removeClass('sb-status-online').html(sb_('Away'));
                            this.agent_online = false;
                        }
                    }
                });
            }
        },

        // Show the loading icon and put the chat in busy mode
        busy: function (value) {
            if (chat_editor) {
                chat_editor.find('.sb-loader').sbActive(value);
            }
            this.is_busy = value;
            SBF.event('SBBusy', value);
        },

        // Manage the agent header
        headerAgent: function () {
            if (!admin && !tickets && !this.dashboard && this.conversation && (this.agent_id == -1 || (this.conversation.getLastMessage() && SBF.isAgent(this.conversation.getLastMessage().get('user_type')) && this.conversation.getLastMessage().get('user_id') != this.agent_id))) {
                let agent = this.lastAgent();
                if (agent) {
                    this.agent_id = agent.user_id;
                    this.headerReset();
                    chat_header.addClass('sb-header-agent').attr('data-agent-id', this.agent_id).html(`<div class="sb-dashboard-btn sb-icon-arrow-left"></div><div class="sb-profile"><img loading="lazy" src="${agent['profile_image']}" /><div><span class="sb-name">${agent['full_name']}</span><span class="sb-status">${sb_('Away')}</span></div><i class="sb-icon sb-icon-close ${CHAT_SETTINGS.close_chat ? 'sb-close-chat' : 'sb-responsive-close-btn'}"></i></div><div class="sb-label-date-top"></div>`);
                    chat_status = chat_header.find('.sb-status');
                    this.updateUsersActivity();
                    label_date = chat_header.find('.sb-label-date-top');
                    if (SBF.storageTime('header-animation', 1)) {
                        this.headerAnimation();
                    }
                }
            }
        },

        headerReset: function () {
            if (this.start_header == false) {
                this.start_header = [chat_header.html(), chat_header.attr('class')];
            }
            chat_header.removeClass('sb-header-main sb-header-brand sb-header-agent sb-header-minimal');
            this.main_header = false;
        },

        headerAnimation: function () {
            chat_header.addClass('sb-header-animation');
            setTimeout(() => { chat_header.removeClass('sb-header-animation') }, 8000);
            SBF.storageTime('header-animation');
        },

        // Return the last agent of the active conversation
        lastAgent: function (bot = true) {
            let agent = false;
            if (this.conversation) {
                let message = this.conversation.getLastUserMessage(false, bot ? 'all' : true);
                if (message) {
                    agent = { user_id: message.get('user_id'), full_name: message.get('full_name'), profile_image: message.get('profile_image') };
                }
            }
            return agent;
        },

        // Scroll the chat to the bottom
        scrollBottom: function (top = false) {
            label_date_show = false;
            setTimeout(() => { label_date_show = true }, 1000);
            setTimeout(() => {
                chat_scroll_area.scrollTop(top ? 0 : chat_scroll_area[0].scrollHeight);
                this.scrollHeader();
            }, 20);
        },

        // Check if the chat is at bottom
        isBottom: function () {
            return chat_scroll_area[0].scrollTop === (chat_scroll_area[0].scrollHeight - chat_scroll_area[0].offsetHeight);
        },

        // Dashboard header animation
        scrollHeader: function () {
            if (this.main_header && this.dashboard) {
                let scroll = chat_scroll_area.scrollTop();
                if (scroll > -1 && scroll < 1000) {
                    chat_header.find('.sb-content').css({ 'opacity': (1 - (scroll / 500)), 'top': (scroll / 10 * -1) + 'px' });
                };
            }
        },

        // Display the dashboard area 
        showDashboard: function () {
            if (!admin && !tickets) {
                main.addClass('sb-dashboard-active');
                chat_header.removeClass('sb-header-agent');
                this.hidePanel()
                if (this.start_header) chat_header.html(this.start_header[0]).addClass(this.start_header[1]);
                chat_scroll_area.find(' > div').sbActive(false);
                main.find('.sb-dashboard').sbActive(true);
                this.populateConversations();
                this.conversation = false;
                this.agent_id = -1;
                this.stopRealTime();
                this.dashboard = true;
                this.main_header = true;
                this.scrollBottom(true);
                SBF.event('SBDashboard');
            }
        },

        // Hide the dashboard area
        hideDashboard: function () {
            if (!admin && !tickets) {
                chat.sbActive(true);
                main.removeClass('sb-dashboard-active').find('.sb-dashboard').sbActive(false);
                this.dashboard = false;
                this.headerAgent();
                this.scrollHeader(0);
                if (this.chat_open) {
                    this.startRealTime();
                }
                SBF.event('SBDashboardClosed');
            }
        },

        // Show a chat panel
        showPanel: function (name, title) {
            if (tickets) return SBTickets.showPanel(name, title);
            let panel = chat_scroll_area.find(' > .sb-panel-' + name);
            if (panel.length) {
                chat_scroll_area.find(' > div').sbActive(false);
                panel.sbActive(true);
                if (!this.start_header) this.start_header = [chat_header.html(), chat_header.attr('class')];
                chat_header.attr('class', 'sb-header sb-header-panel').html(`${sb_(title)}<div class="sb-dashboard-btn sb-icon-close"></div>`);
                main.addClass('sb-panel-active');
                this.dashboard = true;
            }
            SBF.event('SBPanelActive', name);
        },

        hidePanel: function () {
            main.removeClass('sb-panel-active');
            chat_header.removeClass('sb-header-panel');
        },

        // Clear the conversation area and the active conversation
        clear: function () {
            this.conversation = false;
            chat.html('');
        },

        // Update the red notification counter of the chat
        updateNotifications: function (conversation_id, message_id = false) {
            let check = false;
            if (message_id) {
                for (var i = 0; i < this.notifications.length; i++) {
                    if (this.notifications[i][0] == conversation_id && message_id == this.notifications[i][1]) {
                        check = true;
                    }
                }
                if (!check) {
                    this.notifications.push([conversation_id, message_id]);
                    if (!this.dashboard && this.conversation && this.conversation.id != conversation_id) {
                        this.headerAnimation();
                    }
                }
            } else {
                let active_notifications = [];
                for (var i = 0; i < this.notifications.length; i++) {
                    if (this.notifications[i][0] == conversation_id) {
                        check = true;
                    } else {
                        active_notifications.push(this.notifications[i]);
                    }
                }
                if (!admin && check && ['0', '2', 0, 2].includes(this.conversation.status_code)) {
                    this.setConversationStatus(1);
                }
                this.notifications = active_notifications;
            }
            let count = this.notifications.length;
            storage('notifications', this.notifications);
            main.find('.sb-chat-btn span').attr('data-count', count).html(count > -1 ? count : 0);
            SBF.event('SBNotificationsUpdate', { conversation_id: conversation_id, message_id: message_id });
        },

        // Set the active conversation status
        setConversationStatus: function (status_code) {
            if (this.conversation) {
                SBF.ajax({
                    function: 'update-conversation-status',
                    conversation_id: this.conversation.id,
                    status_code: status_code
                }, () => {
                    this.conversation.set('status_code', status_code);
                    SBF.event('SBActiveConversationStatusUpdated', { conversation_id: this.conversation.id, status_code: status_code });
                });
                return true;
            }
            return false;
        },

        // Typing status
        typing: function (user_id = -1, action = 'check') {
            if (this.conversation) {
                let valid = this.agent_online || (admin && this.user_online);
                if (action == 'check' && !SBPusher.active && user_id != -1 && user_id != bot_id && valid) {
                    SBF.ajax({
                        function: 'is-typing',
                        user_id: user_id,
                        conversation_id: this.conversation.id
                    }, (response) => {
                        if (response && !this.typing_settings.typing) {
                            this.typing(-1, 'start');
                        } else if (!response && this.typing_settings.typing) {
                            this.typing(-1, 'stop');
                        }
                    });
                } else if (action == 'set' && valid) {
                    let source = this.conversation.get('source');
                    clearTimeout(timeout_typing);
                    if (source) {
                        source = source == 'fb' ? [source, activeUser().getExtra('facebook-id').value, this.conversation.get('extra')] : (source == 'tw' ? [source, activeUser().getExtra('twitter-id').value] : false);
                    }
                    if (SBPusher.active) {
                        SBF.debounce(() => {
                            SBPusher.trigger('client-typing', { user_id: admin ? SB_ACTIVE_AGENT.id : activeUser().id, conversation_id: this.conversation.id });
                            if (source) {
                                SBF.ajax({ function: 'set-typing', source: source });
                            }
                        }, '#2');
                    } else {
                        if (!this.typing_settings.sent) {
                            this.typing_settings.sent = true;
                            SBF.ajax({
                                function: 'set-typing',
                                user_id: user_id,
                                conversation_id: this.conversation.id,
                                source: source
                            });
                            this.typing(user_id, 'set');
                        } else {
                            clearTimeout(this.typing_settings.timeout);
                            this.typing_settings.timeout = setTimeout(() => {
                                SBF.ajax({
                                    function: 'set-typing',
                                    user_id: user_id,
                                    conversation_id: -1
                                }, () => {
                                    this.typing_settings.sent = false;
                                });
                            }, 2000);
                        }
                    }
                } else if (action == 'start' || action == 'stop') {
                    let start = action == 'start';
                    if (!admin && chat_status) {
                        if (start) {
                            $(chat_status).addClass('sb-status-typing').html(sb_('Typing'));
                        } else {
                            let online = this.agent_online || this.agent_id == bot_id;
                            $(chat_status).removeClass('sb-status-typing').html(sb_(online ? 'Online' : 'Away'));
                            if (online) {
                                $(chat_status).addClass('sb-status-online');
                            }
                        }
                    }
                    this.typing_settings.typing = start;
                    SBF.event('SBTyping', start);
                }
            }
        },

        // Articles
        showArticles: function (id = false, is_category = false) {
            let panel = tickets ? main.find('.sb-panel-main .sb-panel') : chat_scroll_area.find(' > .sb-panel-articles');
            panel.html('').sbLoading(true);
            this.showPanel('articles', CHAT_SETTINGS.articles_title ? CHAT_SETTINGS.articles_title : 'Help Center');
            if (!id && CHAT_SETTINGS.articles_categories) {
                this.getArticleCategories((categories) => {
                    this.showArticles_(categories, panel, { categories: categories });
                }, 'parent');
            } else {
                this.getArticles(is_category ? false : id, (articles) => {
                    if (id && !is_category) {
                        panel.html(this.getArticleCode(articles[0]));
                        panel.sbLoading(false);
                        SBF.event('SBArticles', { id: id, articles: articles });
                    } else {
                        this.showArticles_(articles, panel, { id: id, articles: articles });
                    }
                }, is_category ? id : false);
            }
        },

        showArticles_: function (items, panel, payload) {
            let code = '';
            let language = typeof SB_LANG != ND ? SB_LANG[0] : false;
            for (var i = 0; i < items.length; i++) {
                let is_article = 'content' in items[i];
                code += `<div data-id="${items[i].id}"${is_article ? '' : ' data-is-category="true"'}><div>${is_article ? items[i].title : (language && items[i].languages && items[i].languages[language] ? items[i].languages[language].title : items[i].title)}</div><span>${is_article ? items[i].content : (language && items[i].languages && items[i].languages[language] ? items[i].languages[language].description : (items[i].description ? items[i].description : ''))}</span></div>`;
            }
            panel.html(`<div class="sb-articles">${code}</div>`);
            panel.sbLoading(false);
            SBF.event('SBArticles', payload);
        },

        getArticles: function (id = false, onSuccess = false, category = false, count = false) {
            SBF.ajax({
                function: 'get-articles',
                categories: this.articles_category ? this.articles_category : category,
                id: id ? id : this.articles_allowed_ids,
                count: count,
                return_categories: this.articles_category ? true : false,
                full: id
            }, (response) => {
                onSuccess(response);
            });
        },

        getArticleCategories: function (onSuccess = false, category_type = false) {
            SBF.ajax({
                function: 'get-articles-categories',
                category_type: category_type
            }, (response) => {
                onSuccess(response);
            });
        },

        searchArticles: function (search, button, target) {
            if (search) {
                $(button).sbLoading(true);
                SBF.ajax({
                    function: 'search-articles',
                    search: search
                }, (articles) => {
                    let code = '';
                    let count = articles.length;
                    if (count == 0) {
                        code += `<p class="sb-no-results">${sb_('No articles found.')}</p>`;
                    } else {
                        for (var i = 0; i < articles.length; i++) {
                            code += `<div data-id="${articles[i].id}"><div>${articles[i].title}</div><span>${articles[i].content}</span></div>`;
                        }
                    }
                    $(target).html(code);
                    $(button).sbLoading(false);
                });
            }
        },

        setArticleRating: function (article_id, rating, onSuccess = false) {
            SBF.ajax({
                function: 'article-ratings',
                article_id: article_id,
                rating: rating
            }, (response) => {
                if (onSuccess) onSuccess(response);
            });
        },

        articleRatingOnClick: function (button) {
            let article = $(button).closest('.sb-article');
            if (!article[0].hasAttribute('data-user-rating')) {
                $(button).parent().sbLoading();
                let rating = $(button).attr('data-rating') == 'positive' ? 1 : -1;
                let article_id = $(button).closest('.sb-article').attr('data-id');
                SBChat.setArticleRating(article_id, rating, () => {
                    SBF.storage('article-rating-' + article_id, rating);
                    article.attr('data-user-rating', rating);
                    $(button).parent().sbLoading(false);
                });
            }
        },

        getArticleCode: function (article) {
            let user_rating = SBF.storage('article-rating-' + article.id);
            let code = '';
            if (this.articles_categories && !SBF.null(article.categories)) {
                for (var i = 0; i < this.articles_categories.length; i++) {
                    let category_id = this.articles_categories[i].id;
                    if (article.categories.includes(category_id) || article.parent_category == category_id) {
                        code += `<span data-id="${category_id}">${sb_(this.articles_categories[i].title)}</span>`;
                    }
                }
            }
            return `<div data-id="${article.id}"${user_rating ? ` data-user-rating="${user_rating}"` : ''} class="sb-article"><div class="sb-title">${article.title}<div class="sb-close sb-icon-close"></div></div><div class="sb-content">${article.content.replace(/(?:\r\n|\r|\n)/g, '<br>')}</div>${article.link ? `<a href="${article.link}" target="_blank" class="sb-btn-text"><i class="sb-icon-plane"></i>${sb_('Read more')}</a>` : ''}${code ? `<div class="sb-article-category-links">${code}</div>` : ''}<div class="sb-rating"><span>${sb_('Rate and review')}</span><div><i data-rating="positive" class="sb-submit sb-icon-like"><span>${sb_('Helpful')}</span></i><i data-rating="negative" class="sb-submit sb-icon-dislike"><span>${sb_('Not helpful')}</span></i></div></div></div>`;
        },

        initArticlesPage: function () {
            let query_article_id = SBF.getURL('article_id');
            let query_category = SBF.getURL('category');
            let query_search = SBF.getURL('search');
            if (CHAT_SETTINGS.articles_url_rewrite) {
                let url_parts = location.href.replace(CHAT_SETTINGS.articles_url_rewrite, '').split('/');
                if (url_parts[url_parts.length - 2] == 'category') {
                    query_category = url_parts[url_parts.length - 1];
                }
                if ((url_parts.length == 2 && !url_parts[0] && url_parts[1]) || (url_parts.length == 1 && url_parts[0])) {
                    query_article_id = url_parts[url_parts.length - 1];
                }
                CHAT_SETTINGS.articles_page_url
            }
            articles_page = $('body').find('#sb-articles');
            if (!articles_page.length) {
                articles_page = $('body');
            }
            if (articles_page.sbLoading()) {
                SBF.loadResource(SB_URL + '/css/articles.css');
                SBF.cors('GET', SB_URL + '/include/articles.php' + (query_category ? '?category=' + query_category : (query_article_id ? '?article_id=' + query_article_id : (query_search ? '?search=' + query_search : ''))), (html) => {
                    articles_page.html(html);
                    articles_page.sbLoading(false);
                });
            }
            articles_page.on('keydown', '.sb-panel-side input', function (e) {
                if (e.which == 13) $(this).next().click();
            });

            articles_page.on('click', '.sb-articles > [data-id]', function () {
                cache = panel_main.html();
                panel_main.sbLoading(true);
                SBChat.getArticles($(this).attr('data-id'), (article) => {
                    panel_main.removeClass('sb-articles').html(SBChat.getArticleCode(article));
                    panel_main.sbLoading(false);
                });
            });

            articles_page.on('click', '.sb-article [data-rating]', function () {
                SBChat.articleRatingOnClick(this);
            });

            articles_page.on('click', '.sb-article .sb-title .sb-close', function () {
                articles_page.find('.sb-panel-main').addClass('sb-articles').html(cache);
            });

            articles_page.on('click', '.sb-submit-articles', function () {
                let search = $(this).parent().find('input').val();
                if (search) {
                    cache = panel_main.html();
                    panel_main.html('');
                    SBChat.searchArticles(search, this, panel_main);
                } else {
                    panel_main.html(cache);
                }
                panel_main.addClass('sb-articles');
            });

            articles_page.on('click', '.sb-article-categories [data-id]', function () {
                if (loading(panel_main)) return;
                let code = '';
                cache = panel_main.html();
                articles_page.find('.sb-article-categories [data-id]').sbActive(false);
                $(this).sbActive(true);
                SBChat.getArticles(-1, (articles) => {
                    for (var i = 0; i < articles.length; i++) {
                        code += `<div data-id="${articles[i].id}"><div>${articles[i].title}</div><span>${articles[i].content}</span></div>`;
                    }
                    panel_main.addClass('sb-articles').html(code ? code : `<p class="sb-no-results">${sb_('No articles found.')}</p>`);
                    panel_main.sbLoading(false);
                }, $(this).attr('data-id'));
            });
        },

        // Emoji
        categoryEmoji: function (category) {
            let list = this.emoji_options.list;
            if (category == 'all') {
                this.emoji_options.list_now = list;
            } else {
                this.emoji_options.list_now = [];
                for (var i = 0; i < list.length; i++) {
                    if (list[i].category.startsWith(category)) {
                        this.emoji_options.list_now.push(list[i]);
                    }
                }
            }
            this.emoji_options.range = 0;
            this.populateEmoji(0);
            this.populateEmojiBar();
        },

        mouseWheelEmoji: function (e) {
            let range = this.emoji_options.range;
            if (sbDelta(e) > 0 || (mobile && typeof e.originalEvent.changedTouches !== ND && this.emoji_options.touch < e.originalEvent.changedTouches[0].clientY)) {
                range -= (range < 1 ? 0 : 1);
            } else {
                range += (range > this.emoji_options.range_limit ? 0 : 1);
            }
            chat_emoji.find('.sb-emoji-bar > div').sbActive(false).eq(range).sbActive(true);
            this.emoji_options.range = range;
            this.populateEmoji(range);
            e.preventDefault();
        },

        insertEmoji: function (emoji) {
            if (emoji.indexOf('.svg') > 0) {
                emoji = $.parseHTML(emoji)[0].alt;
            }
            this.insertText(emoji);
            chat_emoji.sbTogglePopup();
        },

        showEmoji: function (button) {
            if (chat_emoji.sbTogglePopup(button)) {
                if (!admin) {
                    chat_emoji.css({ left: chat_editor.offset().left + (tickets ? 68 : 20), top: chat_editor.offset().top - window.scrollY - (tickets ? chat_editor.height() - 330 : 304) });
                }
                if (!chat_emoji.find('.sb-emoji-list > ul').html()) {
                    jQuery.ajax({
                        method: 'POST',
                        url: SB_AJAX_URL,
                        data: {
                            function: 'emoji',
                            'login-cookie': SBF.loginCookie()
                        }
                    }).done((response) => {
                        this.emoji_options.list = JSON.parse(response);
                        this.emoji_options.list_now = this.emoji_options.list;
                        this.populateEmoji(0);
                        this.populateEmojiBar();
                    });
                }
                SBF.deselectAll();
            }
        },

        populateEmoji: function (range) {
            let code = '';
            let per_page = mobile ? 42 : 48;
            let limit = range * per_page + per_page;
            let list_now = this.emoji_options.list_now;
            if (limit > list_now.length) limit = list_now.length;
            this.emoji_options.range_limit = list_now.length / per_page - 1;
            this.emoji_options.range = range;
            for (var i = (range * per_page); i < limit; i++) {
                code += `<li>${list_now[i].char}</li>`;
            }
            chat_emoji.find('.sb-emoji-list').html(`<ul>${code}</ul>`);
        },

        populateEmojiBar: function () {
            let code = '<div class="sb-active"></div>';
            let per_page = mobile ? 42 : 49;
            for (var i = 0; i < this.emoji_options.list_now.length / per_page - 1; i++) {
                code += '<div></div>';
            }
            this.emoji_options.range = 0;
            chat_emoji.find('.sb-emoji-bar').html(code);
        },

        clickEmojiBar: function (item) {
            let range = $(item).index();
            this.populateEmoji(range);
            this.emoji_options.range = range;
            chat_emoji.find('.sb-emoji-bar > div').sbActive(false).eq(range).sbActive(true);
        },

        searchEmoji: function (search) {
            SBF.search(search, () => {
                if (search.length > 1) {
                    let list = this.emoji_options.list;
                    let list_now = [];
                    for (var i = 0; i < list.length; i++) {
                        if (list[i].category.toLowerCase().includes(search) || list[i].name.toLowerCase().includes(search)) {
                            list_now.push(list[i]);
                        }
                    }
                    this.emoji_options.list_now = list_now;
                } else {
                    this.emoji_options.list_now = this.emoji_options.list;
                }
                this.emoji_options.range = 0;
                this.populateEmoji(0);
                this.populateEmojiBar();
            });
        },

        // Editor methods
        textareaChange: function (textarea) {
            let value = $(textarea).val();

            // Saved replies
            if (admin) {
                SBAdmin.conversations.savedReplies(textarea, value);
                SBAdmin.apps.openAI.rewriteButton(value);
            }

            // Typing
            if (value) {
                this.typing((admin && !SBPusher.active ? SB_ACTIVE_AGENT.id : activeUser().id), 'set');
            }
            chat_editor.sbActive(value);
        },

        insertText: function (text) {
            let textarea = $(chat_textarea.get(0));
            let index = 0;
            if (this.dashboard) return false;
            if (textarea.get(0).selectionStart) {
                index = textarea.get(0).selectionStart;
            } else if (document.selection) {
                textarea.focus();
                let selection = document.selection.createRange();
                var selection_length = document.selection.createRange().text.length;
                selection.moveStart('character', -textarea.value.length);
                index = selection.text.length - selection_length;
            }
            textarea.val(textarea.val().substr(0, index) + text + textarea.val().substr(index));
            textarea.focus();
            textarea.manualExpandTextarea();
            chat_editor.sbActive(true);
        },

        enabledAutoExpand: function () {
            if (chat_textarea.length) chat_textarea.autoExpandTextarea();
        },

        // Privacy message
        privacy: function () {
            SBF.ajax({
                function: 'get-block-setting',
                value: 'privacy'
            }, (response) => {
                chat_scroll_area.append(`<div class="sb-privacy sb-init-form" data-decline="${response.decline}"><div class="sb-title">${response.title}</div><div class="sb-text">${response.message.replace(/\n/g, '<br>')}</div>` + (response.link ? `<a target="_blank" href="${response.link}">${response['link-name']}</a>` : '') + `<div class="sb-buttons"><a class="sb-btn sb-approve">${response['btn-approve']}</a><a class="sb-btn sb-decline">${response['btn-decline']}</a></div></div>`);
                this.finalizeInit();
                SBF.event('SBPrivacy');
            });
            if (!this.dashboard) {
                this.showDashboard();
            }
            this.dashboard = true;
            main.addClass('sb-init-form-active');
        },

        // Popup message 
        popup: function (close = false, content = false) {
            if (close) {
                let popup = main.find('.sb-popup-message');
                let id = popup.attr('data-id');
                storage('popup' + (SBF.null(id) ? '' : id), true);
                popup.remove();
                return;
            }
            setTimeout(() => {
                if (!this.chat_open) {
                    if (content == false) {
                        content = CHAT_SETTINGS.popup;
                    }
                    main.find('.sb-popup-message').remove();
                    main.append(`<div data-id="${content.id ? content.id : ''}" class="sb-popup-message">` + (content.image ? `<img loading="lazy" src="${content.image}" />` : '') + (content.title ? `<div class="sb-top">${content.title}</div>` : '') + `<div class="sb-text">${content.message}</div><div class="sb-icon-close"></div></div>`);
                    SBF.event('SBPopup', content);
                }
            }, 1000);
        },

        // Follow up message
        followUp: function () {
            if (this.followUpCheck()) {
                if (timeout) clearTimeout(timeout);
                timeout = setTimeout(() => {
                    if (this.followUpCheck()) {
                        SBF.ajax({
                            function: 'execute-bot-message',
                            conversation_id: this.conversation.id,
                            name: 'follow_up',
                            check: false
                        });
                        SBF.storageTime('email');
                        SBF.event('SBFollowUp');
                    }
                }, CHAT_SETTINGS.follow === true ? (CHAT_SETTINGS.office_hours || agents_online ? 15000 : 5000) : parseInt(CHAT_SETTINGS.follow));
            }
        },

        followUpCheck: function () {
            return !admin && this.conversation && CHAT_SETTINGS.follow && activeUser() && !activeUser().email && SBF.storageTime('email', 24);
        },

        // Welcome message
        welcome: function () {
            if (!tickets && (CHAT_SETTINGS.welcome_trigger != 'open' || this.chat_open) && (CHAT_SETTINGS.office_hours || !CHAT_SETTINGS.welcome_disable_office_hours) && CHAT_SETTINGS.welcome && !storage('welcome') && activeUser()) {
                SBF.ajax({
                    function: 'get-block-setting',
                    value: 'welcome'
                }, (response) => {
                    setTimeout(() => {
                        if (CHAT_SETTINGS.dialogflow_welcome) {
                            if (this.conversation === false) {
                                this.newConversation(3, -1, '', [], null, null, function () {
                                    SBApps.dialogflow.welcome(response.open, response.sound)
                                });
                            } else {
                                SBApps.dialogflow.welcome(response.open, response.sound);
                            }
                        } else {
                            this.sendMessage(bot_id, response.message, [], false, false, 3);
                            if (response.open && !mobile) {
                                this.start();
                            }
                            if (response.sound) {
                                this.audio.play();
                            }
                        }
                        this.skip = true;
                        SBF.event('SBWelcomeMessage');
                    }, parseInt(tickets ? 0 : CHAT_SETTINGS.welcome_delay));
                    storage('welcome', true);
                });
            }
        },

        // Subscribe message
        subscribe: function () {
            if (CHAT_SETTINGS.subscribe && !storage('subscribe') && activeUser() && SBF.null(activeUser().email) && activeUser()) {
                setTimeout(() => {
                    if (this.conversation.id) {
                        SBF.ajax({
                            function: 'execute-bot-message',
                            conversation_id: this.conversation.id,
                            name: 'subscribe',
                            check: false
                        }, (response) => {
                            if (response.settings.sound && this.audio) {
                                this.audio.play();
                            }
                            this.skip = true;
                            storage('subscribe', true);
                        });
                    }
                }, parseInt(CHAT_SETTINGS.subscribe_delay));
            }
        },

        // Offline timetable message
        offlineMessage: function () {
            if (!admin && CHAT_SETTINGS.timetable && (!CHAT_SETTINGS.office_hours || (!agents_online && !CHAT_SETTINGS.timetable_disable_agents))) {
                let message = CHAT_SETTINGS.timetable_message;
                switch (CHAT_SETTINGS.timetable_type) {
                    case 'header':
                        if (!this.offline_message_set) {
                            if (message[0]) chat_header.find('.sb-title').html(message[0]);
                            chat_header.find('.sb-text').html(message[1]);
                            this.offline_message_set = true;
                        }
                        break;
                    case 'info':
                        if (!this.offline_message_set) {
                            chat.prepend(`<div class="sb-notify-message sb-rich-cnt"><div class="sb-cnt"><div class="sb-message">${message[0] ? `<b>${message[0]}</b> ` : ''}${message[1]}</div></div></div>`);
                            main.addClass('sb-notify-active');
                            this.offline_message_set = true;
                        }
                        break;
                    default:
                        setTimeout(() => {
                            if (this.conversation) {
                                let offline_message = CHAT_SETTINGS.timetable_hide ? `${message[0] ? `*${message[0]}*\n` : ''}${message[1]}` : '[timetable]';
                                let offline_message_sent = this.conversation.searchMessages(offline_message, true);
                                offline_message_sent = offline_message_sent.length ? offline_message_sent : false;
                                if (offline_message_sent) {
                                    let last_agent_message = this.conversation.getLastUserMessage(false, true);
                                    offline_message_sent = !last_agent_message || last_agent_message.get('index') < offline_message_sent[offline_message_sent.length - 1].get('index');
                                }
                                if (!offline_message_sent) {
                                    this.sendMessage(bot_id, offline_message);
                                }
                            }
                        }, 5000);
                }
            }
        },

        // Send Slack message
        slackMessage: function (user_id, full_name, profile_image, message, attachments = []) {
            if (!this.conversation || (!message && !attachments.length)) return false;
            let conversation_id = this.conversation.id;
            SBF.ajax({
                function: 'send-slack-message',
                user_id: user_id,
                full_name: full_name,
                profile_image: profile_image,
                conversation_id: conversation_id,
                message: message,
                attachments: attachments,
                channel: this.slack_channel[0] == activeUser().id ? this.slack_channel[1] : false
            }, (response) => {
                this.slack_channel = [activeUser().id, response[1]];
                SBF.event('SBSlackMessageSent', { message: message, conversation_id: conversation_id, slack_channel: response[1] });
            });
        },

        // Delete message
        deleteMessage: function (message_id) {
            SBF.ajax({
                function: 'delete-message',
                message_id: message_id
            }, () => {
                if (this.conversation) this.conversation.deleteMessage(message_id);
                chat.find(`[data-id="${message_id}"]`).remove();
                SBF.event('SBMessageDeleted', message_id);
            });
        },

        // Registration form
        registration: function (check = false, type = CHAT_SETTINGS.registration_required) {
            if (check) {
                return CHAT_SETTINGS.registration_required && (!CHAT_SETTINGS.registration_offline || !agents_online) && (!CHAT_SETTINGS.registration_timetable || !CHAT_SETTINGS.office_hours) && (activeUser() === false || ['visitor', 'lead'].includes(activeUser().type));
            }
            chat_scroll_area.append(SBRichMessages.generate({}, CHAT_SETTINGS.registration_link || (CHAT_SETTINGS.registration_required == 'registration' && CHAT_SETTINGS.registration_password) ? 'login' : type, 'sb-init-form'));
            if (!this.dashboard) {
                this.showDashboard();
            }
            this.dashboard = true;
            this.finalizeInit();
            main.addClass('sb-init-form-active');
        },

        // Shortcut for add user and login function
        addUserAndLogin: function (onSuccess = false, lead = false) {
            let settings = typeof SB_DEFAULT_USER != ND && SB_DEFAULT_USER ? SB_DEFAULT_USER : {};
            settings.user_type = lead ? 'lead' : 'visitor';
            SBF.ajax({
                function: 'add-user-and-login',
                settings: settings,
                settings_extra: settings.extra
            }, (response) => {
                SBF.loginCookie(response[1]);
                activeUser(new SBUser(response[0]));
                SBPusher.start();
                if (!SBPusher.active) {
                    SBChat.automations.runAll();
                }
                if (onSuccess) {
                    onSuccess(response);
                }
            });
        },

        // Check if the dashboard must be showed
        isInitDashboard: function () {
            return CHAT_SETTINGS.init_dashboard || (activeUser() && activeUser().conversations.length > 1);
        },

        // Upload response
        uploadResponse: function (response) {
            response = JSON.parse(response);
            if (response[0] == 'success') {
                if (response[1] == 'extension_error') {
                    let message = 'The file you are trying to upload has an extension that is not allowed.';
                    if (admin) {
                        SBAdmin.infoPanel(message, 'info');
                    } else {
                        alert(message);
                    }
                } else if ($(upload_target).hasClass('sb-input-image')) {
                    let image = $(upload_target).find('.image');
                    if (image.attr('data-value')) {
                        SBF.ajax({ function: 'delete-file', path: image.attr('data-value') });
                    }
                    image.attr('data-value', '').css('background-image', '');
                    setTimeout(() => {
                        image.attr('data-value', response[1]).css('background-image', `url("${response[1]}?v=${SBF.random()}")`).append('<i class="sb-icon-close"></i>');
                        upload_target = false;
                    }, 500);
                } else {
                    let name = response[1].substr(response[1].lastIndexOf('/') + 1);
                    chat_editor.find('.sb-attachments').append(`<div data-name="${name}" data-value="${response[1]}"${response.length > 2 ? ' data-size="' + response[2][0] + '|' + response[2][1] + '"' : ''}>${name}<i class="sb-icon-close"></i></div>`);
                    chat_editor.sbActive(true);
                }
            } else {
                SBF.error(response[1], 'sb-upload-files.change');
            }
            this.busy(false);
        },

        // Archive a conversation and close it
        closeChat: function (update_conversation_status = true) {
            let id = this.conversation.id;
            SBChat.clear();
            if (update_conversation_status) {
                SBF.ajax({
                    function: 'update-conversation-status',
                    conversation_id: id,
                    status_code: 3
                }, () => {
                    close();
                });
            } else {
                close();
            }
            function close() {
                main.find(`li[data-conversation-id="${id}"]`).remove();
                force_action = 'new-conversation';
                SBChat.clear();
                storage('open-conversation', '');
                storage('welcome', '');
                activeUser().removeConversation(id);
                if (!CHAT_SETTINGS.disable_dashboard) {
                    SBChat.showDashboard();
                }
            }
        },

        // Automations
        automations: {
            history: [],
            busy: [],
            scroll_position_intervals: {},
            timeout_queue: [],

            runAll: function () {
                let automations = CHAT_SETTINGS.automations;
                for (var i = 0; i < automations.length; i++) {
                    let automation = automations[i];
                    let conditions = automation.conditions;
                    let count = conditions.length;
                    let valid = count == 0;
                    let browsing_time = false;
                    let scroll_position = false;
                    let server_conditions = false;
                    for (var j = 0; j < conditions.length; j++) {
                        let criteria = conditions[j][1];
                        valid = false;
                        switch (conditions[j][0]) {
                            case 'browsing_time':
                                valid = true;
                                browsing_time = criteria;
                                break;
                            case 'scroll_position':
                                valid = true;
                                scroll_position = criteria;
                                break;
                            case 'include_urls':
                            case 'exclude_urls':
                            case 'referring':
                                let url = conditions[j][0] == 'referring' ? document.referrer : window.location.href;
                                let checks = conditions[j][2].split(',');
                                let include = conditions[j][0] != 'exclude_urls';
                                if (!include) valid = true;
                                url = url.replace('https://', '').replace('http://', '').replace('www.', '');
                                for (var y = 0; y < checks.length; y++) {
                                    checks[y] = $.trim(checks[y].replace('https://', '').replace('http://', '').replace('www.', ''));
                                    if ((criteria == 'contains' && url.indexOf(checks[y]) != -1) || (criteria == 'does-not-contain' && url.indexOf(checks[y]) == -1) || (criteria == 'is-exactly' && checks[y] == url) || (criteria == 'is-not' && checks[y] != url)) {
                                        valid = include;
                                        break;
                                    }
                                }
                                break;
                            case 'custom_variable':
                                let variable = criteria.split('=');
                                if (variable[0] in window && window[variable[0]] == variable[1]) {
                                    valid = true;
                                }
                                break;
                            case 'returning_visitor':
                            case 'user_type':
                            case 'cities':
                            case 'languages':
                            case 'countries':
                                valid = activeUser();
                                server_conditions = true;
                                break;
                            case 'user_phone':
                                valid = activeUser() && !SBF.null(activeUser().getExtra('phone'));
                                break;
                            case 'user_email':
                                valid = activeUser() && !SBF.null(activeUser().email);
                                break;
                            default:
                                valid = true;
                        }
                        if (!valid) break;
                    }
                    if (['messages', 'emails', 'sms'].includes(automation.type) && !activeUser()) {
                        valid = false;
                    }
                    if (valid) {
                        if (server_conditions) {
                            if (!(automation.id in this.busy)) {
                                SBF.ajax({
                                    function: 'automations-validate',
                                    automation: automation
                                }, (response) => {
                                    if (response !== false) {
                                        this.runAll_final(automation, scroll_position, browsing_time);
                                    }
                                    delete this.busy[automation.id];
                                });
                                this.busy[automation.id] = true;
                            }
                        } else {
                            this.runAll_final(automation, scroll_position, browsing_time);
                        }
                    }
                }
            },

            runAll_final: function (automation, scroll_position, browsing_time) {
                if (scroll_position) {
                    this.scroll_position_intervals[automation.id] = setInterval(() => {
                        if ($(window).scrollTop() > parseInt(scroll_position)) {
                            if (browsing_time) {
                                setTimeout(() => { this.run(automation) }, parseInt(browsing_time) * 1000);
                            } else {
                                this.run(automation);
                            }
                            clearInterval(this.scroll_position_intervals[automation.id]);
                        }
                    }, 1000);
                } else if (browsing_time) {
                    if (!this.timeout_queue.includes(automation.id)) {
                        setTimeout(() => { this.run(automation) }, parseInt(browsing_time) * 1000);
                        this.timeout_queue.push(automation.id);
                    }
                } else this.run(automation);
            },

            run: function (automation) {
                if (this.history.includes(automation.id)) return;
                switch (automation.type) {
                    case 'messages':
                    case 'emails':
                    case 'sms':
                        if ((!SBPusher.active || SBPusher.started) && !(automation.id in this.busy)) {
                            if (automation.type == 'messages' && SBChat.chat_open) {
                                let last_message = SBChat.conversation ? SBChat.conversation.getLastUserMessage(false, 'no-bot') : false;
                                if (last_message && ((Date.now() - 600000) < SBF.unix(last_message.get('creation_time')))) return;
                            }
                            SBF.ajax({
                                function: 'automations-run',
                                automation: automation
                            }, (response) => {
                                if (response !== false) {
                                    this.history.push(automation.id);
                                    if (automation.type == 'messages' && !SBPusher.active) SBChat.updateConversations();
                                }
                                delete this.busy[automation.id];
                            });
                            this.busy[automation.id] = true;
                        }
                        break;
                    case 'popups':
                        if (!storage('popup' + automation.id)) {
                            setTimeout(() => {
                                if (!SBChat.chat_open) {
                                    SBChat.popup(false, { id: automation.id, image: automation.profile_image, title: automation.title, message: automation.message });
                                    this.history.push(automation.id);
                                } else if (automation.fallback) {
                                    let last_message = SBChat.conversation ? SBChat.conversation.getLastUserMessage(false, 'no-bot') : false;
                                    if (!last_message || ((Date.now() - 600000) > SBF.unix(last_message.get('creation_time')))) {
                                        SBChat.sendMessage(bot_id, (SBF.null(automation.title) ? '' : `*${automation.title}*\n`) + automation.message, [], false, false, 0);
                                        storage('popup' + automation.id, true);
                                        this.history.push(automation.id);
                                    }
                                }
                            }, 1000);
                        }
                        break;
                    case 'design':
                        if (automation.background) {
                            chat_header.css('background-image', `url("${automation.background}")`);
                        }
                        if (automation.brand) {
                            chat_header.find('.sb-brand img').attr('src', automation.brand);
                        }
                        if (automation.title) {
                            chat_header.find('.sb-title').html(automation.title);
                        }
                        if (automation.message) {
                            chat_header.find('.sb-text').html(automation.message);
                        }
                        if (automation.icon) {
                            main.find('.sb-chat-btn .sb-icon').attr('src', automation.icon);
                        }
                        if (automation.color_1 || automation.color_2 || automation.color_3) {
                            SBF.ajax({ function: 'chat-css', color_1: automation.color_1, color_2: automation.color_2, color_3: automation.color_3 }, (response) => {
                                global.append(`<style>${response}</style>`);
                            });
                        }
                        this.history.push(automation.id);
                        break;
                    case 'more':
                        let parameters = {};
                        if (automation.department) {
                            SBChat.default_department = automation.department;
                            parameters = { function: 'update-conversation-department', department: automation.department };
                        }
                        if (automation.agent) {
                            SBChat.default_agent = automation.agent;
                            parameters = { function: 'update-conversation-agent', agent_id: automation.agent };
                        }
                        if (automation.tags) {
                            automation.tags = automation.tags.split(',');
                            SBChat.default_tags = automation.tags;
                            parameters = { function: 'update-tags', tags: automation.tags, add: true };
                        }
                        if (SBChat.conversation.id && (automation.tags || automation.agent || automation.department)) {
                            parameters.conversation_id = SBChat.conversation.id
                            SBF.ajax(parameters);
                        }
                        if (automation.articles || automation.articles_category) {
                            let articles_dashboard = main.find('.sb-dashboard-articles > .sb-articles');
                            SBChat.articles_allowed_ids = automation.articles;
                            SBChat.articles_category = automation.articles_category;
                            if (articles_dashboard) {
                                SBChat.getArticles(automation.articles, (response) => {
                                    let code = '';
                                    for (var i = 0; i < 2; i++) {
                                        code += `<div data-id="${response[i].id}"><div>${response[i].title}</div><span>${response[i].content}</span></div>`;
                                    }
                                    articles_dashboard.html(code);
                                }, automation.articles_category, 2);
                            }
                        }
                        this.history.push(automation.id);
                        break;
                }
            }
        },

        // More
        flashNotification: function () {
            clearInterval(interval);
            interval = setInterval(function () {
                if (SBChat.notifications.length) {
                    document.title = document.title == document_title ? '(' + SBChat.notifications.length + ') ' + sb_('New message' + (SBChat.notifications.length > 1 ? 's' : '')) : document_title;
                }
            }, 2000);
        },

        calculateLabelDates: function () {
            if (admin || this.chat_open) {
                label_date_items = chat.find('.sb-label-date');
            }
        },

        calculateLabelDateFirst: function () {
            if (!this.conversation.messages.length) {
                chat.append(`<div class="sb-label-date"><span>${sb_('Today')}</span></div>`);
            }
        },

        playSound: function (repeat = false) {
            this.audio.play();
            let index = repeat ? repeat : (admin ? SB_ADMIN_SETTINGS.sound.repeat : CHAT_SETTINGS.sound.repeat);
            if (index && !this.tab_active) {
                clearInterval(this.audio_interval);
                this.audio_interval = setInterval(() => {
                    this.audio.play();
                    index--;
                    if (!index) {
                        clearInterval(this.audio_interval);
                    }
                }, this.audio.duration * 1000 + 1500);
            }
        },

        isConversationAllowed: function (source, status_code) {
            return (!CHAT_SETTINGS.tickets_hide || (tickets && source == 'tk') || (!tickets && source != 'tk')) && (![3, 4, '3', '4'].includes(status_code) || ((!tickets && !CHAT_SETTINGS.close_chat) || (tickets && !CHAT_SETTINGS.tickets_close)));
        }
    }
    window.SBChat = SBChat;

    /* 
    * ----------------------------------------------------------
    * RICH MESSAGES
    * ----------------------------------------------------------
    */

    var SBRichMessages = {
        rich_messsages: {
            'email': '',
            'button': '',
            'video': '',
            'image': '',
            'woocommerce-button': '',
            'chips': '<div class="sb-buttons">[options]</div>',
            'buttons': '<div class="sb-buttons">[options]</div>',
            'select': '<div class="sb-select"><p></p><ul>[options]</ul></div>',
            'list': '<div class="sb-text-list">[values]</div>',
            'list-image': '<div class="sb-image-list">[values]</div>',
            'table': '<table><tbody>[header][values]</tbody></table>',
            'inputs': '<div class="sb-form">[values]</div>',
            'rating': `<div class="sb-rating" data-success-negative="[success-negative]"><span>[label]</span><div><i data-rating="positive" class="sb-submit sb-icon-like"><span>[positive]</span></i><i data-rating="negative" class="sb-submit sb-icon-dislike"><span>[negative]</span></i></div></div>`,
            'card': '<div class="sb-card">[settings]</div>',
            'share': '<div class="sb-social-buttons">[settings]</div>',
            'slider': '<div class="sb-slider"><div>[items]</div></div><div class="sb-slider-arrow sb-icon-arrow-left[class]"></div><div class="sb-slider-arrow sb-icon-arrow-right sb-active[class]"></div>',
            'slider-images': '<div class="sb-slider sb-slider-images"><div>[items]</div></div><div class="sb-slider-arrow sb-icon-arrow-left[class]"></div><div class="sb-slider-arrow sb-icon-arrow-right sb-active[class]"></div>',
            'phone': ''
        },
        cache: {},

        // Generate a rich message
        generate: function (settings, name, css = '') {
            let content;
            let next = true;
            let id = settings.id ? settings.id : SBF.random();
            let render = new SBMessage({});

            // Check if the rich message exist
            if (name in this.rich_messsages) {
                content = this.rich_messsages[name];
            } else if (name in this.cache) {
                content = this.cache[name];
            } else if ((admin && SB_ADMIN_SETTINGS.rich_messages.includes(name)) || (!admin && CHAT_SETTINGS.rich_messages.includes(name))) {
                if (!settings.id) {
                    id = name;
                }
                content = '<div class="sb-rich-loading sb-loading"></div>';
                SBF.ajax({
                    function: 'get-rich-message',
                    name: name,
                    settings: settings
                }, (response) => {
                    response = this.initInputs(response);
                    if (name == 'timetable') {
                        response = this.timetable(response);
                    }
                    main.find(`.sb-rich-message[id="${id}"]`).html(`<div class="sb-content">${response}</div>`);
                    this.cache[name] = response;
                    SBChat.scrollBottom(SBChat.dashboard);
                    SBF.event('SBRichMessageShown', { name: name, settings: settings, response: response });
                });
                next = false;
            } else {
                return false;
            }

            // Generate the rich message
            let disabled = settings.disabled;
            if (next) {
                let options;
                let code = '';
                switch (name) {
                    case 'rating':
                        content = content.replace('[label]', sb_(settings.label ? settings.label : 'Rate and review')).replace('[success-negative]', sb_(SBF.null(settings['success-negative']) ? 'Not helpful' : settings['success-negative'])).replace('[positive]', sb_(SBF.null(settings['label-positive']) ? 'Helpful' : settings['label-positive'])).replace('[negative]', sb_(SBF.null(settings['label-negative']) ? 'Not helpful' : settings['label-negative']));
                        break;
                    case 'email':
                        let inputs = [];
                        let email = activeUser().email;
                        let default_name = activeUser().get('last_name').charAt(0) == '#';
                        if (settings['name'] == 'true') {
                            inputs.push(['first_name', settings['last-name'] == 'true' ? 'First name' : 'Name', default_name ? '' : (settings['last-name'] == 'true' ? activeUser().get('first_name') : activeUser().name), 'text', true]);
                        }
                        if (settings['last-name'] == 'true') {
                            inputs.push(['last_name', 'Last name', default_name ? '' : activeUser().get('last_name'), 'text', true]);
                        }
                        for (var i = 0; i < inputs.length; i++) {
                            content += `<div id="${inputs[i][0]}" data-type="text" class="sb-input sb-input-text"><span class="${inputs[i][2] ? 'sb-active sb-filled' : ''}">${sb_(inputs[i][1])}</span><input value="${inputs[i][2]}" autocomplete="false" type="${inputs[i][3]}" ${inputs[i][4] ? 'required' : ''}></div>`;
                        }
                        if (settings['phone'] == 'true') {
                            let phone = activeUser().getExtra('phone');
                            let phone_codes = admin ? [] : CHAT_SETTINGS.phone_codes;
                            let select = '';
                            let single = phone_codes.length === 1;
                            if (single) {
                                select = `<input disabled value="${phone_codes[0]}">`;
                            } else {
                                for (var i = 0; i < phone_codes.length; i++) {
                                    select += `<option value="+${phone_codes[i]}">+${phone_codes[i]}</option>`;
                                }
                                select = `<select><option value="">+00</option>${select}</select>`;
                            }
                            content += `<div id="phone" data-type="select-input" class="sb-input sb-input-select-input"><span class="${phone ? 'sb-active sb-filled' : ''}">${sb_('Phone')}</span><div>${select}</div><input value="${admin ? '' : phone}" autocomplete="false" type="number" ${settings['phone-required'] != 'false' ? 'required' : ''}></div>`;
                        }
                        content += `<div id="email" data-type="email" class="sb-input sb-input-btn"><span class="${email ? 'sb-active sb-filled' : ''}">${sb_(SBF.null(settings.placeholder) ? 'Email' : settings.placeholder)}</span><input value="${email}" autocomplete="off" type="email" required><div class="sb-submit sb-icon-arrow-right"></div></div>`;
                        break;
                    case 'image':
                        content = `<div class="sb-image"><img loading="lazy" src="${settings.url}"></div>`;
                        break;
                    case 'video':
                        content = `<iframe loading="lazy"${settings.height ? ` height="${settings.height}"` : ''} src="${settings.type == 'youtube' ? '//www.youtube.com/embed/' : '//player.vimeo.com/video/'}${settings.id}" allowfullscreen></iframe>`;
                        break;
                    case 'select':
                        options = settings && settings.options ? settings.options.replace(/\\,/g, '{R}').split(',') : [];
                        for (var i = 0; i < options.length; i++) {
                            let item = options[i].replace(/{R}/g, ',');
                            code += `<li data-value="${SBF.stringToSlug(item)}">${sb_(item)}</li>`;
                        }
                        content = content.replace('[options]', code);
                        break;
                    case 'chips':
                    case 'buttons':
                        options = settings && settings.options ? settings.options.replace(/\\,/g, '{R}').split(',') : [];
                        for (var i = 0; i < options.length; i++) {
                            code += `<div class="sb-btn sb-submit">${sb_(options[i].replace(/{R}/g, ','))}</div>`;
                        }
                        content = content.replace('[options]', code);
                        break;
                    case 'button':
                        let action_link = settings.link.includes('calendly.com');
                        content = `<a ${action_link ? 'data-action="calendly" data-extra="' + settings.link + '|' + (settings.success ? settings.success.replaceAll('"', '\'') : '') + '" ' : ''}href="${action_link ? '#' : settings.link.replace(/<i>/g, '_').replace(/<\/i>/g, '_')}"${settings.target && !action_link ? ' target="_blank"' : ''} class="sb-rich-btn sb-btn${settings.style == 'link' ? '-text' : ''}">${sb_(settings.name)}</a>`;
                        break;
                    case 'list':
                        if (settings.values) {
                            options = settings.values.replace(/\\,/g, '{R}').split(',');
                            let list = name == 'list';
                            let list_double = list && options.length && options[0].indexOf(':') > 0;
                            if (list && !list_double) {
                                content = content.replace('sb-text-list', 'sb-text-list sb-text-list-single');
                            }
                            for (var i = 0; i < options.length; i++) {
                                let item = options[i].replace(/{R}/g, ',');
                                code += list_double ? `<div><div>${sb_(item.split(':')[0])}</div><div>${sb_(item.split(':')[1])}</div></div>` : `<div>${$.trim(sb_(item))}</div>`;
                            }
                            content = content.replace('[values]', code);
                        }
                        break;
                    case 'list-image':
                        if (settings.values) {
                            options = settings.values.split(',');
                            for (var i = 0; i < options.length; i++) {
                                let item = options[i].replace('://', '///').split(':');
                                code += `<div><div class="sb-thumb" style="background-image:url('${item[0].replace('///', '://')}')"></div><div class="sb-list-title">${item[1]}</div><div>${item[2]}</div></div>`;
                            }
                            content = content.replace('[values]', code);
                        }
                        break;
                    case 'table':
                        if (settings.values) {
                            options = settings.header.split(',');
                            code += '<tr>';
                            for (var i = 0; i < options.length; i++) {
                                code += `<th>${options[i]}</th>`;
                            }
                            code += '</tr>';
                            content = content.replace('[header]', code);
                            code = '';
                            options = settings.values.split(',');
                            for (var i = 0; i < options.length; i++) {
                                let tds = options[i].split(':');
                                code += '<tr>';
                                for (var i = 0; i < tds.length; i++) {
                                    code += `<td>${tds[i]}</td>`;
                                }
                                code += '</tr>';
                            }
                            content = content.replace('[values]', code);
                        }
                        break;
                    case 'inputs':
                        if (settings.values) {
                            options = settings.values.split(',');
                            for (var i = 0; i < options.length; i++) {
                                if (disabled && !options[i]) continue;
                                code += `<div id="${SBF.stringToSlug(options[i])}" data-type="text" class="sb-input sb-input-text"><span>${sb_(options[i])}</span><input autocomplete="false" type="text" required></div>`;
                            }
                            code += '<div class="sb-btn sb-submit">' + sb_(settings.button ? settings.button : 'Send now') + '</div>';
                            content = content.replace('[values]', code);
                        }
                        break;
                    case 'card':
                        code = `${settings.image ? `<div class="sb-card-img" style="background-image:url('${settings.image}')"></div>` : ''}<div class="sb-card-header">${settings.header}</div>${settings.extra ? `<div class="sb-card-extra">${settings.extra}</div>` : ''}${settings.description ? `<div class="sb-card-description">${settings.description}</div>` : ''}${settings.link ? `<a class="sb-card-btn" href="${settings.link}"${settings.target ? ' target="_blank"' : ''}>${sb_(settings['link-text'])}</a>` : ''}`;
                        content = content.replace('[settings]', code);
                        break;
                    case 'share':
                        let channels = settings.channels ? settings.channels.replace(/ /g, '').split(',') : ['fb', 'tw', 'li', 'wa', 'pi'];
                        let link = '';
                        for (var i = 0; i < channels.length; i++) {
                            switch (channels[i]) {
                                case 'fb':
                                    link = 'www.facebook.com/sharer.php?u=';
                                    break;
                                case 'tw':
                                    link = 'twitter.com/intent/tweet?url=';
                                    break;
                                case 'li':
                                    link = 'www.linkedin.com/sharing/share-offsite/?url=';
                                    break;
                                case 'wa':
                                    link = 'web.whatsapp.com/send?text=';
                                    break;
                                case 'pi':
                                    link = 'www.pinterest.com/pin/create/button/?url=';
                                    break;
                            }
                            code += `<div class="sb-${channels[i]} sb-icon-social-${channels[i]}" data-link="https://${link}${settings.link}"></div>`;
                        }
                        content = content.replace('[settings]', code);
                        break;
                    case 'slider':
                        let count = 0;
                        for (var i = 1; i < 16; i++) {
                            if (('header-' + i) in settings) {
                                code += `<div>${('image-' + i) in settings ? `<div class="sb-card-img" style="background-image:url('${settings['image-' + i]}')"></div>` : ''}<div class="sb-card-header">${settings['header-' + i]}</div>${('extra-' + i) in settings ? `<div class="sb-card-extra">${settings['extra-' + i]}</div>` : ''}${('description-' + i) in settings ? `<div class="sb-card-description">${settings['description-' + i]}</div>` : ''}${('link-' + i) in settings ? `<a class="sb-card-btn" href="${settings['link-' + i]}"${settings.target ? ' target="_blank"' : ''}>${sb_(settings['link-text-' + i])}</a>` : ''}</div>`;
                                count++;
                            } else {
                                break;
                            }
                        }
                        content = content.replace('[items]', code).replace(/\[class\]/g, count == 1 ? ' sb-hide' : '');
                        break;
                    case 'slider-images':
                        if (settings.images) {
                            let images = settings.images.split(',');
                            for (var i = 0; i < images.length; i++) {
                                code += `<div class="sb-card-img" data-value="${images[i]}" style="background-image:url('${images[i]}')"></div>`;
                            }
                            content = content.replace(/\[class\]/g, images.length == 1 ? ' sb-hide' : '');
                        }
                        content = content.replace('[items]', code);
                        break;
                    case 'woocommerce-button':
                        settings.settings = `checkout:${settings.checkout},coupon:${settings.coupon}`;
                        content = `<a href="#" data-ids="${settings.ids}" class="sb-rich-btn sb-btn">${settings.name}</a>`;
                        break;
                }
            }
            return `<div id="${id}" data-type="${name}"${disabled ? 'disabled="true"' : ''}${settings.settings ? ` data-settings="${settings.settings}"` : ''}class="sb-rich-message sb-rich-${name} ${css}">` + (settings.title ? `<div class="sb-top">${render.render(sb_(settings.title))}</div>` : '') + (settings.message ? `<div class="sb-text">${render.render(sb_(settings.message))}</div>` : '') + `<div class="sb-content">${content}</div><div data-success="${settings.success ? settings.success.replace(/"/g, '') : ''}" class="sb-info"></div></div>`;
        },

        // Function of built-in rich messages
        submit: function (area, type, element) {
            if (!admin && !loading(element) && !this.is_busy) {
                let error = '';
                let shortcode = '';
                let parameters = {};
                let success = $(area).find('[data-success]').length ? $(area).find('[data-success]').attr('data-success') : '';
                let rich_message_id = $(area).closest('.sb-rich-message').attr('id');
                let message_id = $(area).closest('[data-id]').attr('data-id');
                let message = '';
                let payload = { 'rich-messages': {} };
                let user_settings = activeUser() == false ? { 'profile_image': ['', ''], 'first_name': ['', ''], 'last_name': ['', ''], 'email': ['', ''], 'password': ['', ''], 'user_type': ['', ''] } : { 'profile_image': [activeUser().image, ''], 'first_name': [activeUser().get('first_name'), ''], 'last_name': [activeUser().get('last_name'), ''], 'email': [activeUser().email, ''], 'password': ['', ''], 'user_type': ['', ''] };
                let settings = {};
                let input = $(element);
                let dialogflow_response = '';
                let dialogflow_parameters = false;
                let active_conversation = SBChat.conversation !== false;
                let settings_extra = {};
                let payload_settings = {};
                if (SBF.null(message_id)) {
                    message_id = -1;
                } else {
                    let item = SBChat.conversation.getMessage(message_id);
                    message = item.message;
                    payload = item.payload();
                    if (!payload['rich-messages']) {
                        payload['rich-messages'] = {};
                    }
                }
                if (!$(element).hasClass('sb-btn') && !$(element).hasClass('sb-select') && !$(element).hasClass('sb-submit')) {
                    input = $(element).closest('.sb-btn,.sb-select');
                }
                $(area).find('.sb-info').html('').sbActive(false);
                switch (type) {
                    case 'email':
                        settings = SBForm.getAll(area);
                        if (settings.first_name) {
                            user_settings.user_type = ['user', ''];
                            if (!settings.last_name) {
                                user_settings.last_name = ['', ''];
                            }
                        }
                        if (settings.phone) {
                            settings_extra = { 'phone': [settings.phone[0], 'Phone'] };
                        }
                        $.extend(user_settings, settings);
                        error = 'Please fill in all required fields and make sure the email is valid.';
                        if (success) {
                            success = sb_(success).replace('{user_email}', user_settings.email[0]).replace('{user_name_}', user_settings.first_name[0] + (settings.last_name ? (' ' + user_settings.last_name[0]) : ''));
                        }
                        payload['rich-messages'][rich_message_id] = { type: type, result: settings };
                        payload['event'] = 'update-user';
                        parameters = { function: 'update-user-and-message', settings: user_settings, settings_extra: settings_extra, payload: payload };
                        dialogflow_parameters = { settings: user_settings, settings_extra: settings_extra };
                        break;
                    case 'registration':
                        settings_extra = SBForm.getAll(area.find('.sb-form-extra'));
                        $.extend(user_settings, SBForm.getAll(area.find('.sb-form-main')));
                        payload_settings = $.extend({}, user_settings);
                        if (success) {
                            success = sb_(success);
                        }
                        if (CHAT_SETTINGS.registration_details) {
                            success += '[list values="';
                            for (var key in user_settings) {
                                let value = user_settings[key][0].replace(/:|,/g, '');
                                if (value) {
                                    if (key == 'profile_image') {
                                        value = value.substr(value.lastIndexOf('/') + 1);
                                    }
                                    if (['password', 'password-check', 'envato-purchase-code'].includes(key)) {
                                        value = '********';
                                        payload_settings[key] = '********';
                                    }
                                    success += user_settings[key][1] ? `${sb_(user_settings[key][1].replace(/:|,/g, ''))}:${value},` : '';
                                }
                            }
                            for (var key in settings_extra) {
                                if (settings_extra[key][0]) {
                                    success += `${sb_(settings_extra[key][1].replace(/:|,/g, ''))}:${settings_extra[key][0].replace(/:|,/g, '')},`;
                                }
                            }
                            success = success.slice(0, -1) + '"]';
                        }
                        user_settings['user_type'] = ['user', ''];
                        payload['rich-messages'][rich_message_id] = { type: type, result: { user: payload_settings, extra: settings_extra } };
                        payload['event'] = 'update-user';
                        parameters = { function: activeUser() ? 'update-user-and-message' : 'add-user-and-login', settings: user_settings, settings_extra: settings_extra, payload: payload };
                        error = SBForm.getRegistrationErrorMessage(area);
                        dialogflow_parameters = { settings: user_settings, settings_extra: settings_extra };
                        break;
                    case 'rating':
                        let rating = $(element).attr('data-rating');
                        let agent = SBChat.conversation.getLastUserMessage(false, true);
                        success = sb_(rating == 'positive' ? (success ? success : sb_('Helpful')) : $(element).closest('.sb-rating').attr('data-success-negative'));
                        settings = { conversation_id: SBChat.conversation.id, agent_id: agent ? agent.get('user_id') : bot_id, user_id: activeUser().id, message: area.find('textarea').val(), rating: (rating == 'positive' ? 1 : -1) };
                        payload['rich-messages'][rich_message_id] = { type: type, result: settings };
                        parameters = { function: 'set-rating', payload: payload, settings: settings };
                        dialogflow_response = rating;
                        break;
                    case 'chips':
                    case 'select':
                    case 'buttons':
                        settings = SBF.escape($(element).html());
                        if (success) success = sb_(success) + ` *${settings}*`;
                        payload['rich-messages'][rich_message_id] = { type: type, result: settings };
                        parameters = { function: 'update-message', payload: payload };
                        dialogflow_response = settings;
                        if (type == 'chips') {
                            SBChat.sendMessage(activeUser().id, settings, [], false, { id: rich_message_id, event: 'chips-click', result: settings }, rich_message_id == 'sb-human-takeover' && input.index() == 0 ? 2 : false);
                            if (rich_message_id == 'sb-human-takeover' && $(element).index() == 0) {
                                SBApps.dialogflow.humanTakeover();
                            }
                            $(element).closest('.sb-content').remove();
                        }
                        break;
                    case 'inputs':
                        settings = SBForm.getAll(area);
                        error = 'All fields are required.';
                        if (success) {
                            success = sb_(success) + ' [list values="';
                            for (var key in settings) {
                                success += `${sb_(settings[key][1].replace(/:|,/g, ''))}:${settings[key][0].replace(/:|,/g, '')},`;
                            }
                            success = success.slice(0, -1) + '"]';
                        }
                        payload['rich-messages'][rich_message_id] = { type: type, result: settings };
                        parameters = { function: 'update-message', payload: payload };
                        dialogflow_parameters = { settings: settings };
                        break;
                }
                shortcode = message.substr(message.indexOf('[' + type))
                shortcode = shortcode.substr(0, shortcode.indexOf(']') + 1);
                if (error && SBForm.errors(area)) {
                    SBForm.showErrorMessage(area, error);
                    input.sbLoading(false);
                    if (SBChat.dashboard || (active_conversation && SBChat.conversation.getLastMessage().id == message_id)) {
                        SBChat.scrollBottom();
                    }
                    return false;
                }
                if (!success && type != 'registration') {
                    let shortcode_settings = this.shortcode(shortcode);
                    let title = shortcode_settings[1].title ? `title="${shortcode_settings[1].title}"` : '';
                    let message = shortcode_settings[1].message ? `message="${shortcode_settings[1].message}"` : '';
                    let value = '';
                    if (['inputs', 'email'].includes(type)) {
                        for (var key in settings) {
                            value += settings[key][0] + ',';
                        }
                        value = `values="${value.slice(0, -1)}"`
                    } else {
                        value = `options="${settings}"`;
                    }
                    success = `[${type == 'email' ? 'inputs' : type} ${title} ${message} ${value} disabled="true"]`;
                }
                if (message_id != -1) {
                    success = success.replace(/<br>/g, '\n');
                    $.extend(parameters, {
                        message_id: message_id,
                        message: message ? message.replace(shortcode, success) : success,
                        payload: payload
                    });
                }
                SBF.ajax(parameters, (response) => {
                    if (response && !SBF.errorValidation(response)) {
                        switch (type) {
                            case 'email':
                                for (var key in user_settings) {
                                    activeUser().set(key, user_settings[key][0]);
                                }
                                for (var key in settings_extra) {
                                    activeUser().setExtra(key, settings_extra[key][0]);
                                }
                                SBF.loginCookie(response[1]);
                                if (rich_message_id == 'sb-subscribe-form') {
                                    SBF.ajax({
                                        function: 'subscribe-email',
                                        email: activeUser().email
                                    });
                                }
                                SBChat.automations.runAll();
                                SBF.event('SBNewEmailAddress', { id: rich_message_id, name: activeUser().name, email: activeUser().email });
                                break;
                            case 'registration':
                                SBF.loginCookie(response[1]);
                                user_settings.id = [response[0].id];
                                if (!activeUser()) {
                                    activeUser(new SBUser(response[0]));
                                    for (var key in settings_extra) {
                                        activeUser().setExtra(key, settings_extra[key][0]);
                                    }
                                    SBPusher.start();
                                    SBChat.initChat();
                                    if ((!CHAT_SETTINGS.init_dashboard || !main.find('.sb-departments-list').length) && success) {
                                        SBChat.sendMessage(bot_id, success, [], false, false, 3);
                                    }
                                } else {
                                    for (var key in user_settings) {
                                        activeUser().set(key, user_settings[key][0]);
                                    }
                                    for (var key in settings_extra) {
                                        activeUser().setExtra(key, settings_extra[key][0]);
                                    }
                                    SBChat.automations.runAll();
                                }
                                if (SBChat.dashboard) {
                                    main.removeClass('sb-init-form-active');
                                    $(area).remove();
                                    if (!SBChat.isInitDashboard()) SBChat.hideDashboard();
                                }
                                if (CHAT_SETTINGS.wp_registration && user_settings.email && user_settings.password) {
                                    SBApps.wordpress.ajax('wp-registration', { user_id: response[0].id, first_name: response[0].first_name, last_name: response[0].last_name, password: user_settings.password[0], email: user_settings.email[0] });
                                } else if (CHAT_SETTINGS.wp_users_system == 'wp') {
                                    SBApps.wordpress.ajax('wp-login', { user: user_settings.email[0], password: user_settings.password[0] });
                                }
                                delete this.cache.registration;
                                setTimeout(() => {
                                    SBF.event('SBRegistrationForm', { id: rich_message_id, conversation_id: SBChat.conversation ? SBChat.conversation.id : false, user: user_settings, extra: payload['rich-messages'][rich_message_id]['result']['extra'] });
                                }, 5000);
                                break;
                            case 'buttons':
                                SBChat.scrollBottom();
                                break;
                        }
                        if (message_id == -1) {
                            $(element).closest('.sb-rich-message').html(success);
                        } else if ((!payload.type || payload.type != 'close-message') && !dialogflow_human_takeover) {
                            SBChat.setConversationStatus(2);
                        }
                        if (!['login', 'chips', 'rating'].includes(type) && (CHAT_SETTINGS.dialogflow_send_user_details || !['email', 'registration'].includes(type))) {
                            SBApps.dialogflow.message(`${rich_message_id}${dialogflow_response ? ('|' + dialogflow_response) : ''}`, [], false, dialogflow_parameters);
                        }
                        if (CHAT_SETTINGS.slack_active && (!dialogflow_human_takeover || SBApps.dialogflow.humanTakeoverActive())) {
                            SBChat.slackMessage(activeUser().id, activeUser().name, activeUser().image, success);
                        }
                        if (SBPusher.active) {
                            SBChat.update();
                        }
                        if (type != 'registration' && type != 'email') {
                            SBF.event('SBRichMessageSubmit', { result: response, data: payload['rich-messages'][rich_message_id], id: rich_message_id });
                        }
                    } else {
                        SBForm.showErrorMessage(area, SBForm.getRegistrationErrorMessage(response, 'response'));
                        if (SBChat.dashboard) {
                            SBChat.scrollBottom();
                        }
                        input.sbLoading(false);
                    }
                });
            }
        },

        // Return the shortcode name and the shortcode settings
        shortcode: function (shortcode) {
            let result = {};
            let shortcode_name = shortcode.includes(' ') ? shortcode.substr(1, shortcode.indexOf(' ') - 1) : shortcode.slice(1, -1);
            if (/\?|"|'|`|\*/gi.test(shortcode_name)) {
                return [false, false];
            }
            shortcode = shortcode.slice(1, -1).substr(shortcode_name.length + 1);
            let settings = shortcode.split('" ');
            for (var i = 0; i < settings.length; i++) {
                if (settings[i].includes('=')) {
                    let item = [settings[i].substr(0, settings[i].indexOf('=')), settings[i].substr(settings[i].indexOf('=') + 2)];
                    result[$.trim(item[0])] = item[1].replace(/"/g, '');
                }
            }
            return [shortcode_name, result];
        },

        // Init the rich message inputs
        initInputs: function (code) {
            code = $($.parseHTML('<div>' + code + '</div>'));
            code.find('.sb-input input').each(function () {
                if ($(this).val()) {
                    $(this).siblings().addClass('sb-active sb-filled');
                }
            });
            return code.html();
        },

        // Timetable shortcode
        timetable: function (code) {
            let table = $($.parseHTML(`<div>${code}</div>`));
            let offset = table.find('[data-offset]').attr('data-offset');
            offset = SBF.null(offset) ? 0 : parseInt(offset);
            table.find('[data-time]').each(function () {
                let times = $(this).attr('data-time').split('|');
                code = ''
                for (var i = 0; i < times.length; i++) {
                    if (times[i] == 'closed') {
                        code += sb_('Closed');
                        break;
                    } else if (times[i]) {
                        let hm = times[i].split(':');
                        let time = SBF.convertUTCDateToLocalDate(`01/01/2000 ${hm[0]}:${hm[1]}`, offset);
                        code += time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + (i == 0 || i == 2 ? `<span>${sb_('to')}</span>` : i == 1 && times[i + 1] ? `<br />` : '');
                    }
                }
                table.find(' > div > span').html(`<i class="sb-icon-clock"></i> ${sb_('Time zone')} ${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
                $(this).html(code);
            });
            return table.html();
        },

        // Slider
        sliderChange: function (id, direction = 'left') {
            let slider = chat.find(`#${id}`);
            if (slider.length && !slider.hasClass('sb-moving')) {
                let items = slider.find('.sb-slider > div > div');
                let item = items.eq(0);
                let width = Math.ceil(item.closest('.sb-slider').width());
                let negative = (direction == 'right' ? -1 : 1);
                let margin = parseFloat(parseFloat(parseFloat(item.css('margin-left')) + (width * negative)).toFixed(2)) + (-0.5 * negative);
                let check = width * (items.length - 1) * -1;
                if (margin < 1 && margin >= check) {
                    item.css('margin-left', margin + 'px');
                    slider.addClass('sb-moving');
                    setTimeout(() => { slider.removeClass('sb-moving'); }, 1200);
                }
                slider.find('.sb-icon-arrow-right').sbActive(!(check > (margin - 15) && check < (margin + 15)));
                slider.find('.sb-icon-arrow-left').sbActive(margin < -10);
            }
        },

        calendly: {
            script_loaded: false,

            load: function (url, title, message_id) {
                url = url.split('|');
                if (this.script_loaded) {
                    this.load_(url[0], title);
                } else {
                    $.getScript('https://assets.calendly.com/assets/external/widget.js', () => {
                        this.script_loaded = true;
                        window.addEventListener('message', function (e) {
                            if (e.origin === 'https://calendly.com' && e.data.event == 'calendly.event_scheduled') {
                                SBChat.updateMessage(message_id, sb_(url[1] ? url[1] : 'Booking completed.'));
                                main.find('.sb-overlay-panel').sbActive(false);
                            }
                        });
                        this.load_(url[0], title);
                    }, true);
                }
            },

            load_: function (url, title) {
                let area = main.find('.sb-overlay-panel');
                Calendly.initInlineWidget({
                    url: (url.includes('http') ? '' : 'https://') + url + '?hide_landing_page_details=1&hide_event_type_details=1&hide_gdpr_banner=1',
                    parentElement: area.find('div').eq(1),
                    prefil: activeUser().type == 'user' ? { name: activeUser().name, email: activeUser().email } : {}
                });
                area.attr('data-id', 'calendly');
                area.find('div').eq(0).html(`<div>${sb_(title)}</div><i class="sb-btn-icon sb-icon-close"></i>`);
                area.sbActive(true);
            }
        }
    }
    window.SBRichMessages = SBRichMessages;

    /* 
    * ----------------------------------------------------------
    * FORM METHODS
    * ----------------------------------------------------------
    */

    var SBForm = {

        // Get all settings
        getAll: function (area) {
            let settings = {};
            $(area).find('.sb-input[id]').each((i, element) => {
                settings[$(element).attr('id')] = this.get(element);
            });
            return settings;
        },

        // Get a single setting
        get: function (input) {
            input = $(input);
            let type = input.data('type');
            let name = sb_(SBF.escape(input.find(' > span').html()));
            switch (type) {
                case 'image':
                    let url = input.find('.image').attr('data-value');
                    return [SBF.null(url) ? '' : url, name];
                case 'select':
                    return [SBF.escape(input.find('select').val()), name];
                case 'select-input':
                    let select = input.find('select,input[disabled]');
                    return [SBF.escape((select.is('select') || select.is('input') ? select.val() : (input.find('.sb-select').length ? input.find('.sb-select > p').attr('data-value') : input.find('> div').html())) + input.find('input[type="number"]').val()), name];
                default:
                    let target = input.find('input');
                    return [SBF.escape(target.length ? target.val() : input.find('[data-value]').attr('data-value')), name];
            }
        },

        // Set a single setting
        set: function (item, value) {
            item = $(item);
            if (item.length) {
                let type = item.data('type');
                switch (type) {
                    case 'image':
                        if (value) {
                            item.find('.image').attr('data-value', value).css('background-image', `url("${value}")`);
                        } else {
                            item.find('.image').removeAttr('data-value').removeAttr('style');
                        }
                        break;
                    case 'select':
                        item.find('select').val(value);
                        break;
                    default:
                        item.find('input,textarea').val(value);
                        break;
                }
                return true;
            }
            return false;
        },

        // Clear all the input values
        clear: function (area) {
            $(area).find('.sb-input,.sb-input-setting').each((i, element) => {
                this.set(element, '');
                $(element).find('input, select, textarea').removeClass('sb-error');
            });
            this.set($(area).find('#user_type'), 'user');
        },

        // Check for errors on user input
        errors: function (area) {
            let errors = false;
            let items = $(area).find('input, select, textarea').removeClass('sb-error');
            items.each(function (i) {
                let value = $.trim($(this).val());
                let type = $(this).attr('type');
                let required = $(this).prop('required');
                if ((required && !value) || ((required || value) && ((type == 'password' && (value.length < 8 || (items.length > (i + 1) && items.eq(i + 1).attr('type') == 'password' && items.eq(i + 1).val() != value))) || (type == 'email' && (value.indexOf('@') < 0 || value.indexOf('.') < 0 || /;|:|\/|\\|,|#|"|!|=|\+|\*|{|}|[|]|£|\$|€|~|'|>|<|\^|&/.test(value))) || (type == 'tel' && value && ((!$(this).parent().find('select').val() && !$(this).parent().find('div').html().trim().startsWith('+')) || isNaN(value) || value.includes('+') || value.length < 5))))) {
                    errors = true;
                    $(this).addClass('sb-error');
                }
            });
            items = $(area).find('[data-required]').removeClass('sb-error');
            items.each(function () {
                if (SBF.null($(this).attr('data-value'))) {
                    $(this).addClass('sb-error');
                    errors = true;
                }
            });
            return errors;
        },

        // Display a error message
        showErrorMessage: function (area, message) {
            $(area).find('.sb-info').html(sb_(message)).sbActive(true);
            clearTimeout(timeout);
            timeout = setTimeout(function () {
                $(area).find('.sb-info').sbActive(false);
            }, 7000);
        },

        // Display a success message
        showSuccessMessage: function (area, message) {
            $(area).find('.sb-info').remove();
            $(area).addClass('sb-success').find('.sb-content').html(`<div class="sb-text">${message}</div>`);
        },

        // Return the registration error message
        getRegistrationErrorMessage(area_or_response, type = 'validation') {
            if (type == 'response') return SBF.errorValidation(area_or_response, 'duplicate-email') ? 'This email is already in use. Please use another email.' : (SBF.errorValidation(area_or_response, 'duplicate-phone') ? 'This phone number is already in use. Please use another number.' : (SBF.errorValidation(area_or_response, 'invalid-envato-purchase-code') ? 'Invalid Envato purchase code.' : 'Error. Please check your information and try again.'))
            let name = $(area_or_response).find('#last_name').length ? 'First name, last name' : 'Name';
            let phone = $(area_or_response).find('#phone [required]').length ? ', phone number' : '';
            let email = $(area_or_response).find('#email').length ? ', email' : '';
            let password = $(area_or_response).find('#password').length ? ', and a password (8 character minimum)' : '';
            return `${name}${email}${phone}${password} ${(email + phone + password) ? 'are' : 'is'} required.`;
        }
    }
    window.SBForm = SBForm;

    /* 
    * ----------------------------------------------------------
    * APPS
    * ----------------------------------------------------------
    */

    var SBApps = {

        // Get the login data 
        login: function () {
            if (this.is('wp') && typeof SB_WP_ACTIVE_USER != ND && CHAT_SETTINGS.wp_users_system == 'wp') {
                return [[SB_WP_ACTIVE_USER, typeof SB_WP_AVATAR != ND ? SB_WP_AVATAR : ''], 'wp'];
            }
            if (typeof SB_PERFEX_ACTIVE_USER != ND) {
                return [[SB_PERFEX_ACTIVE_USER, SB_PERFEX_CONTACT_ID], 'perfex'];
            }
            if (typeof SB_WHMCS_ACTIVE_USER != ND) {
                return [SB_WHMCS_ACTIVE_USER, 'whmcs'];
            }
            if (typeof SB_AECOMMERCE_ACTIVE_USER != ND) {
                return [SB_AECOMMERCE_ACTIVE_USER, 'aecommerce'];
            }
            if (typeof SB_DEFAULT_USER != ND && SB_DEFAULT_USER) {
                return [SB_DEFAULT_USER, 'default'];
            }
            return false;
        },

        // Check if an app is installed and active
        is: function (name) {
            if (admin) return SBAdmin.apps.is(name);
            if (name == 'wordpress' || name == 'wp') return CHAT_SETTINGS.wp;
            return name in CHAT_SETTINGS ? CHAT_SETTINGS[name] : false;
        },

        wordpress: {

            // Ajax
            ajax: function (action, data, onSuccess = false) {
                if (typeof SB_WP_AJAX_URL == ND) return;
                $.ajax({
                    method: 'POST',
                    url: SB_WP_AJAX_URL,
                    data: $.extend({ action: 'sb_wp_ajax', type: action }, data)
                }).done((response) => {
                    if (onSuccess) {
                        onSuccess(response);
                    }
                });
            }
        },

        woocommerce: {

            // Update the cart
            updateCart: function (action, product_id, onSuccess = false) {
                SBApps.wordpress.ajax(action, { product_id: product_id }, onSuccess);
            },

            // Waiting list
            waitingList: function (action = 'request', product_id = false) {
                if (typeof SB_WP_WAITING_LIST !== ND && (action != 'request' || SB_WP_WAITING_LIST && SBF.storageTime('waiting-list-' + SB_WP_PAGE_ID, 24)) && activeUser()) {
                    SBF.ajax({
                        function: 'woocommerce-waiting-list',
                        product_id: product_id === false ? SB_WP_PAGE_ID : product_id,
                        conversation_id: SBChat.conversation.id,
                        action: action,
                        token: this.token
                    }, (response) => {
                        if (response) {
                            SBF.storageTime('waiting-list-' + SB_WP_PAGE_ID);
                            if (action == 'request' && (!SBChat.chat_open || SBChat.dashboard)) {
                                SBChat.updateConversations();
                            }
                        }
                    });
                }
            }
        },

        dialogflow: {
            token: storage('dialogflow-token'),
            typing_enabled: false,
            project_id: false,

            message: function (message = '', attachments = [], delay = false, parameters = false, audio = false) {
                if (message.length < 2 && !attachments.length) {
                    return;
                }
                if (!audio) {
                    for (var i = 0; i < attachments.length; i++) {
                        if (attachments[i][0].includes('voice_message')) {
                            audio = attachments[i][1];
                        }
                    }
                }
                if (this.active(true, true, false)) {
                    let human_takeover_active = SBApps.dialogflow.humanTakeoverActive();
                    if (!human_takeover_active || this.typing_enabled) {
                        this.typing();
                    }
                    if (this.chatbotLimit()) {
                        return SBChat.sendMessage(bot_id, this.chatbotLimit());
                    }
                    setTimeout(() => {
                        let conversation = SBChat.conversation;
                        SBF.ajax({
                            function: 'dialogflow-message',
                            conversation_id: conversation ? conversation.id : false,
                            message: message,
                            attachments: attachments,
                            parameters: parameters,
                            token: this.token,
                            dialogflow_language: storage('dialogflow-language') ? storage('dialogflow-language') : SB_LANG,
                            project_id: this.project_id,
                            session_id: activeUser().id + '-' + conversation.id,
                            audio: audio
                        }, (response) => {
                            if (response === false) return;
                            if (response.response && response.response.error) {
                                return console.error(response.response);
                            }
                            if (response.human_takeover) {
                                SBChat.offlineMessage();
                                SBChat.followUp();
                                return this.active(false);
                            }
                            if (response.language_detection && !storage('dialogflow-language')) {
                                storage('dialogflow-language', [response.language_detection]);
                            }
                            if (response.user_language && !storage('dialogflow-language')) {
                                activeUser().setExtra('language', response.user_language);
                            }
                            if (response.translations) {
                                CHAT_SETTINGS.translations = response.translations;
                            }
                            if (!SBF.errorValidation(response)) {
                                let query_result = response.response.queryResult ? response.response.queryResult : false;
                                let is_unknow = query_result && (query_result.action == 'input.unknown' || (query_result.match && query_result.match.matchType == 'NO_MATCH'));
                                let messages = response.messages && Array.isArray(response.messages) ? response.messages : [];
                                SBChat.typing(-1, 'stop');
                                clearTimeout(timeout);
                                if (this.token != response.token) {
                                    this.token = response.token;
                                    storage('dialogflow-token', response.token);
                                }
                                if (is_unknow) {
                                    if (human_takeover_active) {
                                        this.typing_enabled = false;
                                    }
                                } else {
                                    this.typing_enabled = true;
                                }
                                if (query_result) {

                                    // Actions
                                    if (query_result.action) {
                                        let action = query_result.action;
                                        if (action == 'end') {
                                            this.active(false);
                                        }
                                        SBF.event('SBBotAction', action);
                                    }

                                    // Payload
                                    for (var i = 0; i < messages.length; i++) {
                                        if (messages[i].payload) {
                                            let payloads = ['human-takeover', 'redirect', 'woocommerce-update-cart', 'woocommerce-checkout', 'open-article', 'transcript', 'department', 'agent', 'send-email', 'disable-bot', 'rich-message', 'tags'];
                                            let payload = messages[i].payload;
                                            if (SBF.null(payload)) payload = [];
                                            if (payloads[0] in payload && payload[payloads[0]] === true) {
                                                this.humanTakeover();
                                            }
                                            if (payloads[1] in payload) {
                                                setTimeout(function () {
                                                    payload['new-window'] ? window.open(payload[payloads[1]]) : document.location = payload[payloads[1]];
                                                }, 500);
                                            }
                                            if (payloads[2] in payload) {
                                                let payload_value = payload[payloads[2]];
                                                SBApps.woocommerce.updateCart(payload_value[0], payload_value[1], (response) => {
                                                    if (response) {
                                                        SBF.event('SBWoocommerceCartUpdated', { 'action': payload_value[0], 'product': payload_value[1] });
                                                    }
                                                });
                                            }
                                            if (payloads[3] in payload && payload[payloads[3]] === true) {
                                                SBApps.wordpress.ajax('url', { url_name: 'checkout' }, (response) => {
                                                    setTimeout(() => document.location = response, 500);
                                                });
                                            }
                                            if (payloads[4] in payload) {
                                                SBChat.showArticles(payload[payloads[4]]);
                                            }
                                            if (payloads[5] in payload && payload[payloads[5]]) {
                                                SBF.ajax({
                                                    function: 'transcript',
                                                    conversation_id: conversation.id,
                                                    type: 'txt'
                                                }, (response) => {
                                                    if (payload[payloads[5]] == 'email' && activeUser().email) {
                                                        SBChat.sendEmail(payload.message ? payload.message : '', [[response, response]], conversation.id);
                                                    } else window.open(response);
                                                });
                                            }
                                            if (payloads[6] in payload) {
                                                SBF.ajax({
                                                    function: 'update-conversation-department',
                                                    conversation_id: conversation.id,
                                                    department: payload[payloads[6]],
                                                    message: conversation.getLastUserMessage().message
                                                });
                                            }
                                            if (payloads[7] in payload) {
                                                SBF.ajax({
                                                    function: 'update-conversation-agent',
                                                    conversation_id: conversation.id,
                                                    agent_id: payload[payloads[7]],
                                                    message: conversation.getLastUserMessage().message
                                                });
                                            }
                                            if (payloads[8] in payload) {
                                                let email = payload[payloads[8]];
                                                SBChat.sendEmail(email.message, email.attachments, email.recipient == 'active_user');
                                            }
                                            if (payloads[9] in payload) {
                                                this.active(false);
                                                SBF.cookie('sb-dialogflow-disabled', true, 300, 'set', true);
                                            }
                                            if (payloads[10] in payload) {
                                                SBChat.sendMessage(bot_id, payload[payloads[10]]);
                                            }
                                            if (payloads[11] in payload) {
                                                SBF.ajax({
                                                    function: 'update-tags',
                                                    conversation_id: conversation.id,
                                                    tags: payload[payloads[11]]
                                                });
                                            }
                                            SBF.event('SBBotPayload', payload);
                                        }

                                        // More
                                        this.chatbotLimit(false);
                                        if (!storage('dialogflow-language') && query_result.languageCode && (!SB_LANG || query_result.languageCode != SB_LANG[0])) {
                                            storage('dialogflow-language', [query_result.languageCode]);
                                        }
                                    }

                                    // Diagnostic info
                                    if (query_result.diagnosticInfo) {
                                        let info = query_result.diagnosticInfo;

                                        // End conversation
                                        if (info.end_conversation) {
                                            this.active(false);
                                        }
                                    }
                                }

                                // Slack
                                if (CHAT_SETTINGS.slack_active && messages && (!dialogflow_human_takeover || human_takeover_active)) {
                                    for (var i = 0; i < messages.length; i++) {
                                        SBChat.slackMessage(activeUser().id, CHAT_SETTINGS.bot_name, CHAT_SETTINGS.bot_image, messages[i].message, messages[i].attachments);
                                    }
                                }

                                SBF.event('SBBotMessage', { response: response, message: message });
                            }
                        });
                    }, delay !== false ? delay : (CHAT_SETTINGS.bot_delay == 0 ? 2000 : parseInt(CHAT_SETTINGS.bot_delay)));
                } else if (this.active(true, false, true) && !$('.sb-emoji-list').html().includes('<li>' + message + '</li>')) {
                    this.openAI(message, false, audio);
                }
            },

            openAI: function (message, onSuccess = false, audio = false) {
                if (CHAT_SETTINGS.open_ai_active) {
                    this.typing_enabled = true;
                    this.typing();
                    setTimeout(() => {
                        SBF.ajax({
                            function: 'open-ai-message',
                            message: message,
                            conversation_id: SBChat.conversation ? SBChat.conversation.id : false,
                            audio: audio,
                            extra: { token: SBApps.dialogflow.token }
                        }, (response) => {
                            SBChat.typing(-1, 'stop');
                            SBF.event('SBOpenAIMessage', { response: response, message: message });
                            if (response && response[0]) {
                                if (CHAT_SETTINGS.chatbot_limit) {
                                    this.chatbot_limit++;
                                }
                                if (CHAT_SETTINGS.slack_active) {
                                    SBChat.slackMessage(activeUser().id, CHAT_SETTINGS.bot_name, CHAT_SETTINGS.bot_image, response[1]);
                                }
                                if (response[2] && SBApps.dialogflow.token != response[2]) {
                                    SBApps.dialogflow.token = response.token;
                                    storage('dialogflow-token', response.token);
                                }
                                if (response[3]) {
                                    SBChat.offlineMessage();
                                    SBChat.followUp();
                                }
                            } else {
                                SBF.error(response[1].error ? response[1].error.message : response[1], 'SBApps.dialogflow.openAI');
                            }
                            if (onSuccess) onSuccess(response);
                        });
                    }, CHAT_SETTINGS.bot_delay == 0 ? 2000 : parseInt(CHAT_SETTINGS.bot_delay));
                }
            },

            typing: function () {
                clearTimeout(timeout_typing);
                timeout_typing = setTimeout(() => {
                    SBChat.typing(-1, 'start');
                    setTimeout(() => {
                        SBChat.typing(-1, 'stop');
                    }, 60000);
                }, 1000);
            },

            active: function (active = true, check_dialogflow = true, check_open_ai = true) {
                let name = 'human-takeover-' + SBChat.conversation.id;
                if (active === false) {
                    SBF.storageTime(name);
                    return false;
                }
                if (active == 'activate') {
                    SBF.cookie('sb-dialogflow-disabled', 0, 0, 'delete');
                    SBF.storage(name, '');
                }
                let check = !admin && !SBF.cookie('sb-dialogflow-disabled') && (SBF.storageTime(name, 240) || !SBChat.agent_online) && (!CHAT_SETTINGS.dialogflow_office_hours || !CHAT_SETTINGS.office_hours);
                if (!admin && SBApps.dialogflow.humanTakeoverActive() && CHAT_SETTINGS.dialogflow_human_takeover_disable_chatbot) {
                    return false;
                }
                if (check_dialogflow && check_open_ai) {
                    return (CHAT_SETTINGS.dialogflow_active || CHAT_SETTINGS.open_ai_active) && check;
                }
                return (!check_dialogflow || CHAT_SETTINGS.dialogflow_active) && (!check_open_ai || CHAT_SETTINGS.open_ai_active) && check;
            },

            welcome: function (open = false, sound = false) {
                SBF.ajax({
                    function: 'dialogflow-message',
                    message: '',
                    conversation_id: SBChat.conversation.id,
                    token: this.token,
                    event: 'Welcome',
                    dialogflow_language: storage('dialogflow-language') ? storage('dialogflow-language') : SB_LANG
                }, () => {
                    if (open) {
                        SBChat.start();
                    }
                    if (sound) {
                        SBChat.audio.play();
                    }
                });
            },

            humanTakeover: function () {
                SBF.ajax({
                    function: 'dialogflow-human-takeover',
                    conversation_id: SBChat.conversation.id
                }, () => {
                    SBChat.offlineMessage();
                    SBChat.followUp();
                    this.active(false);
                    if (CHAT_SETTINGS.queue_human_takeover) {
                        CHAT_SETTINGS.queue = true;
                        SBChat.queue(SBChat.conversation.id);
                    }
                });
            },

            humanTakeoverActive: function () {
                return !SBF.storageTime('human-takeover-' + (SBChat.conversation ? SBChat.conversation.id : storage('open-conversation')), 240);
            },

            translate: function (strings, language_code, onSuccess, message_ids, conversation_id) {
                SBF.ajax({
                    function: 'google-translate',
                    strings: strings,
                    language_code: language_code,
                    token: this.token,
                    message_ids: message_ids,
                    conversation_id: conversation_id
                }, (response) => {
                    this.token = response[1]
                    onSuccess(response[0]);
                });
            },

            chatbotLimit: function (check = true) {
                if (CHAT_SETTINGS.chatbot_limit) {
                    let chatbot_limit = storage('chatbot_limit');
                    let now = (new Date()).getTime() / 1000;
                    if (!chatbot_limit) {
                        chatbot_limit = [];
                    }
                    if (check) {
                        let interval = now - CHAT_SETTINGS.chatbot_limit.interval;
                        let chatbot_limit_new = [];
                        for (var i = 0; i < chatbot_limit.length; i++) {
                            if (chatbot_limit[i] > interval) {
                                chatbot_limit_new.push(chatbot_limit[i]);
                            }
                        }
                        storage('chatbot_limit', chatbot_limit_new);
                        if (chatbot_limit_new.length >= CHAT_SETTINGS.chatbot_limit.quota) {
                            return CHAT_SETTINGS.chatbot_limit.message;
                        }
                    } else {
                        chatbot_limit.push(now);
                        storage('chatbot_limit', chatbot_limit);
                    }
                }
                return false;
            }
        },

        aecommerce: {

            cart: function () {
                if (SBApps.is('aecommerce') && typeof SB_AECOMMERCE_CART != ND && typeof SB_AECOMMERCE_ACTIVE_USER != ND && storage('aecommerce') != JSON.stringify(SB_AECOMMERCE_CART)) {
                    SBF.ajax({
                        function: 'aecommerce-cart',
                        cart: SB_AECOMMERCE_CART
                    }, () => {
                        storage('aecommerce', JSON.stringify(SB_AECOMMERCE_CART));
                    });
                }
            }
        },

        martfury: {

            privateChat: function () {
                let store = $('#tab-vendor > h4,.ps-product__vendor > a');
                if (store.length) {
                    store = store.html().toLowerCase();
                    for (var i = 0; i < CHAT_SETTINGS.martfury.length; i++) {
                        if (store == CHAT_SETTINGS.martfury[i]['martfury-linking-store'].toLowerCase()) {
                            let agent_id = CHAT_SETTINGS.martfury[i]['martfury-linking-agent'];
                            let conversations = SBF.activeUser() ? SBF.activeUser().conversations : [];
                            SBChat.default_agent = agent_id;
                            for (var j = 0; j < conversations.length; j++) {
                                if (conversations[j].get('agent_id') == agent_id) {
                                    SBChat.openConversation(conversations[j].id);
                                    return;
                                }
                            }
                            SBChat.clear();
                            SBChat.hideDashboard();
                        }
                    }
                }
            }
        }
    }
    window.SBApps = SBApps;

    /*
    * ----------------------------------------------------------
    * INIT
    * ----------------------------------------------------------
    */

    $(document).ready(function () {
        main = $('.sb-admin, .sb-admin-start');
        if (main.length) {
            admin = true;
            initialize();
            return;
        }
        let url_full;
        let url;
        let init = false;
        if (typeof SB_INIT_URL != ND) {
            if (SB_INIT_URL.indexOf('.js') < 0) {
                SB_INIT_URL += '/js/main.js?v=' + version;
            }
            url_full = SB_INIT_URL;
        } else {
            let scripts = document.getElementsByTagName('script');
            let checks = ['init.js', 'main.js', 'min/init.min.js', 'min/main.min.js'];
            for (var i = 0; i < scripts.length; i++) {
                let source = scripts[i].src;
                if (scripts[i].id == 'sbinit') {
                    url_full = source;
                    init = init ? init : url_full.includes('init.');
                    break;
                } else {
                    for (var j = 0; j < checks.length; j++) {
                        if (source && source.includes('/supportboard/js/' + checks[j])) {
                            url_full = source;
                            init = init ? init : url_full.includes('init.');
                            break;
                        }
                    }
                }
            }
        }
        let parameters = SBF.getURL(false, url_full);
        if (parameters.url) {
            url_full = parameters.url;
        }
        if (typeof SB_DISABLED != ND && SB_DISABLED) {
            return;
        }
        if (init) {
            initialize();
            return;
        }
        if (typeof SB_TICKETS != ND || (parameters.mode == 'tickets')) {
            tickets = true;
            parameters.mode = 'tickets';
        }
        if (parameters.cloud) {
            cloud_data = parameters.cloud;
        }
        let min = url_full.lastIndexOf('main.min.js');
        url = url_full.substr(0, url_full.lastIndexOf('main.js') > 0 ? (url_full.lastIndexOf('main.js') - 4) : (min - 8));
        let url_chat = url + '/include/init.php' + (parameters.lang ? '?lang=' + parameters.lang : '') + (parameters.mode ? '&mode=' + parameters.mode : '') + (cloud_data ? '&cloud=' + cloud_data : '');
        SBF.cors('GET', url_chat.replace('.php&', '.php?'), (response) => {
            let target = 'body';
            if (tickets && $('#sb-tickets').length) {
                target = '#sb-tickets';
            }
            $(target).append(response);
            SBF.loadResource(url + '/css/' + (tickets ? 'tickets' : 'main') + '.css');
            if (tickets) {
                SBF.loadResource(url + '/apps/tickets/tickets' + (min > 0 ? '.min' : '') + '.js?v=' + version, true, () => {
                    initialize();
                });
            } else {
                initialize();
            }
            if (parameters.lang) {
                SB_LANG = [parameters.lang, admin ? 'admin' : 'front'];
            }
        });
    });

    function initialize() {
        main = $('.sb-admin, .sb-chat, .sb-tickets');

        // Initialize the chat and the user
        if (main.length && typeof SB_AJAX_URL != ND) {
            chat = main.find('.sb-list');
            chat_editor = main.find('.sb-editor');
            chat_textarea = chat_editor.find('textarea');
            chat_scroll_area = main.find(admin || tickets ? '.sb-list' : '> div > .sb-scroll-area');
            label_date = main.find('.sb-label-date-top');
            chat_header = chat_scroll_area.find('.sb-header');
            chat_emoji = chat_editor.find('.sb-emoji');
            chat_status = tickets ? main.find('.sb-profile-agent .sb-status') : null;
            SBChat.enabledAutoExpand();
            SBChat.audio = main.find('#sb-audio').get(0);

            // Check if cookies works
            SBF.cookie('sb-check', 'ok', 1, 'set');
            if (SBF.cookie('sb-check') != 'ok') {
                cookies_supported = false;
                console.warn('Support Board: cookies not available.');
            } else {
                SBF.cookie('sb-check', false, false, false);
            }
            if (!admin) {
                SBF.ajax({
                    function: 'get-front-settings',
                    current_url: window.location.href,
                    tickets: tickets,
                    popup: !storage('popup') && !tickets
                }, (response) => {
                    CHAT_SETTINGS = response;
                    if (typeof SB_LOCAL_SETTINGS != ND) {
                        $.extend(CHAT_SETTINGS, SB_LOCAL_SETTINGS);
                    }
                    bot_id = CHAT_SETTINGS.bot_id;
                    dialogflow_human_takeover = CHAT_SETTINGS.dialogflow_human_takeover;
                    agents_online = CHAT_SETTINGS.agents_online;
                    SBPusher.active = CHAT_SETTINGS.pusher;
                    if (typeof SB_REGISTRATION_REQUIRED != ND) {
                        CHAT_SETTINGS.registration_required = SB_REGISTRATION_REQUIRED;
                        CHAT_SETTINGS.tickets_registration_required = SB_REGISTRATION_REQUIRED;
                    }
                    if (typeof SB_ARTICLES_PAGE != ND && SB_ARTICLES_PAGE) {
                        SBChat.automations.runAll();
                        SBChat.initArticlesPage();
                    }
                    if ((!tickets || !CHAT_SETTINGS.tickets_manual_init) && ((tickets && !CHAT_SETTINGS.tickets_manual_init) || (!CHAT_SETTINGS.chat_manual_init && (!CHAT_SETTINGS.disable_offline || agents_online) && (!CHAT_SETTINGS.disable_office_hours || CHAT_SETTINGS.office_hours) && (!CHAT_SETTINGS.chat_login_init || SBApps.login())))) {
                        SBChat.initChat();
                    }
                    if (CHAT_SETTINGS.cron) {
                        setTimeout(function () {
                            SBF.ajax({ function: 'cron-jobs' });
                        }, 10000);
                    }
                    if (CHAT_SETTINGS.cron_email_piping) {
                        setTimeout(function () {
                            SBF.ajax({ function: 'email-piping' });
                        }, 8000);
                    }
                    if (CHAT_SETTINGS.push_notifications_users) {
                        SBF.serviceWorker.init();
                    }
                    if (tickets) {
                        if (CHAT_SETTINGS.tickets_default_department) {
                            SBChat.default_department = CHAT_SETTINGS.tickets_default_department;
                        }
                        if (CHAT_SETTINGS.dialogflow_disable_tickets) {
                            CHAT_SETTINGS.dialogflow_active = false;
                            CHAT_SETTINGS.open_ai_active = false;
                        }
                    }
                    if (SBApps.is('martfury')) {
                        let session = false;
                        setInterval(function () {
                            if (activeUser()) {
                                let current = SBF.cookie('XSRF-TOKEN');
                                if (current && current != session) {
                                    SBF.ajax({ function: 'martfury-session' });
                                    session = current;
                                }
                            }
                        }, 3000);
                    }
                    setAudio();
                    SBApps.aecommerce.cart();
                    setTimeout(() => {
                        SBF.event('SBReady');
                    }, 500);
                });
            } else {
                setAudio();
                SBF.event('SBReady');
            }
            $(chat_editor).on('keydown', 'textarea', function (e) {
                if (e.which == 13 && (!tickets || CHAT_SETTINGS.tickets_enter_button) && (!admin || (!e.ctrlKey && !e.shiftKey))) {
                    SBChat.submit();
                    e.preventDefault;
                    return false;
                }
                if (admin && e.which == 13 && e.ctrlKey) {
                    SBChat.insertText('\n');
                }
            });
            $(main).on('keydown', '.sb-dashboard-articles input', function (e) {
                if (e.which == 13) $(this).next().click();
            });
            if (typeof SB_DEFAULT_DEPARTMENT !== ND) {
                SBChat.default_department = SB_DEFAULT_DEPARTMENT;
            }
            if (typeof SB_DEFAULT_AGENT !== ND) {
                SBChat.default_agent = SB_DEFAULT_AGENT;
            }
            if (typeof SB_DIALOGFLOW_TAGS !== ND) {
                SBChat.default_tags = SB_DEFAULT_TAGS;
            }
            if (typeof SB_DIALOGFLOW_AGENT !== ND) {
                SBApps.dialogflow.project_id = SB_DIALOGFLOW_AGENT;
            }
        } else {
            SBF.event('SBReady');
        }

        // Disable real-time if browser tab not active
        document.addEventListener('visibilitychange', function () {
            SBF.visibilityChange(document.visibilityState);
        }, false);

        $(main).on('click', function () {
            if (!SBChat.tab_active) {
                SBF.visibilityChange();
            }
        });

        // Set the global container for both admin and front
        global = main;
        if (admin) {
            main = main.find('.sb-conversation');
        }

        // Scroll detection
        $(chat_scroll_area).on('scroll', function () {
            let scroll = chat_scroll_area.scrollTop();
            let count = label_date_items.length;
            SBChat.scrollHeader();
            if (label_date_show) {
                label_date.sbActive(true);
                clearTimeout(timeout_label_date[0]);
                timeout_label_date[0] = setTimeout(() => { label_date.sbActive(false) }, 1500);
            }
            if (count) {
                if (SBChat.isBottom()) {
                    label_date.html($(label_date_items[count - 1]).html());
                } else {
                    for (var i = 0; i < count; i++) {
                        let top = label_date_items[i].getBoundingClientRect().top;
                        if (top > 100 && top < 150) {
                            let label = $(label_date_items[label_date_history[0] > scroll && i > 0 ? i - 1 : i]).html();
                            if (label != label_date_history[1]) {
                                label_date.html(label);
                                label_date_history[1] = label;
                            }
                            break;
                        }
                    }
                }
            }
            label_date_history[0] = scroll;
        });

        // Show the message menu
        $(chat).on('click', '.sb-menu-btn', function () {
            let menu = $(this).parent().find('.sb-menu');
            let active = $(menu).sbActive();
            SBF.deactivateAll();
            if (!active) {
                $(menu).sbActive(true);
                SBF.deselectAll();
                if (admin) SBAdmin.open_popup = menu;
            }
        });

        // Mobile
        if (mobile) {
            $(chat_editor).on('click', '.sb-textarea', function () {
                main.addClass('sb-header-hidden');
                $(this).find('textarea').get(0).focus();
                if (SBChat.isBottom()) {
                    SBChat.scrollBottom();
                    setTimeout(() => {
                        SBChat.scrollBottom();
                    }, 200);
                }
            });

            $(chat_editor).on('focusout', '.sb-textarea', function () {
                setTimeout(() => {
                    main.removeClass('sb-header-hidden');
                }, 300);
            });

            $(chat_editor).on('click', '.sb-submit', function () {
                chat_textarea.blur();
            });

            window.addEventListener('popstate', function () {
                if (SBChat.chat_open) {
                    SBChat.open(false);
                }
            });
        }

        // Hide the message menu
        $(chat).on('click', '.sb-menu li', function () {
            $(this).parent().sbActive(false);
        });

        // Send a message
        $(chat_editor).on('click', '.sb-submit', function () {
            SBChat.submit();
        });

        // Open the chat
        $('body').on('click', '.sb-chat-btn,.sb-responsive-close-btn, #sb-open-chat, .sb-open-chat', function () {
            SBChat.open(!SBChat.chat_open);
        });

        // Show the dashboard
        $(main).on('click', '.sb-dashboard-btn', function () {
            SBChat.showDashboard();
            if (chat_scroll_area.find(' > .sb-panel-articles > .sb-article').length) {
                SBChat.showArticles();
            }
            storage('open-conversation', 0);
            force_action = false;
        });

        // Open a conversation from the dashboard
        $(main).on('click', '.sb-user-conversations li', function () {
            SBChat.openConversation($(this).attr('data-conversation-id'));
        });

        // Start a new conversation from the dashboard
        $(main).on('click', '.sb-btn-new-conversation, .sb-departments-list > div, .sb-agents-list > div', function () {
            let id = $(this).data('id');
            let existing_conversation = false;
            if (!SBF.null(id)) {
                let is_departments = $(this).parent().hasClass('sb-departments-list');
                if (is_departments) {
                    SBChat.default_department = parseInt(id);
                } else {
                    SBChat.default_agent = parseInt(id);
                }
                if ($(this).parent().data('force-one')) {
                    let converstations = activeUser() ? activeUser().conversations : [];
                    for (var i = 0; i < converstations.length; i++) {
                        if ((is_departments && converstations[i].get('department') == id) || (!is_departments && converstations[i].get('agent_id') == id)) {
                            existing_conversation = true;
                            SBChat.openConversation(converstations[i].id);
                            break;
                        }
                    }
                }
            }
            if (!existing_conversation) {
                force_action = 'new-conversation';
                SBChat.clear();
                SBChat.hideDashboard();
            }
        });

        // Displays all conversations in the dashboard
        $(main).on('click', '.sb-btn-all-conversations', function () {
            main.find('.sb-dashboard-conversations').removeClass('sb-conversations-hidden');
        });

        // Events uploader
        $(chat_editor).on('click', '.sb-btn-attachment', function () {
            if (!SBChat.is_busy) {
                chat_editor.find('.sb-upload-files').val('').click();
            }
        });

        $(chat_editor).on('click', '.sb-attachments > div > i', function (e) {
            $(this).parent().remove();
            if (!chat_textarea.val() && chat_editor.find('.sb-attachments > div').length == 0) {
                chat_editor.sbActive(false);
            }
            e.preventDefault();
            return false;
        });

        $(chat_editor).on('change', '.sb-upload-files', function (data) {
            SBChat.busy(true);
            $(this).sbUploadFiles(function (response) {
                SBChat.uploadResponse(response);
            });
            SBF.event('SBAttachments');
        });

        $(chat_editor).on('dragover', function (e) {
            $(this).addClass('sb-drag');
            clearTimeout(timeout);
            e.preventDefault();
            e.stopPropagation();
        });

        $(chat_editor).on('dragleave', function (e) {
            timeout = setTimeout(() => {
                $(this).removeClass('sb-drag');
            }, 200);
            e.preventDefault();
            e.stopPropagation();
        });

        $(chat_editor).on('drop', function (e) {
            let files = e.originalEvent.dataTransfer.files;
            e.preventDefault();
            e.stopPropagation();
            if (files.length > 0) {
                for (var i = 0; i < files.length; ++i) {
                    let form = new FormData();
                    form.append('file', files[i]);
                    SBF.upload(form, function (response) { SBChat.uploadResponse(response) });
                }
            }
            $(this).removeClass('sb-drag');
            return false;
        });

        // Articles
        $(main).on('click', '.sb-btn-all-articles:not([onclick])', function () {
            SBChat.showArticles();
        });

        $(main).on('click', '.sb-articles > div', function () {
            SBChat.showArticles($(this).attr('data-id'), $(this).attr('data-is-category'));
        });

        $(main).on('click', '.sb-dashboard-articles .sb-input-btn .sb-submit-articles', function () {
            SBChat.searchArticles($(this).parent().find('input').val(), this, $(this).parent().next());
        });

        $(global).on('click', '.sb-article [data-rating]', function () {
            SBChat.articleRatingOnClick(this);
        });

        $(chat).on('click', '.sb-rich-button a', function (e) {
            let link = $(this).attr('href');
            if (link.indexOf('#') === 0) {
                if (link.indexOf('#article-') === 0) {
                    SBChat.showArticles(link.replace('#article-', ''));
                    e.preventDefault();
                    return false;
                }
            }
        });

        // Lightbox
        $(global).on('click', '.sb-lightbox-media > i', function () {
            global.find('.sb-lightbox-media').sbActive(false);
            if (admin) SBAdmin.open_popup = false;
            return false;
        });

        $(main).on('click', '.sb-image', function () {
            SBF.lightbox($(this).html());
        });

        $(main).on('click', '.sb-slider-images .sb-card-img', function () {
            SBF.lightbox(`<img loading="lazy" src="${$(this).attr('data-value')}" />`);
        });

        // Event: on conversation loaded
        $(document).on('SBConversationLoaded', function () {
            if (storage('queue')) {
                SBChat.queue(storage('queue'));
            }
        });

        // Events emoji
        $(chat_editor).on('click', '.sb-btn-emoji', function () {
            SBChat.showEmoji(this);
        });

        $(chat_emoji).on('click', '.sb-emoji-list li', function (e) {
            SBChat.insertEmoji($(this).html());
            if (mobile) clearTimeout(timeout);
        });

        $(chat_emoji).find('.sb-emoji-list').on('touchend', function (e) {
            timeout = setTimeout(() => {
                SBChat.mouseWheelEmoji(e);
            }, 50);
        });

        $(chat_emoji).find('.sb-emoji-list').on('mousewheel DOMMouseScroll', function (e) {
            SBChat.mouseWheelEmoji(e);
        });

        $(chat_emoji).find('.sb-emoji-list').on('touchstart', function (e) {
            SBChat.emoji_options.touch = e.originalEvent.touches[0].clientY;
        });

        $(chat_emoji).on('click', '.sb-emoji-bar > div', function () {
            SBChat.clickEmojiBar(this);
        });

        $(chat_emoji).on('click', '.sb-select li', function () {
            SBChat.categoryEmoji($(this).data('value'));
        });

        $(chat_emoji).find('.sb-search-btn input').on('change keyup paste', function () {
            SBChat.searchEmoji($(this).val());
        });

        // Textarea
        $(chat_textarea).on('keyup', function () {
            SBChat.textareaChange(this);
        });

        // Privacy message
        $(main).on('click', '.sb-privacy .sb-approve', function () {
            storage('privacy-approved', true);
            $(this).closest('.sb-privacy').remove();
            main.removeClass('sb-init-form-active');
            chat_header.find(' > div').css({ opacity: 1, top: 0 });
            SBChat.initChat();
            if (tickets) {
                SBTickets.showPanel('new-ticket');
            } else if (!SBChat.isInitDashboard()) {
                SBChat.hideDashboard();
            }
        });

        $(main).on('click', '.sb-privacy .sb-decline', function () {
            let privacy = $(this).closest('.sb-privacy');
            $(privacy).find('.sb-text').html($(privacy).attr('data-decline'));
            $(privacy).find('.sb-decline').remove();
            SBChat.scrollBottom(true);
        });

        // Popup message
        $(main).on('click', '.sb-popup-message .sb-icon-close', function () {
            SBChat.popup(true);
        });

        // Rich messages and inputs
        $(main).on('click', '.sb-rich-message .sb-submit,.sb-rich-message:not(.sb-rich-registration) .sb-select ul li', function () {
            let message = $(this).closest('.sb-rich-message');
            if (!message[0].hasAttribute('disabled')) {
                SBRichMessages.submit(message, message.attr('data-type'), this);
            };
        });

        $(main).on('click', '.sb-rich-message .sb-input > span', function () {
            $(this).sbActive(true);
            $(this).siblings().focus();
        });

        $(main).on('focus focusout click', '.sb-rich-message .sb-input input,.sb-rich-message .sb-input select', function (e) {
            switch (e.type) {
                case 'focusin':
                case 'focus':
                    $(this).siblings().sbActive(true);
                    break;
                case 'focusout':
                    if ($(this).val()) {
                        $(this).siblings().addClass('sb-filled sb-active');
                    } else {
                        setTimeout(() => {
                            if (!prevent_focusout) {
                                $(this).siblings().sbActive(false);
                            }
                        }, 100);
                    }
                    break;
                case 'click':
                    $(this).siblings().removeClass('sb-filled');
                    break;
            }
        });

        $(main).on('click', '.sb-input-select-input > div', function () {
            prevent_focusout = true;
            setTimeout(() => {
                prevent_focusout = false;
            }, 250);
        });

        $(main).on('click', '.sb-slider-arrow', function () {
            SBRichMessages.sliderChange($(this).closest('[id]').attr('id'), $(this).hasClass('sb-icon-arrow-right') ? 'right' : 'left');
        });

        $(main).on('change', '.sb-rich-message [data-type="select"] select', function () {
            $(this).siblings().sbActive(true);
        });

        $(main).on('click', '[data-type="select-input"] > div', function () {
            $(this).prev().sbActive(true);
            $(this).next().addClass('sb-focus');
        });

        $(main).on('focusout', '[data-type="select-input"] input,[data-type="select-input"] select', function () {
            let cnt = $(this).closest('.sb-input');
            if (cnt.find('input[type="number"]').val() + cnt.find('select').val() == '') {
                cnt.find('span').sbActive(false);
            }
            cnt.find('.sb-focus').removeClass('sb-focus');
        });

        // Registration and Login
        $(main).on('click', '.sb-rich-registration .sb-login-area', function () {
            let init = main.hasClass('sb-init-form-active');
            $(this).closest('.sb-rich-registration').replaceWith(SBRichMessages.generate({}, 'login', init ? 'sb-init-form' : ''));
            SBChat.scrollBottom(init);
        });

        $(main).on('click', '.sb-rich-login .sb-registration-area', function () {
            if (CHAT_SETTINGS.registration_link) {
                document.location = CHAT_SETTINGS.registration_link;
            } else {
                let init = main.hasClass('sb-init-form-active');
                $(this).closest('.sb-rich-login').replaceWith(SBRichMessages.generate({}, 'registration', init ? 'sb-init-form' : ''));
                SBChat.scrollBottom(init);
            }
        });

        $(main).on('click', '.sb-rich-login .sb-submit-login', function () {
            SBF.loginForm(this, false, (response) => {
                let area = $(this).closest('.sb-rich-login');
                activeUser(new SBUser(response[0]));
                if (area.hasClass('sb-init-form')) {
                    force_action = 'open-conversation';
                    SBChat.initChat();
                    SBPusher.start();
                    if (!SBChat.isInitDashboard()) {
                        SBChat.hideDashboard();
                    }
                    $(document).on('SBPopulateConversations', function () {
                        main.removeClass('sb-init-form-active');
                        area.remove();
                        $(document).off('SBPopulateConversations');
                    });
                } else {
                    area = area.closest('[data-id]');
                    let message = SBChat.conversation.getMessage(area.attr('data-id'));
                    let text = `${sb_('Logged in as')} *${activeUser().name}*`;
                    message.set('message', text);
                    SBChat.updateMessage(message.id, text);
                    area.replaceWith(message.getCode());
                    SBPusher.started = false;
                    SBPusher.start();
                }
            });
        });

        // Social share buttons
        $(chat).on('click', '.sb-social-buttons div', function () {
            SBF.openWindow($(this).attr('data-link'));
        });

        // Archive chat
        $(main).on('click', '.sb-close-chat', function () {
            SBChat.closeChat();
        });

        // WooCommerce
        $(chat).on('click', '.sb-rich-woocommerce-button a, [href="#"].sb-card-btn', function (e) {
            let settings = SBF.settingsStringToArray($(this).closest('.sb-rich-message').attr('data-settings'));
            let checkout = settings['link-type'] == 'checkout' || settings.checkout;
            let product_ids = $(this)[0].hasAttribute('data-ids') ? $(this).attr('data-ids').split(',') : [settings.id.split('|')[$(this).parent().index()]];
            if (product_ids.length) {
                if (loading(this)) return;
                SBApps.wordpress.ajax('button-purchase', { product_ids: product_ids, checkout: checkout, coupon: settings.coupon }, (response) => {
                    if (checkout) {
                        document.location = response;
                    } else {
                        $(this).addClass('sb-icon-check').sbLoading(false);
                    }
                });
            }
            e.preventDefault();
            return false;
        });

        $(chat).on('click', '#sb-waiting-list .sb-submit', function () {
            if ($(this).index() == 0) {
                setTimeout(() => { SBApps.woocommerce.waitingList('submit') }, 1000);
            }
        });

        $(document).on('SBNewEmailAddress', function (e, response) {
            if (response.id == 'sb-waiting-list-email') {
                SBApps.woocommerce.waitingList('submit');
            }
        });

        // Audio player
        $(chat).on('click', '.sb-player-btn', function () {
            let audio = $(this).parent().find('audio').get(0);
            let stopped = $(this).hasClass('sb-icon-play');
            chat.find('audio').each(function () {
                $(this).get(0).pause();
                $(this).unbind('ended');
                $(this).parent().find('.sb-player-btn').removeClass('sb-icon-pause').addClass('sb-icon-play');
            });
            if (stopped) {
                audio.play();
                $(this).removeClass('sb-icon-play');
            } else {
                audio.pause();
            }
            $(audio).unbind('ended');
            $(audio).bind('ended', () => {
                $(this).removeClass('sb-icon-pause').addClass('sb-icon-play');
            });
            $(this).addClass('sb-icon-' + (stopped ? 'pause' : 'play'));
        });

        $(chat).on('click', '.sb-player-speed', function () {
            let parent = $(this).parent();
            if (parent.find('.sb-player-btn').hasClass('sb-icon-pause')) {
                let element = $(this).find('.sb-player-speed-number');
                let speed = parseFloat(element.html());
                speed += 0.5;
                if (speed > 2) {
                    speed = 1;
                }
                parent.find('audio').get(0).playbackRate = speed;
                element.html(speed);
            }
        });

        $(chat).on('click', '.sb-player-download', function () {
            window.open($(this).parent().find('audio source').attr('src'));
        });

        // Audio recording
        $(chat_editor).on('click', '.sb-btn-audio-clip', function () {
            navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
                audio_recorder_chunks = [];
                audio_recorder = new MediaRecorder(stream);
                audio_recorder.addEventListener('dataavailable', e => {
                    audio_recorder_chunks.push(e.data);
                });
                if (!audio_recorder_dom) {
                    audio_recorder_dom = chat_editor.find('#sb-audio-clip');
                    audio_recorder_dom_time = audio_recorder_dom.find('.sb-audio-clip-time');
                    audio_recorder_dom.on('click', '.sb-btn-mic', function () {
                        let is_pause = $(this).hasClass('sb-icon-pause');
                        if (is_pause) {
                            audio_recorder.stop();
                        } else {
                            let button = audio_recorder_dom.find('.sb-btn-clip-player');
                            if (button.hasClass('sb-icon-pause')) {
                                button.click();
                            }
                            audio_recorder.start();
                        }
                        audio_recorder_time[2] = !is_pause;
                        audio_recorder_time_player[3] = false;
                        audio_recorder_dom.find('.sb-icon-play').sbActive(is_pause);
                        $(this).removeClass('sb-icon-' + (is_pause ? 'pause' : 'mic')).addClass('sb-icon-' + (is_pause ? 'mic' : 'pause'));
                    });
                    audio_recorder_dom.on('click', '.sb-btn-clip-player', function () {
                        let is_pause = $(this).hasClass('sb-icon-pause');
                        if (is_pause) {
                            audio_recorder_time_player[3].pause();
                            audio_recorder_time_player[2] = false;
                        } else {
                            if (audio_recorder_time_player[3]) {
                                audio_recorder_time_player[3].play();
                                audio_recorder_time_player[2] = true;
                            } else {
                                let audio = new Audio(URL.createObjectURL(new Blob(audio_recorder_chunks, { type: 'audio/webm' })));
                                audio_recorder_dom_time.html('0:00');
                                audio.play();
                                audio.onended = () => {
                                    audio_recorder_time_player[0] = 0;
                                    audio_recorder_time_player[2] = false;
                                    audio_recorder_dom_time.html('0:00');
                                    $(this).removeClass('sb-icon-pause').addClass('sb-icon-play');
                                }
                                audio_recorder_time_player[0] = 0;
                                audio_recorder_time_player[2] = true;
                                audio_recorder_time_player[3] = audio;
                            }
                        }
                        $(this).removeClass('sb-icon-' + (is_pause ? 'pause' : 'play')).addClass('sb-icon-' + (is_pause ? 'play' : 'pause'));
                    });
                    audio_recorder_dom.on('click', '.sb-icon-close', function () {
                        audio_recorder_chunks = [];
                        clearInterval(audio_recorder_time[1]);
                        clearInterval(audio_recorder_time_player[1]);
                        audio_recorder_dom.sbActive(false);
                        chat_editor.sbActive(false).removeClass('sb-audio-message-active');
                        audio_recorder.stop();
                        audio_recorder_stream.getTracks()[0].stop();
                    });
                }
                audio_recorder_dom_time.html('0:00');
                audio_recorder_stream = stream;
                clearInterval(audio_recorder_time[1]);
                clearInterval(audio_recorder_time_player[1]);
                audio_recorder_time = [0, setInterval(() => {
                    if (audio_recorder_time[2]) {
                        audio_recorder_time[0]++;
                        audio_recorder_dom_time.html(getMinutesSeconds(audio_recorder_time[0]));
                    }
                }, 1000), true];
                audio_recorder_time_player = [0, setInterval(() => {
                    if (audio_recorder_time_player[2]) {
                        audio_recorder_time_player[0]++;
                        audio_recorder_dom_time.html(getMinutesSeconds(audio_recorder_time_player[0]));
                    }
                }, 1000), false, false];
                audio_recorder.start();
                audio_recorder_dom.find('.sb-btn-clip-player').removeClass('sb-icon-pause').addClass('sb-icon-play').sbActive(false);
                audio_recorder_dom.find('.sb-icon-mic').removeClass('sb-icon-mic').addClass('sb-icon-pause');
                audio_recorder_dom.sbActive(true);
                chat_textarea.val('').css('height', '');
                chat_editor.sbActive(true).addClass('sb-audio-message-active');
            }).catch(error => {
                alert(error);
            });
        });

        // Overlay panel
        $(chat).on('click', '[data-action].sb-rich-btn', function (e) {
            SBRichMessages.calendly.load($(this).attr('data-extra'), $(this).html(), $(this).closest('[data-id]').attr('data-id'));
            e.preventDefault();
            return false;
        });

        $(main).on('click', '.sb-overlay-panel > div:first-child i', function () {
            main.find('.sb-overlay-panel').sbActive(false);
        });

        /*
        * ----------------------------------------------------------
        * COMPONENTS
        * ----------------------------------------------------------
        */

        // Search
        $(global).on('click', '.sb-search-btn > i', function () {
            let parent = $(this).parent();
            let active = $(parent).sbActive();
            if (active) {
                setTimeout(() => { $(parent).find('input').val('') }, 50);
                setTimeout(() => { $(parent).find('input').trigger('change') }, 550);
            };
            $(parent).sbActive(!active);
            $(parent).find('input').get(0).focus();
            global.find('.sb-select ul').sbActive(false);
        });

        // Select
        $(global).on('click', '.sb-select', function (e) {
            if (!e.target || !$(e.target).is('input')) {
                let ul = $(this).find('ul');
                let active = ul.hasClass('sb-active');
                $(global).find('.sb-select ul').sbActive(false);
                ul.setClass('sb-active', !active);
                $(this).find('.sb-select-search').setClass('sb-active', !active);
                if (admin) {
                    SBAdmin.open_popup = active ? false : this;
                }
            }
        });

        $(global).on('click', '.sb-select li', function () {
            let select = $(this).closest('.sb-select');
            let value = $(this).data('value');
            let item = $(select).find(`[data-value="${value}"]`);
            select.find('li').sbActive(false);
            select.find('p').attr('data-value', value).html($(item).html());
            item.sbActive(true);
        });

        $(global).on('input', '.sb-select-search input', function (e) {
            let search = $(this).val();
            SBF.search(search, () => {
                let list = $(this).parent().parent().find('li');
                list.setClass('sb-hide', search.length);
                if (search.length) {
                    search = search.toLowerCase();
                    list.each(function () {
                        if ($(this).attr('data-value').includes(search) || $(this).attr('data-country').includes(search)) {
                            $(this).removeClass('sb-hide');
                        }
                    });
                }
            });
        });

        // Image uploader
        $(global).on('click', '.sb-input-image .image', function () {
            upload_target = $(this).parent();
            chat_editor.find('.sb-upload-files').click();
        });

        $(global).on('click', '.sb-input-image .image > .sb-icon-close', function (e) {
            SBF.ajax({ function: 'delete-file', path: $(this).parent().attr('data-value') });
            $(this).parent().removeAttr('data-value').css('background-image', '');
            e.preventDefault();
            return false;
        });
    }

}(jQuery));