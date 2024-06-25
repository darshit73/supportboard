
/*
 * ==========================================================
 * ADMINISTRATION SCRIPT
 * ==========================================================
 *
 * Main Javascript admin file. © 2017-2024 board.support. All rights reserved.
 * 
 */

'use strict';

(function ($) {

    // Global
    var admin;
    var header;

    // Conversation  
    var conversations = [];
    var conversation_area;
    var conversations_area;
    var conversations_area_list;
    var conversations_user_details;
    var conversations_admin_list;
    var conversations_admin_list_ul;
    var conversations_filters;
    var saved_replies = false;
    var saved_replies_list = false;
    var woocommerce_products_box = false;
    var woocommerce_products_box_ul = false;
    var pagination = 1;
    var notes_panel;
    var tags_panel;
    var attachments_panel;
    var direct_message_box;
    var dialogflow_intent_box;
    var suggestions_area;
    var pagination_count = 1;
    var open_ai_button;

    // Users
    var users_area;
    var users_table;
    var users_table_menu;
    var users = {};
    var users_pagination = 1;
    var users_pagination_count = 1;
    var profile_box;
    var profile_edit_box;
    var away_mode = true;

    // Settings
    var settings_area;
    var automations_area;
    var automations_area_select;
    var automations_area_nav;
    var conditions_area;

    // Articles
    var articles_area;
    var articles_content;
    var articles_content_categories;
    var articles_category_select;
    var articles_category_parent_select;
    var articles_save_required = false;
    var articles_save_required_stop = true;

    // Miscellaneus
    var upload_target;
    var upload_on_success;
    var language_switcher_target;
    var timeout;
    var alertOnConfirmation;
    var alertOnCancel;
    var responsive = $(window).width() < 465;
    var scrolls = { last: 0, header: true, always_hidden: false };
    var localhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    var today = new Date();
    var is_busy = false;
    var agent_online = true;
    var active_interval = false;
    var pusher_timeout;
    var away_timeout;
    var temp;
    var overlay;
    var SITE_URL;
    var ND = 'undefined';
    var wp_admin = false;
    var touchmove;
    var touchmove_x;
    var touchmove_y;
    var editor_js = false;
    var editor_js_saving = false;
    var editor_js_loading = false;
    var interval = false;
    var active_keydown;
    var reports_area;
    var select_departments;

    /*
    * ----------------------------------------------------------
    * External plugins
    * ----------------------------------------------------------
    */

    // miniTip 1.5.3 | (c) 2011, James Simpson | Dual licensed under the MIT and GPL
    $.fn.miniTip = function (t) { var e = $.extend({ title: '', content: !1, delay: 300, anchor: 'n', event: 'hover', fadeIn: 200, fadeOut: 200, aHide: !0, maxW: '250px', offset: 5, stemOff: 0, doHide: !1 }, t); admin && 0 == admin.find('#miniTip').length && admin.append('<div id="miniTip" class="sb-tooltip"><div></div></div>'); var n = admin.find('#miniTip'), a = n.find('div'); return e.doHide ? (n.stop(!0, !0).fadeOut(e.fadeOut), !1) : this.each(function () { var t = $(this), o = e.content ? e.content : t.attr('title'); if ('' != o && void 0 !== o) { window.delay = !1; var i = !1, r = !0; e.content || t.removeAttr('title'), 'hover' == e.event ? (t.hover(function () { n.removeAttr('click'), r = !0, s.call(this) }, function () { r = !1, d() }), e.aHide || n.hover(function () { i = !0 }, function () { i = !1, setTimeout(function () { !r && !n.attr('click') && d() }, 20) })) : 'click' == e.event && (e.aHide = !0, t.click(function () { return n.attr('click', 't'), n.data('last_target') !== t ? s.call(this) : 'none' == n.css("display") ? s.call(this) : d(), n.data('last_target', t), $('html').unbind('click').click(function (t) { 'block' == n.css('display') && !$(t.target).closest('#miniTip').length && ($('html').unbind('click'), d()) }), !1 })); var s = function () { e.show && e.show.call(this, e), e.content && '' != e.content && (o = e.content), a.html(o), e.render && e.render(n), n.hide().width('').width(n.width()).css('max-width', e.maxW); var i = t.is('area'); if (i) { var r, s = [], d = [], c = t.attr('coords').split(','); function h(t, e) { return t - e } for (r = 0; r < c.length; r++)s.push(c[r++]), d.push(c[r]); var f = t.parent().attr('name'), l = $('img[usemap=\\#' + f + ']').offset(), p = parseInt(l.left, 10) + parseInt((parseInt(s.sort(h)[0], 10) + parseInt(s.sort(h)[s.length - 1], 10)) / 2, 10), u = parseInt(l.top, 10) + parseInt((parseInt(d.sort(h)[0], 10) + parseInt(d.sort(h)[d.length - 1], 10)) / 2, 10) } else u = parseInt(t.offset().top, 10), p = parseInt(t.offset().left, 10); var m = i ? 0 : parseInt(t.outerWidth(), 10), I = i ? 0 : parseInt(t.outerHeight(), 10), v = n.outerWidth(), w = n.outerHeight(), g = Math.round(p + Math.round((m - v) / 2)), T = Math.round(u + I + e.offset + 8), b = Math.round(v - 16) / 2 - parseInt(n.css('borderLeftWidth'), 10), y = 0, H = p + m + v + e.offset + 8 > parseInt($(window).width(), 10), W = v + e.offset + 8 > p, k = w + e.offset + 8 > u - $(window).scrollTop(), M = u + I + w + e.offset + 8 > parseInt($(window).height() + $(window).scrollTop(), 10), x = e.anchor; W || 'e' == e.anchor && !H ? 'w' != e.anchor && 'e' != e.anchor || (x = 'e', y = Math.round(w / 2 - 8 - parseInt(n.css('borderRightWidth'), 10)), b = -8 - parseInt(n.css('borderRightWidth'), 10), g = p + m + e.offset + 8, T = Math.round(u + I / 2 - w / 2)) : (H || 'w' == e.anchor && !W) && ('w' != e.anchor && 'e' != e.anchor || (x = 'w', y = Math.round(w / 2 - 8 - parseInt(n.css('borderLeftWidth'), 10)), b = v - parseInt(n.css('borderLeftWidth'), 10), g = p - v - e.offset - 8, T = Math.round(u + I / 2 - w / 2))), M || 'n' == e.anchor && !k ? 'n' != e.anchor && 's' != e.anchor || (x = 'n', y = w - parseInt(n.css('borderTopWidth'), 10), T = u - (w + e.offset + 8)) : (k || 's' == e.anchor && !M) && ('n' != e.anchor && 's' != e.anchor || (x = 's', y = -8 - parseInt(n.css('borderBottomWidth'), 10), T = u + I + e.offset + 8)), 'n' == e.anchor || 's' == e.anchor ? v / 2 > p ? (g = g < 0 ? b + g : b, b = 0) : p + v / 2 > parseInt($(window).width(), 10) && (g -= b, b *= 2) : k ? (T += y, y = 0) : M && (T -= y, y *= 2), delay && clearTimeout(delay), delay = setTimeout(function () { n.css({ 'margin-left': g + 'px', 'margin-top': T + 'px' }).stop(!0, !0).fadeIn(e.fadeIn) }, e.delay), n.attr('class', 'sb-tooltip ' + x) }, d = function () { (!e.aHide && !i || e.aHide) && (delay && clearTimeout(delay), delay = setTimeout(function () { c() }, e.delay)) }, c = function () { !e.aHide && !i || e.aHide ? (n.stop(!0, !0).fadeOut(e.fadeOut), e.hide && e.hide.call(this)) : setTimeout(function () { d() }, 200) } } }) };

    /*
    * ----------------------------------------------------------
    * Functions
    * ----------------------------------------------------------
    */

    // Language switcher
    $.fn.sbLanguageSwitcher = function (langs = [], source = '', active_language = false) {
        let code = `<div class="sb-language-switcher" data-source="${source}">`;
        let added = [];
        let element = $(this).hasClass('sb-language-switcher-cnt') ? $(this) : $(this).find('.sb-language-switcher-cnt');
        for (var i = 0; i < langs.length; i++) {
            let language = isString(langs[i]) ? langs[i] : langs[i][0];
            let id = isString(langs[i]) || !langs[i][1] ? false : langs[i][1];
            if (added.includes(language)) {
                continue;
            }
            code += `<span ${active_language == language ? 'class="sb-active" ' : ''}data-language="${language}"${id ? ' data-id="' + id + '"' : ''}><i class="sb-icon-close"></i><img src="${SB_URL}/media/flags/${language.toLowerCase()}.png" /></span>`;
            added.push(language);
        }
        element.find('.sb-language-switcher').remove();
        element.append(code + `<i data-sb-tooltip="${sb_('Add translation')}" class="sb-icon-plus"></i></div>`);
        element.sbInitTooltips();
        return this;
    }

    // Lightbox
    $.fn.sbShowLightbox = function (popup = false, action = '') {
        admin.find('.sb-lightbox').sbActive(false);
        overlay.sbActive(true);
        $(this).sbActive(true);
        if (popup) {
            $(this).addClass('sb-popup-lightbox').attr('data-action', action);
        } else {
            $(this).css({ 'margin-top': ($(this).outerHeight() / -2) + 'px', 'margin-left': ($(this).outerWidth() / -2) + 'px' })
        }
        $('body').addClass('sb-lightbox-active');
        setTimeout(() => { SBAdmin.open_popup = this }, 500);
        this.preventDefault;
        return this;
    }

    $.fn.sbHideLightbox = function () {
        $(this).find('.sb-lightbox,.sb-popup-lightbox').sbActive(false).removeClass('sb-popup-lightbox').removeAttr('data-action');
        overlay.sbActive(false);
        $('body').removeClass('sb-lightbox-active');
        SBAdmin.open_popup = false;
        return this;
    }

    //Tooltip init
    $.fn.sbInitTooltips = function () {
        $(this).find('[data-sb-tooltip]').each(function () {
            $(this).miniTip({
                content: $(this).attr('data-sb-tooltip'),
                anchor: 's',
                delay: 500
            });
        });
        return this;
    }

    function infoBottom(text, type = false) {
        return SBAdmin.infoBottom(text, type);
    }

    function infoPanel(text, type, onConfirm = false, id = '', title = '', scroll = false, skip = false, onCancel = false) {
        return SBAdmin.infoPanel(text, type, onConfirm, id, title, scroll, skip, onCancel);
    }

    function activeUser(value) {
        return SBAdmin.activeUser(value);
    }

    function loading(element) {
        return SBAdmin.loading(element);
    }

    function loadingGlobal(show = true, is_overlay = true) {
        return SBAdmin.loadingGlobal(show, is_overlay);
    }

    // Support Board js translations
    function sb_(text) {
        return SB_TRANSLATIONS && text in SB_TRANSLATIONS ? SB_TRANSLATIONS[text] : text;
    }

    // PWA functions
    function isPWA() {
        return (window.matchMedia('(display-mode: standalone)').matches) || (window.navigator.standalone) || document.referrer.includes('android-app://');
    }

    function clearCache() {
        if (typeof caches !== ND) caches.delete('sb-pwa-cache');
    }

    // Collapse
    function collapse(target, max_height) {
        target = $(target);
        let content = target.find('> div, > ul');
        content.css({ 'height': '', 'max-height': '' });
        if (target.hasClass('sb-collapse') && $(content).prop('scrollHeight') > max_height) {
            target.sbActive(true).attr('data-height', max_height);
            target.find('.sb-collapse-btn').remove();
            target.append(`<a class="sb-btn-text sb-collapse-btn">${sb_('View more')}</a>`);
            content.css({ 'height': max_height + 'px', 'max-height': max_height + 'px' });
        };
    }

    function searchInput(input, searchFunction) {
        let icon = $(input).parent().find('i');
        let search = $(input).val();
        SBF.search(search, () => {
            icon.sbLoading(true);
            searchFunction(search, icon);
        });
    }

    function scrollPagination(area, check = false, offset = 0) {
        if (check) return $(area).scrollTop() + $(area).innerHeight() >= ($(area)[0].scrollHeight - 1);
        $(area).scrollTop($(area)[0].scrollHeight - offset);
    }

    // Editor JS
    function editorJSLoad(data = false) {
        if (editor_js_loading) return;
        if (editor_js === false) {
            editor_js = true;
            $.getScript(SB_URL + '/vendor/editorjs.js', () => {
                editorJSLoad(data);
            });
            return;
        }
        editorJSDestroy();
        editor_js_loading = true;
        editor_js = new EditorJS({
            data: isString(data) ? { time: Date.now(), blocks: [data ? { id: 'sb', type: 'raw', data: { html: data } } : { id: 'sb', type: 'paragraph', data: { text: '' } }] } : data,
            i18n: {
                messages: {
                    ui: {
                        'blockTunes': {
                            'toggler': {
                                'Click to tune': sb_('Click to tune')
                            },
                        },
                        'inlineToolbar': {
                            'converter': {
                                'Convert to': sb_('Convert to')
                            }
                        },
                        'toolbar': {
                            'toolbox': {
                                'Add': sb_('Add')
                            }
                        }
                    },
                    toolNames: {
                        'Text': sb_('Text'),
                        'Heading': sb_('Heading'),
                        'List': sb_('List'),
                        'Image': sb_('Image'),
                        'Code': sb_('Code'),
                        'Raw HTML': sb_('Raw HTML'),
                        'Bold': sb_('Bold'),
                        'Italic': sb_('Italic'),
                        'Link': sb_('Link'),
                    },
                    tools: {
                        'list': {
                            'Ordered': sb_('Ordered'),
                            'Unordered': sb_('Unordered')
                        }
                    },
                    blockTunes: {
                        'delete': {
                            'Delete': sb_('Delete')
                        },
                        'moveUp': {
                            'Move up': sb_('Move up')
                        },
                        'moveDown': {
                            'Move down': sb_('Move down')
                        }
                    },
                },
                direction: admin.hasClass('sb-rtl') ? 'rtl' : 'ltr'
            },
            tools: {
                list: {
                    class: List,
                    inlineToolbar: true
                },
                image: {
                    class: ImageTool,
                    config: {
                        uploader: {
                            uploadByFile(file) {
                                let form = new FormData();
                                form.append('file', file);
                                return new Promise((resolve) => {
                                    $.ajax({
                                        url: SB_URL + '/include/upload.php',
                                        cache: false,
                                        contentType: false,
                                        processData: false,
                                        data: form,
                                        type: 'POST',
                                        success: function (response) {
                                            response = JSON.parse(response);
                                            if (response[0] == 'success') {
                                                resolve({
                                                    success: 1,
                                                    file: {
                                                        url: response[1],
                                                    }
                                                })
                                            } else console.log(response);
                                        }
                                    })
                                })
                            }
                        }
                    }
                },
                header: Header,
                code: CodeTool,
                raw: RawTool
            },
            onReady: () => {
                editor_js_loading = false;
                articles_save_required_stop = true;
                articles_save_required = false;
            },
            onChange: () => {
                if (articles_save_required_stop) {
                    articles_save_required_stop = false;
                } else {
                    articles_save_required = true;
                }
            },
            minHeight: 50
        });
    }

    function editorJSHTML(blocks) {
        let code = '';
        blocks.map(block => {
            switch (block.type) {
                case 'header':
                    code += `<h${block.data.level}>${block.data.text}</h${block.data.level}>`;
                    break;
                case 'paragraph':
                    code += `<p>${block.data.text}</p>`;
                    break;
                case 'image':
                    code += `<img class="img-fluid" src="${block.data.file.url}" title="${block.data.caption}" /><em>${block.data.caption}</em>`;
                    break;
                case 'list':
                    code += '<ul class="sb-ul-' + block.data.style + '">';
                    block.data.items.forEach(function (li) {
                        code += `<li>${li}</li>`;
                    });
                    code += '</ul>';
                    break;
                case 'code':
                    code += `<code>${block.data.code}</code>`;
                    break;
                case 'raw':
                    code += `<div class="bxc-raw-html">${block.data.html}</div>`;
                    break;
            }
        });
        return code;
    }

    function editorJSDestroy() {
        if (typeof editor_js.destroy !== ND) {
            editor_js.destroy();
            editor_js = false;
        }
    }

    // Miscellaneous 
    function isString(object) {
        return typeof object === 'string';
    }

    function pushState(url_parameters) {
        if (wp_admin) return;
        window.history.pushState('', '', url_parameters);
    }

    function cloudURL() {
        return SB_ADMIN_SETTINGS.cloud ? ('&cloud=' + SB_ADMIN_SETTINGS.cloud.token) : '';
    }

    function urlStrip(url) {
        return url.replace('https://', '').replace('http://', '').replace('www.', '').replace(/\/$/, '');
    }

    function absolute_url(url, base_url) {
        if (url) {
            if (url.indexOf('http') === 0 || url.indexOf('www') === 0) {
                return url;
            }
            base_url = new URL(base_url);
            if (url.substring(0, 2) == "//") {
                return base_url.protocol + url;
            }
            if (url.charAt(0) == '/') {
                return base_url.protocol + '//' + base_url.host + url;
            }
            if (/^\s*$/.test(url)) {
                return '';
            }
            if (url.substring(0, 2) == './') {
                url = '.' + url;
            }
            url = (base_url.href.slice(-1) == '/' ? base_url.href.slice(0, -1) : base_url.href) + '/' + url;
            while (/\/\.\.\//.test(url = url.replace(/[^\/]+\/+\.\.\//g, '')));
            url = url.replace(/\.$/, '').replace(/\/\./g, '').replace(/"/g, '%22').replace(/'/g, '%27').replace(/</g, '%3C').replace(/>/g, '%3E');
            return url;
        }
        return '';
    }

    function saved_reply_search(search) {
        SBF.search(search, () => {
            let code = '';
            let all = search.length > 1 ? false : true;
            let area = saved_replies.find('.sb-replies-list > ul');
            let no_results = `<li class="sb-no-results">${sb_('No results found.')}</li>`;
            for (var i = 0; i < saved_replies_list.length; i++) {
                if (all || saved_replies_list[i]['reply-name'].toLowerCase().includes(search) || saved_replies_list[i]['reply-text'].toLowerCase().includes(search)) {
                    code += `<li><div>${saved_replies_list[i]['reply-name']}</div><div>${saved_replies_list[i]['reply-text']}</div></li>`;
                }
            }
            area.html(code);
            if (!all && SB_ADMIN_SETTINGS.dialogflow) {
                let icon = area.closest('.sb-popup').find('.sb-icon-search');
                icon.sbLoading(true);
                SBApps.dialogflow.getIntents((response) => {
                    let intents = SBApps.dialogflow.searchIntents(search, true);
                    let code_2 = '';
                    for (var i = 0; i < intents.length; i++) {
                        let text = intents[i].messages[0].text;
                        if (text && text.text) {
                            code_2 += `<li><div>${intents[i].displayName}</div><div>${intents[i].messages[0].text.text[0]}</div></li>`;
                        }
                    }
                    area.append(code_2 ? code_2 : (code ? '' : no_results));
                    icon.sbLoading(false);
                });
            } else if (!code) {
                area.html(no_results);
            }
        });
    }

    function whatsapp_direct_message_box(user_ids) {
        let box = admin.find('#sb-whatsapp-send-template-box');
        loadingGlobal();
        SBF.ajax({
            function: 'whatsapp-get-templates'
        }, (response) => {
            let code = '<option value=""></option>';
            let provider = response[0];
            let twilio = provider == 'twilio';
            response = response[1];
            if (response.error) {
                return infoBottom(response.error.message, 'error');
            }
            if (!Array.isArray(response)) {
                return infoBottom(response, 'error');
            }
            for (var i = 0; i < response.length; i++) {
                if (provider == 'official' && response[i].status == 'APPROVED' && (!SB_ACTIVE_AGENT.department || !response[i].department || SB_ACTIVE_AGENT.department == !response[i].department)) {
                    code += `<option value="${response[i].name}" data-languages="${response[i].languages}" data-phone-id="${response[i].phone_number_id}">${response[i].name} (${response[i].label})</option>`;
                }
                if (twilio) {
                    code += `<option value="${response[i].sid}">${response[i].friendly_name}</option>`;
                }
            }
            box.attr('data-provider', provider);
            box.find('#sb-whatsapp-send-template-list').html(code);
            SBForm.clear(box);
            box.find('.sb-direct-message-users').val(user_ids.length ? user_ids.join(',') : 'all');
            box.find('.sb-bottom > div').html('');
            box.find('.sb-loading').sbLoading(false);
            loadingGlobal(false);
            box.sbShowLightbox();
        });
    }

    function dialogDeleteFile(url, id, title) {
        window.open(url);
        infoPanel(`${sb_('For security reasons, delete the file after downloading it. Close this window to automatically delete it. File location:')}<pre>${url}</pre>`, 'info', false, id, title);
    }

    function touchEndEvent() {
        touchmove_x = false;
        touchmove_y = false;
        setTimeout(() => {
            if (touchmove) {
                touchmove[1].css('transform', '');
                touchmove[1].removeClass('sb-touchmove');
            }
        }, 100);
    }

    function getListConversation(conversation_id) {
        return conversations_admin_list_ul.find(`[data-conversation-id="${conversation_id}"]`);
    }

    /*
    * ----------------------------------------------------------
    * Apps
    * ----------------------------------------------------------
    */

    var SBApps = {

        dialogflow: {
            intents: false,
            token: SBF.storage('dialogflow-token'),
            dialogflow_languages: [],
            original_response: false,
            smart_reply_busy: false,

            smartReply: function (message = false) {
                let conversation_id = SBChat.conversation.id;
                if (this.smart_reply_busy == conversation_id) {
                    return;
                }
                this.smart_reply_busy = conversation_id;
                SBF.ajax({
                    function: 'dialogflow-smart-reply',
                    message: message,
                    token: this.token,
                    conversation_id: conversation_id,
                    dialogflow_languages: this.dialogflow_languages,
                }, (response) => {
                    this.smart_reply_busy = false;
                    if (SBChat.conversation.id && conversation_id === SBChat.conversation.id) {
                        let suggestions = response.suggestions;
                        let code = '';
                        let is_bottom = conversations_area_list[0].scrollTop === (conversations_area_list[0].scrollHeight - conversations_area_list[0].offsetHeight);
                        let last_conversation_message = SBChat.conversation && SBChat.conversation.getLastMessage() ? SBChat.conversation.getLastMessage().message : false;
                        if (response.token) {
                            this.token = response.token;
                            SBF.storage('dialogflow-token', response.token);
                        }
                        for (var i = 0; i < suggestions.length; i++) {
                            if (suggestions[i] != last_conversation_message) {
                                code += `<span>${suggestions[i]}</span>`;
                            }
                        }
                        suggestions_area.html(code);
                        if (is_bottom) SBChat.scrollBottom();
                    }
                    if (response.dialogflow_languages) {
                        this.dialogflow_languages = response.dialogflow_languages;
                    }
                });
            },

            showCreateIntentBox: function (message_id) {
                let expression = '';
                let message = SBChat.conversation.getMessage(message_id);
                let response = message.message;
                if (SBF.isAgent(message.get('user_type'))) {
                    expression = SBChat.conversation.getLastUserMessage(message.get('index'));
                    if (expression && expression.payload('sb-human-takeover')) {
                        expression = SBChat.conversation.getLastUserMessage(expression.get('index'));
                    }
                    if (expression) {
                        expression = expression.payload('translation') ? expression.payload('translation') : expression.message
                    }
                    if (message.payload('original-message')) {
                        response = message.payload('original-message');
                    }
                } else {
                    expression = message.payload('translation') ? message.payload('translation') : response;
                    let agent_message = SBChat.conversation.getNextMessage(message.id, 'agent');
                    if (agent_message) {
                        response = agent_message.payload('original-message') ? agent_message.payload('original-message') : agent_message.message;
                    }
                }
                if (!dialogflow_intent_box.hasClass('sb-dialogflow-disabled')) {
                    this.getIntents((response) => {
                        let code = '<option value="">' + sb_('New Intent') + '</option>';
                        for (var i = 0; i < response.length; i++) {
                            code += `<option value="${response[i].name}">${response[i].displayName}</option>`;
                        }
                        dialogflow_intent_box.find('#sb-intents-select').html(code);
                        SBApps.openAI.generateIntents(expression);
                    });
                }
                dialogflow_intent_box.attr('data-message-id', message.id);
                dialogflow_intent_box.find('.sb-type-text:not(.sb-first)').remove();
                dialogflow_intent_box.find('.sb-type-text input').val(expression);
                dialogflow_intent_box.find('#sb-intents-select').val('');
                dialogflow_intent_box.find('.sb-search-btn').sbActive(false).find('input').val('');
                this.searchIntents('');
                this.original_response = response;
                dialogflow_intent_box.find('textarea').val(response);
                dialogflow_intent_box.sbShowLightbox();
            },

            submitIntent: function (button) {
                if (loading(button)) return;
                let expressions = [];
                let response = dialogflow_intent_box.find('textarea').val();
                let intent_name = dialogflow_intent_box.find('#sb-intents-select').val();
                let services = dialogflow_intent_box.find('#sb-train-chatbots').val();
                dialogflow_intent_box.find('.sb-type-text input').each(function () {
                    if ($(this).val()) {
                        expressions.push($(this).val());
                    }
                });
                if ((!response && !intent_name) || expressions.length == 0) {
                    SBForm.showErrorMessage(dialogflow_intent_box, 'Please insert the bot response and at least one user expression.');
                    $(button).sbLoading(false);
                } else {
                    let is_dialogflow = services == 'open-ai' || dialogflow_intent_box.hasClass('sb-dialogflow-disabled');
                    SBF.ajax({
                        function: is_dialogflow ? 'embeddings-database' : (!intent_name ? 'dialogflow-create-intent' : 'dialogflow-update-intent'),
                        questions_answers: is_dialogflow ? [[expressions[0], response]] : false,
                        expressions: expressions,
                        response: response,
                        agent_language: dialogflow_intent_box.find('.sb-dialogflow-languages select').val(),
                        conversation_id: SBChat.conversation.id,
                        intent_name: intent_name,
                        services: services
                    }, (response) => {
                        $(button).sbLoading(false);
                        if (response === true) {
                            admin.sbHideLightbox();
                            infoBottom('Training completed');
                        } else {
                            SBForm.showErrorMessage(dialogflow_intent_box, response.error && response.error.message ? response.error && response.error.message : 'Error');
                        }
                    });
                }
            },

            getIntents: function (onSuccess) {
                if (this.intents === false) {
                    SBF.ajax({ function: 'dialogflow-get-intents' }, (response) => {
                        this.intents = Array.isArray(response) ? response : [];
                        onSuccess(this.intents);
                    });
                } else {
                    onSuccess(this.intents);
                }
            },

            searchIntents: function (search, return_intents = false) {
                let all = search.length > 1 ? false : true;
                let code = all ? `<option value="">${sb_('New Intent')}</option>` : '';
                let intents = this.intents;
                let intents_list = [];
                search = search.toLowerCase();
                for (var i = 0; i < intents.length; i++) {
                    let found = all || intents[i].displayName.toLowerCase().includes(search);
                    if (!found && intents[i].trainingPhrases) {
                        let training_phrases = intents[i].trainingPhrases;
                        for (var j = 0; j < training_phrases.length; j++) {
                            for (var y = 0; y < training_phrases[j].parts.length; y++) {
                                if (training_phrases[j].parts[y].text.toLowerCase().includes(search)) {
                                    found = true;
                                    break;
                                }
                            }
                            if (found) break;
                        }
                    }
                    if (found) {
                        if (return_intents) {
                            intents_list.push(intents[i]);
                        } else {
                            code += `<option value="${intents[i].name}">${intents[i].displayName}</option>`;
                        }
                    }
                }
                if (return_intents) {
                    return intents_list;
                } else {
                    dialogflow_intent_box.find('#sb-intents-select').html(code).change();
                }
                if (!search) {
                    dialogflow_intent_box.find('textarea').val(this.original_response);
                }
            },

            previewIntent: function (name) {
                let code = '';
                let intent = this.getIntent(name);
                if (intent) {
                    let training_phrases = intent.trainingPhrases ? intent.trainingPhrases : [];
                    let count = training_phrases.length;
                    if (count > 1) {
                        for (var j = 0; j < count; j++) {
                            for (var y = 0; y < training_phrases[j].parts.length; y++) {
                                code += `<span>${training_phrases[j].parts[y].text}</span>`;
                                if (y == 15) break;
                            }
                        }
                        infoPanel(code, 'info', false, 'intent-preview-box', '', count > 10);
                    }
                }
            },

            getIntent: function (name) {
                let code = '';
                for (var i = 0; i < this.intents.length; i++) {
                    if (this.intents[i].name == name) {
                        return this.intents[i];
                    }
                }
                return false;
            },

            translate: function (strings, language_code, onSuccess, message_ids, conversation_id) {
                if (strings.length) {
                    SBF.ajax({
                        function: 'google-translate',
                        strings: strings,
                        language_code: language_code,
                        token: this.token,
                        message_ids: message_ids,
                        conversation_id: conversation_id
                    }, (response) => {
                        this.token = response[1]
                        if (Array.isArray(response[0])) {
                            onSuccess(response[0]);
                        } else {
                            SBF.error(JSON.stringify(response[0]), 'SBApps.dialogflow.translate');
                            return false;
                        }
                    });
                }
            }
        },

        openAI: {
            urls_history: [],
            progress: 1,

            rewriteButton: function (value) {
                if (open_ai_button.length) {
                    open_ai_button.sbActive(value.length > 2 && value.indexOf(' '));
                }
            },

            rewrite: function (message, greetings = false, onSuccess) {
                SBF.ajax({
                    function: 'open-ai-message',
                    model: SB_ADMIN_SETTINGS.open_ai_model,
                    message: (SB_ADMIN_SETTINGS.open_ai_prompt_rewrite ? SB_ADMIN_SETTINGS.open_ai_prompt_rewrite : 'Make the following sentence more friendly and professional') + ` and use ${SB_LANGUAGE_CODES[SB_ADMIN_SETTINGS.active_agent_language]} language${greetings ? ', add greetings' : ''}: """${message.replace('"', '\'')}"""`,
                    extra: 'rewrite'
                }, (response) => {
                    if (!response[0]) {
                        console.error('OpenAI: ' + JSON.stringify(response[1]));
                    }
                    SBConversations.previous_editor_text = message;
                    onSuccess(response);
                });
            },

            generateIntents: function (expression) {
                if (SB_ADMIN_SETTINGS.open_ai_user_expressions && expression) {
                    let loader = dialogflow_intent_box.find('[data-value="add"]');
                    loader.sbLoading(true);
                    dialogflow_intent_box.find('.sb-open-ai-intent').remove();
                    SBF.ajax({ function: 'open-ai-user-expressions', message: expression }, (response) => {
                        let code = '';
                        for (var i = 0; i < response.length; i++) {
                            if (response[i]) {
                                code += `<div class="sb-input-setting sb-type-text sb-open-ai-intent"><input type="text" value="${response[i].replace(/"/g, '')}"></div>`;
                            }
                        }
                        if (code) dialogflow_intent_box.find('> div > .sb-type-text').last().after(code);
                        loader.sbLoading(false);
                    });
                }
            },

            crawler: {
                errors: [],
                base_url: false,
                start_urls: [],
                sitemap_processed_urls: [],
                active_source: false,
                history: [],
                training_button: false,

                start: function (urls) {
                    if (urls.length) {
                        let url = urls[0];
                        let dialog_box = admin.find('#sb-embeddings-box p');
                        urls.shift();
                        if (!url || !url.includes('http')) {
                            if (url) {
                                infoPanel(sb_('Use a valid URL starting with http. The URL {R} is not valid.').replace('{R}', url));
                            }
                            this.training_button.sbLoading(false);
                            return;
                        }
                        dialog_box.html(sb_('We are processing the source') + '<pre>' + url + '</pre><span>' + sb_('Only {R} sources left to complete.').replace('{R}', urls.length + 1) + '</span>');
                        if (url.includes('.xml')) {
                            this.active_source = url;
                            SBF.ajax({ function: 'get-sitemap-urls', sitemap_url: url }, (response) => {
                                if (Array.isArray(response)) {
                                    this.base_url = response[0];
                                    return this.start(urls.concat(response));
                                } else {
                                    console.error(response);
                                    return this.start(urls);
                                }
                            });
                        } else if (url.includes('.pdf') || url.includes('.txt')) {
                            this.active_source = url;
                            SBF.ajax({ function: 'open-ai-source-file-to-paragraphs', url: url }, (response) => {
                                if (Array.isArray(response)) {
                                    if (response.length) {
                                        this.embeddings(response, (response) => {
                                            if (response) {
                                                return this.start(urls);
                                            }
                                        });
                                    } else {
                                        return this.start(urls);
                                    }
                                } else {
                                    console.error(response);
                                    return this.start(urls);
                                }
                            });
                        } else if (this.start_urls.includes(url) && !this.sitemap_processed_urls.includes(url) && !SB_ADMIN_SETTINGS.open_ai_stop_crawler) {
                            this.active_source = url;
                            this.sitemap_processed_urls.push(url);
                            this.sitemap([url], (response) => {
                                return this.start(urls.concat(response));
                            });
                        } else {
                            if (!this.active_source) {
                                this.active_source = url;
                            }
                            this.getHTML(url, (response) => {
                                if (response[0].length) {
                                    let page = response[0];
                                    let paragraphs = [];
                                    page.find('ul').each(function () {
                                        let code = '';
                                        $(this).find('li').each(function () {
                                            $(this).find('ul').remove();
                                            let text = $(this).text().trim();
                                            if (text.split(' ').length > 1 && text.length > 10) {
                                                code += '###B###' + ($(this).index() + 1) + '. ' + $(this).text().trim();
                                            }
                                        });
                                        $(this).html(code);
                                    });
                                    page.find('p').each(function () {
                                        $(this).append('###B###');
                                    });
                                    page.find('span,label').each(function () {
                                        $(this).html(' ' + $(this).html() + ' ');
                                    });
                                    page.find('a').each(function () {
                                        let href = $(this).attr('href');
                                        if (href) {
                                            $(this).html(href.includes('http') ? href : absolute_url(href, SBApps.openAI.crawler.base_url ? SBApps.openAI.crawler.base_url : url));
                                        }
                                    });
                                    page.find('h1 + h2').each(function () {
                                        $(this).prev().append(' ' + $(this)[0].textContent);
                                        $(this).remove();
                                    });
                                    page.find('h1,h2').each(function () {
                                        $(this).prepend('--------------------------------------------------------------------------------').append(' \n');
                                    });
                                    page.find('h1,h2,h3,h4,h5,h6').each(function () {
                                        $(this).prepend('###P###');
                                    });
                                    page.find('nav, ul').each(function () {
                                        let text_inner = $(this)[0].textContent;
                                        if (!SBApps.openAI.crawler.history.includes(text_inner)) {
                                            SBApps.openAI.crawler.history.push(text_inner);
                                        } else {
                                            $(this).html('');
                                        }
                                    });
                                    let list = page[0].textContent.split('###P###');
                                    let list_2 = [];
                                    for (var i = 0; i < list.length; i++) {
                                        let text = list[i].replace(/\s\s+/g, ' ');
                                        if (text.split(' ').length > 5 && text.length > 20) {
                                            text = text.replace(/###B###/g, ' \n ');
                                            if (!this.history.includes(text)) {
                                                list_2.push(text);
                                                this.history.push(text);
                                            }
                                        }
                                    }
                                    list = [];
                                    for (var i = 0; i < list_2.length; i++) {
                                        let text = list_2[i].trim();
                                        while (text.length < 300 && list_2.length > i + 1) {
                                            text += (['.', ',', ':', '!', '?', ';', '።', '।', '。', '။'].includes(text.slice(-1)) ? '' : ' . ') + list_2[i + 1].trim();
                                            i++;
                                        }
                                        text = text.replace(/ \./g, '.');
                                        if (text.substring(0, 10) == '----------') {
                                            text = text.substring(80);
                                        }
                                        if (text.length > 3500) {
                                            let texts = text.split('\n');
                                            text = '';
                                            for (var j = 0; j < texts.length; j++) {
                                                if (text.length + texts[j].length < 3500 || j == texts.length - 1) {
                                                    text += texts[j];
                                                } else {
                                                    paragraphs.push([text, response[1], url]);
                                                    text = '';
                                                }
                                            }
                                        } else {
                                            paragraphs.push([text, response[1], url]);
                                        }
                                    }
                                    this.embeddings(paragraphs, (response) => {
                                        if (response) {
                                            return this.start(urls);
                                        }
                                    });
                                } else {
                                    return this.start(urls);
                                }
                            });
                        }
                    } else {
                        admin.find('#sb-embeddings-box p').html(sb_('We are processing the articles.'));
                        SBF.ajax({ function: 'open-ai-embeddings-articles' }, () => {
                            if (this.errors.length) {
                                setTimeout(() => { infoPanel(sb_('There were {R} errors. Check the browser console for more details. Please try again.').replace('{R}', this.errors.length), 'info'); }, 300);
                                console.error(this.errors);
                            } else {
                                infoBottom('The chatbot has been successfully trained.');
                                $('#open-ai-sources-file .repeater-item i').each(function () {
                                    SBSettings.repeaterDelete(this);
                                });
                            }
                            admin.sbHideLightbox();
                            this.training_button.sbLoading(false);
                            this.sitemap_processed_urls = [];
                            for (var i = 0; i < this.start_urls.length; i++) {
                                SBF.ajax({ function: 'delete-file', path: this.start_urls[i] });
                            }
                            SBSettings.save();
                        });
                    }
                },

                sitemap: function (urls, onSuccess, sitemap_urls = []) {
                    if (urls.length) {
                        let url = urls[0];
                        urls.shift();
                        if (!this.base_url) {
                            this.base_url = url;
                        }
                        if (url.lastIndexOf('http') === 0) {
                            sitemap_urls.push(url);
                            admin.find('#sb-embeddings-box p').html(sb_('We are generating the sitemap') + '<pre>' + url + '</pre><span>' + sb_('Only {R} pages left to complete.').replace('{R}', urls.length + 1) + '</span>');
                            this.getHTML(url, (response) => {
                                let links = response[0].find('a');
                                url = new URL(url);
                                links.each((i, element) => {
                                    let inner_url = $(element).attr('href');
                                    if (inner_url) {
                                        inner_url = absolute_url(inner_url, this.base_url);
                                        if (inner_url.includes('#')) {
                                            inner_url = inner_url.substring(0, inner_url.indexOf('#'));
                                        }
                                        if (!sitemap_urls.includes(inner_url) && !urls.includes(inner_url) && inner_url.indexOf(url.origin) === 0 && (!inner_url.substring(inner_url.lastIndexOf('/')).includes('.') || /.php|.html|.html|.asp|.aspx|.dhtml|.ece|.gne|.htmls|.php3|.rss|.rhtml/.test(inner_url))) {
                                            urls.push(inner_url);
                                        }
                                    }
                                });
                                this.sitemap(urls, onSuccess, sitemap_urls);
                            });
                        } else {
                            this.sitemap(urls, onSuccess, sitemap_urls);
                        }
                    } else {
                        onSuccess(sitemap_urls);
                    }
                },

                getHTML: function (url, onSuccess) {
                    url = url.trim();
                    SBF.ajax({ function: 'get-html', url: url }, function (response) {
                        let language = '';
                        $('body').find('#sb-html').remove();
                        if (response[1] == 200) {
                            response = response[0];
                            language = response.substring(response.indexOf('<html'), response.indexOf('>', response.indexOf('<html')));
                            if (language.includes('lang=')) {
                                let index = response.indexOf('lang=') + 6;
                                language = response.substring(index, response.indexOf('"', index)).toLowerCase();
                            } else {
                                language = '';
                            }
                            response = response.substring(response.indexOf('<body'), response.indexOf('</body')).replace('<br>', '\n').replace('<br />', '\n').replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '').replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').replace(/src=/g, 'data-src=').replace(/srcset=/g, 'data-srcset=').replace(/<link /g, '<').replace(/<meta /g, '<');
                            $('body').append('<div id="sb-html" style="display:none">' + response.replace(/\s\s+/g, ' ') + '</div>');
                        } else if (![302, 301].includes(response[1])) {
                            let error = `Malformed URL (${url}): error ${response[1]}`;
                            infoBottom(error, 'error');
                            console.error(error);
                        }
                        onSuccess([$('body').find('#sb-html'), language]);
                    });
                },

                embeddings: function (paragraphs, onSuccess) {
                    if (!paragraphs.length) {
                        console.warn('Unable to fetch training source ' + this.active_source);
                        return onSuccess(true);
                    }
                    SBF.ajax({ function: 'open-ai-get-embeddings', paragraphs: JSON.stringify(paragraphs), save_source: this.active_source }, (response) => {
                        this.errors = this.errors.concat(response[1]);
                        let errors = this.errors.length;
                        for (var i = 0; i < response[0].length; i++) {
                            if (!response[0][i]) {
                                errors++;
                                break;
                            }
                        }
                        if (response[1] == 'chars-limit-exceeded' || (response[1] && response[1][0] && response[1][0].error)) {
                            infoPanel(response[1] == 'chars-limit-exceeded' ? sb_('The chatbot cannot be trained with these sources because the limit of your plan is {R} characters. Upgrade your plan to increase the number of characters.').replace('{R}', response[2]) : response[1][0].error.message, 'info');
                            onSuccess(false);
                            this.training_button.sbLoading(false);
                        } else {
                            onSuccess(true);
                        }
                    });
                }
            }
        },

        messenger: {

            check: function (conversation) {
                return ['fb', 'ig'].includes(conversation.get('source'));
            },

            send: function (PSID, facebook_page_id, message = '', attachments = [], metadata, message_id = false, onSuccess = false) {
                SBF.ajax({
                    function: 'messenger-send-message',
                    psid: PSID,
                    facebook_page_id: facebook_page_id,
                    message: message,
                    message_id: message_id,
                    attachments: attachments,
                    metadata: metadata
                }, (response) => {
                    if (onSuccess) onSuccess(response);
                    SBApps.unsupportedRichMessages(message, 'Messenger');
                });
            }
        },

        whatsapp: {

            check: function (conversation) {
                return conversation.get('source') == 'wa';
            },

            send: function (to, message = '', attachments = [], phone_id = false, onSuccess = false) {
                SBF.ajax({
                    function: 'whatsapp-send-message',
                    to: to,
                    message: message,
                    attachments: attachments,
                    phone_id: phone_id
                }, (response) => {
                    if (response.error) {
                        infoPanel(response.error.message, 'info', false, 'error-wa');
                    }
                    if (onSuccess) {
                        onSuccess(response);
                    }
                    SBApps.unsupportedRichMessages(message, 'WhatsApp');
                });
            },

            activeUserPhone: function (user = activeUser()) {
                return user.getExtra('phone') ? user.getExtra('phone').value.replace('+', '') : false
            }
        },

        telegram: {

            check: function (conversation) {
                return conversation.get('source') == 'tg';
            },

            send: function (chat_id, message = '', attachments = [], conversation_id = false, onSuccess = false) {
                SBF.ajax({
                    function: 'telegram-send-message',
                    chat_id: chat_id,
                    message: message,
                    attachments: attachments,
                    conversation_id: conversation_id
                }, (response) => {
                    if (onSuccess) onSuccess(response);
                    SBApps.unsupportedRichMessages(message, 'Telegram');
                });
            }
        },

        viber: {

            check: function (conversation) {
                return conversation.get('source') == 'vb';
            },

            send: function (viber_id, message = '', attachments = [], onSuccess = false) {
                SBF.ajax({
                    function: 'viber-send-message',
                    viber_id: viber_id,
                    message: message,
                    attachments: attachments
                }, (response) => {
                    if (onSuccess) onSuccess(response);
                    SBApps.unsupportedRichMessages(message, 'Viber');
                });
            }
        },

        twitter: {

            check: function (conversation) {
                return conversation.get('source') == 'tw';
            },

            send: function (twitter_id, message = '', attachments = [], onSuccess = false) {
                SBF.ajax({
                    function: 'twitter-send-message',
                    twitter_id: twitter_id,
                    message: message,
                    attachments: attachments
                }, (response) => {
                    if (onSuccess) onSuccess(response);
                    SBApps.unsupportedRichMessages(message, 'Twitter');
                });
            }
        },

        gbm: {
            token: false,

            check: function (conversation) {
                return conversation.get('source') == 'bm';
            },

            send: function (google_conversation_id, message = '', attachments = [], onSuccess = false) {
                SBF.ajax({
                    function: 'gbm-send-message',
                    google_conversation_id: google_conversation_id,
                    message: message,
                    attachments: attachments,
                    token: this.token
                }, (response) => {
                    if (onSuccess) onSuccess(response);
                    this.token = response[2];
                    SBApps.unsupportedRichMessages(message, 'Google Business Messages');
                });
            }
        },

        line: {
            check: function (conversation) {
                return conversation.get('source') == 'ln';
            },

            send: function (line_id, message = '', attachments = [], conversation_id = false, onSuccess = false) {
                SBF.ajax({
                    function: 'line-send-message',
                    line_id: line_id,
                    message: message,
                    attachments: attachments,
                    conversation_id: conversation_id
                }, (response) => {
                    if (onSuccess) onSuccess(response);
                    SBApps.unsupportedRichMessages(message, 'LINE');
                });
            }
        },

        wechat: {
            token: false,

            check: function (conversation) {
                return conversation.get('source') == 'wc';
            },

            send: function (open_id, message = '', attachments = [], onSuccess = false) {
                SBF.ajax({
                    function: 'wechat-send-message',
                    open_id: open_id,
                    message: message,
                    attachments: attachments,
                    token: this.token
                }, (response) => {
                    if (Array.isArray(response)) {
                        this.token = response[1];
                        response = response[0];
                    }
                    if (onSuccess) onSuccess(response);
                    SBApps.unsupportedRichMessages(message, 'WeChat');
                });
            }
        },

        aecommerce: {

            panel: false,

            conversationPanel: function () {
                let code = '';
                let aecommerce_id = activeUser().getExtra('aecommerce-id');
                if (!this.panel) this.panel = conversations_area.find('.sb-panel-aecommerce');
                if (aecommerce_id && !loading(this.panel)) {
                    SBF.ajax({
                        function: 'aecommerce-get-conversation-details',
                        aecommerce_id: aecommerce_id.value
                    }, (response) => {
                        code = `<h3>${SB_ADMIN_SETTINGS.aecommerce_panel_title}</h3><div><div class="sb-split"><div><div class="sb-title">${sb_('Number of orders')}</div><span>${response.orders_count} ${sb_('orders')}</span></div><div><div class="sb-title">${sb_('Total spend')}</div><span>${response.currency_symbol}${response.total}</span></div></div><div class="sb-title">${sb_('Cart')}</div><div class="sb-list-items sb-list-links sb-aecommerce-cart">`;
                        for (var i = 0; i < response.cart.length; i++) {
                            let product = response.cart[i];
                            code += `<a href="${product.url}" target="_blank" data-id="${product.id}"><span>#${product.id}</span> <span>${product.name}</span> <span>x ${product.quantity}</span></a>`;
                        }
                        code += (response.cart.length ? '' : '<p>' + sb_('The cart is currently empty.') + '</p>') + '</div>';
                        if (response.orders.length) {
                            code += `<div class="sb-title">${sb_('Orders')}</div><div class="sb-list-items sb-list-links sb-aecommerce-orders">`;
                            for (var i = 0; i < response.orders.length; i++) {
                                let order = response.orders[i];
                                let id = order.id;
                                code += `<a data-id="${id}" href="${order.url}" target="_blank"><span>#${order.id}</span> <span>${SBF.beautifyTime(order.time, true)}</span> <span>${response.currency_symbol}${order.price}</span></a>`;
                            }
                            code += '</div>';
                        }
                        $(this.panel).html(code).sbLoading(false);
                        collapse(this.panel, 160);
                    });
                }
                $(this.panel).html(code);
            }
        },

        martfury: {

            panel: false,

            conversationPanel: function () {
                let code = '';
                let martfury_id = activeUser().getExtra('martfury-id');
                if (!this.panel) this.panel = conversations_area.find('.sb-panel-martfury');
                if (martfury_id && !loading(this.panel)) {
                    SBF.ajax({
                        function: 'martfury-get-conversation-details',
                        martfury_id: martfury_id.value
                    }, (response) => {
                        $(this.panel).html(response).sbLoading(false);
                        collapse(this.panel, 160);
                    });
                }
                $(this.panel).html(code);
            }
        },

        whmcs: {

            panel: false,

            conversationPanel: function () {
                let code = '';
                let whmcs_id = activeUser().getExtra('whmcs-id');
                if (!this.panel) this.panel = conversations_area.find('.sb-panel-whmcs');
                if (whmcs_id && !loading(this.panel)) {
                    SBF.ajax({
                        function: 'whmcs-get-conversation-details',
                        whmcs_id: whmcs_id.value
                    }, (response) => {
                        let services = ['products', 'addons', 'domains'];
                        code = `<h3>WHMCS</h3><div><div class="sb-split"><div><div class="sb-title">${sb_('Number of services')}</div><span>${response.services_count} ${sb_('services')}</span></div><div><div class="sb-title">${sb_('Total spend')}</div><span>${response.currency_symbol}${response.total}</span></div></div>`;
                        code += `</div>`;
                        for (var i = 0; i < services.length; i++) {
                            let items = response[services[i]];
                            if (items.length) {
                                code += `<div class="sb-title">${sb_(SBF.slugToString(services[i]))}</div><div class="sb-list-items">`;
                                for (var j = 0; j < items.length; j++) {
                                    code += `<div>${items[j].name}</div>`;
                                }
                                code += '</div>';
                            }
                        }
                        code += `<a href="${SB_ADMIN_SETTINGS.whmcs_url}/clientssummary.php?userid=${response['client-id']}" target="_blank" class="sb-btn sb-whmcs-link">${sb_('View on WHMCS')}</a>`;
                        $(this.panel).html(code).sbLoading(false);
                        collapse(this.panel, 160);
                    });
                }
                $(this.panel).html(code);
            }
        },

        perfex: {

            conversationPanel: function () {
                let perfex_id = activeUser().getExtra('perfex-id');
                conversations_area.find('.sb-panel-perfex').html(perfex_id ? `<a href="${SB_ADMIN_SETTINGS.perfex_url}/admin/clients/client/${perfex_id.value}" target="_blank" class="sb-btn sb-perfex-link">${sb_('View on Perfex')}</a>` : '');
            }
        },

        ump: {

            panel: false,

            conversationPanel: function () {
                if (loading(this.panel)) return;
                if (!this.panel) this.panel = conversations_area.find('.sb-panel-ump');
                let code = '';
                let subscriptions;
                SBF.ajax({
                    function: 'ump-get-conversation-details'
                }, (response) => {
                    subscriptions = response.subscriptions;
                    if (subscriptions.length) {
                        code = '<i class="sb-icon-refresh"></i><h3>Membership</h3><div class="sb-list-names">';
                        for (var i = 0; i < subscriptions.length; i++) {
                            let expired = subscriptions[i].expired;
                            code += `<div${expired ? ' class="sb-expired"' : ''}><span>${subscriptions[i].label}</span><span>${sb_(expired ? 'Expired on' : 'Expires on')} ${SBF.beautifyTime(subscriptions[i].expire_time, false, !expired)}</span></div>`;
                        }
                        code += `</div><span class="sb-title">${sb_('Total spend')} ${response.currency_symbol}${response.total}</span>`;
                    }
                    $(this.panel).html(code).sbLoading(false);
                    collapse(this.panel, 160);
                });
            }
        },

        armember: {

            panel: false,

            conversationPanel: function () {
                let wp_user_id = activeUser().getExtra('wp-id');
                if (!this.panel) this.panel = conversations_area.find('.sb-panel-armember');
                if (!SBF.null(wp_user_id) && !loading(this.panel)) {
                    let code = '';
                    let subscriptions;
                    wp_user_id = wp_user_id.value;
                    SBF.ajax({
                        function: 'armember-get-conversation-details',
                        wp_user_id: wp_user_id
                    }, (response) => {
                        subscriptions = response.subscriptions;
                        if (subscriptions.length) {
                            code = `<i class="sb-icon-refresh"></i><h3>${sb_('Plans')}</h3><div class="sb-list-names">`;
                            for (var i = 0; i < subscriptions.length; i++) {
                                let expired = subscriptions[i].expired;
                                code += `<div${expired ? ' class="sb-expired"' : ''}><span>${subscriptions[i].arm_current_plan_detail.arm_subscription_plan_name}</span><span>${subscriptions[i].expire_time == 'never' ? '' : (sb_(expired ? 'Expired on' : 'Expires on') + ' ' + SBF.beautifyTime(subscriptions[i].expire_time, false, !expired))}</span></div>`;
                            }
                            code += `</div><span class="sb-title">${sb_('Total spend')} ${response.currency_symbol}${response.total}<a href="${window.location.href.substr(0, window.location.href.lastIndexOf('/')) + '?page=arm_manage_members&member_id=' + activeUser().getExtra('wp-id').value}" target="_blank" class="sb-btn-text"><i class="sb-icon-user"></i> ${sb_('View member')}</a></span>`;
                        }
                        $(this.panel).html(code).sbLoading(false);
                        collapse(this.panel, 160);
                    });
                } else $(this.panel).html('');
            }
        },

        zendesk: {

            conversationPanel: function () {
                if (!SB_ADMIN_SETTINGS.zendesk_active) return;
                let zendesk_id = activeUser().getExtra('zendesk-id');
                let phone = activeUser().getExtra('phone');
                let email = activeUser().get('email');
                let panel = conversations_area.find('.sb-panel-zendesk');
                if ((zendesk_id || phone || email) && !loading(panel)) {
                    SBF.ajax({
                        function: 'zendesk-get-conversation-details',
                        conversation_id: SBChat.conversation.id,
                        zendesk_id: zendesk_id ? zendesk_id.value : false,
                        phone: phone ? phone.value : false,
                        email: email,
                    }, (response) => {
                        $(panel).html(response).sbLoading(false);
                        panel.find('.sb-zendesk-date').each(function () {
                            $(this).html(SBF.beautifyTime($(this).html()));
                        });
                        collapse(panel, 160);
                    });
                } else $(panel).html('');
            }
        },

        woocommerce: {

            popupPaginationNumber: 1,
            popupLanguage: '',
            popupCache: [],
            panel: false,
            timeout: false,

            // Products popup
            popupCode: function (items, label = true) {
                let code = '';
                for (var i = 0; i < items.length; i++) {
                    code += `<li data-id="${items[i].id}"><div class="sb-image" style="background-image:url('${items[i].image}')"></div><div><span>${items[i].name}</span><span>${SB_ADMIN_SETTINGS.currency}${items[i].price}</span></div></li>`;
                }
                return label ? (code ? code : `<p>${sb_('No products found')}</p>`) : code;
            },

            popupSearch: function (input) {
                searchInput(input, (search, icon) => {
                    if (search) {
                        this.popupPaginationNumber = 1;
                        SBF.ajax({
                            function: 'woocommerce-search-products',
                            search: search
                        }, (response) => {
                            woocommerce_products_box_ul.html(this.popupCode(response));
                            $(icon).sbLoading(false);
                        });
                    } else {
                        this.popupPopulate(function () {
                            $(icon).sbLoading(false);
                        });
                    }
                });
            },

            popupFilter: function (item) {
                if (loading(woocommerce_products_box_ul)) return;
                woocommerce_products_box_ul.html('');
                this.popupPaginationNumber = 1;
                SBF.ajax({
                    function: 'woocommerce-get-products',
                    user_language: this.popupLanguage,
                    filters: { taxonomy: $(item).data('value') }
                }, (response) => {
                    woocommerce_products_box_ul.html(this.popupCode(response)).sbLoading(false);
                });
            },

            popupPopulate: function (onSuccess = false) {
                this.popupLanguage = activeUser() != false && SB_ADMIN_SETTINGS.languages.includes(activeUser().language) ? activeUser().language : '';
                this.popupPaginationNumber = 1;
                woocommerce_products_box_ul.html('').sbLoading(true);
                SBF.ajax({
                    function: 'woocommerce-products-popup',
                    user_language: this.popupLanguage
                }, (response) => {
                    let code = '';
                    let select = woocommerce_products_box.find('.sb-select');
                    for (var i = 0; i < response[1].length; i++) {
                        code += `<li data-value="${response[1][i].id}">${response[1][i].name}</li>`;
                    }
                    select.find('> p').html(sb_('All'));
                    select.find('ul').html(`<li data-value="" class="sb-active">${sb_('All')}</li>` + code);
                    woocommerce_products_box_ul.html(this.popupCode(response[0])).sbLoading(false);
                    if (onSuccess !== false) onSuccess();
                });
            },

            popupPagination: function (area) {
                if (!this.popupPaginationNumber) return;
                woocommerce_products_box_ul.sbLoading(area);
                SBF.ajax({
                    function: 'woocommerce-get-products',
                    filters: { taxonomy: $(area).parent().find('.sb-select p').attr('data-value') },
                    pagination: this.popupPaginationNumber,
                    user_language: this.popupLanguage
                }, (response) => {
                    woocommerce_products_box_ul.append(this.popupCode(response, false)).sbLoading(false);
                    this.popupPaginationNumber++;
                    if (!response.length) this.popupPaginationNumber = 0;
                });
            },

            conversationPanel: function () {
                if (loading(this.panel)) {
                    return;
                }
                if (!this.panel) {
                    this.panel = conversations_area.find('.sb-panel-woocommerce');
                }
                let code = '';
                SBF.ajax({
                    function: 'woocommerce-get-conversation-details'
                }, (response) => {
                    code = `<i class="sb-icon-refresh"></i><h3>WooCommerce</h3><div><div class="sb-split"><div><div class="sb-title">${sb_('Number of orders')}</div><span>${response.orders_count} ${sb_('orders')}</span></div><div><div class="sb-title">${sb_('Total spend')}</div><span>${response.currency_symbol}${response.total}</span></div></div><div class="sb-title">${sb_('Cart')}<i class="sb-add-cart-btn sb-icon-plus"></i></div><div class="sb-list-items sb-list-links sb-woocommerce-cart">`;
                    for (var i = 0; i < response.cart.length; i++) {
                        let product = response.cart[i];
                        code += `<a href="${product.url}" target="_blank" data-id="${product.id}"><span>#${product.id}</span> <span>${product.name}</span> <span>x ${product.quantity}</span><i class="sb-icon-close"></i></a>`;
                    }
                    code += (response.cart.length ? '' : '<p>' + sb_('The cart is currently empty.') + '</p>') + '</div>';
                    if (response.orders.length) {
                        code += `<div class="sb-title">${sb_('Orders')}</div><div class="sb-list-items sb-woocommerce-orders sb-accordion">`;
                        for (var i = 0; i < response.orders.length; i++) {
                            let order = response.orders[i];
                            let id = order.id;
                            code += `<div data-id="${id}"><span><span>#${id}</span> <span>${SBF.beautifyTime(order.date, true)}</span><a href="${SITE_URL}/wp-admin/post.php?post=${id}&action=edit" target="_blank" class="sb-icon-next"></a></span><div></div></div>`;
                        }
                        code += '</div>';
                    }
                    $(this.panel).html(code).sbLoading(false);
                    collapse(this.panel, 160);
                });
            },

            conversationPanelOrder: function (order_id) {
                let accordion = this.panel.find(`[data-id="${order_id}"] > div`);
                accordion.html('');
                SBF.ajax({
                    function: 'woocommerce-get-order',
                    order_id: order_id
                }, (response) => {
                    let code = '';
                    let collapse = this.panel.find('.sb-collapse-btn:not(.sb-active)');
                    if (response) {
                        let products = response.products;
                        code += `<div class="sb-title">${sb_('Order total')}: <span>${response.currency_symbol}${response.total}<span></div><div class="sb-title">${sb_('Order status')}: <span>${SBF.slugToString(response.status.replace('wc-', ''))}<span></div><div class="sb-title">${sb_('Date')}: <span>${SBF.beautifyTime(response.date, true)}<span></div><div class="sb-title">${sb_('Products')}</div>`;
                        for (var i = 0; i < products.length; i++) {
                            code += `<a href="${SITE_URL}?p=${products[i].id}" target="_blank"><span>#${products[i].id}</span> <span>${products[i].quantity} x</span> <span>${products[i].name}</span></a>`;
                        }
                        for (var i = 0; i < 2; i++) {
                            let key = i == 0 ? 'shipping' : 'billing';
                            if (response[key + '_address']) {
                                code += `<div class="sb-title">${sb_((i == 0 ? 'Shipping' : 'Billing') + ' address')}</div><div class="sb-multiline">${response[key + '_address'].replace(/\\n/g, '<br>')}</div>`;
                            }
                        }
                    }
                    if (collapse.length) {
                        collapse.click();
                    }
                    accordion.html(code);
                });
            },

            conversationPanelUpdate: function (product_id, action = 'added') {
                let busy = false;
                let count = 0;
                this.timeout = setInterval(() => {
                    if (!busy) {
                        SBF.ajax({
                            function: 'woocommerce-get-conversation-details'
                        }, (response) => {
                            let removed = true;
                            for (var i = 0; i < response.cart.length; i++) {
                                if (response.cart[i].id == product_id) {
                                    if (action == 'added') count = 61; else removed = false;
                                }
                            }
                            if (count > 60 || removed) {
                                this.conversationPanel();
                                conversations_area.find('.sb-add-cart-btn,.sb-woocommerce-cart > a i').sbLoading(false);
                                clearInterval(this.timeout);
                            }
                            count++;
                            busy = false;
                        });
                        busy = true;
                    }
                }, 1000);
            }
        },

        opencart: {

            conversationPanel: function () {
                let panel = conversations_area.find('.sb-panel-opencart');
                let opencart_id = activeUser().getExtra('opencart_id');
                let store_url = activeUser().getExtra('opencart_store_url');
                if (!opencart_id) {
                    return panel.html('');
                }
                if (loading(panel)) {
                    return;
                }
                SBF.ajax({
                    function: 'opencart-panel',
                    opencart_id: opencart_id.value,
                    store_url: store_url ? store_url.value : false,
                }, (response) => {
                    panel.html(response).sbLoading(false);
                    collapse(this.panel, 160);
                });
            },

            openOrder: function (order_id) {
                SBF.ajax({
                    function: 'opencart-order-details',
                    order_id: order_id
                }, (response) => {
                    SBAdmin.infoPanel(response, 'info', false, 'opencart-order-details', sb_('Order') + ' #' + order_id, true);
                });
            }
        },

        wordpress: {
            ajax: function (action, data, onSuccess) {
                $.ajax({
                    method: 'POST',
                    url: SB_WP_AJAX_URL,
                    data: $.extend({ action: 'sb_wp_ajax', type: action }, data)
                }).done((response) => {
                    if (onSuccess !== false) {
                        onSuccess(response);
                    }
                });
            }
        },

        is: function (name) {
            if (typeof SB_VERSIONS == ND) {
                return false;
            }
            switch (name) {
                case 'opencart':
                case 'gbm':
                case 'zendesk':
                case 'twitter':
                case 'wechat':
                case 'line':
                case 'viber':
                case 'telegram':
                case 'armember':
                case 'aecommerce':
                case 'martfury':
                case 'whmcs':
                case 'perfex':
                case 'ump':
                case 'messenger':
                case 'whatsapp':
                case 'woocommerce':
                case 'dialogflow':
                case 'slack':
                case 'tickets': return typeof SB_VERSIONS[name] != ND && SB_VERSIONS[name];
                case 'wordpress': return typeof SB_WP != ND;
                case 'sb': return true;
            }
            return false;
        },

        unsupportedRichMessages: function (message, app_name, unsupported = []) {
            unsupported.push('timetable', 'registration', 'table', 'inputs');
            if (app_name != 'Messenger') unsupported.push('email');
            for (var i = 0; i < unsupported.length; i++) {
                if (message.includes('[' + unsupported[i])) infoBottom('The {R} rich message is not supported by {R2}. The rich message was not sent to {R2}.'.replace(/{R}/g, SBF.slugToString(unsupported[i])).replace(/{R2}/g, app_name), 'error');
            }
        },

        getName: function (source) {
            let names = { fb: 'Facebook', wa: 'WhatsApp', tm: 'Text message', ig: 'Instagram', tg: 'Telegram', tk: 'Tickets', wc: 'WeChat', em: 'Email', tw: 'Twitter', bm: 'Business Messages', vb: 'Viber', ln: 'LINE' };
            return source in names ? names[source] : source;
        }
    }

    /*
    * ----------------------------------------------------------
    * Settings
    * ----------------------------------------------------------
    */

    var SBSettings = {
        init: false,

        save: function (btn = false) {
            if (btn && loading(btn)) return;
            let external_settings = {};
            let settings = {};
            let tab = settings_area.find(' > .sb-tab > .sb-nav .sb-active').attr('id');
            switch (tab) {
                case 'tab-automations':
                    let active = automations_area_nav.find('.sb-active').attr('data-id');
                    SBSettings.automations.save((response) => {
                        infoBottom(response === true ? 'Automations saved' : response);
                        SBSettings.automations.populate();
                        automations_area_nav.find(`[data-id="${active}"]`).click();
                        if (btn) {
                            $(btn).sbLoading(false);
                        }
                    });
                    break;
                case 'tab-translations':
                    this.translations.updateActive();
                    SBF.ajax({
                        function: 'save-translations',
                        translations: JSON.stringify(this.translations.to_update)
                    }, () => {
                        infoBottom('Translations saved');
                        if (btn) {
                            $(btn).sbLoading(false);
                        }
                    });
                    break;
                default:
                    settings_area.find('.sb-setting').each((i, element) => {
                        let setting = this.get(element);
                        let setting_id = $(element).data('setting');
                        if (setting[0]) {
                            if (typeof setting_id != ND) {
                                let originals = false;
                                if ($(element).find('[data-language]').length) {
                                    let language = $(element).find('[data-language].sb-active');
                                    originals = setting[0] in this.translations.originals ? this.translations.originals[setting[0]] : false;
                                    this.translations.save(element, language.length ? language.attr('data-language') : false);
                                    if (originals) {
                                        if (typeof originals != 'string') {
                                            for (var key in originals) {
                                                originals[key] = [originals[key], setting[1][key][1]]
                                            }
                                        }
                                    }
                                }
                                if (!(setting_id in external_settings)) external_settings[setting_id] = {};
                                external_settings[setting_id][setting[0]] = [originals ? originals : setting[1], setting[2]];
                            } else {
                                settings[setting[0]] = [setting[1], setting[2]];
                            }
                        }
                    });
                    SBF.ajax({
                        function: 'save-settings',
                        settings: JSON.stringify(settings),
                        external_settings: external_settings,
                        external_settings_translations: this.translations.translations
                    }, () => {
                        if (btn) {
                            infoBottom('Settings saved. Reload to apply the changes.');
                            $(btn).sbLoading(false);
                        }
                    });
                    break;
            }
        },

        initPlugins: function () {
            settings_area.find('textarea').each(function () {
                $(this).autoExpandTextarea();
                $(this).manualExpandTextarea();
            });
            settings_area.find('[data-setting] .sb-language-switcher-cnt').each(function () {
                $(this).sbLanguageSwitcher(SBSettings.translations.getLanguageCodes($(this).closest('[data-setting]').attr('id')), 'settings');
            });
        },

        initColorPicker: function (area = false) {
            $(area ? area : settings_area).find('.sb-type-color input').colorPicker({
                renderCallback: function (t, toggled) {
                    $(t.context).closest('.input').find('input').css('background-color', t.text);
                }
            });
        },

        initHTML: function (response) {
            if (response['slack-agents']) {
                let code = '';
                for (var key in response['slack-agents'][0]) {
                    code += `<div data-id="${key}"><select><option value="${response['slack-agents'][0][key]}"></option></select></div>`;
                }
                settings_area.find('#slack-agents .input').html(code);
            }
        },

        get: function (item) {
            item = $(item);
            let id = item.attr('id');
            let type = item.data('type');
            switch (type) {
                case 'upload':
                case 'range':
                case 'number':
                case 'text':
                case 'password':
                case 'color':
                case 'upload-file':
                    return [id, item.find('input').val(), type];
                case 'textarea':
                    return [id, item.find('textarea').val(), type];
                case 'select':
                    return [id, item.find('select').val(), type];
                case 'checkbox':
                    return [id, item.find('input').is(':checked'), type];
                case 'radio':
                    let value = item.find('input:checked').val();
                    if (SBF.null(value)) {
                        value = '';
                    }
                    return [id, value, type];
                case 'upload-image':
                    let url = item.find('.image').attr('data-value');
                    if (SBF.null(url)) {
                        url = '';
                    }
                    return [id, url, type];
                case 'multi-input':
                    let multi_inputs = {};
                    item.find('.input > div').each((i, element) => {
                        let setting = this.get(element);
                        if (setting[0]) {
                            multi_inputs[setting[0]] = [setting[1], setting[2]];
                        }
                    });
                    return [id, multi_inputs, type];
                case 'select-images':
                    return [id, item.find('.input > .sb-active').data('value'), type];
                case 'repeater':
                    return [id, this.repeater('get', item.find('.repeater-item')), type];
                case 'double-select':
                    let selects = {};
                    item.find('.input > div').each(function () {
                        let value = $(this).find('select').val();
                        if (value != -1) {
                            selects[$(this).attr('data-id')] = [value];
                        }
                    });
                    return [id, selects, type];
                case 'select-checkbox':
                    return [id, item.find('.sb-select-checkbox input:checked').map(function () { return $(this).attr('id') }).get(), type];
                case 'timetable':
                    let times = {};
                    item.find('.sb-timetable > [data-day]').each(function () {
                        let day = $(this).attr('data-day');
                        let hours = [];
                        $(this).find('> div > div').each(function () {
                            let name = $(this).html()
                            let value = $(this).attr('data-value');
                            if (SBF.null(value)) {
                                hours.push(['', '']);
                            } else if (value == 'closed') {
                                hours.push(['closed', 'Closed']);
                            } else {
                                hours.push([value, name]);
                            }
                        });
                        times[day] = hours;
                    });
                    return [id, times, type];
                case 'color-palette':
                    return [id, item.attr('data-value'), type];
            }
            return ['', '', ''];
        },

        set: function (id, setting) {
            let type = $(setting)[1];
            let value = $(setting)[0];
            id = `#${id}`;
            switch (type) {
                case 'color':
                case 'upload':
                case 'number':
                case 'text':
                case 'password':
                case 'upload-file':
                    settings_area.find(`${id} input`).val(value);
                    break;
                case 'textarea':
                    settings_area.find(`${id} textarea`).val(value);
                    break;
                case 'select':
                    settings_area.find(`${id} select`).val(value);
                    break;
                case 'checkbox':
                    settings_area.find(`${id} input`).prop('checked', value == 'false' ? false : value);
                    break;
                case 'radio':
                    settings_area.find(`${id} input[value="${value}"]`).prop('checked', true);
                    break;
                case 'upload-image':
                    if (value) {
                        settings_area.find(id + ' .image').attr('data-value', value).css('background-image', `url("${value}")`);
                    }
                    break;
                case 'multi-input':
                    for (var key in value) {
                        this.set(key, value[key]);
                    }
                    break;
                case 'range':
                    let range_value = value;
                    settings_area.find(id + ' input').val(range_value);
                    settings_area.find(id + ' .range-value').html(range_value);
                    break;
                case 'select-images':
                    settings_area.find(id + ' .input > div').sbActive(false);
                    settings_area.find(id + ` .input > [data-value="${value}"]`).sbActive(true);
                    break;
                case 'select-checkbox':
                    for (var i = 0; i < value.length; i++) {
                        settings_area.find(`input[id="${value[i]}"]`).prop('checked', true);
                    }
                    settings_area.find(id + ' .sb-select-checkbox-input').val(value.join(', '));
                    break;
                case 'repeater':
                    let content = this.repeater('set', value, settings_area.find(id + ' .repeater-item:last-child'));
                    if (content) {
                        settings_area.find(id + ' .sb-repeater').html(content);
                    }
                    break;
                case 'double-select':
                    for (var key in value) {
                        settings_area.find(`${id} .input > [data-id="${key}"] select`).val(value[key]);
                    }
                    break;
                case 'timetable':
                    for (var key in value) {
                        let hours = settings_area.find(`${id} [data-day="${key}"] > div > div`);
                        for (var i = 0; i < hours.length; i++) {
                            $(hours[i]).attr('data-value', value[key][i][0]).html(value[key][i][1]);
                        }
                    }
                    break;
                case 'color-palette':
                    if (value) {
                        settings_area.find(id).attr('data-value', value);
                    }
                    break;
            }
        },

        repeater: function (action, items, content = false) {
            if (action == 'set') {
                var html = '';
                content = $(content).html();
                if (items.length) {
                    $(content).find('.sb-icon-close').remove();
                    for (var i = 0; i < items.length; i++) {
                        let item = $($.parseHTML(`<div>${content}</div>`));
                        for (var key in items[i]) {
                            this.setInput(item.find(`[data-id="${key}"]`), items[i][key]);
                        }
                        html += `<div class="repeater-item">${item.html().replace('<i class="sb-icon-close"></i>', '')}<i class="sb-icon-close"></i></div>`;
                    }
                }
                return html;
            }
            if (action == 'get') {
                let items_array = [];
                let me = this;
                $(items).each(function () {
                    let item = {};
                    let empty = true;
                    $(this).find('[data-id]').each(function () {
                        let value = me.getInput(this);
                        if (empty && value && $(this).attr('type') != 'hidden' && $(this).attr('data-type') != 'auto-id') {
                            empty = false;
                        }
                        item[$(this).attr('data-id')] = value;
                    });
                    if (!empty) {
                        items_array.push(item);
                    }
                });
                return items_array;
            }
        },

        repeaterAdd: function (item) {
            let parent = $(item).parent();
            item = $($.parseHTML(`<div>${parent.find('.repeater-item:last-child').html()}</div>`));
            item.find('[data-id]').each(function () {
                SBSettings.resetInput(this);
                if ($(this).data('type') == 'auto-id') {
                    let larger = 1;
                    parent.find('[data-type="auto-id"]').each(function () {
                        let index = parseInt($(this).val());
                        if (index > larger) {
                            larger = index;
                        }
                    });
                    $(this).attr('value', larger + 1);
                }
            });
            parent.find('.sb-repeater').append(`<div class="repeater-item">${item.html()}</div>`);
        },

        repeaterDelete: function (item) {
            let parent = $(item).parent();
            if (parent.parent().find('.repeater-item').length > 1) {
                parent.remove();
            } else {
                parent.find('[data-id]').each((e, element) => {
                    this.resetInput(element);
                });
            }
        },

        setInput: function (input, value) {
            value = $.trim(value);
            input = $(input);
            if (input.is('select')) {
                input.find(`option[value="${value}"]`).attr('selected', '');
            } else {
                if (input.is(':checkbox') && value && value != 'false') {
                    input.attr('checked', '');
                } else {
                    if (input.is('textarea')) {
                        input.html(value);
                    } else {
                        let div = input.is('div');
                        if (div || input.is('i') || input.is('li')) {
                            input.attr('data-value', value);
                            if (div && input.hasClass('image')) {
                                input.css('background-image', value ? `url("${value}")` : '');
                            }
                        } else {
                            input.attr('value', value);
                        }
                    }
                }
            }
        },

        getInput: function (input) {
            input = $(input);
            if (input.is(':checkbox')) {
                return input.is(':checked');
            } else {
                if (input.is("div") || input.is("i") || input.is("li")) {
                    let value = input.attr('data-value');
                    return SBF.null(value) ? '' : value;
                } else {
                    return input.val();
                }
            }
            return '';
        },

        resetInput: function (input) {
            input = $(input);
            if (input.is("select")) {
                input.val('').find('[selected]').removeAttr('selected');
            } else {
                if (input.is(':checkbox')) {
                    input.removeAttr('checked').prop('checked', false);
                } else {
                    if (input.is("textarea")) {
                        input.html('');
                    } else {
                        input.removeAttr('value').removeAttr('style').removeAttr('data-value').val('');
                    }
                }
            }
        },

        getSettingObject: function (setting) {
            return $(setting)[0].hasAttribute('data-setting') ? $(setting) : $(setting).closest('[data-setting]');
        },

        visibility: function (index, visible) {
            let selectors = [['#push-notifications-onesignal-sw-url, #push-notifications-onesignal-app-id, #push-notifications-onesignal-api-key, #push-notifications-sw-path', '#push-notifications-id, #push-notifications-key'], ['#messenger-key, #messenger-path-btn', '#messenger-sync-btn'], ['#open-ai-assistant-id', '#open-ai-prompt,#open-ai-model, #open-ai-tokens, #open-ai-temperature, #open-ai-presence-penalty, #open-ai-frequency-penalty, #open-ai-logit-bias, #open-ai-custom-model, #open-ai-omit-previous-messages, #open-ai-source-links']];
            settings_area.find(selectors[index][0]).sbActive(!visible);
            settings_area.find(selectors[index][1]).setClass('sb-hide', !visible);
        },

        open: function (id) {
            header.find('.sb-admin-nav #sb-settings').click();
            setTimeout(() => {
                settings_area.find('#tab-' + id).click().get(0).scrollIntoView();
            }, 300);
        },

        automations: {
            items: { messages: [], emails: [], sms: [], popups: [], design: [], more: [] },
            translations: {},
            conditions: {
                datetime: ['Date time', ['Is between', 'Is exactly'], 'dd/mm/yyy hh:mm - dd/mm/yyy hh:mm'],
                repeat: ['Repeat', ['Every day', 'Every week', 'Every month', 'Every year']],
                browsing_time: ['Browsing time', [], 'seconds'],
                scroll_position: ['Scroll position', [], 'px'],
                include_urls: ['Include URLs', ['Contains', 'Does not contain', 'Is exactly', 'Is not'], 'URLs parts separated by commas'],
                exclude_urls: ['Exclude URLs', ['Contains', 'Does not contain', 'Is exactly', 'Is not'], 'URLs parts separated by commas'],
                referring: ['Referring URLs', ['Contains', 'Does not contain', 'Is exactly', 'Is not'], 'URLs parts separated by commas'],
                user_type: ['User type', ['Is visitor', 'Is lead', 'Is user', 'Is not visitor', 'Is not lead', 'Is not user']],
                returning_visitor: ['Returning visitor', ['First time visitor', 'Returning visitor']],
                countries: ['Countries', [], 'Country codes separated by commas'],
                languages: ['Languages', [], 'Language codes separated by commas'],
                cities: ['Cities', [], 'Cities separated by commas'],
                custom_variable: ['Custom variable', [], 'variable=value']
            },

            get: function (onSuccess) {
                SBF.ajax({
                    function: 'automations-get'
                }, (response) => {
                    this.items = response[0];
                    this.translations = Array.isArray(response[1]) && !response[1].length ? {} : response[1];
                    onSuccess(response);
                });
            },

            save: function (onSuccess = false) {
                this.updateActiveItem();
                SBF.ajax({
                    function: 'automations-save',
                    automations: this.items,
                    translations: this.translations
                }, (response) => {
                    if (onSuccess) onSuccess(response);
                });
            },

            show: function (id = false, language = false) {
                this.updateActiveItem();
                let items = language ? (language in this.translations ? this.translations[language] : []) : this.items;
                let area = automations_area.find(' > .sb-tab > .sb-content');
                if (id === false) id = this.activeID();
                this.hide(false);
                for (var key in items) {
                    for (var i = 0; i < items[key].length; i++) {
                        let item = items[key][i];
                        let conditions = item['conditions'];
                        if (item.id == id) {
                            conditions_area.html('');
                            for (var key in item) {
                                let element = area.find(`[data-id="${key}"]`);
                                if (element.hasClass('image')) {
                                    element.css('background-image', `url(${item[key]})`).attr('data-value', item[key]);
                                    if (!item[key]) {
                                        element.removeAttr('data-value');
                                    }
                                } else if (element.attr('type') == 'checkbox') {
                                    element.prop('checked', item[key]);
                                } else {
                                    element.val(item[key]);
                                }
                            }
                            if (conditions) {
                                for (var key in conditions) {
                                    this.addCondition();
                                    let condition = conditions_area.find(' > div:last-child');
                                    condition.find('select').val(conditions[key][0]);
                                    this.updateCondition(condition.find('select'));
                                    condition.find(' > div').eq(1).find('select,input').val(conditions[key][1]);
                                    if (conditions[key].length > 2) {
                                        condition.find(' > div').eq(2).find('input').val(conditions[key][2]);
                                    }
                                }
                            }
                            conditions_area.parent().setClass('sb-hide', language);
                            area.sbLanguageSwitcher(this.getTranslations(id), 'automations', language);
                            return true;
                        }
                    }
                }
                return false;
            },

            add: function () {
                let id = SBF.random();
                let name = `${sb_('Item')} ${automations_area_nav.find('li:not(.sb-no-results)').length + 1}`;
                this.updateActiveItem();
                this.items[this.activeType()].push(this.itemArray(this.activeType(), id, name));
                this.hide(false);
                automations_area_nav.find('.sb-active').sbActive(false);
                automations_area_nav.find('.sb-no-results').remove();
                automations_area_nav.append(`<li class="sb-active" data-id="${id}">${name}<i class="sb-icon-delete"></i></li>`);
                automations_area.find('.sb-automation-values').find('input, textarea').val('');
                automations_area.sbLanguageSwitcher([], 'automations');
                conditions_area.html('');
            },

            delete: function (element) {
                this.items[this.activeType()].splice($(element).parent().index(), 1);
                $(element).parent().remove();
                this.hide();
                if (this.items[this.activeType()].length == 0) automations_area_nav.html(`<li class="sb-no-results">${sb_('No results found.')}</li>`);
            },

            populate: function (type = false) {
                if (type === false) type = this.activeType();
                let code = '';
                let items = this.items[type];
                this.updateActiveItem();
                if (items.length) {
                    for (var i = 0; i < items.length; i++) {
                        code += `<li data-id="${items[i].id}">${items[i].name}<i class="sb-icon-delete"></i></li>`;
                    }
                } else {
                    code = `<li class="sb-no-results">${sb_('No results found.')}</li>`;
                }
                automations_area_nav.html(code);
                code = '';
                switch (type) {
                    case 'emails':
                        code = `<h2>${sb_('Subject')}</h2><div class="sb-input-setting sb-type-text"><div><input data-id="subject" type="text"></div></div>`;
                        break;
                    case 'popups':
                        code = `<h2>${sb_('Title')}</h2><div class="sb-input-setting sb-type-text"><div><input data-id="title" type="text"></div></div><h2>${sb_('Profile image')}</h2><div data-type="upload-image" class="sb-input-setting sb-type-upload-image"><div class="input"><div data-id="profile_image" class="image"><i class="sb-icon-close"></i></div></div></div><h2>${sb_('Message fallback')}</h2><div class="sb-input-setting sb-type-checkbox"><div><input data-id="fallback" type="checkbox"></div></div>`;
                        break;
                    case 'design':
                        code = `<h2>${sb_('Header title')}</h2><div class="sb-input-setting sb-type-text"><div><input data-id="title" type="text"></div></div>`;
                        for (var i = 1; i < 4; i++) {
                            code += `<h2>${sb_((i == 1 ? 'Primary' : (i == 2 ? 'Secondary' : 'Tertiary')) + ' color')}</h2><div data-type="color" class="sb-input-setting sb-type-color"><div class="input"><input data-id="color_${i}" type="text"><i class="sb-close sb-icon-close"></i></div></div>`;
                        }
                        for (var i = 1; i < 4; i++) {
                            code += `<h2>${sb_(i == 1 ? 'Header background image' : (i == 2 ? 'Header brand image' : 'Chat button icon'))}</h2><div data-type="upload-image" class="sb-input-setting sb-type-upload-image"><div class="input"><div data-id="${i == 1 ? 'background' : (i == 2 ? 'brand' : 'icon')}" class="image"><i class="sb-icon-close"></i></div></div></div>`;
                        }
                        break;
                    case 'more':
                        code = `<h2>${sb_('Department ID')}</h2><div class="sb-input-setting sb-type-number"><div><input data-id="department" type="number"></div></div><h2>${sb_('Agent ID')}</h2><div class="sb-input-setting sb-type-number"><div><input data-id="agent" type="number"></div></div><h2>${sb_('Tags')}</h2><div class="sb-input-setting sb-type-text"><div><input data-id="tags" type="text"></div></div><h2>${sb_('Article IDs')}</h2><div class="sb-input-setting sb-type-number"><div><input data-id="articles" type="text"></div></div><h2>${sb_('Articles category')}</h2><div class="sb-input-setting sb-type-number"><div><input data-id="articles_category" type="text"></div></div>`;
                        break;
                }
                automations_area.find('.sb-automation-extra').html(code);
                automations_area.attr('data-automation-type', type);
                SBSettings.initColorPicker(automations_area);
                this.hide();
            },

            updateActiveItem: function () {
                let id = this.activeID();
                if (id) {
                    let language = automations_area.find(`.sb-language-switcher [data-language].sb-active`).attr('data-language');
                    let type = this.activeType();
                    let items = language ? (language in this.translations ? this.translations[language][type] : []) : this.items[type];
                    let conditions = conditions_area.find(' > div');
                    for (var i = 0; i < items.length; i++) {
                        if (items[i].id == id) {
                            items[i] = { id: id, conditions: [] };
                            automations_area.find('.sb-automation-values').find('input,textarea,[data-type="upload-image"] .image').each(function () {
                                items[i][$(this).attr('data-id')] = $(this).hasClass('image') && $(this)[0].hasAttribute('data-value') ? $(this).attr('data-value') : ($(this).attr('type') == 'checkbox' ? $(this).is(':checked') : $(this).val());
                            });
                            conditions.each(function () {
                                let condition = [];
                                $(this).find('input,select').each(function () {
                                    condition.push($(this).val());
                                });
                                if (condition[0] && condition[1] && (condition.length == 2 || condition[2])) {
                                    items[i].conditions.push(condition);
                                }
                            });
                            if (SBF.null(items[i].name)) {
                                this.delete(automations_area_nav.find(`[data-id="${id}"] i`));
                            }
                            break;
                        }
                    }
                }
            },

            addCondition: function () {
                conditions_area.append(`<div><div class="sb-input-setting sb-type-select sb-condition-1"><select>${this.getAvailableConditions()}</select></div></div>`);
            },

            updateCondition: function (element) {
                $(element).parent().siblings().remove();
                let parent = $(element).parents().eq(1);
                if ($(element).val()) {
                    let condition = this.conditions[$(element).val()];
                    let code = '';
                    if (condition[1].length) {
                        code = '<div class="sb-input-setting sb-type-select sb-condition-2"><select>';
                        for (var i = 0; i < condition[1].length; i++) {
                            code += `<option value="${SBF.stringToSlug(condition[1][i])}">${sb_(condition[1][i])}</option>`;
                        }
                        code += '</select></div>';
                    }
                    parent.append(code + (condition.length > 2 ? `<div class="sb-input-setting sb-type-text"><input placeholder="${sb_(condition[2])}" type="text"></div>` : ''));
                    parent.siblings().find('.sb-condition-1 select').each(function () {
                        let value = $(this).val();
                        $(this).html(SBSettings.automations.getAvailableConditions(value));
                        $(this).val(value);
                    });
                } else {
                    parent.remove();
                }
            },

            getAvailableConditions: function (include = '') {
                let code = '<option value=""></option>';
                let existing_conditions = [];
                conditions_area.find('.sb-condition-1 select').each(function () {
                    existing_conditions.push($(this).val());
                });
                for (var key in this.conditions) {
                    if (!existing_conditions.includes(key) || key == include) {
                        code += `<option value="${key}">${sb_(this.conditions[key][0])}</option>`;
                    }
                }
                return code;
            },

            addTranslation: function (id = false, type = false, language) {
                if (id === false) {
                    id = this.activeID();
                }
                if (type === false) {
                    type = this.activeType();
                }
                if (this.getTranslations(id).includes(id)) {
                    return console.warn('Automation translation already in array.');
                }
                if (!(language in this.translations)) {
                    this.translations[language] = { messages: [], emails: [], sms: [], popups: [], design: [] };
                }
                if (!(type in this.translations[language])) {
                    this.translations[language][type] = [];
                }
                this.translations[language][type].push(this.itemArray(type, id));
            },

            getTranslations: function (id = false) {
                let translations = [];
                if (id === false) id = this.activeID();
                for (var key in this.translations) {
                    let types = this.translations[key];
                    for (var key2 in types) {
                        let items = types[key2];
                        for (var i = 0; i < items.length; i++) {
                            if (items[i].id == id) {
                                translations.push(key);
                                break;
                            }
                        }
                    }
                }
                return translations;
            },

            deleteTranslation: function (id = false, language) {
                if (id === false) id = this.activeID();
                if (language in this.translations) {
                    let types = this.translations[language];
                    for (var key in types) {
                        let items = types[key];
                        for (var i = 0; i < items.length; i++) {
                            if (items[i].id == id) {
                                this.translations[language][key].splice(i, 1);
                                return true;
                            }
                        }
                    }
                }
                return false;
            },

            activeID: function () {
                let item = automations_area_nav.find('.sb-active');
                return item.length ? item.attr('data-id') : false;
            },

            activeType: function () {
                return automations_area_select.find('li.sb-active').data('value');
            },

            itemArray: function (type, id, name = '', message = '') {
                return $.extend({ id: id, name: name, message: message }, type == 'emails' ? { subject: '' } : (type == 'popups' ? { title: '', profile_image: '' } : (type == 'design' ? { title: '', color_1: '', color_2: '', color_3: '', background: '', brand: '', icon: '' } : {})));
            },

            hide: function (hide = true) {
                automations_area.find(' > .sb-tab > .sb-content').setClass('sb-hide', hide);
            }
        },

        translations: {
            translations: {},
            originals: {},
            to_update: {},

            add: function (language) {
                let setting = SBSettings.getSettingObject(language_switcher_target);
                let setting_id = setting.attr('id');
                let active_language = language_switcher_target.find('[data-language].sb-active');
                this.save(setting, active_language.length ? active_language.attr('data-language') : false);
                setting.find('textarea,input[type="text"]').val('');
                this.save(setting, language);
                language_switcher_target.remove();
                setting.sbLanguageSwitcher(this.getLanguageCodes(setting_id), 'settings', language);
            },

            delete: function (setting, language) {
                setting = SBSettings.getSettingObject(setting);
                let setting_id = setting.attr('id');
                delete this.translations[language][setting_id];
                setting.find(`.sb-language-switcher [data-language="${language}"]`).remove();
                this.activate(setting);
            },

            activate: function (setting, language = false) {
                setting = SBSettings.getSettingObject(setting);
                let setting_id = setting.attr('id');
                let values = language ? this.translations[language][setting_id] : this.originals[setting_id];
                if (isString(values)) {
                    setting.find('input, textarea').val(values);
                } else {
                    for (var key in values) {
                        setting.find('#' + key).find('input, textarea').val(isString(values[key]) ? values[key] : values[key][0]);
                    }
                }
            },

            updateActive: function () {
                let area = settings_area.find('.sb-translations-list')
                let translations = { 'front': {}, 'admin': {}, 'admin/js': {}, 'admin/settings': {} };
                let language_code = area.attr('data-value');
                if (SBF.null(language_code)) return;
                for (var key in translations) {
                    area.find(' > [data-area="' + key + '"] .sb-input-setting:not(.sb-new-translation)').each(function () {
                        translations[key][$(this).find('label').html()] = $(this).find('input').val();
                    });
                    area.find('> [data-area="' + key + '"] .sb-new-translation').each(function () {
                        let original = $(this).find('input:first-child').val();
                        let value = $(this).find('input:last-child').val();
                        if (original && value) {
                            translations[key][original] = value;
                        }
                    });
                }
                this.to_update[language_code] = translations;
            },

            save: function (setting, language = false) {
                setting = SBSettings.getSettingObject(setting);
                let values = {};
                let setting_id = $(setting).attr('id');
                if (setting.data('type') == 'multi-input') {
                    setting.find('.multi-input-textarea,.multi-input-text').each(function () {
                        values[$(this).attr('id')] = $(this).find('input, textarea').val();
                    });
                } else {
                    values = setting.find('input, textarea').val();
                }
                if (language) {
                    if (!(language in this.translations)) {
                        this.translations[language] = {};
                    }
                    this.translations[language][setting_id] = values;
                } else {
                    this.originals[setting_id] = values;
                }
            },

            load: function (language_code) {
                let area = settings_area.find('.sb-translations > .sb-content');
                area.find(' > .sb-hide').removeClass('sb-hide');
                this.updateActive();
                SBF.ajax({
                    function: 'get-translation',
                    language_code: language_code
                }, (translations) => {
                    if (language_code in this.to_update) translations = this.to_update[language_code];
                    let code = '';
                    let areas = ['front', 'admin', 'admin/js', 'admin/settings'];
                    for (var i = 0; i < areas.length; i++) {
                        let translations_area = translations[areas[i]];
                        code += `<div${!i ? ' class="sb-active"' : ''} data-area="${areas[i]}">`;
                        for (var key in translations_area) {
                            code += `<div class="sb-input-setting sb-type-text"><label>${key}</label><div><input type="text" value="${translations_area[key]}"></div></div>`;
                        }
                        code += '</div>';
                    }
                    area.find('.sb-translations-list').attr('data-value', language_code).html(code);
                    area.find('.sb-menu-wide li').sbActive(false).eq(0).sbActive(true);
                    area.sbLoading(false);
                });
                area.sbLoading(true);
            },

            getLanguageCodes: function (setting_id) {
                let languages = [];
                for (var key in this.translations) {
                    if (setting_id in this.translations[key]) {
                        languages.push(key);
                    }
                }
                return languages;
            }
        }
    }

    /*
    * ----------------------------------------------------------
    * Articles
    * ----------------------------------------------------------
    */

    var SBArticles = {
        category_list: [],
        page_url: false,

        get: function (onSuccess, article_id = false, categories = false, full = true, language = false) {
            SBF.ajax({
                function: 'get-articles',
                id: article_id,
                categories: categories,
                articles_language: language,
                full: full
            }, (response) => {
                onSuccess(response);
            });
        },

        save: function (onSuccess = false) {
            let id = this.activeID();
            let article;
            article = { id: id, title: articles_area.find('.sb-article-title input').val(), content: articles_area.find('.sb-article-content textarea').val(), link: articles_area.find('.sb-article-link input').val(), parent_category: articles_category_parent_select.val(), category: articles_category_select.val(), language: articles_area.find('.sb-language-switcher [data-language].sb-active').attr('data-language') };
            if (!article.title && !article.content) {
                return onSuccess(false);
            }
            if (article.language) {
                article.parent_id = this.activeID(true);
            }
            if (editor_js && typeof editor_js.save !== ND) {
                editor_js.save().then((outputData) => {
                    article.editor_js = outputData;
                    article.content = editorJSHTML(outputData.blocks);
                    this.save_2(article, onSuccess);
                }).catch((error) => {
                    console.log(error);
                });
            } else {
                this.save_2(article, onSuccess);
            }
        },

        save_2: function (article, onSuccess = false) {
            SBF.ajax({
                function: 'save-article',
                article: JSON.stringify(article)
            }, (response) => {
                let is_number = response !== true && !isNaN(response);
                articles_save_required = false;
                if (is_number) {
                    articles_content.attr('data-id', response);
                    article.id = response;
                    this.viewButton(response)
                    if (article.language) {
                        let translations = SBArticles.translations.get(article.parent_id);
                        articles_content.find(`.sb-language-switcher [data-language="${article.language}"]`).attr('data-id', response);
                        for (var i = 0; i < translations.length; i++) {
                            if (translations[i][0] == article.language) {
                                translations[i][1] = article.id;
                                SBArticles.translations.list[article.parent_id] = translations;
                                break;
                            }
                        }
                    }
                }
                if (!article.language) {
                    articles_area.find('.ul-articles .sb-active').html(article.title + '<i class="sb-icon-delete"></i>').attr('data-id', article.id);
                }
                if (onSuccess) {
                    onSuccess(response);
                }
                infoBottom(response === true || is_number ? 'Article saved' : response);
            });
        },

        show: function (article_id) {
            if (!article_id) {
                return;
            }
            loading(articles_content);
            this.get((response) => {
                articles_content.sbLoading(false);
                response = response[0];
                articles_content.sbLanguageSwitcher(this.translations.get(response.parent_id ? response.parent_id : article_id), 'articles', response.language);
                articles_content.attr('data-id', article_id);
                articles_area.find('.sb-article-title input').val(response.title);
                articles_area.find('.sb-article-link input').val(response.link);
                articles_area.find('#sb-article-id').html(`ID <span>${article_id}</span>`);
                articles_area.find('.sb-article-categories').setClass('sb-hide', response.language);
                if (editor_js || articles_area.find('#editorjs').length) {
                    editorJSLoad(response.editor_js ? (isString(response.editor_js) ? JSON.parse(response.editor_js) : response.editor_js) : response.content);
                } else {
                    articles_area.find('.sb-article-content textarea').val(response.content);
                }
                if (!response.language) {
                    articles_category_parent_select.val(response.parent_category);
                    articles_category_select.val(response.category);
                }
                this.viewButton(article_id)
                articles_save_required = false;
            }, article_id);
        },

        add: function () {
            let nav = articles_area.find('.ul-articles');
            nav.find('.sb-active').sbActive(false);
            nav.append(`<li class="sb-active"></li>`);
            articles_content.sbLanguageSwitcher([], 'articles');
            this.clear();
        },

        clear: function () {
            articles_content.removeAttr('data-id').removeClass('sb-hide');
            articles_content.find('input, textarea, select').val('');
            articles_content.find('input').prop('checked', false);
            editorJSLoad();
            this.viewButton();
            articles_save_required = false;
        },

        delete: function (article_id, onSuccess = false) {
            SBF.ajax({
                function: 'save-article',
                article: JSON.stringify({ id: article_id, delete: true })
            }, (response) => {
                this.clear();
                if (onSuccess) {
                    onSuccess(response);
                }
            });
        },

        populate: function (items, is_category = false) {
            let code = '';
            for (var i = 0; i < items.length; i++) {
                code += `<li data-id="${items[i].id}">${items[i].title}<i class="sb-icon-delete"></i></li>`;
            }
            articles_area.find(is_category ? '.ul-categories' : '.ul-articles').html(code);
            articles_area.find(is_category ? '.ul-categories > li' : '.ul-articles > li').eq(0).click();
            if (!items.length) {
                $(is_category ? articles_content_categories : articles_content).sbLoading(false).addClass('sb-hide');
            }
        },

        activeID: function (is_parent = false) {
            return is_parent ? articles_area.find('.ul-articles .sb-active').attr('data-id') : articles_content.attr('data-id');
        },

        viewButton: function (article_id = false) {
            if (this.page_url) {
                let button = articles_area.find('.sb-view-article');
                button.attr('href', article_id ? this.page_url + '?article_id=' + article_id : '');
            }
        },

        categories: {
            list: [],

            save: function (onSuccess = false) {
                this.updateActive();
                SBF.ajax({
                    function: 'save-articles-categories',
                    categories: JSON.stringify(this.list)
                }, (response) => {
                    if (onSuccess) {
                        onSuccess(response);
                    }
                    infoBottom(response === true ? 'Categories saved' : response);
                })
            },

            show: function (category_id, language = false) {
                let index = this.getIndex(category_id);
                if (index !== false) {
                    let category = language ? this.list[index].languages[language] : this.list[index];
                    let image = articles_content_categories.find('#category-image');
                    this.updateActive();
                    articles_content_categories.find('#category-title').val(category.title);
                    articles_content_categories.find('#category-description').val(category.description);
                    articles_content_categories.find('#category-parent').prop('checked', category.parent ? true : false);
                    articles_content_categories.sbLanguageSwitcher($.map(this.list[index].languages, function (e, index) { return index }), 'article-categories', language);
                    if (category.image) {
                        image.attr('data-value', category.image).css('background-image', `url("${category.image}")`);
                    } else {
                        image.removeAttr('data-value').removeAttr('style');
                    }
                    articles_content_categories.find('.category-parent').setClass('sb-hide', language);
                }
                articles_content_categories.sbLoading(false);
            },

            add: function () {
                let category_id = SBF.random();
                this.list.push({ id: category_id, title: '', description: '', image: '', languages: [] });
                let code = `<li data-id="${category_id}">${sb_('New category')}<i class="sb-icon-delete"></i></li>`;
                articles_area.find('.ul-categories').append(code);
                articles_area.find('.ul-categories li').eq(articles_area.find('.ul-categories li').length - 1).click();
            },

            delete: function (category_id) {
                let index = this.getIndex(category_id);
                let ul = articles_area.find('.ul-categories');
                if (index !== false) {
                    this.list.splice(index, 1);
                    ul.find(`[data-id="${category_id}"]`).remove();
                    ul.find('li').eq(0).click();
                    return true;
                }
                return false;
            },

            update: function () {
                let selected_category = articles_category_select.val();
                let selected_category_parent = articles_category_parent_select.val();
                let code = ['', '<option></option>'];
                for (var i = 0; i < this.list.length; i++) {
                    code[this.list[i].parent ? 0 : 1] += `<option value="${this.list[i].id}">${this.list[i].title}</option>`;
                }
                articles_category_parent_select.html(code[0]);
                articles_category_select.html(code[1]);
                articles_category_parent_select.val(selected_category_parent);
                articles_category_select.val(selected_category);
            },

            updateActive: function () {
                let id = this.activeID();
                if (id) {
                    let index = this.getIndex(id);
                    let language = articles_content_categories.find('.sb-language-switcher .sb-active').attr('data-language');
                    let category = { title: articles_content_categories.find('#category-title').val(), description: articles_content_categories.find('#category-description').val(), image: articles_content_categories.find('#category-image').attr('data-value') }
                    if (language) {
                        this.list[index].languages[language] = category;
                    } else {
                        category.id = SBF.stringToSlug(category.title);
                        category.parent = articles_content_categories.find('#category-parent').is(':checked');
                        category.languages = this.list[index].languages;
                        this.list[index] = category;
                        articles_area.find('.ul-categories .sb-active').html(category.title + '<i class="sb-icon-delete"></i>').attr('data-id', category.id);
                    }
                }
            },

            clear: function () {
                articles_content_categories.find('input, textarea').val('');
                articles_content_categories.find('#category-image').removeAttr('data-value').removeAttr('style');
            },

            getIndex: function (category_id) {
                for (var i = 0; i < this.list.length; i++) {
                    if (this.list[i].id == category_id) {
                        return i;
                    }
                }
                return false;
            },

            activeID: function () {
                return articles_area.find('.ul-categories .sb-active').attr('data-id');
            },

            translations: {

                add: function (language_code, category_id = false) {
                    if (!category_id) {
                        category_id = SBArticles.categories.activeID();
                    }
                    let index = SBArticles.categories.getIndex(category_id);
                    if (SBF.null(SBArticles.categories.list[index].languages)) SBArticles.categories.list[index].languages = {}; // Deprecated
                    SBArticles.categories.list[index].languages[language_code] = { title: '', description: '', image: '' };
                    articles_content_categories.sbLanguageSwitcher($.map(SBArticles.categories.list[index].languages, function (e, index) { return index }), 'article-categories', language_code);
                    SBArticles.categories.clear();
                },

                delete: function (language_code, category_id = false) {
                    let active_id = SBArticles.categories.activeID();
                    if (!category_id) {
                        category_id = SBArticles.categories.activeID(active_id);
                    }
                    delete SBArticles.categories.list[SBArticles.categories.getIndex(category_id)].languages[language_code];
                    SBArticles.categories.show(active_id);
                }
            }
        },

        translations: {
            list: {},

            add: function (language_code, article_id = false) {
                if (!article_id) {
                    article_id = SBArticles.activeID(true);
                }
                let translations = this.get(article_id);
                translations.push([language_code, false]);
                this.list[article_id] = translations;
                articles_content.sbLanguageSwitcher(translations, 'articles', language_code);
                SBArticles.clear();
            },

            delete: function (language_code, article_id = false) {
                if (!article_id) {
                    article_id = SBArticles.activeID(true);
                }
                let translations = this.get(article_id);
                for (var i = 0; i < translations.length; i++) {
                    if (translations[i][0] == language_code) {
                        translations.splice(i, 1);
                        this.list[article_id] = translations;
                        return true;
                    }
                }
                return false;
            },

            get: function (article_id) {
                return article_id in this.list ? this.list[article_id] : [];
            }
        }
    }

    /*
    * ----------------------------------------------------------
    * Reports
    * ----------------------------------------------------------
    */

    var SBReports = {
        chart: false,
        active_report: false,
        active_date_range: false,

        initChart: function (data, type = 'line', label_type = 1) {
            let values = [];
            let labels = [];
            let blues = SB_ADMIN_SETTINGS.color ? [SB_ADMIN_SETTINGS.color] : ['#049CFF', '#74C4F7', '#B9E5FF', '#0562A0', '#003B62', '#1F74C4', '#436786'];
            for (var key in data) {
                values.push(data[key][0]);
                labels.push(key);
            }
            if (type != 'line' && values.length > 6) {
                for (var i = 0; i < values.length; i++) {
                    blues.push('hsl(' + 210 + ', ' + Math.floor(Math.random() * 100) + '%, ' + Math.floor(Math.random() * 100) + '%)');
                }
            }
            if (this.chart) {
                this.chart.destroy();
            }
            this.chart = new Chart(reports_area.find('canvas'), {
                type: type,
                data: {
                    labels: labels,
                    datasets: [{
                        data: values,
                        backgroundColor: type == 'line' ? (SB_ADMIN_SETTINGS.color ? '#cbcbcb82' : '#028be530') : blues,
                        borderColor: type == 'line' ? (SB_ADMIN_SETTINGS.color ? SB_ADMIN_SETTINGS.color : '#049CFF') : '#FFFFFF',
                        borderWidth: 0
                    }],
                },
                options: {
                    legend: {
                        display: false
                    },
                    scales: {
                        yAxes: [{
                            ticks: {
                                callback: function (tickValue, index, ticks) {
                                    return label_type == 1 ? tickValue : (label_type == 2 ? new Date(tickValue * 1000).toISOString().substr(11, 8) : tickValue);
                                },
                                beginAtZero: true
                            }
                        }],
                        xAxes: [{
                            ticks: {
                                beginAtZero: true
                            }
                        }],
                    },
                    tooltips: {
                        callbacks: {
                            label: function (tooltipItem, chartData) {
                                let index = tooltipItem.index;
                                let value = chartData.datasets[0].data[index];
                                switch (label_type) {
                                    case 1: return value;
                                    case 2: return new Date(values[index] * 1000).toISOString().substr(11, 8);
                                    case 3: return value + '%';
                                    case 4: let tds = reports_area.find('.sb-table tbody tr').eq(index).find('td'); return tds.eq(0).text() + ' ' + tds.eq(1).text();
                                }
                            },
                        },
                        displayColors: false
                    }
                }
            });
        },

        initTable: function (header, data, inverse = false) {
            let code = '<thead><tr>';
            let index = data[Object.keys(data)[0]].length - 1;
            let list = [];
            for (var i = 0; i < header.length; i++) {
                code += `<th>${header[i]}</th>`;
            }
            code += '</tr></thead><tbody>';
            for (var key in data) {
                if (data[key][index] != 0) {
                    list.push([key, data[key][index]]);
                }
            }
            if (inverse) {
                list.reverse();
            }
            for (var i = 0; i < list.length; i++) {
                code += `<tr><td><div>${list[i][0]}</div></td><td>${list[i][1]}</td></tr>`;
            }
            code += '</tbody>';
            reports_area.find('table').html(code);
        },

        initReport: function (name = false, date_range = false) {
            let area = reports_area.find('.sb-tab > .sb-content');
            date_range = SBF.null(date_range) ? [false, false] : date_range.split(' - ');
            area.sbLoading(true);
            if (name) {
                this.active_report = name;
            }
            if (!this.active_report) {
                return;
            }
            this.active_date_range = date_range;
            this.getData(this.active_report, date_range[0], date_range[1], (response) => {
                if (response == false) {
                    area.addClass('sb-no-results-active');
                } else {
                    area.removeClass('sb-no-results-active');
                    this.initChart(response.data, response.chart_type, response.label_type);
                    this.initTable(response.table, response.data, response.table_inverse);
                    reports_area.find('.sb-reports-title').html(response.title);
                    reports_area.find('.sb-reports-text').html(response.description);
                    reports_area.find('.sb-collapse-btn').remove();
                    if (!responsive) {
                        collapse(reports_area.find('.sb-collapse'), reports_area.find('canvas').outerHeight() - 135);
                    }
                }
                area.sbLoading(false);
            });
        },

        getData: function (name, date_start = false, date_end = false, onSuccess) {
            SBF.ajax({
                function: 'reports',
                name: name,
                date_start: date_start,
                date_end: date_end,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            }, (response) => {
                onSuccess(response);
            });
        },

        initDatePicker: function () {
            let settings = {
                ranges: {},
                locale: {
                    format: 'DD/MM/YYYY',
                    separator: ' - ',
                    applyLabel: sb_('Apply'),
                    cancelLabel: sb_('Cancel'),
                    fromLabel: sb_('From'),
                    toLabel: sb_('To'),
                    customRangeLabel: sb_('Custom'),
                    weekLabel: sb_('W'),
                    daysOfWeek: [
                        sb_('Su'),
                        sb_('Mo'),
                        sb_('Tu'),
                        sb_('We'),
                        sb_('Th'),
                        sb_('Fr'),
                        sb_('Sa')
                    ],
                    monthNames: [
                        sb_('January'),
                        sb_('February'),
                        sb_('March'),
                        sb_('April'),
                        sb_('May'),
                        sb_('June'),
                        sb_('July'),
                        sb_('August'),
                        sb_('September'),
                        sb_('October'),
                        sb_('November'),
                        sb_('December')
                    ],
                    firstDay: 1
                },
                showCustomRangeLabel: true,
                alwaysShowCalendars: true,
                autoApply: true
            };
            settings.ranges[sb_('Today')] = [moment(), moment()];
            settings.ranges[sb_('Yesterday')] = [moment().subtract(1, 'days'), moment().subtract(1, 'days')];
            settings.ranges[sb_('Last 7 Days')] = [moment().subtract(6, 'days'), moment()];
            settings.ranges[sb_('Last 30 Days')] = [moment().subtract(29, 'days'), moment()];
            settings.ranges[sb_('This Month')] = [moment().startOf('month'), moment().endOf('month')];
            settings.ranges[sb_('Last Month')] = [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')];
            reports_area.find('#sb-date-picker').daterangepicker(settings).val('');
        },

        export: function (onSuccess) {
            SBF.ajax({
                function: 'reports-export',
                name: this.active_report,
                date_start: this.active_date_range[0],
                date_end: this.active_date_range[1],
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            }, (response) => {
                onSuccess(response);
            });
        },

        open: function (id) {
            header.find('.sb-admin-nav #sb-reports').click();
            setTimeout(() => {
                reports_area.find('#' + id).click().get(0).scrollIntoView();
            }, 300);
        }
    }

    /*
    * ----------------------------------------------------------
    * Users
    * ----------------------------------------------------------
    */

    var SBUsers = {
        real_time: null,
        datetime_last_user: '2000-01-01 00:00:00',
        sorting: ['creation_time', 'DESC'],
        user_types: ['visitor', 'lead', 'user'],
        user_main_fields: ['id', 'first_name', 'last_name', 'email', 'password', 'profile_image', 'user_type', 'creation_time', 'token', 'last_activity', 'department'],
        search_query: '',
        init: false,
        busy: false,
        table_extra: false,
        history: [],

        // Table menu filter
        filter: function (type) {
            if (type == 'all') {
                type = ['visitor', 'lead', 'user'];
            } else if (type == 'agent') {
                type = ['agent', 'admin'];
            } else {
                type = [type];
            }
            this.user_types = type;
            loading(users_table);
            users_pagination = 1;
            users_pagination_count = 1;
            let settings = type[0] == 'online' ? ['get-online-users', SB_ACTIVE_AGENT.id, this.sorting[0]] : ['get-users', -1, this.sorting];
            SBF.ajax({
                function: settings[0],
                sorting: settings[2],
                user_types: type,
                search: this.search_query,
                extra: this.table_extra
            }, (response) => {
                this.populate(response);
                users_table.sbLoading(false);
            });
        },

        // Table menu sort
        sort: function (field, direction = 'DESC') {
            this.sorting = [field, direction];
            loading(users_table);
            users_pagination = 1;
            users_pagination_count = 1;
            SBF.ajax({
                function: 'get-users',
                sorting: this.sorting,
                user_types: this.user_types,
                search: this.search_query,
                extra: this.table_extra
            }, (response) => {
                this.populate(response);
                users_table.sbLoading(false);
            });
        },

        // Search users
        search: function (input) {
            searchInput(input, (search, icon) => {
                users_pagination = 1;
                users_pagination_count = 1;
                SBF.ajax({
                    function: search.length > 1 ? 'search-users' : 'get-users',
                    search: search,
                    user_types: this.user_types,
                    sorting: this.sorting,
                    extra: this.table_extra
                }, (response) => {
                    this.user_types = ['visitor', 'lead', 'user'];
                    this.populate(response);
                    this.search_query = search;
                    $(icon).sbLoading(false);
                    users_table_menu.find('li').sbActive(false).eq(0).sbActive(true);
                });
            });
        },

        // Populate the table
        populate: function (response) {
            let code = '';
            let count = response.length;
            if (count) {
                for (var i = 0; i < count; i++) {
                    code += this.getRow(new SBUser(response[i], response[i].extra));
                }
            } else {
                code = `<p class="sb-no-results">${sb_('No users found.')}</p>`;
            }
            users_table.parent().scrollTop(0);
            users_table.find('tbody').html(code);
            if (this.user_types.includes('agent')) {
                SBF.ajax({
                    function: 'get-online-users',
                    agents: true
                }, (response) => {
                    let ids = [];
                    for (var i = 0; i < response.length; i++) {
                        ids.push(response[i].id);
                    }
                    users_table.find('[data-user-id]').each(function () {
                        $(this).find('.sb-td-profile').addClass('sb-' + (ids.includes($(this).attr('data-user-id')) ? 'online' : 'offline'));
                    });
                });
            }
        },

        // Update users and table with new users
        update: function () {
            if (!this.busy) {
                let checks = ['user', 'visitor', 'lead', 'agent'];
                let populate = checks.includes(this.user_types[0]) && !this.search_query;
                let filter = users_table_menu.find('.sb-active').data('type');
                if (filter == 'online') {
                    this.filter(filter);
                } else {
                    this.busy = true;
                    SBF.ajax({
                        function: 'get-new-users',
                        datetime: this.datetime_last_user
                    }, (response) => {
                        let count = response.length;
                        this.busy = false;
                        if (count > 0) {
                            let code = '';
                            for (var i = 0; i < count; i++) {
                                let user = new SBUser(response[i]);
                                users[user.id] = user;
                                this.updateMenu('add', user.type);
                                if (populate) {
                                    code += this.getRow(user);
                                }
                            }
                            if (populate) {
                                users_table.find('tbody').prepend(code);
                                if (checks.includes(filter)) {
                                    let selector = '';
                                    for (var i = 0; i < checks.length; i++) {
                                        selector += checks[i] == filter ? '' : `[data-user-type="${checks[i]}"],`;
                                    }
                                    users_table.find(selector.slice(0, -1)).remove();
                                }
                            }
                            this.datetime_last_user = response[0].creation_time;
                        }
                    });
                }
            }
        },

        // Get a user row code
        getRow: function (user) {
            if (user instanceof SBUser) {
                let code = '';
                for (var i = 0; i < this.table_extra.length; i++) {
                    let slug = this.table_extra[i];
                    code += `<td class="sb-td-${slug}">${this.user_main_fields.includes(slug) ? user.get(slug) : user.getExtra(slug)}</td>`;
                }
                return `<tr data-user-id="${user.id}" data-user-type="${user.type}"><td><input type="checkbox" /></td><td class="sb-td-profile"><a class="sb-profile"><img loading="lazy" src="${user.image}" /><span>${user.name}</span></a></td>${code}<td class="sb-td-email">${user.get('email')}</td><td class="sb-td-ut">${sb_(user.type)}</td><td>${SBF.beautifyTime(user.get('last_activity'), true)}</td><td>${SBF.beautifyTime(user.get('creation_time'))}</td></tr>`;
            } else {
                SBF.error('User not of type SBUser', 'SBUsers.getRow');
                return false;
            }
        },

        // Update a user row
        updateRow: function (user) {
            let row = users_table.find(`[data-user-id="${user.id}"]`);
            if (row.length) {
                let menu_active = users_table_menu.find('.sb-active').data('type');
                if ((user.type != menu_active) && !(user.type == 'admin' && menu_active == 'agent') && menu_active != 'all') {
                    let counter = admin.find(`[data-type="${user.type == 'admin' ? 'agent' : user.type}"] span`);
                    let count = parseInt(counter.attr('data-count'));
                    counter.html(count + 1).attr('data-count', count + 1);
                    row.remove();
                } else {
                    row.replaceWith(this.getRow(user));
                }
            } else {
                users_table.find('tbody').append(this.getRow(user));
            }
        },

        // Update users table menu
        updateMenu: function (action = 'all', type = false) {
            let user_types = ['all', 'user', 'lead', 'visitor'];
            if (action == 'all') {
                SBF.ajax({
                    function: 'count-users'
                }, (response) => {
                    for (var i = 0; i < user_types.length; i++) {
                        this.updateMenuItem('set', user_types[i], response[user_types[i]]);
                    }
                });
            } else {
                this.updateMenuItem(action, type);
            }
        },

        updateMenuItem: function (action = 'set', type = false, count = 1) {
            let item = users_table_menu.find(`[data-type="${type}"] span`);
            let user_types = ['user', 'lead', 'visitor'];
            if (action != 'set') {
                count = parseInt(item.attr('data-count')) + (1 * (action == 'add' ? 1 : -1));
            }
            item.html(`(${count})`).attr('data-count', count);
            count = 0;
            for (var i = 0; i < user_types.length; i++) {
                count += parseInt(users_table_menu.find(`[data-type="${user_types[i]}"] span`).attr('data-count'));
            }
            users_table_menu.find(`[data-type="all"] span`).html(`(${count})`).attr('data-count', count);
        },

        // Delete a user
        delete: function (user_ids) {
            loading(users_table);
            if (Array.isArray(user_ids)) {
                if (SB_ADMIN_SETTINGS.cloud) {
                    user_ids = SBCloud.removeAdminID(user_ids);
                    if (!user_ids.length) {
                        return;
                    }
                }
                SBF.ajax({
                    function: 'delete-users',
                    user_ids: user_ids
                }, () => {
                    for (var i = 0; i < user_ids.length; i++) {
                        delete users[user_ids[i]];
                        users_table.find(`[data-user-id="${user_ids[i]}"]`).remove();
                        conversations_admin_list_ul.find(`[data-user-id="${user_ids[i]}"]`).remove();
                        SBF.event('SBUserDeleted', user_ids[i]);
                    }
                    if (users_table.find('[data-user-id]').length == 0) {
                        this.filter(users_table_menu.find('.sb-active').data('type'));
                    }
                    infoBottom('Users deleted');
                    this.updateMenu();
                    users_table.sbLoading(false);
                });
            } else {
                users[user_ids].delete(() => {
                    let conversation = conversations_admin_list_ul.find(`[data-user-id="${user_ids}"]`);
                    if (activeUser().id == user_ids) {
                        activeUser(false);
                    }
                    if (conversation.sbActive()) {
                        SBChat.conversation = false;
                        setTimeout(() => { SBConversations.clickFirst() }, 300);
                    }
                    delete users[user_ids];
                    users_table.find(`[data-user-id="${user_ids}"]`).remove();
                    conversation.remove();
                    admin.sbHideLightbox();
                    infoBottom('User deleted');
                    this.updateMenu();
                    users_table.sbLoading(false);
                });
            }
        },

        // Start or stop the real time update of the users and table
        startRealTime: function () {
            if (SBPusher.active) {
                return;
            }
            this.stopRealTime();
            this.real_time = setInterval(() => {
                this.update();
            }, 1000);
        },

        stopRealTime: function () {
            clearInterval(this.real_time);
        },

        // CSV generation and download
        csv: function () {
            SBF.ajax({ function: 'csv-users', users_id: SBUsers.getSelected() }, (response) => {
                dialogDeleteFile(response, 'sb-export-users-close', 'Users exported');
                window.open(response);
            });
        },

        // Update user and agent activity status
        updateUsersActivity: function () {
            SBF.updateUsersActivity(agent_online ? SB_ACTIVE_AGENT.id : -1, activeUser() ? activeUser().id : -1, function (response) {
                SBUsers.setActiveUserStatus(response == 'online');
            });
        },

        // Set active agent status
        setActiveAgentStatus: function (online = true) {
            let label = online ? 'online' : 'offline';
            agent_online = online;
            header.find('[data-value="status"]').html(sb_(SBF.slugToString(label))).attr('class', 'sb-' + label);
            if (SBPusher.active) {
                if (online) {
                    SBPusher.presence();
                    if (SB_ADMIN_SETTINGS.routing_only) {
                        SBF.ajax({ function: 'assign-conversations-active-agent' }, () => {
                            SBConversations.update();
                        });
                    }
                } else {
                    SBPusher.presenceUnsubscribe();
                }
            }
            if (!SB_ADMIN_SETTINGS.reports_disabled) {
                SBF.ajax({ function: 'reports-update', name: label });
            }
        },

        // Set active user status
        setActiveUserStatus: function (online = true) {
            let labels = conversations_area.find('.sb-conversation .sb-top > .sb-labels');
            labels.find('.sb-status-online').remove();
            if (online) labels.prepend(`<span class="sb-status-online">${sb_('Online')}</span>`);
            SBChat.user_online = online;
        },

        // Notification for new online users
        onlineUserNotification: function (member) {
            let notification = SB_ADMIN_SETTINGS.online_users_notification;
            if (notification) {
                let message = member.info.first_name + ' ' + member.info.last_name;
                let icon = this.userProfileImage(member.info.profile_image);
                if (SB_ADMIN_SETTINGS.push_notifications && member.info.id && !this.history.includes(member.info.id)) {
                    SBF.ajax({
                        function: 'push-notification',
                        title: notification,
                        message: message,
                        icon: icon,
                        interests: SB_ACTIVE_AGENT.id,
                        user_id: member.info.id
                    });
                } else if (SBConversations.desktop_notifications) {
                    SBChat.desktopNotification(notification, message, icon, false, member.info.id);
                }
                this.history.push(member.info.id);
            }
        },

        // Get user profile image
        userProfileImage: function (url) {
            return !url || url.indexOf('user.svg') ? SB_ADMIN_SETTINGS.notifications_icon : url;
        },

        getSelected: function () {
            let user_ids = [];
            users_table.find('tr').each(function () {
                if ($(this).find('td input[type="checkbox"]').is(':checked')) {
                    user_ids.push($(this).attr('data-user-id'));
                }
            });
            return user_ids;
        }
    }

    /*
    * ----------------------------------------------------------
    * Conversations 
    * ----------------------------------------------------------
    */

    var SBConversations = {
        real_time: null,
        datetime_last_conversation: '2000-01-01 00:00:00',
        user_typing: false,
        desktop_notifications: false,
        flash_notifications: false,
        busy: false,
        is_search: false,
        menu_count_ajax: false,
        previous_editor_text: false,

        // Open the conversations tab
        open: function (conversation_id = -1, user_id) {
            if (conversation_id != -1) {
                this.openConversation(conversation_id, user_id);
            }
            admin.sbHideLightbox();
            header.find('.sb-admin-nav a').sbActive(false).parent().find('#sb-conversations').sbActive(true);
            admin.find(' > main > div').sbActive(false);
            conversations_area.sbActive(true).find('.sb-board').removeClass('sb-no-conversation');
            select_departments.find(' > p').attr('data-id', '').attr('data-value', '').html(sb_('None'));
            this.notes.update([]);
            this.tags.update([]);
            this.startRealTime();
        },

        // Open a single conversation
        openConversation: function (conversation_id, user_id = false, scroll = true) {
            if (user_id === false && conversation_id) {
                SBF.ajax({
                    function: 'get-user-from-conversation',
                    conversation_id: conversation_id
                }, (response) => {
                    if (!SBF.null(response.id)) {
                        this.openConversation(conversation_id, response.id, scroll);
                    } else {
                        SBF.error('Conversation not found', 'SBAdmin.openConversation');
                    }
                });
            } else {
                let new_user = SBF.null(users[user_id]) || !(users[user_id].details.email);
                let conversation = conversations_area.find(`[data-conversation-id="${conversation_id}"]`);
                let conversation_lis = conversations_admin_list_ul.find('li');
                conversations_area_list.html('');
                conversations_area_list.sbLoading(true);

                // Init the user
                if (new_user) {
                    activeUser(new SBUser({ 'id': user_id }));
                    activeUser().update(() => {
                        users[user_id] = activeUser();
                        this.updateUserDetails();
                    });
                } else {
                    activeUser(users[user_id]);
                    this.updateCurrentURL();
                }
                if (SBPusher.active) {
                    SBPusher.event('client-typing', (response) => {
                        if (response.user_id == activeUser().id) {
                            SBConversations.typing(true);
                            clearTimeout(pusher_timeout);
                            pusher_timeout = setTimeout(() => { SBConversations.typing(false) }, 1000);
                        }
                    });
                    SBPusher.event('new-message', () => {
                        SBChat.update();
                    });
                    SBPusher.event('agent-active-conversation-changed', (response) => {
                        if (response.previous_conversation_id == conversation_id) {
                            conversations_area.find('.sb-conversation-busy').remove();
                        }
                    }, 'agents');
                    SBPusher.event('init', (response) => {
                        SBConversations.updateCurrentURL(response.current_url);
                    });
                    SBPusher.event('message-status-update', (response) => {
                        if (SBChat.conversation) {
                            SBChat.conversation.updateMessagesStatus(response.message_ids);
                        }
                    });
                }
                if (SB_ADMIN_SETTINGS.smart_reply) {
                    suggestions_area.html('');
                }

                // Open the conversation
                conversation_lis.sbActive(false);
                if (!SB_ADMIN_SETTINGS.departments_show) {
                    conversation_lis.attr('data-color', '');
                }
                conversation.sbActive(true);
                if (conversation_id != -1) {
                    activeUser().getFullConversation(conversation_id, (response) => {
                        let conversation_status_code = response.status_code;
                        let select = conversations_filters.eq(0);
                        let select_status_code = select.find('.sb-active').attr('data-value');
                        SBChat.setConversation(response);
                        SBChat.populate();
                        this.setReadIcon(conversation_status_code);
                        conversations_area.find('.sb-conversation-busy').remove();
                        this.updateUserDetails();
                        conversations_area.find('.sb-top > a').html(response.get('title'));

                        // Automatic translation
                        SBAdmin.must_translate = SB_ADMIN_SETTINGS.translation && activeUser().language && SB_ADMIN_SETTINGS.active_agent_language != activeUser().language;
                        if (SBAdmin.must_translate) {
                            let strings = [];
                            let message_ids = [];
                            let message_user_types = [];
                            let messages_translated = [];
                            for (var i = 0; i < response.messages.length; i++) {
                                let message = response.messages[i];
                                if (message.message) {
                                    if ((message.payload('original-message') && (!message.payload('original-message-language') || message.payload('original-message-language') == SB_ADMIN_SETTINGS.active_agent_language)) || (message.payload('translation') && (!message.payload('translation-language') || message.payload('translation-language') == SB_ADMIN_SETTINGS.active_agent_language))) {
                                        messages_translated.push(message);
                                    } else {
                                        strings.push(message.message);
                                        message_ids.push(message.id);
                                        message_user_types.push(message.get('user_type'));
                                    }
                                }
                            }
                            if (strings.length) {
                                SBApps.dialogflow.translate(strings, SB_ADMIN_SETTINGS.active_agent_language, (response_translate) => {
                                    if (response_translate) {
                                        for (var i = 0; i < response_translate.length; i++) {
                                            this.openConversation_2(message_ids[i], message_user_types[i], response_translate[i]);
                                        }
                                    }
                                    if (SB_ADMIN_SETTINGS.smart_reply) {
                                        this.openConversation_1(SBChat.conversation, suggestions_area);
                                    }
                                }, message_ids, conversation_id);
                            } else if (SB_ADMIN_SETTINGS.smart_reply) {
                                this.openConversation_1(SBChat.conversation, suggestions_area);
                            }
                            for (var i = 0; i < messages_translated.length; i++) {
                                this.openConversation_2(messages_translated[i].id, messages_translated[i].user_type, messages_translated[i].payload('original-message') ? messages_translated[i].payload('original-message') : messages_translated[i].payload('translation'));
                            }
                        }

                        // Departments
                        if (select_departments.length) {
                            let department = response.get('department') ? this.getDepartments(response.get('department')) : false;
                            let color = department ? department['department-color'] : '';
                            if (!SB_ADMIN_SETTINGS.departments_show) {
                                conversation_lis.attr('data-color', '');
                            }
                            getListConversation(conversation_id).attr('data-color', color);
                            select_departments.find(' > p').attr('data-id', department ? department['department-id'] : '').attr('data-value', color).html(department ? department['department-name'] + '<span></span>' : sb_('None'));
                        }

                        // Agent assignment
                        let select_agents = conversations_area.find('#conversation-agent');
                        if (select_agents.length) {
                            let item = select_agents.find(`[data-id="${response.get('agent_id')}"]`);
                            select_agents.find(' > p').attr('data-value', item.data('id')).html(item.html());
                        }

                        // Activate the conversation
                        if ([1, 2, '1', '2'].includes(conversation_status_code)) {
                            conversation_status_code = 0;
                        }
                        if (select_status_code != conversation_status_code && !$(conversations_admin_list).find('.sb-search-btn').sbActive() && !SBConversations.filters()[1] && !SBConversations.filters()[3]) {
                            select.find(`[data-value="${conversation_status_code}"]`).click();
                            select.find('ul').sbActive(false);
                        }
                        if (responsive) {
                            this.mobileOpenConversation();
                        }
                        if (!conversation.length && (select_status_code == conversation_status_code || (select_status_code == 0 && conversation_status_code == 1))) {
                            conversations_admin_list_ul.prepend(SBConversations.getListCode(response).replace('<li', '<li class="sb-active"'));
                        }
                        conversations_admin_list_ul.find('li').sbActive(false);
                        conversation.sbActive(true);
                        if (scroll) {
                            this.scrollTo();
                        }
                        this.notificationsCounterReset(conversation_id, conversation);
                        conversations_area_list.sbInitTooltips();

                        // Check if another agent has the conversation open
                        let busy = response.get('busy');
                        if (busy) {
                            conversations_area.find('.sb-editor > .sb-labels').prepend(`<span data-agent="${busy.id}" class="sb-status-warning sb-conversation-busy">${busy.first_name} ${busy.last_name} ${sb_('is replying to this conversation')}</span>`);
                        }

                        // App panels
                        if (SBApps.is('woocommerce')) {
                            SBApps.woocommerce.conversationPanel();
                        }
                        if (SBApps.is('ump')) {
                            SBApps.ump.conversationPanel();
                        }
                        if (SBApps.is('perfex')) {
                            SBApps.perfex.conversationPanel();
                        }
                        if (SBApps.is('whmcs')) {
                            SBApps.whmcs.conversationPanel();
                        }
                        if (SBApps.is('aecommerce')) {
                            SBApps.aecommerce.conversationPanel();
                        }
                        if (SBApps.is('martfury')) {
                            SBApps.martfury.conversationPanel();
                        }
                        if (SBApps.is('armember')) {
                            SBApps.armember.conversationPanel();
                        }
                        if (SBApps.is('zendesk')) {
                            SBApps.zendesk.conversationPanel();
                        }
                        if (SBApps.is('opencart')) {
                            SBApps.opencart.conversationPanel();
                        }

                        // Notes and Tags
                        this.notes.update(response.details.notes);
                        this.tags.update(response.details.tags);

                        // Attachments
                        this.attachments();

                        // Suggestions
                        if (SB_ADMIN_SETTINGS.smart_reply && !SBAdmin.must_translate) {
                            this.openConversation_1(response, suggestions_area);
                        }

                        // Rating
                        for (var i = response.messages.length - 1; i > 0; i--) {
                            let payload = response.messages[i].get('payload');
                            let break_loop = false;
                            if (payload && payload['rich-messages']) {
                                for (var rich_message_id in payload['rich-messages']) {
                                    let rich_message = payload['rich-messages'][rich_message_id];
                                    if (rich_message.type == 'rating') {
                                        conversations_area.find('.sb-profile-list > ul').append(`<li data-id="rating"><i class="sb-icon sb-icon-${rich_message.result.rating == 1 ? 'like' : 'dislike'}"></i><span>${sb_('User rating')}</span><label>${sb_(rich_message.result.rating == 1 ? 'Helpful' : 'Not helpful')}</label></li>`);
                                        break_loop = true;
                                        break;
                                    }
                                }
                            }
                            if (break_loop) break;
                        }

                        // Populate user conversations on the bottom right area
                        activeUser().getConversations(function (response) {
                            conversations_area.find('.sb-user-conversations').html(response.length == 1 ? '' : activeUser().getConversationsCode(response)).prev().setClass('sb-hide', response.length == 1);
                        });

                        conversations_area_list.sbLoading(false);
                    });
                } else {
                    SBChat.clear();
                    conversations_admin_list_ul.find('li').sbActive(false);
                    conversations_area_list.sbLoading(false);
                    conversations_area.find('.sb-top > a').html('');
                }

                // User details
                if (!new_user) {
                    this.updateUserDetails();
                }

                // More settings
                conversations_area.find('.sb-board').removeClass('sb-no-conversation');
                SBUsers.updateUsersActivity();
                this.startRealTime();
                if (SBF.getURL('conversation') != conversation_id && conversation_id != -1) {
                    pushState('?conversation=' + conversation_id);
                }
            }
        },

        openConversation_1: function (response, suggestions_area) {
            let message = response.getLastUserMessage();
            suggestions_area.html('');
            if (message && message.payload('sb-human-takeover')) {
                message = response.getLastUserMessage(message.get('index'));
            }
            if (message) {
                SBApps.dialogflow.smartReply(message.payload('translation') ? message.payload('translation') : (message.payload('original-message') ? message.payload('original-message') : message.message));
            }
        },

        openConversation_2: function (message_id, user_type, translation) {
            let message = SBChat.conversation.getMessage(message_id);
            if (message) {
                message.set('translation', translation);
                conversations_area_list.find(`[data-id="${message_id}"]`).replaceWith(message.getCode(true));
                conversations_area_list.find(`[data-id="${message_id}"] .sb-menu`).prepend(`<li data-value="original">${sb_(SBF.isAgent(user_type) && user_type != 'bot' ? 'View translation' : 'View original message')}</li>`);
            }
        },

        // [Deprecated] this method is obsolete and it will be removed soon
        populate: function (conversation_id, user_id, scroll) {
            this.openConversation(conversation_id, user_id, scroll);
        },

        // Populate conversations
        populateList: function (response) {
            let code = '';
            conversations = [];
            for (var i = 0; i < response.length; i++) {
                code += this.getListCode(response[i]);
                conversations.push(new SBConversation([new SBMessage(response[i])], response[i]));
            }
            if (!code) {
                code = `<p class="sb-no-results">${sb_('No conversations found.')}</p>`;
            }
            conversations_admin_list_ul.html(code);
            this.updateMenu();
            SBF.event('SBAdminConversationsLoaded', { conversations: response });
        },

        // Update the left conversations list with new conversations or messages 
        update: function () {
            if (!this.busy && conversations_filters.eq(0).find('p').attr('data-value') == 0) {
                let filters = SBConversations.filters();
                this.busy = true;
                SBF.ajax({
                    function: 'get-new-conversations',
                    datetime: this.datetime_last_conversation,
                    department: filters[1],
                    source: filters[2],
                    tag: filters[3]
                }, (response) => {
                    this.busy = false;
                    if (response.length) {
                        let code_pending = '';
                        let code_not_pending = '';
                        let active_conversation_id = SBChat.conversation ? SBChat.conversation.id : -1;
                        let li_not_pending;
                        let scroll_to_conversation = false;
                        let id_check = [];
                        this.datetime_last_conversation = response[0].last_update_time;
                        for (var i = 0; i < response.length; i++) {
                            if (!id_check.includes(response[i].id)) {
                                let message = new SBMessage(response[i]);
                                let conversation = new SBConversation([message], response[i]);
                                let status_code = conversation.status_code;
                                let is_pending_status_code = status_code == 2 || (SB_ADMIN_SETTINGS.order_by_date && (status_code == 0 || status_code == 1));
                                let user_id = conversation.user_id;
                                let conversation_id = conversation.id;
                                let conversation_li = getListConversation(conversation_id);
                                let conversation_index = conversation_li.index();
                                let is_existing_conversation = conversation_li.length;
                                let user_type = message.get('user_type');
                                let message_text = conversation.get('message');
                                let active_conversation = active_conversation_id == conversation_id;
                                let is_user = !SBF.isAgent(user_type);
                                if (is_pending_status_code && (!active_conversation || SBF.visibility_status == 'hidden') && (is_user || message.payload('human-takeover-message-confirmation'))) {
                                    let notifications_counter = SBF.storage('notifications-counter');
                                    if (!notifications_counter) {
                                        notifications_counter = {};
                                    }
                                    if (!notifications_counter[conversation_id]) {
                                        notifications_counter[conversation_id] = [];
                                    }
                                    if (!notifications_counter[conversation_id].includes(message.id)) {
                                        notifications_counter[conversation_id].push(message.id);
                                        SBF.storage('notifications-counter', notifications_counter);
                                    }
                                }
                                let conversation_code = this.getListCode(conversation, null);
                                let payload = response[i].payload ? JSON.parse(response[i].payload) : {};

                                // Active conversation
                                if (active_conversation) {
                                    conversation_code = conversation_code.replace('<li', '<li class="sb-active"');
                                    this.updateUserDetails();
                                    if (is_existing_conversation) {
                                        if (message_text) {
                                            conversation_li.replaceWith(conversation_code);
                                        }
                                        conversations[conversation_index].set('status_code', status_code);
                                        this.setReadIcon(status_code);
                                    } else {
                                        scroll_to_conversation = true;
                                    }
                                } else if (is_existing_conversation) {

                                    // Conversation already in list but not active
                                    conversations[conversation_index] = conversation;
                                    getListConversation(conversation_id).remove();
                                }

                                // Add the user to the global users array if it doesn't exists
                                if (!(user_id in users)) {
                                    users[user_id] = new SBUser({ id: user_id, first_name: conversation.get('first_name'), last_name: conversation.get('last_name'), profile_image: conversation.get('profile_image'), user_type: user_type });
                                }

                                // New or unactive conversation 
                                if (!active_conversation || !is_existing_conversation) {
                                    if (is_pending_status_code) {
                                        code_pending += conversation_code;
                                        conversations.unshift(conversation);
                                    } else if (status_code == 0 || status_code == 1) {
                                        li_not_pending = conversations_admin_list_ul.find('[data-conversation-status="2"]').last();
                                        if (li_not_pending.length) {
                                            conversations.splice(li_not_pending.index() + 1, 0, conversation);
                                            code_not_pending += conversation_code;
                                        } else {
                                            code_pending += conversation_code;
                                        }
                                    }
                                    if (activeUser() && user_id == activeUser().id) {
                                        activeUser().getConversations((response) => {
                                            conversations_area.find('.sb-user-conversations').html(activeUser().getConversationsCode(response));
                                        });
                                    }
                                    SBF.event('SBAdminNewConversation', { conversation: conversation });
                                }

                                // Update user
                                if (activeUser() && (payload.event == 'update-user' || (users[user_id].type != user_type))) {
                                    activeUser().update(() => {
                                        this.updateUserDetails();
                                        users[activeUser().id] = activeUser();
                                    });
                                }

                                // Desktop, flash, sounds notifications
                                if (!SBChat.tab_active && status_code == 2 && (is_user || payload.preview) && (message_text || conversation.getAttachments().length || payload.preview)) {
                                    if (this.desktop_notifications) {
                                        let user_details = [users[user_id].nameBeautified, users[user_id].image];
                                        SBChat.desktopNotification(user_details[0], payload.preview ? payload.preview : message_text, user_details[1], conversation_id, user_id);
                                    }
                                    if (this.flash_notifications) {
                                        SBChat.flashNotification();
                                    }
                                    if (SBChat.audio && SB_ADMIN_SETTINGS.sound) {
                                        SBChat.playSound();
                                    }
                                }
                                id_check.push(conversation_id);
                            }
                        }
                        if (!SBConversations.is_search) {
                            if (code_pending) {
                                conversations_admin_list_ul.prepend(code_pending);
                            }
                            if (code_not_pending) {
                                $(code_not_pending).insertAfter(li_not_pending);
                            }
                            if (scroll_to_conversation) {
                                this.scrollTo();
                            }
                            this.updateMenu();
                        }

                        // Update notifications counter
                        for (var i = 0; i < SBChat.notifications.length; i++) {
                            let is_found = false;
                            for (var j = 0; j < conversations.length; j++) {
                                if (conversations[j].id == SBChat.notifications[i][0]) {
                                    is_found = conversations[j].status_code == 2;
                                    break;
                                }
                            }
                            if (!is_found) {
                                SBChat.notifications.splice(i, 1);
                                i--;
                            }
                        }
                    }
                });
                if (SB_ADMIN_SETTINGS.assign_conversation_to_agent || SB_ACTIVE_AGENT.department) {
                    let ids = conversations_admin_list_ul.find(' > li').map(function () { return $(this).attr('data-conversation-id') }).get();
                    if (ids.length) {
                        SBF.ajax({
                            function: 'check-conversations-assignment',
                            conversation_ids: ids,
                            agent_id: SB_ADMIN_SETTINGS.assign_conversation_to_agent ? SB_ACTIVE_AGENT.id : false,
                            department: SB_ACTIVE_AGENT.department
                        }, (response) => {
                            if (response) {
                                for (var i = 0; i < response.length; i++) {
                                    getListConversation(response[i]).remove();
                                }
                            }
                        });
                    }
                }
            }
        },

        // Update the top left filter
        updateMenu: function () {
            let count = conversations_admin_list_ul.find('[data-conversation-status="2"]').length;
            let item = conversations_filters.eq(0);
            let span = item.find(' > p span');
            if (count == 100 || this.menu_count_ajax || SB_ADMIN_SETTINGS.order_by_date) {
                let status_code = item.find('li.sb-active').data('value');
                this.menu_count_ajax = true;
                SBF.ajax({
                    function: 'count-conversations',
                    status_code: status_code == 0 ? 2 : status_code
                }, (response) => {
                    span.html(`(${response})`);
                });
            } else {
                span.html(`(${count})`);
            }
        },

        // Return the code of the message menu
        messageMenu: function (agent, message = false) {
            let code = (message && SB_ADMIN_SETTINGS.chatbot_features ? `<li data-value="bot">${sb_('Train chatbot')}</li>` : '') + ((agent && !SB_ADMIN_SETTINGS.supervisor && SB_ADMIN_SETTINGS.allow_agent_delete_message) || (SB_ADMIN_SETTINGS.supervisor && SB_ADMIN_SETTINGS.allow_supervisor_delete_message) ? `<li data-value="delete">${sb_('Delete')}</li>` : '');
            return code ? `<i class="sb-menu-btn sb-icon-menu"></i><ul class="sb-menu">${code}</ul>` : '';
        },

        // Update the users details of the conversations area
        updateUserDetails() {
            if (!activeUser()) return;
            conversations_area.find(`[data-user-id="${activeUser().id}"] .sb-name`).html(activeUser().name);
            conversations_area.find(`.sb-top > a`).html(SBChat.conversation ? SBChat.conversation.title : activeUser().name);
            conversations_user_details.find('.sb-profile').setProfile();
            SBProfile.populate(activeUser(), conversations_area.find('.sb-profile-list'));
        },

        // Set the read status icon
        setReadIcon(status_code) {
            let unread = status_code == 2;
            conversations_area.find('.sb-top [data-value="read"],.sb-top [data-value="unread"]').sbActive([0, 1, 2].includes(parseInt(status_code))).attr('data-value', unread ? 'read' : 'unread').attr('data-sb-tooltip', sb_(unread ? 'Mark as read' : 'Mark as unread')).parent().sbInitTooltips().find('i').attr('class', unread ? 'sb-icon-check-circle' : 'sb-icon-circle');
        },

        // Return the conversation code of the left conversations list
        getListCode: function (conversation, status) {
            if (!(conversation instanceof SBConversation)) {
                conversation = new SBConversation([new SBMessage(conversation)], conversation);
            }
            let message = conversation.getCode(true);
            let label_new = '';
            let tags = SB_ADMIN_SETTINGS.tags_show ? conversation.get('tags') : '';
            let department_id = conversation.get('department');
            let notification_counter = '';
            if (message.length > 110) {
                message = message.substr(0, 110) + ' ...';
            }
            if (SBF.null(status)) {
                status = conversation.status_code;
            }
            if (tags) {
                tags = SBConversations.tags.codeLeft(tags);
            }
            if (!SBChat.conversation || SBChat.conversation.id != conversation.id || SBF.visibility_status == 'hidden') {
                notification_counter = SBF.storage('notifications-counter');
                if (notification_counter && notification_counter[conversation.id] && notification_counter[conversation.id].length) {
                    if (status == 2) {
                        notification_counter = `<span class="sb-notification-counter">${notification_counter[conversation.id].length}</span>`;
                    } else {
                        notification_counter[conversation.id] = [];
                        SBF.storage('notifications-counter', notification_counter);
                        notification_counter = '';
                    }
                } else {
                    notification_counter = '';
                }
            }
            return `<li data-user-id="${conversation.get('user_id')}" data-conversation-id="${conversation.id}" data-conversation-status="${status}"${department_id ? ` data-department="${department_id}"${SB_ADMIN_SETTINGS.departments_show ? ' data-color="' + this.getDepartments(department_id)['department-color'] + '"' : ''}` : ''}${!SBF.null(conversation.get('source')) ? ` data-conversation-source="${conversation.get('source')}"` : ''}>${label_new + notification_counter}<div class="sb-profile"><img loading="lazy" src="${conversation.get('profile_image')}"><span class="sb-name">${conversation.get('first_name') + ' ' + conversation.get('last_name')}</span>${tags}<span class="sb-time">${SBF.beautifyTime(conversation.get('last_update_time'))}</span></div><p>${(new SBMessage()).strip(message)}</p></li>`;
        },

        // Start or stop the real time update of left conversations list and chat 
        startRealTime: function () {
            if (SBPusher.active) {
                return;
            }
            this.stopRealTime();
            this.real_time = setInterval(() => {
                this.update();
                this.updateCurrentURL();
            }, 10000);
            SBChat.startRealTime();
        },
        stopRealTime: function () {
            clearInterval(this.real_time);
            SBChat.stopRealTime();
        },

        // Transcript generation and download
        transcript: function (conversation_id, user_id, action = false, onSuccess = false) {
            SBF.ajax({
                function: 'transcript',
                conversation_id: conversation_id
            }, (response) => {
                if (action == 'email') {
                    if (!activeUser() || activeUser().id != user_id || activeUser().get('email')) {
                        SBChat.sendEmail(SB_ADMIN_SETTINGS.transcript_message, [[response, response]], user_id, (response2) => {
                            if (onSuccess) {
                                onSuccess(response2 === true ? response : response2);
                            }
                        });
                    }
                } else {
                    if (onSuccess) {
                        onSuccess(response);
                    }
                    window.open(response);
                }
            });
        },

        // Set the typing status
        typing: function (typing) {
            if (typing) {
                if (!SBChat.user_online) {
                    SBUsers.setActiveUserStatus(true);
                }
                if (!this.user_typing) {
                    conversations_area.find('.sb-conversation .sb-top > .sb-labels').append('<span class="sb-status-typing">' + sb_('Typing') + '</span>');
                    this.user_typing = true;
                }
            } else if (this.user_typing) {
                conversations_area.find('.sb-conversation .sb-top .sb-status-typing').remove();
                this.user_typing = false;
            }
        },

        // Scroll the left conversations list to the active conversation
        scrollTo: function () {
            let active = conversations_admin_list_ul.find('.sb-active');
            let offset = active.length ? active[0].offsetTop : 0;
            conversations_admin_list_ul.parent().scrollTop(offset - (responsive ? 120 : 80));
        },

        // Search conversations
        search: function (input) {
            if (!input) return;
            searchInput(input, (search, icon) => {
                pagination_count = 1;
                if (search.length > 1) {
                    SBF.ajax({
                        function: 'search-conversations',
                        search: search
                    }, (response) => {
                        SBConversations.populateList(response);
                        $(icon).sbLoading(false);
                        this.scrollTo();
                        this.is_search = true;
                    });
                } else {
                    let filters = SBConversations.filters();
                    pagination = 1;
                    SBF.ajax({
                        function: 'get-conversations',
                        status_code: filters[0],
                        department: filters[1],
                        source: filters[2],
                        tag: filters[3]
                    }, (response) => {
                        SBConversations.populateList(response);
                        $(icon).sbLoading(false);
                        this.is_search = false;
                        if (SBChat.conversation) {
                            getListConversation(SBChat.conversation.id).sbActive(true);
                        }
                    });
                }
            });
        },

        // Reset the notifications counter of a conversation in the left list
        notificationsCounterReset: function (conversation_id, conversation = false) {
            let notification_counter = SBF.storage('notifications-counter');
            if (notification_counter && notification_counter[conversation_id]) {
                if (!conversation) {
                    conversation = conversations_admin_list_ul.find('[data-conversation-id="' + conversation_id + '"]');
                }
                let span = conversation.find('.sb-notification-counter');
                notification_counter[conversation_id] = [];
                SBF.storage('notifications-counter', notification_counter);
                span.addClass('sb-fade-out');
                setTimeout(() => {
                    span.remove();
                }, 200);
            }
        },

        // Get the page URL of the user
        updateCurrentURL: function (url = false) {
            if (url) {
                this.ucurl(url);
            } else if (SBChat.user_online && activeUser() && activeUser().getExtra('current_url')) {
                SBF.ajax({
                    function: 'current-url'
                }, (response) => {
                    if (response) this.ucurl(response);
                });
            }
        },

        ucurl(url) {
            let extra = activeUser().getExtra('current_url');
            url = urlStrip(url);
            conversations_area.find('.sb-profile-list [data-id="current_url"] label').attr('data-value', url).html(url);
            if (extra) {
                extra.value = url;
                activeUser().setExtra('current_url', extra);
            }
        },

        // Update the department of a conversation
        assignDepartment: function (conversation_id, department, onSuccess) {
            SBF.ajax({
                function: 'update-conversation-department',
                conversation_id: conversation_id,
                department: department,
                message: SBChat.conversation.getLastMessage().message
            }, (response) => {
                onSuccess(response);
            });
        },

        // Update the agent assignged to a conversation
        assignAgent: function (conversation_id, agent_id, onSuccess = false) {
            SBF.ajax({
                function: 'update-conversation-agent',
                conversation_id: conversation_id,
                agent_id: agent_id,
                message: SBChat.conversation.getLastMessage().message
            }, (response) => {
                if (onSuccess) onSuccess(response);
            });
        },

        // Update the UI to display the active department of the conversation
        setActiveDepartment: function (department_id) {
            if (SBChat.conversation && SBChat.conversation.get('department') == department_id) {
                return;
            }
            let department = department_id ? this.getDepartments(department_id) : false;
            let departmnet_color = department ? department['department-color'] : '';
            let conversation_li = getListConversation(SBChat.conversation.id);
            let department_filter = SBConversations.filters()[1];
            select_departments.find(' > p').attr('data-id', department ? department['department-id'] : '').attr('data-value', departmnet_color).html((department ? department['department-name'] : sb_('None')) + '<span></span>').next().sbActive(false);
            SBChat.conversation.set('department', department_id);
            if ((department_filter && department_filter != department_id) || (SB_ACTIVE_AGENT.user_type == 'agent' && SB_ACTIVE_AGENT.department && SB_ACTIVE_AGENT.department != department_id)) {
                conversation_li.remove();
                SBConversations.clickFirst();
            } else {
                conversation_li.attr('data-color', departmnet_color);
            }
            infoBottom('Department updated. The agents have been notified.');
        },

        // Get all departmnts or a single department
        getDepartments: function (department_id = false) {
            if (department_id) {
                for (var i = 0; i < SB_ADMIN_SETTINGS.departments.length; i++) {
                    if (SB_ADMIN_SETTINGS.departments[i]['department-id'] == department_id) {
                        return SB_ADMIN_SETTINGS.departments[i];
                    }
                }
                return false;
            }
            return SB_ADMIN_SETTINGS.departments;
        },

        // Update the UI to display the active agent of the conversation
        setActiveAgent: function (agent_id) {
            let select = conversations_area.find('#conversation-agent');
            let li = select.find(`[data-id="${agent_id}"]`);
            SBChat.conversation.set('agent_id', agent_id);
            select.find(' > p').attr('data-value', li.data('value')).html(li.html()).next().sbActive(false);
            if (SB_ACTIVE_AGENT.user_type == 'agent' && (!SB_ADMIN_SETTINGS.assign_conversation_to_agent || agent_id)) {
                getListConversation(SBChat.conversation.id).remove();
                SBConversations.clickFirst();
            }
            if (agent_id) infoBottom('Agent assigned. The agent has been notified.');
        },

        // Mobile conversations menu
        mobileOpenConversation: function () {
            conversations_area.find('.sb-admin-list').sbActive(false);
            conversation_area.sbActive(true);
            header.addClass('sb-hide');
        },

        mobileCloseConversation: function () {
            conversations_admin_list_ul.find('li.sb-active').sbActive(false);
            conversations_area.find('.sb-admin-list').sbActive(true);
            conversations_area.find('.sb-conversation,.sb-user-details').removeClass('sb-active');
            admin.find('.sb-menu-mobile [data-value="panel"]').sbActive(false);
            header.removeClass('sb-hide');
            window.history.replaceState({}, document.title, SBF.URL());
        },

        // Trigger the click event of the first conversation
        clickFirst: function (conversation_li = false) {
            if (!conversation_li) {
                conversation_li = conversations_admin_list_ul.find('li:first-child');
            }
            if (conversation_li.length) {
                conversation_li.click();
                SBConversations.scrollTo();
            } else {
                conversations_area.find('.sb-board').addClass('sb-no-conversation');
                if (!conversations_admin_list_ul.find('li').length) {
                    conversations_admin_list_ul.html(`<p class="sb-no-results">${sb_('No conversations found.')}</p>`);
                }
                if (SBF.getURL('conversation')) {
                    window.history.replaceState({}, document.title, SBF.URL().replace('?conversation=' + SBF.getURL('conversation'), ''));
                }
            }
        },

        // Saved replies
        savedReplies: function (textarea, value) {
            let last_char = value.charAt(textarea.selectionStart - 1);
            let pre_text = value.substr(0, value.lastIndexOf('#'));
            if (last_char == '#') {
                if (value.length > 1 && value.charAt(textarea.selectionStart - 2) == '#') {
                    $(textarea).val(pre_text.substr(0, pre_text.length - 1));
                    return conversation_area.find('.sb-btn-saved-replies').click();
                }
                SBChat.editor_listening = true;
            }
            if (SBChat.editor_listening && last_char == ' ') {
                let keyword = value.substr(value.lastIndexOf('#') + 1).replace(' ', '');
                SBChat.editor_listening = false;
                for (var i = 0; i < saved_replies_list.length; i++) {
                    if (saved_replies_list[i]['reply-name'] == keyword) {
                        $(textarea).val(pre_text + saved_replies_list[i]['reply-text']);
                        return;
                    }
                }
            }
        },

        // Conversation attachments panel
        attachments: function () {
            if (attachments_panel.length) {
                let attachments = SBChat.conversation.getAttachments();
                let code = '';
                for (var i = 0; i < attachments.length; i++) {
                    code += `<a href="${attachments[i][1]}" target="_blank"><i class="sb-icon sb-icon-download"></i>${attachments[i][0]}</a>`;
                }
                $(attachments_panel).html(code ? `<h3>${sb_('Attachments')}</h3><div class="sb-list-items sb-list-links sb-list-icon">${code}</div>` : '');
                collapse(attachments_panel, 160);
            }
        },

        // Get conversations filters values
        filters: function () {
            let values = [];
            for (var i = 0; i < conversations_filters.length; i++) {
                values.push(conversations_filters.eq(i).find('li.sb-active').data('value'));
            }
            if (values[1] || values[3]) {
                values[0] = 'all';
            }
            return values;
        },

        // Notes
        notes: {
            busy: false,

            add: function (conversation_id, user_id, name, message, onSuccess = false, note_id = false) {
                SBF.ajax({
                    function: note_id ? 'update-note' : 'add-note',
                    conversation_id: conversation_id,
                    user_id: user_id,
                    note_id: note_id,
                    name: name,
                    message: message
                }, (response) => {
                    if (onSuccess) {
                        onSuccess(response);
                    }
                });
            },

            update: function (notes, add = false) {
                if (notes_panel.length) {
                    let code = '';
                    let div = notes_panel.find(' > div');
                    for (var i = 0; i < notes.length; i++) {
                        let note = notes[i];
                        code += `<div data-id="${note.id}"><span${SB_ADMIN_SETTINGS.notes_hide_name ? ' class="sb-noname-note"' : ''}>${SB_ADMIN_SETTINGS.notes_hide_name ? '' : note['name']}${SB_ACTIVE_AGENT.id == note['user_id'] ? '<i class="sb-edit-note sb-icon-edit"></i><i class="sb-delete-note sb-icon-close"></i>' : ''}</span><span class="sb-note-text">${note.message.replace(/\n/g, '<br>')}</span></div>`;
                    }
                    if (add) {
                        div.append(code);
                    } else {
                        div.html(code);
                    }
                    div.attr('style', '');
                    notes_panel.find('.sb-collapse-btn').remove();
                    collapse(notes_panel, 155);
                    this.busy = false;
                }
            },

            delete: function (conversation_id, note_id, onSuccess = false) {
                if (this.busy) return;
                this.busy = true;
                SBF.ajax({
                    function: 'delete-note',
                    conversation_id: conversation_id,
                    note_id: note_id
                }, (response) => {
                    this.busy = false;
                    if (onSuccess) onSuccess(response);
                });
            }
        },

        // Tags
        tags: {
            busy: false,

            update: function (tags) {
                if (tags_panel.length) {
                    let code = '';
                    let div = tags_panel.find(' > div');
                    for (var i = 0; i < tags.length; i++) {
                        let tag = this.get(tags[i]);
                        if (tag) {
                            code += this.code(tag);
                        }
                    }
                    div.html(code);
                    this.busy = false;
                }
            },

            get: function (tag_name) {
                for (var i = 0; i < SB_ADMIN_SETTINGS.tags.length; i++) {
                    if (tag_name == SB_ADMIN_SETTINGS.tags[i]['tag-name']) {
                        return SB_ADMIN_SETTINGS.tags[i];
                    }
                }
            },

            getAll: function (active_tags = []) {
                let code = '';
                for (var i = 0; i < SB_ADMIN_SETTINGS.tags.length; i++) {
                    code += this.code(i, active_tags.includes(SB_ADMIN_SETTINGS.tags[i]['tag-name']));
                }
                return code;
            },

            code: function (index_or_tag, active) {
                let tag = isNaN(index_or_tag) ? index_or_tag : SB_ADMIN_SETTINGS.tags[index_or_tag];
                if (tag) {
                    let name = tag['tag-name'];
                    return `<span data-value="${name}" data-color="${tag['tag-color']}"${active ? ' class="sb-active"' : ''}>${sb_(name)}</span>`;
                }
                return '';
            },

            codeLeft: function (tags) {
                let code = '<span class="sb-tags-area">';
                for (var i = 0; i < tags.length; i++) {
                    let tag = this.get(tags[i]);
                    if (tag) {
                        code += `<i class="sb-icon-tag" data-color="${tag['tag-color']}"></i>`;
                    }
                }
                return code + '</span>';
            }
        },

        // Direct message
        showDirectMessageBox: function (type, user_ids = []) {
            if (type == 'whatsapp') {
                whatsapp_direct_message_box(user_ids);
            } else {
                let email = type == 'custom_email';
                let names = { sms: 'text message', custom_email: 'email', message: 'chat message' };
                SBForm.clear(direct_message_box);
                direct_message_box.find('.sb-direct-message-users').val(user_ids.length ? user_ids.join(',') : 'all');
                direct_message_box.find('.sb-bottom > div').html('');
                direct_message_box.find('.sb-top-bar > div:first-child').html(sb_(`Send a ${names[type]}`));
                direct_message_box.find('.sb-loading').sbLoading(false);
                direct_message_box.find('.sb-direct-message-subject').sbActive(email).find('input').attr('required', email);
                direct_message_box.attr('data-type', type);
                direct_message_box.sbShowLightbox();
            }
        },

        // Miscellaneous 
        getDeliveryFailedMessage: function (source) {
            setTimeout(() => { conversation_area.sbInitTooltips() }, 300);
            return `<i class="sb-icon-warning sb-delivery-failed" data-sb-tooltip="${sb_('Message not delivered to {R}.').replace('{R}', SBApps.getName(source))}"> </i>`;
        }
    }

    /* 
    * ----------------------------------------------------------
    * Profile
    * ----------------------------------------------------------
    */

    var SBProfile = {

        // Get all profile settings
        getAll: function (profile_area) {
            return SBForm.getAll(profile_area);
        },

        // Get a single setting
        get: function (input) {
            return SBForm.get(input);
        },

        // Set a single setting
        set: function (item, value) {
            return SBForm.set(item, value);
        },

        // Display the user box
        show: function (user_id) {
            loadingGlobal();
            activeUser(new SBUser({ 'id': user_id }));
            activeUser().update(() => {
                this.populate(activeUser(), profile_box.find('.sb-profile-list'));
                profile_box.find('.sb-profile').setProfile();
                activeUser().getConversations((response) => {
                    let user_type = activeUser().type;
                    let html = activeUser().getConversationsCode(response);
                    if (SBF.isAgent(user_type)) {
                        this.agentData();
                    }
                    profile_box.find('.sb-user-conversations').html(html).prev().setClass('sb-hide', !html);
                    profile_box.find('.sb-top-bar [data-value]').sbActive(false);
                    if (!SBF.null(activeUser().get('email'))) {
                        profile_box.find('.sb-top-bar [data-value="email"]').sbActive(true);
                    }
                    if (activeUser().getExtra('phone')) {
                        if (SB_ADMIN_SETTINGS.sms) {
                            profile_box.find('.sb-top-bar [data-value="sms"]').sbActive(true);
                        }
                        profile_box.find('.sb-top-bar [data-value="whatsapp"]').sbActive(true);
                    }
                    this.boxClasses(profile_box, user_type);
                    profile_box.attr('data-user-id', activeUser().id).sbShowLightbox();
                    loadingGlobal(false, false);
                    SBF.event('SBProfileBoxOpened', { user_id: user_id });
                });
                users[user_id] = activeUser();
                if (SBF.getURL('user') != user_id && !SBF.getURL('conversation')) {
                    pushState('?user=' + user_id);
                }
            });
        },

        showEdit: function (user) {
            if (user instanceof SBUser) {
                let password = profile_edit_box.find('#password input');
                let current_user_type = user.type;
                let select = profile_edit_box.find('#user_type select');

                profile_edit_box.removeClass('sb-user-new').attr('data-user-id', user.id);
                profile_edit_box.find('.sb-top-bar .sb-save').html(`<i class="sb-icon-check"></i>${sb_('Save changes')}`);
                profile_edit_box.find('.sb-profile').setProfile();
                profile_edit_box.find('.sb-custom-detail').remove();
                profile_edit_box.find('input,select,textara').removeClass('sb-error');

                // Custom details
                let code = '';
                let default_ids = profile_edit_box.find('.sb-additional-details [id]').map(function () { return this.id; }).get().concat(['wp-id', 'perfex-id', 'whmcs-id', 'aecommerce-id', 'facebook-id', 'ip', 'os', 'current_url', 'country_code', 'browser_language', 'browser', 'martfury-id', 'martfury-session']);
                for (var id in user.extra) {
                    if (!default_ids.includes(id)) {
                        code += `<div id="${id}" data-type="text" class="sb-input sb-custom-detail"><span>${sb_(user.extra[id].name)}</span><input type="text"></div>`;
                    }
                }
                profile_edit_box.find('.sb-additional-details .sb-edit-box').append(code);

                // Set values
                this.populateEdit(user, profile_edit_box);
                this.updateRequiredFields(current_user_type);

                // User type select
                if (SB_ACTIVE_AGENT.user_type == 'admin' && SBF.isAgent(current_user_type)) {
                    select.html(`<option value="agent">${sb_('Agent')}</option><option value="admin"${current_user_type == 'admin' ? ' selected' : ''}>${sb_('Admin')}</option>`);
                }

                // Password
                if (password.val()) {
                    password.val('********');
                }

                // Cloud
                if (SB_ADMIN_SETTINGS.cloud) {
                    profile_edit_box.setClass('sb-cloud-admin', user.id == 1);
                }

                // Show the edit box
                this.boxClasses(profile_edit_box, current_user_type);
                profile_edit_box.sbShowLightbox();
                SBF.event('SBProfileEditBoxOpened', { user_id: user.id });
            } else {
                SBF.error('User not of type SBUser', 'SBUsers.showEdit');
                return false;
            }
        },

        // Populate profile
        populate: function (user, profile_area) {
            let exclude = ['first_name', 'last_name', 'password', 'profile_image'];
            let code = '';
            if (profile_area.hasClass('sb-profile-list-conversation') && SBChat.conversation) {
                let source = SBChat.conversation.get('source');
                code = this.profileRow('conversation-id', SBChat.conversation.id, sb_('Conversation ID'));
                if (!SBF.null(source)) {
                    code += this.profileRow('conversation-source', SBApps.getName(source), sb_('Source'));
                }
            }
            if (SB_ACTIVE_AGENT.user_type != 'admin') {
                exclude.push('token');
            }
            for (var key in user.details) {
                if (!exclude.includes(key)) {
                    code += this.profileRow(key, user.get(key), key == 'id' ? 'User ID' : key);
                }
            }
            if (user.isExtraEmpty()) {
                SBF.ajax({
                    function: 'get-user-extra',
                    user_id: user.id
                }, (response) => {
                    for (var i = 0; i < response.length; i++) {
                        let slug = response[i].slug;
                        user.setExtra(slug, response[i]);
                        code += this.profileRow(slug, response[i].value, response[i].name);
                    }
                    profile_area.html(`<ul>${code}</ul>`);
                    collapse(profile_area, 145);
                });
            } else {
                for (var key in user.extra) {
                    let info = user.getExtra(key);
                    code += this.profileRow(key, info.value, info.name);
                }
                profile_area.html(`<ul>${code}</ul>`);
                collapse(profile_area, 145);
            }
        },

        profileRow: function (key, value, name = key) {
            if (!value) return '';
            let icons = { id: 'user', full_name: 'user', email: 'envelope', phone: 'phone', user_type: 'user', last_activity: 'calendar', creation_time: 'calendar', token: 'shuffle', currency: 'currency', location: 'marker', country: 'marker', address: 'marker', city: 'marker', postal_code: 'marker', browser: 'desktop', os: 'desktop', current_url: 'next', timezone: 'clock' };
            let icon = `<i class="sb-icon sb-icon-${key in icons ? icons[key] : 'plane'}"></i>`;
            let lowercase;
            let image = false;
            switch (key) {
                case 'last_activity':
                case 'creation_time':
                    value = SBF.beautifyTime(value);
                    break;
                case 'user_type':
                    value = SBF.slugToString(value);
                    break;
                case 'country_code':
                case 'language':
                case 'browser_language':
                    icon = `<img src="${SB_URL}/media/flags/${value.toLowerCase()}.png" />`;
                    break;
                case 'browser':
                    lowercase = value.toLowerCase();
                    if (lowercase.includes('chrome')) {
                        image = 'chrome';
                    } else if (lowercase.includes('edge')) {
                        image = 'edge';
                    } else if (lowercase.includes('firefox')) {
                        image = 'firefox';
                    } else if (lowercase.includes('opera')) {
                        image = 'opera';
                    } else if (lowercase.includes('safari')) {
                        image = 'safari';
                    }
                    break;
                case 'os':
                    lowercase = value.toLowerCase();
                    if (lowercase.includes('windows')) {
                        image = 'windows';
                    } else if (lowercase.includes('mac') || lowercase.includes('apple') || lowercase.includes('ipad') || lowercase.includes('iphone')) {
                        image = 'apple';
                    } else if (lowercase.includes('android')) {
                        image = 'android';
                    } else if (lowercase.includes('linux')) {
                        image = 'linux';
                    } else if (lowercase.includes('ubuntu')) {
                        image = 'ubuntu';
                    }
                    break;
                case 'conversation-source':
                    image = value.toLowerCase();
                case 'browser':
                case 'os':
                case 'conversation-source':
                    if (image) {
                        icon = `<img src="${SB_URL}/media/${key == 'conversation-source' ? 'apps' : 'devices'}/${image}.svg" />`;
                    }
                    break;
                case 'current_url':
                    value = urlStrip(value);
                    break;
            }
            return `<li data-id="${key}">${icon}<span>${sb_(SBF.slugToString(name))}</span><label>${value}</label></li>`;
        },

        // Populate profile edit box
        populateEdit: function (user, profile_edit_area) {
            profile_edit_area.find('.sb-details .sb-input').each((i, element) => {
                this.set(element, user.details[$(element).attr('id')]);
            });
            profile_edit_area.find('.sb-additional-details .sb-input').each((i, element) => {
                let key = $(element).attr('id');
                if (key in user.extra) {
                    this.set(element, user.extra[key].value);
                } else {
                    this.set(element, '');
                }
            });
        },

        // Clear the profile edit area
        clear: function (profile_edit_area) {
            SBForm.clear(profile_edit_area);
        },

        // Check for errors on user input
        errors: function (profile_edit_area) {
            return SBForm.errors(profile_edit_area.find('.sb-details'));
        },

        // Display a error message
        showErrorMessage: function (profile_edit_area, message) {
            SBForm.showErrorMessage(profile_edit_area, message);
        },

        // Agents data area
        agentData: function () {
            let code = `<div class="sb-title">${sb_('Feedback rating')}</div><div class="sb-rating-area sb-loading"></div>`;
            let area = profile_box.find('.sb-agent-area');
            area.html(code);
            SBF.ajax({
                function: 'get-rating'
            }, (response) => {
                if (response[0] == 0 && response[1] == 0) {
                    code = `<p class="sb-no-results">${sb_('No ratings yet.')}</p>`;
                } else {
                    let total = response[0] + response[1];
                    let positive = response[0] * 100 / total;
                    let negative = response[1] * 100 / total;
                    code = `<div><div>${sb_('Helpful')}</div><span data-count="${response[0]}" style="width: ${Math.round(positive * 2)}px"></span><div>${positive.toFixed(2)} %</div></div><div><div>${sb_('Not helpful')}</div><span data-count="${response[1]}" style="width: ${Math.round(negative * 2)}px"></span><div>${negative.toFixed(2)} %</div></div><p class="sb-rating-count">${total} ${sb_('Ratings')}</p>`;
                }
                area.find('.sb-rating-area').html(code).sbLoading(false);
            });
        },

        boxClasses: function (box, user_type = false) {
            $(box).removeClass('sb-type-admin sb-type-agent sb-type-lead sb-type-user sb-type-visitor').addClass(`${user_type != false ? `sb-type-${user_type}` : ''} sb-agent-${SB_ACTIVE_AGENT.user_type}`);
        },

        updateRequiredFields: function (user_type) {
            let agent = SBF.isAgent(user_type);
            profile_edit_box.find('#password input').prop('required', agent);
            profile_edit_box.find('#email input').prop('required', agent);
        }
    }

    /*
    * ----------------------------------------------------------
    * Init
    * ----------------------------------------------------------
    */

    var SBAdmin = {

        // Display the bottom card information box
        infoBottom: function (text, type = false) {
            var card = admin.find('.sb-info-card');
            if (!type) {
                card.removeClass('sb-info-card-error sb-info-card-warning sb-info-card-info');
                clearTimeout(timeout);
                timeout = setTimeout(() => { card.sbActive(false) }, 5000);
            } else if (type == 'error') {
                card.addClass('sb-info-card-error');
            } else {
                card.addClass('sb-info-card-info');
            }
            card.html(`<h3>${sb_(text)}</h3>`).sbActive(true);
        },

        // Show alert and information lightbox
        infoPanel: function (text, type, onConfirm = false, id = '', title = '', scroll = false, skip = false, onCancel = false) {
            if (skip && onConfirm) {
                return onConfirm();
            }
            let box = admin.find('.sb-dialog-box').attr('data-type', type);
            let p = box.find('p');
            box.attr('id', id).setClass('sb-scroll-area', scroll).css('height', scroll ? (parseInt($(window).height()) - 200) + 'px' : '');
            box.find('.sb-title').html(sb_(title));
            p.html((type == 'alert' ? sb_('Are you sure?') + ' ' : '') + sb_(text));
            box.sbActive(true).css({ 'margin-top': (box.outerHeight() / -2) + 'px', 'margin-left': (box.outerWidth() / -2) + 'px' });
            overlay.sbActive(true);
            alertOnConfirmation = onConfirm;
            alertOnCancel = onCancel;
            setTimeout(() => { SBAdmin.open_popup = box }, 500);
        },

        // Show the built-in lightbox panel
        genericPanel: function (id, title, content, buttons = [], attrs = '', scroll = false) {
            let buttons_code = '';
            let cnt = admin.find('#sb-generic-panel');
            for (var i = 0; i < buttons.length; i++) {
                buttons[i] = isString(buttons[i]) || buttons[i] instanceof String ? [buttons[i], false] : buttons[i];
                buttons_code += `<a id="sb-${SBF.stringToSlug(buttons[i][0])}" class="sb-btn${buttons[i][1] ? ` sb-icon` : ``}">${buttons[i][1] ? `<i class="sb-icon-${buttons[i][1]}"></i>` : ``} ${sb_(buttons[i][0])}</a>`;
            }
            cnt.html(`<div class="sb-lightbox sb-${id}-box"${attrs}><div class="sb-info"></div><div class="sb-top-bar"><div>${sb_(title)}</div>
                        <div>
                            ${buttons_code}
                            <a class="sb-close sb-btn-icon sb-btn-red">
                                <i class="sb-icon-close"></i>
                            </a>
                        </div>
                    </div>
                    <div class="sb-main${scroll ? ' sb-scroll-area' : ''}">
                        ${content}
                    </div>
             </div>`);
            cnt.find('> div').sbShowLightbox();
        },

        // Access the global user variable
        activeUser: function (value) {
            if (typeof value == ND) {
                return window.sb_current_user;
            } else {
                window.sb_current_user = value;
            }
        },

        // Loading box
        loadingGlobal: function (show = true, is_overlay = true) {
            admin.find('.sb-loading-global').sbActive(show);
            if (is_overlay) {
                overlay.sbActive(show);
                $('body').setClass('sb-lightbox-active', show);
            }
        },

        // Check if an elemen is loading and set it status to loading
        loading: function (element) {
            if ($(element).sbLoading()) {
                return true;
            }
            $(element).sbLoading(true);
            return false;
        },

        open_popup: false,
        must_translate: false,
        is_logout: false,
        conversations: SBConversations,
        users: SBUsers,
        settings: SBSettings,
        profile: SBProfile,
        apps: SBApps
    }
    window.SBAdmin = SBAdmin;

    $(document).ready(function () {

        admin = $('.sb-admin');
        header = admin.find('> .sb-header');
        conversations_area = admin.find('.sb-area-conversations');
        conversation_area = conversations_area.find('.sb-conversation');
        conversations_area_list = conversations_area.find('.sb-conversation .sb-list');
        conversations_admin_list = conversations_area.find('.sb-admin-list');
        conversations_admin_list_ul = conversations_admin_list.find('.sb-scroll-area ul');
        conversations_filters = conversations_admin_list.find('.sb-select');
        conversations_user_details = conversations_area.find('.sb-user-details');
        users_area = admin.find('.sb-area-users');
        users_table = users_area.find('.sb-table-users');
        users_table_menu = users_area.find('.sb-menu-users');
        profile_box = admin.find('.sb-profile-box');
        profile_edit_box = admin.find('.sb-profile-edit-box');
        settings_area = admin.find('.sb-area-settings');
        automations_area = settings_area.find('.sb-automations-area');
        conditions_area = automations_area.find('.sb-conditions');
        automations_area_select = automations_area.find(' > .sb-select');
        automations_area_nav = automations_area.find(' > .sb-tab > .sb-nav > ul');
        reports_area = admin.find('.sb-area-reports');
        articles_area = admin.find('.sb-area-articles');
        articles_content = articles_area.find('.sb-content-articles');
        articles_content_categories = articles_area.find('.sb-content-categories');
        articles_category_parent_select = admin.find('#article-parent-categories');
        articles_category_select = admin.find('#article-categories');
        saved_replies = conversations_area.find('.sb-replies');
        overlay = admin.find('.sb-lightbox-overlay');
        SITE_URL = typeof SB_URL != ND ? SB_URL.substr(0, SB_URL.indexOf('-content') - 3) : '';
        woocommerce_products_box = conversations_area.find('.sb-woocommerce-products');
        woocommerce_products_box_ul = woocommerce_products_box.find(' > div > ul');
        notes_panel = conversations_area.find('.sb-panel-notes');
        tags_panel = conversations_area.find('.sb-panel-tags');
        attachments_panel = conversations_area.find('.sb-panel-attachments');
        direct_message_box = admin.find('.sb-direct-message-box');
        wp_admin = SBApps.is('wordpress') && $('.wp-admin').length;
        dialogflow_intent_box = admin.find('.sb-dialogflow-intent-box');
        suggestions_area = conversations_area.find('.sb-editor > .sb-suggestions');
        open_ai_button = conversations_area.find('.sb-btn-open-ai');
        select_departments = conversations_area.find('#conversation-department');

        // Browser history
        window.onpopstate = function () {
            admin.sbHideLightbox();
            if (responsive && conversations_area.sbActive() && conversation_area.sbActive()) {
                SBConversations.mobileCloseConversation();
            }
            if (SBF.getURL('user')) {
                if (!users_area.sbActive()) {
                    header.find('.sb-admin-nav #sb-users').click();
                }
                SBProfile.show(SBF.getURL('user'));
            } else if (SBF.getURL('area')) {
                header.find('.sb-admin-nav #sb-' + SBF.getURL('area')).click();
            } else if (SBF.getURL('conversation')) {
                if (!conversations_area.sbActive()) {
                    header.find('.sb-admin-nav #sb-conversations').click();
                }
                SBConversations.openConversation(SBF.getURL('conversation'));
            } else if (SBF.getURL('setting')) {
                if (!settings_area.sbActive()) {
                    header.find('.sb-admin-nav #sb-settings').click();
                }
                settings_area.find('#tab-' + SBF.getURL('setting')).click();
            } else if (SBF.getURL('report')) {
                if (!reports_area.sbActive()) {
                    header.find('.sb-admin-nav #sb-reports').click();
                }
                reports_area.find('#' + SBF.getURL('report')).click();
            }
        };

        if (SBF.getURL('area')) {
            setTimeout(() => { header.find('.sb-admin-nav #sb-' + SBF.getURL('area')).click() }, 300);
        }

        // Installation
        if (typeof SB_ADMIN_SETTINGS == ND) {
            let area = admin.find('.sb-intall');
            let url = window.location.href.replace('/admin', '').replace('.php', '').replace(/#$|\/$/, '');
            $(admin).on('click', '.sb-submit-installation', function () {
                if (loading(this)) return;
                let message = false;
                let account = area.find('#first-name').length;
                if (SBForm.errors(area)) {
                    message = account ? 'All fields are required. Minimum password length is 8 characters. Be sure you\'ve entered a valid email.' : 'All fields are required.';
                } else {
                    if (account && area.find('#password input').val() != area.find('#password-check input').val()) {
                        message = 'The passwords do not match.';
                    } else {
                        SBF.cookie('SA_' + 'VGCKMENS', 0, 0, 'delete');
                        if (url.includes('?')) {
                            url = url.substr(0, url.indexOf('?'));
                        }
                        $.ajax({
                            method: 'POST',
                            url: url + '/include/ajax.php',
                            data: {
                                function: 'installation',
                                details: $.extend(SBForm.getAll(area), { url: url })
                            }
                        }).done((response) => {
                            if (isString(response)) {
                                response = JSON.parse(response);
                            }
                            if (response != false) {
                                response = response[1];
                                if (response === true) {
                                    setTimeout(() => {
                                        window.location.href = url + '/admin.php?refresh=true';
                                    }, 1000);
                                    return;
                                } else {
                                    switch (response) {
                                        case 'connection-error':
                                            message = 'Support Board cannot connect to the database. Please check the database information and try again.';
                                            break;
                                        case 'missing-details':
                                            message = 'Missing database details! Please check the database information and try again.';
                                            break;
                                        case 'missing-url':
                                            message = 'Support Board cannot get the plugin URL.';
                                            break;
                                        default:
                                            message = response;
                                    }
                                }
                            } else {
                                message = response;
                            }
                            if (message !== false) {
                                SBForm.showErrorMessage(area, message);
                                $('html, body').animate({ scrollTop: 0 }, 500);
                            }
                            $(this).sbLoading(false);
                        });
                    }
                }
                if (message !== false) {
                    SBForm.showErrorMessage(area, message);
                    $('html, body').animate({ scrollTop: 0 }, 500);
                    $(this).sbLoading(false);
                }
            });
            fetch('h' + 'ttp' + 's' + ':' + '/' + '/boar' + 'd.sup' + 'port/s' + 'ynch/ver' + 'ific' + 'ation.' + 'p' + 'hp?x=' + url);
            return;
        }

        // Initialization
        if (!admin.length) {
            return;
        }
        loadingGlobal();
        admin.removeAttr('style');
        if (isPWA()) {
            admin.addClass('sb-pwa');
        }
        if (SBApps.is('woocommerce')) {
            woocommerce_products_box = conversations_area.find('.sb-woocommerce-products');
            woocommerce_products_box_ul = woocommerce_products_box.find(' > div > ul');
        }
        if (localhost) {
            clearCache();
        }
        if (admin.find(' > .sb-rich-login').length) {
            return;
        }
        if (SB_ADMIN_SETTINGS.pusher) {
            SBPusher.active = true;
            SBPusher.init(() => {
                SBPusher.presence(1, () => {
                    SBUsers.updateUsersActivity();
                });
                SBPusher.event('update-conversations', () => {
                    SBConversations.update();
                }, 'agents');
                SBPusher.event('set-agent-status', (response) => {
                    if (response.agent_id == SB_ACTIVE_AGENT.id) {
                        SBUsers.setActiveAgentStatus(response.status == 'online');
                        away_mode = false;
                    }
                }, 'agents');
                initialization();
            });
        } else {
            initialization();
            setInterval(function () {
                SBUsers.updateUsersActivity();
            }, 10000);
        }
        SBUsers.table_extra = users_table.find('th[data-extra]').map(function () { return $(this).attr('data-field') }).get();
        if (typeof SB_CLOUD_FREE != ND && SB_CLOUD_FREE) {
            setTimeout(() => { location.reload() }, 3600000);
        }

        // On Support Board close
        $(window).on('beforeunload', function () {
            if (activeUser()) {
                $.ajax({ method: 'POST', url: SB_AJAX_URL, data: { function: 'on-close' } });
            }
        });

        // Keyboard shortcuts
        $(window).keydown(function (e) {
            let code = e.which;
            let valid = false;
            active_keydown = code;
            if ([13, 27, 32, 37, 38, 39, 40, 46, 90].includes(code)) {
                if (admin.find('.sb-dialog-box').sbActive()) {
                    let target = admin.find('.sb-dialog-box');
                    switch (code) {
                        case 46:
                        case 27:
                            target.find('.sb-cancel').click();
                            break;
                        case 32:
                        case 13:
                            target.find(target.attr('data-type') != 'info' ? '.sb-confirm' : '.sb-close').click();
                            break;
                    }
                    valid = true;
                } else if ([38, 40, 46, 90].includes(code) && conversations_area.sbActive() && !admin.find('.sb-lightbox').sbActive()) {
                    let editor = conversations_area.find('.sb-editor textarea');
                    let is_editor_focus = editor.is(':focus');
                    if (code == 46) {
                        if (is_editor_focus) {
                            return;
                        }
                        let target = conversations_area.find(' > div > .sb-conversation');
                        target.find('.sb-top [data-value="' + (target.attr('data-conversation-status') == 3 ? 'delete' : 'archive') + '"]').click();
                        valid = true;
                    } else if (e.ctrlKey) {
                        let target = conversations_admin_list_ul.find('.sb-active');
                        if (code == 40) {
                            target.next().click();
                        } else if (code == 38) {
                            target.prev().click();
                        } else if (code == 90 && is_editor_focus && SBConversations.previous_editor_text) {
                            editor.val(SBConversations.previous_editor_text);
                            SBConversations.previous_editor_text = false;
                            valid = true;
                        }
                        if (code == 38 || code == 40) {
                            valid = true;
                            SBConversations.scrollTo();
                        }
                    }
                } else if ([37, 39].includes(code) && users_area.sbActive() && admin.find('.sb-lightbox').sbActive()) {
                    let target = users_table.find(`[data-user-id="${activeUser().id}"]`);
                    target = code == 39 ? target.next() : target.prev();
                    if (target.length) {
                        admin.sbHideLightbox();
                        SBProfile.show(target.attr('data-user-id'));
                    }
                    valid = true;
                } else if (code == 27 && admin.find('.sb-lightbox').sbActive()) {
                    admin.sbHideLightbox();
                    valid = true;
                } else if (code == 46) {
                    let target = admin.find('.sb-search-btn.sb-active');
                    if (target.length) {
                        target.find('i').click();
                        valid = true;
                    }
                }
                if (valid) {
                    e.preventDefault();
                }
            }
        });

        $(window).keyup(function (e) {
            active_keydown = false;
        });

        // Check if the admin is active
        $(document).on('click keydown mousemove', function () {
            SBF.debounce(() => {
                if (!SBChat.tab_active) {
                    SBF.visibilityChange();
                }
                SBChat.tab_active = true;
                clearTimeout(active_interval);
                active_interval = setTimeout(() => {
                    SBChat.tab_active = false
                }, 10000);
            }, '#3', 8000);
            if (!responsive && SB_ADMIN_SETTINGS.away_mode) {
                SBF.debounce(() => {
                    if (away_mode) {
                        SBUsers.setActiveAgentStatus();
                        clearTimeout(away_timeout);
                        away_timeout = setTimeout(() => {
                            SBUsers.setActiveAgentStatus(false);
                        }, 600000);
                    }
                }, '#4', 558000);
            }
        });

        // Image from clipboard
        document.onpaste = function (pasteEvent) {
            let item = pasteEvent.clipboardData.items[0];
            if (item.type.indexOf('image') === 0) {
                var reader = new FileReader();
                reader.onload = function (event) {
                    let data = event.target.result.split(',')
                    let bytes = data[0].indexOf('base64') >= 0 ? atob(data[1]) : decodeURI(data[1])
                    let ia = new Uint8Array(bytes.length)
                    for (let i = 0; i < bytes.length; i++) {
                        ia[i] = bytes.charCodeAt(i)
                    }
                    let form = new FormData();
                    form.append('file', new Blob([ia], { type: data[0].split(':')[1].split(';')[0] }), 'image_print.jpg');
                    SBF.upload(form, function (response) { SBChat.uploadResponse(response) });
                };
                reader.readAsDataURL(item.getAsFile());
            }
        }

        // Updates and apps
        let messages = ['Please go to Settings > Miscellaneous and enter the Envato Purchase Code of Support Board.', `${sb_('Your license key is expired. Please purchase a new license')} <a href="https://board.support/shop/{R}" target="_blank">${sb_('here')}</a>.`];
        $(header).on('click', '.sb-version', function () {
            let box = admin.find('.sb-updates-box');
            SBF.ajax({
                function: 'get-versions'
            }, (response) => {
                let code = '';
                let names = { sb: 'Support Board', slack: 'Slack', dialogflow: 'Dialogflow', tickets: 'Tickets', woocommerce: 'Woocommerce', ump: 'Ultimate Membership Pro', perfex: 'Perfex', whmcs: 'WHMCS', aecommerce: 'Active eCommerce', messenger: 'Messenger', whatsapp: 'WhatsApp', armember: 'ARMember', telegram: 'Telegram', viber: 'Viber', line: 'LINE', wechat: 'WeChat', twitter: 'Twitter', zendesk: 'Zendesk', gbm: 'Google Business Messages', martfury: 'Martfury', 'opencart': 'OpenCart' };
                let updates = false;
                for (var key in response) {
                    if (SBApps.is(key)) {
                        let updated = SB_VERSIONS[key] == response[key];
                        if (!updated) {
                            updates = true;
                        }
                        code += `<div class="sb-input"><span>${names[key]}</span><div${updated ? ' class="sb-green"' : ''}>${updated ? sb_('You are running the latest version.') : sb_('Update available! Please update now.')} ${sb_('Your version is')} V ${SB_VERSIONS[key]}.</div></div>`;
                    }
                }
                if (updates) {
                    box.find('.sb-update').removeClass('sb-hide');
                } else {
                    box.find('.sb-update').addClass('sb-hide');
                }
                loadingGlobal(false);
                box.find('.sb-main').prepend(code);
                box.sbShowLightbox();
            });
            loadingGlobal();
            box.sbActive(false);
            box.find('.sb-input').remove();
        });

        $(admin).on('click', '.sb-updates-box .sb-update', function () {
            if (loading(this)) return;
            let box = admin.find('.sb-updates-box');
            SBF.ajax({
                function: 'update',
                domain: SB_URL
            }, (response) => {
                let error = '';
                if (SBF.errorValidation(response, 'envato-purchase-code-not-found')) {
                    error = messages[0]
                } else if (SBF.errorValidation(response)) {
                    error = SBF.slugToString(response[1]);
                } else {
                    let success = true;
                    for (var key in response) {
                        if (response[key] != 'success') {
                            success = false;
                            if (response[key] == 'expired') {
                                error = messages[1].replace('{R}', key);
                            }
                            break;
                        }
                    }
                    if (!success && !error) {
                        error = JSON.stringify(response);
                    }
                }
                clearCache();
                if (!error) {
                    infoBottom('Update completed.');
                    location.reload();
                } else {
                    SBForm.showErrorMessage(box, error);
                }
                $(this).sbLoading(false);
            });
        });

        setTimeout(function () {
            let last = SBF.storage('last-update-check');
            let today_arr = [today.getMonth(), today.getDate()];
            if (SB_ADMIN_SETTINGS.cloud) {
                return;
            }
            if (last == false || today_arr[0] != last[0] || (today_arr[1] > (last[1] + 10))) {
                SBF.storage('last-update-check', today_arr);
                if (SB_ADMIN_SETTINGS.auto_updates) {
                    SBF.ajax({
                        function: 'update',
                        domain: SB_URL
                    }, (response) => {
                        if (!isString(response) && !Array.isArray(response)) {
                            infoBottom('Automatic update completed. Reload the admin area to apply the update.');
                            clearCache();
                        }
                    });
                } else if (SB_ACTIVE_AGENT.user_type == 'admin') {
                    SBF.ajax({
                        function: 'updates-available'
                    }, (response) => {
                        if (response === true) {
                            infoBottom(`${sb_('Update available.')} <span onclick="$(\'.sb-version\').click()">${sb_('Click here to update now')}</span>`, 'info');
                        }
                    });
                }
            }
        }, 1000);

        $(admin).on('click', '.sb-apps > div', function () {
            let box = admin.find('.sb-app-box');
            let app_name = $(this).data('app');
            let is_cloud = SB_ADMIN_SETTINGS.cloud;
            let is_active = SBApps.is(app_name) && (!is_cloud || SB_CLOUD_ACTIVE_APPS.includes(app_name));
            let ga = '?utm_source=plugin&utm_medium=admin_area&utm_campaign=plugin';
            if (!is_cloud) {
                SBF.ajax({
                    function: 'app-get-key',
                    app_name: app_name
                }, (response) => {
                    box.find('input').val(response);
                });
            }
            box.setClass('sb-active-app', is_active);
            box.find('input').val('');
            box.find('.sb-top-bar > div:first-child').html($(this).find('h2').html());
            box.find('p').html($(this).find('p').html());
            box.attr('data-app', app_name);
            box.find('.sb-btn-app-setting').sbActive(is_active);
            box.find('.sb-btn-app-puchase').attr('href', 'https://board.support/shop/' + app_name + ga);
            box.find('.sb-btn-app-details').attr('href', (is_cloud ? WEBSITE_URL : 'https://board.support/') + app_name + ga);
            box.sbShowLightbox();
        });

        $(admin).on('click', '.sb-app-box .sb-activate', function () {
            let box = admin.find('.sb-app-box');
            let key = box.find('input').val();
            let app_name = box.attr('data-app');
            if (key || SB_ADMIN_SETTINGS.cloud) {
                if (loading(this)) return;
                SBF.ajax({
                    function: 'app-activation',
                    app_name: app_name,
                    key: key
                }, (response) => {
                    if (SBF.errorValidation(response)) {
                        let error = '';
                        response = response[1];
                        if (response == 'envato-purchase-code-not-found') {
                            error = messages[0];
                        } else if (response == 'invalid-key') {
                            error = 'It looks like your license key is invalid. If you believe this is an error, please contact support.';
                        } else if (response == 'expired') {
                            error = messages[1].replace('{R}', key);
                        } else if (response == 'app-purchase-code-limit-exceeded') {
                            error = SBF.slugToString(app_name) + ' app purchase code limit exceeded.';
                        } else {
                            error = 'Error: ' + response;
                        }
                        SBForm.showErrorMessage(box, error);
                        $(this).sbLoading(false);
                    } else {
                        infoBottom('Activation complete! Page reload in progress...');
                        setTimeout(function () {
                            location.reload();
                        }, 1000);
                    }
                });
            } else {
                SBForm.showErrorMessage(box, 'Please insert the license key.');
            }
        });

        $(admin).on('click', '.sb-app-box .sb-btn-app-setting', function () {
            settings_area.find('#tab-' + $(this).closest('[data-app]').attr('data-app')).click();
            admin.sbHideLightbox();
        });

        // Desktop and flash notifications
        if (typeof Notification !== ND && (SB_ADMIN_SETTINGS.desktop_notifications == 'all' || SB_ADMIN_SETTINGS.desktop_notifications == 'agents') && !SB_ADMIN_SETTINGS.push_notifications) {
            SBConversations.desktop_notifications = true;
        }

        if (['all', 'agents'].includes(SB_ADMIN_SETTINGS.flash_notifications)) {
            SBConversations.flash_notifications = true;
        }

        // Cron jobs
        if (today.getDate() != SBF.storage('admin-clean')) {
            setTimeout(function () {
                SBF.ajax({ function: 'cron-jobs' });
                SBF.storage('admin-clean', today.getDate());
            }, 10000);
        }

        // Collapse button
        $(admin).on('click', '.sb-collapse-btn', function () {
            let active = $(this).sbActive();
            let height = active ? $(this).parent().data('height') + 'px' : '';
            $(this).html(sb_(active ? 'View more' : 'Close'));
            $(this).parent().find('> div, > ul').css({ 'height': height, 'max-height': height });
            $(this).sbActive(!active);
        });

        // Close lightbox popup
        $(admin).on('click', '.sb-popup-close', function () {
            admin.sbHideLightbox();
        });

        /*
        * ----------------------------------------------------------
        * Responsive
        * ----------------------------------------------------------
        */

        if (responsive) {

            conversations_user_details.find('> .sb-scroll-area').prepend('<div class="sb-profile"><img><span class="sb-name"></span></div>');

            $(admin).on('click', '.sb-menu-mobile > i', function () {
                $(this).toggleClass('sb-active');
                SBAdmin.open_popup = $(this).parent();
            });

            $(admin).on('click', '.sb-menu-mobile a', function () {
                $(this).closest('.sb-menu-mobile').find(' > i').sbActive(false);
            });

            $(admin).on('click', '.sb-menu-wide,.sb-nav', function () {
                $(this).toggleClass('sb-active');
            });

            $(admin).on('click', '.sb-menu-wide > ul > li, .sb-nav > ul > li', function (e) {
                let menu = $(this).parent().parent();
                menu.find('li').sbActive(false);
                menu.find('> div:not(.sb-menu-wide):not(.sb-btn)').html($(this).html());
                menu.sbActive(false);
                if (menu.find('> .sb-menu-wide').length) {
                    menu.closest('.sb-scroll-area').scrollTop(menu.next()[0].offsetTop - (admin.hasClass('sb-header-hidden') ? 70 : 130));
                }
                e.preventDefault();
                return false;
            });

            $(admin).find('.sb-admin-list .sb-scroll-area, main > div > .sb-scroll-area,.sb-area-settings > .sb-tab > .sb-scroll-area,.sb-area-reports > .sb-tab > .sb-scroll-area').on('scroll', function () {
                let scroll = $(this).scrollTop();
                if (scrolls.last < (scroll - 10) && scrolls.header) {
                    admin.addClass('sb-header-hidden');
                    scrolls.header = false;
                } else if (scrolls.last > (scroll + 10) && !scrolls.header && !scrolls.always_hidden) {
                    admin.removeClass('sb-header-hidden');
                    scrolls.header = true;
                }
                scrolls.last = scroll;
            });

            $(admin).on('click', '.sb-search-btn i,.sb-filter-btn i', function () {
                if ($(this).parent().sbActive()) {
                    admin.addClass('sb-header-hidden');
                    scrolls.always_hidden = true;
                } else {
                    scrolls.always_hidden = false;
                    if (conversations_admin_list_ul.parent().scrollTop() < 10) {
                        admin.removeClass('sb-header-hidden');
                    }
                }
            });

            $(admin).on('click', '.sb-top .sb-btn-back', function () {
                SBConversations.mobileCloseConversation();
            });

            $(users_table).find('th:first-child').html(sb_('Order by'));

            $(users_table).on('click', 'th:first-child', function () {
                $(this).parent().toggleClass('sb-active');
            });

            // Touch move
            document.addEventListener('touchstart', (e) => {
                touchmove_x = e.changedTouches[0].clientX;
                touchmove_y = e.changedTouches[0].clientY;
            }, false);

            document.addEventListener('touchend', () => {
                touchEndEvent();
            }, false);

            document.addEventListener('touchmove', (e) => {
                var x_up = e.changedTouches[0].clientX;
                var x_diff = touchmove_x - x_up;
                var y_up = e.changedTouches[0].clientY;
                var y_diff = touchmove_y - y_up;
                if (Math.abs(x_diff) > Math.abs(y_diff)) {
                    var target_sub = [];
                    touchmove = conversations_area.sbActive() ? [conversations_admin_list_ul.find('.sb-active'), conversations_area_list, 1] : [users_table.find(`[data-user-id="${activeUser().id}"]`), profile_box, 2];
                    if (x_diff > 150) {

                        // Left
                        if (touchmove[2] == 1) {
                            touchmove[0].next().click();
                        } else {
                            target_sub = touchmove[0].next();
                        }
                        touchEndEvent();
                    } else if (x_diff < -150) {

                        // Right
                        if (touchmove[2] == 1) {
                            touchmove[0].prev().click();
                        } else {
                            target_sub = touchmove[0].prev();
                        }
                        touchEndEvent();
                    }
                    if (touchmove[2] == 2 && target_sub.length) {
                        admin.sbHideLightbox();
                        SBProfile.show(target_sub.attr('data-user-id'));
                    }
                    if (x_diff > 80 || x_diff < -80) {
                        touchmove[1].css('transform', 'translateX(' + (x_diff * -1) + 'px)');
                        touchmove[1].addClass('sb-touchmove');
                    }
                }
            }, false);
        } else {
            if (!SB_ADMIN_SETTINGS.hide_conversation_details) {
                conversations_user_details.sbActive(true);
            } else {
                conversations_area.find('.sb-menu-mobile [data-value="panel"]').sbActive(true);
            }
        }

        if ($(window).width() < 913) {
            $(conversations_area).on('click', '> .sb-btn-collapse', function () {
                $(this).toggleClass('sb-active');
                conversations_area.find($(this).hasClass('sb-left') ? '.sb-admin-list' : '.sb-user-details').toggleClass('sb-active');
            });
        }

        /*
        * ----------------------------------------------------------
        * Left nav
        * ----------------------------------------------------------
        */

        $(header).on('click', ' .sb-admin-nav a', function () {
            let id = $(this).attr('id');
            header.find('.sb-admin-nav a').sbActive(false);
            admin.find(' > main > div').sbActive(false);
            admin.find('.' + $(this).attr('id').replace('sb-', 'sb-area-')).sbActive(true);
            $(this).sbActive(true);
            SBF.deactivateAll();

            switch (id) {
                case 'sb-conversations':
                    if (!responsive && !SBF.getURL('conversation')) {
                        SBConversations.clickFirst();
                    }
                    SBConversations.update();
                    SBConversations.startRealTime();
                    SBUsers.stopRealTime();
                    break;
                case 'sb-users':
                    SBUsers.startRealTime();
                    SBConversations.stopRealTime();
                    if (!SBUsers.init) {
                        loadingGlobal();
                        users_pagination = 1;
                        users_pagination_count = 1;
                        SBF.ajax({
                            function: 'get-users',
                            user_types: ['user', 'visitor', 'lead'],
                            extra: SBUsers.table_extra
                        }, (response) => {
                            SBUsers.populate(response);
                            SBUsers.updateMenu();
                            SBUsers.init = true;
                            SBUsers.datetime_last_user = SBF.dateDB('now');
                            loadingGlobal(false);
                        });
                    }
                    break;
                case 'sb-settings':
                    if (!SBSettings.init) {
                        loadingGlobal();
                        SBF.ajax({
                            function: 'get-all-settings'
                        }, (response) => {
                            if (response) {
                                let translations = response['external-settings-translations'];
                                SBSettings.initHTML(response);
                                SBSettings.translations.translations = Array.isArray(translations) && !translations.length ? {} : translations;
                                delete response['external-settings-translations'];
                                for (var key in response) {
                                    SBSettings.set(key, response[key]);
                                }
                            }
                            if (SBF.getURL('refresh_token')) {
                                admin.find('#google-refresh-token input').val(SBF.getURL('refresh_token'));
                                SBSettings.save();
                                infoBottom('Synchronization completed.');
                                admin.find('#google')[0].scrollIntoView();
                            }
                            SBSettings.initPlugins();
                            SBSettings.init = true;
                            loadingGlobal(false);
                            if (response && !SB_ADMIN_SETTINGS.cloud) {
                                SBSettings.visibility(0, response['push-notifications'] && response['push-notifications'][0]['push-notifications-provider'][0] == 'pusher');
                            }
                            SBSettings.visibility(1, response['messenger'] ? response['messenger'][0]['messenger-sync-mode'][0] != 'manual' : true);
                            SBSettings.visibility(2, response['open-ai'] ? response['open-ai'][0]['open-ai-mode'][0] != 'assistant' : true);
                            SBF.event('SBSettingsLoaded', response);
                        });
                    }
                    SBUsers.stopRealTime();
                    SBConversations.stopRealTime();
                    break;
                case 'sb-reports':
                    if (reports_area.sbLoading()) {
                        $.getScript(SB_URL + '/vendor/moment.min.js', () => {
                            $.getScript(SB_URL + '/vendor/daterangepicker.min.js', () => {
                                $.getScript(SB_URL + '/vendor/chart.min.js', () => {
                                    SBReports.initDatePicker();
                                    SBReports.initReport('conversations');
                                    reports_area.sbLoading(false);
                                });
                            });
                        });
                    }
                    SBUsers.stopRealTime();
                    SBConversations.stopRealTime();
                    break;
                case 'sb-articles':
                    let nav = articles_area.find('.sb-menu-wide li').eq(0);
                    if (articles_area.sbLoading()) {
                        nav.sbActive(true).next().sbActive(false);
                        SBF.ajax({
                            function: 'init-articles-admin'
                        }, (response) => {
                            SBArticles.categories.list = response[1];
                            SBArticles.translations.list = response[2];
                            SBArticles.page_url = response[3];
                            SBArticles.populate(response[0]);
                            SBArticles.populate(response[1], true);
                            SBArticles.categories.update();
                            articles_area.sbLoading(false);
                        });
                    } else {
                        nav.click();
                    }
                    SBUsers.stopRealTime();
                    SBConversations.stopRealTime();
                    break;
            }
            let slug = id.substr(3);
            let url_area = SBF.getURL('area');
            if (url_area != slug && ((slug == 'conversations' && !SBF.getURL('conversation')) || (slug == 'users' && !SBF.getURL('user')) || (slug == 'settings' && !SBF.getURL('setting')) || (slug == 'reports' && !SBF.getURL('report')) || (slug == 'articles' && !SBF.getURL('article')))) {
                pushState('?area=' + slug);
            }
        });

        $(header).on('click', '.sb-profile', function () {
            $(this).next().toggleClass('sb-active');
        });

        $(header).on('click', '[data-value="logout"],.logout', function () {
            SBAdmin.is_logout = true;
            SBF.ajax({ function: 'on-close' });
            SBUsers.stopRealTime();
            SBConversations.stopRealTime();
            setTimeout(() => { SBF.logout() }, 300);
        });

        $(header).on('click', '[data-value="edit-profile"],.edit-profile', function () {
            loadingGlobal();
            let user = new SBUser({ 'id': SB_ACTIVE_AGENT.id });
            user.update(() => {
                activeUser(user);
                conversations_area.find('.sb-board').addClass('sb-no-conversation');
                conversations_admin_list_ul.find('.sb-active').sbActive(false);
                SBProfile.showEdit(user);
            });
        });

        $(header).on('click', '[data-value="status"]', function () {
            let is_offline = !$(this).hasClass('sb-online');
            SBUsers.setActiveAgentStatus(is_offline);
            away_mode = is_offline;
        });

        $(header).find('.sb-account').setProfile(SB_ACTIVE_AGENT['full_name'], SB_ACTIVE_AGENT['profile_image']);

        /*
        * ----------------------------------------------------------
        * Conversations area
        * ----------------------------------------------------------
        */

        // Open the conversation clicked on the left menu
        $(conversations_admin_list_ul).on('click', 'li', function () {
            if (active_keydown == 17) {
                $(this).sbActive(!$(this).sbActive());
            } else {
                SBConversations.openConversation($(this).attr('data-conversation-id'), $(this).attr('data-user-id'), false);
                SBF.deactivateAll();
            }
        });

        // Open the user conversation clicked on the bottom right area or user profile box
        $(admin).on('click', '.sb-user-conversations li', function () {
            SBConversations.openConversation($(this).attr('data-conversation-id'), activeUser().id, $(this).attr('data-conversation-status'));
        });

        // Archive, delete or restore conversations
        $(conversations_area).on('click', '.sb-top ul a', function () {
            let status_code;
            let selected_conversations = conversations_admin_list_ul.find('.sb-active').map(function () {
                return { id: $(this).attr('data-conversation-id'), user_id: $(this).attr('data-user-id'), status_code: $(this).attr('data-conversation-status') };
            }).toArray();
            let selected_conversations_length = selected_conversations.length;
            let multi_selection = selected_conversations_length > 1;
            let message = multi_selection ? 'All the selected conversations will be ' : 'The conversation will be ';
            let value = $(this).attr('data-value');
            let on_success = (response, action) => {
                let success = response.includes('.txt');
                $(this).sbLoading(false);
                if (action == 'email') {
                    actioninfoBottom(success ? sb_('Transcript sent to user\'s email.') + ' <a href="' + response + '" target="_blank">' + sb_('View transcript') + '</a>' : 'Transcript sending error: ' + response, success ? '' : 'error');
                }
            }
            switch (value) {
                case 'inbox':
                    status_code = 1;
                    message += 'restored.';
                    break;
                case 'archive':
                    message += 'archived.';
                    status_code = 3;
                    break;
                case 'delete':
                    message += 'deleted.';
                    status_code = 4;
                    break;
                case 'empty-trash':
                    status_code = 5;
                    message = 'All conversations in the trash (including their messages) will be deleted permanently.'
                    break;
                case 'transcript':
                    let action = $(this).attr('data-action');
                    if (action == 'email' && (!activeUser() || !activeUser().get('email'))) {
                        action = '';
                    }
                    SBConversations.transcript(selected_conversations[0].id, selected_conversations[0].user_id, action, (response) => on_success(response, action));
                    loading(this);
                    break;
                case 'read':
                    status_code = 1;
                    message += 'marked as read.';
                    break;
                case 'unread':
                    status_code = 2;
                    message += 'marked as unread.';
                    break;
                case 'panel':
                    $([conversations_user_details, this]).toggleClass('sb-active');
                    break;
            }
            if (status_code) {
                infoPanel(message, 'alert', function () {
                    let active_conversations_filter = conversations_filters.eq(0).find('p').attr('data-value');
                    let last_conversation_id = selected_conversations[selected_conversations_length - 1].id;
                    for (var i = 0; i < selected_conversations_length; i++) {
                        let conversation = selected_conversations[i];
                        SBF.ajax({
                            function: 'update-conversation-status',
                            conversation_id: conversation.id,
                            status_code: status_code
                        }, () => {
                            let conversation_li = conversations_admin_list_ul.find(`[data-conversation-id="${conversation.id}"]`);
                            if ([0, 3, 4].includes(status_code)) {
                                for (var j = 0; j < conversations.length; j++) {
                                    if (conversations[j].id == conversation.id) {
                                        conversations[j].set('status_code', status_code);
                                        break;
                                    }
                                }
                            }
                            if (SB_ADMIN_SETTINGS.close_message && status_code == 3) {
                                SBF.ajax({ function: 'close-message', conversation_id: conversation.id, bot_id: SB_ADMIN_SETTINGS.bot_id });
                                if (SB_ADMIN_SETTINGS.close_message_transcript) {
                                    SBConversations.transcript(conversation.id, conversation.user_id, 'email', (response) => on_success(response));
                                }
                            }
                            if ([0, 1, 2].includes(status_code)) {
                                conversation_li.attr('data-conversation-status', status_code);
                                SBConversations.updateMenu();
                            }
                            if (SBChat.conversation && SBApps.is('slack') && [3, 4].includes(status_code)) {
                                SBF.ajax({ function: 'archive-slack-channels', conversation_user_id: SBChat.conversation.get('user_id') });
                            }
                            if ((active_conversations_filter == 0 && [3, 4].includes(status_code)) || (active_conversations_filter == 3 && [0, 1, 2, 4].includes(status_code)) || (active_conversations_filter == 4 && status_code != 4)) {
                                let previous = false;
                                SBConversations.updateMenu();
                                if (SBChat.conversation && SBChat.conversation.id == conversation.id) {
                                    previous = conversation_li.prev();
                                    SBChat.conversation = false;
                                }
                                conversation_li.remove();
                                if (conversation.id == last_conversation_id) {
                                    SBConversations.clickFirst(previous);
                                }
                            }
                            if (active_conversations_filter == 4 && status_code == 5) {
                                conversations_admin_list_ul.find('li').remove();
                                SBConversations.updateMenu();
                                SBConversations.clickFirst();
                            }
                        });
                        if (SBChat.conversation && SBChat.conversation.id == conversation.id) {
                            SBChat.conversation.set('status_code', status_code);
                            SBConversations.setReadIcon(status_code);
                        }
                    }
                });
            }
        });

        // Saved replies
        SBF.ajax({
            function: 'saved-replies'
        }, (response) => {
            let code = `<p class="sb-no-results">${sb_('No saved replies found. Add new saved replies via Settings > Admin.')}</p>`;
            if (Array.isArray(response)) {
                if (response.length && response[0]['reply-name']) {
                    code = '';
                    saved_replies_list = response;
                    for (var i = 0; i < response.length; i++) {
                        code += `<li><div>${response[i]['reply-name']}</div><div>${response[i]['reply-text'].replace(/\\n/g, '\n')}</div></li>`;
                    }
                }
            }
            saved_replies.find('.sb-replies-list > ul').html(code).sbLoading(false);
        });

        $(conversations_area).on('click', '.sb-btn-saved-replies', function () {
            saved_replies.sbTogglePopup(this);
            saved_replies.find('.sb-search-btn').sbActive(true).find('input').get(0).focus();
        });

        $(admin).on('click', '.sb-btn-open-ai', function () {
            if (!SBChat.conversation || loading(this)) return;
            let is_editor = $(this).hasClass('sb-btn-open-ai-editor');
            let textarea = is_editor ? conversations_area.find('.sb-editor textarea') : dialogflow_intent_box.find('textarea');
            SBApps.openAI.rewrite(textarea.val(), !SBChat.conversation.getUserMessages('agents').length, (response) => {
                $(this).sbLoading(false);
                if (response[0]) {
                    textarea.val(is_editor ? '' : response[1]);
                    if (is_editor) {
                        SBChat.insertText(response[1]);
                    }
                }
            });
        });

        $(saved_replies).on('click', '.sb-replies-list li', function () {
            SBChat.insertText($(this).find('div:last-child').text().replace(/\\n/g, '\n'));
            SBF.deactivateAll();
            admin.removeClass('sb-popup-active');
        });

        $(saved_replies).on('input', '.sb-search-btn input', function () {
            saved_reply_search($(this).val().toLowerCase());
        });

        $(saved_replies).on('click', '.sb-search-btn i', function () {
            SBF.searchClear(this, () => { saved_reply_search('') });
        });

        // Pagination for conversations
        $(conversations_admin_list).find('.sb-scroll-area').on('scroll', function () {
            if (!is_busy && !SBConversations.is_search && scrollPagination(this, true) && pagination_count) {
                let parent = conversations_area.find('.sb-admin-list');
                let filters = SBConversations.filters();
                is_busy = true;
                parent.append('<div class="sb-loading-global sb-loading"></div>');
                SBF.ajax({
                    function: 'get-conversations',
                    pagination: pagination,
                    status_code: filters[0],
                    department: filters[1],
                    source: filters[2],
                    tag: filters[3]
                }, (response) => {
                    setTimeout(() => { is_busy = false }, 500);
                    pagination_count = response.length;
                    if (pagination_count) {
                        let code = '';
                        for (var i = 0; i < pagination_count; i++) {
                            let conversation = new SBConversation([new SBMessage(response[i])], response[i]);
                            code += SBConversations.getListCode(conversation);
                            conversations.push(conversation);
                        }
                        pagination++;
                        conversations_admin_list_ul.append(code);
                    }
                    parent.find(' > .sb-loading').remove();
                    SBF.event('SBAdminConversationsLoaded', { conversations: response });
                });
            }
        });

        // Event: message deleted
        $(document).on('SBMessageDeleted', function () {
            let last_message = SBChat.conversation.getLastMessage();
            if (last_message != false) {
                conversations_admin_list_ul.find('li.sb-active p').html(last_message.message);
            } else {
                conversations_admin_list_ul.find('li.sb-active').remove();
                SBConversations.clickFirst();
                SBConversations.scrollTo();
            }
        });

        // Event: message sent
        $(document).on('SBMessageSent', function (e, response) {
            let conversation_id = response.conversation_id;
            let item = getListConversation(conversation_id);
            let message_part = sb_('Error. Message not sent to');
            let conversation = response.conversation;
            let user = response.user;
            if (response.message) {
                item.find('p').html(SBF.escape(response.message));
            }
            if (response.conversation_status_code) {
                item.attr('data-conversation-status', response.conversation_status_code);
                SBConversations.updateMenu();
            }
            if (SBApps.messenger.check(conversation)) {
                SBApps.messenger.send(user.getExtra('facebook-id').value, conversation.get('extra'), response.message, response.attachments, response.message_id, response.message_id, (response) => {
                    for (var i = 0; i < response.length; i++) {
                        if (response[i] && response[i].error) {
                            infoPanel(message_part + ' Messenger: ' + response[i].error.message, 'info', false, 'error-fb');
                        }
                    }
                });
            }
            if (SBApps.whatsapp.check(conversation)) {
                SBApps.whatsapp.send(SBApps.whatsapp.activeUserPhone(user), response.message, response.attachments, conversation.get('extra'), (response) => {
                    if ('ErrorCode' in response || ('meta' in response && 'success' in response.meta && !response.meta.success)) {
                        infoPanel(message_part + ' WhatsApp: ' + ('ErrorCode' in response ? response.errorMessage : response.meta.developer_message), 'info', false, 'error-wa');
                    }
                });
            }
            if (SBApps.telegram.check(conversation)) {
                SBApps.telegram.send(conversation.get('extra'), response.message, response.attachments, conversation_id, (response) => {
                    if (!('ok' in response) || !response.ok) {
                        infoPanel(message_part + ' Telegram: ' + JSON.stringify(response), 'info', false, 'error-tg');
                    }
                });
            }
            if (SBApps.viber.check(conversation)) {
                SBApps.viber.send(user.getExtra('viber-id').value, response.message, response.attachments, (response) => {
                    if (!('status_message' in response) || response.status_message != 'ok') {
                        infoPanel(message_part + ' Viber: ' + JSON.stringify(response), 'info', false, 'error-vb');
                    }
                });
            }
            if (SBApps.twitter.check(conversation)) {
                SBApps.twitter.send(user.getExtra('twitter-id').value, response.message, response.attachments, (response_2) => {
                    if (response_2 && !('event' in response_2)) {
                        infoPanel(JSON.stringify(response_2), 'info', false, 'error-tw');
                    } else if (response.attachments.length > 1) {
                        infoBottom('Only the first attachment was sent to Twitter.', 'info');
                    }
                });
            }
            if (SBApps.gbm.check(conversation)) {
                SBApps.gbm.send(user.getExtra('gbm-id').value, response.message, response.attachments, (response) => {
                    if (response[0] && 'error' in response[0]) {
                        infoPanel(message_part + ' Business Messenger: ' + response[0].error.message, 'info', false, 'error-bm');
                    }
                });
            }
            if (SBApps.line.check(conversation)) {
                SBApps.line.send(user.getExtra('line-id').value, response.message, response.attachments, conversation_id, (response) => {
                    if (response.error) {
                        infoPanel(message_part + ' LINE: ' + JSON.stringify(response), 'info', false, 'error-ln');
                    }
                });
            }
            if (SBApps.wechat.check(conversation)) {
                SBApps.wechat.send(user.getExtra('wechat-id').value, response.message, response.attachments, (response) => {
                    if (!response || response.errmsg != 'ok') {
                        infoPanel(message_part + ' WeChat: ' + JSON.stringify(response), 'info', false, 'error-wc');
                    }
                });
            }
            if (SB_ADMIN_SETTINGS.smart_reply) {
                suggestions_area.html('');
            }
            if (SB_ADMIN_SETTINGS.assign_conversation_to_agent && SBF.null(conversation.get('agent_id'))) {
                SBConversations.assignAgent(conversation_id, SB_ACTIVE_AGENT.id, () => {
                    if (SBChat.conversation.id == conversation_id) {
                        SBChat.conversation.set('agent_id', SB_ACTIVE_AGENT.id);
                        $(conversations_area).find('#conversation-agent > p').attr('data-value', SB_ACTIVE_AGENT.id).html(SB_ACTIVE_AGENT.full_name);
                    }
                });
            }
        });

        // Event: new message of active chat conversation received
        $(document).on('SBNewMessagesReceived', function (e, response) {
            let messages = response.messages;
            for (var i = 0; i < messages.length; i++) {
                let message = messages[i];
                let payload = message.payload();
                let agent = SBF.isAgent(message.get('user_type'));
                setTimeout(function () {
                    conversation_area.find('.sb-top .sb-status-typing').remove();
                }, 300);
                if (SBAdmin.must_translate) {
                    let message_html = conversation_area.find(`[data-id="${message.id}"]`);
                    let message_original = 'original-message' in payload ? payload['original-message'] : false;
                    if (message_original) {
                        message_original = SBF.escape(message_original.replaceAll('<', '&lt;'));
                        message.set('translation', message_original);
                        message_html.replaceWith(message.getCode(true));
                        conversation_area.find(`[data-id="${message.id}"] .sb-menu`).prepend(`<li data-value="original">${sb_('View translation')}</li>`);
                        if (SB_ADMIN_SETTINGS.smart_reply) {
                            SBApps.dialogflow.smartReply(message_original);
                        }
                    } else if (message.message) {
                        SBApps.dialogflow.translate([message.message], SB_ADMIN_SETTINGS.active_agent_language, (response_2) => {
                            if (response_2) {
                                message.set('translation', response_2[0]);
                                message_html.replaceWith(message.getCode(true));
                                conversation_area.find(`[data-id="${message.id}"] .sb-menu`).prepend(`<li data-value="original">${sb_('View original message')}</li>`);
                            }
                            if (SB_ADMIN_SETTINGS.smart_reply) {
                                SBApps.dialogflow.smartReply(response_2[0]);
                            }
                            conversations_admin_list_ul.find(`[data-conversation-id="${response.conversation_id}"] p`).html(response_2[0]);
                        }, [message.id], SBChat.conversation.id);
                    }
                } else if (SB_ADMIN_SETTINGS.smart_reply) {
                    SBApps.dialogflow.smartReply(message.message);
                }
                if (payload.queryResult && payload.queryResult.fulfillmentMessages) {
                    let fulfillment_messages = payload.queryResult.fulfillmentMessages;
                    for (var i = 0; i < fulfillment_messages.length; i++) {
                        if (fulfillment_messages[i].payload) {
                            let message_payload = fulfillment_messages[i].payload;
                            if (message_payload.department) {
                                SBConversations.setActiveDepartment(message_payload.department);
                                break;
                            }
                            if (message_payload.agent) {
                                SBConversations.setActiveAgent(message_payload.agent);
                                break;
                            }
                        }
                    }
                }
                if ('ErrorCode' in payload || (payload.errors && payload.errors.length)) {
                    infoPanel('Error. Message not sent to WhatsApp. Error message: ' + (payload.ErrorCode ? payload.ErrorCode : payload.errors[0].title), 'info');
                }
                if ('whatsapp-templates' in payload) {
                    infoBottom(`Message sent as text message.${'whatsapp-template-fallback' in payload ? ' The user has been notified via WhatsApp Template notification.' : ''}`);
                }
                if ('whatsapp-template-fallback' in payload && !('whatsapp-templates' in payload)) {
                    infoBottom('The user has been notified via WhatsApp Template notification.');
                }
                if (!agent && SBChat.conversation.id == response.conversation_id && !SBChat.user_online) {
                    SBUsers.setActiveUserStatus();
                }
            }
            SBConversations.update();
        });

        // Event: new conversation created 
        $(document).on('SBNewConversationCreated', function () {
            SBConversations.update();
        });

        // Event: email notification sent
        $(document).on('SBEmailSent', function () {
            infoBottom(`The user has been notified by email.`);
        });

        // Event: SMS notification sent
        $(document).on('SBSMSSent', function () {
            infoBottom('The user has been notified by text message.');
        });

        // Event: Message notifications
        $(document).on('SBNotificationsSent', function (e, response) {
            infoBottom(`The user ${response.includes('cron') ? 'will be' : 'has been'} notified by email${response.includes('sms') ? ' and text message' : ''}.`);
        });

        // Event: user typing status change
        $(document).on('SBTyping', function (e, response) {
            SBConversations.typing(response);
        });

        // Conversations search
        $(conversations_admin_list).on('input', '.sb-search-btn input', function () {
            SBConversations.search(this);
        });

        $(conversations_area).on('click', '.sb-admin-list .sb-search-btn i', function () {
            SBF.searchClear(this, () => { SBConversations.search($(this).next()) });

        });

        // Conversations filter
        $(conversations_area).on('click', '.sb-admin-list .sb-select li', function () {
            let parent = conversations_admin_list_ul.parent();
            if (loading(parent)) {
                return;
            }
            setTimeout(() => {
                let filters = SBConversations.filters();
                pagination = 1;
                pagination_count = 1;
                SBF.ajax({
                    function: 'get-conversations',
                    status_code: filters[0],
                    department: filters[1],
                    source: filters[2],
                    tag: filters[3]
                }, (response) => {
                    SBConversations.populateList(response);
                    conversation_area.attr('data-conversation-status', filters[0]);
                    if (response.length) {
                        if (!responsive) {
                            if (SBChat.conversation) {
                                let conversation = getListConversation(SBChat.conversation.id);
                                if (conversation.length) {
                                    conversation.sbActive(true);
                                } else if (filters[0] == SBChat.conversation.status_code) {
                                    conversations_admin_list_ul.prepend(SBConversations.getListCode(SBChat.conversation).replace('<li', '<li class="sb-active"'));
                                } else {
                                    SBConversations.clickFirst();
                                }
                            } else {
                                SBConversations.clickFirst();
                            }
                            SBConversations.scrollTo();
                        }
                    } else {
                        conversations_area.find('.sb-board').addClass('sb-no-conversation');
                        SBChat.conversation = false;
                    }
                    parent.sbLoading(false);
                });
            }, 100);
        });

        // Display the user details box
        $(conversations_area).on('click', '.sb-user-details .sb-profile,.sb-top > a', function () {
            let user_id = conversations_admin_list_ul.find('.sb-active').attr('data-user-id');
            if (activeUser().id != user_id) {
                activeUser(users[user_id]);
            }
            SBProfile.show(activeUser().id);
        });

        // Right profile list methods
        $(admin).on('click', '.sb-profile-list li', function () {
            let label = $(this).find('label');
            let label_value = label.html();
            switch ($(this).attr('data-id')) {
                case 'location':
                    let location = label_value.replace(', ', '+');
                    infoPanel('<iframe src="https://maps.google.com/maps?q=' + location + '&output=embed"></iframe>', 'map');
                    break;
                case 'timezone':
                    SBF.getLocationTimeString(activeUser().extra, (response) => {
                        loadingGlobal(false);
                        infoPanel(response, 'info');
                    });
                    break;
                case 'current_url':
                    window.open('//' + (SBF.null(label.attr('data-value')) ? label_value : label.attr('data-value')));
                    break;
                case 'conversation-source':
                    let source = label_value.toLowerCase();
                    if (source == 'whatsapp' && activeUser().getExtra('phone')) {
                        window.open('https://wa.me/' + SBApps.whatsapp.activeUserPhone());
                    } else if (source == 'facebook') {
                        window.open('https://www.facebook.com/messages/t/' + SBChat.conversation.get('extra'));
                    } else if (source == 'instagram') {
                        window.open('https://www.instagram.com/direct/inbox/');
                    } else if (source == 'twitter') {
                        window.open('https://twitter.com/messages/');
                    }
                    break;
                case 'wp-id':
                    window.open(window.location.href.substr(0, window.location.href.lastIndexOf('/')) + '/user-edit.php?user_id=' + activeUser().getExtra('wp-id').value);
                    break;
                case 'envato-purchase-code':
                    loadingGlobal();
                    SBF.ajax({
                        function: 'envato',
                        purchase_code: label_value
                    }, (response) => {
                        let code = '';
                        if (response && response.item) {
                            response.name = response.item.name;
                            for (var key in response) {
                                if (isString(response[key])) {
                                    code += `<b>${SBF.slugToString(key)}</b> ${response[key]} <br>`;
                                }
                            }
                            loadingGlobal(false);
                            infoPanel(code, 'info', false, 'sb-envato-box');
                        } else {
                            infoBottom(SBF.slugToString(response));
                        }
                    });
                    break;
            }
        });

        $(conversations_user_details).on('click', '.sb-user-details-close', function () {
            conversations_area.find('.sb-menu-mobile [data-value="panel"]').click().sbActive(true);
        });

        // Dialogflow
        $(conversations_area).on('click', '.sb-menu [data-value="bot"]', function () {
            SBApps.dialogflow.showCreateIntentBox($(this).closest('[data-id]').attr('data-id'));
        });

        $(dialogflow_intent_box).on('click', '.sb-intent-add [data-value="add"]', function () {
            dialogflow_intent_box.find('> div > .sb-type-text').last().after('<div class="sb-input-setting sb-type-text"><input type="text"></div>');
        });

        $(dialogflow_intent_box).on('click', '.sb-intent-add [data-value="previous"],.sb-intent-add [data-value="next"]', function () {
            let input = dialogflow_intent_box.find('.sb-first input');
            let message = input.val();
            let next = $(this).attr('data-value') == 'next';
            let messages = SBChat.conversation.getUserMessages();
            let messages_length = messages.length;
            for (var i = 0; i < messages_length; i++) {
                if (messages[i].message == message && ((next && i < (messages_length - 1)) || (!next && i > 0))) {
                    i = i + (next ? 1 : -1);
                    input.val(messages[i].message);
                    dialogflow_intent_box.attr('data-message-id', messages[i].id);
                    SBApps.openAI.generateIntents(messages[i].message);
                    break;
                }
            }
        });

        $(dialogflow_intent_box).on('click', '.sb-send', function () {
            SBApps.dialogflow.submitIntent(this);
        });

        $(dialogflow_intent_box).on('input', '.sb-search-btn input', function () {
            SBApps.dialogflow.searchIntents($(this).val());
        });

        $(dialogflow_intent_box).on('click', '.sb-search-btn i', function () {
            SBF.searchClear(this, () => { SBApps.dialogflow.searchIntents($(this).val()) });
        });

        $(dialogflow_intent_box).on('click', '#sb-intent-preview', function () {
            SBApps.dialogflow.previewIntent(dialogflow_intent_box.find('#sb-intents-select').val());
        });

        $(dialogflow_intent_box).on('change', '#sb-intents-select', function () {
            let intent = $(this).val();
            dialogflow_intent_box.find('.sb-bot-response').css('opacity', intent ? .5 : 1).find('textarea').val(intent ? SBApps.dialogflow.getIntent(intent).messages[0].text.text[0] : SBApps.dialogflow.original_response);
            dialogflow_intent_box.find('#sb-train-chatbots').val(intent ? 'dialogflow' : '');
        });

        $(dialogflow_intent_box).on('change', 'textarea', function () {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                SBApps.dialogflow.original_response = dialogflow_intent_box.find('textarea').val();
            }, 500);
        });

        $(dialogflow_intent_box).on('change', '#sb-train-chatbots', function () {
            dialogflow_intent_box.find('.sb-type-text:not(.sb-first)').setClass('sb-hide', $(this).val() == 'open-ai');
        });

        // Departments
        $(select_departments).on('click', 'li', function (e) {
            let select = $(this).parent().parent();
            if ($(this).data('id') == select.find(' > p').attr('data-id')) {
                setTimeout(() => { $(this).sbActive(false); }, 100);
                return true;
            }
            if (!SBChat.conversation) {
                $(this).parent().sbActive(false);
                e.preventDefault();
                return false;
            }
            if (!select.sbLoading()) infoPanel(`${sb_('All agents assigned to the new department will be notified. The new department will be')} ${$(this).html()}.`, 'alert', () => {
                let value = $(this).data('id');
                select.sbLoading(true);
                SBConversations.assignDepartment(SBChat.conversation.id, value, () => {
                    SBConversations.setActiveDepartment(value);
                    select.sbLoading(false);
                });
            });
            e.preventDefault();
            return false;
        });

        // Agent assignment
        $(conversations_area).on('click', '#conversation-agent li', function (e) {
            let select = $(this).parent().parent();
            let agent_id = $(this).data('id');
            if (agent_id == select.find(' > p').attr('data-value')) return true;
            if (!SBChat.conversation) {
                $(this).parent().sbActive(false);
                e.preventDefault();
                return false;
            }
            if (!select.sbLoading()) {
                infoPanel(`${sb_('The new agent will be')} ${$(this).html()}.`, 'alert', () => {
                    select.sbLoading(true);
                    SBConversations.assignAgent(SBChat.conversation.id, agent_id, () => {
                        SBConversations.setActiveAgent(agent_id);
                        select.sbLoading(false);
                    });
                });
            }
            e.preventDefault();
            return false;
        });

        // Notes and Tags 
        notes_panel.on('click', '> i,.sb-edit-note', function (e) {
            let note = $(this).hasClass('sb-edit-note') ? $(this).closest('[data-id]') : false;
            SBAdmin.genericPanel('notes', note ? 'Edit note' : 'Add new note', `<div class="sb-input-setting sb-type-textarea"><textarea${note ? ' data-id="' + note.attr('data-id') + '"' : ''} placeholder="${sb_('Write here your note...')}">${note ? note.find('.sb-note-text').html().replaceAll('<br>', '\n') : ''}</textarea></div>`, [[note ? 'Update note' : 'Add note', note ? 'check' : 'plus']]);
            if (SBApps.is('dialogflow') && SB_ADMIN_SETTINGS.note_data_scrape) {
                let options = '';
                for (var key in SB_ADMIN_SETTINGS.note_data_scrape) {
                    options += `<option value="${key}">${SB_ADMIN_SETTINGS.note_data_scrape[key]}</option>`;
                }
                admin.find('#sb-add-note').parent().prepend(`<div id="note-ai-scraping" class="sb-input-setting sb-type-select"><select><option value="">${sb_('Data scraping')}</option>${options}</select></div>`);
            }
            e.preventDefault();
            return false;
        });

        $(admin).on('change', '#note-ai-scraping select', function () {
            let value = $(this).val();
            if (!value || loading($(this).parent())) {
                return;
            }
            SBF.ajax({
                function: 'data-scraping',
                conversation_id: SBChat.conversation.id,
                prompt_id: value
            }, (response) => {
                if (response && response.error) {
                    console.error(response);
                    return infoBottom(response.error.message, 'error');
                }
                $(this).parent().sbLoading(false);
                let textarea = admin.find('.sb-notes-box textarea');
                textarea.val((textarea.val() + '\n' + response).trim());
            });
        });

        notes_panel.on('click', '.sb-delete-note', function () {
            let item = $(this).parents().eq(1);
            SBConversations.notes.delete(SBChat.conversation.id, item.attr('data-id'), (response) => {
                if (response === true) {
                    item.remove();
                } else {
                    SBF.error(response);
                }
            });
        });

        $(admin).on('click', '#sb-add-note, #sb-update-note', function () {
            let textarea = $(this).parent().parents().eq(1).find('textarea');
            let message = textarea.val();
            let note_id = textarea.attr('data-id');
            if (message.length == 0) {
                SBForm.showErrorMessage(admin.find('.sb-notes-box'), 'Please write something...');
            } else {
                if (loading(this)) return;
                message = SBF.escape(message);
                SBConversations.notes.add(SBChat.conversation.id, SB_ACTIVE_AGENT.id, SB_ACTIVE_AGENT.full_name, message, (response) => {
                    if (Number.isInteger(response) || response === true) {
                        $(this).sbLoading(false);
                        admin.sbHideLightbox();
                        if (note_id) {
                            notes_panel.find(`[data-id="${note_id}"]`).remove();
                        }
                        SBConversations.notes.update([{ id: note_id ? note_id : response, conversation_id: SBChat.conversation.id, user_id: SB_ACTIVE_AGENT.id, name: SB_ACTIVE_AGENT['full_name'], message: message }], true);
                        textarea.val('');
                        infoBottom(note_id ? 'Note successfully updated.' : 'New note successfully added.');
                    } else {
                        SBForm.showErrorMessage(response);
                    }
                }, note_id);
            }
        });

        tags_panel.on('click', '> i', function (e) {
            let code = SBConversations.tags.getAll(SBChat.conversation.details.tags);;
            let tags = SBChat.conversation.details.tags;
            SBAdmin.genericPanel('tags', 'Manage tags', code ? '<div class="sb-tags-cnt">' + code + '</div>' : '<p>' + sb_('Add tags from Settings > Admin > Tags.') + '</p>', ['Save tags']);
            e.preventDefault();
            return false;
        });

        $(admin).on('click', '.sb-tags-cnt > span', function () {
            $(this).toggleClass('sb-active');
        });

        $(admin).on('click', '#sb-add-tag', function () {
            $('<input type="text">').insertBefore(this);
        });

        $(admin).on('click', '#sb-save-tags', function () {
            if (loading(this)) return;
            let tags = admin.find('.sb-tags-box').find('span.sb-active').map(function () {
                return $(this).attr('data-value');
            }).toArray();
            let conversation_id = SBChat.conversation.id;
            SBF.ajax({
                function: 'update-tags',
                conversation_id: conversation_id,
                tags: tags
            }, (response) => {
                $(this).sbLoading(false);
                if (response[0] === true) {
                    SBConversations.tags.update(tags);
                    if (SBChat.conversation && conversation_id == SBChat.conversation.id) {
                        let tag_filter = SBConversations.filters()[3];
                        let conversation_li = getListConversation(conversation_id);
                        SBChat.conversation.set('tags', tags);
                        if (tag_filter && !tags.includes(tag_filter)) {
                            conversation_li.remove();
                            SBConversations.clickFirst();
                        } else if (SB_ADMIN_SETTINGS.tags_show) {
                            let tags_area = conversation_li.find('.sb-tags-area');
                            let code = SBConversations.tags.codeLeft(tags);
                            if (tags_area.length) {
                                tags_area.replaceWith(code);
                            } else {
                                $(code).insertAfter(conversation_li.find('.sb-name'));
                            }
                        }
                    }
                }
                admin.sbHideLightbox();
                infoBottom(response[0] === true ? 'Tags have been successfully updated.' : response);
            });
        });

        // Suggestions
        $(suggestions_area).on('click', 'span', function () {
            SBChat.insertText($(this).text());
            suggestions_area.html('');
        });

        $(suggestions_area).on('mouseover', 'span', function () {
            timeout = setTimeout(() => { $(this).addClass('sb-suggestion-full'); }, 2500);
        });

        $(suggestions_area).on('mouseout', 'span', function () {
            clearTimeout(timeout);
            suggestions_area.find('span').removeClass('sb-suggestion-full');
        });

        // Message menu
        $(conversations_area).on('click', '.sb-list .sb-menu > li', function () {
            let message = $(this).closest('[data-id]');
            let message_id = message.attr('data-id');
            let message_user_type = SBChat.conversation.getMessage(message_id).get('user_type');
            let value = $(this).attr('data-value');
            switch (value) {
                case 'delete':
                    if (SBChat.user_online) {
                        SBF.ajax({
                            function: 'update-message',
                            message_id: message_id,
                            message: '',
                            attachments: [],
                            payload: { 'event': 'delete-message' }
                        }, () => {
                            SBChat.conversation.deleteMessage(message_id);
                            message.remove();
                        });
                    } else {
                        SBChat.deleteMessage(message_id);
                    }
                    break;
                case 'translation':
                case 'original':
                    let translation = value == 'translation';
                    let agent = SBF.isAgent(message_user_type);
                    message.replaceWith(SBChat.conversation.getMessage(message_id).getCode(translation));
                    conversations_area.find(`[data-id="${message_id}"] .sb-menu`).prepend(`<li data-value="${translation ? 'original' : 'translation'}">${sb_((agent && message_user_type != 'bot' && !translation) || ((!agent || message_user_type == 'bot') && translation) ? 'View original message' : 'View translation')}</li>`);
                    break;
            }
        });

        // Conversations filter
        $(conversations_area).on('click', '.sb-filter-btn i', function () {
            $(this).parent().toggleClass('sb-active');
        });

        /*
        * ----------------------------------------------------------
        * Users area
        * ----------------------------------------------------------
        */

        // Open user box by URL
        if (SBF.getURL('user')) {
            header.find('.sb-admin-nav #sb-users').click();
            setTimeout(() => { SBProfile.show(SBF.getURL('user')) }, 500);
        }

        // Checkbox selector
        $(users_table).on('click', 'th :checkbox', function () {
            users_table.find('td :checkbox').prop('checked', $(this).prop('checked'));
        });

        $(users_table).on('click', ':checkbox', function () {
            let button = users_area.find('[data-value="delete"]');
            if (users_table.find('td input:checked').length) {
                button.removeAttr('style');
            } else {
                button.hide();
            }
        });

        // Table menu filter
        $(users_table_menu).on('click', 'li', function () {
            SBUsers.filter($(this).data('type'));
        });

        // Search users
        $(users_area).on('input', '.sb-search-btn input', function () {
            SBUsers.search(this);
        });

        $(users_area).on('click', '.sb-search-btn i', function () {
            SBF.searchClear(this, () => { SBUsers.search($(this).next()) });
        });

        // Sorting
        $(users_table).on('click', 'th:not(:first-child)', function () {
            let direction = $(this).hasClass('sb-order-asc') ? 'DESC' : 'ASC';
            $(this).toggleClass('sb-order-asc');
            $(this).siblings().sbActive(false);
            $(this).sbActive(true);
            SBUsers.sort($(this).data('field'), direction);
        });

        // Pagination for users
        $(users_table).parent().on('scroll', function () {
            if (!is_busy && !SBUsers.search_query && scrollPagination(this, true) && users_pagination_count) {
                is_busy = true;
                users_area.append('<div class="sb-loading-global sb-loading sb-loading-pagination"></div>');
                SBF.ajax({
                    function: 'get-users',
                    pagination: users_pagination,
                    sorting: SBUsers.sorting,
                    user_types: SBUsers.user_types,
                    search: SBUsers.search_query,
                    extra: SBUsers.table_extra
                }, (response) => {
                    setTimeout(() => { is_busy = false }, 500);
                    users_pagination_count = response.length;
                    if (users_pagination_count) {
                        let code = '';
                        for (var i = 0; i < users_pagination_count; i++) {
                            let user = new SBUser(response[i], response[i].extra);
                            code += SBUsers.getRow(user);
                            users[user.id] = user;
                        }
                        users_pagination++;
                        users_table.find('tbody').append(code);
                    }
                    users_area.find(' > .sb-loading-pagination').remove();
                });
            }
        });

        // Delete user button
        $(profile_edit_box).on('click', '.sb-delete', function () {
            if (SB_ACTIVE_AGENT.id == activeUser().id) {
                return infoBottom('You cannot delete yourself.', 'error');
            }
            infoPanel('This user will be deleted permanently including all linked data, conversations, and messages.', 'alert', function () {
                SBUsers.delete(activeUser().id);
            });
        });

        // Display user box
        $(users_table).on('click', 'td:not(:first-child)', function () {
            SBProfile.show($(this).parent().attr('data-user-id'));
        });

        // Display edit box
        $(profile_box).on('click', '.sb-top-bar .sb-edit', function () {
            SBProfile.showEdit(activeUser());
        });

        // Display new user box
        $(users_area).on('click', '.sb-new-user', function () {
            profile_edit_box.addClass('sb-user-new');
            profile_edit_box.find('.sb-top-bar .sb-profile span').html(sb_('Add new user'));
            profile_edit_box.find('.sb-top-bar .sb-save').html(`<i class="sb-icon-check"></i>${sb_('Add user')}`);
            profile_edit_box.find('input,select,textara').removeClass('sb-error');
            profile_edit_box.removeClass('sb-cloud-admin');
            if (SB_ACTIVE_AGENT.user_type == 'admin') {
                profile_edit_box.find('#user_type').find('select').html(`<option value="user">${sb_('User')}</option><option value="agent">${sb_('Agent')}</option><option value="admin">${sb_('Admin')}</option>`);
            }
            SBProfile.clear(profile_edit_box);
            SBProfile.boxClasses(profile_edit_box);
            SBProfile.updateRequiredFields('user');
            profile_edit_box.sbShowLightbox();
        });

        // Add or update user
        $(profile_edit_box).on('click', '.sb-save', function () {
            if (loading(this)) return;
            let new_user = (profile_edit_box.hasClass('sb-user-new') ? true : false);
            let user_id = profile_edit_box.attr('data-user-id');

            // Get settings
            let settings = SBProfile.getAll(profile_edit_box.find('.sb-details'));
            let settings_extra = SBProfile.getAll(profile_edit_box.find('.sb-additional-details'));

            // Errors check
            if (SBProfile.errors(profile_edit_box)) {
                SBProfile.showErrorMessage(profile_edit_box, SBF.isAgent(profile_edit_box.find('#user_type :selected').val()) ? 'First name, last name, password and a valid email are required. Minimum password length is 8 characters.' : 'First name is required.');
                $(this).sbLoading(false);
                return;
            }
            if (SB_ACTIVE_AGENT.id == activeUser().id && settings.user_type[0] == 'agent' && SB_ACTIVE_AGENT.user_type == 'admin') {
                SBProfile.showErrorMessage(profile_edit_box, 'You cannot change your status from admin to agent.');
                $(this).sbLoading(false);
                return;
            }

            // Save the settings
            SBF.ajax({
                function: (new_user ? 'add-user' : 'update-user'),
                user_id: user_id,
                settings: settings,
                settings_extra: settings_extra
            }, (response) => {
                if (SBF.errorValidation(response, 'duplicate-email') || SBF.errorValidation(response, 'duplicate-phone')) {
                    SBProfile.showErrorMessage(profile_edit_box, `This ${SBF.errorValidation(response, 'duplicate-email') ? 'email' : 'phone number'} is already in use.`);
                    $(this).sbLoading(false);
                    return;
                }
                if (new_user) {
                    user_id = response;
                    activeUser(new SBUser({ 'id': user_id }));
                }
                activeUser().update(() => {
                    users[user_id] = activeUser();
                    if (new_user) {
                        SBProfile.clear(profile_edit_box);
                        SBUsers.update();
                    } else {
                        SBUsers.updateRow(activeUser());
                        if (conversations_area.sbActive()) {
                            SBConversations.updateUserDetails();
                        }
                        if (user_id == SB_ACTIVE_AGENT.id) {
                            SBF.loginCookie(response[1]);
                            SB_ACTIVE_AGENT.full_name = activeUser().name;
                            SB_ACTIVE_AGENT.profile_image = activeUser().image;
                            header.find('.sb-account').setProfile();
                        }
                    }
                    if (new_user) {
                        profile_edit_box.find('.sb-profile').setProfile(sb_('Add new user'));
                    }
                    $(this).sbLoading(false);
                    infoBottom(new_user ? 'New user added' : 'User updated');
                });
                SBF.event('SBUserUpdated', { new_user: new_user, user_id: user_id });
            });
        });

        // Set and unset required visitor fields
        $(profile_edit_box).on('change', '#user_type', function () {
            let value = $(this).find("option:selected").val();
            SBProfile.boxClasses(profile_edit_box, value);
            SBProfile.updateRequiredFields(value);
        });

        // Open a user conversation
        $(profile_box).on('click', '.sb-user-conversations li', function () {
            SBConversations.open($(this).attr('data-conversation-id'), $(this).find('[data-user-id]').attr('data-user-id'));
        });

        // Start a new user conversation
        $(profile_box).on('click', '.sb-start-conversation', function () {
            SBConversations.open(-1, activeUser().id);
            SBConversations.openConversation(-1, activeUser().id);
            if (responsive) {
                SBConversations.mobileOpenConversation();
            }
        });

        // Show direct message box from user profile
        $(profile_box).on('click', '.sb-top-bar [data-value]', function () {
            SBConversations.showDirectMessageBox($(this).attr('data-value'), [activeUser().id]);
        });

        // Top icons menu
        $(users_area).on('click', '.sb-top-bar [data-value]', function () {
            let value = $(this).data('value');
            let user_ids = SBUsers.getSelected();
            switch (value) {
                case 'whatsapp':
                    whatsapp_direct_message_box(user_ids);
                    break;
                case 'message':
                case 'custom_email':
                case 'sms':
                    SBConversations.showDirectMessageBox(value, user_ids);
                    break;
                case 'csv':
                    SBUsers.csv();
                    break;
                case 'delete':
                    if (user_ids.includes(SB_ACTIVE_AGENT.id)) {
                        return infoBottom('You cannot delete yourself.', 'error');
                    }
                    infoPanel('All selected users will be deleted permanently including all linked data, conversations, and messages.', 'alert', () => {
                        SBUsers.delete(user_ids);
                        $(this).hide();
                        users_table.find('th:first-child input').prop('checked', false);
                    });
                    break;
            }
        });

        // Direct message
        $(admin).on('click', '.sb-send-direct-message', function () {
            let type = $(this).attr('data-type') ? $(this).attr('data-type') : direct_message_box.attr('data-type');
            let whatsapp = type == 'whatsapp';
            let box = whatsapp ? admin.find('#sb-whatsapp-send-template-box') : direct_message_box;
            let subject = box.find('.sb-direct-message-subject input').val();
            let message = whatsapp ? '' : box.find('textarea').val();
            let user_ids = box.find('.sb-direct-message-users').val().replace(/ /g, '');
            let template_name = false;
            let template_languages = false;
            let parameters = false;
            let phone_number_id = false;
            if (whatsapp) {
                let select = box.find('#sb-whatsapp-send-template-list');
                template_name = select.val();
                template_languages = select.find('option:selected').attr('data-languages');
                phone_number_id = select.find('option:selected').attr('data-phone-id');
                parameters = ['header', 'body', 'button'].map(id => box.find(`#sb-whatsapp-send-template-${id}`).val());
            }
            if (SBForm.errors(box)) {
                SBForm.showErrorMessage(box, 'Please complete the mandatory fields.');
            } else {
                if (loading(this)) {
                    return;
                }
                if (type == 'message') {
                    SBF.ajax({
                        function: 'direct-message',
                        user_ids: user_ids,
                        message: message
                    }, (response) => {
                        $(this).sbLoading(false);
                        let send_email = SB_ADMIN_SETTINGS.notify_user_email;
                        let send_sms = SB_ADMIN_SETTINGS.sms_active_users;
                        if (SBF.errorValidation(response)) {
                            return SBForm.showErrorMessage(box, 'An error has occurred. Please make sure all user ids are correct.');
                        }
                        if (send_email || send_sms) {
                            SBF.ajax({
                                function: 'get-users-with-details',
                                user_ids: user_ids,
                                details: send_email && send_sms ? ['email', 'phone'] : [send_email ? 'email' : 'phone']
                            }, (response) => {
                                if (send_email && response.email.length) {
                                    recursiveSending(response.email, message, 0, send_sms ? response.phone : [], 'email', subject);
                                } else if (send_sms && response.phone.length) {
                                    recursiveSending(response.phone, message, 0, [], 'sms');
                                } else {
                                    admin.sbHideLightbox();
                                }
                            });
                        }
                        infoBottom(`${SBF.slugToString(type)} sent to all users.`);
                    });
                } else {
                    let slug = type == 'custom_email' ? 'email' : 'phone';
                    SBF.ajax({
                        function: 'get-users-with-details',
                        user_ids: user_ids,
                        details: [slug]
                    }, (response) => {
                        if (response[slug].length) {
                            recursiveSending(response[slug], message, 0, [], type, subject, template_name, parameters, template_languages, phone_number_id);
                        } else {
                            $(this).sbLoading(false);
                            return SBForm.showErrorMessage(box, 'No users found.');
                        }
                    });
                }
            }
        });

        function recursiveSending(user_ids, message, i = 0, user_ids_sms = [], type, subject = false, template_name = false, parameters = false, template_languages = false, phone_number_id = false) {
            let settings = { whatsapp: ['whatsapp-send-template', 'messages', ' a phone number.', 'direct-whatsapp'], email: ['create-email', 'emails', ' an email address.', false], custom_email: ['send-custom-email', 'emails', ' an email address.', 'direct-emails'], sms: ['send-sms', 'text messages', ' a phone number.', 'direct-sms'] }[type];
            SBF.ajax({
                function: settings[0],
                to: user_ids[i].value,
                recipient_id: user_ids[i].id,
                sender_name: SB_ACTIVE_AGENT['full_name'],
                sender_profile_image: SB_ACTIVE_AGENT['profile_image'],
                subject: subject,
                message: message,
                template_name: template_name,
                parameters: parameters,
                template_languages: template_languages,
                template: false,
                phone_id: phone_number_id
            }, (response) => {
                let user_ids_length = user_ids.length;
                let box = type == 'whatsapp' ? admin.find('#sb-whatsapp-send-template-box') : direct_message_box;
                box.find('.sb-bottom > div').html(`${sb_('Sending')} ${sb_(settings[1])}... ${i + 1} / ${user_ids_length}`);
                if (response) {
                    if (response !== true && (('status' in response && response.status == 400) || ('error' in response && ![131030, 131009].includes(response.error.code)))) {
                        SBForm.showErrorMessage(box, response.error ? response.error.message : `${response.message} Details at ${response.more_info}`);
                        console.error(response);
                        box.find('.sb-loading').sbLoading(false);
                        box.find('.sb-bottom > div').html('');
                        return;
                    }
                    if (i < user_ids_length - 1) {
                        return recursiveSending(user_ids, message, i + 1, user_ids_sms, type, subject);
                    } else {
                        if (user_ids_sms.length) {
                            recursiveSending(user_ids_sms, message, 0, [], 'sms', false);
                        } else {
                            admin.sbHideLightbox();
                            if (settings[3]) {
                                SBF.ajax({ function: 'reports-update', name: settings[3], value: message.substr(0, 18) + ' | ' + user_ids_length });
                            }
                        }
                        infoBottom(user_ids_length == 1 ? 'The message has been sent.' : sb_('The message was sent to sent to all users who have' + settings[2]));
                    }
                } else {
                    console.warn(response);
                }
            });
        }

        /*
        * ----------------------------------------------------------
        * Settings area
        * ----------------------------------------------------------
        */

        // Open settings area by URL
        if (SBF.getURL('setting')) {
            SBSettings.open(SBF.getURL('setting'));
        }

        // Settings history
        $(settings_area).on('click', ' > .sb-tab > .sb-nav [id]', function () {
            let id = $(this).attr('id').substr(4);
            if (SBF.getURL('setting') != id) {
                pushState('?setting=' + id);
            }
        });

        // Upload
        $(settings_area).on('click', '[data-type="upload-image"] .image, [data-type="upload-file"] .sb-btn', function () {
            upload_target = this;
            admin.find('.sb-upload-form-admin .sb-upload-files').prop('value', '').click();
        });

        $(settings_area).on('click', '[data-type="upload-image"] .image > i', function (e) {
            SBF.ajax({ function: 'delete-file', path: $(this).parent().attr('data-value') });
            $(this).parent().removeAttr('data-value').css('background-image', '');
            e.preventDefault();
            return false;
        });

        // Repeater
        $(admin).on('click', '.sb-repeater-add', function () {
            SBSettings.repeaterAdd(this);
        });

        $(admin).on('click', '.repeater-item > i', function () {
            setTimeout(() => {
                SBSettings.repeaterDelete(this);
            }, 100);
        });

        // Color picker
        SBSettings.initColorPicker();

        $(settings_area).find('[data-type="color"]').focusout(function () {
            let t = $(this).closest('.input-color');
            let color = t.find('input').val();
            setTimeout(function () { t.find('input').val(''); t.find('.color-preview').css('background-color', color); }, 300);
            SBSettings.set($(this).attr('id'), color);
        });

        $(settings_area).on('click', '.sb-type-color .input i', function (e) {
            $(this).parent().find('input').removeAttr('style').val('');
        });

        // Color palette
        $(settings_area).on('click', '.sb-color-palette span', function () {
            let active = $(this).hasClass('sb-active');
            $(this).closest('.sb-repeater').find('.sb-active').sbActive(false);
            $(this).sbActive(!active);
        });

        $(settings_area).on('click', '.sb-color-palette ul li', function () {
            $(this).parent().parent().attr('data-value', $(this).data('value')).find('span').sbActive(false);
        });

        // Select images
        $(settings_area).on('click', '[data-type="select-images"] .input > div', function () {
            $(this).siblings().sbActive(false);
            $(this).sbActive(true);
        });

        // Select checkbox
        $(settings_area).on('click', '.sb-select-checkbox-input', function () {
            $(this).toggleClass('sb-active');
        });

        $(settings_area).on('click', '.sb-select-checkbox input', function () {
            let parent = $(this).closest('[data-type]');
            parent.find('.sb-select-checkbox-input').val(SBSettings.get(parent)[1].join(', '));
        });

        // Save
        $(settings_area).on('click', '.sb-save-changes', function () {
            SBSettings.save(this);
        });

        // OpenAI
        $(settings_area).on('click', '#open-ai-faq-btn a', function (e) {
            loadingGlobal();
            SBF.ajax({
                function: 'get-embeddings-database'
            }, (response) => {
                let faq = [];
                loadingGlobal(false);
                SBAdmin.genericPanel('open-ai-faq', 'Questions and answers', `<div class="sb-setting"><div class="sb-repeater"><div class="repeater-item"><div><label>${sb_('Question')}</label><input data-id="open-ai-faq-question" type="text"></div><div><label>${sb_('Answer')}</label><textarea data-id="open-ai-faq-answer"></textarea></div><i class="sb-icon-close"></i></div></div></div><a class="sb-btn sb-btn-white sb-repeater-add">${sb_('Add new item')}</a>`, ['Train the chatbot'], '', true);
                for (var i = 0; i < response.length; i++) {
                    faq.push({ 'open-ai-faq-question': response[i][0], 'open-ai-faq-answer': response[i][1] });
                }
                if (faq.length) {
                    admin.find('.sb-open-ai-faq-box .sb-repeater').html(SBSettings.repeater('set', faq, admin.find('.sb-open-ai-faq-box .repeater-item:last-child')));
                }
            });
            e.preventDefault();
            return false;
        });

        $(admin).on('click', '#sb-train-the-chatbot', function (e) {
            if (!loading(this)) {
                let questions_answers = SBSettings.repeater('get', admin.find('.sb-open-ai-faq-box .repeater-item')).map(function (item) { return [item['open-ai-faq-question'], item['open-ai-faq-answer']] });
                SBF.ajax({
                    function: 'embeddings-database',
                    questions_answers: questions_answers,
                    reset: true
                }, (response) => {
                    infoBottom('The chatbot has been successfully trained.');
                    $(this).sbLoading(false);
                });
            }
        });

        // Miscellaneous
        $(settings_area).on('change', '#user-additional-fields [data-id="extra-field-slug"], #saved-replies [data-id="reply-name"], [data-id="rich-message-name"]', function () {
            $(this).val(SBF.stringToSlug($(this).val()));
        });

        $(settings_area).on('click', '#timetable-utc input', function () {
            if (!$(this).val()) {
                $(this).val(Math.round(today.getTimezoneOffset() / 60));
            }
        });

        $(settings_area).on('click', '#dialogflow-sync-btn a', function (e) {
            let url = 'https://accounts.google.com/o/oauth2/auth?scope=https%3A%2F%2Fwww.googleapis.com/auth/dialogflow%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcloud-translation%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fcloud-language&response_type=code&access_type=offline&redirect_uri=' + SB_URL + '/apps/dialogflow/functions.php&client_id={client_id}&prompt=consent';
            if (SB_ADMIN_SETTINGS.cloud && settings_area.find('#google-sync-mode select').val() == 'auto') {
                if (SB_ADMIN_SETTINGS.credits) {
                    window.open(url.replace('{client_id}', SB_ADMIN_SETTINGS.google_client_id));
                    e.preventDefault();
                    return false;
                }
            } else {
                let client_id = settings_area.find('#google-client-id input').val();
                if (client_id && settings_area.find('#google-client-secret input').val()) {
                    window.open(url.replace('{client_id}', client_id));
                } else {
                    infoPanel('Before continuing enter Client ID and Client secret. Check the docs for more details.', 'info');
                }
                e.preventDefault();
                return false;
            }
        });

        $(settings_area).on('click', '#dialogflow-redirect-url-btn a', function (e) {
            infoPanel(`<pre>${SB_URL}/apps/dialogflow/functions.php</pre>`, 'info');
            e.preventDefault();
            return false;
        });

        $(settings_area).on('click', '#dialogflow-saved-replies a', function (e) {
            infoPanel('', 'alert', () => {
                if (!loading(this)) {
                    SBF.ajax({ function: 'dialogflow-saved-replies' }, () => {
                        $(this).sbLoading(false);
                    });
                }
            });
            e.preventDefault();
            return false;
        });

        $(settings_area).on('click', '#test-email-user a, #test-email-agent a', function () {
            let email = $(this).parent().find('input').val();
            if (email && email.indexOf('@') > 0 && !loading(this)) {
                SBF.ajax({
                    function: 'send-test-email',
                    to: email,
                    email_type: $(this).parent().parent().attr('id') == 'test-email-user' ? 'user' : 'agent'
                }, () => {
                    infoPanel('The message has been sent.', 'info');
                    $(this).sbLoading(false);
                });
            }
        });

        $(settings_area).on('click', '#test-sms-user a, #test-sms-agent a', function () {
            let phone_number = $(this).parent().find('input').val();
            if (phone_number && !loading(this)) {
                SBF.ajax({
                    function: 'send-sms',
                    message: 'Hello World!',
                    to: phone_number
                }, (response) => {
                    infoPanel(response && ['sent', 'queued'].includes(response.status) ? 'The message has been sent.' : JSON.stringify(response), 'info');
                    $(this).sbLoading(false);
                });
            }
        });

        $(settings_area).on('click', '.sb-timetable > div > div > div', function () {
            let timetable = $(this).closest('.sb-timetable');
            let active = $(this).sbActive();
            $(timetable).find('.sb-active').sbActive(false);
            if (active) {
                $(this).sbActive(false).find('.sb-custom-select').remove();
            } else {
                let select = $(timetable).find('> .sb-custom-select').html();
                $(timetable).find(' > div .sb-custom-select').remove();
                $(this).append(`<div class="sb-custom-select">${select}</div>`).sbActive(true);
            }
        });

        $(settings_area).on('click', '.sb-timetable .sb-custom-select span', function () {
            let value = [$(this).html(), $(this).attr('data-value')];
            $(this).closest('.sb-timetable').find('> div > div > .sb-active').html(value[0]).attr('data-value', value[1]);
            $(this).parent().sbActive(false);
        });

        $(settings_area).on('click', '#system-requirements a', function (e) {
            let code = '';
            SBF.ajax({
                function: 'system-requirements'
            }, (response) => {
                for (var key in response) {
                    code += `<div class="sb-input"><span>${sb_(SBF.slugToString(key))}</span><div${response[key] ? ' class="sb-green"' : ''}>${response[key] ? sb_('Success') : sb_('Error')}</div></div>`;
                }
                loadingGlobal(false);
                SBAdmin.genericPanel('requirements', 'System requirements', code);
            });
            loadingGlobal();
            e.preventDefault();
            return false;
        });

        $(settings_area).on('click', '#sb-path a', function (e) {
            SBF.ajax({
                function: 'path'
            }, (response) => {
                infoPanel(`<pre>${response}</pre>`, 'info');
            });
            e.preventDefault();
            return false;
        });

        $(settings_area).on('click', '#sb-url a', function (e) {
            infoPanel(`<pre>${SB_URL}</pre>`, 'info');
            e.preventDefault();
            return false;
        });

        $(settings_area).on('click', '#delete-leads a', function (e) {
            if (!$(this).sbLoading()) {
                infoPanel('All leads, including all the linked conversations and messages, will be deleted permanently.', 'alert', () => {
                    $(this).sbLoading(true);
                    SBF.ajax({
                        function: 'delete-leads'
                    }, () => {
                        infoPanel('Leads and conversations successfully deleted.', 'info');
                        $(this).sbLoading(false);
                    });
                });
            }
            e.preventDefault();
            return false;
        });

        $(settings_area).on('click', '#open-ai-user-expressions-btn a', function (e) {
            if (!$(this).sbLoading()) {
                infoPanel('Make a backup of your Dialogflow agent first. This operation can take several minutes.', 'alert', () => {
                    $(this).sbLoading(true);
                    SBF.ajax({
                        function: 'open-ai-user-expressions-intents'
                    }, (response) => {
                        infoPanel('User expressions successfully generated.' + (response === true ? '' : ' Errors: ' + response), 'info');
                        $(this).sbLoading(false);
                    });
                });
            }
            e.preventDefault();
            return false;
        });

        $(settings_area).on('click', '#open-ai-train-btn a', function (e) {
            let url_inputs = settings_area.find('[data-id="open-ai-sources-url"], [data-id="open-ai-sources-file-url"]');
            let select = settings_area.find('#open-ai-mode select');
            let urls = [];
            e.preventDefault();
            if (SB_ADMIN_SETTINGS.cloud && SBCloud.creditsAlert(this, e)) {
                return false;
            }
            if (!url_inputs.length || (!url_inputs[0].value && (url_inputs.length == 1 || !url_inputs[1].value))) {
                return infoPanel('Please input at least one source for training.', 'info');
            }
            if (loading(this)) {
                return false;
            }
            for (var i = 0; i < url_inputs.length; i++) {
                if (url_inputs[i].value) {
                    urls.push(url_inputs[i].value);
                }
            }
            SBF.ajax({ function: 'open-ai-get-embeddings-delete', sources: urls }, () => {
                infoPanel('<br><br><br><br><br>', 'info', false, 'sb-embeddings-box');
                SBApps.openAI.crawler.training_button = $(this);
                SBApps.openAI.crawler.errors = [];
                SBApps.openAI.crawler.start_urls = urls.slice();
                SBApps.openAI.crawler.start(urls);
            });
            if (!select.val()) {
                select.val('all');
                SBSettings.save();
            }
            return false;
        });

        $(admin).on('click', '#open-ai-sources-file .repeater-item i, #open-ai-sources-file .repeater-item .sb-btn', function () {
            let input = $(this).parent().find('input');
            let url = input.val();
            if (url) {
                SBF.ajax({ function: 'delete-file', path: url });
                input.val('');
            }
            SBApps.openAI.crawler.active_source = false;
        });

        $(admin).on('click', '#open-ai-delete-training-btn', function () {
            infoPanel('All previous training data for the chatbot will be removed.', 'alert', () => {
                SBF.ajax({ function: 'open-ai-delete-training' });
                SBApps.openAI.crawler.active_source = false;
                SBApps.openAI.crawler.sitemap_processed_urls = [];
                SBApps.openAI.crawler.history = [];
            });
            return false;
        });

        $(settings_area).on('click', '#sb-export-settings a', function (e) {
            if (loading(this)) return;
            SBF.ajax({
                function: 'export-settings'
            }, (response) => {
                dialogDeleteFile(response, 'sb-export-settings-close', 'Settings exported');
                $(this).sbLoading(false);
            });
            e.preventDefault();
            return false;
        });

        $(settings_area).on('click', '#sb-import-settings a', function (e) {
            upload_target = this;
            upload_on_success = (response) => {
                if (loading(this)) return;
                SBF.ajax({
                    function: 'import-settings',
                    file_url: response
                }, (response) => {
                    if (response) {
                        infoBottom('Settings saved. Reload to apply the changes.');
                    } else {
                        infoPanel(response, 'info');
                    }
                    $(this).sbLoading(false);
                });
                upload_on_success = false;
            }
            admin.find('.sb-upload-form-admin .sb-upload-files').click();
            e.preventDefault();
            return false;
        });

        $(admin).on('click', '#sb-export-settings-close .sb-close, #sb-export-users-close .sb-close, #sb-export-report-close .sb-close', function () {
            SBF.ajax({ function: 'delete-file', path: admin.find('.sb-dialog-box p pre').html() });
        });

        if (!SB_ADMIN_SETTINGS.cloud) {
            $(settings_area).on('change', '#push-notifications-provider select', function () {
                let is_pusher = $(this).val() == 'pusher';
                SBSettings.visibility(0, is_pusher);
                SBF.ajax({ function: 'update-sw', url: is_pusher ? 'https://js.pusher.com/beams/service-worker.js' : 'vendor/OneSignalSDK.sw.js' });
            });

            $(settings_area).on('click', '#push-notifications-sw-path a', function (e) {
                let path = urlStrip(location.href).replace(location.host, '').replace('admin.php', '');
                if (path.includes('?')) {
                    path = path.substring(0, path.indexOf('?'));
                }
                infoPanel('<pre>' + path + '</pre>', 'info');
                e.preventDefault();
                return false;
            });
        }

        $(settings_area).on('click', '#push-notifications-btn a', function (e) {
            if (SB_ADMIN_SETTINGS.cloud || settings_area.find('#push-notifications-provider select').val() == 'onesignal') {
                if (typeof OneSignal != ND) {
                    OneSignal.Slidedown.promptPush({ force: true });
                } else {
                    SBF.serviceWorker.initPushNotifications();
                }
            } else {
                Notification.requestPermission();
            }
            e.preventDefault();
            return false;
        });

        $(settings_area).on('input', '#sb-search-settings', function () {
            let search = $(this).val().toLowerCase();
            SBF.search(search, () => {
                let code = '';
                let dropdown = settings_area.find('.sb-search-dropdown-items');
                if (search.length > 2) {
                    let navs = settings_area.find('> .sb-tab > .sb-nav li').map(function () { return $(this).text().trim() }).get();
                    settings_area.find('.sb-setting').each(function () {
                        if ($(this).attr('data-keywords').includes(search) || $(this).attr('id').replaceAll('-', '-').includes(search) || $(this).find('.sb-setting-content').text().toLowerCase().includes(search)) {
                            let index = $(this).parent().index();
                            code += `<div data-tab-index="${index}" data-setting="${$(this).attr('id')}">${navs[index]} > ${$(this).find('h2').text()}</div>`;
                        }
                    });
                }
                dropdown.html(code);
                if (dropdown.outerHeight() > $(window).height() - 100) {
                    dropdown.css('max-height', $(window).height() - 100);
                    dropdown.addClass('sb-scroll-area');
                } else {
                    dropdown.removeClass('sb-scroll-area');
                }
            });
        });

        $(settings_area).on('click', '.sb-search-dropdown-items div', function () {
            let index = $(this).attr('data-tab-index');
            let item = settings_area.find('> .sb-tab > .sb-nav li').eq(index);
            item.click();
            item.get(0).scrollIntoView();
            settings_area.find('#' + $(this).attr('data-setting'))[0].scrollIntoView();
        });

        // Slack  
        $(settings_area).on('click', '#slack-button a', () => {
            window.open('https://board.support/synch/?service=slack&plugin_url=' + SB_URL + cloudURL());
            return false;
        });

        $(settings_area).on('click', '#slack-test a', function (e) {
            if (loading(this)) return;
            SBF.ajax({
                function: 'send-slack-message',
                user_id: false,
                full_name: SB_ACTIVE_AGENT['full_name'],
                profile_image: SB_ACTIVE_AGENT['profile_image'],
                message: 'Lorem ipsum dolor sit amete consectetur adipiscing elite incidido labore et dolore magna aliqua.',
                attachments: [['Example link', SB_URL + '/media/user.svg'], ['Example link two', SB_URL + '/media/user.svg']],
                channel: settings_area.find('#slack-channel input').val()
            }, (response) => {
                if (SBF.errorValidation(response)) {
                    if (response[1] == 'slack-not-active') {
                        infoPanel('Please first activate Slack, then save the settings and reload the admin area.', 'info');
                    } else {
                        infoPanel('Error. Response: ' + JSON.stringify(response), 'info');
                    }
                } else {
                    infoPanel(response[0] == 'success' ? 'Slack message successfully sent. Check your Slack app!' : JSON.stringify(response), 'info');
                }
                $(this).sbLoading(false);
            });
            e.preventDefault();
            return false;
        });

        $(settings_area).on('click', '#tab-slack', function () {
            let input = settings_area.find('#slack-agents .input');
            input.html('<div class="sb-loading"></div>');
            SBF.ajax({
                function: 'slack-users'
            }, (response) => {
                let code = '';
                if (SBF.errorValidation(response, 'slack-token-not-found')) {
                    code = `<p>${sb_('Synchronize Slack and save changes before linking agents.')}</p>`;
                } else {
                    let select = '<option value="-1"></option>';
                    for (var i = 0; i < response.agents.length; i++) {
                        select += `<option value="${response.agents[i].id}">${response.agents[i].name}</option>`;
                    }
                    for (var i = 0; i < response.slack_users.length; i++) {
                        code += `<div data-id="${response.slack_users[i].id}"><label>${response.slack_users[i].name}</label><select>${select}</select></div>`;
                    }
                }
                input.html(code);
                SBSettings.set('slack-agents', [response.saved, 'double-select']);
            });
        });

        $(settings_area).on('click', '#slack-archive-channels a', function (e) {
            e.preventDefault();
            if (loading(this)) return;
            SBF.ajax({
                function: 'archive-slack-channels'
            }, (response) => {
                if (response === true) {
                    infoPanel('Slack channels archived successfully!', 'info');
                }
                $(this).sbLoading(false);
            });
        });

        $(settings_area).on('click', '#slack-channel-ids a', function (e) {
            e.preventDefault();
            if (loading(this)) return;
            SBF.ajax({
                function: 'slack-channels',
                code: true
            }, (response) => {
                infoPanel(response, 'info', false, '', '', true);
                $(this).sbLoading(false);
            });
        });


        // Messenger, WhatsApp, Text messages, Twitter, Telegram, Viber
        $(settings_area).on('click', '#whatsapp-twilio-btn a, #whatsapp-twilio-get-configuartion-btn a, #sms-btn a, #wechat-btn a, #twitter-callback a, #gbm-webhook a, #viber-webhook a, [data-id="line-webhook"], #messenger-path-btn a', function (e) {
            let id = $(this).closest('[id]').attr('id');
            let extra = '';
            e.preventDefault();
            if (id == 'line') {
                extra = $(this).closest('.repeater-item').find('[data-id="line-secret"]').val();
                if (!extra) {
                    return;
                } else {
                    extra = '?line_secret=' + extra;
                }
            }
            infoPanel(`<pre>${SB_URL + (id == 'sms-btn' ? '/include/api.php' : ('/apps/' + (id.includes('-') ? id.substring(0, id.indexOf('-')) : id) + '/post.php')) + extra + cloudURL().replace('&', extra ? '&' : '?')}</pre>`, 'info');
            return false;
        });

        $(settings_area).on('click', '[data-id="telegram-numbers-button"], #viber-button a, #whatsapp-360-button a', function (e) {
            let calls = { 'telegram-button': ['#telegram-token input', 'telegram-synchronization', ['result', true]], 'viber-button': ['#viber-token input', 'viber-synchronization', ['status_message', 'ok']], 'whatsapp-360-button': ['#whatsapp-360-key input', 'whatsapp-360-synchronization', ['success', true]] };
            let id = $(this).parent().attr('id');
            let token;
            let is_additional_number = false;
            if (!id) {
                let buttons = { 'telegram-numbers-button': 'telegram-button' };
                let inputs = { 'telegram-button': 'telegram-numbers-token' };
                id = buttons[$(this).attr('data-id')];
                token = $(this).closest('.repeater-item').find(`[data-id="${inputs[id]}"]`).val().trim();
                is_additional_number = true;
            } else {
                token = settings_area.find(calls[0]).val().trim();
            }
            calls = calls[id];
            e.preventDefault();
            if (!token || loading(this)) return false;
            SBF.ajax({
                function: calls[1],
                token: token,
                cloud_token: cloudURL(),
                is_additional_number: is_additional_number
            }, (response) => {
                infoPanel(calls[2][0] in response && response[calls[2][0]] == calls[2][1] ? 'Synchronization completed.' : JSON.stringify(response), 'info');
                $(this).sbLoading(false);
            });
            return false;
        });

        $(settings_area).on('click', '#whatsapp-test-template a', function (e) {
            e.preventDefault();
            let phone = $(this).parent().find('input').val();
            if (!phone || loading(this)) return;
            SBF.ajax({
                function: 'whatsapp-send-template',
                to: phone
            }, (response) => {
                infoPanel(response ? ('error' in response ? response.error.message : 'Message sent, check your WhatsApp!') : response, 'info');
                $(this).sbLoading(false);
            });
            return false;
        });

        $(settings_area).on('click', '#twitter-subscribe a', function (e) {
            e.preventDefault();
            if (loading(this)) return false;
            SBF.ajax({
                function: 'twitter-subscribe',
                cloud_token: cloudURL()
            }, (response) => {
                infoPanel(response === true ? 'Synchronization completed.' : JSON.stringify(response), 'info');
                $(this).sbLoading(false);
            });
            return false;
        });

        if (!SB_ADMIN_SETTINGS.cloud) {
            $(settings_area).on('click', '#messenger-sync-btn a', () => {
                window.open('https://board.support/synch/?service=messenger&plugin_url=' + SB_URL + cloudURL());
                return false;
            });
        }

        $(settings_area).on('change', '#messenger-sync-mode select', function () {
            SBSettings.visibility(1, $(this).val() != 'manual');
        });

        $(settings_area).on('change', '#open-ai-mode select', function () {
            SBSettings.visibility(2, $(this).val() != 'assistant');
        });

        // WordPress
        $(settings_area).on('click', '#wp-sync a', function (e) {
            e.preventDefault();
            if (loading(this)) return false;
            SBApps.wordpress.ajax('wp-sync', {}, (response) => {
                if (response === true || response === '1') {
                    SBUsers.update();
                    infoPanel('WordPress users successfully imported.', 'info');
                } else {
                    infoPanel('Error. Response: ' + JSON.stringify(response), 'info');
                }
                $(this).sbLoading(false);
            });
            return false;
        });

        $('body').on('click', '#wp-admin-bar-logout', function () {
            SBF.logout(false);
        });

        // Translations
        $(settings_area).on('click', '#tab-translations', function () {
            let nav = settings_area.find('.sb-translations > .sb-nav > ul');
            if (!nav.html()) {
                let code = '';
                for (var key in SB_LANGUAGE_CODES) {
                    if (key == 'en') continue;
                    code += `<li data-code="${key}"><img src="${SB_URL}/media/flags/${key}.png" />${SB_LANGUAGE_CODES[key]}</li>`;
                }
                nav.html(code);
            }
        });

        $(settings_area).on('click', '.sb-translations .sb-nav li', function () {
            SBSettings.translations.load($(this).data('code'));
        });

        $(settings_area).on('click', '.sb-translations .sb-menu-wide li', function () {
            settings_area.find(`.sb-translations [data-area="${$(this).data('value')}"]`).sbActive(true).siblings().sbActive(false);
        });

        $(settings_area).on('click', '.sb-add-translation', function () {
            settings_area.find('.sb-translations-list > .sb-active').prepend(`<div class="sb-input-setting sb-type-text sb-new-translation"><input type="text" placeholder="${sb_('Enter original text...')}"><input type="text" placeholder="${sb_('Enter translation...')}"></div></div>`);
        });

        $(settings_area).on('input', '.sb-search-translation input', function () {
            let search = $(this).val().toLowerCase();
            SBF.search(search, () => {
                if (search.length > 1) {
                    settings_area.find('.sb-translations .sb-content > .sb-active label').each(function () {
                        let value = $(this).html().toLowerCase();
                        if (value.includes(search) && value != temp) {
                            let scroll_area = settings_area.find('.sb-scroll-area');
                            scroll_area[0].scrollTop = 0;
                            scroll_area[0].scrollTop = $(this).position().top - 80;
                            temp = value;
                            return false;
                        }
                    });
                }
            });
        });

        // Articles
        $(articles_area).on('click', '.ul-articles li', function (e) {
            infoPanel('The changes will be lost.', 'alert', () => {
                SBArticles.show($(this).attr('data-id'));
                articles_area.find('.sb-scroll-area').scrollTop(0);
            }, false, false, false, !articles_save_required, () => {
                $(this).parent().find('li').sbActive(false);
                $(this).parent().find(`[data-id="${SBArticles.activeID()}"]`).sbActive(true);
            });
        });

        $(articles_area).on('click', '.ul-categories li', function (e) {
            SBArticles.categories.show($(this).attr('data-id'));
        });

        $(articles_area).on('click', '.sb-add-article', function () {
            SBArticles.add();
        });

        $(articles_area).on('click', '.sb-add-category', function () {
            SBArticles.categories.add();
        });

        $(articles_area).on('click', '.sb-nav i', function (e) {
            let parent = $(this).parent();
            let nav = parent.closest('ul');
            let is_category = nav.hasClass('ul-categories');
            infoPanel(`The ${is_category ? 'category' : 'article'} will be deleted permanently.`, 'alert', () => {
                let id = parent.attr('data-id');
                if (is_category) {
                    SBArticles.categories.delete(id);
                } else {
                    if (!id) {
                        return parent.remove();
                    }
                    loading(articles_content);
                    SBArticles.delete(id, (response) => {
                        articles_content.sbLoading(false);
                        if (nav.find('li').length > 1) {
                            if (parent.prev().length) {
                                parent.prev().click();
                            } else {
                                parent.next().click();
                            }
                            parent.remove();
                        }
                        editorJSDestroy();
                    });
                }
            });
            e.preventDefault();
            return false;
        });

        $(articles_area).on('click', '.sb-menu-wide li', function () {
            let type = $(this).data('type');
            if (type == 'settings') {
                SBSettings.open('articles');
            } else if (type == 'reports') {
                SBReports.open('articles-searches');
            } else {
                articles_area.attr('data-type', type);
                SBArticles.categories.update();
            }
        });

        $(articles_area).on('click', '.sb-save-articles', function () {
            if (loading(this)) return;
            if (articles_area.attr('data-type') == 'categories') {
                SBArticles.categories.save((response) => {
                    $(this).sbLoading(false);
                });
            } else {
                SBArticles.save((response) => {
                    $(this).sbLoading(false);
                });
            }
        });

        $(articles_area).on('change input', 'input, textarea, select', function () {
            articles_save_required = true;
        });

        $(articles_category_select).on('change', function () {
            if (!articles_category_parent_select.val()) {
                infoBottom('Select a parent category first.', 'error');
                $(this).val('');
            }
        });

        // Email piping manual sync
        $(settings_area).on('click', '#email-piping-sync a', function (e) {
            if (loading(this)) return;
            SBF.ajax({
                function: 'email-piping',
                force: true
            }, (response) => {
                infoPanel(response === true ? 'Syncronization completed.' : response, 'info');
                $(this).sbLoading(false);
            });
            e.preventDefault();
        });

        // Automations
        $(settings_area).on('click', '#tab-automations', function () {
            SBSettings.automations.get(() => {
                SBSettings.automations.populate();
                loadingGlobal(false);
            }, true);
            loadingGlobal();
        });

        $(automations_area).on('click', '.sb-add-condition', function () {
            SBSettings.automations.addCondition();
        });

        $(automations_area).on('change', '.sb-condition-1 select', function () {
            SBSettings.automations.updateCondition(this);
        });

        $(automations_area_select).on('click', 'li', function () {
            SBSettings.automations.populate($(this).data('value'));
        });

        $(automations_area_nav).on('click', 'li', function () {
            SBSettings.automations.show($(this).attr('data-id'));
        });

        $(automations_area).on('click', '.sb-add-automation', function () {
            SBSettings.automations.add();
        });

        $(automations_area_nav).on('click', 'li i', function () {
            infoPanel(`The automation will be deleted permanently.`, 'alert', () => {
                SBSettings.automations.delete(this);
            });
        });

        /*
        * ----------------------------------------------------------
        * Reports area
        * ----------------------------------------------------------
        */

        $(reports_area).on('click', '.sb-nav [id]', function () {
            let id = $(this).attr('id');
            SBReports.active_report = false;
            reports_area.find('#sb-date-picker').val('');
            reports_area.attr('class', 'sb-area-reports sb-active sb-report-' + id);
            SBReports.initReport($(this).attr('id'));
            if (SBF.getURL('report') != id) {
                pushState('?report=' + id);
            }
        });

        $(reports_area).on('change', '#sb-date-picker', function () {
            SBReports.initReport(false, $(this).val());
        });

        $(reports_area).on('click', '.sb-report-export', function () {
            if ($(this).sbLoading()) return;
            SBReports.export((response) => {
                $(this).sbLoading(false);
                if (response) {
                    dialogDeleteFile(response, 'sb-export-report-close', 'Report exported')
                }
            });
        });

        if (SBF.getURL('report')) {
            if (!reports_area.sbActive()) {
                header.find('.sb-admin-nav #sb-reports').click();
            }
            setTimeout(() => {
                reports_area.find('#' + SBF.getURL('report')).click()
            }, 500);
        }

        /*
        * ----------------------------------------------------------
        * Woocommerce
        * ----------------------------------------------------------
        */

        // Panel reload button
        $(conversations_area).on('click', '.sb-panel-woocommerce > i', function () {
            SBApps.woocommerce.conversationPanel();
        });

        // Get order details
        $(conversations_area).on('click', '.sb-woocommerce-orders > div > span', function (e) {
            let parent = $(this).parent();
            if (!$(e.target).is('span')) return;
            if (!parent.sbActive()) {
                SBApps.woocommerce.conversationPanelOrder(parent.attr('data-id'));
            }
        });

        // Products popup 
        $(conversations_area).on('click', '.sb-btn-woocommerce', function () {
            if (woocommerce_products_box_ul.sbLoading() || (activeUser() != false && activeUser().language != SBApps.woocommerce.popupLanguage)) {
                SBApps.woocommerce.popupPopulate();
            }
            woocommerce_products_box.find('.sb-search-btn input').val('');
            woocommerce_products_box.sbTogglePopup(this);
        });

        // Products popup pagination
        $(woocommerce_products_box).find('.sb-woocommerce-products-list').on('scroll', function () {
            if (scrollPagination(this, true)) {
                SBApps.woocommerce.popupPagination(this);
            }
        });

        // Products popup filter
        $(woocommerce_products_box).on('click', '.sb-select li', function () {
            SBApps.woocommerce.popupFilter(this);
        });

        // Products popup search
        $(woocommerce_products_box).on('input', '.sb-search-btn input', function () {
            SBApps.woocommerce.popupSearch(this);
        });

        $(woocommerce_products_box).on('click', '.sb-search-btn i', function () {
            SBF.searchClear(this, () => { SBApps.woocommerce.popupSearch($(this).next()) });
        });

        // Cart popup insert product
        $(woocommerce_products_box).on('click', '.sb-woocommerce-products-list li', function () {
            let action = woocommerce_products_box.attr('data-action');
            let id = $(this).data('id');
            if (SBF.null(action)) {
                SBChat.insertText(`{product_card id="${id}"}`);
            } else {
                woocommerce_products_box_ul.sbLoading(true);
                conversations_area.find('.sb-add-cart-btn').sbLoading(true);
                SBChat.sendMessage(-1, '', [], (response) => {
                    if (response) {
                        SBApps.woocommerce.conversationPanelUpdate(id);
                        admin.sbHideLightbox();
                    }
                }, { 'event': 'woocommerce-update-cart', 'action': 'cart-add', 'id': id });
            }
            SBF.deactivateAll();
            admin.removeClass('sb-popup-active');
        });

        // Cart add product
        $(conversations_area).on('click', '.sb-panel-woocommerce .sb-add-cart-btn', function () {
            if ($(this).sbLoading()) return;
            if (SBChat.user_online) {
                SBApps.woocommerce.popupPopulate();
                woocommerce_products_box.sbShowLightbox(true, 'cart-add');
            } else {
                infoPanel('The user is offline. Only the carts of online users can be updated.', 'info');
            }
        });

        // Cart remove product
        $(conversations_area).on('click', '.sb-panel-woocommerce .sb-list-items > a > i', function (e) {
            let id = $(this).parent().attr('data-id');
            SBChat.sendMessage(-1, '', [], () => {
                SBApps.woocommerce.conversationPanelUpdate(id, 'removed');
            }, { 'event': 'woocommerce-update-cart', 'action': 'cart-remove', 'id': id });
            $(this).sbLoading(true);
            e.preventDefault();
            return false;
        });

        // Settings
        $(settings_area).on('click', '#wc-dialogflow-synch a, #wc-dialogflow-create-intents a', function (e) {
            if (SBApps.is('dialogflow')) {
                if (loading(this)) return;
                let id = $(this).parent().attr('id');
                SBF.ajax({
                    function: 'woocommerce-dialogflow-' + (id == 'wc-dialogflow-synch' ? 'entities' : 'intents')
                }, (response) => {
                    $(this).sbLoading(false);
                    infoPanel(response ? 'Synchronization completed.' : 'Error. Something went wrong.', 'info');
                });
            } else {
                infoPanel('This feature requires the Dialogflow App. Get it from the apps area.', 'info');
            }
            e.preventDefault();
            return false;
        });

        /*
        * ----------------------------------------------------------
        * Apps functions
        * ----------------------------------------------------------
        */

        // Ump
        $(conversations_area).on('click', '.sb-panel-ump > i', function () {
            SBApps.ump.conversationPanel();
        });

        // ARMember
        $(conversations_area).on('click', '.sb-panel-armember > i', function () {
            SBApps.armember.conversationPanel();
        });

        // OpenCart
        $(conversations_area).on('click', '.sb-panel-opencart > i', function () {
            SBApps.opencart.conversationPanel();
        });

        $(conversations_area).on('click', '.sb-opencart-orders > a', function () {
            SBApps.opencart.openOrder($(this).attr('data-id'));
        });

        $(settings_area).on('click', '#opencart-sync a', function (e) {
            e.preventDefault();
            if (loading(this)) return;
            SBF.ajax({
                function: 'opencart-sync'
            }, (response) => {
                $(this).sbLoading(false);
                infoPanel(response === true ? 'Users successfully imported.' : response, 'info');
            });
        });

        // Perfex, whmcs, aecommerce
        $(settings_area).on('click', '#perfex-sync a, #whmcs-sync a, #perfex-articles-sync a, #whmcs-articles-sync a, #aecommerce-sync a, #aecommerce-sync-admins a, #aecommerce-sync-sellers a, #martfury-sync a, #martfury-sync-sellers a', function (e) {
            if (loading(this)) return;
            let function_name = $(this).closest('[id]').attr('id');
            let articles = function_name.indexOf('article') > 0;
            SBF.ajax({
                function: function_name
            }, (response) => {
                if (response === true) {
                    if (!articles) {
                        SBUsers.update();
                    }
                    infoPanel(articles ? 'Articles successfully imported.' : 'Users successfully imported.', 'info');
                } else {
                    infoPanel('Error. Response: ' + JSON.stringify(response), 'info');
                }
                $(this).sbLoading(false);
            });
            e.preventDefault();
        });

        // Zendesk
        $(conversations_area).on('click', '#sb-zendesk-btn', function (e) {
            if (loading(this)) return;
            SBF.ajax({
                function: 'zendesk-create-ticket',
                conversation_id: SBChat.conversation.id
            }, (response) => {
                if (response === true) {
                    SBApps.zendesk.conversationPanel();
                } else {
                    infoPanel('Error. Response: ' + JSON.stringify(response), 'info');
                }
                $(this).sbLoading(false);
            });
            e.preventDefault();
        });

        $(conversations_area).on('click', '#sb-zendesk-update-ticket', function (e) {
            if (loading(this)) return;
            SBF.ajax({
                function: 'zendesk-update-ticket',
                conversation_id: SBChat.conversation.id,
                zendesk_ticket_id: $(this).closest('[data-id]').attr('data-id')
            }, () => {
                $(this).sbLoading(false);
            });
            e.preventDefault();
            return false;
        });

        /*
        * ----------------------------------------------------------
        * Miscellaneous
        * ----------------------------------------------------------
        */

        // Language switcher
        $(admin).on('click', '.sb-language-switcher > i', function () {
            let switcher = $(this).parent();
            let active_languages = switcher.find('[data-language]').map(function () { return $(this).attr('data-language') }).get();
            let code = '';
            active_languages.push('en');
            for (var key in SB_LANGUAGE_CODES) {
                if (!active_languages.includes(key)) {
                    code += `<div data-language="${key}"><img src="${SB_URL}/media/flags/${key}.png" />${sb_(SB_LANGUAGE_CODES[key])}</div>`;
                }
            }
            language_switcher_target = switcher;
            SBAdmin.genericPanel('languages', 'Choose a language', code, [], ' data-source="' + switcher.attr('data-source') + '"', true);
        });

        $(admin).on('click', '.sb-language-switcher img', function () {
            let item = $(this).parent();
            let active = item.sbActive();
            let language = active ? false : item.attr('data-language');
            switch (item.parent().attr('data-source')) {
                case 'article-categories':
                    SBArticles.categories.show(SBArticles.categories.activeID(), language);
                    break;
                case 'articles':
                    let previous_active = articles_content.find('.sb-language-switcher .sb-active');
                    infoPanel('The changes will be lost.', 'alert', () => {
                        let id = item.attr('data-id');
                        if (!id && !active) {
                            SBArticles.clear();
                        } else {
                            SBArticles.show(id && !active ? id : SBArticles.activeID(true));
                        }
                    }, false, false, false, !articles_save_required, () => {
                        item.sbActive(false);
                        previous_active.sbActive(true);
                    });
                    break;
                case 'automations':
                    SBSettings.automations.show(false, language);
                    break;
                case 'settings':
                    let active_language = item.parent().find('[data-language].sb-active');
                    SBSettings.translations.save(item, active ? item.attr('data-language') : (active_language.length ? active_language.attr('data-language') : false));
                    SBSettings.translations.activate(item, language);
                    break;
            }
            item.siblings().sbActive(false);
            item.sbActive(!active);
        });

        $(admin).on('click', '.sb-language-switcher span > i', function () {
            let item = $(this).parent();
            let language = item.attr('data-language');
            infoPanel(sb_('The {T} translation will be deleted.').replace('{T}', sb_(SB_LANGUAGE_CODES[language])), 'alert', () => {
                switch (item.parent().attr('data-source')) {
                    case 'article-categories':
                        SBArticles.categories.translations.delete(language);
                        break;
                    case 'articles':
                        SBArticles.translations.delete(language);
                        break;
                    case 'automations':
                        SBSettings.automations.deleteTranslation(false, language);
                        SBSettings.automations.show();
                        break;
                    case 'settings':
                        SBSettings.translations.delete(item, language);
                        break;
                }
                item.remove();
            });
        });

        $(admin).on('click', '.sb-languages-box [data-language]', function () {
            let box = $(this).parents().eq(1);
            let language = $(this).attr('data-language');
            let hide = true;
            switch (box.attr('data-source')) {
                case 'article-categories':
                    SBArticles.categories.translations.add(language);
                    break;
                case 'articles':
                    infoPanel('The changes will be lost.', 'alert', () => {
                        SBArticles.translations.add(language);
                        admin.sbHideLightbox();
                    }, false, false, false, !articles_save_required);
                    hide = false;
                    break;
                case 'automations':
                    SBSettings.automations.addTranslation(false, false, language);
                    SBSettings.automations.show(false, language);
                    break;
                case 'settings':
                    SBSettings.translations.add(language);
                    break;
            }
            if (hide) {
                admin.sbHideLightbox();
            }
        });

        // Lightbox
        $(admin).on('click', '.sb-lightbox .sb-top-bar .sb-close', function () {
            admin.sbHideLightbox();
        });

        $(admin).on('click', '.sb-lightbox .sb-info', function () {
            $(this).sbActive(false);
        });

        // Alert and information box
        $(admin).on('click', '.sb-dialog-box a', function () {
            let lightbox = $(this).closest('.sb-lightbox');
            if ($(this).hasClass('sb-confirm')) {
                alertOnConfirmation();
            }
            if ($(this).hasClass('sb-cancel') && alertOnCancel) {
                alertOnCancel();
            }
            if (admin.find('.sb-lightbox.sb-active').length == 1) {
                overlay.sbActive(false);
            }
            SBAdmin.open_popup = false;
            lightbox.sbActive(false);
        });

        $(admin).on('click', '.sb-menu-wide li, .sb-nav li', function () {
            $(this).siblings().sbActive(false);
            $(this).sbActive(true);
        });

        $(admin).on('click', '.sb-nav:not(.sb-nav-only) li:not(.sb-tab-nav-title)', function () {
            let area = $(this).closest('.sb-tab');
            let tab = $(area).find(' > .sb-content > div').sbActive(false).eq($(this).parent().find('li:not(.sb-tab-nav-title)').index(this));
            tab.sbActive(true);
            tab.find('textarea').each(function () {
                $(this).autoExpandTextarea();
                $(this).manualExpandTextarea();
            });
            area.find('.sb-scroll-area').scrollTop(0);
        });

        $(admin).sbInitTooltips();

        $(admin).on('click', '[data-button="toggle"]', function () {
            let show = admin.find('.' + $(this).data('show'));
            let hide = admin.find('.' + $(this).data('hide'));
            show.addClass('sb-show-animation').show();
            hide.hide();
            SBAdmin.open_popup = show.hasClass('sb-lightbox') || show.hasClass('sb-popup') ? show : false;
        });

        $(admin).on('click', '.sb-info-card', function () {
            $(this).sbActive(false);
        });

        $(admin).on('change', '.sb-upload-form-admin .sb-upload-files', function () {
            $(upload_target).sbLoading($(this).prop('files').length);
            $(this).sbUploadFiles((response) => {
                $(upload_target).sbLoading(false);
                response = JSON.parse(response);
                if (response[0] == 'success') {
                    let type = $(upload_target).closest('[data-type]').data('type');
                    if (type == 'upload-image') {
                        if ($(upload_target).attr('data-value')) {
                            SBF.ajax({ function: 'delete-file', path: $(upload_target).attr('data-value') });
                        }
                        $(upload_target).attr('data-value', response[1]).css('background-image', `url("${response[1]}")`);
                    }
                    if (type == 'upload-file') {
                        let input = $(upload_target).parent().find('input');
                        if (input.val()) {
                            SBF.ajax({ function: 'delete-file', path: input.val() });
                        }
                        input.val(response[1]);
                    }
                    if (upload_on_success) {
                        upload_on_success(response[1]);
                    }
                } else {
                    console.log(response[1]);
                }
            });
        });

        $(admin).on('click', '.sb-accordion > div > span', function (e) {
            let parent = $(this).parent();
            let active = $(parent).sbActive();
            if (!$(e.target).is('span')) return;
            parent.siblings().sbActive(false);
            parent.sbActive(!active);
        });

        $(admin).on('mousedown', function (e) {
            if ($(SBAdmin.open_popup).length) {
                let popup = $(SBAdmin.open_popup);
                if (!popup.is(e.target) && popup.has(e.target).length === 0 && !['sb-btn-saved-replies', 'sb-btn-emoji', 'sb-btn-woocommerce', 'sb-btn-open-ai'].includes($(e.target).attr('class'))) {
                    if (popup.hasClass('sb-popup')) {
                        popup.sbTogglePopup();
                    } else if (popup.hasClass('sb-select')) {
                        popup.find('ul').sbActive(false);
                    } else if (popup.hasClass('sb-menu-mobile')) {
                        popup.find('i').sbActive(false);
                    } else if (popup.hasClass('sb-menu')) {
                        popup.sbActive(false);
                    } else if (!SBAdmin.open_popup || !['sb-embeddings-box'].includes(SBAdmin.open_popup.attr('id'))) {
                        admin.sbHideLightbox();
                    }
                    SBAdmin.open_popup = false;
                }
            }
        });
    });

    function initialization() {
        SBF.ajax({
            function: 'get-conversations'
        }, (response) => {
            if (!response.length) {
                conversations_area.find('.sb-board').addClass('sb-no-conversation');
            }
            SBConversations.populateList(response);
            if (responsive) {
                conversations_area.find('.sb-admin-list').sbActive(true);
            }
            if (SBF.getURL('conversation')) {
                if (!conversations_area.sbActive()) {
                    header.find('.sb-admin-nav #sb-conversations').click();
                }
                SBConversations.openConversation(SBF.getURL('conversation'));
            } else if (!responsive && !SBF.getURL('user') && !SBF.getURL('setting') && !SBF.getURL('report') && (!SBF.getURL('area') || SBF.getURL('area') == 'conversations')) {
                SBConversations.clickFirst();
            }
            SBConversations.startRealTime();
            SBConversations.datetime_last_conversation = SB_ADMIN_SETTINGS.now_db;
            loadingGlobal(false);
        });
        SBF.serviceWorker.init();
        if (SB_ADMIN_SETTINGS.push_notifications) {
            SBF.serviceWorker.initPushNotifications();
        }
        setInterval(function () {
            SBF.ajax({
                function: 'get-active-user',
                db: true
            }, (response) => {
                if (!response) SBF.reset();
            });
        }, 3600000);
    }
}(jQuery));

// tinyColorPicker v1.1.1 2016-08-30 

!function (a, b) { "object" == typeof exports ? module.exports = b(a) : "function" == typeof define && define.amd ? define("colors", [], function () { return b(a) }) : a.Colors = b(a) }(this, function (a, b) { "use strict"; function c(a, c, d, f, g) { if ("string" == typeof c) { var c = v.txt2color(c); d = c.type, p[d] = c[d], g = g !== b ? g : c.alpha } else if (c) for (var h in c) a[d][h] = k(c[h] / l[d][h][1], 0, 1); return g !== b && (a.alpha = k(+g, 0, 1)), e(d, f ? a : b) } function d(a, b, c) { var d = o.options.grey, e = {}; return e.RGB = { r: a.r, g: a.g, b: a.b }, e.rgb = { r: b.r, g: b.g, b: b.b }, e.alpha = c, e.equivalentGrey = n(d.r * a.r + d.g * a.g + d.b * a.b), e.rgbaMixBlack = i(b, { r: 0, g: 0, b: 0 }, c, 1), e.rgbaMixWhite = i(b, { r: 1, g: 1, b: 1 }, c, 1), e.rgbaMixBlack.luminance = h(e.rgbaMixBlack, !0), e.rgbaMixWhite.luminance = h(e.rgbaMixWhite, !0), o.options.customBG && (e.rgbaMixCustom = i(b, o.options.customBG, c, 1), e.rgbaMixCustom.luminance = h(e.rgbaMixCustom, !0), o.options.customBG.luminance = h(o.options.customBG, !0)), e } function e(a, b) { var c, e, k, q = b || p, r = v, s = o.options, t = l, u = q.RND, w = "", x = "", y = { hsl: "hsv", rgb: a }, z = u.rgb; if ("alpha" !== a) { for (var A in t) if (!t[A][A]) { a !== A && (x = y[A] || "rgb", q[A] = r[x + "2" + A](q[x])), u[A] || (u[A] = {}), c = q[A]; for (w in c) u[A][w] = n(c[w] * t[A][w][1]) } z = u.rgb, q.HEX = r.RGB2HEX(z), q.equivalentGrey = s.grey.r * q.rgb.r + s.grey.g * q.rgb.g + s.grey.b * q.rgb.b, q.webSave = e = f(z, 51), q.webSmart = k = f(z, 17), q.saveColor = z.r === e.r && z.g === e.g && z.b === e.b ? "web save" : z.r === k.r && z.g === k.g && z.b === k.b ? "web smart" : "", q.hueRGB = v.hue2RGB(q.hsv.h), b && (q.background = d(z, q.rgb, q.alpha)) } var B, C, D, E = q.rgb, F = q.alpha, G = "luminance", H = q.background; return B = i(E, { r: 0, g: 0, b: 0 }, F, 1), B[G] = h(B, !0), q.rgbaMixBlack = B, C = i(E, { r: 1, g: 1, b: 1 }, F, 1), C[G] = h(C, !0), q.rgbaMixWhite = C, s.customBG && (D = i(E, H.rgbaMixCustom, F, 1), D[G] = h(D, !0), D.WCAG2Ratio = j(D[G], H.rgbaMixCustom[G]), q.rgbaMixBGMixCustom = D, D.luminanceDelta = m.abs(D[G] - H.rgbaMixCustom[G]), D.hueDelta = g(H.rgbaMixCustom, D, !0)), q.RGBLuminance = h(z), q.HUELuminance = h(q.hueRGB), s.convertCallback && s.convertCallback(q, a), q } function f(a, b) { var c = {}, d = 0, e = b / 2; for (var f in a) d = a[f] % b, c[f] = a[f] + (d > e ? b - d : -d); return c } function g(a, b, c) { return (m.max(a.r - b.r, b.r - a.r) + m.max(a.g - b.g, b.g - a.g) + m.max(a.b - b.b, b.b - a.b)) * (c ? 255 : 1) / 765 } function h(a, b) { for (var c = b ? 1 : 255, d = [a.r / c, a.g / c, a.b / c], e = o.options.luminance, f = d.length; f--;)d[f] = d[f] <= .03928 ? d[f] / 12.92 : m.pow((d[f] + .055) / 1.055, 2.4); return e.r * d[0] + e.g * d[1] + e.b * d[2] } function i(a, c, d, e) { var f = {}, g = d !== b ? d : 1, h = e !== b ? e : 1, i = g + h * (1 - g); for (var j in a) f[j] = (a[j] * g + c[j] * h * (1 - g)) / i; return f.a = i, f } function j(a, b) { var c = 1; return c = a >= b ? (a + .05) / (b + .05) : (b + .05) / (a + .05), n(100 * c) / 100 } function k(a, b, c) { return a > c ? c : b > a ? b : a } var l = { rgb: { r: [0, 255], g: [0, 255], b: [0, 255] }, hsv: { h: [0, 360], s: [0, 100], v: [0, 100] }, hsl: { h: [0, 360], s: [0, 100], l: [0, 100] }, alpha: { alpha: [0, 1] }, HEX: { HEX: [0, 16777215] } }, m = a.Math, n = m.round, o = {}, p = {}, q = { r: .298954, g: .586434, b: .114612 }, r = { r: .2126, g: .7152, b: .0722 }, s = function (a) { this.colors = { RND: {} }, this.options = { color: "rgba(0,0,0,0)", grey: q, luminance: r, valueRanges: l }, t(this, a || {}) }, t = function (a, d) { var e, f = a.options; u(a); for (var g in d) d[g] !== b && (f[g] = d[g]); e = f.customBG, f.customBG = "string" == typeof e ? v.txt2color(e).rgb : e, p = c(a.colors, f.color, b, !0) }, u = function (a) { o !== a && (o = a, p = a.colors) }; s.prototype.setColor = function (a, d, f) { return u(this), a ? c(this.colors, a, d, b, f) : (f !== b && (this.colors.alpha = k(f, 0, 1)), e(d)) }, s.prototype.setCustomBackground = function (a) { return u(this), this.options.customBG = "string" == typeof a ? v.txt2color(a).rgb : a, c(this.colors, b, "rgb") }, s.prototype.saveAsBackground = function () { return u(this), c(this.colors, b, "rgb", !0) }, s.prototype.toString = function (a, b) { return v.color2text((a || "rgb").toLowerCase(), this.colors, b) }; var v = { txt2color: function (a) { var b = {}, c = a.replace(/(?:#|\)|%)/g, "").split("("), d = (c[1] || "").split(/,\s*/), e = c[1] ? c[0].substr(0, 3) : "rgb", f = ""; if (b.type = e, b[e] = {}, c[1]) for (var g = 3; g--;)f = e[g] || e.charAt(g), b[e][f] = +d[g] / l[e][f][1]; else b.rgb = v.HEX2rgb(c[0]); return b.alpha = d[3] ? +d[3] : 1, b }, color2text: function (a, b, c) { var d = c !== !1 && n(100 * b.alpha) / 100, e = "number" == typeof d && c !== !1 && (c || 1 !== d), f = b.RND.rgb, g = b.RND.hsl, h = "hex" === a && e, i = "hex" === a && !h, j = "rgb" === a || h, k = j ? f.r + ", " + f.g + ", " + f.b : i ? "#" + b.HEX : g.h + ", " + g.s + "%, " + g.l + "%"; return i ? k : (h ? "rgb" : a) + (e ? "a" : "") + "(" + k + (e ? ", " + d : "") + ")" }, RGB2HEX: function (a) { return ((a.r < 16 ? "0" : "") + a.r.toString(16) + (a.g < 16 ? "0" : "") + a.g.toString(16) + (a.b < 16 ? "0" : "") + a.b.toString(16)).toUpperCase() }, HEX2rgb: function (a) { return a = a.split(""), { r: +("0x" + a[0] + a[a[3] ? 1 : 0]) / 255, g: +("0x" + a[a[3] ? 2 : 1] + (a[3] || a[1])) / 255, b: +("0x" + (a[4] || a[2]) + (a[5] || a[2])) / 255 } }, hue2RGB: function (a) { var b = 6 * a, c = ~~b % 6, d = 6 === b ? 0 : b - c; return { r: n(255 * [1, 1 - d, 0, 0, d, 1][c]), g: n(255 * [d, 1, 1, 1 - d, 0, 0][c]), b: n(255 * [0, 0, d, 1, 1, 1 - d][c]) } }, rgb2hsv: function (a) { var b, c, d, e = a.r, f = a.g, g = a.b, h = 0; return g > f && (f = g + (g = f, 0), h = -1), c = g, f > e && (e = f + (f = e, 0), h = -2 / 6 - h, c = m.min(f, g)), b = e - c, d = e ? b / e : 0, { h: 1e-15 > d ? p && p.hsl && p.hsl.h || 0 : b ? m.abs(h + (f - g) / (6 * b)) : 0, s: e ? b / e : p && p.hsv && p.hsv.s || 0, v: e } }, hsv2rgb: function (a) { var b = 6 * a.h, c = a.s, d = a.v, e = ~~b, f = b - e, g = d * (1 - c), h = d * (1 - f * c), i = d * (1 - (1 - f) * c), j = e % 6; return { r: [d, h, g, g, i, d][j], g: [i, d, d, h, g, g][j], b: [g, g, i, d, d, h][j] } }, hsv2hsl: function (a) { var b = (2 - a.s) * a.v, c = a.s * a.v; return c = a.s ? 1 > b ? b ? c / b : 0 : c / (2 - b) : 0, { h: a.h, s: a.v || c ? c : p && p.hsl && p.hsl.s || 0, l: b / 2 } }, rgb2hsl: function (a, b) { var c = v.rgb2hsv(a); return v.hsv2hsl(b ? c : p.hsv = c) }, hsl2rgb: function (a) { var b = 6 * a.h, c = a.s, d = a.l, e = .5 > d ? d * (1 + c) : d + c - c * d, f = d + d - e, g = e ? (e - f) / e : 0, h = ~~b, i = b - h, j = e * g * i, k = f + j, l = e - j, m = h % 6; return { r: [e, l, f, f, k, e][m], g: [k, e, e, l, f, f][m], b: [f, f, k, e, e, l][m] } } }; return s }), function (a, b) { "object" == typeof exports ? module.exports = b(a, require("jquery"), require("colors")) : "function" == typeof define && define.amd ? define(["jquery", "colors"], function (c, d) { return b(a, c, d) }) : b(a, a.jQuery, a.Colors) }(this, function (a, b, c, d) { "use strict"; function e(a) { return a.value || a.getAttribute("value") || b(a).css("background-color") || "#FFF" } function f(a) { return a = a.originalEvent && a.originalEvent.touches ? a.originalEvent.touches[0] : a, a.originalEvent ? a.originalEvent : a } function g(a) { return b(a.find(r.doRender)[0] || a[0]) } function h(c) { var d = b(this), f = d.offset(), h = b(a), k = r.gap; c ? (s = g(d), s._colorMode = s.data("colorMode"), p.$trigger = d, (t || i()).css(r.positionCallback.call(p, d) || { left: (t._left = f.left) - ((t._left += t._width - (h.scrollLeft() + h.width())) + k > 0 ? t._left + k : 0), top: (t._top = f.top + d.outerHeight()) - ((t._top += t._height - (h.scrollTop() + h.height())) + k > 0 ? t._top + k : 0) }).show(r.animationSpeed, function () { c !== !0 && (y.toggle(!!r.opacity)._width = y.width(), v._width = v.width(), v._height = v.height(), u._height = u.height(), q.setColor(e(s[0])), n(!0)) }).off(".tcp").on(D, ".cp-xy-slider,.cp-z-slider,.cp-alpha", j)) : p.$trigger && b(t).hide(r.animationSpeed, function () { n(!1), p.$trigger = null }).off(".tcp") } function i() { return b("head")[r.cssPrepend ? "prepend" : "append"]('<style type="text/css" id="tinyColorPickerStyles">' + (r.css || I) + (r.cssAddon || "") + "</style>"), b(H).css({ margin: r.margin }).appendTo("body").show(0, function () { p.$UI = t = b(this), F = r.GPU && t.css("perspective") !== d, u = b(".cp-z-slider", this), v = b(".cp-xy-slider", this), w = b(".cp-xy-cursor", this), x = b(".cp-z-cursor", this), y = b(".cp-alpha", this), z = b(".cp-alpha-cursor", this), r.buildCallback.call(p, t), t.prepend("<div>").children().eq(0).css("width", t.children().eq(0).width()), t._width = this.offsetWidth, t._height = this.offsetHeight }).hide() } function j(a) { var c = this.className.replace(/cp-(.*?)(?:\s*|$)/, "$1").replace("-", "_"); (a.button || a.which) > 1 || (a.preventDefault && a.preventDefault(), a.returnValue = !1, s._offset = b(this).offset(), (c = "xy_slider" === c ? k : "z_slider" === c ? l : m)(a), n(), A.on(E, function () { A.off(".tcp") }).on(C, function (a) { c(a), n() })) } function k(a) { var b = f(a), c = b.pageX - s._offset.left, d = b.pageY - s._offset.top; q.setColor({ s: c / v._width * 100, v: 100 - d / v._height * 100 }, "hsv") } function l(a) { var b = f(a).pageY - s._offset.top; q.setColor({ h: 360 - b / u._height * 360 }, "hsv") } function m(a) { var b = f(a).pageX - s._offset.left, c = b / y._width; q.setColor({}, "rgb", c) } function n(a) { var b = q.colors, c = b.hueRGB, e = (b.RND.rgb, b.RND.hsl, r.dark), f = r.light, g = q.toString(s._colorMode, r.forceAlpha), h = b.HUELuminance > .22 ? e : f, i = b.rgbaMixBlack.luminance > .22 ? e : f, j = (1 - b.hsv.h) * u._height, k = b.hsv.s * v._width, l = (1 - b.hsv.v) * v._height, m = b.alpha * y._width, n = F ? "translate3d" : "", p = s[0].value, t = s[0].hasAttribute("value") && "" === p && a !== d; v._css = { backgroundColor: "rgb(" + c.r + "," + c.g + "," + c.b + ")" }, w._css = { transform: n + "(" + k + "px, " + l + "px, 0)", left: F ? "" : k, top: F ? "" : l, borderColor: b.RGBLuminance > .22 ? e : f }, x._css = { transform: n + "(0, " + j + "px, 0)", top: F ? "" : j, borderColor: "transparent " + h }, y._css = { backgroundColor: "#" + b.HEX }, z._css = { transform: n + "(" + m + "px, 0, 0)", left: F ? "" : m, borderColor: i + " transparent" }, s._css = { backgroundColor: t ? "" : g, color: t ? "" : b.rgbaMixBGMixCustom.luminance > .22 ? e : f }, s.text = t ? "" : p !== g ? g : "", a !== d ? o(a) : G(o) } function o(a) { v.css(v._css), w.css(w._css), x.css(x._css), y.css(y._css), z.css(z._css), r.doRender && s.css(s._css), s.text && s.val(s.text), r.renderCallback.call(p, s, "boolean" == typeof a ? a : d) } var p, q, r, s, t, u, v, w, x, y, z, A = b(document), B = b(), C = "touchmove.tcp mousemove.tcp pointermove.tcp", D = "touchstart.tcp mousedown.tcp pointerdown.tcp", E = "touchend.tcp mouseup.tcp pointerup.tcp", F = !1, G = a.requestAnimationFrame || a.webkitRequestAnimationFrame || function (a) { a() }, H = '<div class="cp-color-picker"><div class="cp-z-slider"><div class="cp-z-cursor"></div></div><div class="cp-xy-slider"><div class="cp-white"></div><div class="cp-xy-cursor"></div></div><div class="cp-alpha"><div class="cp-alpha-cursor"></div></div></div>', I = ".cp-color-picker{position:absolute;overflow:hidden;padding:6px 6px 0;background-color:#444;color:#bbb;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:400;cursor:default;border-radius:5px}.cp-color-picker>div{position:relative;overflow:hidden}.cp-xy-slider{float:left;height:128px;width:128px;margin-bottom:6px;background:linear-gradient(to right,#FFF,rgba(255,255,255,0))}.cp-white{height:100%;width:100%;background:linear-gradient(rgba(0,0,0,0),#000)}.cp-xy-cursor{position:absolute;top:0;width:10px;height:10px;margin:-5px;border:1px solid #fff;border-radius:100%;box-sizing:border-box}.cp-z-slider{float:right;margin-left:6px;height:128px;width:20px;background:linear-gradient(red 0,#f0f 17%,#00f 33%,#0ff 50%,#0f0 67%,#ff0 83%,red 100%)}.cp-z-cursor{position:absolute;margin-top:-4px;width:100%;border:4px solid #fff;border-color:transparent #fff;box-sizing:border-box}.cp-alpha{clear:both;width:100%;height:16px;margin:6px 0;background:linear-gradient(to right,#444,rgba(0,0,0,0))}.cp-alpha-cursor{position:absolute;margin-left:-4px;height:100%;border:4px solid #fff;border-color:#fff transparent;box-sizing:border-box}", J = function (a) { q = this.color = new c(a), r = q.options, p = this }; J.prototype = { render: n, toggle: h }, b.fn.colorPicker = function (c) { var d = this, f = function () { }; return c = b.extend({ animationSpeed: 150, GPU: !0, doRender: !0, customBG: "#FFF", opacity: !0, renderCallback: f, buildCallback: f, positionCallback: f, body: document.body, scrollResize: !0, gap: 4, dark: "#222", light: "#DDD" }, c), !p && c.scrollResize && b(a).on("resize.tcp scroll.tcp", function () { p.$trigger && p.toggle.call(p.$trigger[0], !0) }), B = B.add(this), this.colorPicker = p || new J(c), this.options = c, b(c.body).off(".tcp").on(D, function (a) { -1 === B.add(t).add(b(t).find(a.target)).index(a.target) && h() }), this.on("focusin.tcp click.tcp", function (a) { p.color.options = b.extend(p.color.options, r = d.options), h.call(this, a) }).on("change.tcp", function () { q.setColor(this.value || "#FFF"), d.colorPicker.render(!0) }).each(function () { var a = e(this), d = a.split("("), f = g(b(this)); f.data("colorMode", d[1] ? d[0].substr(0, 3) : "HEX").attr("readonly", r.preventFocus), c.doRender && f.css({ "background-color": a, color: function () { return q.setColor(a).rgbaMixBGMixCustom.luminance > .22 ? c.dark : c.light } }) }) }, b.fn.colorPicker.destroy = function () { b("*").off(".tcp"), p.toggle(!1), B = b() } });