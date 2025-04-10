(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// Import the Vapi module
const VapiModule = require('./dist/vapi');

// Check what's being exported and handle it appropriately
if (typeof VapiModule === 'object') {
  // If it's an object with a default export
  if (VapiModule.default) {
    window.Vapi = VapiModule.default;
  } 
  // If it exports a named Vapi class
  else if (VapiModule.Vapi) {
    window.Vapi = VapiModule.Vapi;
  }
  // Otherwise expose the entire module
  else {
    window.Vapi = VapiModule;
  }
} else {
  // If it's a function or class, expose directly
  window.Vapi = VapiModule;
} 
},{"./dist/vapi":4}],2:[function(require,module,exports){
"use strict";
/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Api = exports.HttpClient = exports.ContentType = void 0;
var ContentType;
(function (ContentType) {
    ContentType["Json"] = "application/json";
    ContentType["FormData"] = "multipart/form-data";
    ContentType["UrlEncoded"] = "application/x-www-form-urlencoded";
    ContentType["Text"] = "text/plain";
})(ContentType || (exports.ContentType = ContentType = {}));
class HttpClient {
    baseUrl = 'https://api.vapi.ai';
    securityData = null;
    securityWorker;
    abortControllers = new Map();
    customFetch = (...fetchParams) => fetch(...fetchParams);
    baseApiParams = {
        credentials: 'same-origin',
        headers: {},
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
    };
    constructor(apiConfig = {}) {
        Object.assign(this, apiConfig);
    }
    setSecurityData = (data) => {
        this.securityData = data;
    };
    encodeQueryParam(key, value) {
        const encodedKey = encodeURIComponent(key);
        return `${encodedKey}=${encodeURIComponent(typeof value === 'number' ? value : `${value}`)}`;
    }
    addQueryParam(query, key) {
        return this.encodeQueryParam(key, query[key]);
    }
    addArrayQueryParam(query, key) {
        const value = query[key];
        return value.map((v) => this.encodeQueryParam(key, v)).join('&');
    }
    toQueryString(rawQuery) {
        const query = rawQuery || {};
        const keys = Object.keys(query).filter((key) => 'undefined' !== typeof query[key]);
        return keys
            .map((key) => Array.isArray(query[key])
            ? this.addArrayQueryParam(query, key)
            : this.addQueryParam(query, key))
            .join('&');
    }
    addQueryParams(rawQuery) {
        const queryString = this.toQueryString(rawQuery);
        return queryString ? `?${queryString}` : '';
    }
    contentFormatters = {
        [ContentType.Json]: (input) => input !== null && (typeof input === 'object' || typeof input === 'string')
            ? JSON.stringify(input)
            : input,
        [ContentType.Text]: (input) => input !== null && typeof input !== 'string' ? JSON.stringify(input) : input,
        [ContentType.FormData]: (input) => Object.keys(input || {}).reduce((formData, key) => {
            const property = input[key];
            formData.append(key, property instanceof Blob
                ? property
                : typeof property === 'object' && property !== null
                    ? JSON.stringify(property)
                    : `${property}`);
            return formData;
        }, new FormData()),
        [ContentType.UrlEncoded]: (input) => this.toQueryString(input),
    };
    mergeRequestParams(params1, params2) {
        return {
            ...this.baseApiParams,
            ...params1,
            ...(params2 || {}),
            headers: {
                ...(this.baseApiParams.headers || {}),
                ...(params1.headers || {}),
                ...((params2 && params2.headers) || {}),
            },
        };
    }
    createAbortSignal = (cancelToken) => {
        if (this.abortControllers.has(cancelToken)) {
            const abortController = this.abortControllers.get(cancelToken);
            if (abortController) {
                return abortController.signal;
            }
            return void 0;
        }
        const abortController = new AbortController();
        this.abortControllers.set(cancelToken, abortController);
        return abortController.signal;
    };
    abortRequest = (cancelToken) => {
        const abortController = this.abortControllers.get(cancelToken);
        if (abortController) {
            abortController.abort();
            this.abortControllers.delete(cancelToken);
        }
    };
    request = async ({ body, secure, path, type, query, format, baseUrl, cancelToken, ...params }) => {
        const secureParams = ((typeof secure === 'boolean' ? secure : this.baseApiParams.secure) &&
            this.securityWorker &&
            (await this.securityWorker(this.securityData))) ||
            {};
        const requestParams = this.mergeRequestParams(params, secureParams);
        const queryString = query && this.toQueryString(query);
        const payloadFormatter = this.contentFormatters[type || ContentType.Json];
        const responseFormat = format || requestParams.format;
        return this.customFetch(`${baseUrl || this.baseUrl || ''}${path}${queryString ? `?${queryString}` : ''}`, {
            ...requestParams,
            headers: {
                ...(requestParams.headers || {}),
                ...(type && type !== ContentType.FormData ? { 'Content-Type': type } : {}),
            },
            signal: (cancelToken ? this.createAbortSignal(cancelToken) : requestParams.signal) || null,
            body: typeof body === 'undefined' || body === null ? null : payloadFormatter(body),
        }).then(async (response) => {
            const r = response;
            r.data = null;
            r.error = null;
            const data = !responseFormat
                ? r
                : await response[responseFormat]()
                    .then((data) => {
                    if (r.ok) {
                        r.data = data;
                    }
                    else {
                        r.error = data;
                    }
                    return r;
                })
                    .catch((e) => {
                    r.error = e;
                    return r;
                });
            if (cancelToken) {
                this.abortControllers.delete(cancelToken);
            }
            if (!response.ok)
                throw data;
            return data;
        });
    };
}
exports.HttpClient = HttpClient;
/**
 * @title Vapi API
 * @version 1.0
 * @baseUrl https://api.vapi.ai
 * @contact
 *
 * Voice AI for developers.
 */
class Api extends HttpClient {
    call = {
        /**
         * No description
         *
         * @tags Calls
         * @name CallControllerCreate
         * @summary Create Call
         * @request POST:/call
         * @secure
         */
        callControllerCreate: (data, params = {}) => this.request({
            path: `/call`,
            method: 'POST',
            body: data,
            secure: true,
            type: ContentType.Json,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Calls
         * @name CallControllerFindAll
         * @summary List Calls
         * @request GET:/call
         * @secure
         */
        callControllerFindAll: (query, params = {}) => this.request({
            path: `/call`,
            method: 'GET',
            query: query,
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Calls
         * @name CallControllerFindOne
         * @summary Get Call
         * @request GET:/call/{id}
         * @secure
         */
        callControllerFindOne: (id, params = {}) => this.request({
            path: `/call/${id}`,
            method: 'GET',
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Calls
         * @name CallControllerUpdate
         * @summary Update Call
         * @request PATCH:/call/{id}
         * @secure
         */
        callControllerUpdate: (id, data, params = {}) => this.request({
            path: `/call/${id}`,
            method: 'PATCH',
            body: data,
            secure: true,
            type: ContentType.Json,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Calls
         * @name CallControllerDeleteCallData
         * @summary Delete Call Data
         * @request DELETE:/call/{id}
         * @secure
         */
        callControllerDeleteCallData: (id, params = {}) => this.request({
            path: `/call/${id}`,
            method: 'DELETE',
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Calls
         * @name CallControllerCreatePhoneCall
         * @summary Create Phone Call
         * @request POST:/call/phone
         * @deprecated
         * @secure
         */
        callControllerCreatePhoneCall: (data, params = {}) => this.request({
            path: `/call/phone`,
            method: 'POST',
            body: data,
            secure: true,
            type: ContentType.Json,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Calls
         * @name CallControllerCreateWebCall
         * @summary Create Web Call
         * @request POST:/call/web
         * @secure
         */
        callControllerCreateWebCall: (data, params = {}) => this.request({
            path: `/call/web`,
            method: 'POST',
            body: data,
            secure: true,
            type: ContentType.Json,
            format: 'json',
            ...params,
        }),
    };
    v2 = {
        /**
         * No description
         *
         * @tags Calls
         * @name CallControllerFindAllPaginated
         * @summary List Calls
         * @request GET:/v2/call
         * @secure
         */
        callControllerFindAllPaginated: (query, params = {}) => this.request({
            path: `/v2/call`,
            method: 'GET',
            query: query,
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Calls
         * @name CallControllerFindAllMetadataPaginated
         * @summary List Call Metadata
         * @request GET:/v2/call/metadata
         * @secure
         */
        callControllerFindAllMetadataPaginated: (query, params = {}) => this.request({
            path: `/v2/call/metadata`,
            method: 'GET',
            query: query,
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Assistants
         * @name AssistantControllerFindAllPaginated
         * @summary List Assistants with pagination
         * @request GET:/v2/assistant
         * @secure
         */
        assistantControllerFindAllPaginated: (query, params = {}) => this.request({
            path: `/v2/assistant`,
            method: 'GET',
            query: query,
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Phone Numbers
         * @name PhoneNumberControllerFindAllPaginated
         * @summary List Phone Numbers
         * @request GET:/v2/phone-number
         * @secure
         */
        phoneNumberControllerFindAllPaginated: (query, params = {}) => this.request({
            path: `/v2/phone-number`,
            method: 'GET',
            query: query,
            secure: true,
            format: 'json',
            ...params,
        }),
    };
    chat = {
        /**
         * No description
         *
         * @tags Chat
         * @name ChatController
         * @summary Chat with Assistant
         * @request POST:/chat
         * @deprecated
         * @secure
         */
        chatController: (params = {}) => this.request({
            path: `/chat`,
            method: 'POST',
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Chat
         * @name ChatControllerChatCompletions
         * @summary Chat with a Workflow
         * @request POST:/chat/completions
         * @secure
         */
        chatControllerChatCompletions: (data, params = {}) => this.request({
            path: `/chat/completions`,
            method: 'POST',
            body: data,
            secure: true,
            type: ContentType.Json,
            format: 'json',
            ...params,
        }),
    };
    assistant = {
        /**
         * No description
         *
         * @tags Assistants
         * @name AssistantControllerCreate
         * @summary Create Assistant
         * @request POST:/assistant
         * @secure
         */
        assistantControllerCreate: (data, params = {}) => this.request({
            path: `/assistant`,
            method: 'POST',
            body: data,
            secure: true,
            type: ContentType.Json,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Assistants
         * @name AssistantControllerFindAll
         * @summary List Assistants
         * @request GET:/assistant
         * @secure
         */
        assistantControllerFindAll: (query, params = {}) => this.request({
            path: `/assistant`,
            method: 'GET',
            query: query,
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Assistants
         * @name AssistantControllerFindOne
         * @summary Get Assistant
         * @request GET:/assistant/{id}
         * @secure
         */
        assistantControllerFindOne: (id, params = {}) => this.request({
            path: `/assistant/${id}`,
            method: 'GET',
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Assistants
         * @name AssistantControllerUpdate
         * @summary Update Assistant
         * @request PATCH:/assistant/{id}
         * @secure
         */
        assistantControllerUpdate: (id, data, params = {}) => this.request({
            path: `/assistant/${id}`,
            method: 'PATCH',
            body: data,
            secure: true,
            type: ContentType.Json,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Assistants
         * @name AssistantControllerReplace
         * @summary Replace Assistant
         * @request PUT:/assistant/{id}
         * @secure
         */
        assistantControllerReplace: (id, data, params = {}) => this.request({
            path: `/assistant/${id}`,
            method: 'PUT',
            body: data,
            secure: true,
            type: ContentType.Json,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Assistants
         * @name AssistantControllerRemove
         * @summary Delete Assistant
         * @request DELETE:/assistant/{id}
         * @secure
         */
        assistantControllerRemove: (id, params = {}) => this.request({
            path: `/assistant/${id}`,
            method: 'DELETE',
            secure: true,
            format: 'json',
            ...params,
        }),
    };
    phoneNumber = {
        /**
         * @description Use POST /phone-number instead.
         *
         * @tags Phone Numbers
         * @name PhoneNumberControllerImportTwilio
         * @summary Import Twilio Number
         * @request POST:/phone-number/import/twilio
         * @deprecated
         * @secure
         */
        phoneNumberControllerImportTwilio: (data, params = {}) => this.request({
            path: `/phone-number/import/twilio`,
            method: 'POST',
            body: data,
            secure: true,
            type: ContentType.Json,
            format: 'json',
            ...params,
        }),
        /**
         * @description Use POST /phone-number instead.
         *
         * @tags Phone Numbers
         * @name PhoneNumberControllerImportVonage
         * @summary Import Vonage Number
         * @request POST:/phone-number/import/vonage
         * @deprecated
         * @secure
         */
        phoneNumberControllerImportVonage: (data, params = {}) => this.request({
            path: `/phone-number/import/vonage`,
            method: 'POST',
            body: data,
            secure: true,
            type: ContentType.Json,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Phone Numbers
         * @name PhoneNumberControllerCreate
         * @summary Create Phone Number
         * @request POST:/phone-number
         * @secure
         */
        phoneNumberControllerCreate: (data, params = {}) => this.request({
            path: `/phone-number`,
            method: 'POST',
            body: data,
            secure: true,
            type: ContentType.Json,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Phone Numbers
         * @name PhoneNumberControllerFindAll
         * @summary List Phone Numbers
         * @request GET:/phone-number
         * @secure
         */
        phoneNumberControllerFindAll: (query, params = {}) => this.request({
            path: `/phone-number`,
            method: 'GET',
            query: query,
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Phone Numbers
         * @name PhoneNumberControllerFindOne
         * @summary Get Phone Number
         * @request GET:/phone-number/{id}
         * @secure
         */
        phoneNumberControllerFindOne: (id, params = {}) => this.request({
            path: `/phone-number/${id}`,
            method: 'GET',
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Phone Numbers
         * @name PhoneNumberControllerUpdate
         * @summary Update Phone Number
         * @request PATCH:/phone-number/{id}
         * @secure
         */
        phoneNumberControllerUpdate: (id, data, params = {}) => this.request({
            path: `/phone-number/${id}`,
            method: 'PATCH',
            body: data,
            secure: true,
            type: ContentType.Json,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Phone Numbers
         * @name PhoneNumberControllerRemove
         * @summary Delete Phone Number
         * @request DELETE:/phone-number/{id}
         * @secure
         */
        phoneNumberControllerRemove: (id, params = {}) => this.request({
            path: `/phone-number/${id}`,
            method: 'DELETE',
            secure: true,
            format: 'json',
            ...params,
        }),
    };
    tool = {
        /**
         * No description
         *
         * @tags Tools
         * @name ToolControllerCreate
         * @summary Create Tool
         * @request POST:/tool
         * @secure
         */
        toolControllerCreate: (data, params = {}) => this.request({
            path: `/tool`,
            method: 'POST',
            body: data,
            secure: true,
            type: ContentType.Json,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Tools
         * @name ToolControllerFindAll
         * @summary List Tools
         * @request GET:/tool
         * @secure
         */
        toolControllerFindAll: (query, params = {}) => this.request({
            path: `/tool`,
            method: 'GET',
            query: query,
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Tools
         * @name ToolControllerFindOne
         * @summary Get Tool
         * @request GET:/tool/{id}
         * @secure
         */
        toolControllerFindOne: (id, params = {}) => this.request({
            path: `/tool/${id}`,
            method: 'GET',
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Tools
         * @name ToolControllerUpdate
         * @summary Update Tool
         * @request PATCH:/tool/{id}
         * @secure
         */
        toolControllerUpdate: (id, data, params = {}) => this.request({
            path: `/tool/${id}`,
            method: 'PATCH',
            body: data,
            secure: true,
            type: ContentType.Json,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Tools
         * @name ToolControllerRemove
         * @summary Delete Tool
         * @request DELETE:/tool/{id}
         * @secure
         */
        toolControllerRemove: (id, params = {}) => this.request({
            path: `/tool/${id}`,
            method: 'DELETE',
            secure: true,
            format: 'json',
            ...params,
        }),
    };
    file = {
        /**
         * @description Use POST /file instead.
         *
         * @tags Files
         * @name FileControllerCreateDeprecated
         * @summary Upload File
         * @request POST:/file/upload
         * @deprecated
         * @secure
         */
        fileControllerCreateDeprecated: (data, params = {}) => this.request({
            path: `/file/upload`,
            method: 'POST',
            body: data,
            secure: true,
            type: ContentType.FormData,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Files
         * @name FileControllerCreate
         * @summary Upload File
         * @request POST:/file
         * @secure
         */
        fileControllerCreate: (data, params = {}) => this.request({
            path: `/file`,
            method: 'POST',
            body: data,
            secure: true,
            type: ContentType.FormData,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Files
         * @name FileControllerFindAll
         * @summary List Files
         * @request GET:/file
         * @secure
         */
        fileControllerFindAll: (params = {}) => this.request({
            path: `/file`,
            method: 'GET',
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Files
         * @name FileControllerFindOne
         * @summary Get File
         * @request GET:/file/{id}
         * @secure
         */
        fileControllerFindOne: (id, params = {}) => this.request({
            path: `/file/${id}`,
            method: 'GET',
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Files
         * @name FileControllerUpdate
         * @summary Update File
         * @request PATCH:/file/{id}
         * @secure
         */
        fileControllerUpdate: (id, data, params = {}) => this.request({
            path: `/file/${id}`,
            method: 'PATCH',
            body: data,
            secure: true,
            type: ContentType.Json,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Files
         * @name FileControllerRemove
         * @summary Delete File
         * @request DELETE:/file/{id}
         * @secure
         */
        fileControllerRemove: (id, params = {}) => this.request({
            path: `/file/${id}`,
            method: 'DELETE',
            secure: true,
            format: 'json',
            ...params,
        }),
    };
    knowledgeBase = {
        /**
         * No description
         *
         * @tags Knowledge Base
         * @name KnowledgeBaseControllerCreate
         * @summary Create Knowledge Base
         * @request POST:/knowledge-base
         * @secure
         */
        knowledgeBaseControllerCreate: (data, params = {}) => this.request({
            path: `/knowledge-base`,
            method: 'POST',
            body: data,
            secure: true,
            type: ContentType.Json,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Knowledge Base
         * @name KnowledgeBaseControllerFindAll
         * @summary List Knowledge Bases
         * @request GET:/knowledge-base
         * @secure
         */
        knowledgeBaseControllerFindAll: (query, params = {}) => this.request({
            path: `/knowledge-base`,
            method: 'GET',
            query: query,
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Knowledge Base
         * @name KnowledgeBaseControllerFindOne
         * @summary Get Knowledge Base
         * @request GET:/knowledge-base/{id}
         * @secure
         */
        knowledgeBaseControllerFindOne: (id, params = {}) => this.request({
            path: `/knowledge-base/${id}`,
            method: 'GET',
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Knowledge Base
         * @name KnowledgeBaseControllerUpdate
         * @summary Update Knowledge Base
         * @request PATCH:/knowledge-base/{id}
         * @secure
         */
        knowledgeBaseControllerUpdate: (id, data, params = {}) => this.request({
            path: `/knowledge-base/${id}`,
            method: 'PATCH',
            body: data,
            secure: true,
            type: ContentType.Json,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Knowledge Base
         * @name KnowledgeBaseControllerRemove
         * @summary Delete Knowledge Base
         * @request DELETE:/knowledge-base/{id}
         * @secure
         */
        knowledgeBaseControllerRemove: (id, params = {}) => this.request({
            path: `/knowledge-base/${id}`,
            method: 'DELETE',
            secure: true,
            format: 'json',
            ...params,
        }),
    };
    workflow = {
        /**
         * No description
         *
         * @tags Workflow
         * @name WorkflowControllerFindAll
         * @summary Get Workflows
         * @request GET:/workflow
         * @secure
         */
        workflowControllerFindAll: (params = {}) => this.request({
            path: `/workflow`,
            method: 'GET',
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Workflow
         * @name WorkflowControllerCreate
         * @summary Create Workflow
         * @request POST:/workflow
         * @secure
         */
        workflowControllerCreate: (data, params = {}) => this.request({
            path: `/workflow`,
            method: 'POST',
            body: data,
            secure: true,
            type: ContentType.Json,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Workflow
         * @name WorkflowControllerFindOne
         * @summary Get Workflow
         * @request GET:/workflow/{id}
         * @secure
         */
        workflowControllerFindOne: (id, params = {}) => this.request({
            path: `/workflow/${id}`,
            method: 'GET',
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Workflow
         * @name WorkflowControllerDelete
         * @summary Delete Workflow
         * @request DELETE:/workflow/{id}
         * @secure
         */
        workflowControllerDelete: (id, params = {}) => this.request({
            path: `/workflow/${id}`,
            method: 'DELETE',
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Workflow
         * @name WorkflowControllerUpdate
         * @summary Update Workflow
         * @request PATCH:/workflow/{id}
         * @secure
         */
        workflowControllerUpdate: (id, data, params = {}) => this.request({
            path: `/workflow/${id}`,
            method: 'PATCH',
            body: data,
            secure: true,
            type: ContentType.Json,
            format: 'json',
            ...params,
        }),
    };
    squad = {
        /**
         * No description
         *
         * @tags Squads
         * @name SquadControllerCreate
         * @summary Create Squad
         * @request POST:/squad
         * @secure
         */
        squadControllerCreate: (data, params = {}) => this.request({
            path: `/squad`,
            method: 'POST',
            body: data,
            secure: true,
            type: ContentType.Json,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Squads
         * @name SquadControllerFindAll
         * @summary List Squads
         * @request GET:/squad
         * @secure
         */
        squadControllerFindAll: (query, params = {}) => this.request({
            path: `/squad`,
            method: 'GET',
            query: query,
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Squads
         * @name SquadControllerFindOne
         * @summary Get Squad
         * @request GET:/squad/{id}
         * @secure
         */
        squadControllerFindOne: (id, params = {}) => this.request({
            path: `/squad/${id}`,
            method: 'GET',
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Squads
         * @name SquadControllerUpdate
         * @summary Update Squad
         * @request PATCH:/squad/{id}
         * @secure
         */
        squadControllerUpdate: (id, data, params = {}) => this.request({
            path: `/squad/${id}`,
            method: 'PATCH',
            body: data,
            secure: true,
            type: ContentType.Json,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Squads
         * @name SquadControllerRemove
         * @summary Delete Squad
         * @request DELETE:/squad/{id}
         * @secure
         */
        squadControllerRemove: (id, params = {}) => this.request({
            path: `/squad/${id}`,
            method: 'DELETE',
            secure: true,
            format: 'json',
            ...params,
        }),
    };
    testSuite = {
        /**
         * No description
         *
         * @tags Test Suites
         * @name TestSuiteControllerFindAllPaginated
         * @summary List Test Suites
         * @request GET:/test-suite
         * @secure
         */
        testSuiteControllerFindAllPaginated: (query, params = {}) => this.request({
            path: `/test-suite`,
            method: 'GET',
            query: query,
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Test Suites
         * @name TestSuiteControllerCreate
         * @summary Create Test Suite
         * @request POST:/test-suite
         * @secure
         */
        testSuiteControllerCreate: (data, params = {}) => this.request({
            path: `/test-suite`,
            method: 'POST',
            body: data,
            secure: true,
            type: ContentType.Json,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Test Suites
         * @name TestSuiteControllerFindOne
         * @summary Get Test Suite
         * @request GET:/test-suite/{id}
         * @secure
         */
        testSuiteControllerFindOne: (id, params = {}) => this.request({
            path: `/test-suite/${id}`,
            method: 'GET',
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Test Suites
         * @name TestSuiteControllerUpdate
         * @summary Update Test Suite
         * @request PATCH:/test-suite/{id}
         * @secure
         */
        testSuiteControllerUpdate: (id, data, params = {}) => this.request({
            path: `/test-suite/${id}`,
            method: 'PATCH',
            body: data,
            secure: true,
            type: ContentType.Json,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Test Suites
         * @name TestSuiteControllerRemove
         * @summary Delete Test Suite
         * @request DELETE:/test-suite/{id}
         * @secure
         */
        testSuiteControllerRemove: (id, params = {}) => this.request({
            path: `/test-suite/${id}`,
            method: 'DELETE',
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Test Suite Tests
         * @name TestSuiteTestControllerFindAllPaginated
         * @summary List Tests
         * @request GET:/test-suite/{testSuiteId}/test
         * @secure
         */
        testSuiteTestControllerFindAllPaginated: (testSuiteId, query, params = {}) => this.request({
            path: `/test-suite/${testSuiteId}/test`,
            method: 'GET',
            query: query,
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Test Suite Tests
         * @name TestSuiteTestControllerCreate
         * @summary Create Test
         * @request POST:/test-suite/{testSuiteId}/test
         * @secure
         */
        testSuiteTestControllerCreate: (testSuiteId, data, params = {}) => this.request({
            path: `/test-suite/${testSuiteId}/test`,
            method: 'POST',
            body: data,
            secure: true,
            type: ContentType.Json,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Test Suite Tests
         * @name TestSuiteTestControllerFindOne
         * @summary Get Test
         * @request GET:/test-suite/{testSuiteId}/test/{id}
         * @secure
         */
        testSuiteTestControllerFindOne: (testSuiteId, id, params = {}) => this.request({
            path: `/test-suite/${testSuiteId}/test/${id}`,
            method: 'GET',
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Test Suite Tests
         * @name TestSuiteTestControllerUpdate
         * @summary Update Test
         * @request PATCH:/test-suite/{testSuiteId}/test/{id}
         * @secure
         */
        testSuiteTestControllerUpdate: (testSuiteId, id, data, params = {}) => this.request({
            path: `/test-suite/${testSuiteId}/test/${id}`,
            method: 'PATCH',
            body: data,
            secure: true,
            type: ContentType.Json,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Test Suite Tests
         * @name TestSuiteTestControllerRemove
         * @summary Delete Test
         * @request DELETE:/test-suite/{testSuiteId}/test/{id}
         * @secure
         */
        testSuiteTestControllerRemove: (testSuiteId, id, params = {}) => this.request({
            path: `/test-suite/${testSuiteId}/test/${id}`,
            method: 'DELETE',
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Test Suite Runs
         * @name TestSuiteRunControllerFindAllPaginated
         * @summary List Test Suite Runs
         * @request GET:/test-suite/{testSuiteId}/run
         * @secure
         */
        testSuiteRunControllerFindAllPaginated: (testSuiteId, query, params = {}) => this.request({
            path: `/test-suite/${testSuiteId}/run`,
            method: 'GET',
            query: query,
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Test Suite Runs
         * @name TestSuiteRunControllerCreate
         * @summary Create Test Suite Run
         * @request POST:/test-suite/{testSuiteId}/run
         * @secure
         */
        testSuiteRunControllerCreate: (testSuiteId, data, params = {}) => this.request({
            path: `/test-suite/${testSuiteId}/run`,
            method: 'POST',
            body: data,
            secure: true,
            type: ContentType.Json,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Test Suite Runs
         * @name TestSuiteRunControllerFindOne
         * @summary Get Test Suite Run
         * @request GET:/test-suite/{testSuiteId}/run/{id}
         * @secure
         */
        testSuiteRunControllerFindOne: (testSuiteId, id, params = {}) => this.request({
            path: `/test-suite/${testSuiteId}/run/${id}`,
            method: 'GET',
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Test Suite Runs
         * @name TestSuiteRunControllerUpdate
         * @summary Update Test Suite Run
         * @request PATCH:/test-suite/{testSuiteId}/run/{id}
         * @secure
         */
        testSuiteRunControllerUpdate: (testSuiteId, id, data, params = {}) => this.request({
            path: `/test-suite/${testSuiteId}/run/${id}`,
            method: 'PATCH',
            body: data,
            secure: true,
            type: ContentType.Json,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Test Suite Runs
         * @name TestSuiteRunControllerRemove
         * @summary Delete Test Suite Run
         * @request DELETE:/test-suite/{testSuiteId}/run/{id}
         * @secure
         */
        testSuiteRunControllerRemove: (testSuiteId, id, params = {}) => this.request({
            path: `/test-suite/${testSuiteId}/run/${id}`,
            method: 'DELETE',
            secure: true,
            format: 'json',
            ...params,
        }),
    };
    metrics = {
        /**
         * @description Use GET /metric instead
         *
         * @tags Analytics
         * @name AnalyticsControllerFindAllDeprecated
         * @summary List Billing Metrics
         * @request GET:/metrics
         * @deprecated
         * @secure
         */
        analyticsControllerFindAllDeprecated: (query, params = {}) => this.request({
            path: `/metrics`,
            method: 'GET',
            query: query,
            secure: true,
            format: 'json',
            ...params,
        }),
    };
    analytics = {
        /**
         * No description
         *
         * @tags Analytics
         * @name AnalyticsControllerQuery
         * @summary Create Analytics Queries
         * @request POST:/analytics
         * @secure
         */
        analyticsControllerQuery: (data, params = {}) => this.request({
            path: `/analytics`,
            method: 'POST',
            body: data,
            secure: true,
            type: ContentType.Json,
            format: 'json',
            ...params,
        }),
    };
    log = {
        /**
         * No description
         *
         * @tags Logs
         * @name LoggingControllerCallLogsQuery
         * @summary Get Call Logs
         * @request GET:/log
         * @secure
         */
        loggingControllerCallLogsQuery: (query, params = {}) => this.request({
            path: `/log`,
            method: 'GET',
            query: query,
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Logs
         * @name LoggingControllerCallLogsDeleteQuery
         * @summary Delete Call Logs
         * @request DELETE:/log
         * @secure
         */
        loggingControllerCallLogsDeleteQuery: (query, params = {}) => this.request({
            path: `/log`,
            method: 'DELETE',
            query: query,
            secure: true,
            ...params,
        }),
    };
    logs = {
        /**
         * No description
         *
         * @tags Logs
         * @name LoggingControllerLogsQuery
         * @summary Get Logs
         * @request GET:/logs
         * @deprecated
         * @secure
         */
        loggingControllerLogsQuery: (query, params = {}) => this.request({
            path: `/logs`,
            method: 'GET',
            query: query,
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Logs
         * @name LoggingControllerLogsDeleteQuery
         * @summary Delete Logs
         * @request DELETE:/logs
         * @deprecated
         * @secure
         */
        loggingControllerLogsDeleteQuery: (query, params = {}) => this.request({
            path: `/logs`,
            method: 'DELETE',
            query: query,
            secure: true,
            ...params,
        }),
    };
    org = {
        /**
         * No description
         *
         * @tags Orgs
         * @name OrgControllerCreate
         * @summary Create Org
         * @request POST:/org
         * @secure
         */
        orgControllerCreate: (data, params = {}) => this.request({
            path: `/org`,
            method: 'POST',
            body: data,
            secure: true,
            type: ContentType.Json,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Orgs
         * @name OrgControllerFindAll
         * @summary List Orgs
         * @request GET:/org
         * @secure
         */
        orgControllerFindAll: (params = {}) => this.request({
            path: `/org`,
            method: 'GET',
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Orgs
         * @name OrgControllerFindOne
         * @summary Get Org
         * @request GET:/org/{id}
         * @secure
         */
        orgControllerFindOne: (id, params = {}) => this.request({
            path: `/org/${id}`,
            method: 'GET',
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Orgs
         * @name OrgControllerUpdate
         * @summary Update Org
         * @request PATCH:/org/{id}
         * @secure
         */
        orgControllerUpdate: (id, data, params = {}) => this.request({
            path: `/org/${id}`,
            method: 'PATCH',
            body: data,
            secure: true,
            type: ContentType.Json,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Orgs
         * @name OrgControllerDeleteOrg
         * @summary Delete Org
         * @request DELETE:/org/{id}
         * @secure
         */
        orgControllerDeleteOrg: (id, params = {}) => this.request({
            path: `/org/${id}`,
            method: 'DELETE',
            secure: true,
            ...params,
        }),
        /**
         * No description
         *
         * @tags Orgs
         * @name OrgControllerFindAllUsers
         * @summary List Users
         * @request GET:/org/{id}/user
         * @secure
         */
        orgControllerFindAllUsers: (id, params = {}) => this.request({
            path: `/org/${id}/user`,
            method: 'GET',
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Orgs
         * @name OrgControllerOrgLeave
         * @summary Leave Org
         * @request DELETE:/org/{id}/leave
         * @secure
         */
        orgControllerOrgLeave: (id, params = {}) => this.request({
            path: `/org/${id}/leave`,
            method: 'DELETE',
            secure: true,
            ...params,
        }),
        /**
         * No description
         *
         * @tags Orgs
         * @name OrgControllerOrgRemoveUser
         * @summary Remove Org Member
         * @request DELETE:/org/{id}/member/{memberId}/leave
         * @secure
         */
        orgControllerOrgRemoveUser: (id, memberId, params = {}) => this.request({
            path: `/org/${id}/member/${memberId}/leave`,
            method: 'DELETE',
            secure: true,
            ...params,
        }),
        /**
         * No description
         *
         * @tags Orgs
         * @name OrgControllerUsersInvite
         * @summary Invite User
         * @request POST:/org/{id}/invite
         * @secure
         */
        orgControllerUsersInvite: (id, data, params = {}) => this.request({
            path: `/org/${id}/invite`,
            method: 'POST',
            body: data,
            secure: true,
            type: ContentType.Json,
            ...params,
        }),
        /**
         * No description
         *
         * @tags Orgs
         * @name OrgControllerUserUpdate
         * @summary Update User Role
         * @request PATCH:/org/{id}/role
         * @secure
         */
        orgControllerUserUpdate: (id, data, params = {}) => this.request({
            path: `/org/${id}/role`,
            method: 'PATCH',
            body: data,
            secure: true,
            type: ContentType.Json,
            ...params,
        }),
    };
    token = {
        /**
         * No description
         *
         * @tags Tokens
         * @name TokenControllerCreate
         * @summary Create Token
         * @request POST:/token
         * @secure
         */
        tokenControllerCreate: (data, params = {}) => this.request({
            path: `/token`,
            method: 'POST',
            body: data,
            secure: true,
            type: ContentType.Json,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Tokens
         * @name TokenControllerFindAll
         * @summary List Tokens
         * @request GET:/token
         * @secure
         */
        tokenControllerFindAll: (query, params = {}) => this.request({
            path: `/token`,
            method: 'GET',
            query: query,
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Tokens
         * @name TokenControllerFindOne
         * @summary Get Token
         * @request GET:/token/{id}
         * @secure
         */
        tokenControllerFindOne: (id, params = {}) => this.request({
            path: `/token/${id}`,
            method: 'GET',
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Tokens
         * @name TokenControllerUpdate
         * @summary Update Token
         * @request PATCH:/token/{id}
         * @secure
         */
        tokenControllerUpdate: (id, data, params = {}) => this.request({
            path: `/token/${id}`,
            method: 'PATCH',
            body: data,
            secure: true,
            type: ContentType.Json,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Tokens
         * @name TokenControllerRemove
         * @summary Delete Token
         * @request DELETE:/token/{id}
         * @secure
         */
        tokenControllerRemove: (id, params = {}) => this.request({
            path: `/token/${id}`,
            method: 'DELETE',
            secure: true,
            format: 'json',
            ...params,
        }),
    };
    credential = {
        /**
         * No description
         *
         * @tags Credentials
         * @name CredentialControllerCreate
         * @summary Create Credential
         * @request POST:/credential
         * @secure
         */
        credentialControllerCreate: (data, params = {}) => this.request({
            path: `/credential`,
            method: 'POST',
            body: data,
            secure: true,
            type: ContentType.Json,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Credentials
         * @name CredentialControllerFindAll
         * @summary List Credentials
         * @request GET:/credential
         * @secure
         */
        credentialControllerFindAll: (query, params = {}) => this.request({
            path: `/credential`,
            method: 'GET',
            query: query,
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Credentials
         * @name CredentialControllerFindOne
         * @summary Get Credential
         * @request GET:/credential/{id}
         * @secure
         */
        credentialControllerFindOne: (id, params = {}) => this.request({
            path: `/credential/${id}`,
            method: 'GET',
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Credentials
         * @name CredentialControllerUpdate
         * @summary Update Credential
         * @request PATCH:/credential/{id}
         * @secure
         */
        credentialControllerUpdate: (id, data, params = {}) => this.request({
            path: `/credential/${id}`,
            method: 'PATCH',
            body: data,
            secure: true,
            type: ContentType.Json,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Credentials
         * @name CredentialControllerRemove
         * @summary Delete Credential
         * @request DELETE:/credential/{id}
         * @secure
         */
        credentialControllerRemove: (id, params = {}) => this.request({
            path: `/credential/${id}`,
            method: 'DELETE',
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Credentials
         * @name CredentialControllerGenerateSession
         * @summary Generate a credential session
         * @request POST:/credential/session
         * @secure
         */
        credentialControllerGenerateSession: (data, params = {}) => this.request({
            path: `/credential/session`,
            method: 'POST',
            body: data,
            secure: true,
            type: ContentType.Json,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Credentials
         * @name CredentialControllerHandleWebhook
         * @summary Handle credential webhook
         * @request POST:/credential/webhook
         */
        credentialControllerHandleWebhook: (data, params = {}) => this.request({
            path: `/credential/webhook`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params,
        }),
        /**
         * No description
         *
         * @tags Credentials
         * @name CredentialControllerTriggerCredentialAction
         * @summary Trigger a credential action
         * @request POST:/credential/trigger
         * @secure
         */
        credentialControllerTriggerCredentialAction: (data, params = {}) => this.request({
            path: `/credential/trigger`,
            method: 'POST',
            body: data,
            secure: true,
            type: ContentType.Json,
            ...params,
        }),
    };
    template = {
        /**
         * No description
         *
         * @tags Templates
         * @name TemplateControllerCreate
         * @summary Create Template
         * @request POST:/template
         * @secure
         */
        templateControllerCreate: (data, params = {}) => this.request({
            path: `/template`,
            method: 'POST',
            body: data,
            secure: true,
            type: ContentType.Json,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Templates
         * @name TemplateControllerFindAll
         * @summary List Templates
         * @request GET:/template
         * @secure
         */
        templateControllerFindAll: (query, params = {}) => this.request({
            path: `/template`,
            method: 'GET',
            query: query,
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Templates
         * @name TemplateControllerFindAllPinned
         * @summary List Templates
         * @request GET:/template/pinned
         * @secure
         */
        templateControllerFindAllPinned: (params = {}) => this.request({
            path: `/template/pinned`,
            method: 'GET',
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Templates
         * @name TemplateControllerFindOne
         * @summary Get Template
         * @request GET:/template/{id}
         * @secure
         */
        templateControllerFindOne: (id, params = {}) => this.request({
            path: `/template/${id}`,
            method: 'GET',
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Templates
         * @name TemplateControllerUpdate
         * @summary Update Template
         * @request PATCH:/template/{id}
         * @secure
         */
        templateControllerUpdate: (id, data, params = {}) => this.request({
            path: `/template/${id}`,
            method: 'PATCH',
            body: data,
            secure: true,
            type: ContentType.Json,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Templates
         * @name TemplateControllerRemove
         * @summary Delete Template
         * @request DELETE:/template/{id}
         * @secure
         */
        templateControllerRemove: (id, params = {}) => this.request({
            path: `/template/${id}`,
            method: 'DELETE',
            secure: true,
            format: 'json',
            ...params,
        }),
    };
    voiceLibrary = {
        /**
         * No description
         *
         * @tags Voice Library
         * @name VoiceLibraryControllerVoiceGetByProvider
         * @summary Get voices in Voice Library by Provider
         * @request GET:/voice-library/{provider}
         * @secure
         */
        voiceLibraryControllerVoiceGetByProvider: (provider, query, params = {}) => this.request({
            path: `/voice-library/${provider}`,
            method: 'GET',
            query: query,
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Voice Library
         * @name VoiceLibraryControllerVoiceGetAccentsByProvider
         * @summary Get accents in Voice Library by Provider
         * @request GET:/voice-library/{provider}/accents
         * @secure
         */
        voiceLibraryControllerVoiceGetAccentsByProvider: (provider, params = {}) => this.request({
            path: `/voice-library/${provider}/accents`,
            method: 'GET',
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Voice Library
         * @name VoiceLibraryControllerVoiceLibrarySyncByProvider
         * @summary Sync Private voices in Voice Library by Provider
         * @request POST:/voice-library/sync/{provider}
         * @secure
         */
        voiceLibraryControllerVoiceLibrarySyncByProvider: (provider, params = {}) => this.request({
            path: `/voice-library/sync/${provider}`,
            method: 'POST',
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Voice Library
         * @name VoiceLibraryControllerVoiceLibrarySyncDefaultVoices
         * @summary Sync Default voices in Voice Library by Providers
         * @request POST:/voice-library/sync
         * @secure
         */
        voiceLibraryControllerVoiceLibrarySyncDefaultVoices: (data, params = {}) => this.request({
            path: `/voice-library/sync`,
            method: 'POST',
            body: data,
            secure: true,
            type: ContentType.Json,
            format: 'json',
            ...params,
        }),
    };
    provider = {
        /**
         * No description
         *
         * @tags Providers
         * @name ProviderControllerGetWorkflows
         * @request GET:/{provider}/workflows
         * @secure
         */
        providerControllerGetWorkflows: (provider, query, params = {}) => this.request({
            path: `/${provider}/workflows`,
            method: 'GET',
            query: query,
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Providers
         * @name ProviderControllerGetWorkflowTriggerHook
         * @request GET:/{provider}/workflows/{workflowId}/hooks
         * @secure
         */
        providerControllerGetWorkflowTriggerHook: (provider, workflowId, params = {}) => this.request({
            path: `/${provider}/workflows/${workflowId}/hooks`,
            method: 'GET',
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Providers
         * @name ProviderControllerGetLocations
         * @request GET:/{provider}/locations
         * @secure
         */
        providerControllerGetLocations: (provider, params = {}) => this.request({
            path: `/${provider}/locations`,
            method: 'GET',
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Providers
         * @name VoiceProviderControllerSearchVoices
         * @summary Search Voice from Provider Voice Library.
         * @request GET:/{provider}/voices/search
         * @deprecated
         * @secure
         */
        voiceProviderControllerSearchVoices: (provider, query, params = {}) => this.request({
            path: `/${provider}/voices/search`,
            method: 'GET',
            query: query,
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Providers
         * @name VoiceProviderControllerSearchVoice
         * @summary Search Voice from Provider Voice Library.
         * @request GET:/{provider}/voice/search
         * @secure
         */
        voiceProviderControllerSearchVoice: (provider, query, params = {}) => this.request({
            path: `/${provider}/voice/search`,
            method: 'GET',
            query: query,
            secure: true,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Providers
         * @name VoiceProviderControllerAddVoices
         * @summary Add Shared Voice to your Provider Account.
         * @request POST:/{provider}/voices/add
         * @deprecated
         * @secure
         */
        voiceProviderControllerAddVoices: (provider, data, params = {}) => this.request({
            path: `/${provider}/voices/add`,
            method: 'POST',
            body: data,
            secure: true,
            type: ContentType.Json,
            format: 'json',
            ...params,
        }),
        /**
         * No description
         *
         * @tags Providers
         * @name VoiceProviderControllerAddVoice
         * @summary Add Shared Voice to your Provider Account.
         * @request POST:/{provider}/voice/add
         * @secure
         */
        voiceProviderControllerAddVoice: (provider, data, params = {}) => this.request({
            path: `/${provider}/voice/add`,
            method: 'POST',
            body: data,
            secure: true,
            type: ContentType.Json,
            format: 'json',
            ...params,
        }),
    };
    v11Labs = {
        /**
         * No description
         *
         * @tags Providers
         * @name VoiceProviderControllerCloneVoices
         * @summary Clone a voice to the provider account and add to Vapi Voice Library.
         * @request POST:/11labs/voice/clone
         * @secure
         */
        voiceProviderControllerCloneVoices: (data, params = {}) => this.request({
            path: `/11labs/voice/clone`,
            method: 'POST',
            body: data,
            secure: true,
            type: ContentType.FormData,
            ...params,
        }),
    };
}
exports.Api = Api;

},{}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
const api_1 = require("./api");
const api = new api_1.Api({
    baseUrl: "https://api.vapi.ai",
    baseApiParams: {
        secure: true,
    },
    securityWorker: async (securityData) => {
        if (securityData) {
            return {
                headers: {
                    Authorization: `Bearer ${securityData}`,
                },
            };
        }
    },
});
exports.client = api;

},{"./api":2}],4:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const daily_js_1 = __importDefault(require("@daily-co/daily-js"));
const events_1 = __importDefault(require("events"));
const client_1 = require("./client");
async function startAudioPlayer(player, track) {
    player.muted = false;
    player.autoplay = true;
    if (track != null) {
        player.srcObject = new MediaStream([track]);
        await player.play();
    }
}
async function buildAudioPlayer(track, participantId) {
    const player = document.createElement('audio');
    player.dataset.participantId = participantId;
    document.body.appendChild(player);
    await startAudioPlayer(player, track);
    return player;
}
function destroyAudioPlayer(participantId) {
    const player = document.querySelector(`audio[data-participant-id="${participantId}"]`);
    player?.remove();
}
function subscribeToTracks(e, call, isVideoRecordingEnabled, isVideoEnabled) {
    if (e.participant.local)
        return;
    call.updateParticipant(e.participant.session_id, {
        setSubscribedTracks: {
            audio: true,
            video: isVideoRecordingEnabled || isVideoEnabled,
        },
    });
}
class VapiEventEmitter extends events_1.default {
    on(event, listener) {
        super.on(event, listener);
        return this;
    }
    once(event, listener) {
        super.once(event, listener);
        return this;
    }
    emit(event, ...args) {
        return super.emit(event, ...args);
    }
    removeListener(event, listener) {
        super.removeListener(event, listener);
        return this;
    }
    removeAllListeners(event) {
        super.removeAllListeners(event);
        return this;
    }
}
class Vapi extends VapiEventEmitter {
    started = false;
    call = null;
    speakingTimeout = null;
    dailyCallConfig = {};
    dailyCallObject = {};
    hasEmittedCallEndedStatus = false;
    constructor(apiToken, apiBaseUrl, dailyCallConfig, dailyCallObject) {
        super();
        client_1.client.baseUrl = apiBaseUrl ?? 'https://api.vapi.ai';
        client_1.client.setSecurityData(apiToken);
        this.dailyCallConfig = dailyCallConfig ?? {};
        this.dailyCallObject = dailyCallObject ?? {};
    }
    cleanup() {
        this.started = false;
        this.hasEmittedCallEndedStatus = false;
        this.call?.destroy();
        this.call = null;
        this.speakingTimeout = null;
    }
    isMobileDevice() {
        if (typeof navigator === 'undefined') {
            return false;
        }
        const userAgent = navigator.userAgent;
        return /android|iphone|ipad|ipod|iemobile|blackberry|bada/i.test(userAgent.toLowerCase());
    }
    async sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    async start(assistant, assistantOverrides, squad) {
        if (!assistant && !squad) {
            throw new Error('Assistant or Squad must be provided.');
        }
        if (this.started) {
            return null;
        }
        this.started = true;
        try {
            const webCall = (await client_1.client.call.callControllerCreateWebCall({
                assistant: typeof assistant === 'string' ? undefined : assistant,
                assistantId: typeof assistant === 'string' ? assistant : undefined,
                assistantOverrides,
                squad: typeof squad === 'string' ? undefined : squad,
                squadId: typeof squad === 'string' ? squad : undefined,
            })).data;
            if (this.call) {
                this.cleanup();
            }
            const isVideoRecordingEnabled = webCall?.artifactPlan?.videoRecordingEnabled ?? false;
            const isVideoEnabled = webCall.transport?.assistantVideoEnabled ?? false;
            this.call = daily_js_1.default.createCallObject({
                audioSource: this.dailyCallObject.audioSource ?? true,
                videoSource: this.dailyCallObject.videoSource ?? isVideoRecordingEnabled,
                dailyConfig: this.dailyCallConfig,
            });
            this.call.iframe()?.style.setProperty('display', 'none');
            this.call.on('left-meeting', () => {
                this.emit('call-end');
                if (!this.hasEmittedCallEndedStatus) {
                    this.emit('message', {
                        type: 'status-update',
                        status: 'ended',
                        'endedReason': 'customer-ended-call',
                    });
                    this.hasEmittedCallEndedStatus = true;
                }
                if (isVideoRecordingEnabled) {
                    this.call?.stopRecording();
                }
                this.cleanup();
            });
            this.call.on('error', (error) => {
                this.emit('error', error);
                if (isVideoRecordingEnabled) {
                    this.call?.stopRecording();
                }
            });
            this.call.on('camera-error', (error) => {
                this.emit('error', error);
            });
            this.call.on('track-started', async (e) => {
                if (!e || !e.participant) {
                    return;
                }
                if (e.participant?.local) {
                    return;
                }
                if (e.participant?.user_name !== 'Vapi Speaker') {
                    return;
                }
                if (e.track.kind === 'video') {
                    this.emit('video', e.track);
                }
                if (e.track.kind === 'audio') {
                    await buildAudioPlayer(e.track, e.participant.session_id);
                }
                this.call?.sendAppMessage('playable');
            });
            this.call.on('participant-joined', (e) => {
                if (!e || !this.call)
                    return;
                subscribeToTracks(e, this.call, isVideoRecordingEnabled, isVideoEnabled);
            });
            this.call.on('participant-updated', (e) => {
                if (!e) {
                    return;
                }
                this.emit('daily-participant-updated', e.participant);
            });
            this.call.on('participant-left', (e) => {
                if (!e) {
                    return;
                }
                destroyAudioPlayer(e.participant.session_id);
            });
            // Allow mobile devices to finish processing the microphone permissions
            // request before joining the call and playing the assistant's audio
            if (this.isMobileDevice()) {
                await this.sleep(1000);
            }
            await this.call.join({
                // @ts-expect-error This exists
                url: webCall.webCallUrl,
                subscribeToTracksAutomatically: false,
            });
            if (isVideoRecordingEnabled) {
                const recordingRequestedTime = new Date().getTime();
                this.call.startRecording({
                    width: 1280,
                    height: 720,
                    backgroundColor: '#FF1F2D3D',
                    layout: {
                        preset: 'default',
                    },
                });
                this.call.on('recording-started', () => {
                    this.send({
                        type: 'control',
                        control: 'say-first-message',
                        videoRecordingStartDelaySeconds: (new Date().getTime() - recordingRequestedTime) / 1000,
                    });
                });
            }
            this.call.startRemoteParticipantsAudioLevelObserver(100);
            this.call.on('remote-participants-audio-level', (e) => {
                if (e)
                    this.handleRemoteParticipantsAudioLevel(e);
            });
            this.call.on('app-message', (e) => this.onAppMessage(e));
            this.call.on('nonfatal-error', (e) => {
                // https://docs.daily.co/reference/daily-js/events/meeting-events#type-audio-processor-error
                if (e?.type === 'audio-processor-error') {
                    this.call
                        ?.updateInputSettings({
                        audio: {
                            processor: {
                                type: 'none',
                            },
                        },
                    })
                        .then(() => {
                        this.call?.setLocalAudio(true);
                    });
                }
            });
            this.call.updateInputSettings({
                audio: {
                    processor: {
                        type: 'noise-cancellation',
                    },
                },
            });
            return webCall;
        }
        catch (e) {
            console.error(e);
            this.emit('error', e);
            this.cleanup();
            return null;
        }
    }
    onAppMessage(e) {
        if (!e) {
            return;
        }
        try {
            if (e.data === 'listening') {
                return this.emit('call-start');
            }
            else {
                try {
                    const parsedMessage = JSON.parse(e.data);
                    this.emit('message', parsedMessage);
                    if (parsedMessage && 'type' in parsedMessage && 'status' in parsedMessage && parsedMessage.type === 'status-update' && parsedMessage.status === 'ended') {
                        this.hasEmittedCallEndedStatus = true;
                    }
                }
                catch (parseError) {
                    console.log('Error parsing message data: ', parseError);
                }
            }
        }
        catch (e) {
            console.error(e);
        }
    }
    handleRemoteParticipantsAudioLevel(e) {
        const speechLevel = Object.values(e.participantsAudioLevel).reduce((a, b) => a + b, 0);
        this.emit('volume-level', Math.min(1, speechLevel / 0.15));
        const isSpeaking = speechLevel > 0.01;
        if (!isSpeaking) {
            return;
        }
        if (this.speakingTimeout) {
            clearTimeout(this.speakingTimeout);
            this.speakingTimeout = null;
        }
        else {
            this.emit('speech-start');
        }
        this.speakingTimeout = setTimeout(() => {
            this.emit('speech-end');
            this.speakingTimeout = null;
        }, 1000);
    }
    stop() {
        this.started = false;
        this.call?.destroy();
        this.call = null;
    }
    send(message) {
        this.call?.sendAppMessage(JSON.stringify(message));
    }
    setMuted(mute) {
        if (!this.call) {
            throw new Error('Call object is not available.');
        }
        this.call.setLocalAudio(!mute);
    }
    isMuted() {
        if (!this.call) {
            return false;
        }
        return this.call.localAudio() === false;
    }
    say(message, endCallAfterSpoken, interruptionsEnabled) {
        this.send({
            type: 'say',
            message,
            endCallAfterSpoken,
            interruptionsEnabled: interruptionsEnabled ?? false,
        });
    }
    setInputDevicesAsync(options) {
        this.call?.setInputDevicesAsync(options);
    }
    async increaseMicLevel(gain) {
        if (!this.call) {
            throw new Error('Call object is not available.');
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const audioContext = new AudioContext();
            const source = audioContext.createMediaStreamSource(stream);
            const gainNode = audioContext.createGain();
            gainNode.gain.value = gain;
            source.connect(gainNode);
            const destination = audioContext.createMediaStreamDestination();
            gainNode.connect(destination);
            const [boostedTrack] = destination.stream.getAudioTracks();
            await this.call.setInputDevicesAsync({ audioSource: boostedTrack });
        }
        catch (error) {
            console.error("Error adjusting microphone level:", error);
        }
    }
    setOutputDeviceAsync(options) {
        this.call?.setOutputDeviceAsync(options);
    }
    getDailyCallObject() {
        return this.call;
    }
    startScreenSharing(displayMediaOptions, screenVideoSendSettings) {
        this.call?.startScreenShare({
            displayMediaOptions,
            screenVideoSendSettings,
        });
    }
    stopScreenSharing() {
        this.call?.stopScreenShare();
    }
}
exports.default = Vapi;

},{"./client":3,"@daily-co/daily-js":5,"events":6}],5:[function(require,module,exports){
!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.Daily=t():e.Daily=t()}(this,(function(){return function(){var e={781:function(e,t,n){var r=n(14);e.exports=r.default},14:function(e,t,n){"use strict";function r(e,t){if(null==e)return{};var n,r,i=function(e,t){if(null==e)return{};var n,r,i={},o=Object.keys(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||(i[n]=e[n]);return i}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(r=0;r<o.length;r++)n=o[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(i[n]=e[n])}return i}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function o(e){return o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},o(e)}function a(e){var t=function(e){if("object"!==o(e)||null===e)return e;var t=e[Symbol.toPrimitive];if(void 0!==t){var n=t.call(e,"string");if("object"!==o(n))return n;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(e)}(e);return"symbol"===o(t)?t:String(t)}function s(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,a(r.key),r)}}function c(e,t,n){return t&&s(e.prototype,t),n&&s(e,n),Object.defineProperty(e,"prototype",{writable:!1}),e}function u(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function l(e,t){return l=Object.setPrototypeOf?Object.setPrototypeOf.bind():function(e,t){return e.__proto__=t,e},l(e,t)}function d(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),Object.defineProperty(e,"prototype",{writable:!1}),t&&l(e,t)}function f(e,t){if(t&&("object"===o(t)||"function"==typeof t))return t;if(void 0!==t)throw new TypeError("Derived constructors may only return object or undefined");return u(e)}function p(e){return p=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(e){return e.__proto__||Object.getPrototypeOf(e)},p(e)}function h(e,t,n){return(t=a(t))in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function v(e,t,n,r,i,o,a){try{var s=e[o](a),c=s.value}catch(e){return void n(e)}s.done?t(c):Promise.resolve(c).then(r,i)}function g(e){return function(){var t=this,n=arguments;return new Promise((function(r,i){var o=e.apply(t,n);function a(e){v(o,r,i,a,s,"next",e)}function s(e){v(o,r,i,a,s,"throw",e)}a(void 0)}))}}function m(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}function y(e,t){return function(e){if(Array.isArray(e))return e}(e)||function(e,t){var n=null==e?null:"undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(null!=n){var r,i,o,a,s=[],c=!0,u=!1;try{if(o=(n=n.call(e)).next,0===t){if(Object(n)!==n)return;c=!1}else for(;!(c=(r=o.call(n)).done)&&(s.push(r.value),s.length!==t);c=!0);}catch(e){u=!0,i=e}finally{try{if(!c&&null!=n.return&&(a=n.return(),Object(a)!==a))return}finally{if(u)throw i}}return s}}(e,t)||function(e,t){if(e){if("string"==typeof e)return m(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?m(e,t):void 0}}(e,t)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}n.r(t),n.d(t,{DAILY_ACCESS_LEVEL_FULL:function(){return Ir},DAILY_ACCESS_LEVEL_LOBBY:function(){return Dr},DAILY_ACCESS_LEVEL_NONE:function(){return Nr},DAILY_ACCESS_UNKNOWN:function(){return Lr},DAILY_CAMERA_ERROR_CAM_AND_MIC_IN_USE:function(){return Hr},DAILY_CAMERA_ERROR_CAM_IN_USE:function(){return Wr},DAILY_CAMERA_ERROR_CONSTRAINTS:function(){return Zr},DAILY_CAMERA_ERROR_MIC_IN_USE:function(){return zr},DAILY_CAMERA_ERROR_NOT_FOUND:function(){return Xr},DAILY_CAMERA_ERROR_PERMISSIONS:function(){return Qr},DAILY_CAMERA_ERROR_UNDEF_MEDIADEVICES:function(){return Kr},DAILY_CAMERA_ERROR_UNKNOWN:function(){return ei},DAILY_EVENT_ACCESS_STATE_UPDATED:function(){return gi},DAILY_EVENT_ACTIVE_SPEAKER_CHANGE:function(){return Ji},DAILY_EVENT_ACTIVE_SPEAKER_MODE_CHANGE:function(){return Yi},DAILY_EVENT_APP_MSG:function(){return Ni},DAILY_EVENT_CAMERA_ERROR:function(){return ci},DAILY_EVENT_CPU_LOAD_CHANGE:function(){return Gi},DAILY_EVENT_ERROR:function(){return io},DAILY_EVENT_EXIT_FULLSCREEN:function(){return Hi},DAILY_EVENT_FACE_COUNTS_UPDATED:function(){return Wi},DAILY_EVENT_FULLSCREEN:function(){return zi},DAILY_EVENT_IFRAME_LAUNCH_CONFIG:function(){return ni},DAILY_EVENT_IFRAME_READY_FOR_LAUNCH_CONFIG:function(){return ti},DAILY_EVENT_INPUT_SETTINGS_UPDATED:function(){return no},DAILY_EVENT_JOINED_MEETING:function(){return li},DAILY_EVENT_JOINING_MEETING:function(){return ui},DAILY_EVENT_LANG_UPDATED:function(){return eo},DAILY_EVENT_LEFT_MEETING:function(){return di},DAILY_EVENT_LIVE_STREAMING_ERROR:function(){return Zi},DAILY_EVENT_LIVE_STREAMING_STARTED:function(){return Qi},DAILY_EVENT_LIVE_STREAMING_STOPPED:function(){return Xi},DAILY_EVENT_LIVE_STREAMING_UPDATED:function(){return Ki},DAILY_EVENT_LOADED:function(){return ai},DAILY_EVENT_LOADING:function(){return ii},DAILY_EVENT_LOAD_ATTEMPT_FAILED:function(){return oi},DAILY_EVENT_LOCAL_SCREEN_SHARE_CANCELED:function(){return Ui},DAILY_EVENT_LOCAL_SCREEN_SHARE_STARTED:function(){return Vi},DAILY_EVENT_LOCAL_SCREEN_SHARE_STOPPED:function(){return Bi},DAILY_EVENT_MEETING_SESSION_DATA_ERROR:function(){return _i},DAILY_EVENT_MEETING_SESSION_STATE_UPDATED:function(){return yi},DAILY_EVENT_MEETING_SESSION_SUMMARY_UPDATED:function(){return mi},DAILY_EVENT_NETWORK_CONNECTION:function(){return qi},DAILY_EVENT_NETWORK_QUALITY_CHANGE:function(){return $i},DAILY_EVENT_NONFATAL_ERROR:function(){return ro},DAILY_EVENT_PARTICIPANT_COUNTS_UPDATED:function(){return vi},DAILY_EVENT_PARTICIPANT_JOINED:function(){return fi},DAILY_EVENT_PARTICIPANT_LEFT:function(){return hi},DAILY_EVENT_PARTICIPANT_UPDATED:function(){return pi},DAILY_EVENT_RECEIVE_SETTINGS_UPDATED:function(){return to},DAILY_EVENT_RECORDING_DATA:function(){return Di},DAILY_EVENT_RECORDING_ERROR:function(){return Li},DAILY_EVENT_RECORDING_STARTED:function(){return Ci},DAILY_EVENT_RECORDING_STATS:function(){return Oi},DAILY_EVENT_RECORDING_STOPPED:function(){return Pi},DAILY_EVENT_RECORDING_UPLOAD_COMPLETED:function(){return Ii},DAILY_EVENT_REMOTE_MEDIA_PLAYER_STARTED:function(){return ji},DAILY_EVENT_REMOTE_MEDIA_PLAYER_STOPPED:function(){return Fi},DAILY_EVENT_REMOTE_MEDIA_PLAYER_UPDATED:function(){return xi},DAILY_EVENT_STARTED_CAMERA:function(){return si},DAILY_EVENT_THEME_UPDATED:function(){return ri},DAILY_EVENT_TRACK_STARTED:function(){return ki},DAILY_EVENT_TRACK_STOPPED:function(){return Ei},DAILY_EVENT_TRANSCRIPTION_ERROR:function(){return Ai},DAILY_EVENT_TRANSCRIPTION_MSG:function(){return Ri},DAILY_EVENT_TRANSCRIPTION_STARTED:function(){return Ti},DAILY_EVENT_TRANSCRIPTION_STOPPED:function(){return Mi},DAILY_EVENT_WAITING_PARTICIPANT_ADDED:function(){return bi},DAILY_EVENT_WAITING_PARTICIPANT_REMOVED:function(){return wi},DAILY_EVENT_WAITING_PARTICIPANT_UPDATED:function(){return Si},DAILY_FATAL_ERROR_CONNECTION:function(){return Gr},DAILY_FATAL_ERROR_EJECTED:function(){return xr},DAILY_FATAL_ERROR_EOL:function(){return $r},DAILY_FATAL_ERROR_EXP_ROOM:function(){return Br},DAILY_FATAL_ERROR_EXP_TOKEN:function(){return Ur},DAILY_FATAL_ERROR_MEETING_FULL:function(){return Yr},DAILY_FATAL_ERROR_NBF_ROOM:function(){return Fr},DAILY_FATAL_ERROR_NBF_TOKEN:function(){return Vr},DAILY_FATAL_ERROR_NOT_ALLOWED:function(){return qr},DAILY_FATAL_ERROR_NO_ROOM:function(){return Jr},DAILY_RECEIVE_SETTINGS_ALL_PARTICIPANTS_KEY:function(){return jr},DAILY_RECEIVE_SETTINGS_BASE_KEY:function(){return Rr},DAILY_STATE_ERROR:function(){return Er},DAILY_STATE_JOINED:function(){return wr},DAILY_STATE_JOINING:function(){return Sr},DAILY_STATE_LEFT:function(){return kr},DAILY_STATE_NEW:function(){return yr},DAILY_TRACK_STATE_BLOCKED:function(){return Tr},DAILY_TRACK_STATE_INTERRUPTED:function(){return Pr},DAILY_TRACK_STATE_LOADING:function(){return Cr},DAILY_TRACK_STATE_OFF:function(){return Mr},DAILY_TRACK_STATE_PLAYABLE:function(){return Or},DAILY_TRACK_STATE_SENDABLE:function(){return Ar},default:function(){return Va}});var _=n(7),b=n.n(_),S=Object.prototype.hasOwnProperty;function w(e,t,n){for(n of e.keys())if(k(n,t))return n}function k(e,t){var n,r,i;if(e===t)return!0;if(e&&t&&(n=e.constructor)===t.constructor){if(n===Date)return e.getTime()===t.getTime();if(n===RegExp)return e.toString()===t.toString();if(n===Array){if((r=e.length)===t.length)for(;r--&&k(e[r],t[r]););return-1===r}if(n===Set){if(e.size!==t.size)return!1;for(r of e){if((i=r)&&"object"==typeof i&&!(i=w(t,i)))return!1;if(!t.has(i))return!1}return!0}if(n===Map){if(e.size!==t.size)return!1;for(r of e){if((i=r[0])&&"object"==typeof i&&!(i=w(t,i)))return!1;if(!k(r[1],t.get(i)))return!1}return!0}if(n===ArrayBuffer)e=new Uint8Array(e),t=new Uint8Array(t);else if(n===DataView){if((r=e.byteLength)===t.byteLength)for(;r--&&e.getInt8(r)===t.getInt8(r););return-1===r}if(ArrayBuffer.isView(e)){if((r=e.byteLength)===t.byteLength)for(;r--&&e[r]===t[r];);return-1===r}if(!n||"object"==typeof e){for(n in r=0,e){if(S.call(e,n)&&++r&&!S.call(t,n))return!1;if(!(n in t)||!k(e[n],t[n]))return!1}return Object.keys(t).length===r}}return e!=e&&t!=t}var E=n(880),T=n.n(E);function M(){return Date.now()+Math.random().toString()}function A(){throw new Error("Method must be implemented in subclass")}function C(e,t){return null!=t&&t.proxyUrl?t.proxyUrl+("/"===t.proxyUrl.slice(-1)?"":"/")+e.substring(8):e}function P(e){return null!=e&&e.callObjectBundleUrlOverride?e.callObjectBundleUrlOverride:C("https://c.daily.co/call-machine/versioned/".concat("0.75.2","/static/call-machine-object-bundle.js"),e)}function O(e){try{new URL(e)}catch(e){return!1}return!0}const L="undefined"==typeof __SENTRY_DEBUG__||__SENTRY_DEBUG__,I="8.33.1",D=globalThis;function N(e,t,n){const r=n||D,i=r.__SENTRY__=r.__SENTRY__||{},o=i[I]=i[I]||{};return o[e]||(o[e]=t())}const R=["debug","info","warn","error","log","assert","trace"],j={};function x(e){if(!("console"in D))return e();const t=D.console,n={},r=Object.keys(j);r.forEach((e=>{const r=j[e];n[e]=t[e],t[e]=r}));try{return e()}finally{r.forEach((e=>{t[e]=n[e]}))}}const F=N("logger",(function(){let e=!1;const t={enable:()=>{e=!0},disable:()=>{e=!1},isEnabled:()=>e};return L?R.forEach((n=>{t[n]=(...t)=>{e&&x((()=>{D.console[n](`Sentry Logger [${n}]:`,...t)}))}})):R.forEach((e=>{t[e]=()=>{}})),t})),V=Object.prototype.toString;function B(e){switch(V.call(e)){case"[object Error]":case"[object Exception]":case"[object DOMException]":return!0;default:return Q(e,Error)}}function U(e,t){return V.call(e)===`[object ${t}]`}function J(e){return U(e,"ErrorEvent")}function Y(e){return U(e,"DOMError")}function $(e){return U(e,"String")}function q(e){return"object"==typeof e&&null!==e&&"__sentry_template_string__"in e&&"__sentry_template_values__"in e}function G(e){return null===e||q(e)||"object"!=typeof e&&"function"!=typeof e}function W(e){return U(e,"Object")}function z(e){return"undefined"!=typeof Event&&Q(e,Event)}function H(e){return Boolean(e&&e.then&&"function"==typeof e.then)}function Q(e,t){try{return e instanceof t}catch(e){return!1}}function K(e){return!("object"!=typeof e||null===e||!e.__isVue&&!e._isVue)}const X=D;function Z(e,t={}){if(!e)return"<unknown>";try{let n=e;const r=5,i=[];let o=0,a=0;const s=" > ",c=s.length;let u;const l=Array.isArray(t)?t:t.keyAttrs,d=!Array.isArray(t)&&t.maxStringLength||80;for(;n&&o++<r&&(u=ee(n,l),!("html"===u||o>1&&a+i.length*c+u.length>=d));)i.push(u),a+=u.length,n=n.parentNode;return i.reverse().join(s)}catch(e){return"<unknown>"}}function ee(e,t){const n=e,r=[];if(!n||!n.tagName)return"";if(X.HTMLElement&&n instanceof HTMLElement&&n.dataset){if(n.dataset.sentryComponent)return n.dataset.sentryComponent;if(n.dataset.sentryElement)return n.dataset.sentryElement}r.push(n.tagName.toLowerCase());const i=t&&t.length?t.filter((e=>n.getAttribute(e))).map((e=>[e,n.getAttribute(e)])):null;if(i&&i.length)i.forEach((e=>{r.push(`[${e[0]}="${e[1]}"]`)}));else{n.id&&r.push(`#${n.id}`);const e=n.className;if(e&&$(e)){const t=e.split(/\s+/);for(const e of t)r.push(`.${e}`)}}const o=["aria-label","type","name","title","alt"];for(const e of o){const t=n.getAttribute(e);t&&r.push(`[${e}="${t}"]`)}return r.join("")}function te(e,t=0){return"string"!=typeof e||0===t||e.length<=t?e:`${e.slice(0,t)}...`}function ne(e,t){if(!Array.isArray(e))return"";const n=[];for(let t=0;t<e.length;t++){const r=e[t];try{K(r)?n.push("[VueViewModel]"):n.push(String(r))}catch(e){n.push("[value cannot be serialized]")}}return n.join(t)}function re(e,t=[],n=!1){return t.some((t=>function(e,t,n=!1){return!!$(e)&&(U(t,"RegExp")?t.test(e):!!$(t)&&(n?e===t:e.includes(t)))}(e,t,n)))}function ie(e,t,n){if(!(t in e))return;const r=e[t],i=n(r);"function"==typeof i&&ae(i,r),e[t]=i}function oe(e,t,n){try{Object.defineProperty(e,t,{value:n,writable:!0,configurable:!0})}catch(n){L&&F.log(`Failed to add non-enumerable property "${t}" to object`,e)}}function ae(e,t){try{const n=t.prototype||{};e.prototype=t.prototype=n,oe(e,"__sentry_original__",t)}catch(e){}}function se(e){return e.__sentry_original__}function ce(e){if(B(e))return{message:e.message,name:e.name,stack:e.stack,...le(e)};if(z(e)){const t={type:e.type,target:ue(e.target),currentTarget:ue(e.currentTarget),...le(e)};return"undefined"!=typeof CustomEvent&&Q(e,CustomEvent)&&(t.detail=e.detail),t}return e}function ue(e){try{return"undefined"!=typeof Element&&Q(e,Element)?Z(e):Object.prototype.toString.call(e)}catch(e){return"<unknown>"}}function le(e){if("object"==typeof e&&null!==e){const t={};for(const n in e)Object.prototype.hasOwnProperty.call(e,n)&&(t[n]=e[n]);return t}return{}}function de(e){return fe(e,new Map)}function fe(e,t){if(function(e){if(!W(e))return!1;try{const t=Object.getPrototypeOf(e).constructor.name;return!t||"Object"===t}catch(e){return!0}}(e)){const n=t.get(e);if(void 0!==n)return n;const r={};t.set(e,r);for(const n of Object.getOwnPropertyNames(e))void 0!==e[n]&&(r[n]=fe(e[n],t));return r}if(Array.isArray(e)){const n=t.get(e);if(void 0!==n)return n;const r=[];return t.set(e,r),e.forEach((e=>{r.push(fe(e,t))})),r}return e}function pe(){const e=D,t=e.crypto||e.msCrypto;let n=()=>16*Math.random();try{if(t&&t.randomUUID)return t.randomUUID().replace(/-/g,"");t&&t.getRandomValues&&(n=()=>{const e=new Uint8Array(1);return t.getRandomValues(e),e[0]})}catch(e){}return([1e7]+1e3+4e3+8e3+1e11).replace(/[018]/g,(e=>(e^(15&n())>>e/4).toString(16)))}function he(e){return e.exception&&e.exception.values?e.exception.values[0]:void 0}function ve(e){const{message:t,event_id:n}=e;if(t)return t;const r=he(e);return r?r.type&&r.value?`${r.type}: ${r.value}`:r.type||r.value||n||"<unknown>":n||"<unknown>"}function ge(e,t,n){const r=e.exception=e.exception||{},i=r.values=r.values||[],o=i[0]=i[0]||{};o.value||(o.value=t||""),o.type||(o.type=n||"Error")}function me(e,t){const n=he(e);if(!n)return;const r=n.mechanism;if(n.mechanism={type:"generic",handled:!0,...r,...t},t&&"data"in t){const e={...r&&r.data,...t.data};n.mechanism.data=e}}function ye(e){if(e&&e.__sentry_captured__)return!0;try{oe(e,"__sentry_captured__",!0)}catch(e){}return!1}const _e="undefined"==typeof __SENTRY_DEBUG__||__SENTRY_DEBUG__,be=[];function Se(e,t){for(const n of t)n&&n.afterAllSetup&&n.afterAllSetup(e)}function we(e,t,n){if(n[t.name])_e&&F.log(`Integration skipped because it was already installed: ${t.name}`);else{if(n[t.name]=t,-1===be.indexOf(t.name)&&"function"==typeof t.setupOnce&&(t.setupOnce(),be.push(t.name)),t.setup&&"function"==typeof t.setup&&t.setup(e),"function"==typeof t.preprocessEvent){const n=t.preprocessEvent.bind(t);e.on("preprocessEvent",((t,r)=>n(t,r,e)))}if("function"==typeof t.processEvent){const n=t.processEvent.bind(t),r=Object.assign(((t,r)=>n(t,r,e)),{id:t.name});e.addEventProcessor(r)}_e&&F.log(`Integration installed: ${t.name}`)}}const ke=[/^Script error\.?$/,/^Javascript error: Script error\.? on line 0$/,/^ResizeObserver loop completed with undelivered notifications.$/,/^Cannot redefine property: googletag$/,"undefined is not an object (evaluating 'a.L')",'can\'t redefine non-configurable property "solana"',"vv().getRestrictions is not a function. (In 'vv().getRestrictions(1,a)', 'vv().getRestrictions' is undefined)","Can't find variable: _AutofillCallbackHandler"],Ee=(e={})=>({name:"InboundFilters",processEvent(t,n,r){const i=r.getOptions(),o=function(e={},t={}){return{allowUrls:[...e.allowUrls||[],...t.allowUrls||[]],denyUrls:[...e.denyUrls||[],...t.denyUrls||[]],ignoreErrors:[...e.ignoreErrors||[],...t.ignoreErrors||[],...e.disableErrorDefaults?[]:ke],ignoreTransactions:[...e.ignoreTransactions||[],...t.ignoreTransactions||[]],ignoreInternal:void 0===e.ignoreInternal||e.ignoreInternal}}(e,i);return function(e,t){return t.ignoreInternal&&function(e){try{return"SentryError"===e.exception.values[0].type}catch(e){}return!1}(e)?(_e&&F.warn(`Event dropped due to being internal Sentry Error.\nEvent: ${ve(e)}`),!0):function(e,t){return!(e.type||!t||!t.length)&&function(e){const t=[];let n;e.message&&t.push(e.message);try{n=e.exception.values[e.exception.values.length-1]}catch(e){}return n&&n.value&&(t.push(n.value),n.type&&t.push(`${n.type}: ${n.value}`)),t}(e).some((e=>re(e,t)))}(e,t.ignoreErrors)?(_e&&F.warn(`Event dropped due to being matched by \`ignoreErrors\` option.\nEvent: ${ve(e)}`),!0):function(e){return!e.type&&(!(!e.exception||!e.exception.values||0===e.exception.values.length)&&(!e.message&&!e.exception.values.some((e=>e.stacktrace||e.type&&"Error"!==e.type||e.value))))}(e)?(_e&&F.warn(`Event dropped due to not having an error message, error type or stacktrace.\nEvent: ${ve(e)}`),!0):function(e,t){if("transaction"!==e.type||!t||!t.length)return!1;const n=e.transaction;return!!n&&re(n,t)}(e,t.ignoreTransactions)?(_e&&F.warn(`Event dropped due to being matched by \`ignoreTransactions\` option.\nEvent: ${ve(e)}`),!0):function(e,t){if(!t||!t.length)return!1;const n=Te(e);return!!n&&re(n,t)}(e,t.denyUrls)?(_e&&F.warn(`Event dropped due to being matched by \`denyUrls\` option.\nEvent: ${ve(e)}.\nUrl: ${Te(e)}`),!0):!function(e,t){if(!t||!t.length)return!0;const n=Te(e);return!n||re(n,t)}(e,t.allowUrls)&&(_e&&F.warn(`Event dropped due to not being matched by \`allowUrls\` option.\nEvent: ${ve(e)}.\nUrl: ${Te(e)}`),!0)}(t,o)?null:t}});function Te(e){try{let t;try{t=e.exception.values[0].stacktrace.frames}catch(e){}return t?function(e=[]){for(let t=e.length-1;t>=0;t--){const n=e[t];if(n&&"<anonymous>"!==n.filename&&"[native code]"!==n.filename)return n.filename||null}return null}(t):null}catch(t){return _e&&F.error(`Cannot extract url for event ${ve(e)}`),null}}function Me(){return Ae(D),D}function Ae(e){const t=e.__SENTRY__=e.__SENTRY__||{};return t.version=t.version||I,t[I]=t[I]||{}}function Ce(){return{traceId:pe(),spanId:pe().substring(16)}}function Pe(){return Date.now()/1e3}const Oe=function(){const{performance:e}=D;if(!e||!e.now)return Pe;const t=Date.now()-e.now(),n=null==e.timeOrigin?t:e.timeOrigin;return()=>(n+e.now())/1e3}();let Le;function Ie(e,t={}){if(t.user&&(!e.ipAddress&&t.user.ip_address&&(e.ipAddress=t.user.ip_address),e.did||t.did||(e.did=t.user.id||t.user.email||t.user.username)),e.timestamp=t.timestamp||Oe(),t.abnormal_mechanism&&(e.abnormal_mechanism=t.abnormal_mechanism),t.ignoreDuration&&(e.ignoreDuration=t.ignoreDuration),t.sid&&(e.sid=32===t.sid.length?t.sid:pe()),void 0!==t.init&&(e.init=t.init),!e.did&&t.did&&(e.did=`${t.did}`),"number"==typeof t.started&&(e.started=t.started),e.ignoreDuration)e.duration=void 0;else if("number"==typeof t.duration)e.duration=t.duration;else{const t=e.timestamp-e.started;e.duration=t>=0?t:0}t.release&&(e.release=t.release),t.environment&&(e.environment=t.environment),!e.ipAddress&&t.ipAddress&&(e.ipAddress=t.ipAddress),!e.userAgent&&t.userAgent&&(e.userAgent=t.userAgent),"number"==typeof t.errors&&(e.errors=t.errors),t.status&&(e.status=t.status)}(()=>{const{performance:e}=D;if(!e||!e.now)return void(Le="none");const t=36e5,n=e.now(),r=Date.now(),i=e.timeOrigin?Math.abs(e.timeOrigin+n-r):t,o=i<t,a=e.timing&&e.timing.navigationStart,s="number"==typeof a?Math.abs(a+n-r):t;o||s<t?i<=s?(Le="timeOrigin",e.timeOrigin):Le="navigationStart":Le="dateNow"})();const De="_sentrySpan";function Ne(e,t){t?oe(e,De,t):delete e[De]}function Re(e){return e[De]}class je{constructor(){this._notifyingListeners=!1,this._scopeListeners=[],this._eventProcessors=[],this._breadcrumbs=[],this._attachments=[],this._user={},this._tags={},this._extra={},this._contexts={},this._sdkProcessingMetadata={},this._propagationContext=Ce()}clone(){const e=new je;return e._breadcrumbs=[...this._breadcrumbs],e._tags={...this._tags},e._extra={...this._extra},e._contexts={...this._contexts},e._user=this._user,e._level=this._level,e._session=this._session,e._transactionName=this._transactionName,e._fingerprint=this._fingerprint,e._eventProcessors=[...this._eventProcessors],e._requestSession=this._requestSession,e._attachments=[...this._attachments],e._sdkProcessingMetadata={...this._sdkProcessingMetadata},e._propagationContext={...this._propagationContext},e._client=this._client,e._lastEventId=this._lastEventId,Ne(e,Re(this)),e}setClient(e){this._client=e}setLastEventId(e){this._lastEventId=e}getClient(){return this._client}lastEventId(){return this._lastEventId}addScopeListener(e){this._scopeListeners.push(e)}addEventProcessor(e){return this._eventProcessors.push(e),this}setUser(e){return this._user=e||{email:void 0,id:void 0,ip_address:void 0,username:void 0},this._session&&Ie(this._session,{user:e}),this._notifyScopeListeners(),this}getUser(){return this._user}getRequestSession(){return this._requestSession}setRequestSession(e){return this._requestSession=e,this}setTags(e){return this._tags={...this._tags,...e},this._notifyScopeListeners(),this}setTag(e,t){return this._tags={...this._tags,[e]:t},this._notifyScopeListeners(),this}setExtras(e){return this._extra={...this._extra,...e},this._notifyScopeListeners(),this}setExtra(e,t){return this._extra={...this._extra,[e]:t},this._notifyScopeListeners(),this}setFingerprint(e){return this._fingerprint=e,this._notifyScopeListeners(),this}setLevel(e){return this._level=e,this._notifyScopeListeners(),this}setTransactionName(e){return this._transactionName=e,this._notifyScopeListeners(),this}setContext(e,t){return null===t?delete this._contexts[e]:this._contexts[e]=t,this._notifyScopeListeners(),this}setSession(e){return e?this._session=e:delete this._session,this._notifyScopeListeners(),this}getSession(){return this._session}update(e){if(!e)return this;const t="function"==typeof e?e(this):e,[n,r]=t instanceof xe?[t.getScopeData(),t.getRequestSession()]:W(t)?[e,e.requestSession]:[],{tags:i,extra:o,user:a,contexts:s,level:c,fingerprint:u=[],propagationContext:l}=n||{};return this._tags={...this._tags,...i},this._extra={...this._extra,...o},this._contexts={...this._contexts,...s},a&&Object.keys(a).length&&(this._user=a),c&&(this._level=c),u.length&&(this._fingerprint=u),l&&(this._propagationContext=l),r&&(this._requestSession=r),this}clear(){return this._breadcrumbs=[],this._tags={},this._extra={},this._user={},this._contexts={},this._level=void 0,this._transactionName=void 0,this._fingerprint=void 0,this._requestSession=void 0,this._session=void 0,Ne(this,void 0),this._attachments=[],this._propagationContext=Ce(),this._notifyScopeListeners(),this}addBreadcrumb(e,t){const n="number"==typeof t?t:100;if(n<=0)return this;const r={timestamp:Pe(),...e},i=this._breadcrumbs;return i.push(r),this._breadcrumbs=i.length>n?i.slice(-n):i,this._notifyScopeListeners(),this}getLastBreadcrumb(){return this._breadcrumbs[this._breadcrumbs.length-1]}clearBreadcrumbs(){return this._breadcrumbs=[],this._notifyScopeListeners(),this}addAttachment(e){return this._attachments.push(e),this}clearAttachments(){return this._attachments=[],this}getScopeData(){return{breadcrumbs:this._breadcrumbs,attachments:this._attachments,contexts:this._contexts,tags:this._tags,extra:this._extra,user:this._user,level:this._level,fingerprint:this._fingerprint||[],eventProcessors:this._eventProcessors,propagationContext:this._propagationContext,sdkProcessingMetadata:this._sdkProcessingMetadata,transactionName:this._transactionName,span:Re(this)}}setSDKProcessingMetadata(e){return this._sdkProcessingMetadata={...this._sdkProcessingMetadata,...e},this}setPropagationContext(e){return this._propagationContext=e,this}getPropagationContext(){return this._propagationContext}captureException(e,t){const n=t&&t.event_id?t.event_id:pe();if(!this._client)return F.warn("No client configured on scope - will not capture exception!"),n;const r=new Error("Sentry syntheticException");return this._client.captureException(e,{originalException:e,syntheticException:r,...t,event_id:n},this),n}captureMessage(e,t,n){const r=n&&n.event_id?n.event_id:pe();if(!this._client)return F.warn("No client configured on scope - will not capture message!"),r;const i=new Error(e);return this._client.captureMessage(e,t,{originalException:e,syntheticException:i,...n,event_id:r},this),r}captureEvent(e,t){const n=t&&t.event_id?t.event_id:pe();return this._client?(this._client.captureEvent(e,{...t,event_id:n},this),n):(F.warn("No client configured on scope - will not capture event!"),n)}_notifyScopeListeners(){this._notifyingListeners||(this._notifyingListeners=!0,this._scopeListeners.forEach((e=>{e(this)})),this._notifyingListeners=!1)}}const xe=je;class Fe{constructor(e,t){let n,r;n=e||new xe,r=t||new xe,this._stack=[{scope:n}],this._isolationScope=r}withScope(e){const t=this._pushScope();let n;try{n=e(t)}catch(e){throw this._popScope(),e}return H(n)?n.then((e=>(this._popScope(),e)),(e=>{throw this._popScope(),e})):(this._popScope(),n)}getClient(){return this.getStackTop().client}getScope(){return this.getStackTop().scope}getIsolationScope(){return this._isolationScope}getStackTop(){return this._stack[this._stack.length-1]}_pushScope(){const e=this.getScope().clone();return this._stack.push({client:this.getClient(),scope:e}),e}_popScope(){return!(this._stack.length<=1||!this._stack.pop())}}function Ve(){const e=Ae(Me());return e.stack=e.stack||new Fe(N("defaultCurrentScope",(()=>new xe)),N("defaultIsolationScope",(()=>new xe)))}function Be(e){return Ve().withScope(e)}function Ue(e,t){const n=Ve();return n.withScope((()=>(n.getStackTop().scope=e,t(e))))}function Je(e){return Ve().withScope((()=>e(Ve().getIsolationScope())))}function Ye(e){const t=Ae(e);return t.acs?t.acs:{withIsolationScope:Je,withScope:Be,withSetScope:Ue,withSetIsolationScope:(e,t)=>Je(t),getCurrentScope:()=>Ve().getScope(),getIsolationScope:()=>Ve().getIsolationScope()}}function $e(){return Ye(Me()).getCurrentScope()}function qe(){return Ye(Me()).getIsolationScope()}function Ge(){return $e().getClient()}let We;const ze=new WeakMap,He=()=>({name:"FunctionToString",setupOnce(){We=Function.prototype.toString;try{Function.prototype.toString=function(...e){const t=se(this),n=ze.has(Ge())&&void 0!==t?t:this;return We.apply(n,e)}}catch(e){}},setup(e){ze.set(e,!0)}}),Qe="?",Ke=/\(error: (.*)\)/,Xe=/captureMessage|captureException/;function Ze(e){return e[e.length-1]||{}}const et="<anonymous>";function tt(e){try{return e&&"function"==typeof e&&e.name||et}catch(e){return et}}function nt(e){const t=e.exception;if(t){const e=[];try{return t.values.forEach((t=>{t.stacktrace.frames&&e.push(...t.stacktrace.frames)})),e}catch(e){return}}}const rt=()=>{let e;return{name:"Dedupe",processEvent(t){if(t.type)return t;try{if(function(e,t){return!!t&&(!!function(e,t){const n=e.message,r=t.message;return!(!n&&!r)&&(!(n&&!r||!n&&r)&&(n===r&&(!!ot(e,t)&&!!it(e,t))))}(e,t)||!!function(e,t){const n=at(t),r=at(e);return!(!n||!r)&&(n.type===r.type&&n.value===r.value&&(!!ot(e,t)&&!!it(e,t)))}(e,t))}(t,e))return _e&&F.warn("Event dropped due to being a duplicate of previously captured event."),null}catch(e){}return e=t}}};function it(e,t){let n=nt(e),r=nt(t);if(!n&&!r)return!0;if(n&&!r||!n&&r)return!1;if(r.length!==n.length)return!1;for(let e=0;e<r.length;e++){const t=r[e],i=n[e];if(t.filename!==i.filename||t.lineno!==i.lineno||t.colno!==i.colno||t.function!==i.function)return!1}return!0}function ot(e,t){let n=e.fingerprint,r=t.fingerprint;if(!n&&!r)return!0;if(n&&!r||!n&&r)return!1;try{return!(n.join("")!==r.join(""))}catch(e){return!1}}function at(e){return e.exception&&e.exception.values&&e.exception.values[0]}const st={},ct={};function ut(e,t){st[e]=st[e]||[],st[e].push(t)}function lt(e,t){ct[e]||(t(),ct[e]=!0)}function dt(e,t){const n=e&&st[e];if(n)for(const r of n)try{r(t)}catch(t){L&&F.error(`Error while triggering instrumentation handler.\nType: ${e}\nName: ${tt(r)}\nError:`,t)}}const ft=D;let pt,ht,vt;function gt(){if(!ft.document)return;const e=dt.bind(null,"dom"),t=mt(e,!0);ft.document.addEventListener("click",t,!1),ft.document.addEventListener("keypress",t,!1),["EventTarget","Node"].forEach((t=>{const n=ft[t]&&ft[t].prototype;n&&n.hasOwnProperty&&n.hasOwnProperty("addEventListener")&&(ie(n,"addEventListener",(function(t){return function(n,r,i){if("click"===n||"keypress"==n)try{const r=this,o=r.__sentry_instrumentation_handlers__=r.__sentry_instrumentation_handlers__||{},a=o[n]=o[n]||{refCount:0};if(!a.handler){const r=mt(e);a.handler=r,t.call(this,n,r,i)}a.refCount++}catch(e){}return t.call(this,n,r,i)}})),ie(n,"removeEventListener",(function(e){return function(t,n,r){if("click"===t||"keypress"==t)try{const n=this,i=n.__sentry_instrumentation_handlers__||{},o=i[t];o&&(o.refCount--,o.refCount<=0&&(e.call(this,t,o.handler,r),o.handler=void 0,delete i[t]),0===Object.keys(i).length&&delete n.__sentry_instrumentation_handlers__)}catch(e){}return e.call(this,t,n,r)}})))}))}function mt(e,t=!1){return n=>{if(!n||n._sentryCaptured)return;const r=function(e){try{return e.target}catch(e){return null}}(n);if(function(e,t){return"keypress"===e&&(!t||!t.tagName||"INPUT"!==t.tagName&&"TEXTAREA"!==t.tagName&&!t.isContentEditable)}(n.type,r))return;oe(n,"_sentryCaptured",!0),r&&!r._sentryId&&oe(r,"_sentryId",pe());const i="keypress"===n.type?"input":n.type;(function(e){if(e.type!==ht)return!1;try{if(!e.target||e.target._sentryId!==vt)return!1}catch(e){}return!0})(n)||(e({event:n,name:i,global:t}),ht=n.type,vt=r?r._sentryId:void 0),clearTimeout(pt),pt=ft.setTimeout((()=>{vt=void 0,ht=void 0}),1e3)}}const yt="__sentry_xhr_v3__";function _t(){if(!ft.XMLHttpRequest)return;const e=XMLHttpRequest.prototype;e.open=new Proxy(e.open,{apply(e,t,n){const r=1e3*Oe(),i=$(n[0])?n[0].toUpperCase():void 0,o=function(e){if($(e))return e;try{return e.toString()}catch(e){}}(n[1]);if(!i||!o)return e.apply(t,n);t[yt]={method:i,url:o,request_headers:{}},"POST"===i&&o.match(/sentry_key/)&&(t.__sentry_own_request__=!0);const a=()=>{const e=t[yt];if(e&&4===t.readyState){try{e.status_code=t.status}catch(e){}dt("xhr",{endTimestamp:1e3*Oe(),startTimestamp:r,xhr:t})}};return"onreadystatechange"in t&&"function"==typeof t.onreadystatechange?t.onreadystatechange=new Proxy(t.onreadystatechange,{apply(e,t,n){return a(),e.apply(t,n)}}):t.addEventListener("readystatechange",a),t.setRequestHeader=new Proxy(t.setRequestHeader,{apply(e,t,n){const[r,i]=n,o=t[yt];return o&&$(r)&&$(i)&&(o.request_headers[r.toLowerCase()]=i),e.apply(t,n)}}),e.apply(t,n)}}),e.send=new Proxy(e.send,{apply(e,t,n){const r=t[yt];return r?(void 0!==n[0]&&(r.body=n[0]),dt("xhr",{startTimestamp:1e3*Oe(),xhr:t}),e.apply(t,n)):e.apply(t,n)}})}const bt=D;let St;function wt(){if(!function(){const e=bt.chrome,t=e&&e.app&&e.app.runtime,n="history"in bt&&!!bt.history.pushState&&!!bt.history.replaceState;return!t&&n}())return;const e=ft.onpopstate;function t(e){return function(...t){const n=t.length>2?t[2]:void 0;if(n){const e=St,t=String(n);St=t,dt("history",{from:e,to:t})}return e.apply(this,t)}}ft.onpopstate=function(...t){const n=ft.location.href,r=St;if(St=n,dt("history",{from:r,to:n}),e)try{return e.apply(this,t)}catch(e){}},ie(ft.history,"pushState",t),ie(ft.history,"replaceState",t)}const kt=100;function Et(e,t){const n=Ge(),r=qe();if(!n)return;const{beforeBreadcrumb:i=null,maxBreadcrumbs:o=kt}=n.getOptions();if(o<=0)return;const a={timestamp:Pe(),...e},s=i?x((()=>i(a,t))):a;null!==s&&(n.emit&&n.emit("beforeAddBreadcrumb",s,t),r.addBreadcrumb(s,o))}function Tt(){"console"in D&&R.forEach((function(e){e in D.console&&ie(D.console,e,(function(t){return j[e]=t,function(...t){dt("console",{args:t,level:e});const n=j[e];n&&n.apply(D.console,t)}}))}))}const Mt=D;function At(e){return e&&/^function\s+\w+\(\)\s+\{\s+\[native code\]\s+\}$/.test(e.toString())}function Ct(e,t=!1){t&&!function(){if("string"==typeof EdgeRuntime)return!0;if(!function(){if(!("fetch"in Mt))return!1;try{return new Headers,new Request("http://www.example.com"),new Response,!0}catch(e){return!1}}())return!1;if(At(Mt.fetch))return!0;let e=!1;const t=Mt.document;if(t&&"function"==typeof t.createElement)try{const n=t.createElement("iframe");n.hidden=!0,t.head.appendChild(n),n.contentWindow&&n.contentWindow.fetch&&(e=At(n.contentWindow.fetch)),t.head.removeChild(n)}catch(e){L&&F.warn("Could not create sandbox iframe for pure fetch check, bailing to window.fetch: ",e)}return e}()||ie(D,"fetch",(function(t){return function(...n){const{method:r,url:i}=function(e){if(0===e.length)return{method:"GET",url:""};if(2===e.length){const[t,n]=e;return{url:Ot(t),method:Pt(n,"method")?String(n.method).toUpperCase():"GET"}}const t=e[0];return{url:Ot(t),method:Pt(t,"method")?String(t.method).toUpperCase():"GET"}}(n),o={args:n,fetchData:{method:r,url:i},startTimestamp:1e3*Oe()};e||dt("fetch",{...o});const a=(new Error).stack;return t.apply(D,n).then((async t=>(e?e(t):dt("fetch",{...o,endTimestamp:1e3*Oe(),response:t}),t)),(e=>{throw dt("fetch",{...o,endTimestamp:1e3*Oe(),error:e}),B(e)&&void 0===e.stack&&(e.stack=a,oe(e,"framesToPop",1)),e}))}}))}function Pt(e,t){return!!e&&"object"==typeof e&&!!e[t]}function Ot(e){return"string"==typeof e?e:e?Pt(e,"url")?e.url:e.toString?e.toString():"":""}const Lt=["fatal","error","warning","log","info","debug"];function It(e){return void 0===e?void 0:e>=400&&e<500?"warning":e>=500?"error":void 0}function Dt(e){if(!e)return{};const t=e.match(/^(([^:/?#]+):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?$/);if(!t)return{};const n=t[6]||"",r=t[8]||"";return{host:t[4],path:t[5],protocol:t[2],search:n,hash:r,relative:t[5]+n+r}}const Nt="undefined"==typeof __SENTRY_DEBUG__||__SENTRY_DEBUG__;function Rt(e,t=100,n=1/0){try{return xt("",e,t,n)}catch(e){return{ERROR:`**non-serializable** (${e})`}}}function jt(e,t=3,n=102400){const r=Rt(e,t);return i=r,function(e){return~-encodeURI(e).split(/%..|./).length}(JSON.stringify(i))>n?jt(e,t-1,n):r;var i}function xt(e,t,n=1/0,r=1/0,i=function(){const e="function"==typeof WeakSet,t=e?new WeakSet:[];return[function(n){if(e)return!!t.has(n)||(t.add(n),!1);for(let e=0;e<t.length;e++)if(t[e]===n)return!0;return t.push(n),!1},function(n){if(e)t.delete(n);else for(let e=0;e<t.length;e++)if(t[e]===n){t.splice(e,1);break}}]}()){const[o,a]=i;if(null==t||["boolean","string"].includes(typeof t)||"number"==typeof t&&Number.isFinite(t))return t;const s=function(e,t){try{if("domain"===e&&t&&"object"==typeof t&&t._events)return"[Domain]";if("domainEmitter"===e)return"[DomainEmitter]";if("undefined"!=typeof window&&t===window)return"[Global]";if("undefined"!=typeof window&&t===window)return"[Window]";if("undefined"!=typeof document&&t===document)return"[Document]";if(K(t))return"[VueViewModel]";if(W(n=t)&&"nativeEvent"in n&&"preventDefault"in n&&"stopPropagation"in n)return"[SyntheticEvent]";if("number"==typeof t&&!Number.isFinite(t))return`[${t}]`;if("function"==typeof t)return`[Function: ${tt(t)}]`;if("symbol"==typeof t)return`[${String(t)}]`;if("bigint"==typeof t)return`[BigInt: ${String(t)}]`;const r=function(e){const t=Object.getPrototypeOf(e);return t?t.constructor.name:"null prototype"}(t);return/^HTML(\w*)Element$/.test(r)?`[HTMLElement: ${r}]`:`[object ${r}]`}catch(e){return`**non-serializable** (${e})`}var n}(e,t);if(!s.startsWith("[object "))return s;if(t.__sentry_skip_normalization__)return t;const c="number"==typeof t.__sentry_override_normalization_depth__?t.__sentry_override_normalization_depth__:n;if(0===c)return s.replace("object ","");if(o(t))return"[Circular ~]";const u=t;if(u&&"function"==typeof u.toJSON)try{return xt("",u.toJSON(),c-1,r,i)}catch(e){}const l=Array.isArray(t)?[]:{};let d=0;const f=ce(t);for(const e in f){if(!Object.prototype.hasOwnProperty.call(f,e))continue;if(d>=r){l[e]="[MaxProperties ~]";break}const t=f[e];l[e]=xt(e,t,c-1,r,i),d++}return a(t),l}const Ft="production";var Vt;function Bt(e){return new Jt((t=>{t(e)}))}function Ut(e){return new Jt(((t,n)=>{n(e)}))}!function(e){e[e.PENDING=0]="PENDING",e[e.RESOLVED=1]="RESOLVED",e[e.REJECTED=2]="REJECTED"}(Vt||(Vt={}));class Jt{constructor(e){Jt.prototype.__init.call(this),Jt.prototype.__init2.call(this),Jt.prototype.__init3.call(this),Jt.prototype.__init4.call(this),this._state=Vt.PENDING,this._handlers=[];try{e(this._resolve,this._reject)}catch(e){this._reject(e)}}then(e,t){return new Jt(((n,r)=>{this._handlers.push([!1,t=>{if(e)try{n(e(t))}catch(e){r(e)}else n(t)},e=>{if(t)try{n(t(e))}catch(e){r(e)}else r(e)}]),this._executeHandlers()}))}catch(e){return this.then((e=>e),e)}finally(e){return new Jt(((t,n)=>{let r,i;return this.then((t=>{i=!1,r=t,e&&e()}),(t=>{i=!0,r=t,e&&e()})).then((()=>{i?n(r):t(r)}))}))}__init(){this._resolve=e=>{this._setResult(Vt.RESOLVED,e)}}__init2(){this._reject=e=>{this._setResult(Vt.REJECTED,e)}}__init3(){this._setResult=(e,t)=>{this._state===Vt.PENDING&&(H(t)?t.then(this._resolve,this._reject):(this._state=e,this._value=t,this._executeHandlers()))}}__init4(){this._executeHandlers=()=>{if(this._state===Vt.PENDING)return;const e=this._handlers.slice();this._handlers=[],e.forEach((e=>{e[0]||(this._state===Vt.RESOLVED&&e[1](this._value),this._state===Vt.REJECTED&&e[2](this._value),e[0]=!0)}))}}}function Yt(e,t,n,r=0){return new Jt(((i,o)=>{const a=e[r];if(null===t||"function"!=typeof a)i(t);else{const s=a({...t},n);_e&&a.id&&null===s&&F.log(`Event processor "${a.id}" dropped event`),H(s)?s.then((t=>Yt(e,t,n,r+1).then(i))).then(null,o):Yt(e,s,n,r+1).then(i).then(null,o)}}))}const $t=/^sentry-/;function qt(e){return e.split(",").map((e=>e.split("=").map((e=>decodeURIComponent(e.trim()))))).reduce(((e,[t,n])=>(t&&n&&(e[t]=n),e)),{})}function Gt(e){const t=e._sentryMetrics;if(!t)return;const n={};for(const[,[e,r]]of t)(n[e]||(n[e]=[])).push(de(r));return n}function Wt(e){const{spanId:t,traceId:n}=e.spanContext(),{parent_span_id:r}=Qt(e);return de({parent_span_id:r,span_id:t,trace_id:n})}function zt(e){return"number"==typeof e?Ht(e):Array.isArray(e)?e[0]+e[1]/1e9:e instanceof Date?Ht(e.getTime()):Oe()}function Ht(e){return e>9999999999?e/1e3:e}function Qt(e){if(function(e){return"function"==typeof e.getSpanJSON}(e))return e.getSpanJSON();try{const{spanId:t,traceId:n}=e.spanContext();if(function(e){const t=e;return!!(t.attributes&&t.startTime&&t.name&&t.endTime&&t.status)}(e)){const{attributes:r,startTime:i,name:o,endTime:a,parentSpanId:s,status:c}=e;return de({span_id:t,trace_id:n,data:r,description:o,parent_span_id:s,start_timestamp:zt(i),timestamp:zt(a)||void 0,status:Kt(c),op:r["sentry.op"],origin:r["sentry.origin"],_metrics_summary:Gt(e)})}return{span_id:t,trace_id:n}}catch(e){return{}}}function Kt(e){if(e&&0!==e.code)return 1===e.code?"ok":e.message||"unknown_error"}function Xt(e){return e._sentryRootSpan||e}function Zt(e,t){const n=t.getOptions(),{publicKey:r}=t.getDsn()||{},i=de({environment:n.environment||Ft,release:n.release,public_key:r,trace_id:e});return t.emit("createDsc",i),i}function en(e){const t=Ge();if(!t)return{};const n=Zt(Qt(e).trace_id||"",t),r=Xt(e),i=r._frozenDsc;if(i)return i;const o=r.spanContext().traceState,a=o&&o.get("sentry.dsc"),s=a&&function(e){const t=function(e){if(e&&($(e)||Array.isArray(e)))return Array.isArray(e)?e.reduce(((e,t)=>{const n=qt(t);return Object.entries(n).forEach((([t,n])=>{e[t]=n})),e}),{}):qt(e)}(e);if(!t)return;const n=Object.entries(t).reduce(((e,[t,n])=>(t.match($t)&&(e[t.slice(7)]=n),e)),{});return Object.keys(n).length>0?n:void 0}(a);if(s)return s;const c=Qt(r),u=c.data||{},l=u["sentry.sample_rate"];null!=l&&(n.sample_rate=`${l}`);const d=u["sentry.source"],f=c.description;return"url"!==d&&f&&(n.transaction=f),function(){if("boolean"==typeof __SENTRY_TRACING__&&!__SENTRY_TRACING__)return!1;const e=Ge(),t=e&&e.getOptions();return!!t&&(t.enableTracing||"tracesSampleRate"in t||"tracesSampler"in t)}()&&(n.sampled=String(function(e){const{traceFlags:t}=e.spanContext();return 1===t}(r))),t.emit("createDsc",n,r),n}function tn(e,t){const{extra:n,tags:r,user:i,contexts:o,level:a,sdkProcessingMetadata:s,breadcrumbs:c,fingerprint:u,eventProcessors:l,attachments:d,propagationContext:f,transactionName:p,span:h}=t;nn(e,"extra",n),nn(e,"tags",r),nn(e,"user",i),nn(e,"contexts",o),nn(e,"sdkProcessingMetadata",s),a&&(e.level=a),p&&(e.transactionName=p),h&&(e.span=h),c.length&&(e.breadcrumbs=[...e.breadcrumbs,...c]),u.length&&(e.fingerprint=[...e.fingerprint,...u]),l.length&&(e.eventProcessors=[...e.eventProcessors,...l]),d.length&&(e.attachments=[...e.attachments,...d]),e.propagationContext={...e.propagationContext,...f}}function nn(e,t,n){if(n&&Object.keys(n).length){e[t]={...e[t]};for(const r in n)Object.prototype.hasOwnProperty.call(n,r)&&(e[t][r]=n[r])}}function rn(e,t,n,r,i,o){const{normalizeDepth:a=3,normalizeMaxBreadth:s=1e3}=e,c={...t,event_id:t.event_id||n.event_id||pe(),timestamp:t.timestamp||Pe()},u=n.integrations||e.integrations.map((e=>e.name));!function(e,t){const{environment:n,release:r,dist:i,maxValueLength:o=250}=t;"environment"in e||(e.environment="environment"in t?n:Ft),void 0===e.release&&void 0!==r&&(e.release=r),void 0===e.dist&&void 0!==i&&(e.dist=i),e.message&&(e.message=te(e.message,o));const a=e.exception&&e.exception.values&&e.exception.values[0];a&&a.value&&(a.value=te(a.value,o));const s=e.request;s&&s.url&&(s.url=te(s.url,o))}(c,e),function(e,t){t.length>0&&(e.sdk=e.sdk||{},e.sdk.integrations=[...e.sdk.integrations||[],...t])}(c,u),i&&i.emit("applyFrameMetadata",t),void 0===t.type&&function(e,t){const n=D._sentryDebugIds;if(!n)return;let r;const i=on.get(t);i?r=i:(r=new Map,on.set(t,r));const o=Object.entries(n).reduce(((e,[n,i])=>{let o;const a=r.get(n);a?o=a:(o=t(n),r.set(n,o));for(let t=o.length-1;t>=0;t--){const n=o[t];if(n.filename){e[n.filename]=i;break}}return e}),{});try{e.exception.values.forEach((e=>{e.stacktrace.frames.forEach((e=>{e.filename&&(e.debug_id=o[e.filename])}))}))}catch(e){}}(c,e.stackParser);const l=function(e,t){if(!t)return e;const n=e?e.clone():new xe;return n.update(t),n}(r,n.captureContext);n.mechanism&&me(c,n.mechanism);const d=i?i.getEventProcessors():[],f=N("globalScope",(()=>new xe)).getScopeData();o&&tn(f,o.getScopeData()),l&&tn(f,l.getScopeData());const p=[...n.attachments||[],...f.attachments];return p.length&&(n.attachments=p),function(e,t){const{fingerprint:n,span:r,breadcrumbs:i,sdkProcessingMetadata:o}=t;!function(e,t){const{extra:n,tags:r,user:i,contexts:o,level:a,transactionName:s}=t,c=de(n);c&&Object.keys(c).length&&(e.extra={...c,...e.extra});const u=de(r);u&&Object.keys(u).length&&(e.tags={...u,...e.tags});const l=de(i);l&&Object.keys(l).length&&(e.user={...l,...e.user});const d=de(o);d&&Object.keys(d).length&&(e.contexts={...d,...e.contexts}),a&&(e.level=a),s&&"transaction"!==e.type&&(e.transaction=s)}(e,t),r&&function(e,t){e.contexts={trace:Wt(t),...e.contexts},e.sdkProcessingMetadata={dynamicSamplingContext:en(t),...e.sdkProcessingMetadata};const n=Qt(Xt(t)).description;n&&!e.transaction&&"transaction"===e.type&&(e.transaction=n)}(e,r),function(e,t){var n;e.fingerprint=e.fingerprint?(n=e.fingerprint,Array.isArray(n)?n:[n]):[],t&&(e.fingerprint=e.fingerprint.concat(t)),e.fingerprint&&!e.fingerprint.length&&delete e.fingerprint}(e,n),function(e,t){const n=[...e.breadcrumbs||[],...t];e.breadcrumbs=n.length?n:void 0}(e,i),function(e,t){e.sdkProcessingMetadata={...e.sdkProcessingMetadata,...t}}(e,o)}(c,f),Yt([...d,...f.eventProcessors],c,n).then((e=>(e&&function(e){const t={};try{e.exception.values.forEach((e=>{e.stacktrace.frames.forEach((e=>{e.debug_id&&(e.abs_path?t[e.abs_path]=e.debug_id:e.filename&&(t[e.filename]=e.debug_id),delete e.debug_id)}))}))}catch(e){}if(0===Object.keys(t).length)return;e.debug_meta=e.debug_meta||{},e.debug_meta.images=e.debug_meta.images||[];const n=e.debug_meta.images;Object.entries(t).forEach((([e,t])=>{n.push({type:"sourcemap",code_file:e,debug_id:t})}))}(e),"number"==typeof a&&a>0?function(e,t,n){if(!e)return null;const r={...e,...e.breadcrumbs&&{breadcrumbs:e.breadcrumbs.map((e=>({...e,...e.data&&{data:Rt(e.data,t,n)}})))},...e.user&&{user:Rt(e.user,t,n)},...e.contexts&&{contexts:Rt(e.contexts,t,n)},...e.extra&&{extra:Rt(e.extra,t,n)}};return e.contexts&&e.contexts.trace&&r.contexts&&(r.contexts.trace=e.contexts.trace,e.contexts.trace.data&&(r.contexts.trace.data=Rt(e.contexts.trace.data,t,n))),e.spans&&(r.spans=e.spans.map((e=>({...e,...e.data&&{data:Rt(e.data,t,n)}})))),r}(e,a,s):e)))}const on=new WeakMap;const an=["user","level","extra","contexts","tags","fingerprint","requestSession","propagationContext"];function sn(e,t){return $e().captureEvent(e,t)}const cn=D;let un=0;function ln(){return un>0}function dn(e,t={},n){if("function"!=typeof e)return e;try{const t=e.__sentry_wrapped__;if(t)return"function"==typeof t?t:e;if(se(e))return e}catch(t){return e}const r=function(){const r=Array.prototype.slice.call(arguments);try{n&&"function"==typeof n&&n.apply(this,arguments);const i=r.map((e=>dn(e,t)));return e.apply(this,i)}catch(e){throw un++,setTimeout((()=>{un--})),function(...e){const t=Ye(Me());if(2===e.length){const[n,r]=e;return n?t.withSetScope(n,r):t.withScope(r)}t.withScope(e[0])}((n=>{var i;n.addEventProcessor((e=>(t.mechanism&&(ge(e,void 0,void 0),me(e,t.mechanism)),e.extra={...e.extra,arguments:r},e))),i=e,$e().captureException(i,function(e){if(e)return function(e){return e instanceof xe||"function"==typeof e}(e)||function(e){return Object.keys(e).some((e=>an.includes(e)))}(e)?{captureContext:e}:e}(undefined))})),e}};try{for(const t in e)Object.prototype.hasOwnProperty.call(e,t)&&(r[t]=e[t])}catch(e){}ae(r,e),oe(e,"__sentry_wrapped__",r);try{Object.getOwnPropertyDescriptor(r,"name").configurable&&Object.defineProperty(r,"name",{get(){return e.name}})}catch(e){}return r}const fn=(e={})=>{const t={console:!0,dom:!0,fetch:!0,history:!0,sentry:!0,xhr:!0,...e};return{name:"Breadcrumbs",setup(e){var n;t.console&&function(e){const t="console";ut(t,e),lt(t,Tt)}(function(e){return function(t){if(Ge()!==e)return;const n={category:"console",data:{arguments:t.args,logger:"console"},level:(r=t.level,"warn"===r?"warning":Lt.includes(r)?r:"log"),message:ne(t.args," ")};var r;if("assert"===t.level){if(!1!==t.args[0])return;n.message=`Assertion failed: ${ne(t.args.slice(1)," ")||"console.assert"}`,n.data.arguments=t.args.slice(1)}Et(n,{input:t.args,level:t.level})}}(e)),t.dom&&(n=function(e,t){return function(n){if(Ge()!==e)return;let r,i,o="object"==typeof t?t.serializeAttribute:void 0,a="object"==typeof t&&"number"==typeof t.maxStringLength?t.maxStringLength:void 0;a&&a>1024&&(Nt&&F.warn(`\`dom.maxStringLength\` cannot exceed 1024, but a value of ${a} was configured. Sentry will use 1024 instead.`),a=1024),"string"==typeof o&&(o=[o]);try{const e=n.event,t=function(e){return!!e&&!!e.target}(e)?e.target:e;r=Z(t,{keyAttrs:o,maxStringLength:a}),i=function(e){if(!X.HTMLElement)return null;let t=e;for(let e=0;e<5;e++){if(!t)return null;if(t instanceof HTMLElement){if(t.dataset.sentryComponent)return t.dataset.sentryComponent;if(t.dataset.sentryElement)return t.dataset.sentryElement}t=t.parentNode}return null}(t)}catch(e){r="<unknown>"}if(0===r.length)return;const s={category:`ui.${n.name}`,message:r};i&&(s.data={"ui.component_name":i}),Et(s,{event:n.event,name:n.name,global:n.global})}}(e,t.dom),ut("dom",n),lt("dom",gt)),t.xhr&&function(e){ut("xhr",e),lt("xhr",_t)}(function(e){return function(t){if(Ge()!==e)return;const{startTimestamp:n,endTimestamp:r}=t,i=t.xhr[yt];if(!n||!r||!i)return;const{method:o,url:a,status_code:s,body:c}=i,u={method:o,url:a,status_code:s},l={xhr:t.xhr,input:c,startTimestamp:n,endTimestamp:r};Et({category:"xhr",data:u,type:"http",level:It(s)},l)}}(e)),t.fetch&&function(e){const t="fetch";ut(t,e),lt(t,(()=>Ct(void 0,undefined)))}(function(e){return function(t){if(Ge()!==e)return;const{startTimestamp:n,endTimestamp:r}=t;if(r&&(!t.fetchData.url.match(/sentry_key/)||"POST"!==t.fetchData.method))if(t.error)Et({category:"fetch",data:t.fetchData,level:"error",type:"http"},{data:t.error,input:t.args,startTimestamp:n,endTimestamp:r});else{const e=t.response,i={...t.fetchData,status_code:e&&e.status},o={input:t.args,response:e,startTimestamp:n,endTimestamp:r};Et({category:"fetch",data:i,type:"http",level:It(i.status_code)},o)}}}(e)),t.history&&function(e){const t="history";ut(t,e),lt(t,wt)}(function(e){return function(t){if(Ge()!==e)return;let n=t.from,r=t.to;const i=Dt(cn.location.href);let o=n?Dt(n):void 0;const a=Dt(r);o&&o.path||(o=i),i.protocol===a.protocol&&i.host===a.host&&(r=a.relative),i.protocol===o.protocol&&i.host===o.host&&(n=o.relative),Et({category:"navigation",data:{from:n,to:r}})}}(e)),t.sentry&&e.on("beforeSendEvent",function(e){return function(t){Ge()===e&&Et({category:"sentry."+("transaction"===t.type?"transaction":"event"),event_id:t.event_id,level:t.level,message:ve(t)},{event:t})}}(e))}}},pn=["EventTarget","Window","Node","ApplicationCache","AudioTrackList","BroadcastChannel","ChannelMergerNode","CryptoOperation","EventSource","FileReader","HTMLUnknownElement","IDBDatabase","IDBRequest","IDBTransaction","KeyOperation","MediaController","MessagePort","ModalWindow","Notification","SVGElementInstance","Screen","SharedWorker","TextTrack","TextTrackCue","TextTrackList","WebSocket","WebSocketWorker","Worker","XMLHttpRequest","XMLHttpRequestEventTarget","XMLHttpRequestUpload"],hn=(e={})=>{const t={XMLHttpRequest:!0,eventTarget:!0,requestAnimationFrame:!0,setInterval:!0,setTimeout:!0,...e};return{name:"BrowserApiErrors",setupOnce(){t.setTimeout&&ie(cn,"setTimeout",vn),t.setInterval&&ie(cn,"setInterval",vn),t.requestAnimationFrame&&ie(cn,"requestAnimationFrame",gn),t.XMLHttpRequest&&"XMLHttpRequest"in cn&&ie(XMLHttpRequest.prototype,"send",mn);const e=t.eventTarget;e&&(Array.isArray(e)?e:pn).forEach(yn)}}};function vn(e){return function(...t){const n=t[0];return t[0]=dn(n,{mechanism:{data:{function:tt(e)},handled:!1,type:"instrument"}}),e.apply(this,t)}}function gn(e){return function(t){return e.apply(this,[dn(t,{mechanism:{data:{function:"requestAnimationFrame",handler:tt(e)},handled:!1,type:"instrument"}})])}}function mn(e){return function(...t){const n=this;return["onload","onerror","onprogress","onreadystatechange"].forEach((e=>{e in n&&"function"==typeof n[e]&&ie(n,e,(function(t){const n={mechanism:{data:{function:e,handler:tt(t)},handled:!1,type:"instrument"}},r=se(t);return r&&(n.mechanism.data.handler=tt(r)),dn(t,n)}))})),e.apply(this,t)}}function yn(e){const t=cn,n=t[e]&&t[e].prototype;n&&n.hasOwnProperty&&n.hasOwnProperty("addEventListener")&&(ie(n,"addEventListener",(function(t){return function(n,r,i){try{"function"==typeof r.handleEvent&&(r.handleEvent=dn(r.handleEvent,{mechanism:{data:{function:"handleEvent",handler:tt(r),target:e},handled:!1,type:"instrument"}}))}catch(e){}return t.apply(this,[n,dn(r,{mechanism:{data:{function:"addEventListener",handler:tt(r),target:e},handled:!1,type:"instrument"}}),i])}})),ie(n,"removeEventListener",(function(e){return function(t,n,r){const i=n;try{const n=i&&i.__sentry_wrapped__;n&&e.call(this,t,n,r)}catch(e){}return e.call(this,t,i,r)}})))}let _n=null;function bn(){_n=D.onerror,D.onerror=function(e,t,n,r,i){return dt("error",{column:r,error:i,line:n,msg:e,url:t}),!(!_n||_n.__SENTRY_LOADER__)&&_n.apply(this,arguments)},D.onerror.__SENTRY_INSTRUMENTED__=!0}let Sn=null;function wn(){Sn=D.onunhandledrejection,D.onunhandledrejection=function(e){return dt("unhandledrejection",e),!(Sn&&!Sn.__SENTRY_LOADER__)||Sn.apply(this,arguments)},D.onunhandledrejection.__SENTRY_INSTRUMENTED__=!0}function kn(e,t){const n=Tn(e,t),r={type:t&&t.name,value:An(t)};return n.length&&(r.stacktrace={frames:n}),void 0===r.type&&""===r.value&&(r.value="Unrecoverable error caught"),r}function En(e,t){return{exception:{values:[kn(e,t)]}}}function Tn(e,t){const n=t.stacktrace||t.stack||"",r=function(e){return e&&Mn.test(e.message)?1:0}(t),i=function(e){return"number"==typeof e.framesToPop?e.framesToPop:0}(t);try{return e(n,r,i)}catch(e){}return[]}const Mn=/Minified React error #\d+;/i;function An(e){const t=e&&e.message;return t?t.error&&"string"==typeof t.error.message?t.error.message:t:"No error message"}function Cn(e,t,n,r,i){let o;if(J(t)&&t.error)return En(e,t.error);if(Y(t)||U(t,"DOMException")){const i=t;if("stack"in t)o=En(e,t);else{const t=i.name||(Y(i)?"DOMError":"DOMException"),a=i.message?`${t}: ${i.message}`:t;o=Pn(e,a,n,r),ge(o,a)}return"code"in i&&(o.tags={...o.tags,"DOMException.code":`${i.code}`}),o}return B(t)?En(e,t):W(t)||z(t)?(o=function(e,t,n,r){const i=Ge(),o=i&&i.getOptions().normalizeDepth,a=function(e){for(const t in e)if(Object.prototype.hasOwnProperty.call(e,t)){const n=e[t];if(n instanceof Error)return n}}(t),s={__serialized__:jt(t,o)};if(a)return{exception:{values:[kn(e,a)]},extra:s};const c={exception:{values:[{type:z(t)?t.constructor.name:r?"UnhandledRejection":"Error",value:On(t,{isUnhandledRejection:r})}]},extra:s};if(n){const t=Tn(e,n);t.length&&(c.exception.values[0].stacktrace={frames:t})}return c}(e,t,n,i),me(o,{synthetic:!0}),o):(o=Pn(e,t,n,r),ge(o,`${t}`,void 0),me(o,{synthetic:!0}),o)}function Pn(e,t,n,r){const i={};if(r&&n){const r=Tn(e,n);r.length&&(i.exception={values:[{value:t,stacktrace:{frames:r}}]})}if(q(t)){const{__sentry_template_string__:e,__sentry_template_values__:n}=t;return i.logentry={message:e,params:n},i}return i.message=t,i}function On(e,{isUnhandledRejection:t}){const n=function(e,t=40){const n=Object.keys(ce(e));n.sort();const r=n[0];if(!r)return"[object has no keys]";if(r.length>=t)return te(r,t);for(let e=n.length;e>0;e--){const r=n.slice(0,e).join(", ");if(!(r.length>t))return e===n.length?r:te(r,t)}return""}(e),r=t?"promise rejection":"exception";return J(e)?`Event \`ErrorEvent\` captured as ${r} with message \`${e.message}\``:z(e)?`Event \`${function(e){try{const t=Object.getPrototypeOf(e);return t?t.constructor.name:void 0}catch(e){}}(e)}\` (type=${e.type}) captured as ${r}`:`Object captured as ${r} with keys: ${n}`}const Ln=(e={})=>{const t={onerror:!0,onunhandledrejection:!0,...e};return{name:"GlobalHandlers",setupOnce(){Error.stackTraceLimit=50},setup(e){t.onerror&&(function(e){!function(){const t="error";ut(t,(t=>{const{stackParser:n,attachStacktrace:r}=Dn();if(Ge()!==e||ln())return;const{msg:i,url:o,line:a,column:s,error:c}=t,u=function(e,t,n,r){const i=e.exception=e.exception||{},o=i.values=i.values||[],a=o[0]=o[0]||{},s=a.stacktrace=a.stacktrace||{},c=s.frames=s.frames||[],u=isNaN(parseInt(r,10))?void 0:r,l=isNaN(parseInt(n,10))?void 0:n,d=$(t)&&t.length>0?t:function(){try{return X.document.location.href}catch(e){return""}}();return 0===c.length&&c.push({colno:u,filename:d,function:Qe,in_app:!0,lineno:l}),e}(Cn(n,c||i,void 0,r,!1),o,a,s);u.level="error",sn(u,{originalException:c,mechanism:{handled:!1,type:"onerror"}})})),lt(t,bn)}()}(e),In("onerror")),t.onunhandledrejection&&(function(e){!function(){const t="unhandledrejection";ut(t,(t=>{const{stackParser:n,attachStacktrace:r}=Dn();if(Ge()!==e||ln())return;const i=function(e){if(G(e))return e;try{if("reason"in e)return e.reason;if("detail"in e&&"reason"in e.detail)return e.detail.reason}catch(e){}return e}(t),o=G(i)?{exception:{values:[{type:"UnhandledRejection",value:`Non-Error promise rejection captured with value: ${String(i)}`}]}}:Cn(n,i,void 0,r,!0);o.level="error",sn(o,{originalException:i,mechanism:{handled:!1,type:"onunhandledrejection"}})})),lt(t,wn)}()}(e),In("onunhandledrejection"))}}};function In(e){Nt&&F.log(`Global Handler attached: ${e}`)}function Dn(){const e=Ge();return e&&e.getOptions()||{stackParser:()=>[],attachStacktrace:!1}}function Nn(e,t,n=250,r,i,o,a){if(!(o.exception&&o.exception.values&&a&&Q(a.originalException,Error)))return;const s=o.exception.values.length>0?o.exception.values[o.exception.values.length-1]:void 0;var c,u;s&&(o.exception.values=(c=Rn(e,t,i,a.originalException,r,o.exception.values,s,0),u=n,c.map((e=>(e.value&&(e.value=te(e.value,u)),e)))))}function Rn(e,t,n,r,i,o,a,s){if(o.length>=n+1)return o;let c=[...o];if(Q(r[i],Error)){jn(a,s);const o=e(t,r[i]),u=c.length;xn(o,i,u,s),c=Rn(e,t,n,r[i],i,[o,...c],o,u)}return Array.isArray(r.errors)&&r.errors.forEach(((r,o)=>{if(Q(r,Error)){jn(a,s);const u=e(t,r),l=c.length;xn(u,`errors[${o}]`,l,s),c=Rn(e,t,n,r,i,[u,...c],u,l)}})),c}function jn(e,t){e.mechanism=e.mechanism||{type:"generic",handled:!0},e.mechanism={...e.mechanism,..."AggregateError"===e.type&&{is_exception_group:!0},exception_id:t}}function xn(e,t,n,r){e.mechanism=e.mechanism||{type:"generic",handled:!0},e.mechanism={...e.mechanism,type:"chained",source:t,exception_id:n,parent_id:r}}const Fn=(e={})=>{const t=e.limit||5,n=e.key||"cause";return{name:"LinkedErrors",preprocessEvent(e,r,i){const o=i.getOptions();Nn(kn,o.stackParser,o.maxValueLength,n,t,e,r)}}};const Vn=/^(?:(\w+):)\/\/(?:(\w+)(?::(\w+)?)?@)([\w.-]+)(?::(\d+))?\/(.+)/;function Bn(e,t=!1){const{host:n,path:r,pass:i,port:o,projectId:a,protocol:s,publicKey:c}=e;return`${s}://${c}${t&&i?`:${i}`:""}@${n}${o?`:${o}`:""}/${r?`${r}/`:r}${a}`}function Un(e){return{protocol:e.protocol,publicKey:e.publicKey||"",pass:e.pass||"",host:e.host,port:e.port||"",path:e.path||"",projectId:e.projectId}}function Jn(e,t=[]){return[e,t]}function Yn(e,t){const[n,r]=e;return[n,[...r,t]]}function $n(e,t){const n=e[1];for(const e of n)if(t(e,e[0].type))return!0;return!1}function qn(e){return D.__SENTRY__&&D.__SENTRY__.encodePolyfill?D.__SENTRY__.encodePolyfill(e):(new TextEncoder).encode(e)}function Gn(e){const[t,n]=e;let r=JSON.stringify(t);function i(e){"string"==typeof r?r="string"==typeof e?r+e:[qn(r),e]:r.push("string"==typeof e?qn(e):e)}for(const e of n){const[t,n]=e;if(i(`\n${JSON.stringify(t)}\n`),"string"==typeof n||n instanceof Uint8Array)i(n);else{let e;try{e=JSON.stringify(n)}catch(t){e=JSON.stringify(Rt(n))}i(e)}}return"string"==typeof r?r:function(e){const t=e.reduce(((e,t)=>e+t.length),0),n=new Uint8Array(t);let r=0;for(const t of e)n.set(t,r),r+=t.length;return n}(r)}function Wn(e){const t="string"==typeof e.data?qn(e.data):e.data;return[de({type:"attachment",length:t.length,filename:e.filename,content_type:e.contentType,attachment_type:e.attachmentType}),t]}const zn={session:"session",sessions:"session",attachment:"attachment",transaction:"transaction",event:"error",client_report:"internal",user_report:"default",profile:"profile",profile_chunk:"profile",replay_event:"replay",replay_recording:"replay",check_in:"monitor",feedback:"feedback",span:"span",statsd:"metric_bucket"};function Hn(e){return zn[e]}function Qn(e){if(!e||!e.sdk)return;const{name:t,version:n}=e.sdk;return{name:t,version:n}}class Kn extends Error{constructor(e,t="warn"){super(e),this.message=e,this.name=new.target.prototype.constructor.name,Object.setPrototypeOf(this,new.target.prototype),this.logLevel=t}}function Xn(e,t,n){return t||`${function(e){return`${function(e){const t=e.protocol?`${e.protocol}:`:"",n=e.port?`:${e.port}`:"";return`${t}//${e.host}${n}${e.path?`/${e.path}`:""}/api/`}(e)}${e.projectId}/envelope/`}(e)}?${function(e,t){return n={sentry_key:e.publicKey,sentry_version:"7",...t&&{sentry_client:`${t.name}/${t.version}`}},Object.keys(n).map((e=>`${encodeURIComponent(e)}=${encodeURIComponent(n[e])}`)).join("&");var n}(e,n)}`}const Zn="Not capturing exception because it's already been captured.";class er{constructor(e){if(this._options=e,this._integrations={},this._numProcessing=0,this._outcomes={},this._hooks={},this._eventProcessors=[],e.dsn?this._dsn=function(e){const t="string"==typeof e?function(e){const t=Vn.exec(e);if(!t)return void x((()=>{console.error(`Invalid Sentry Dsn: ${e}`)}));const[n,r,i="",o="",a="",s=""]=t.slice(1);let c="",u=s;const l=u.split("/");if(l.length>1&&(c=l.slice(0,-1).join("/"),u=l.pop()),u){const e=u.match(/^\d+/);e&&(u=e[0])}return Un({host:o,pass:i,path:c,projectId:u,port:a,protocol:n,publicKey:r})}(e):Un(e);if(t&&function(e){if(!L)return!0;const{port:t,projectId:n,protocol:r}=e;return!(["protocol","publicKey","host","projectId"].find((t=>!e[t]&&(F.error(`Invalid Sentry Dsn: ${t} missing`),!0)))||(n.match(/^\d+$/)?function(e){return"http"===e||"https"===e}(r)?t&&isNaN(parseInt(t,10))&&(F.error(`Invalid Sentry Dsn: Invalid port ${t}`),1):(F.error(`Invalid Sentry Dsn: Invalid protocol ${r}`),1):(F.error(`Invalid Sentry Dsn: Invalid projectId ${n}`),1)))}(t))return t}(e.dsn):_e&&F.warn("No DSN provided, client will not send events."),this._dsn){const t=Xn(this._dsn,e.tunnel,e._metadata?e._metadata.sdk:void 0);this._transport=e.transport({tunnel:this._options.tunnel,recordDroppedEvent:this.recordDroppedEvent.bind(this),...e.transportOptions,url:t})}}captureException(e,t,n){const r=pe();if(ye(e))return _e&&F.log(Zn),r;const i={event_id:r,...t};return this._process(this.eventFromException(e,i).then((e=>this._captureEvent(e,i,n)))),i.event_id}captureMessage(e,t,n,r){const i={event_id:pe(),...n},o=q(e)?e:String(e),a=G(e)?this.eventFromMessage(o,t,i):this.eventFromException(e,i);return this._process(a.then((e=>this._captureEvent(e,i,r)))),i.event_id}captureEvent(e,t,n){const r=pe();if(t&&t.originalException&&ye(t.originalException))return _e&&F.log(Zn),r;const i={event_id:r,...t},o=(e.sdkProcessingMetadata||{}).capturedSpanScope;return this._process(this._captureEvent(e,i,o||n)),i.event_id}captureSession(e){"string"!=typeof e.release?_e&&F.warn("Discarded session because of missing or non-string release"):(this.sendSession(e),Ie(e,{init:!1}))}getDsn(){return this._dsn}getOptions(){return this._options}getSdkMetadata(){return this._options._metadata}getTransport(){return this._transport}flush(e){const t=this._transport;return t?(this.emit("flush"),this._isClientDoneProcessing(e).then((n=>t.flush(e).then((e=>n&&e))))):Bt(!0)}close(e){return this.flush(e).then((e=>(this.getOptions().enabled=!1,this.emit("close"),e)))}getEventProcessors(){return this._eventProcessors}addEventProcessor(e){this._eventProcessors.push(e)}init(){(this._isEnabled()||this._options.integrations.some((({name:e})=>e.startsWith("Spotlight"))))&&this._setupIntegrations()}getIntegrationByName(e){return this._integrations[e]}addIntegration(e){const t=this._integrations[e.name];we(this,e,this._integrations),t||Se(this,[e])}sendEvent(e,t={}){this.emit("beforeSendEvent",e,t);let n=function(e,t,n,r){const i=Qn(n),o=e.type&&"replay_event"!==e.type?e.type:"event";!function(e,t){t&&(e.sdk=e.sdk||{},e.sdk.name=e.sdk.name||t.name,e.sdk.version=e.sdk.version||t.version,e.sdk.integrations=[...e.sdk.integrations||[],...t.integrations||[]],e.sdk.packages=[...e.sdk.packages||[],...t.packages||[]])}(e,n&&n.sdk);const a=function(e,t,n,r){const i=e.sdkProcessingMetadata&&e.sdkProcessingMetadata.dynamicSamplingContext;return{event_id:e.event_id,sent_at:(new Date).toISOString(),...t&&{sdk:t},...!!n&&r&&{dsn:Bn(r)},...i&&{trace:de({...i})}}}(e,i,r,t);return delete e.sdkProcessingMetadata,Jn(a,[[{type:o},e]])}(e,this._dsn,this._options._metadata,this._options.tunnel);for(const e of t.attachments||[])n=Yn(n,Wn(e));const r=this.sendEnvelope(n);r&&r.then((t=>this.emit("afterSendEvent",e,t)),null)}sendSession(e){const t=function(e,t,n,r){const i=Qn(n);return Jn({sent_at:(new Date).toISOString(),...i&&{sdk:i},...!!r&&t&&{dsn:Bn(t)}},["aggregates"in e?[{type:"sessions"},e]:[{type:"session"},e.toJSON()]])}(e,this._dsn,this._options._metadata,this._options.tunnel);this.sendEnvelope(t)}recordDroppedEvent(e,t,n){if(this._options.sendClientReports){const r="number"==typeof n?n:1,i=`${e}:${t}`;_e&&F.log(`Recording outcome: "${i}"${r>1?` (${r} times)`:""}`),this._outcomes[i]=(this._outcomes[i]||0)+r}}on(e,t){const n=this._hooks[e]=this._hooks[e]||[];return n.push(t),()=>{const e=n.indexOf(t);e>-1&&n.splice(e,1)}}emit(e,...t){const n=this._hooks[e];n&&n.forEach((e=>e(...t)))}sendEnvelope(e){return this.emit("beforeEnvelope",e),this._isEnabled()&&this._transport?this._transport.send(e).then(null,(e=>(_e&&F.error("Error while sending event:",e),e))):(_e&&F.error("Transport disabled"),Bt({}))}_setupIntegrations(){const{integrations:e}=this._options;this._integrations=function(e,t){const n={};return t.forEach((t=>{t&&we(e,t,n)})),n}(this,e),Se(this,e)}_updateSessionFromEvent(e,t){let n=!1,r=!1;const i=t.exception&&t.exception.values;if(i){r=!0;for(const e of i){const t=e.mechanism;if(t&&!1===t.handled){n=!0;break}}}const o="ok"===e.status;(o&&0===e.errors||o&&n)&&(Ie(e,{...n&&{status:"crashed"},errors:e.errors||Number(r||n)}),this.captureSession(e))}_isClientDoneProcessing(e){return new Jt((t=>{let n=0;const r=setInterval((()=>{0==this._numProcessing?(clearInterval(r),t(!0)):(n+=1,e&&n>=e&&(clearInterval(r),t(!1)))}),1)}))}_isEnabled(){return!1!==this.getOptions().enabled&&void 0!==this._transport}_prepareEvent(e,t,n,r=qe()){const i=this.getOptions(),o=Object.keys(this._integrations);return!t.integrations&&o.length>0&&(t.integrations=o),this.emit("preprocessEvent",e,t),e.type||r.setLastEventId(e.event_id||t.event_id),rn(i,e,t,n,this,r).then((e=>{if(null===e)return e;const t={...r.getPropagationContext(),...n?n.getPropagationContext():void 0};if((!e.contexts||!e.contexts.trace)&&t){const{traceId:n,spanId:r,parentSpanId:i,dsc:o}=t;e.contexts={trace:de({trace_id:n,span_id:r,parent_span_id:i}),...e.contexts};const a=o||Zt(n,this);e.sdkProcessingMetadata={dynamicSamplingContext:a,...e.sdkProcessingMetadata}}return e}))}_captureEvent(e,t={},n){return this._processEvent(e,t,n).then((e=>e.event_id),(e=>{if(_e){const t=e;"log"===t.logLevel?F.log(t.message):F.warn(t)}}))}_processEvent(e,t,n){const r=this.getOptions(),{sampleRate:i}=r,o=nr(e),a=tr(e),s=e.type||"error",c=`before send for type \`${s}\``,u=void 0===i?void 0:function(e){if("boolean"==typeof e)return Number(e);const t="string"==typeof e?parseFloat(e):e;if(!("number"!=typeof t||isNaN(t)||t<0||t>1))return t;_e&&F.warn(`[Tracing] Given sample rate is invalid. Sample rate must be a boolean or a number between 0 and 1. Got ${JSON.stringify(e)} of type ${JSON.stringify(typeof e)}.`)}(i);if(a&&"number"==typeof u&&Math.random()>u)return this.recordDroppedEvent("sample_rate","error",e),Ut(new Kn(`Discarding event because it's not included in the random sample (sampling rate = ${i})`,"log"));const l="replay_event"===s?"replay":s,d=(e.sdkProcessingMetadata||{}).capturedSpanIsolationScope;return this._prepareEvent(e,t,n,d).then((n=>{if(null===n)throw this.recordDroppedEvent("event_processor",l,e),new Kn("An event processor returned `null`, will not send event.","log");if(t.data&&!0===t.data.__sentry__)return n;const i=function(e,t,n,r){const{beforeSend:i,beforeSendTransaction:o,beforeSendSpan:a}=t;if(tr(n)&&i)return i(n,r);if(nr(n)){if(n.spans&&a){const t=[];for(const r of n.spans){const n=a(r);n?t.push(n):e.recordDroppedEvent("before_send","span")}n.spans=t}if(o){if(n.spans){const e=n.spans.length;n.sdkProcessingMetadata={...n.sdkProcessingMetadata,spanCountBeforeProcessing:e}}return o(n,r)}}return n}(this,r,n,t);return function(e,t){const n=`${t} must return \`null\` or a valid event.`;if(H(e))return e.then((e=>{if(!W(e)&&null!==e)throw new Kn(n);return e}),(e=>{throw new Kn(`${t} rejected with ${e}`)}));if(!W(e)&&null!==e)throw new Kn(n);return e}(i,c)})).then((r=>{if(null===r){if(this.recordDroppedEvent("before_send",l,e),o){const t=1+(e.spans||[]).length;this.recordDroppedEvent("before_send","span",t)}throw new Kn(`${c} returned \`null\`, will not send event.`,"log")}const i=n&&n.getSession();if(!o&&i&&this._updateSessionFromEvent(i,r),o){const e=(r.sdkProcessingMetadata&&r.sdkProcessingMetadata.spanCountBeforeProcessing||0)-(r.spans?r.spans.length:0);e>0&&this.recordDroppedEvent("before_send","span",e)}const a=r.transaction_info;if(o&&a&&r.transaction!==e.transaction){const e="custom";r.transaction_info={...a,source:e}}return this.sendEvent(r,t),r})).then(null,(e=>{if(e instanceof Kn)throw e;throw this.captureException(e,{data:{__sentry__:!0},originalException:e}),new Kn(`Event processing pipeline threw an error, original event will not be sent. Details have been sent as a new event.\nReason: ${e}`)}))}_process(e){this._numProcessing++,e.then((e=>(this._numProcessing--,e)),(e=>(this._numProcessing--,e)))}_clearOutcomes(){const e=this._outcomes;return this._outcomes={},Object.entries(e).map((([e,t])=>{const[n,r]=e.split(":");return{reason:n,category:r,quantity:t}}))}_flushOutcomes(){_e&&F.log("Flushing outcomes...");const e=this._clearOutcomes();if(0===e.length)return void(_e&&F.log("No outcomes to send"));if(!this._dsn)return void(_e&&F.log("No dsn provided, will not send outcomes"));_e&&F.log("Sending outcomes:",e);const t=(n=e,Jn((r=this._options.tunnel&&Bn(this._dsn))?{dsn:r}:{},[[{type:"client_report"},{timestamp:Pe(),discarded_events:n}]]));var n,r;this.sendEnvelope(t)}}function tr(e){return void 0===e.type}function nr(e){return"transaction"===e.type}class rr extends er{constructor(e){const t={parentSpanIsAlwaysRootSpan:!0,...e};!function(e,t,n=[t],r="npm"){const i=e._metadata||{};i.sdk||(i.sdk={name:`sentry.javascript.${t}`,packages:n.map((e=>({name:`${r}:@sentry/${e}`,version:I}))),version:I}),e._metadata=i}(t,"browser",["browser"],cn.SENTRY_SDK_SOURCE||"npm"),super(t),t.sendClientReports&&cn.document&&cn.document.addEventListener("visibilitychange",(()=>{"hidden"===cn.document.visibilityState&&this._flushOutcomes()}))}eventFromException(e,t){return function(e,t,n,r){const i=Cn(e,t,n&&n.syntheticException||void 0,r);return me(i),i.level="error",n&&n.event_id&&(i.event_id=n.event_id),Bt(i)}(this._options.stackParser,e,t,this._options.attachStacktrace)}eventFromMessage(e,t="info",n){return function(e,t,n="info",r,i){const o=Pn(e,t,r&&r.syntheticException||void 0,i);return o.level=n,r&&r.event_id&&(o.event_id=r.event_id),Bt(o)}(this._options.stackParser,e,t,n,this._options.attachStacktrace)}captureUserFeedback(e){if(!this._isEnabled())return void(Nt&&F.warn("SDK not enabled, will not capture user feedback."));const t=function(e,{metadata:t,tunnel:n,dsn:r}){const i={event_id:e.event_id,sent_at:(new Date).toISOString(),...t&&t.sdk&&{sdk:{name:t.sdk.name,version:t.sdk.version}},...!!n&&!!r&&{dsn:Bn(r)}},o=function(e){return[{type:"user_report"},e]}(e);return Jn(i,[o])}(e,{metadata:this.getSdkMetadata(),dsn:this.getDsn(),tunnel:this.getOptions().tunnel});this.sendEnvelope(t)}_prepareEvent(e,t,n){return e.platform=e.platform||"javascript",super._prepareEvent(e,t,n)}}const ir="undefined"==typeof __SENTRY_DEBUG__||__SENTRY_DEBUG__,or={};function ar(e){or[e]=void 0}function sr(e,t,n=function(e){const t=[];function n(e){return t.splice(t.indexOf(e),1)[0]||Promise.resolve(void 0)}return{$:t,add:function(r){if(!(void 0===e||t.length<e))return Ut(new Kn("Not adding Promise because buffer limit was reached."));const i=r();return-1===t.indexOf(i)&&t.push(i),i.then((()=>n(i))).then(null,(()=>n(i).then(null,(()=>{})))),i},drain:function(e){return new Jt(((n,r)=>{let i=t.length;if(!i)return n(!0);const o=setTimeout((()=>{e&&e>0&&n(!1)}),e);t.forEach((e=>{Bt(e).then((()=>{--i||(clearTimeout(o),n(!0))}),r)}))}))}}}(e.bufferSize||64)){let r={};return{send:function(i){const o=[];if($n(i,((t,n)=>{const i=Hn(n);if(function(e,t,n=Date.now()){return function(e,t){return e[t]||e.all||0}(e,t)>n}(r,i)){const r=cr(t,n);e.recordDroppedEvent("ratelimit_backoff",i,r)}else o.push(t)})),0===o.length)return Bt({});const a=Jn(i[0],o),s=t=>{$n(a,((n,r)=>{const i=cr(n,r);e.recordDroppedEvent(t,Hn(r),i)}))};return n.add((()=>t({body:Gn(a)}).then((e=>(void 0!==e.statusCode&&(e.statusCode<200||e.statusCode>=300)&&_e&&F.warn(`Sentry responded with status code ${e.statusCode} to sent event.`),r=function(e,{statusCode:t,headers:n},r=Date.now()){const i={...e},o=n&&n["x-sentry-rate-limits"],a=n&&n["retry-after"];if(o)for(const e of o.trim().split(",")){const[t,n,,,o]=e.split(":",5),a=parseInt(t,10),s=1e3*(isNaN(a)?60:a);if(n)for(const e of n.split(";"))"metric_bucket"===e&&o&&!o.split(";").includes("custom")||(i[e]=r+s);else i.all=r+s}else a?i.all=r+function(e,t=Date.now()){const n=parseInt(`${e}`,10);if(!isNaN(n))return 1e3*n;const r=Date.parse(`${e}`);return isNaN(r)?6e4:r-t}(a,r):429===t&&(i.all=r+6e4);return i}(r,e),e)),(e=>{throw s("network_error"),e})))).then((e=>e),(e=>{if(e instanceof Kn)return _e&&F.error("Skipped sending event because buffer is full."),s("queue_overflow"),Bt({});throw e}))},flush:e=>n.drain(e)}}function cr(e,t){if("event"===t||"transaction"===t)return Array.isArray(e)?e[1]:void 0}function ur(e,t=function(e){const t=or[e];if(t)return t;let n=ft[e];if(At(n))return or[e]=n.bind(ft);const r=ft.document;if(r&&"function"==typeof r.createElement)try{const t=r.createElement("iframe");t.hidden=!0,r.head.appendChild(t);const i=t.contentWindow;i&&i[e]&&(n=i[e]),r.head.removeChild(t)}catch(t){ir&&F.warn(`Could not create sandbox iframe for ${e} check, bailing to window.${e}: `,t)}return n?or[e]=n.bind(ft):n}("fetch")){let n=0,r=0;return sr(e,(function(i){const o=i.body.length;n+=o,r++;const a={body:i.body,method:"POST",referrerPolicy:"origin",headers:e.headers,keepalive:n<=6e4&&r<15,...e.fetchOptions};if(!t)return ar("fetch"),Ut("No fetch implementation available");try{return t(e.url,a).then((e=>(n-=o,r--,{statusCode:e.status,headers:{"x-sentry-rate-limits":e.headers.get("X-Sentry-Rate-Limits"),"retry-after":e.headers.get("Retry-After")}})))}catch(e){return ar("fetch"),n-=o,r--,Ut(e)}}))}function lr(e,t,n,r){const i={filename:e,function:"<anonymous>"===t?Qe:t,in_app:!0};return void 0!==n&&(i.lineno=n),void 0!==r&&(i.colno=r),i}const dr=/^\s*at (\S+?)(?::(\d+))(?::(\d+))\s*$/i,fr=/^\s*at (?:(.+?\)(?: \[.+\])?|.*?) ?\((?:address at )?)?(?:async )?((?:<anonymous>|[-a-z]+:|.*bundle|\/)?.*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i,pr=/\((\S*)(?::(\d+))(?::(\d+))\)/,hr=/^\s*(.*?)(?:\((.*?)\))?(?:^|@)?((?:[-a-z]+)?:\/.*?|\[native code\]|[^@]*(?:bundle|\d+\.js)|\/[\w\-. /=]+)(?::(\d+))?(?::(\d+))?\s*$/i,vr=/(\S+) line (\d+)(?: > eval line \d+)* > eval/i,gr=function(...e){const t=e.sort(((e,t)=>e[0]-t[0])).map((e=>e[1]));return(e,n=0,r=0)=>{const i=[],o=e.split("\n");for(let e=n;e<o.length;e++){const n=o[e];if(n.length>1024)continue;const a=Ke.test(n)?n.replace(Ke,"$1"):n;if(!a.match(/\S*Error: /)){for(const e of t){const t=e(a);if(t){i.push(t);break}}if(i.length>=50+r)break}}return function(e){if(!e.length)return[];const t=Array.from(e);return/sentryWrapped/.test(Ze(t).function||"")&&t.pop(),t.reverse(),Xe.test(Ze(t).function||"")&&(t.pop(),Xe.test(Ze(t).function||"")&&t.pop()),t.slice(0,50).map((e=>({...e,filename:e.filename||Ze(t).filename,function:e.function||Qe})))}(i.slice(r))}}([30,e=>{const t=dr.exec(e);if(t){const[,e,n,r]=t;return lr(e,Qe,+n,+r)}const n=fr.exec(e);if(n){if(n[2]&&0===n[2].indexOf("eval")){const e=pr.exec(n[2]);e&&(n[2]=e[1],n[3]=e[2],n[4]=e[3])}const[e,t]=mr(n[1]||Qe,n[2]);return lr(t,e,n[3]?+n[3]:void 0,n[4]?+n[4]:void 0)}}],[50,e=>{const t=hr.exec(e);if(t){if(t[3]&&t[3].indexOf(" > eval")>-1){const e=vr.exec(t[3]);e&&(t[1]=t[1]||"eval",t[3]=e[1],t[4]=e[2],t[5]="")}let e=t[3],n=t[1]||Qe;return[n,e]=mr(n,e),lr(e,n,t[4]?+t[4]:void 0,t[5]?+t[5]:void 0)}}]),mr=(e,t)=>{const n=-1!==e.indexOf("safari-extension"),r=-1!==e.indexOf("safari-web-extension");return n||r?[-1!==e.indexOf("@")?e.split("@")[0]:Qe,n?`safari-extension:${t}`:`safari-web-extension:${t}`]:[e,t]};var yr="new",_r="loading",br="loaded",Sr="joining-meeting",wr="joined-meeting",kr="left-meeting",Er="error",Tr="blocked",Mr="off",Ar="sendable",Cr="loading",Pr="interrupted",Or="playable",Lr="unknown",Ir="full",Dr="lobby",Nr="none",Rr="base",jr="*",xr="ejected",Fr="nbf-room",Vr="nbf-token",Br="exp-room",Ur="exp-token",Jr="no-room",Yr="meeting-full",$r="end-of-life",qr="not-allowed",Gr="connection-error",Wr="cam-in-use",zr="mic-in-use",Hr="cam-mic-in-use",Qr="permissions",Kr="undefined-mediadevices",Xr="not-found",Zr="constraints",ei="unknown",ti="iframe-ready-for-launch-config",ni="iframe-launch-config",ri="theme-updated",ii="loading",oi="load-attempt-failed",ai="loaded",si="started-camera",ci="camera-error",ui="joining-meeting",li="joined-meeting",di="left-meeting",fi="participant-joined",pi="participant-updated",hi="participant-left",vi="participant-counts-updated",gi="access-state-updated",mi="meeting-session-summary-updated",yi="meeting-session-state-updated",_i="meeting-session-data-error",bi="waiting-participant-added",Si="waiting-participant-updated",wi="waiting-participant-removed",ki="track-started",Ei="track-stopped",Ti="transcription-started",Mi="transcription-stopped",Ai="transcription-error",Ci="recording-started",Pi="recording-stopped",Oi="recording-stats",Li="recording-error",Ii="recording-upload-completed",Di="recording-data",Ni="app-message",Ri="transcription-message",ji="remote-media-player-started",xi="remote-media-player-updated",Fi="remote-media-player-stopped",Vi="local-screen-share-started",Bi="local-screen-share-stopped",Ui="local-screen-share-canceled",Ji="active-speaker-change",Yi="active-speaker-mode-change",$i="network-quality-change",qi="network-connection",Gi="cpu-load-change",Wi="face-counts-updated",zi="fullscreen",Hi="exited-fullscreen",Qi="live-streaming-started",Ki="live-streaming-updated",Xi="live-streaming-stopped",Zi="live-streaming-error",eo="lang-updated",to="receive-settings-updated",no="input-settings-updated",ro="nonfatal-error",io="error",oo=4096,ao=102400,so="iframe-call-message",co="local-screen-start",uo="daily-method-update-live-streaming-endpoints",lo="transmit-log",fo="daily-custom-track",po={NONE:"none",BGBLUR:"background-blur",BGIMAGE:"background-image",FACE_DETECTION:"face-detection"},ho={NONE:"none",NOISE_CANCELLATION:"noise-cancellation"},vo={PLAY:"play",PAUSE:"pause"},go=["jpg","png","jpeg"],mo="sip-call-transfer";function yo(){return!_o()&&"undefined"!=typeof window&&window.navigator&&window.navigator.userAgent?window.navigator.userAgent:""}function _o(){return"undefined"!=typeof navigator&&navigator.product&&"ReactNative"===navigator.product}function bo(){return navigator&&navigator.mediaDevices&&navigator.mediaDevices.getUserMedia}function So(){if(_o())return!1;if(!document)return!1;var e=document.createElement("iframe");return!!e.requestFullscreen||!!e.webkitRequestFullscreen}var wo=function(){try{var e=document.createElement("canvas"),t=null!=e.getContext("webgl2");return e.remove(),t}catch(e){return!1}}();function ko(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0];return!_o()&&!!wo&&(e?!Ao()&&["Chrome","Firefox"].includes(Co()):function(){if(Ao())return!1;var e=Co();if("Safari"===e){var t=Do();if(t.major<15||15===t.major&&t.minor<4)return!1}return"Chrome"===e?Oo().major>=77:"Firefox"===e?No().major>=97:["Chrome","Firefox","Safari"].includes(e)}())}function Eo(){if(_o())return!1;if(Mo())return!1;if("undefined"==typeof AudioWorkletNode)return!1;switch(Co()){case"Chrome":case"Firefox":return!0;case"Safari":var e=Po();return e.major>17||17===e.major&&e.minor>=4}return!1}function To(){return bo()&&!function(){var e,t=Co();if(!yo())return!0;switch(t){case"Chrome":return(e=Oo()).major&&e.major>0&&e.major<75;case"Firefox":return(e=No()).major<91;case"Safari":return(e=Do()).major<13||13===e.major&&e.minor<1;default:return!0}}()}function Mo(){return yo().match(/Linux; Android/)}function Ao(){var e,t,n=yo(),r=n.match(/Mac/)&&(!_o()&&"undefined"!=typeof window&&null!==(e=window)&&void 0!==e&&null!==(t=e.navigator)&&void 0!==t&&t.maxTouchPoints?window.navigator.maxTouchPoints:0)>=5;return!!(n.match(/Mobi/)||n.match(/Android/)||r)||!!yo().match(/DailyAnd\//)||void 0}function Co(){if("undefined"!=typeof window){var e=yo();return Lo()?"Safari":e.indexOf("Edge")>-1?"Edge":e.match(/Chrome\//)?"Chrome":e.indexOf("Safari")>-1||Io()?"Safari":e.indexOf("Firefox")>-1?"Firefox":e.indexOf("MSIE")>-1||e.indexOf(".NET")>-1?"IE":"Unknown Browser"}}function Po(){switch(Co()){case"Chrome":return Oo();case"Safari":return Do();case"Firefox":return No();case"Edge":return function(){var e=0,t=0;if("undefined"!=typeof window){var n=yo().match(/Edge\/(\d+).(\d+)/);if(n)try{e=parseInt(n[1]),t=parseInt(n[2])}catch(e){}}return{major:e,minor:t}}()}}function Oo(){var e=0,t=0,n=0,r=0,i=!1;if("undefined"!=typeof window){var o=yo(),a=o.match(/Chrome\/(\d+).(\d+).(\d+).(\d+)/);if(a)try{e=parseInt(a[1]),t=parseInt(a[2]),n=parseInt(a[3]),r=parseInt(a[4]),i=o.indexOf("OPR/")>-1}catch(e){}}return{major:e,minor:t,build:n,patch:r,opera:i}}function Lo(){return!!yo().match(/iPad|iPhone|iPod/i)&&bo()}function Io(){return yo().indexOf("AppleWebKit/605.1.15")>-1}function Do(){var e=0,t=0,n=0;if("undefined"!=typeof window){var r=yo().match(/Version\/(\d+).(\d+)(.(\d+))?/);if(r)try{e=parseInt(r[1]),t=parseInt(r[2]),n=parseInt(r[4])}catch(e){}else(Lo()||Io())&&(e=14,t=0,n=3)}return{major:e,minor:t,point:n}}function No(){var e=0,t=0;if("undefined"!=typeof window){var n=yo().match(/Firefox\/(\d+).(\d+)/);if(n)try{e=parseInt(n[1]),t=parseInt(n[2])}catch(e){}}return{major:e,minor:t}}var Ro=function(){function e(){i(this,e)}return c(e,[{key:"addListenerForMessagesFromCallMachine",value:function(e,t,n){A()}},{key:"addListenerForMessagesFromDailyJs",value:function(e,t,n){A()}},{key:"sendMessageToCallMachine",value:function(e,t,n,r){A()}},{key:"sendMessageToDailyJs",value:function(e,t){A()}},{key:"removeListener",value:function(e){A()}}]),e}();function jo(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function xo(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?jo(Object(n),!0).forEach((function(t){h(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):jo(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}var Fo=function(e){d(o,e);var t,n,r=(t=o,n=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}(),function(){var e,r=p(t);if(n){var i=p(this).constructor;e=Reflect.construct(r,arguments,i)}else e=r.apply(this,arguments);return f(this,e)});function o(){var e;return i(this,o),(e=r.call(this))._wrappedListeners={},e._messageCallbacks={},e}return c(o,[{key:"addListenerForMessagesFromCallMachine",value:function(e,t,n){var r=this,i=function(i){if(i.data&&"iframe-call-message"===i.data.what&&(!i.data.callClientId||i.data.callClientId===t)&&(!i.data.from||"module"!==i.data.from)){var o=xo({},i.data);if(delete o.from,o.callbackStamp&&r._messageCallbacks[o.callbackStamp]){var a=o.callbackStamp;r._messageCallbacks[a].call(n,o),delete r._messageCallbacks[a]}delete o.what,delete o.callbackStamp,e.call(n,o)}};this._wrappedListeners[e]=i,window.addEventListener("message",i)}},{key:"addListenerForMessagesFromDailyJs",value:function(e,t,n){var r=function(r){var i;if(!(!r.data||r.data.what!==so||!r.data.action||r.data.from&&"module"!==r.data.from||r.data.callClientId&&t&&r.data.callClientId!==t||null!=r&&null!==(i=r.data)&&void 0!==i&&i.callFrameId)){var o=r.data;e.call(n,o)}};this._wrappedListeners[e]=r,window.addEventListener("message",r)}},{key:"sendMessageToCallMachine",value:function(e,t,n,r){if(!n)throw new Error("undefined callClientId. Are you trying to use a DailyCall instance previously destroyed?");var i=xo({},e);if(i.what=so,i.from="module",i.callClientId=n,t){var o=M();this._messageCallbacks[o]=t,i.callbackStamp=o}var a=r?r.contentWindow:window,s=this._callMachineTargetOrigin(r);s&&a.postMessage(i,s)}},{key:"sendMessageToDailyJs",value:function(e,t){e.what=so,e.callClientId=t,e.from="embedded",window.postMessage(e,this._targetOriginFromWindowLocation())}},{key:"removeListener",value:function(e){var t=this._wrappedListeners[e];t&&(window.removeEventListener("message",t),delete this._wrappedListeners[e])}},{key:"forwardPackagedMessageToCallMachine",value:function(e,t,n){var r=xo({},e);r.callClientId=n;var i=t?t.contentWindow:window,o=this._callMachineTargetOrigin(t);o&&i.postMessage(r,o)}},{key:"addListenerForPackagedMessagesFromCallMachine",value:function(e,t){var n=function(n){if(n.data&&"iframe-call-message"===n.data.what&&(!n.data.callClientId||n.data.callClientId===t)&&(!n.data.from||"module"!==n.data.from)){var r=n.data;e(r)}};return this._wrappedListeners[e]=n,window.addEventListener("message",n),e}},{key:"removeListenerForPackagedMessagesFromCallMachine",value:function(e){var t=this._wrappedListeners[e];t&&(window.removeEventListener("message",t),delete this._wrappedListeners[e])}},{key:"_callMachineTargetOrigin",value:function(e){return e?e.src?new URL(e.src).origin:void 0:this._targetOriginFromWindowLocation()}},{key:"_targetOriginFromWindowLocation",value:function(){return"file:"===window.location.protocol?"*":window.location.origin}}]),o}(Ro);function Vo(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}var Bo=function(e){d(o,e);var t,n,r=(t=o,n=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}(),function(){var e,r=p(t);if(n){var i=p(this).constructor;e=Reflect.construct(r,arguments,i)}else e=r.apply(this,arguments);return f(this,e)});function o(){var e;return i(this,o),e=r.call(this),window.callMachineToDailyJsEmitter=window.callMachineToDailyJsEmitter||new _.EventEmitter,window.dailyJsToCallMachineEmitter=window.dailyJsToCallMachineEmitter||new _.EventEmitter,e._wrappedListeners={},e._messageCallbacks={},e}return c(o,[{key:"addListenerForMessagesFromCallMachine",value:function(e,t,n){this._addListener(e,window.callMachineToDailyJsEmitter,t,n,"received call machine message")}},{key:"addListenerForMessagesFromDailyJs",value:function(e,t,n){this._addListener(e,window.dailyJsToCallMachineEmitter,t,n,"received daily-js message")}},{key:"sendMessageToCallMachine",value:function(e,t,n){this._sendMessage(e,window.dailyJsToCallMachineEmitter,n,t,"sending message to call machine")}},{key:"sendMessageToDailyJs",value:function(e,t){this._sendMessage(e,window.callMachineToDailyJsEmitter,t,null,"sending message to daily-js")}},{key:"removeListener",value:function(e){var t=this._wrappedListeners[e];t&&(window.callMachineToDailyJsEmitter.removeListener("message",t),window.dailyJsToCallMachineEmitter.removeListener("message",t),delete this._wrappedListeners[e])}},{key:"_addListener",value:function(e,t,n,r,i){var o=this,a=function(t){if(t.callClientId===n){if(t.callbackStamp&&o._messageCallbacks[t.callbackStamp]){var i=t.callbackStamp;o._messageCallbacks[i].call(r,t),delete o._messageCallbacks[i]}e.call(r,t)}};this._wrappedListeners[e]=a,t.addListener("message",a)}},{key:"_sendMessage",value:function(e,t,n,r,i){var o=function(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?Vo(Object(n),!0).forEach((function(t){h(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):Vo(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}({},e);if(o.callClientId=n,r){var a=M();this._messageCallbacks[a]=r,o.callbackStamp=a}t.emit("message",o)}}]),o}(Ro),Uo="replace",Jo="shallow-merge",Yo=[Uo,Jo];var $o=function(){function e(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},n=t.data,r=t.mergeStrategy,o=void 0===r?Uo:r;i(this,e),e._validateMergeStrategy(o),e._validateData(n,o),this.mergeStrategy=o,this.data=n}return c(e,[{key:"isNoOp",value:function(){return e.isNoOpUpdate(this.data,this.mergeStrategy)}}],[{key:"isNoOpUpdate",value:function(e,t){return 0===Object.keys(e).length&&t===Jo}},{key:"_validateMergeStrategy",value:function(e){if(!Yo.includes(e))throw Error("Unrecognized mergeStrategy provided. Options are: [".concat(Yo,"]"))}},{key:"_validateData",value:function(e,t){if(!function(e){if(null==e||"object"!==o(e))return!1;var t=Object.getPrototypeOf(e);return null==t||t===Object.prototype}(e))throw Error("Meeting session data must be a plain (map-like) object");var n;try{if(n=JSON.stringify(e),t===Uo){var r=JSON.parse(n);k(r,e)||console.warn("The meeting session data provided will be modified when serialized.",r,e)}else if(t===Jo)for(var i in e)if(Object.hasOwnProperty.call(e,i)&&void 0!==e[i]){var a=JSON.parse(JSON.stringify(e[i]));k(e[i],a)||console.warn("At least one key in the meeting session data provided will be modified when serialized.",a,e[i])}}catch(e){throw Error("Meeting session data must be serializable to JSON: ".concat(e))}if(n.length>ao)throw Error("Meeting session data is too large (".concat(n.length," characters). Maximum size suppported is ").concat(ao,"."))}}]),e}();function qo(e,t,n){return qo=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}()?Reflect.construct.bind():function(e,t,n){var r=[null];r.push.apply(r,t);var i=new(Function.bind.apply(e,r));return n&&l(i,n.prototype),i},qo.apply(null,arguments)}function Go(e){var t="function"==typeof Map?new Map:void 0;return Go=function(e){if(null===e||(n=e,-1===Function.toString.call(n).indexOf("[native code]")))return e;var n;if("function"!=typeof e)throw new TypeError("Super expression must either be null or a function");if(void 0!==t){if(t.has(e))return t.get(e);t.set(e,r)}function r(){return qo(e,arguments,p(this).constructor)}return r.prototype=Object.create(e.prototype,{constructor:{value:r,enumerable:!1,writable:!0,configurable:!0}}),l(r,e)},Go(e)}function Wo(e){var t,n=null===(t=window._daily)||void 0===t?void 0:t.pendings;if(n){var r=n.indexOf(e);-1!==r&&n.splice(r,1)}}var zo=function(){function e(t){i(this,e),this._currentLoad=null,this._callClientId=t}return c(e,[{key:"load",value:function(){var e,t=this,n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},r=arguments.length>1?arguments[1]:void 0,i=arguments.length>2?arguments[2]:void 0;if(this.loaded)return window._daily.instances[this._callClientId].callMachine.reset(),void r(!0);e=this._callClientId,window._daily.pendings.push(e),this._currentLoad&&this._currentLoad.cancel(),this._currentLoad=new Ho(n,(function(){r(!1)}),(function(e,n){n||Wo(t._callClientId),i(e,n)})),this._currentLoad.start()}},{key:"cancel",value:function(){this._currentLoad&&this._currentLoad.cancel(),Wo(this._callClientId)}},{key:"loaded",get:function(){return this._currentLoad&&this._currentLoad.succeeded}}]),e}(),Ho=function(){function e(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},n=arguments.length>1?arguments[1]:void 0,r=arguments.length>2?arguments[2]:void 0;i(this,e),this._attemptsRemaining=3,this._currentAttempt=null,this._dailyConfig=t,this._successCallback=n,this._failureCallback=r}return c(e,[{key:"start",value:function(){var e=this;this._currentAttempt||(this._currentAttempt=new Xo(this._dailyConfig,this._successCallback,(function t(n){e._currentAttempt.cancelled||(e._attemptsRemaining--,e._failureCallback(n,e._attemptsRemaining>0),e._attemptsRemaining<=0||setTimeout((function(){e._currentAttempt.cancelled||(e._currentAttempt=new Xo(e._dailyConfig,e._successCallback,t),e._currentAttempt.start())}),3e3))})),this._currentAttempt.start())}},{key:"cancel",value:function(){this._currentAttempt&&this._currentAttempt.cancel()}},{key:"cancelled",get:function(){return this._currentAttempt&&this._currentAttempt.cancelled}},{key:"succeeded",get:function(){return this._currentAttempt&&this._currentAttempt.succeeded}}]),e}(),Qo=function(e){d(o,e);var t,n,r=(t=o,n=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}(),function(){var e,r=p(t);if(n){var i=p(this).constructor;e=Reflect.construct(r,arguments,i)}else e=r.apply(this,arguments);return f(this,e)});function o(){return i(this,o),r.apply(this,arguments)}return c(o)}(Go(Error)),Ko=2e4,Xo=function(){function e(t,n,r){i(this,e),this._loadAttemptImpl=_o()||!t.avoidEval?new Zo(t,n,r):new ea(t,n,r)}var t;return c(e,[{key:"start",value:(t=g((function*(){return this._loadAttemptImpl.start()})),function(){return t.apply(this,arguments)})},{key:"cancel",value:function(){this._loadAttemptImpl.cancel()}},{key:"cancelled",get:function(){return this._loadAttemptImpl.cancelled}},{key:"succeeded",get:function(){return this._loadAttemptImpl.succeeded}}]),e}(),Zo=function(){function e(t,n,r){i(this,e),this.cancelled=!1,this.succeeded=!1,this._networkTimedOut=!1,this._networkTimeout=null,this._iosCache="undefined"!=typeof iOSCallObjectBundleCache&&iOSCallObjectBundleCache,this._refetchHeaders=null,this._dailyConfig=t,this._successCallback=n,this._failureCallback=r}var t,n,r,o;return c(e,[{key:"start",value:(o=g((function*(){var e=P(this._dailyConfig);!(yield this._tryLoadFromIOSCache(e))&&this._loadFromNetwork(e)})),function(){return o.apply(this,arguments)})},{key:"cancel",value:function(){clearTimeout(this._networkTimeout),this.cancelled=!0}},{key:"_tryLoadFromIOSCache",value:(r=g((function*(e){if(!this._iosCache)return!1;try{var t=yield this._iosCache.get(e);return!!this.cancelled||!!t&&(t.code?(Function('"use strict";'+t.code)(),this.succeeded=!0,this._successCallback(),!0):(this._refetchHeaders=t.refetchHeaders,!1))}catch(e){return!1}})),function(e){return r.apply(this,arguments)})},{key:"_loadFromNetwork",value:(n=g((function*(e){var t=this;this._networkTimeout=setTimeout((function(){t._networkTimedOut=!0,t._failureCallback({msg:"Timed out (>".concat(Ko," ms) when loading call object bundle ").concat(e),type:"timeout"})}),Ko);try{var n=this._refetchHeaders?{headers:this._refetchHeaders}:{},r=yield fetch(e,n);if(clearTimeout(this._networkTimeout),this.cancelled||this._networkTimedOut)throw new Qo;var i=yield this._getBundleCodeFromResponse(e,r);if(this.cancelled)throw new Qo;Function('"use strict";'+i)(),this._iosCache&&this._iosCache.set(e,i,r.headers),this.succeeded=!0,this._successCallback()}catch(t){if(clearTimeout(this._networkTimeout),t instanceof Qo||this.cancelled||this._networkTimedOut)return;this._failureCallback({msg:"Failed to load call object bundle ".concat(e,": ").concat(t),type:t.message})}})),function(e){return n.apply(this,arguments)})},{key:"_getBundleCodeFromResponse",value:(t=g((function*(e,t){if(t.ok)return yield t.text();if(this._iosCache&&304===t.status)return(yield this._iosCache.renew(e,t.headers)).code;throw new Error("Received ".concat(t.status," response"))})),function(e,n){return t.apply(this,arguments)})}]),e}(),ea=function(){function e(t,n,r){i(this,e),this.cancelled=!1,this.succeeded=!1,this._dailyConfig=t,this._successCallback=n,this._failureCallback=r,this._attemptId=M(),this._networkTimeout=null,this._scriptElement=null}return c(e,[{key:"start",value:function(){window._dailyCallMachineLoadWaitlist||(window._dailyCallMachineLoadWaitlist=new Set);var e=P(this._dailyConfig);"object"===("undefined"==typeof document?"undefined":o(document))?this._startLoading(e):this._failureCallback({msg:"Call object bundle must be loaded in a DOM/web context",type:"missing context"})}},{key:"cancel",value:function(){this._stopLoading(),this.cancelled=!0}},{key:"_startLoading",value:function(e){var t=this;this._signUpForCallMachineLoadWaitlist(),this._networkTimeout=setTimeout((function(){t._stopLoading(),t._failureCallback({msg:"Timed out (>".concat(Ko," ms) when loading call object bundle ").concat(e),type:"timeout"})}),Ko);var n=document.getElementsByTagName("head")[0],r=document.createElement("script");this._scriptElement=r,r.onload=function(){t._stopLoading(),t.succeeded=!0,t._successCallback()},r.onerror=function(e){t._stopLoading(),t._failureCallback({msg:"Failed to load call object bundle ".concat(e.target.src),type:e.message})},r.src=e,n.appendChild(r)}},{key:"_stopLoading",value:function(){this._withdrawFromCallMachineLoadWaitlist(),clearTimeout(this._networkTimeout),this._scriptElement&&(this._scriptElement.onload=null,this._scriptElement.onerror=null)}},{key:"_signUpForCallMachineLoadWaitlist",value:function(){window._dailyCallMachineLoadWaitlist.add(this._attemptId)}},{key:"_withdrawFromCallMachineLoadWaitlist",value:function(){window._dailyCallMachineLoadWaitlist.delete(this._attemptId)}}]),e}(),ta=function(e,t,n){return!0===ia(e.local,t,n)},na=function(e,t,n){return e.local.streams&&e.local.streams[t]&&e.local.streams[t].stream&&e.local.streams[t].stream["get".concat("video"===n?"Video":"Audio","Tracks")]()[0]},ra=function(e,t,n,r){var i=oa(e,t,n,r);return i&&i.pendingTrack},ia=function(e,t,n){if(!e)return!1;var r=function(e){switch(e){case"avatar":return!0;case"staged":return e;default:return!!e}},i=e.public.subscribedTracks;return i&&i[t]?-1===["cam-audio","cam-video","screen-video","screen-audio","rmpAudio","rmpVideo"].indexOf(n)&&i[t].custom?[!0,"staged"].includes(i[t].custom)?r(i[t].custom):r(i[t].custom[n]):r(i[t][n]):!i||r(i.ALL)},oa=function(e,t,n,r){var i=Object.values(e.streams||{}).filter((function(e){return e.participantId===t&&e.type===n&&e.pendingTrack&&e.pendingTrack.kind===r})).sort((function(e,t){return new Date(t.starttime)-new Date(e.starttime)}));return i&&i[0]},aa=function(e,t){var n=e.local.public.customTracks;if(n&&n[t])return n[t].track};function sa(e,t){for(var n=t.getState(),r=0,i=["cam","screen"];r<i.length;r++)for(var o=i[r],a=0,s=["video","audio"];a<s.length;a++){var c=s[a],u="cam"===o?c:"screen".concat(c.charAt(0).toUpperCase()+c.slice(1)),l=e.tracks[u];if(l){var d=e.local?na(n,o,c):ra(n,e.session_id,o,c);"playable"===l.state&&(l.track=d),l.persistentTrack=d}}}function ca(e,t){try{var n=t.getState();for(var r in e.tracks)if(!ua(r)){var i=e.tracks[r].kind;if(i){var o=e.tracks[r];if(o){var a=e.local?aa(n,r):ra(n,e.session_id,r,i);"playable"===o.state&&(e.tracks[r].track=a),o.persistentTrack=a}}else console.error("unknown type for custom track")}}catch(e){console.error(e)}}function ua(e){return["video","audio","screenVideo","screenAudio"].includes(e)}function la(e,t,n){var r=n.getState();if(e.local){if(e.audio)try{e.audioTrack=r.local.streams.cam.stream.getAudioTracks()[0],e.audioTrack||(e.audio=!1)}catch(e){}if(e.video)try{e.videoTrack=r.local.streams.cam.stream.getVideoTracks()[0],e.videoTrack||(e.video=!1)}catch(e){}if(e.screen)try{e.screenVideoTrack=r.local.streams.screen.stream.getVideoTracks()[0],e.screenAudioTrack=r.local.streams.screen.stream.getAudioTracks()[0],e.screenVideoTrack||e.screenAudioTrack||(e.screen=!1)}catch(e){}}else{var i=!0;try{var o=r.participants[e.session_id];o&&o.public&&o.public.rtcType&&"peer-to-peer"===o.public.rtcType.impl&&o.private&&!["connected","completed"].includes(o.private.peeringState)&&(i=!1)}catch(e){console.error(e)}if(!i)return e.audio=!1,e.audioTrack=!1,e.video=!1,e.videoTrack=!1,e.screen=!1,void(e.screenTrack=!1);try{if(r.streams,e.audio&&ta(r,e.session_id,"cam-audio")){var a=ra(r,e.session_id,"cam","audio");a&&(t&&t.audioTrack&&t.audioTrack.id===a.id?e.audioTrack=a:a.muted||(e.audioTrack=a)),e.audioTrack||(e.audio=!1)}if(e.video&&ta(r,e.session_id,"cam-video")){var s=ra(r,e.session_id,"cam","video");s&&(t&&t.videoTrack&&t.videoTrack.id===s.id?e.videoTrack=s:s.muted||(e.videoTrack=s)),e.videoTrack||(e.video=!1)}if(e.screen&&ta(r,e.session_id,"screen-audio")){var c=ra(r,e.session_id,"screen","audio");c&&(t&&t.screenAudioTrack&&t.screenAudioTrack.id===c.id?e.screenAudioTrack=c:c.muted||(e.screenAudioTrack=c))}if(e.screen&&ta(r,e.session_id,"screen-video")){var u=ra(r,e.session_id,"screen","video");u&&(t&&t.screenVideoTrack&&t.screenVideoTrack.id===u.id?e.screenVideoTrack=u:u.muted||(e.screenVideoTrack=u))}e.screenVideoTrack||e.screenAudioTrack||(e.screen=!1)}catch(e){console.error("unexpected error matching up tracks",e)}}}function da(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}var fa=new Map,pa=null;function ha(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}var va=new Map,ga=null;function ma(e){ya()?function(e){fa.has(e)||(fa.set(e,{}),navigator.mediaDevices.enumerateDevices().then((function(t){fa.has(e)&&(fa.get(e).lastDevicesString=JSON.stringify(t),pa||(pa=function(){var e=g((function*(){var e,t=yield navigator.mediaDevices.enumerateDevices(),n=function(e,t){var n="undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(!n){if(Array.isArray(e)||(n=function(e,t){if(e){if("string"==typeof e)return da(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?da(e,t):void 0}}(e))||t&&e&&"number"==typeof e.length){n&&(e=n);var r=0,i=function(){};return{s:i,n:function(){return r>=e.length?{done:!0}:{done:!1,value:e[r++]}},e:function(e){throw e},f:i}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o,a=!0,s=!1;return{s:function(){n=n.call(e)},n:function(){var e=n.next();return a=e.done,e},e:function(e){s=!0,o=e},f:function(){try{a||null==n.return||n.return()}finally{if(s)throw o}}}}(fa.keys());try{for(n.s();!(e=n.n()).done;){var r=e.value,i=JSON.stringify(t);i!==fa.get(r).lastDevicesString&&(fa.get(r).lastDevicesString=i,r(t))}}catch(e){n.e(e)}finally{n.f()}}));return function(){return e.apply(this,arguments)}}(),navigator.mediaDevices.addEventListener("devicechange",pa)))})).catch((function(){})))}(e):function(e){va.has(e)||(va.set(e,{}),navigator.mediaDevices.enumerateDevices().then((function(t){va.has(e)&&(va.get(e).lastDevicesString=JSON.stringify(t),ga||(ga=setInterval(g((function*(){var e,t=yield navigator.mediaDevices.enumerateDevices(),n=function(e,t){var n="undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(!n){if(Array.isArray(e)||(n=function(e,t){if(e){if("string"==typeof e)return ha(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?ha(e,t):void 0}}(e))||t&&e&&"number"==typeof e.length){n&&(e=n);var r=0,i=function(){};return{s:i,n:function(){return r>=e.length?{done:!0}:{done:!1,value:e[r++]}},e:function(e){throw e},f:i}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o,a=!0,s=!1;return{s:function(){n=n.call(e)},n:function(){var e=n.next();return a=e.done,e},e:function(e){s=!0,o=e},f:function(){try{a||null==n.return||n.return()}finally{if(s)throw o}}}}(va.keys());try{for(n.s();!(e=n.n()).done;){var r=e.value,i=JSON.stringify(t);i!==va.get(r).lastDevicesString&&(va.get(r).lastDevicesString=i,r(t))}}catch(e){n.e(e)}finally{n.f()}})),3e3)))})))}(e)}function ya(){var e;return _o()||void 0!==(null===(e=navigator.mediaDevices)||void 0===e?void 0:e.ondevicechange)}var _a=new Set;var ba=["result"],Sa=["preserveIframe"];function wa(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function ka(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?wa(Object(n),!0).forEach((function(t){h(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):wa(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function Ea(e,t){var n="undefined"!=typeof Symbol&&e[Symbol.iterator]||e["@@iterator"];if(!n){if(Array.isArray(e)||(n=function(e,t){if(e){if("string"==typeof e)return Ta(e,t);var n=Object.prototype.toString.call(e).slice(8,-1);return"Object"===n&&e.constructor&&(n=e.constructor.name),"Map"===n||"Set"===n?Array.from(e):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?Ta(e,t):void 0}}(e))||t&&e&&"number"==typeof e.length){n&&(e=n);var r=0,i=function(){};return{s:i,n:function(){return r>=e.length?{done:!0}:{done:!1,value:e[r++]}},e:function(e){throw e},f:i}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var o,a=!0,s=!1;return{s:function(){n=n.call(e)},n:function(){var e=n.next();return a=e.done,e},e:function(e){s=!0,o=e},f:function(){try{a||null==n.return||n.return()}finally{if(s)throw o}}}}function Ta(e,t){(null==t||t>e.length)&&(t=e.length);for(var n=0,r=new Array(t);n<t;n++)r[n]=e[n];return r}var Ma={},Aa="video",Ca="voice",Pa=_o()?{data:{}}:{data:{},topology:"none"},Oa={present:0,hidden:0},La={maxBitrate:{min:1e5,max:25e5},maxFramerate:{min:1,max:30},scaleResolutionDownBy:{min:1,max:8}},Ia=Object.keys(La),Da=["state","volume","simulcastEncodings"],Na={androidInCallNotification:{title:"string",subtitle:"string",iconName:"string",disableForCustomOverride:"boolean"},disableAutoDeviceManagement:{audio:"boolean",video:"boolean"}},Ra={id:{iconPath:"string",iconPathDarkMode:"string",label:"string",tooltip:"string",visualState:"'default' | 'sidebar-open' | 'active'"}},ja={id:{allow:"string",controlledBy:"'*' | 'owners' | string[]",csp:"string",iconURL:"string",label:"string",loading:"'eager' | 'lazy'",location:"'main' | 'sidebar'",name:"string",referrerPolicy:"string",sandbox:"string",src:"string",srcdoc:"string",shared:"string[] | 'owners' | boolean"}},xa={customIntegrations:{validate:ss,help:os()},customTrayButtons:{validate:as,help:"customTrayButtons should be a dictionary of the type ".concat(JSON.stringify(Ra))},url:{validate:function(e){return"string"==typeof e},help:"url should be a string"},baseUrl:{validate:function(e){return"string"==typeof e},help:"baseUrl should be a string"},token:{validate:function(e){return"string"==typeof e},help:"token should be a string",queryString:"t"},dailyConfig:{validate:function(e,t){try{return t.validateDailyConfig(e),!0}catch(e){console.error("Failed to validate dailyConfig",e)}return!1},help:"Unsupported dailyConfig. Check error logs for detailed info."},reactNativeConfig:{validate:function(e){return cs(e,Na)},help:"reactNativeConfig should look like ".concat(JSON.stringify(Na),", all fields optional")},lang:{validate:function(e){return["da","de","en-us","en","es","fi","fr","it","jp","ka","nl","no","pl","pt","pt-BR","ru","sv","tr","user"].includes(e)},help:"language not supported. Options are: da, de, en-us, en, es, fi, fr, it, jp, ka, nl, no, pl, pt, pt-BR, ru, sv, tr, user"},userName:!0,userData:{validate:function(e){try{return Qa(e),!0}catch(e){return console.error(e),!1}},help:"invalid userData type provided"},startVideoOff:!0,startAudioOff:!0,allowLocalVideo:!0,allowLocalAudio:!0,activeSpeakerMode:!0,showLeaveButton:!0,showLocalVideo:!0,showParticipantsBar:!0,showFullscreenButton:!0,showUserNameChangeUI:!0,iframeStyle:!0,customLayout:!0,cssFile:!0,cssText:!0,bodyClass:!0,videoSource:{validate:function(e,t){if("boolean"==typeof e)return t._preloadCache.allowLocalVideo=e,!0;var n;if(e instanceof MediaStreamTrack)t._sharedTracks.videoTrack=e,n={customTrack:fo};else{if(delete t._sharedTracks.videoTrack,"string"!=typeof e)return console.error("videoSource must be a MediaStreamTrack, boolean, or a string"),!1;n={deviceId:e}}return t._updatePreloadCacheInputSettings({video:{settings:n}},!1),!0}},audioSource:{validate:function(e,t){if("boolean"==typeof e)return t._preloadCache.allowLocalAudio=e,!0;var n;if(e instanceof MediaStreamTrack)t._sharedTracks.audioTrack=e,n={customTrack:fo};else{if(delete t._sharedTracks.audioTrack,"string"!=typeof e)return console.error("audioSource must be a MediaStreamTrack, boolean, or a string"),!1;n={deviceId:e}}return t._updatePreloadCacheInputSettings({audio:{settings:n}},!1),!0}},subscribeToTracksAutomatically:{validate:function(e,t){return t._preloadCache.subscribeToTracksAutomatically=e,!0}},theme:{validate:function(e){var t=["accent","accentText","background","backgroundAccent","baseText","border","mainAreaBg","mainAreaBgAccent","mainAreaText","supportiveText"],n=function(e){for(var n=0,r=Object.keys(e);n<r.length;n++){var i=r[n];if(!t.includes(i))return console.error('unsupported color "'.concat(i,'". Valid colors: ').concat(t.join(", "))),!1;if(!e[i].match(/^#[0-9a-f]{6}|#[0-9a-f]{3}$/i))return console.error("".concat(i,' theme color should be provided in valid hex color format. Received: "').concat(e[i],'"')),!1}return!0};return"object"===o(e)&&("light"in e&&"dark"in e||"colors"in e)?"light"in e&&"dark"in e?"colors"in e.light?"colors"in e.dark?n(e.light.colors)&&n(e.dark.colors):(console.error('Dark theme is missing "colors" property.',e),!1):(console.error('Light theme is missing "colors" property.',e),!1):n(e.colors):(console.error('Theme must contain either both "light" and "dark" properties, or "colors".',e),!1)},help:"unsupported theme configuration. Check error logs for detailed info."},layoutConfig:{validate:function(e){if("grid"in e){var t=e.grid;if("maxTilesPerPage"in t){if(!Number.isInteger(t.maxTilesPerPage))return console.error("grid.maxTilesPerPage should be an integer. You passed ".concat(t.maxTilesPerPage,".")),!1;if(t.maxTilesPerPage>49)return console.error("grid.maxTilesPerPage can't be larger than 49 without sacrificing browser performance. Please contact us at https://www.daily.co/contact to talk about your use case."),!1}if("minTilesPerPage"in t){if(!Number.isInteger(t.minTilesPerPage))return console.error("grid.minTilesPerPage should be an integer. You passed ".concat(t.minTilesPerPage,".")),!1;if(t.minTilesPerPage<1)return console.error("grid.minTilesPerPage can't be lower than 1."),!1;if("maxTilesPerPage"in t&&t.minTilesPerPage>t.maxTilesPerPage)return console.error("grid.minTilesPerPage can't be higher than grid.maxTilesPerPage."),!1}}return!0},help:"unsupported layoutConfig. Check error logs for detailed info."},receiveSettings:{validate:function(e){return Ka(e,{allowAllParticipantsKey:!1})},help:is({allowAllParticipantsKey:!1})},sendSettings:{validate:function(e,t){return!!function(e,t){try{return t.validateUpdateSendSettings(e),!0}catch(e){return console.error("Failed to validate send settings",e),!1}}(e,t)&&(t._preloadCache.sendSettings=e,!0)},help:"Invalid sendSettings provided. Check error logs for detailed info."},inputSettings:{validate:function(e,t){var n;return!!Xa(e)&&(t._inputSettings||(t._inputSettings={}),Za(e,null===(n=t.properties)||void 0===n?void 0:n.dailyConfig,t._sharedTracks),t._updatePreloadCacheInputSettings(e,!0),!0)},help:rs()},layout:{validate:function(e){return"custom-v1"===e||"browser"===e||"none"===e},help:'layout may only be set to "custom-v1"',queryString:"layout"},emb:{queryString:"emb"},embHref:{queryString:"embHref"},dailyJsVersion:{queryString:"dailyJsVersion"},proxy:{queryString:"proxy"},strictMode:!0,allowMultipleCallInstances:!0},Fa={styles:{validate:function(e){for(var t in e)if("cam"!==t&&"screen"!==t)return!1;if(e.cam)for(var n in e.cam)if("div"!==n&&"video"!==n)return!1;if(e.screen)for(var r in e.screen)if("div"!==r&&"video"!==r)return!1;return!0},help:"styles format should be a subset of: { cam: {div: {}, video: {}}, screen: {div: {}, video: {}} }"},setSubscribedTracks:{validate:function(e,t){if(t._preloadCache.subscribeToTracksAutomatically)return!1;var n=[!0,!1,"staged"];if(n.includes(e)||!_o()&&"avatar"===e)return!0;var r=["audio","video","screenAudio","screenVideo","rmpAudio","rmpVideo"];return function e(t){var i=arguments.length>1&&void 0!==arguments[1]&&arguments[1];for(var o in t)if("custom"===o){if(!n.includes(t[o])&&!e(t[o],!0))return!1}else{var a=!i&&!r.includes(o),s=!n.includes(t[o]);if(a||s)return!1}return!0}(e)},help:"setSubscribedTracks cannot be used when setSubscribeToTracksAutomatically is enabled, and should be of the form: "+"true".concat(_o()?"":" | 'avatar'"," | false | 'staged' | { [audio: true|false|'staged'], [video: true|false|'staged'], [screenAudio: true|false|'staged'], [screenVideo: true|false|'staged'] }")},setAudio:!0,setVideo:!0,setScreenShare:{validate:function(e){return!1===e},help:"setScreenShare must be false, as it's only meant for stopping remote participants' screen shares"},eject:!0,updatePermissions:{validate:function(e){for(var t=0,n=Object.entries(e);t<n.length;t++){var r=y(n[t],2),i=r[0],o=r[1];switch(i){case"hasPresence":if("boolean"!=typeof o)return!1;break;case"canSend":if(o instanceof Set||o instanceof Array||Array.isArray(o)){var a,s=["video","audio","screenVideo","screenAudio","customVideo","customAudio"],c=Ea(o);try{for(c.s();!(a=c.n()).done;){var u=a.value;if(!s.includes(u))return!1}}catch(e){c.e(e)}finally{c.f()}}else if("boolean"!=typeof o)return!1;(o instanceof Array||Array.isArray(o))&&(e.canSend=new Set(o));break;case"canAdmin":if(o instanceof Set||o instanceof Array||Array.isArray(o)){var l,d=["participants","streaming","transcription"],f=Ea(o);try{for(f.s();!(l=f.n()).done;){var p=l.value;if(!d.includes(p))return!1}}catch(e){f.e(e)}finally{f.f()}}else if("boolean"!=typeof o)return!1;(o instanceof Array||Array.isArray(o))&&(e.canAdmin=new Set(o));break;default:return!1}}return!0},help:"updatePermissions can take hasPresence, canSend, and canAdmin permissions. hasPresence must be a boolean. canSend can be a boolean or an Array or Set of media types (video, audio, screenVideo, screenAudio, customVideo, customAudio). canAdmin can be a boolean or an Array or Set of admin types (participants, streaming, transcription)."}};Promise.any||(Promise.any=function(){var e=g((function*(e){return new Promise((function(t,n){var r=[];e.forEach((function(i){return Promise.resolve(i).then((function(e){t(e)})).catch((function(t){r.push(t),r.length===e.length&&n(r)}))}))}))}));return function(t){return e.apply(this,arguments)}}());var Va=function(e){d(oe,e);var t,n,a,s,l,v,m,_,S,w,E,A,O,L,I,D,N,R,j,x,F,V,B,U,J,Y,$,q,G,W,z,H,Q,K,X,Z,ee,te,ne,re,ie=(ne=oe,re=function(){if("undefined"==typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"==typeof Proxy)return!0;try{return Boolean.prototype.valueOf.call(Reflect.construct(Boolean,[],(function(){}))),!0}catch(e){return!1}}(),function(){var e,t=p(ne);if(re){var n=p(this).constructor;e=Reflect.construct(t,arguments,n)}else e=t.apply(this,arguments);return f(this,e)});function oe(e){var t,n,r,o=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};if(i(this,oe),h(u(n=ie.call(this)),"startListeningForDeviceChanges",(function(){ma(n.handleDeviceChange)})),h(u(n),"stopListeningForDeviceChanges",(function(){var e;e=n.handleDeviceChange,ya()?function(e){fa.has(e)&&(fa.delete(e),0===fa.size&&pa&&(navigator.mediaDevices.removeEventListener("devicechange",pa),pa=null))}(e):function(e){va.has(e)&&(va.delete(e),0===va.size&&ga&&(clearInterval(ga),ga=null))}(e)})),h(u(n),"handleDeviceChange",(function(e){e=e.map((function(e){return JSON.parse(JSON.stringify(e))})),n.emitDailyJSEvent({action:"available-devices-updated",availableDevices:e})})),h(u(n),"handleNativeAppStateChange",function(){var e=g((function*(e){if("destroyed"===e)return console.warn("App has been destroyed before leaving the meeting. Cleaning up all the resources!"),void(yield n.destroy());var t="active"===e;n.disableReactNativeAutoDeviceManagement("video")||(t?n.camUnmutedBeforeLosingNativeActiveState&&n.setLocalVideo(!0):(n.camUnmutedBeforeLosingNativeActiveState=n.localVideo(),n.camUnmutedBeforeLosingNativeActiveState&&n.setLocalVideo(!1)))}));return function(t){return e.apply(this,arguments)}}()),h(u(n),"handleNativeAudioFocusChange",(function(e){n.disableReactNativeAutoDeviceManagement("audio")||(n._hasNativeAudioFocus=e,n.toggleParticipantAudioBasedOnNativeAudioFocus(),n._hasNativeAudioFocus?n.micUnmutedBeforeLosingNativeAudioFocus&&n.setLocalAudio(!0):(n.micUnmutedBeforeLosingNativeAudioFocus=n.localAudio(),n.setLocalAudio(!1)))})),h(u(n),"handleNativeSystemScreenCaptureStop",(function(){n.stopScreenShare()})),n.strictMode=void 0===o.strictMode||o.strictMode,n.allowMultipleCallInstances=null!==(t=o.allowMultipleCallInstances)&&void 0!==t&&t,Object.keys(Ma).length&&(n._logDuplicateInstanceAttempt(),!n.allowMultipleCallInstances)){if(n.strictMode)throw new Error("Duplicate DailyIframe instances are not allowed");console.warn("Using strictMode: false to allow multiple call instances is now deprecated. Set `allowMultipleCallInstances: true`")}if(window._daily||(window._daily={pendings:[],instances:{}}),n.callClientId=M(),r=u(n),Ma[r.callClientId]=r,window._daily.instances[n.callClientId]={},n._sharedTracks={},window._daily.instances[n.callClientId].tracks=n._sharedTracks,o.dailyJsVersion=oe.version(),n._iframe=e,n._callObjectMode="none"===o.layout&&!n._iframe,n._preloadCache={subscribeToTracksAutomatically:!0,outputDeviceId:null,inputSettings:null,sendSettings:null,videoTrackForNetworkConnectivityTest:null,videoTrackForConnectionQualityTest:null},void 0!==o.showLocalVideo?n._callObjectMode?console.error("showLocalVideo is not available in call object mode"):n._showLocalVideo=!!o.showLocalVideo:n._showLocalVideo=!0,void 0!==o.showParticipantsBar?n._callObjectMode?console.error("showParticipantsBar is not available in call object mode"):n._showParticipantsBar=!!o.showParticipantsBar:n._showParticipantsBar=!0,void 0!==o.customIntegrations?n._callObjectMode?console.error("customIntegrations is not available in call object mode"):n._customIntegrations=o.customIntegrations:n._customIntegrations={},void 0!==o.customTrayButtons?n._callObjectMode?console.error("customTrayButtons is not available in call object mode"):n._customTrayButtons=o.customTrayButtons:n._customTrayButtons={},void 0!==o.activeSpeakerMode?n._callObjectMode?console.error("activeSpeakerMode is not available in call object mode"):n._activeSpeakerMode=!!o.activeSpeakerMode:n._activeSpeakerMode=!1,o.receiveSettings?n._callObjectMode?n._receiveSettings=o.receiveSettings:console.error("receiveSettings is only available in call object mode"):n._receiveSettings={},n.validateProperties(o),n.properties=ka({},o),n._inputSettings||(n._inputSettings={}),n._callObjectLoader=n._callObjectMode?new zo(n.callClientId):null,n._callState=yr,n._isPreparingToJoin=!1,n._accessState={access:Lr},n._meetingSessionSummary={},n._finalSummaryOfPrevSession={},n._meetingSessionState=fs(Pa,n._callObjectMode),n._nativeInCallAudioMode=Aa,n._participants={},n._isScreenSharing=!1,n._participantCounts=Oa,n._rmpPlayerState={},n._waitingParticipants={},n._network={threshold:"good",quality:100},n._activeSpeaker={},n._localAudioLevel=0,n._isLocalAudioLevelObserverRunning=!1,n._remoteParticipantsAudioLevel={},n._isRemoteParticipantsAudioLevelObserverRunning=!1,n._maxAppMessageSize=oo,n._messageChannel=_o()?new Bo:new Fo,n._iframe&&(n._iframe.requestFullscreen?n._iframe.addEventListener("fullscreenchange",(function(){document.fullscreenElement===n._iframe?(n.emitDailyJSEvent({action:zi}),n.sendMessageToCallMachine({action:zi})):(n.emitDailyJSEvent({action:Hi}),n.sendMessageToCallMachine({action:Hi}))})):n._iframe.webkitRequestFullscreen&&n._iframe.addEventListener("webkitfullscreenchange",(function(){document.webkitFullscreenElement===n._iframe?(n.emitDailyJSEvent({action:zi}),n.sendMessageToCallMachine({action:zi})):(n.emitDailyJSEvent({action:Hi}),n.sendMessageToCallMachine({action:Hi}))}))),_o()){var a=n.nativeUtils();a.addAudioFocusChangeListener&&a.removeAudioFocusChangeListener&&a.addAppStateChangeListener&&a.removeAppStateChangeListener&&a.addSystemScreenCaptureStopListener&&a.removeSystemScreenCaptureStopListener||console.warn("expected (add|remove)(AudioFocusChange|AppActiveStateChange|SystemScreenCaptureStop)Listener to be available in React Native"),n._hasNativeAudioFocus=!0,a.addAudioFocusChangeListener(n.handleNativeAudioFocusChange),a.addAppStateChangeListener(n.handleNativeAppStateChange),a.addSystemScreenCaptureStopListener(n.handleNativeSystemScreenCaptureStop)}return n._callObjectMode&&n.startListeningForDeviceChanges(),n._messageChannel.addListenerForMessagesFromCallMachine(n.handleMessageFromCallMachine,n.callClientId,u(n)),n}return c(oe,[{key:"destroy",value:(te=g((function*(){var e,t;try{yield this.leave()}catch(e){}var n=this._iframe;if(n){var r=n.parentElement;r&&r.removeChild(n)}if(this._messageChannel.removeListener(this.handleMessageFromCallMachine),_o()){var i=this.nativeUtils();i.removeAudioFocusChangeListener(this.handleNativeAudioFocusChange),i.removeAppStateChangeListener(this.handleNativeAppStateChange),i.removeSystemScreenCaptureStopListener(this.handleNativeSystemScreenCaptureStop)}this._callObjectMode&&this.stopListeningForDeviceChanges(),this.resetMeetingDependentVars(),this._destroyed=!0,this.emitDailyJSEvent({action:"call-instance-destroyed"}),delete Ma[this.callClientId],(null===(e=window)||void 0===e||null===(t=e._daily)||void 0===t?void 0:t.instances)&&delete window._daily.instances[this.callClientId],this.strictMode&&(this.callClientId=void 0)})),function(){return te.apply(this,arguments)})},{key:"isDestroyed",value:function(){return!!this._destroyed}},{key:"loadCss",value:function(e){var t=e.bodyClass,n=e.cssFile,r=e.cssText;return za(),this.sendMessageToCallMachine({action:"load-css",cssFile:this.absoluteUrl(n),bodyClass:t,cssText:r}),this}},{key:"iframe",value:function(){return za(),this._iframe}},{key:"meetingState",value:function(){return this._callState}},{key:"accessState",value:function(){return Ga(this._callObjectMode,"accessState()"),this._accessState}},{key:"participants",value:function(){return this._participants}},{key:"participantCounts",value:function(){return this._participantCounts}},{key:"waitingParticipants",value:function(){return Ga(this._callObjectMode,"waitingParticipants()"),this._waitingParticipants}},{key:"validateParticipantProperties",value:function(e,t){for(var n in t){if(!Fa[n])throw new Error("unrecognized updateParticipant property ".concat(n));if(Fa[n].validate&&!Fa[n].validate(t[n],this,this._participants[e]))throw new Error(Fa[n].help)}}},{key:"updateParticipant",value:function(e,t){return this._participants.local&&this._participants.local.session_id===e&&(e="local"),e&&t&&(this.validateParticipantProperties(e,t),this.sendMessageToCallMachine({action:"update-participant",id:e,properties:t})),this}},{key:"updateParticipants",value:function(e){var t=this._participants.local&&this._participants.local.session_id;for(var n in e)n===t&&(n="local"),n&&e[n]&&this.validateParticipantProperties(n,e[n]);return this.sendMessageToCallMachine({action:"update-participants",participants:e}),this}},{key:"updateWaitingParticipant",value:(ee=g((function*(){var e=this,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"",n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};if(Ga(this._callObjectMode,"updateWaitingParticipant()"),Ua(this._callState,"updateWaitingParticipant()"),"string"!=typeof t||"object"!==o(n))throw new Error("updateWaitingParticipant() must take an id string and a updates object");return new Promise((function(r,i){e.sendMessageToCallMachine({action:"daily-method-update-waiting-participant",id:t,updates:n},(function(e){e.error&&i(e.error),e.id||i(new Error("unknown error in updateWaitingParticipant()")),r({id:e.id})}))}))})),function(){return ee.apply(this,arguments)})},{key:"updateWaitingParticipants",value:(Z=g((function*(){var e=this,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};if(Ga(this._callObjectMode,"updateWaitingParticipants()"),Ua(this._callState,"updateWaitingParticipants()"),"object"!==o(t))throw new Error("updateWaitingParticipants() must take a mapping between ids and update objects");return new Promise((function(n,r){e.sendMessageToCallMachine({action:"daily-method-update-waiting-participants",updatesById:t},(function(e){e.error&&r(e.error),e.ids||r(new Error("unknown error in updateWaitingParticipants()")),n({ids:e.ids})}))}))})),function(){return Z.apply(this,arguments)})},{key:"requestAccess",value:(X=g((function*(){var e=this,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},n=t.access,r=void 0===n?{level:Ir}:n,i=t.name,o=void 0===i?"":i;return Ga(this._callObjectMode,"requestAccess()"),Ua(this._callState,"requestAccess()"),new Promise((function(t,n){e.sendMessageToCallMachine({action:"daily-method-request-access",access:r,name:o},(function(e){e.error&&n(e.error),e.access||n(new Error("unknown error in requestAccess()")),t({access:e.access,granted:e.granted})}))}))})),function(){return X.apply(this,arguments)})},{key:"localAudio",value:function(){return this._participants.local?!["blocked","off"].includes(this._participants.local.tracks.audio.state):null}},{key:"localVideo",value:function(){return this._participants.local?!["blocked","off"].includes(this._participants.local.tracks.video.state):null}},{key:"setLocalAudio",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};return"forceDiscardTrack"in t&&(_o()?(console.warn("forceDiscardTrack option not supported in React Native; ignoring"),t={}):e&&(console.warn("forceDiscardTrack option only supported when calling setLocalAudio(false); ignoring"),t={})),this.sendMessageToCallMachine({action:"local-audio",state:e,options:t}),this}},{key:"localScreenAudio",value:function(){return this._participants.local?!["blocked","off"].includes(this._participants.local.tracks.screenAudio.state):null}},{key:"localScreenVideo",value:function(){return this._participants.local?!["blocked","off"].includes(this._participants.local.tracks.screenVideo.state):null}},{key:"updateScreenShare",value:function(e){if(this._isScreenSharing)return this.sendMessageToCallMachine({action:"local-screen-update",options:e}),this;console.warn("There is no screen share in progress. Try calling startScreenShare first.")}},{key:"setLocalVideo",value:function(e){return this.sendMessageToCallMachine({action:"local-video",state:e}),this}},{key:"_setAllowLocalAudio",value:function(e){if(this._preloadCache.allowLocalAudio=e,this._callMachineInitialized)return this.sendMessageToCallMachine({action:"set-allow-local-audio",state:e}),this}},{key:"_setAllowLocalVideo",value:function(e){if(this._preloadCache.allowLocalVideo=e,this._callMachineInitialized)return this.sendMessageToCallMachine({action:"set-allow-local-video",state:e}),this}},{key:"getReceiveSettings",value:(K=g((function*(e){var t=this,n=(arguments.length>1&&void 0!==arguments[1]?arguments[1]:{}).showInheritedValues,r=void 0!==n&&n;if(Ga(this._callObjectMode,"getReceiveSettings()"),!this._callMachineInitialized)return this._receiveSettings;switch(o(e)){case"string":return new Promise((function(n){t.sendMessageToCallMachine({action:"get-single-participant-receive-settings",id:e,showInheritedValues:r},(function(e){n(e.receiveSettings)}))}));case"undefined":return this._receiveSettings;default:throw new Error('first argument to getReceiveSettings() must be a participant id (or "base"), or there should be no arguments')}})),function(e){return K.apply(this,arguments)})},{key:"updateReceiveSettings",value:(Q=g((function*(e){var t=this;if(Ga(this._callObjectMode,"updateReceiveSettings()"),!Ka(e,{allowAllParticipantsKey:!0}))throw new Error(is({allowAllParticipantsKey:!0}));return Ua(this._callState,"updateReceiveSettings()","To specify receive settings earlier, use the receiveSettings config property."),new Promise((function(n){t.sendMessageToCallMachine({action:"update-receive-settings",receiveSettings:e},(function(e){n({receiveSettings:e.receiveSettings})}))}))})),function(e){return Q.apply(this,arguments)})},{key:"_prepInputSettingsForSharing",value:function(e,t){if(e){var n={};if(e.audio){var r,i,o,a;e.audio.settings&&(!Object.keys(e.audio.settings).length&&t||(n.audio={settings:ka({},e.audio.settings)})),t&&null!==(r=n.audio)&&void 0!==r&&null!==(i=r.settings)&&void 0!==i&&i.customTrack&&(n.audio.settings={customTrack:this._sharedTracks.audioTrack});var s="none"===(null===(o=e.audio.processor)||void 0===o?void 0:o.type)&&(null===(a=e.audio.processor)||void 0===a?void 0:a._isDefaultWhenNone);if(e.audio.processor&&!s){var c=ka({},e.audio.processor);delete c._isDefaultWhenNone,n.audio=ka(ka({},n.audio),{},{processor:c})}}if(e.video){var u,l,d,f;e.video.settings&&(!Object.keys(e.video.settings).length&&t||(n.video={settings:ka({},e.video.settings)})),t&&null!==(u=n.video)&&void 0!==u&&null!==(l=u.settings)&&void 0!==l&&l.customTrack&&(n.video.settings={customTrack:this._sharedTracks.videoTrack});var p="none"===(null===(d=e.video.processor)||void 0===d?void 0:d.type)&&(null===(f=e.video.processor)||void 0===f?void 0:f._isDefaultWhenNone);if(e.video.processor&&!p){var h=ka({},e.video.processor);delete h._isDefaultWhenNone,n.video=ka(ka({},n.video),{},{processor:h})}}return n}}},{key:"getInputSettings",value:function(){var e=this;return za(),new Promise((function(t){t(e._getInputSettings())}))}},{key:"_getInputSettings",value:function(){var e,t,n,r,i,o,a,s,c={processor:{type:"none",_isDefaultWhenNone:!0}};this._inputSettings?(e=(null===(n=this._inputSettings)||void 0===n?void 0:n.video)||c,t=(null===(r=this._inputSettings)||void 0===r?void 0:r.audio)||c):(e=(null===(i=this._preloadCache)||void 0===i||null===(o=i.inputSettings)||void 0===o?void 0:o.video)||c,t=(null===(a=this._preloadCache)||void 0===a||null===(s=a.inputSettings)||void 0===s?void 0:s.audio)||c);var u={audio:t,video:e};return this._prepInputSettingsForSharing(u,!0)}},{key:"_updatePreloadCacheInputSettings",value:function(e,t){var n,r,i,o,a,s,c=this._inputSettings||{},u={};e.video?(u.video={},e.video.settings?(u.video.settings={},t||e.video.settings.customTrack||null===(i=c.video)||void 0===i||!i.settings?u.video.settings=e.video.settings:u.video.settings=ka(ka({},c.video.settings),e.video.settings),Object.keys(u.video.settings).length||delete u.video.settings):null!==(n=c.video)&&void 0!==n&&n.settings&&(u.video.settings=c.video.settings),e.video.processor?u.video.processor=e.video.processor:null!==(r=c.video)&&void 0!==r&&r.processor&&(u.video.processor=c.video.processor)):c.video&&(u.video=c.video);e.audio?(u.audio={},e.audio.settings?(u.audio.settings={},t||e.audio.settings.customTrack||null===(s=c.audio)||void 0===s||!s.settings?u.audio.settings=e.audio.settings:u.audio.settings=ka(ka({},c.audio.settings),e.audio.settings),Object.keys(u.audio.settings).length||delete u.audio.settings):null!==(o=c.audio)&&void 0!==o&&o.settings&&(u.audio.settings=c.audio.settings),e.audio.processor?u.audio.processor=e.audio.processor:null!==(a=c.audio)&&void 0!==a&&a.processor&&(u.audio.processor=c.audio.processor)):c.audio&&(u.audio=c.audio);this._maybeUpdateInputSettings(u)}},{key:"_devicesFromInputSettings",value:function(e){var t,n,r,i,o=(null==e||null===(t=e.video)||void 0===t||null===(n=t.settings)||void 0===n?void 0:n.deviceId)||null,a=(null==e||null===(r=e.audio)||void 0===r||null===(i=r.settings)||void 0===i?void 0:i.deviceId)||null,s=this._preloadCache.outputDeviceId||null;return{camera:o?{deviceId:o}:{},mic:a?{deviceId:a}:{},speaker:s?{deviceId:s}:{}}}},{key:"updateInputSettings",value:(H=g((function*(e){var t=this;return za(),Xa(e)?e.video||e.audio?(Za(e,this.properties.dailyConfig,this._sharedTracks),this._callObjectMode&&!this._callMachineInitialized?(this._updatePreloadCacheInputSettings(e,!0),this._getInputSettings()):new Promise((function(n,r){t.sendMessageToCallMachine({action:"update-input-settings",inputSettings:e},(function(i){if(i.error)r(i.error);else{if(i.returnPreloadCache)return t._updatePreloadCacheInputSettings(e,!0),void n(t._getInputSettings());t._maybeUpdateInputSettings(i.inputSettings),n(t._prepInputSettingsForSharing(i.inputSettings,!0))}}))}))):this._getInputSettings():(console.error(rs()),Promise.reject(rs()))})),function(e){return H.apply(this,arguments)})},{key:"setBandwidth",value:function(e){var t=e.kbs,n=e.trackConstraints;if(za(),this._callMachineInitialized)return this.sendMessageToCallMachine({action:"set-bandwidth",kbs:t,trackConstraints:n}),this}},{key:"getDailyLang",value:function(){var e=this;if(za(),this._callMachineInitialized)return new Promise((function(t){e.sendMessageToCallMachine({action:"get-daily-lang"},(function(e){delete e.action,delete e.callbackStamp,t(e)}))}))}},{key:"setDailyLang",value:function(e){return za(),this.sendMessageToCallMachine({action:"set-daily-lang",lang:e}),this}},{key:"setProxyUrl",value:function(e){return this.sendMessageToCallMachine({action:"set-proxy-url",proxyUrl:e}),this}},{key:"setIceConfig",value:function(e){return this.sendMessageToCallMachine({action:"set-ice-config",iceConfig:e}),this}},{key:"meetingSessionSummary",value:function(){return[kr,Er].includes(this._callState)?this._finalSummaryOfPrevSession:this._meetingSessionSummary}},{key:"getMeetingSession",value:(z=g((function*(){var e=this;return console.warn("getMeetingSession() is deprecated: use meetingSessionSummary(), which will return immediately"),Ua(this._callState,"getMeetingSession()"),new Promise((function(t){e.sendMessageToCallMachine({action:"get-meeting-session"},(function(e){delete e.action,delete e.callbackStamp,t(e)}))}))})),function(){return z.apply(this,arguments)})},{key:"meetingSessionState",value:function(){return Ua(this._callState,"meetingSessionState"),this._meetingSessionState}},{key:"setMeetingSessionData",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"replace";Ga(this._callObjectMode,"setMeetingSessionData()"),Ua(this._callState,"setMeetingSessionData");try{!function(e,t){new $o({data:e,mergeStrategy:t})}(e,t)}catch(e){throw console.error(e),e}try{this.sendMessageToCallMachine({action:"set-session-data",data:e,mergeStrategy:t})}catch(e){throw new Error("Error setting meeting session data: ".concat(e))}}},{key:"setUserName",value:function(e,t){var n=this;return this.properties.userName=e,new Promise((function(r){n.sendMessageToCallMachine({action:"set-user-name",name:null!=e?e:"",thisMeetingOnly:_o()||!!t&&!!t.thisMeetingOnly},(function(e){delete e.action,delete e.callbackStamp,r(e)}))}))}},{key:"setUserData",value:(W=g((function*(e){var t=this;try{Qa(e)}catch(e){throw console.error(e),e}if(this.properties.userData=e,this._callMachineInitialized)return new Promise((function(n){try{t.sendMessageToCallMachine({action:"set-user-data",userData:e},(function(e){delete e.action,delete e.callbackStamp,n(e)}))}catch(e){throw new Error("Error setting user data: ".concat(e))}}))})),function(e){return W.apply(this,arguments)})},{key:"validateAudioLevelInterval",value:function(e){if(e&&(e<100||"number"!=typeof e))throw new Error("The interval must be a number greater than or equal to 100 milliseconds.")}},{key:"startLocalAudioLevelObserver",value:function(e){var t=this;if("undefined"==typeof AudioWorkletNode&&!_o())throw new Error("startLocalAudioLevelObserver() is not supported on this browser");if(this.validateAudioLevelInterval(e),this._callMachineInitialized)return this._isLocalAudioLevelObserverRunning=!0,new Promise((function(n,r){t.sendMessageToCallMachine({action:"start-local-audio-level-observer",interval:e},(function(e){t._isLocalAudioLevelObserverRunning=!e.error,e.error?r({error:e.error}):n()}))}));this._preloadCache.localAudioLevelObserver={enabled:!0,interval:e}}},{key:"isLocalAudioLevelObserverRunning",value:function(){return this._isLocalAudioLevelObserverRunning}},{key:"stopLocalAudioLevelObserver",value:function(){this._preloadCache.localAudioLevelObserver=null,this._localAudioLevel=0,this._isLocalAudioLevelObserverRunning=!1,this.sendMessageToCallMachine({action:"stop-local-audio-level-observer"})}},{key:"startRemoteParticipantsAudioLevelObserver",value:function(e){var t=this;if(this.validateAudioLevelInterval(e),this._callMachineInitialized)return this._isRemoteParticipantsAudioLevelObserverRunning=!0,new Promise((function(n,r){t.sendMessageToCallMachine({action:"start-remote-participants-audio-level-observer",interval:e},(function(e){t._isRemoteParticipantsAudioLevelObserverRunning=!e.error,e.error?r({error:e.error}):n()}))}));this._preloadCache.remoteParticipantsAudioLevelObserver={enabled:!0,interval:e}}},{key:"isRemoteParticipantsAudioLevelObserverRunning",value:function(){return this._isRemoteParticipantsAudioLevelObserverRunning}},{key:"stopRemoteParticipantsAudioLevelObserver",value:function(){this._preloadCache.remoteParticipantsAudioLevelObserver=null,this._remoteParticipantsAudioLevel={},this._isRemoteParticipantsAudioLevelObserverRunning=!1,this.sendMessageToCallMachine({action:"stop-remote-participants-audio-level-observer"})}},{key:"startCamera",value:(G=g((function*(){var e=this,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};if(Ga(this._callObjectMode,"startCamera()"),Ya(this._callState,this._isPreparingToJoin,"startCamera()","Did you mean to use setLocalAudio() and/or setLocalVideo() instead?"),this.needsLoad())try{yield this.load(t)}catch(e){return Promise.reject(e)}else{if(this._didPreAuth){if(t.url&&t.url!==this.properties.url)return console.error("url in startCamera() is different than the one used in preAuth()"),Promise.reject();if(t.token&&t.token!==this.properties.token)return console.error("token in startCamera() is different than the one used in preAuth()"),Promise.reject()}this.validateProperties(t),this.properties=ka(ka({},this.properties),t)}return new Promise((function(t){e._preloadCache.inputSettings=e._prepInputSettingsForSharing(e._inputSettings,!1),e.sendMessageToCallMachine({action:"start-camera",properties:Ba(e.properties,e.callClientId),preloadCache:Ba(e._preloadCache,e.callClientId)},(function(e){t({camera:e.camera,mic:e.mic,speaker:e.speaker})}))}))})),function(){return G.apply(this,arguments)})},{key:"validateCustomTrack",value:function(e,t,n){if(n&&n.length>50)throw new Error("Custom track `trackName` must not be more than 50 characters");if(t&&"music"!==t&&"speech"!==t&&!(t instanceof Object))throw new Error("Custom track `mode` must be either `music` | `speech` | `DailyMicAudioModeSettings` or `undefined`");if(n&&["cam-audio","cam-video","screen-video","screen-audio","rmpAudio","rmpVideo","customVideoDefaults"].includes(n))throw new Error("Custom track `trackName` must not match a track name already used by daily: cam-audio, cam-video, customVideoDefaults, screen-video, screen-audio, rmpAudio, rmpVideo");if(!(e instanceof MediaStreamTrack))throw new Error("Custom tracks provided must be instances of MediaStreamTrack")}},{key:"startCustomTrack",value:function(){var e=this,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{track:track,mode:mode,trackName:trackName};return za(),Ua(this._callState,"startCustomTrack()"),this.validateCustomTrack(t.track,t.mode,t.trackName),new Promise((function(n,r){e._sharedTracks.customTrack=t.track,t.track=fo,e.sendMessageToCallMachine({action:"start-custom-track",properties:t},(function(e){e.error?r({error:e.error}):n(e.mediaTag)}))}))}},{key:"stopCustomTrack",value:function(e){var t=this;return za(),Ua(this._callState,"stopCustomTrack()"),new Promise((function(n){t.sendMessageToCallMachine({action:"stop-custom-track",mediaTag:e},(function(e){n(e.mediaTag)}))}))}},{key:"setCamera",value:function(e){var t=this;return Ha(),$a(this._callMachineInitialized,"setCamera()"),new Promise((function(n){t.sendMessageToCallMachine({action:"set-camera",cameraDeviceId:e},(function(e){n({device:e.device})}))}))}},{key:"setAudioDevice",value:(q=g((function*(e){return Ha(),this.nativeUtils().setAudioDevice(e),{deviceId:yield this.nativeUtils().getAudioDevice()}})),function(e){return q.apply(this,arguments)})},{key:"cycleCamera",value:function(){var e=this,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};return new Promise((function(n){e.sendMessageToCallMachine({action:"cycle-camera",properties:t},(function(e){n({device:e.device})}))}))}},{key:"cycleMic",value:function(){var e=this;return za(),new Promise((function(t){e.sendMessageToCallMachine({action:"cycle-mic"},(function(e){t({device:e.device})}))}))}},{key:"getCameraFacingMode",value:function(){var e=this;return Ha(),new Promise((function(t){e.sendMessageToCallMachine({action:"get-camera-facing-mode"},(function(e){t(e.facingMode)}))}))}},{key:"setInputDevicesAsync",value:($=g((function*(e){var t=this,n=e.audioDeviceId,r=e.videoDeviceId,i=e.audioSource,o=e.videoSource;if(za(),void 0!==i&&(n=i),void 0!==o&&(r=o),"boolean"==typeof n&&(this._setAllowLocalAudio(n),n=void 0),"boolean"==typeof r&&(this._setAllowLocalVideo(r),r=void 0),!n&&!r)return yield this.getInputDevices();var a={};return n&&(n instanceof MediaStreamTrack?(this._sharedTracks.audioTrack=n,n=fo,a.audio={settings:{customTrack:n}}):(delete this._sharedTracks.audioTrack,a.audio={settings:{deviceId:n}})),r&&(r instanceof MediaStreamTrack?(this._sharedTracks.videoTrack=r,r=fo,a.video={settings:{customTrack:r}}):(delete this._sharedTracks.videoTrack,a.video={settings:{deviceId:r}})),this._callObjectMode&&this.needsLoad()?(this._updatePreloadCacheInputSettings(a,!1),this._devicesFromInputSettings(this._inputSettings)):new Promise((function(e){t.sendMessageToCallMachine({action:"set-input-devices",audioDeviceId:n,videoDeviceId:r},(function(n){if(delete n.action,delete n.callbackStamp,n.returnPreloadCache)return t._updatePreloadCacheInputSettings(a,!1),void e(t._devicesFromInputSettings(t._inputSettings));e(n)}))}))})),function(e){return $.apply(this,arguments)})},{key:"setOutputDeviceAsync",value:(Y=g((function*(e){var t=this,n=e.outputDeviceId;return za(),n&&(this._preloadCache.outputDeviceId=n),this._callObjectMode&&this.needsLoad()?this._devicesFromInputSettings(this._inputSettings):new Promise((function(e){t.sendMessageToCallMachine({action:"set-output-device",outputDeviceId:n},(function(n){delete n.action,delete n.callbackStamp,n.returnPreloadCache?e(t._devicesFromInputSettings(t._inputSettings)):e(n)}))}))})),function(e){return Y.apply(this,arguments)})},{key:"getInputDevices",value:(J=g((function*(){var e=this;return this._callObjectMode&&this.needsLoad()?this._devicesFromInputSettings(this._inputSettings):new Promise((function(t){e.sendMessageToCallMachine({action:"get-input-devices"},(function(n){n.returnPreloadCache?t(e._devicesFromInputSettings(e._inputSettings)):t({camera:n.camera,mic:n.mic,speaker:n.speaker})}))}))})),function(){return J.apply(this,arguments)})},{key:"nativeInCallAudioMode",value:function(){return Ha(),this._nativeInCallAudioMode}},{key:"setNativeInCallAudioMode",value:function(e){if(Ha(),[Aa,Ca].includes(e)){if(e!==this._nativeInCallAudioMode)return this._nativeInCallAudioMode=e,!this.disableReactNativeAutoDeviceManagement("audio")&&Ja(this._callState,this._isPreparingToJoin)&&this.nativeUtils().setAudioMode(this._nativeInCallAudioMode),this}else console.error("invalid in-call audio mode specified: ",e)}},{key:"preAuth",value:(U=g((function*(){var e=this,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};if(Ga(this._callObjectMode,"preAuth()"),Ya(this._callState,this._isPreparingToJoin,"preAuth()"),this.needsLoad()&&(yield this.load(t)),!t.url)throw new Error("preAuth() requires at least a url to be provided");return this.validateProperties(t),this.properties=ka(ka({},this.properties),t),new Promise((function(t,n){e._preloadCache.inputSettings=e._prepInputSettingsForSharing(e._inputSettings,!1),e.sendMessageToCallMachine({action:"daily-method-preauth",properties:Ba(e.properties,e.callClientId),preloadCache:Ba(e._preloadCache,e.callClientId)},(function(r){return r.error?n(r.error):r.access?(e._didPreAuth=!0,void t({access:r.access})):n(new Error("unknown error in preAuth()"))}))}))})),function(){return U.apply(this,arguments)})},{key:"load",value:(B=g((function*(e){var t=this;if(this.needsLoad()){if(this._destroyed&&(this._logUseAfterDestroy(),this.strictMode))throw new Error("Use after destroy");if(e&&(this.validateProperties(e),this.properties=ka(ka({},this.properties),e)),!this._callObjectMode&&!this.properties.url)throw new Error("can't load iframe meeting because url property isn't set");return this._updateCallState(_r),this.emitDailyJSEvent({action:ii}),this._callObjectMode?new Promise((function(e,n){t._callObjectLoader.cancel();var r=Date.now();t._callObjectLoader.load(t.properties.dailyConfig,(function(n){t._bundleLoadTime=n?"no-op":Date.now()-r,t._updateCallState(br),n&&t.emitDailyJSEvent({action:ai}),e()}),(function(e,r){if(t.emitDailyJSEvent({action:oi}),!r){t._updateCallState(Er),t.resetMeetingDependentVars();var i={action:io,errorMsg:e.msg,error:{type:"connection-error",msg:"Failed to load call object bundle.",details:{on:"load",sourceError:e,bundleUrl:P(t.properties.dailyConfig)}}};t._maybeSendToSentry(i),t.emitDailyJSEvent(i),n(e.msg)}}))})):(this._iframe.src=C(this.assembleMeetingUrl(),this.properties.dailyConfig),new Promise((function(e,n){t._loadedCallback=function(r){t._callState!==Er?(t._updateCallState(br),(t.properties.cssFile||t.properties.cssText)&&t.loadCss(t.properties),e()):n(r)}})))}})),function(e){return B.apply(this,arguments)})},{key:"join",value:(V=g((function*(){var e=this,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};this._testCallInProgress&&this.stopTestCallQuality();var n=!1;if(this.needsLoad()){this.updateIsPreparingToJoin(!0);try{yield this.load(t)}catch(e){return this.updateIsPreparingToJoin(!1),Promise.reject(e)}}else{if(n=!(!this.properties.cssFile&&!this.properties.cssText),this._didPreAuth){if(t.url&&t.url!==this.properties.url)return console.error("url in join() is different than the one used in preAuth()"),this.updateIsPreparingToJoin(!1),Promise.reject();if(t.token&&t.token!==this.properties.token)return console.error("token in join() is different than the one used in preAuth()"),this.updateIsPreparingToJoin(!1),Promise.reject()}if(t.url&&!this._callObjectMode&&t.url&&t.url!==this.properties.url)return console.error("url in join() is different than the one used in load() (".concat(this.properties.url," -> ").concat(t.url,")")),this.updateIsPreparingToJoin(!1),Promise.reject();this.validateProperties(t),this.properties=ka(ka({},this.properties),t)}return void 0!==t.showLocalVideo&&(this._callObjectMode?console.error("showLocalVideo is not available in callObject mode"):this._showLocalVideo=!!t.showLocalVideo),void 0!==t.showParticipantsBar&&(this._callObjectMode?console.error("showParticipantsBar is not available in callObject mode"):this._showParticipantsBar=!!t.showParticipantsBar),this._callState===wr||this._callState===Sr?(console.warn("already joined meeting, call leave() before joining again"),void this.updateIsPreparingToJoin(!1)):(this._updateCallState(Sr,!1),this.emitDailyJSEvent({action:ui}),this._preloadCache.inputSettings=this._prepInputSettingsForSharing(this._inputSettings||{},!1),this.sendMessageToCallMachine({action:"join-meeting",properties:Ba(this.properties,this.callClientId),preloadCache:Ba(this._preloadCache,this.callClientId)}),new Promise((function(t,r){e._joinedCallback=function(i,o){if(e._callState!==Er){if(e._updateCallState(wr),i)for(var a in i){if(e._callObjectMode){var s=e._callMachine().store;sa(i[a],s),ca(i[a],s),la(i[a],e._participants[a],s)}e._participants[a]=ka({},i[a]),e.toggleParticipantAudioBasedOnNativeAudioFocus()}n&&e.loadCss(e.properties),t(i)}else r(o)}})))})),function(){return V.apply(this,arguments)})},{key:"leave",value:(F=g((function*(){var e=this;return this._testCallInProgress&&this.stopTestCallQuality(),new Promise((function(t){e._callState===kr||e._callState===Er?t():e._callObjectLoader&&!e._callObjectLoader.loaded?(e._callObjectLoader.cancel(),e._updateCallState(kr),e.resetMeetingDependentVars(),e.emitDailyJSEvent({action:kr}),t()):(e._resolveLeave=t,e.sendMessageToCallMachine({action:"leave-meeting"}))}))})),function(){return F.apply(this,arguments)})},{key:"startScreenShare",value:(x=g((function*(){var e=this,t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};if($a(this._callMachineInitialized,"startScreenShare()"),t.screenVideoSendSettings&&this._validateVideoSendSettings("screenVideo",t.screenVideoSendSettings),t.mediaStream&&(this._sharedTracks.screenMediaStream=t.mediaStream,t.mediaStream=fo),"undefined"!=typeof DailyNativeUtils&&void 0!==DailyNativeUtils.isIOS&&DailyNativeUtils.isIOS){var n=this.nativeUtils();if(yield n.isScreenBeingCaptured())return void this.emitDailyJSEvent({action:ro,type:"screen-share-error",errorMsg:"Could not start the screen sharing. The screen is already been captured!"});n.setSystemScreenCaptureStartCallback((function(){n.setSystemScreenCaptureStartCallback(null),e.sendMessageToCallMachine({action:co,captureOptions:t})})),n.presentSystemScreenCapturePrompt()}else this.sendMessageToCallMachine({action:co,captureOptions:t})})),function(){return x.apply(this,arguments)})},{key:"stopScreenShare",value:function(){$a(this._callMachineInitialized,"stopScreenShare()"),this.sendMessageToCallMachine({action:"local-screen-stop"})}},{key:"startRecording",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=e.type;if(t&&"cloud"!==t&&"raw-tracks"!==t&&"local"!==t)throw new Error("invalid type: ".concat(t,", allowed values 'cloud', 'raw-tracks', or 'local'"));this.sendMessageToCallMachine(ka({action:"local-recording-start"},e))}},{key:"updateRecording",value:function(e){var t=e.layout,n=void 0===t?{preset:"default"}:t,r=e.instanceId;this.sendMessageToCallMachine({action:"daily-method-update-recording",layout:n,instanceId:r})}},{key:"stopRecording",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};this.sendMessageToCallMachine(ka({action:"local-recording-stop"},e))}},{key:"startLiveStreaming",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};this.sendMessageToCallMachine(ka({action:"daily-method-start-live-streaming"},e))}},{key:"updateLiveStreaming",value:function(e){var t=e.layout,n=void 0===t?{preset:"default"}:t,r=e.instanceId;this.sendMessageToCallMachine({action:"daily-method-update-live-streaming",layout:n,instanceId:r})}},{key:"addLiveStreamingEndpoints",value:function(e){var t=e.endpoints,n=e.instanceId;this.sendMessageToCallMachine({action:uo,endpointsOp:"add-endpoints",endpoints:t,instanceId:n})}},{key:"removeLiveStreamingEndpoints",value:function(e){var t=e.endpoints,n=e.instanceId;this.sendMessageToCallMachine({action:uo,endpointsOp:"remove-endpoints",endpoints:t,instanceId:n})}},{key:"stopLiveStreaming",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};this.sendMessageToCallMachine(ka({action:"daily-method-stop-live-streaming"},e))}},{key:"validateDailyConfig",value:function(e){e.camSimulcastEncodings&&(console.warn("camSimulcastEncodings is deprecated. Use sendSettings, found in DailyCallOptions, to provide camera simulcast settings."),this.validateSimulcastEncodings(e.camSimulcastEncodings)),e.screenSimulcastEncodings&&console.warn("screenSimulcastEncodings is deprecated. Use sendSettings, found in DailyCallOptions, to provide screen simulcast settings."),Mo()&&e.noAutoDefaultDeviceChange&&console.warn("noAutoDefaultDeviceChange is not supported on Android, and will be ignored.")}},{key:"validateSimulcastEncodings",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,n=arguments.length>2&&void 0!==arguments[2]&&arguments[2];if(e){if(!(e instanceof Array||Array.isArray(e)))throw new Error("encodings must be an Array");if(!ds(e.length,1,3))throw new Error("encodings must be an Array with between 1 to ".concat(3," layers"));for(var r=0;r<e.length;r++){var i=e[r];for(var o in this._validateEncodingLayerHasValidProperties(i),i)if(Ia.includes(o)){if("number"!=typeof i[o])throw new Error("".concat(o," must be a number"));if(t){var a=t[o],s=a.min,c=a.max;if(!ds(i[o],s,c))throw new Error("".concat(o," value not in range. valid range: ").concat(s," to ").concat(c))}}else if(!["active","scalabilityMode"].includes(o))throw new Error("Invalid key ".concat(o,", valid keys are:")+Object.values(Ia));if(n&&!i.hasOwnProperty("maxBitrate"))throw new Error("maxBitrate is not specified")}}}},{key:"startRemoteMediaPlayer",value:(j=g((function*(e){var t=this,n=e.url,r=e.settings,i=void 0===r?{state:vo.PLAY}:r;try{!function(e){if("string"!=typeof e)throw new Error('url parameter must be "string" type')}(n),ls(i),function(e){for(var t in e)if(!Da.includes(t))throw new Error("Invalid key ".concat(t,", valid keys are: ").concat(Da));e.simulcastEncodings&&this.validateSimulcastEncodings(e.simulcastEncodings,La,!0)}(i)}catch(e){throw console.error("invalid argument Error: ".concat(e)),console.error('startRemoteMediaPlayer arguments must be of the form:\n  { url: "playback url",\n  settings?:\n  {state: "play"|"pause", simulcastEncodings?: [{}] } }'),e}return new Promise((function(e,r){t.sendMessageToCallMachine({action:"daily-method-start-remote-media-player",url:n,settings:i},(function(t){t.error?r({error:t.error,errorMsg:t.errorMsg}):e({session_id:t.session_id,remoteMediaPlayerState:{state:t.state,settings:t.settings}})}))}))})),function(e){return j.apply(this,arguments)})},{key:"stopRemoteMediaPlayer",value:(R=g((function*(e){var t=this;if("string"!=typeof e)throw new Error(" remotePlayerID must be of type string");return new Promise((function(n,r){t.sendMessageToCallMachine({action:"daily-method-stop-remote-media-player",session_id:e},(function(e){e.error?r({error:e.error,errorMsg:e.errorMsg}):n()}))}))})),function(e){return R.apply(this,arguments)})},{key:"updateRemoteMediaPlayer",value:(N=g((function*(e){var t=this,n=e.session_id,r=e.settings;try{ls(r)}catch(e){throw console.error("invalid argument Error: ".concat(e)),console.error('updateRemoteMediaPlayer arguments must be of the form:\n  session_id: "participant session",\n  { settings?: {state: "play"|"pause"} }'),e}return new Promise((function(e,i){t.sendMessageToCallMachine({action:"daily-method-update-remote-media-player",session_id:n,settings:r},(function(t){t.error?i({error:t.error,errorMsg:t.errorMsg}):e({session_id:t.session_id,remoteMediaPlayerState:{state:t.state,settings:t.settings}})}))}))})),function(e){return N.apply(this,arguments)})},{key:"startTranscription",value:function(e){Ua(this._callState,"startTranscription()"),this.sendMessageToCallMachine(ka({action:"daily-method-start-transcription"},e))}},{key:"updateTranscription",value:function(e){if(Ua(this._callState,"updateTranscription()"),!e)throw new Error("updateTranscription Error: options is mandatory");if("object"!==o(e))throw new Error("updateTranscription Error: options must be object type");if(e.participants&&!Array.isArray(e.participants))throw new Error("updateTranscription Error: participants must be an array");this.sendMessageToCallMachine(ka({action:"daily-method-update-transcription"},e))}},{key:"stopTranscription",value:function(e){if(Ua(this._callState,"stopTranscription()"),e&&"object"!==o(e))throw new Error("stopTranscription Error: options must be object type");if(e&&!e.instanceId)throw new Error('"instanceId" not provided');this.sendMessageToCallMachine(ka({action:"daily-method-stop-transcription"},e))}},{key:"startDialOut",value:(D=g((function*(e){var t=this;Ua(this._callState,"startDialOut()");var n=function(e){if(e){if(!Array.isArray(e))throw new Error("Error starting dial out: audio codec must be an array");if(e.length<=0)throw new Error("Error starting dial out: audio codec array specified but empty");e.forEach((function(e){if("string"!=typeof e)throw new Error("Error starting dial out: audio codec must be a string");if("OPUS"!==e&&"PCMU"!==e&&"PCMA"!==e&&"G722"!==e)throw new Error("Error starting dial out: audio codec must be one of OPUS, PCMU, PCMA, G722")}))}};if(!e.sipUri&&!e.phoneNumber)throw new Error("Error starting dial out: either a sip uri or phone number must be provided");if(e.sipUri&&e.phoneNumber)throw new Error("Error starting dial out: only one of sip uri or phone number must be provided");if(e.sipUri){if("string"!=typeof e.sipUri)throw new Error("Error starting dial out: sipUri must be a string");if(!e.sipUri.startsWith("sip:"))throw new Error("Error starting dial out: Invalid SIP URI, must start with 'sip:'");if(e.video&&"boolean"!=typeof e.video)throw new Error("Error starting dial out: video must be a boolean value");!function(e){if(e&&(n(e.audio),e.video)){if(!Array.isArray(e.video))throw new Error("Error starting dial out: video codec must be an array");if(e.video.length<=0)throw new Error("Error starting dial out: video codec array specified but empty");e.video.forEach((function(e){if("string"!=typeof e)throw new Error("Error starting dial out: video codec must be a string");if("H264"!==e&&"VP8"!==e)throw new Error("Error starting dial out: video codec must be H264 or VP8")}))}}(e.codecs)}if(e.phoneNumber){if("string"!=typeof e.phoneNumber)throw new Error("Error starting dial out: phoneNumber must be a string");if(!/^\+\d{1,}$/.test(e.phoneNumber))throw new Error("Error starting dial out: Invalid phone number, must be valid phone number as per E.164");e.codecs&&n(e.codecs.audio)}if(e.callerId){if("string"!=typeof e.callerId)throw new Error("Error starting dial out: callerId must be a string");if(e.sipUri)throw new Error("Error starting dial out: callerId not allowed with sipUri")}if(e.displayName){if("string"!=typeof e.displayName)throw new Error("Error starting dial out: displayName must be a string");if(e.displayName.length>=200)throw new Error("Error starting dial out: displayName length must be less than 200")}if(e.userId){if("string"!=typeof e.userId)throw new Error("Error starting dial out: userId must be a string");if(e.userId.length>36)throw new Error("Error starting dial out: userId length must be less than or equal to 36")}return new Promise((function(n,r){t.sendMessageToCallMachine(ka({action:"dialout-start"},e),(function(e){e.error?r(e.error):n(e)}))}))})),function(e){return D.apply(this,arguments)})},{key:"stopDialOut",value:function(e){var t=this;return Ua(this._callState,"stopDialOut()"),new Promise((function(n,r){t.sendMessageToCallMachine(ka({action:"dialout-stop"},e),(function(e){e.error?r(e.error):n(e)}))}))}},{key:"sipCallTransfer",value:(I=g((function*(e){var t=this;if(Ua(this._callState,"sipCallTransfer()"),!e)throw new Error("sipCallTransfer() requires a sessionId and toEndPoint");return e.useSipRefer=!1,us(e,"sipCallTransfer"),new Promise((function(n,r){t.sendMessageToCallMachine(ka({action:mo},e),(function(e){e.error?r(e.error):n(e)}))}))})),function(e){return I.apply(this,arguments)})},{key:"sipRefer",value:(L=g((function*(e){var t=this;if(Ua(this._callState,"sipRefer()"),!e)throw new Error("sessionId and toEndPoint are mandatory parameter");return e.useSipRefer=!0,us(e,"sipRefer"),new Promise((function(n,r){t.sendMessageToCallMachine(ka({action:mo},e),(function(e){e.error?r(e.error):n(e)}))}))})),function(e){return L.apply(this,arguments)})},{key:"sendDTMF",value:(O=g((function*(e){var t=this;return Ua(this._callState,"sendDTMF()"),function(e){var t=e.sessionId,n=e.tones;if(!t||!n)throw new Error("sessionId and tones are mandatory parameter");if("string"!=typeof t||"string"!=typeof n)throw new Error("sessionId and tones should be of string type");if(n.length>20)throw new Error("tones string must be upto 20 characters");var r=n.match(/[^0-9A-D*#]/g);if(r&&r[0])throw new Error("".concat(r[0]," is not valid DTMF tone"))}(e),new Promise((function(n,r){t.sendMessageToCallMachine(ka({action:"send-dtmf"},e),(function(e){e.error?r(e.error):n(e)}))}))})),function(e){return O.apply(this,arguments)})},{key:"getNetworkStats",value:function(){var e=this;return this._callState!==wr?{stats:{latest:{}}}:new Promise((function(t){e.sendMessageToCallMachine({action:"get-calc-stats"},(function(n){t(ka({stats:n.stats},e._network))}))}))}},{key:"testWebsocketConnectivity",value:(A=g((function*(){var e=this;if(qa(this._testCallInProgress,"testWebsocketConnectivity()"),this.needsLoad())try{yield this.load()}catch(e){return Promise.reject(e)}return new Promise((function(t,n){e.sendMessageToCallMachine({action:"test-websocket-connectivity"},(function(e){e.error?n(e.error):t(e.results)}))}))})),function(){return A.apply(this,arguments)})},{key:"abortTestWebsocketConnectivity",value:function(){this.sendMessageToCallMachine({action:"abort-test-websocket-connectivity"})}},{key:"_validateVideoTrackForNetworkTests",value:function(e){return e?e instanceof MediaStreamTrack?!!function(e,t){var n=t.isLocalScreenVideo;return e&&"live"===e.readyState&&!function(e,t){return(!t.isLocalScreenVideo||"Chrome"!==Co())&&e.muted&&!_a.has(e.id)}(e,{isLocalScreenVideo:n})}(e,{isLocalScreenVideo:!1})||(console.error("Video track is not playable. This test needs a live video track."),!1):(console.error("Video track needs to be of type `MediaStreamTrack`."),!1):(console.error("Missing video track. You must provide a video track in order to run this test."),!1)}},{key:"testCallQuality",value:(E=g((function*(){var e=this;za(),Ga(this._callObjectMode,"testCallQuality()"),$a(this._callMachineInitialized,"testCallQuality()",null,!0),Ya(this._callState,this._isPreparingToJoin,"testCallQuality()");var t=this._testCallAlreadyInProgress,n=function(n){t||(e._testCallInProgress=n)};if(n(!0),this.needsLoad())try{var i=this._callState;yield this.load(),this._callState=i}catch(e){return n(!1),Promise.reject(e)}return new Promise((function(t){e.sendMessageToCallMachine({action:"test-call-quality",dailyJsVersion:e.properties.dailyJsVersion},(function(i){var o=i.results,a=o.result,s=r(o,ba);if("failed"===a){var c,u=ka({},s);null!==(c=s.error)&&void 0!==c&&c.details?(s.error.details=JSON.parse(s.error.details),u.error=ka(ka({},u.error),{},{details:ka({},u.error.details)}),u.error.details.duringTest="testCallQuality"):(u.error=u.error?ka({},u.error):{},u.error.details={duringTest:"testCallQuality"}),e._maybeSendToSentry(u)}n(!1),t(ka({result:a},s))}))}))})),function(){return E.apply(this,arguments)})},{key:"stopTestCallQuality",value:function(){this.sendMessageToCallMachine({action:"stop-test-call-quality"})}},{key:"testConnectionQuality",value:(w=g((function*(e){var t;_o()?(console.warn("testConnectionQuality() is deprecated: use testPeerToPeerCallQuality() instead"),t=yield this.testPeerToPeerCallQuality(e)):(console.warn("testConnectionQuality() is deprecated: use testCallQuality() instead"),t=yield this.testCallQuality());var n={result:t.result,secondsElapsed:t.secondsElapsed};return t.data&&(n.data={maxRTT:t.data.maxRoundTripTime,packetLoss:t.data.avgRecvPacketLoss}),n})),function(e){return w.apply(this,arguments)})},{key:"testPeerToPeerCallQuality",value:(S=g((function*(e){var t=this;if(qa(this._testCallInProgress,"testPeerToPeerCallQuality()"),this.needsLoad())try{yield this.load()}catch(e){return Promise.reject(e)}var n=e.videoTrack,r=e.duration;if(!this._validateVideoTrackForNetworkTests(n))throw new Error("Video track error");return this._sharedTracks.videoTrackForConnectionQualityTest=n,new Promise((function(e,n){t.sendMessageToCallMachine({action:"test-p2p-call-quality",duration:r},(function(t){t.error?n(t.error):e(t.results)}))}))})),function(e){return S.apply(this,arguments)})},{key:"stopTestConnectionQuality",value:function(){_o()?(console.warn("stopTestConnectionQuality() is deprecated: use testPeerToPeerCallQuality() and stopTestPeerToPeerCallQuality() instead"),this.stopTestPeerToPeerCallQuality()):(console.warn("stopTestConnectionQuality() is deprecated: use testCallQuality() and stopTestCallQuality() instead"),this.stopTestCallQuality())}},{key:"stopTestPeerToPeerCallQuality",value:function(){this.sendMessageToCallMachine({action:"stop-test-p2p-call-quality"})}},{key:"testNetworkConnectivity",value:(_=g((function*(e){var t=this;if(qa(this._testCallInProgress,"testNetworkConnectivity()"),this.needsLoad())try{yield this.load()}catch(e){return Promise.reject(e)}if(!this._validateVideoTrackForNetworkTests(e))throw new Error("Video track error");return this._sharedTracks.videoTrackForNetworkConnectivityTest=e,new Promise((function(e,n){t.sendMessageToCallMachine({action:"test-network-connectivity"},(function(t){t.error?n(t.error):e(t.results)}))}))})),function(e){return _.apply(this,arguments)})},{key:"abortTestNetworkConnectivity",value:function(){this.sendMessageToCallMachine({action:"abort-test-network-connectivity"})}},{key:"getCpuLoadStats",value:function(){var e=this;return new Promise((function(t){e._callState===wr?e.sendMessageToCallMachine({action:"get-cpu-load-stats"},(function(e){t(e.cpuStats)})):t({cpuLoadState:void 0,cpuLoadStateReason:void 0,stats:{}})}))}},{key:"_validateEncodingLayerHasValidProperties",value:function(e){var t;if(!((null===(t=Object.keys(e))||void 0===t?void 0:t.length)>0))throw new Error("Empty encoding is not allowed. At least one of these valid keys should be specified:"+Object.values(Ia))}},{key:"_validateVideoSendSettings",value:function(e,t){var n="screenVideo"===e?["default-screen-video","detail-optimized","motion-optimized","motion-and-detail-balanced"]:["default-video","bandwidth-optimized","bandwidth-and-quality-balanced","quality-optimized","adaptive-2-layers","adaptive-3-layers"],r="Video send settings should be either an object or one of the supported presets: ".concat(n.join());if("string"==typeof t){if(!n.includes(t))throw new Error(r)}else{if("object"!==o(t))throw new Error(r);if(!t.maxQuality&&!t.encodings&&void 0===t.allowAdaptiveLayers)throw new Error("Video send settings must contain at least maxQuality, allowAdaptiveLayers or encodings attribute");if(t.maxQuality&&-1===["low","medium","high"].indexOf(t.maxQuality))throw new Error("maxQuality must be either low, medium or high");if(t.encodings){var i=!1;switch(Object.keys(t.encodings).length){case 1:i=!t.encodings.low;break;case 2:i=!t.encodings.low||!t.encodings.medium;break;case 3:i=!t.encodings.low||!t.encodings.medium||!t.encodings.high;break;default:i=!0}if(i)throw new Error("Encodings must be defined as: low, low and medium, or low, medium and high.");t.encodings.low&&this._validateEncodingLayerHasValidProperties(t.encodings.low),t.encodings.medium&&this._validateEncodingLayerHasValidProperties(t.encodings.medium),t.encodings.high&&this._validateEncodingLayerHasValidProperties(t.encodings.high)}}}},{key:"validateUpdateSendSettings",value:function(e){var t=this;if(!e||0===Object.keys(e).length)throw new Error("Send settings must contain at least information for one track!");Object.entries(e).forEach((function(e){var n=y(e,2),r=n[0],i=n[1];t._validateVideoSendSettings(r,i)}))}},{key:"updateSendSettings",value:function(e){var t=this;return this.validateUpdateSendSettings(e),this.needsLoad()?(this._preloadCache.sendSettings=e,{sendSettings:this._preloadCache.sendSettings}):new Promise((function(n,r){t.sendMessageToCallMachine({action:"update-send-settings",sendSettings:e},(function(e){e.error?r(e.error):n(e.sendSettings)}))}))}},{key:"getSendSettings",value:function(){return this._sendSettings||this._preloadCache.sendSettings}},{key:"getLocalAudioLevel",value:function(){return this._localAudioLevel}},{key:"getRemoteParticipantsAudioLevel",value:function(){return this._remoteParticipantsAudioLevel}},{key:"getActiveSpeaker",value:function(){return za(),this._activeSpeaker}},{key:"setActiveSpeakerMode",value:function(e){return za(),this.sendMessageToCallMachine({action:"set-active-speaker-mode",enabled:e}),this}},{key:"activeSpeakerMode",value:function(){return za(),this._activeSpeakerMode}},{key:"subscribeToTracksAutomatically",value:function(){return this._preloadCache.subscribeToTracksAutomatically}},{key:"setSubscribeToTracksAutomatically",value:function(e){return Ua(this._callState,"setSubscribeToTracksAutomatically()","Use the subscribeToTracksAutomatically configuration property."),this._preloadCache.subscribeToTracksAutomatically=e,this.sendMessageToCallMachine({action:"daily-method-subscribe-to-tracks-automatically",enabled:e}),this}},{key:"enumerateDevices",value:(m=g((function*(){var e=this;if(this._callObjectMode){var t=yield navigator.mediaDevices.enumerateDevices();return"Firefox"===Co()&&Po().major>115&&Po().major<123&&(t=t.filter((function(e){return"audiooutput"!==e.kind}))),{devices:t.map((function(e){var t=JSON.parse(JSON.stringify(e));if(!_o()&&"videoinput"===e.kind&&e.getCapabilities){var n,r=e.getCapabilities();t.facing=(null==r||null===(n=r.facingMode)||void 0===n?void 0:n.length)>=1?r.facingMode[0]:void 0}return t}))}}return new Promise((function(t){e.sendMessageToCallMachine({action:"enumerate-devices"},(function(e){t({devices:e.devices})}))}))})),function(){return m.apply(this,arguments)})},{key:"sendAppMessage",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"*";if(Ua(this._callState,"sendAppMessage()"),JSON.stringify(e).length>this._maxAppMessageSize)throw new Error("Message data too large. Max size is "+this._maxAppMessageSize);return this.sendMessageToCallMachine({action:"app-msg",data:e,to:t}),this}},{key:"addFakeParticipant",value:function(e){return za(),Ua(this._callState,"addFakeParticipant()"),this.sendMessageToCallMachine(ka({action:"add-fake-participant"},e)),this}},{key:"setShowNamesMode",value:function(e){return Wa(this._callObjectMode,"setShowNamesMode()"),za(),e&&"always"!==e&&"never"!==e?(console.error('setShowNamesMode argument should be "always", "never", or false'),this):(this.sendMessageToCallMachine({action:"set-show-names",mode:e}),this)}},{key:"setShowLocalVideo",value:function(){var e=!(arguments.length>0&&void 0!==arguments[0])||arguments[0];return Wa(this._callObjectMode,"setShowLocalVideo()"),za(),Ua(this._callState,"setShowLocalVideo()"),"boolean"!=typeof e?(console.error("setShowLocalVideo only accepts a boolean value"),this):(this.sendMessageToCallMachine({action:"set-show-local-video",show:e}),this._showLocalVideo=e,this)}},{key:"showLocalVideo",value:function(){return Wa(this._callObjectMode,"showLocalVideo()"),za(),this._showLocalVideo}},{key:"setShowParticipantsBar",value:function(){var e=!(arguments.length>0&&void 0!==arguments[0])||arguments[0];return Wa(this._callObjectMode,"setShowParticipantsBar()"),za(),Ua(this._callState,"setShowParticipantsBar()"),"boolean"!=typeof e?(console.error("setShowParticipantsBar only accepts a boolean value"),this):(this.sendMessageToCallMachine({action:"set-show-participants-bar",show:e}),this._showParticipantsBar=e,this)}},{key:"showParticipantsBar",value:function(){return Wa(this._callObjectMode,"showParticipantsBar()"),za(),this._showParticipantsBar}},{key:"customIntegrations",value:function(){return za(),Wa(this._callObjectMode,"customIntegrations()"),this._customIntegrations}},{key:"setCustomIntegrations",value:function(e){return za(),Wa(this._callObjectMode,"setCustomIntegrations()"),Ua(this._callState,"setCustomIntegrations()"),ss(e)?(this.sendMessageToCallMachine({action:"set-custom-integrations",integrations:e}),this._customIntegrations=e,this):this}},{key:"startCustomIntegrations",value:function(e){var t=this;if(za(),Wa(this._callObjectMode,"startCustomIntegrations()"),Ua(this._callState,"startCustomIntegrations()"),Array.isArray(e)&&e.some((function(e){return"string"!=typeof e}))||!Array.isArray(e)&&"string"!=typeof e)return console.error("startCustomIntegrations() only accepts string | string[]"),this;var n="string"==typeof e?[e]:e,r=n.filter((function(e){return!(e in t._customIntegrations)}));return r.length?(console.error("Can't find custom integration(s): \"".concat(r.join(", "),'"')),this):(this.sendMessageToCallMachine({action:"start-custom-integrations",ids:n}),this)}},{key:"stopCustomIntegrations",value:function(e){var t=this;if(za(),Wa(this._callObjectMode,"stopCustomIntegrations()"),Ua(this._callState,"stopCustomIntegrations()"),Array.isArray(e)&&e.some((function(e){return"string"!=typeof e}))||!Array.isArray(e)&&"string"!=typeof e)return console.error("stopCustomIntegrations() only accepts string | string[]"),this;var n="string"==typeof e?[e]:e,r=n.filter((function(e){return!(e in t._customIntegrations)}));return r.length?(console.error("Can't find custom integration(s): \"".concat(r.join(", "),'"')),this):(this.sendMessageToCallMachine({action:"stop-custom-integrations",ids:n}),this)}},{key:"customTrayButtons",value:function(){return Wa(this._callObjectMode,"customTrayButtons()"),za(),this._customTrayButtons}},{key:"updateCustomTrayButtons",value:function(e){return Wa(this._callObjectMode,"updateCustomTrayButtons()"),za(),Ua(this._callState,"updateCustomTrayButtons()"),as(e)?(this.sendMessageToCallMachine({action:"update-custom-tray-buttons",btns:e}),this._customTrayButtons=e,this):(console.error("updateCustomTrayButtons only accepts a dictionary of the type ".concat(JSON.stringify(Ra))),this)}},{key:"theme",value:function(){return Wa(this._callObjectMode,"theme()"),this.properties.theme}},{key:"setTheme",value:function(e){var t=this;return Wa(this._callObjectMode,"setTheme()"),new Promise((function(n,r){try{t.validateProperties({theme:e}),t.properties.theme=ka({},e),t.sendMessageToCallMachine({action:"set-theme",theme:t.properties.theme});try{t.emitDailyJSEvent({action:ri,theme:t.properties.theme})}catch(e){console.log("could not emit 'theme-updated'",e)}n(t.properties.theme)}catch(e){r(e)}}))}},{key:"requestFullscreen",value:(v=g((function*(){if(za(),this._iframe&&!document.fullscreenElement&&So())try{(yield this._iframe.requestFullscreen)?this._iframe.requestFullscreen():this._iframe.webkitRequestFullscreen()}catch(e){console.log("could not make video call fullscreen",e)}})),function(){return v.apply(this,arguments)})},{key:"exitFullscreen",value:function(){za(),document.fullscreenElement?document.exitFullscreen():document.webkitFullscreenElement&&document.webkitExitFullscreen()}},{key:"getSidebarView",value:(l=g((function*(){var e=this;return this._callObjectMode?(console.error("getSidebarView is not available in callObject mode"),Promise.resolve(null)):new Promise((function(t){e.sendMessageToCallMachine({action:"get-sidebar-view"},(function(e){t(e.view)}))}))})),function(){return l.apply(this,arguments)})},{key:"setSidebarView",value:function(e){return this._callObjectMode?(console.error("setSidebarView is not available in callObject mode"),this):(this.sendMessageToCallMachine({action:"set-sidebar-view",view:e}),this)}},{key:"room",value:(s=g((function*(){var e=this,t=(arguments.length>0&&void 0!==arguments[0]?arguments[0]:{}).includeRoomConfigDefaults,n=void 0===t||t;return this._accessState.access===Lr||this.needsLoad()?this.properties.url?{roomUrlPendingJoin:this.properties.url}:null:new Promise((function(t){e.sendMessageToCallMachine({action:"lib-room-info",includeRoomConfigDefaults:n},(function(e){delete e.action,delete e.callbackStamp,t(e)}))}))})),function(){return s.apply(this,arguments)})},{key:"geo",value:(a=g((function*(){try{var e=yield fetch("https://gs.daily.co/_ks_/x-swsl/:");return{current:(yield e.json()).geo}}catch(e){return console.error("geo lookup failed",e),{current:""}}})),function(){return a.apply(this,arguments)})},{key:"setNetworkTopology",value:(n=g((function*(e){var t=this;return za(),Ua(this._callState,"setNetworkTopology()"),new Promise((function(n,r){t.sendMessageToCallMachine({action:"set-network-topology",opts:e},(function(e){e.error?r({error:e.error}):n({workerId:e.workerId})}))}))})),function(e){return n.apply(this,arguments)})},{key:"getNetworkTopology",value:(t=g((function*(){var e=this;return new Promise((function(t,n){e.needsLoad()&&t({topology:"none"}),e.sendMessageToCallMachine({action:"get-network-topology"},(function(e){e.error?n({error:e.error}):t({topology:e.topology})}))}))})),function(){return t.apply(this,arguments)})},{key:"setPlayNewParticipantSound",value:function(e){if(za(),"number"!=typeof e&&!0!==e&&!1!==e)throw new Error("argument to setShouldPlayNewParticipantSound should be true, false, or a number, but is ".concat(e));this.sendMessageToCallMachine({action:"daily-method-set-play-ding",arg:e})}},{key:"on",value:function(e,t){return b().prototype.on.call(this,e,t)}},{key:"once",value:function(e,t){return b().prototype.once.call(this,e,t)}},{key:"off",value:function(e,t){return b().prototype.off.call(this,e,t)}},{key:"validateProperties",value:function(e){var t,n;if(null!=e&&null!==(t=e.dailyConfig)&&void 0!==t&&t.userMediaAudioConstraints){var r,i,o;_o()||console.warn("userMediaAudioConstraints is deprecated. You can override constraints with inputSettings.audio.settings, found in DailyCallOptions.");var a=e.inputSettings||{};a.audio=(null===(r=e.inputSettings)||void 0===r?void 0:r.audio)||{},a.audio.settings=(null===(i=e.inputSettings)||void 0===i||null===(o=i.audio)||void 0===o?void 0:o.settings)||{},a.audio.settings=ka(ka({},a.audio.settings),e.dailyConfig.userMediaAudioConstraints),e.inputSettings=a,delete e.dailyConfig.userMediaAudioConstraints}if(null!=e&&null!==(n=e.dailyConfig)&&void 0!==n&&n.userMediaVideoConstraints){var s,c,u;_o()||console.warn("userMediaVideoConstraints is deprecated. You can override constraints with inputSettings.video.settings, found in DailyCallOptions.");var l=e.inputSettings||{};l.video=(null===(s=e.inputSettings)||void 0===s?void 0:s.video)||{},l.video.settings=(null===(c=e.inputSettings)||void 0===c||null===(u=c.video)||void 0===u?void 0:u.settings)||{},l.video.settings=ka(ka({},l.video.settings),e.dailyConfig.userMediaVideoConstraints),e.inputSettings=l,delete e.dailyConfig.userMediaVideoConstraints}for(var d in e){if(!xa[d])throw new Error("unrecognized property '".concat(d,"'"));if(xa[d].validate&&!xa[d].validate(e[d],this))throw new Error("property '".concat(d,"': ").concat(xa[d].help))}}},{key:"assembleMeetingUrl",value:function(){var e,t,n=ka(ka({},this.properties),{},{emb:this.callClientId,embHref:encodeURIComponent(window.location.href),proxy:null!==(e=this.properties.dailyConfig)&&void 0!==e&&e.proxyUrl?encodeURIComponent(null===(t=this.properties.dailyConfig)||void 0===t?void 0:t.proxyUrl):void 0}),r=n.url.match(/\?/)?"&":"?";return n.url+r+Object.keys(xa).filter((function(e){return xa[e].queryString&&void 0!==n[e]})).map((function(e){return"".concat(xa[e].queryString,"=").concat(n[e])})).join("&")}},{key:"needsLoad",value:function(){return[yr,_r,kr,Er].includes(this._callState)}},{key:"sendMessageToCallMachine",value:function(e,t){if(this._destroyed&&(this._logUseAfterDestroy(),this.strictMode))throw new Error("Use after destroy");this._messageChannel.sendMessageToCallMachine(e,t,this.callClientId,this._iframe)}},{key:"forwardPackagedMessageToCallMachine",value:function(e){this._messageChannel.forwardPackagedMessageToCallMachine(e,this._iframe,this.callClientId)}},{key:"addListenerForPackagedMessagesFromCallMachine",value:function(e){return this._messageChannel.addListenerForPackagedMessagesFromCallMachine(e,this.callClientId)}},{key:"removeListenerForPackagedMessagesFromCallMachine",value:function(e){this._messageChannel.removeListenerForPackagedMessagesFromCallMachine(e)}},{key:"handleMessageFromCallMachine",value:function(e){switch(e.action){case ti:this.sendMessageToCallMachine(ka({action:ni},this.properties));break;case"call-machine-initialized":this._callMachineInitialized=!0;var t={action:lo,level:"log",code:1011,stats:{event:"bundle load",time:"no-op"===this._bundleLoadTime?0:this._bundleLoadTime,preLoaded:"no-op"===this._bundleLoadTime,url:P(this.properties.dailyConfig)}};this.sendMessageToCallMachine(t),this._delayDuplicateInstanceLog&&this._logDuplicateInstanceAttempt();break;case ai:this._loadedCallback&&(this._loadedCallback(),this._loadedCallback=null),this.emitDailyJSEvent(e);break;case li:var n,i=ka({},e);delete i.internal,this._maxAppMessageSize=(null===(n=e.internal)||void 0===n?void 0:n._maxAppMessageSize)||oo,this._joinedCallback&&(this._joinedCallback(e.participants),this._joinedCallback=null),this.emitDailyJSEvent(i);break;case fi:case pi:if(this._callState===kr)return;if(e.participant&&e.participant.session_id){var o=e.participant.local?"local":e.participant.session_id;if(this._callObjectMode){var a=this._callMachine().store;sa(e.participant,a),ca(e.participant,a),la(e.participant,this._participants[o],a)}try{this.maybeParticipantTracksStopped(this._participants[o],e.participant),this.maybeParticipantTracksStarted(this._participants[o],e.participant),this.maybeEventRecordingStopped(this._participants[o],e.participant),this.maybeEventRecordingStarted(this._participants[o],e.participant)}catch(e){console.error("track events error",e)}this.compareEqualForParticipantUpdateEvent(e.participant,this._participants[o])||(this._participants[o]=ka({},e.participant),this.toggleParticipantAudioBasedOnNativeAudioFocus(),this.emitDailyJSEvent(e))}break;case hi:if(e.participant&&e.participant.session_id){var s=this._participants[e.participant.session_id];s&&this.maybeParticipantTracksStopped(s,null),delete this._participants[e.participant.session_id],this.emitDailyJSEvent(e)}break;case vi:k(this._participantCounts,e.participantCounts)||(this._participantCounts=e.participantCounts,this.emitDailyJSEvent(e));break;case gi:var c={access:e.access};e.awaitingAccess&&(c.awaitingAccess=e.awaitingAccess),k(this._accessState,c)||(this._accessState=c,this.emitDailyJSEvent(e));break;case mi:if(e.meetingSession){this._meetingSessionSummary=e.meetingSession,this.emitDailyJSEvent(e);var u=ka(ka({},e),{},{action:"meeting-session-updated"});this.emitDailyJSEvent(u)}break;case io:var l;this._iframe&&!e.preserveIframe&&(this._iframe.src=""),this._updateCallState(Er),this.resetMeetingDependentVars(),this._loadedCallback&&(this._loadedCallback(e.errorMsg),this._loadedCallback=null),e.preserveIframe;var d=r(e,Sa);null!=d&&null!==(l=d.error)&&void 0!==l&&l.details&&(d.error.details=JSON.parse(d.error.details)),this._maybeSendToSentry(e),this._joinedCallback&&(this._joinedCallback(null,d),this._joinedCallback=null),this.emitDailyJSEvent(d);break;case di:this._callState!==Er&&this._updateCallState(kr),this.resetMeetingDependentVars(),this._resolveLeave&&(this._resolveLeave(),this._resolveLeave=null),this.emitDailyJSEvent(e);break;case"selected-devices-updated":e.devices&&this.emitDailyJSEvent(e);break;case $i:var f=e.threshold,p=e.quality;f===this._network.threshold&&p===this._network.quality||(this._network.quality=p,this._network.threshold=f,this.emitDailyJSEvent(e));break;case Gi:e&&e.cpuLoadState&&this.emitDailyJSEvent(e);break;case Wi:e&&void 0!==e.faceCounts&&this.emitDailyJSEvent(e);break;case Ji:var h=e.activeSpeaker;this._activeSpeaker.peerId!==h.peerId&&(this._activeSpeaker.peerId=h.peerId,this.emitDailyJSEvent({action:e.action,activeSpeaker:this._activeSpeaker}));break;case"show-local-video-changed":if(this._callObjectMode)return;var v=e.show;this._showLocalVideo=v,this.emitDailyJSEvent({action:e.action,show:v});break;case Yi:var g=e.enabled;this._activeSpeakerMode!==g&&(this._activeSpeakerMode=g,this.emitDailyJSEvent({action:e.action,enabled:this._activeSpeakerMode}));break;case bi:case Si:case wi:this._waitingParticipants=e.allWaitingParticipants,this.emitDailyJSEvent({action:e.action,participant:e.participant});break;case to:k(this._receiveSettings,e.receiveSettings)||(this._receiveSettings=e.receiveSettings,this.emitDailyJSEvent({action:e.action,receiveSettings:e.receiveSettings}));break;case no:this._maybeUpdateInputSettings(e.inputSettings);break;case"send-settings-updated":k(this._sendSettings,e.sendSettings)||(this._sendSettings=e.sendSettings,this._preloadCache.sendSettings=null,this.emitDailyJSEvent({action:e.action,sendSettings:e.sendSettings}));break;case"local-audio-level":this._localAudioLevel=e.audioLevel,this._preloadCache.localAudioLevelObserver=null,this.emitDailyJSEvent(e);break;case"remote-participants-audio-level":this._remoteParticipantsAudioLevel=e.participantsAudioLevel,this._preloadCache.remoteParticipantsAudioLevelObserver=null,this.emitDailyJSEvent(e);break;case ji:var m=e.session_id;this._rmpPlayerState[m]=e.playerState,this.emitDailyJSEvent(e);break;case Fi:delete this._rmpPlayerState[e.session_id],this.emitDailyJSEvent(e);break;case xi:var y=e.session_id,_=this._rmpPlayerState[y];_&&this.compareEqualForRMPUpdateEvent(_,e.remoteMediaPlayerState)||(this._rmpPlayerState[y]=e.remoteMediaPlayerState,this.emitDailyJSEvent(e));break;case"custom-button-click":case"sidebar-view-changed":this.emitDailyJSEvent(e);break;case yi:var b=this._meetingSessionState.topology!==(e.meetingSessionState&&e.meetingSessionState.topology);this._meetingSessionState=fs(e.meetingSessionState,this._callObjectMode),(this._callObjectMode||b)&&this.emitDailyJSEvent(e);break;case Vi:this._isScreenSharing=!0,this.emitDailyJSEvent(e);break;case Bi:case Ui:this._isScreenSharing=!1,this.emitDailyJSEvent(e);break;case Ci:case Pi:case Oi:case Li:case Ii:case Ti:case Mi:case Ai:case si:case ci:case Ni:case Ri:case"test-completed":case qi:case Di:case Qi:case Ki:case Xi:case Zi:case ro:case eo:case"dialin-ready":case"dialin-connected":case"dialin-error":case"dialin-stopped":case"dialin-warning":case"dialout-connected":case"dialout-answered":case"dialout-error":case"dialout-stopped":case"dialout-warning":this.emitDailyJSEvent(e);break;case"request-fullscreen":this.requestFullscreen();break;case"request-exit-fullscreen":this.exitFullscreen()}}},{key:"maybeEventRecordingStopped",value:function(e,t){var n="record";e&&(t.local||!1!==t[n]||e[n]===t[n]||this.emitDailyJSEvent({action:Pi}))}},{key:"maybeEventRecordingStarted",value:function(e,t){var n="record";e&&(t.local||!0!==t[n]||e[n]===t[n]||this.emitDailyJSEvent({action:Ci}))}},{key:"_trackStatePlayable",value:function(e){return!(!e||e.state!==Or)}},{key:"_trackChanged",value:function(e,t){return!((null==e?void 0:e.id)===(null==t?void 0:t.id))}},{key:"maybeEventTrackStopped",value:function(e,t,n){var r,i,o=null!==(r=null==t?void 0:t.tracks[e])&&void 0!==r?r:null,a=null!==(i=null==n?void 0:n.tracks[e])&&void 0!==i?i:null,s=null==o?void 0:o.track;if(s){var c=this._trackStatePlayable(o),u=this._trackStatePlayable(a),l=this._trackChanged(s,null==a?void 0:a.track);c&&(u&&!l||this.emitDailyJSEvent({action:Ei,track:s,participant:null!=n?n:t,type:e}))}}},{key:"maybeEventTrackStarted",value:function(e,t,n){var r,i,o=null!==(r=null==t?void 0:t.tracks[e])&&void 0!==r?r:null,a=null!==(i=null==n?void 0:n.tracks[e])&&void 0!==i?i:null,s=null==a?void 0:a.track;if(s){var c=this._trackStatePlayable(o),u=this._trackStatePlayable(a),l=this._trackChanged(null==o?void 0:o.track,s);u&&(c&&!l||this.emitDailyJSEvent({action:ki,track:s,participant:n,type:e}))}}},{key:"maybeParticipantTracksStopped",value:function(e,t){if(e)for(var n in e.tracks)this.maybeEventTrackStopped(n,e,t)}},{key:"maybeParticipantTracksStarted",value:function(e,t){if(t)for(var n in t.tracks)this.maybeEventTrackStarted(n,e,t)}},{key:"compareEqualForRMPUpdateEvent",value:function(e,t){var n,r;return e.state===t.state&&(null===(n=e.settings)||void 0===n?void 0:n.volume)===(null===(r=t.settings)||void 0===r?void 0:r.volume)}},{key:"emitDailyJSEvent",value:function(e){try{e.callClientId=this.callClientId,this.emit(e.action,e)}catch(t){console.log("could not emit",e,t)}}},{key:"compareEqualForParticipantUpdateEvent",value:function(e,t){return!(!k(e,t)||e.videoTrack&&t.videoTrack&&(e.videoTrack.id!==t.videoTrack.id||e.videoTrack.muted!==t.videoTrack.muted||e.videoTrack.enabled!==t.videoTrack.enabled)||e.audioTrack&&t.audioTrack&&(e.audioTrack.id!==t.audioTrack.id||e.audioTrack.muted!==t.audioTrack.muted||e.audioTrack.enabled!==t.audioTrack.enabled))}},{key:"nativeUtils",value:function(){return _o()?"undefined"==typeof DailyNativeUtils?(console.warn("in React Native, DailyNativeUtils is expected to be available"),null):DailyNativeUtils:null}},{key:"updateIsPreparingToJoin",value:function(e){this._updateCallState(this._callState,e)}},{key:"_updateCallState",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:this._isPreparingToJoin;if(e!==this._callState||t!==this._isPreparingToJoin){var n=this._callState,r=this._isPreparingToJoin;this._callState=e,this._isPreparingToJoin=t;var i=this._callState===wr;this.updateShowAndroidOngoingMeetingNotification(i);var o=Ja(n,r),a=Ja(this._callState,this._isPreparingToJoin);o!==a&&(this.updateKeepDeviceAwake(a),this.updateDeviceAudioMode(a),this.updateNoOpRecordingEnsuringBackgroundContinuity(a))}}},{key:"resetMeetingDependentVars",value:function(){this._participants={},this._participantCounts=Oa,this._waitingParticipants={},this._activeSpeaker={},this._activeSpeakerMode=!1,this._didPreAuth=!1,this._accessState={access:Lr},this._finalSummaryOfPrevSession=this._meetingSessionSummary,this._meetingSessionSummary={},this._meetingSessionState=fs(Pa,this._callObjectMode),this._isScreenSharing=!1,this._receiveSettings={},this._inputSettings=void 0,this._sendSettings={},this._localAudioLevel=0,this._isLocalAudioLevelObserverRunning=!1,this._remoteParticipantsAudioLevel={},this._isRemoteParticipantsAudioLevelObserverRunning=!1,this._maxAppMessageSize=oo,this._callMachineInitialized=!1,this._bundleLoadTime=void 0,this._preloadCache}},{key:"updateKeepDeviceAwake",value:function(e){_o()&&this.nativeUtils().setKeepDeviceAwake(e,this.callClientId)}},{key:"updateDeviceAudioMode",value:function(e){if(_o()&&!this.disableReactNativeAutoDeviceManagement("audio")){var t=e?this._nativeInCallAudioMode:"idle";this.nativeUtils().setAudioMode(t)}}},{key:"updateShowAndroidOngoingMeetingNotification",value:function(e){if(_o()&&this.nativeUtils().setShowOngoingMeetingNotification){var t,n,r,i;if(this.properties.reactNativeConfig&&this.properties.reactNativeConfig.androidInCallNotification){var o=this.properties.reactNativeConfig.androidInCallNotification;t=o.title,n=o.subtitle,r=o.iconName,i=o.disableForCustomOverride}i&&(e=!1),this.nativeUtils().setShowOngoingMeetingNotification(e,t,n,r,this.callClientId)}}},{key:"updateNoOpRecordingEnsuringBackgroundContinuity",value:function(e){_o()&&this.nativeUtils().enableNoOpRecordingEnsuringBackgroundContinuity&&this.nativeUtils().enableNoOpRecordingEnsuringBackgroundContinuity(e)}},{key:"toggleParticipantAudioBasedOnNativeAudioFocus",value:function(){var e,t;if(_o()){var n=null===(e=this._callMachine())||void 0===e||null===(t=e.store)||void 0===t?void 0:t.getState();for(var r in null==n?void 0:n.streams){var i=n.streams[r];i&&i.pendingTrack&&"audio"===i.pendingTrack.kind&&(i.pendingTrack.enabled=this._hasNativeAudioFocus)}}}},{key:"disableReactNativeAutoDeviceManagement",value:function(e){return this.properties.reactNativeConfig&&this.properties.reactNativeConfig.disableAutoDeviceManagement&&this.properties.reactNativeConfig.disableAutoDeviceManagement[e]}},{key:"absoluteUrl",value:function(e){if(void 0!==e){var t=document.createElement("a");return t.href=e,t.href}}},{key:"sayHello",value:function(){var e="hello, world.";return console.log(e),e}},{key:"_logUseAfterDestroy",value:function(){var e=Object.values(Ma)[0];if(this.needsLoad())if(e&&!e.needsLoad()){var t={action:lo,level:"error",code:this.strictMode?9995:9997};e.sendMessageToCallMachine(t)}else this.strictMode||console.error("You are are attempting to use a call instance that was previously destroyed, which is unsupported. Please remove `strictMode: false` from your constructor properties to enable strict mode to track down and fix this unsupported usage.");else{var n={action:lo,level:"error",code:this.strictMode?9995:9997};this._messageChannel.sendMessageToCallMachine(n,null,this.callClientId,this._iframe)}}},{key:"_logDuplicateInstanceAttempt",value:function(){for(var e=0,t=Object.values(Ma);e<t.length;e++){var n=t[e];n._callMachineInitialized?(n.sendMessageToCallMachine({action:lo,level:"warn",code:this.allowMultipleCallInstances?9993:9992}),n._delayDuplicateInstanceLog=!1):n._delayDuplicateInstanceLog=!0}}},{key:"_maybeSendToSentry",value:function(e){var t,n,r,i,o,a;if(null!==(t=e.error)&&void 0!==t&&t.type){if(![Gr,$r,Jr].includes(e.error.type))return;if(e.error.type===Jr&&e.error.msg.includes("deleted"))return}var s=null!==(n=this.properties)&&void 0!==n&&n.url?new URL(this.properties.url):void 0,c="production";s&&s.host.includes(".staging.daily")&&(c="staging");var u,l,d,f,p,h=[Ee(),He(),hn(),fn(),Ln(),Fn(),rt(),{name:"HttpContext",preprocessEvent(e){if(!cn.navigator&&!cn.location&&!cn.document)return;const t=e.request&&e.request.url||cn.location&&cn.location.href,{referrer:n}=cn.document||{},{userAgent:r}=cn.navigator||{},i={...e.request&&e.request.headers,...n&&{Referer:n},...r&&{"User-Agent":r}},o={...e.request,...t&&{url:t},headers:i};e.request=o}}].filter((function(e){return!["BrowserApiErrors","Breadcrumbs","GlobalHandlers"].includes(e.name)})),v=new rr({dsn:"https://f10f1c81e5d44a4098416c0867a8b740@o77906.ingest.sentry.io/168844",transport:ur,stackParser:gr,integrations:h,environment:c}),g=new xe;if(g.setClient(v),v.init(),this.session_id&&g.setExtra("sessionId",this.session_id),this.properties){var m=ka({},this.properties);m.userName=m.userName?"[Filtered]":void 0,m.userData=m.userData?"[Filtered]":void 0,m.token=m.token?"[Filtered]":void 0,g.setExtra("properties",m)}if(s){var y=s.searchParams.get("domain");if(!y){var _=s.host.match(/(.*?)\./);y=_&&_[1]||""}y&&g.setTag("domain",y)}e.error&&(g.setTag("fatalErrorType",e.error.type),g.setExtra("errorDetails",e.error.details),(null===(u=e.error.details)||void 0===u?void 0:u.uri)&&g.setTag("serverAddress",e.error.details.uri),(null===(l=e.error.details)||void 0===l?void 0:l.workerGroup)&&g.setTag("workerGroup",e.error.details.workerGroup),(null===(d=e.error.details)||void 0===d?void 0:d.geoGroup)&&g.setTag("geoGroup",e.error.details.geoGroup),(null===(f=e.error.details)||void 0===f?void 0:f.on)&&g.setTag("connectionAttempt",e.error.details.on),null!==(p=e.error.details)&&void 0!==p&&p.bundleUrl&&(g.setTag("bundleUrl",e.error.details.bundleUrl),g.setTag("bundleError",e.error.details.sourceError.type))),g.setTags({callMode:this._callObjectMode?_o()?"reactNative":null!==(r=this.properties)&&void 0!==r&&null!==(i=r.dailyConfig)&&void 0!==i&&null!==(o=i.callMode)&&void 0!==o&&o.includes("prebuilt")?this.properties.dailyConfig.callMode:"custom":"prebuilt-frame",version:oe.version()});var b=(null===(a=e.error)||void 0===a?void 0:a.msg)||e.errorMsg;g.captureException(new Error(b))}},{key:"_callMachine",value:function(){var e,t,n;return null===(e=window._daily)||void 0===e||null===(t=e.instances)||void 0===t||null===(n=t[this.callClientId])||void 0===n?void 0:n.callMachine}},{key:"_maybeUpdateInputSettings",value:function(e){if(!k(this._inputSettings,e)){var t=this._getInputSettings();this._inputSettings=e;var n=this._getInputSettings();k(t,n)||this.emitDailyJSEvent({action:no,inputSettings:n})}}}],[{key:"supportedBrowser",value:function(){if(_o())return{supported:!0,mobile:!0,name:"React Native",version:null,supportsScreenShare:!0,supportsSfu:!0,supportsVideoProcessing:!1,supportsAudioProcessing:!1};var e=T().getParser(yo());return{supported:!!To(),mobile:"mobile"===e.getPlatformType(),name:e.getBrowserName(),version:e.getBrowserVersion(),supportsFullscreen:!!So(),supportsScreenShare:!!(navigator&&navigator.mediaDevices&&navigator.mediaDevices.getDisplayMedia&&(function(e,t){if(!e||!t)return!0;switch(e){case"Chrome":return t.major>=75;case"Safari":return RTCRtpTransceiver.prototype.hasOwnProperty("currentDirection")&&!(13===t.major&&0===t.minor&&0===t.point);case"Firefox":return t.major>=67}return!0}(Co(),Po())||_o())),supportsSfu:!!To(),supportsVideoProcessing:ko(),supportsAudioProcessing:Eo()}}},{key:"version",value:function(){return"0.75.2"}},{key:"createCallObject",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};return e.layout="none",new oe(null,e)}},{key:"wrap",value:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};if(za(),!e||!e.contentWindow||"string"!=typeof e.src)throw new Error("DailyIframe::Wrap needs an iframe-like first argument");return t.layout||(t.customLayout?t.layout="custom-v1":t.layout="browser"),new oe(e,t)}},{key:"createFrame",value:function(e,t){var n,r;za(),e&&t?(n=e,r=t):e&&e.append?(n=e,r={}):(n=document.body,r=e||{});var i=r.iframeStyle;i||(i=n===document.body?{position:"fixed",border:"1px solid black",backgroundColor:"white",width:"375px",height:"450px",right:"1em",bottom:"1em"}:{border:0,width:"100%",height:"100%"});var o=document.createElement("iframe");window.navigator&&window.navigator.userAgent.match(/Chrome\/61\./)?o.allow="microphone, camera":o.allow="microphone; camera; autoplay; display-capture; screen-wake-lock",o.style.visibility="hidden",n.appendChild(o),o.style.visibility=null,Object.keys(i).forEach((function(e){return o.style[e]=i[e]})),r.layout||(r.customLayout?r.layout="custom-v1":r.layout="browser");try{return new oe(o,r)}catch(e){throw n.removeChild(o),e}}},{key:"createTransparentFrame",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};za();var t=document.createElement("iframe");return t.allow="microphone; camera; autoplay",t.style.cssText="\n      position: fixed;\n      top: 0;\n      left: 0;\n      width: 100%;\n      height: 100%;\n      border: 0;\n      pointer-events: none;\n    ",document.body.appendChild(t),e.layout||(e.layout="custom-v1"),oe.wrap(t,e)}},{key:"getCallInstance",value:function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:void 0;return e?Ma[e]:Object.values(Ma)[0]}}]),oe}(b());function Ba(e,t){var n={};for(var r in e)if(e[r]instanceof MediaStreamTrack)console.warn("MediaStreamTrack found in props or cache.",r),n[r]=fo;else if("dailyConfig"===r){if(e[r].modifyLocalSdpHook){var i=window._daily.instances[t].customCallbacks||{};i.modifyLocalSdpHook=e[r].modifyLocalSdpHook,window._daily.instances[t].customCallbacks=i,delete e[r].modifyLocalSdpHook}if(e[r].modifyRemoteSdpHook){var o=window._daily.instances[t].customCallbacks||{};o.modifyRemoteSdpHook=e[r].modifyRemoteSdpHook,window._daily.instances[t].customCallbacks=o,delete e[r].modifyRemoteSdpHook}n[r]=e[r]}else n[r]=e[r];return n}function Ua(e){var t=arguments.length>2?arguments[2]:void 0;if(e!==wr){var n="".concat(arguments.length>1&&void 0!==arguments[1]?arguments[1]:"This daily-js method"," only supported after join.");throw t&&(n+=" ".concat(t)),console.error(n),new Error(n)}}function Ja(e,t){return[Sr,wr].includes(e)||t}function Ya(e,t){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"This daily-js method",r=arguments.length>3?arguments[3]:void 0;if(Ja(e,t)){var i="".concat(n," not supported after joining a meeting.");throw r&&(i+=" ".concat(r)),console.error(i),new Error(i)}}function $a(e){var t=arguments.length>2?arguments[2]:void 0;if(!e){var n="".concat(arguments.length>1&&void 0!==arguments[1]?arguments[1]:"This daily-js method",arguments.length>3&&void 0!==arguments[3]&&arguments[3]?" requires preAuth() or startCamera() to initialize call state.":" requires preAuth(), startCamera(), or join() to initialize call state.");throw t&&(n+=" ".concat(t)),console.error(n),new Error(n)}}function qa(e){if(e){var t="A pre-call quality test is in progress. Please try ".concat(arguments.length>1&&void 0!==arguments[1]?arguments[1]:"This daily-js method"," again once testing has completed. Use stopTestCallQuality() to end it early.");throw console.error(t),new Error(t)}}function Ga(e){if(!e){var t="".concat(arguments.length>1&&void 0!==arguments[1]?arguments[1]:"This daily-js method"," is only supported on custom callObject instances");throw console.error(t),new Error(t)}}function Wa(e){if(e){var t="".concat(arguments.length>1&&void 0!==arguments[1]?arguments[1]:"This daily-js method"," is only supported as part of Daily's Prebuilt");throw console.error(t),new Error(t)}}function za(){if(_o())throw new Error("This daily-js method is not currently supported in React Native")}function Ha(){if(!_o())throw new Error("This daily-js method is only supported in React Native")}function Qa(e){if(void 0===e)return!0;var t;if("string"==typeof e)t=e;else try{t=JSON.stringify(e),k(JSON.parse(t),e)||console.warn("The userData provided will be modified when serialized.")}catch(e){throw Error("userData must be serializable to JSON: ".concat(e))}if(t.length>4096)throw Error("userData is too large (".concat(t.length," characters). Maximum size suppported is ").concat(4096,"."));return!0}function Ka(e,t){for(var n=t.allowAllParticipantsKey,r=function(e){var t=["local"];return n||t.push("*"),e&&!t.includes(e)},i=function(e){return!!(void 0===e.layer||Number.isInteger(e.layer)&&e.layer>=0||"inherit"===e.layer)},o=function(e){return!(!e||e.video&&!i(e.video)||e.screenVideo&&!i(e.screenVideo))},a=0,s=Object.entries(e);a<s.length;a++){var c=y(s[a],2),u=c[0],l=c[1];if(!r(u)||!o(l))return!1}return!0}function Xa(e){if("object"!==o(e))return!1;for(var t=0,n=Object.entries(e);t<n.length;t++){var r=y(n[t],2),i=r[0],a=r[1];switch(i){case"video":if("object"!==o(a))return!1;for(var s=0,c=Object.entries(a);s<c.length;s++){var u=y(c[s],2),l=u[0],d=u[1];switch(l){case"processor":if(!ts(d))return!1;break;case"settings":if(!ns(d))return!1;break;default:return!1}}break;case"audio":if("object"!==o(a))return!1;for(var f=0,p=Object.entries(a);f<p.length;f++){var h=y(p[f],2),v=h[0],g=h[1];switch(v){case"processor":if(!es(g))return!1;break;case"settings":if(!ns(g))return!1;break;default:return!1}}break;default:return!1}}return!0}function Za(e,t,n){var r,i=[];e.video&&e.video.processor&&(ko(null!==(r=null==t?void 0:t.useLegacyVideoProcessor)&&void 0!==r&&r)||(e.video.settings?delete e.video.processor:delete e.video,i.push("video"))),e.audio&&e.audio.processor&&(Eo()||(e.audio.settings?delete e.audio.processor:delete e.audio,i.push("audio"))),i.length>0&&console.error("Ignoring settings for browser- or platform-unsupported input processor(s): ".concat(i.join(", "))),e.audio&&e.audio.settings&&(e.audio.settings.customTrack?(n.audioTrack=e.audio.settings.customTrack,e.audio.settings={customTrack:fo}):delete n.audioTrack),e.video&&e.video.settings&&(e.video.settings.customTrack?(n.videoTrack=e.video.settings.customTrack,e.video.settings={customTrack:fo}):delete n.videoTrack)}function es(e){if(_o())return console.warn("Video processing is not yet supported in React Native"),!1;var t,n=["type"];return!(!e||"object"!==o(e)||(Object.keys(e).filter((function(e){return!n.includes(e)})).forEach((function(t){console.warn("invalid key inputSettings -> audio -> processor : ".concat(t)),delete e[t]})),t=e.type,"string"!=typeof t||!Object.values(ho).includes(t)&&(console.error("inputSettings audio processor type invalid"),1)))}function ts(e){if(_o())return console.warn("Video processing is not yet supported in React Native"),!1;var t,n=["type","config"];if(!e)return!1;if("object"!==o(e))return!1;if("string"!=typeof(t=e.type)||!Object.values(po).includes(t)&&(console.error("inputSettings video processor type invalid"),1))return!1;if(e.config){if("object"!==o(e.config))return!1;if(!function(e,t){var n=Object.keys(t);if(0===n.length)return!0;var r="invalid object in inputSettings -> video -> processor -> config";switch(e){case po.BGBLUR:return n.length>1||"strength"!==n[0]?(console.error(r),!1):!("number"!=typeof t.strength||t.strength<=0||t.strength>1||isNaN(t.strength))||(console.error("".concat(r,"; expected: {0 < strength <= 1}, got: ").concat(t.strength)),!1);case po.BGIMAGE:return!(void 0!==t.source&&!function(e){return"default"===e.source?(e.type="default",!0):e.source instanceof ArrayBuffer||(O(e.source)?(e.type="url",!!function(e){var t=new URL(e),n=t.pathname;if("data:"===t.protocol)try{var r=n.substring(n.indexOf(":")+1,n.indexOf(";")).split("/")[1];return go.includes(r)}catch(e){return console.error("failed to deduce blob content type",e),!1}var i=n.split(".").at(-1).toLowerCase().trim();return go.includes(i)}(e.source)||(console.error("invalid image type; supported types: [".concat(go.join(", "),"]")),!1)):(t=e.source,n=Number(t),isNaN(n)||!Number.isInteger(n)||n<=0||n>10?(console.error("invalid image selection; must be an int, > 0, <= ".concat(10)),!1):(e.type="daily-preselect",!0)));var t,n}(t));default:return!0}}(e.type,e.config))return!1}return Object.keys(e).filter((function(e){return!n.includes(e)})).forEach((function(t){console.warn("invalid key inputSettings -> video -> processor : ".concat(t)),delete e[t]})),!0}function ns(e){return"object"===o(e)&&(!e.customTrack||e.customTrack instanceof MediaStreamTrack)}function rs(){var e=Object.values(po).join(" | "),t=Object.values(ho).join(" | ");return"inputSettings must be of the form: { video?: { processor?: { type: [ ".concat(e," ], config?: {} } }, audio?: { processor: {type: [ ").concat(t," ] } } }")}function is(e){var t=e.allowAllParticipantsKey;return"receiveSettings must be of the form { [<remote participant id> | ".concat(Rr).concat(t?' | "'.concat(jr,'"'):"","]: ")+'{ [video: [{ layer: [<non-negative integer> | "inherit"] } | "inherit"]], [screenVideo: [{ layer: [<non-negative integer> | "inherit"] } | "inherit"]] }}}'}function os(){return"customIntegrations should be an object of type ".concat(JSON.stringify(ja),".")}function as(e){if(e&&"object"!==o(e)||Array.isArray(e))return console.error("customTrayButtons should be an Object of the type ".concat(JSON.stringify(Ra),".")),!1;if(e)for(var t=0,n=Object.entries(e);t<n.length;t++)for(var r=y(n[t],1)[0],i=0,a=Object.entries(e[r]);i<a.length;i++){var s=y(a[i],2),c=s[0],u=s[1],l=Ra.id[c];if(!l)return console.error("customTrayButton does not support key ".concat(c)),!1;switch(c){case"iconPath":case"iconPathDarkMode":if(!O(u))return console.error("customTrayButton ".concat(c," should be a url.")),!1;break;case"visualState":if(!["default","sidebar-open","active"].includes(u))return console.error("customTrayButton ".concat(c," should be ").concat(l,". Got: ").concat(u)),!1;break;default:if(o(u)!==l)return console.error("customTrayButton ".concat(c," should be a ").concat(l,".")),!1}}return!0}function ss(e){if(!e||e&&"object"!==o(e)||Array.isArray(e))return console.error(os()),!1;for(var t=function(e){return"".concat(e," should be ").concat(ja.id[e])},n=function(e,t){return console.error("customIntegration ".concat(e,": ").concat(t))},r=0,i=Object.entries(e);r<i.length;r++){var a=y(i[r],1)[0];if(!("label"in e[a]))return n(a,"label is required"),!1;if(!("location"in e[a]))return n(a,"location is required"),!1;if(!("src"in e[a])&&!("srcdoc"in e[a]))return n(a,"src or srcdoc is required"),!1;for(var s=0,c=Object.entries(e[a]);s<c.length;s++){var u=y(c[s],2),l=u[0],d=u[1];switch(l){case"allow":case"csp":case"name":case"referrerPolicy":case"sandbox":if("string"!=typeof d)return n(a,t(l)),!1;break;case"iconURL":if(!O(d))return n(a,"".concat(l," should be a url")),!1;break;case"src":if("srcdoc"in e[a])return n(a,"cannot have both src and srcdoc"),!1;if(!O(d))return n(a,'src "'.concat(d,'" is not a valid URL')),!1;break;case"srcdoc":if("src"in e[a])return n(a,"cannot have both src and srcdoc"),!1;if("string"!=typeof d)return n(a,t(l)),!1;break;case"location":if(!["main","sidebar"].includes(d))return n(a,t(l)),!1;break;case"controlledBy":if("*"!==d&&"owners"!==d&&(!Array.isArray(d)||d.some((function(e){return"string"!=typeof e}))))return n(a,t(l)),!1;break;case"shared":if((!Array.isArray(d)||d.some((function(e){return"string"!=typeof e})))&&"owners"!==d&&"boolean"!=typeof d)return n(a,t(l)),!1;break;default:if(!ja.id[l])return console.error("customIntegration does not support key ".concat(l)),!1}}}return!0}function cs(e,t){if(void 0===t)return!1;switch(o(t)){case"string":return o(e)===t;case"object":if("object"!==o(e))return!1;for(var n in e)if(!cs(e[n],t[n]))return!1;return!0;default:return!1}}function us(e,t){var n=e.sessionId,r=e.toEndPoint,i=e.useSipRefer;if(!n||!r)throw new Error("".concat(t,"() requires a sessionId and toEndPoint"));if("string"!=typeof n||"string"!=typeof r)throw new Error("Invalid paramater: sessionId and toEndPoint must be of type string");if(i&&!r.startsWith("sip:"))throw new Error('"toEndPoint" must be a "sip" address');if(!r.startsWith("sip:")&&!r.startsWith("+"))throw new Error("toEndPoint: ".concat(r,' must starts with either "sip:" or "+"'))}function ls(e){if("object"!==o(e))throw new Error('RemoteMediaPlayerSettings: must be "object" type');if(e.state&&!Object.values(vo).includes(e.state))throw new Error("Invalid value for RemoteMediaPlayerSettings.state, valid values are: "+JSON.stringify(vo));if(e.volume){if("number"!=typeof e.volume)throw new Error('RemoteMediaPlayerSettings.volume: must be "number" type');if(e.volume<0||e.volume>2)throw new Error("RemoteMediaPlayerSettings.volume: must be between 0.0 - 2.0")}}function ds(e,t,n){return!("number"!=typeof e||e<t||e>n)}function fs(e,t){return e&&!t&&delete e.data,e}},880:function(e){e.exports=function(e){var t={};function n(r){if(t[r])return t[r].exports;var i=t[r]={i:r,l:!1,exports:{}};return e[r].call(i.exports,i,i.exports,n),i.l=!0,i.exports}return n.m=e,n.c=t,n.d=function(e,t,r){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:r})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var i in e)n.d(r,i,function(t){return e[t]}.bind(null,i));return r},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=90)}({17:function(e,t,n){"use strict";t.__esModule=!0,t.default=void 0;var r=n(18),i=function(){function e(){}return e.getFirstMatch=function(e,t){var n=t.match(e);return n&&n.length>0&&n[1]||""},e.getSecondMatch=function(e,t){var n=t.match(e);return n&&n.length>1&&n[2]||""},e.matchAndReturnConst=function(e,t,n){if(e.test(t))return n},e.getWindowsVersionName=function(e){switch(e){case"NT":return"NT";case"XP":case"NT 5.1":return"XP";case"NT 5.0":return"2000";case"NT 5.2":return"2003";case"NT 6.0":return"Vista";case"NT 6.1":return"7";case"NT 6.2":return"8";case"NT 6.3":return"8.1";case"NT 10.0":return"10";default:return}},e.getMacOSVersionName=function(e){var t=e.split(".").splice(0,2).map((function(e){return parseInt(e,10)||0}));if(t.push(0),10===t[0])switch(t[1]){case 5:return"Leopard";case 6:return"Snow Leopard";case 7:return"Lion";case 8:return"Mountain Lion";case 9:return"Mavericks";case 10:return"Yosemite";case 11:return"El Capitan";case 12:return"Sierra";case 13:return"High Sierra";case 14:return"Mojave";case 15:return"Catalina";default:return}},e.getAndroidVersionName=function(e){var t=e.split(".").splice(0,2).map((function(e){return parseInt(e,10)||0}));if(t.push(0),!(1===t[0]&&t[1]<5))return 1===t[0]&&t[1]<6?"Cupcake":1===t[0]&&t[1]>=6?"Donut":2===t[0]&&t[1]<2?"Eclair":2===t[0]&&2===t[1]?"Froyo":2===t[0]&&t[1]>2?"Gingerbread":3===t[0]?"Honeycomb":4===t[0]&&t[1]<1?"Ice Cream Sandwich":4===t[0]&&t[1]<4?"Jelly Bean":4===t[0]&&t[1]>=4?"KitKat":5===t[0]?"Lollipop":6===t[0]?"Marshmallow":7===t[0]?"Nougat":8===t[0]?"Oreo":9===t[0]?"Pie":void 0},e.getVersionPrecision=function(e){return e.split(".").length},e.compareVersions=function(t,n,r){void 0===r&&(r=!1);var i=e.getVersionPrecision(t),o=e.getVersionPrecision(n),a=Math.max(i,o),s=0,c=e.map([t,n],(function(t){var n=a-e.getVersionPrecision(t),r=t+new Array(n+1).join(".0");return e.map(r.split("."),(function(e){return new Array(20-e.length).join("0")+e})).reverse()}));for(r&&(s=a-Math.min(i,o)),a-=1;a>=s;){if(c[0][a]>c[1][a])return 1;if(c[0][a]===c[1][a]){if(a===s)return 0;a-=1}else if(c[0][a]<c[1][a])return-1}},e.map=function(e,t){var n,r=[];if(Array.prototype.map)return Array.prototype.map.call(e,t);for(n=0;n<e.length;n+=1)r.push(t(e[n]));return r},e.find=function(e,t){var n,r;if(Array.prototype.find)return Array.prototype.find.call(e,t);for(n=0,r=e.length;n<r;n+=1){var i=e[n];if(t(i,n))return i}},e.assign=function(e){for(var t,n,r=e,i=arguments.length,o=new Array(i>1?i-1:0),a=1;a<i;a++)o[a-1]=arguments[a];if(Object.assign)return Object.assign.apply(Object,[e].concat(o));var s=function(){var e=o[t];"object"==typeof e&&null!==e&&Object.keys(e).forEach((function(t){r[t]=e[t]}))};for(t=0,n=o.length;t<n;t+=1)s();return e},e.getBrowserAlias=function(e){return r.BROWSER_ALIASES_MAP[e]},e.getBrowserTypeByAlias=function(e){return r.BROWSER_MAP[e]||""},e}();t.default=i,e.exports=t.default},18:function(e,t,n){"use strict";t.__esModule=!0,t.ENGINE_MAP=t.OS_MAP=t.PLATFORMS_MAP=t.BROWSER_MAP=t.BROWSER_ALIASES_MAP=void 0,t.BROWSER_ALIASES_MAP={"Amazon Silk":"amazon_silk","Android Browser":"android",Bada:"bada",BlackBerry:"blackberry",Chrome:"chrome",Chromium:"chromium",Electron:"electron",Epiphany:"epiphany",Firefox:"firefox",Focus:"focus",Generic:"generic","Google Search":"google_search",Googlebot:"googlebot","Internet Explorer":"ie","K-Meleon":"k_meleon",Maxthon:"maxthon","Microsoft Edge":"edge","MZ Browser":"mz","NAVER Whale Browser":"naver",Opera:"opera","Opera Coast":"opera_coast",PhantomJS:"phantomjs",Puffin:"puffin",QupZilla:"qupzilla",QQ:"qq",QQLite:"qqlite",Safari:"safari",Sailfish:"sailfish","Samsung Internet for Android":"samsung_internet",SeaMonkey:"seamonkey",Sleipnir:"sleipnir",Swing:"swing",Tizen:"tizen","UC Browser":"uc",Vivaldi:"vivaldi","WebOS Browser":"webos",WeChat:"wechat","Yandex Browser":"yandex",Roku:"roku"},t.BROWSER_MAP={amazon_silk:"Amazon Silk",android:"Android Browser",bada:"Bada",blackberry:"BlackBerry",chrome:"Chrome",chromium:"Chromium",electron:"Electron",epiphany:"Epiphany",firefox:"Firefox",focus:"Focus",generic:"Generic",googlebot:"Googlebot",google_search:"Google Search",ie:"Internet Explorer",k_meleon:"K-Meleon",maxthon:"Maxthon",edge:"Microsoft Edge",mz:"MZ Browser",naver:"NAVER Whale Browser",opera:"Opera",opera_coast:"Opera Coast",phantomjs:"PhantomJS",puffin:"Puffin",qupzilla:"QupZilla",qq:"QQ Browser",qqlite:"QQ Browser Lite",safari:"Safari",sailfish:"Sailfish",samsung_internet:"Samsung Internet for Android",seamonkey:"SeaMonkey",sleipnir:"Sleipnir",swing:"Swing",tizen:"Tizen",uc:"UC Browser",vivaldi:"Vivaldi",webos:"WebOS Browser",wechat:"WeChat",yandex:"Yandex Browser"},t.PLATFORMS_MAP={tablet:"tablet",mobile:"mobile",desktop:"desktop",tv:"tv"},t.OS_MAP={WindowsPhone:"Windows Phone",Windows:"Windows",MacOS:"macOS",iOS:"iOS",Android:"Android",WebOS:"WebOS",BlackBerry:"BlackBerry",Bada:"Bada",Tizen:"Tizen",Linux:"Linux",ChromeOS:"Chrome OS",PlayStation4:"PlayStation 4",Roku:"Roku"},t.ENGINE_MAP={EdgeHTML:"EdgeHTML",Blink:"Blink",Trident:"Trident",Presto:"Presto",Gecko:"Gecko",WebKit:"WebKit"}},90:function(e,t,n){"use strict";t.__esModule=!0,t.default=void 0;var r,i=(r=n(91))&&r.__esModule?r:{default:r},o=n(18);function a(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}var s=function(){function e(){}var t,n;return e.getParser=function(e,t){if(void 0===t&&(t=!1),"string"!=typeof e)throw new Error("UserAgent should be a string");return new i.default(e,t)},e.parse=function(e){return new i.default(e).getResult()},t=e,n=[{key:"BROWSER_MAP",get:function(){return o.BROWSER_MAP}},{key:"ENGINE_MAP",get:function(){return o.ENGINE_MAP}},{key:"OS_MAP",get:function(){return o.OS_MAP}},{key:"PLATFORMS_MAP",get:function(){return o.PLATFORMS_MAP}}],null&&a(t.prototype,null),n&&a(t,n),e}();t.default=s,e.exports=t.default},91:function(e,t,n){"use strict";t.__esModule=!0,t.default=void 0;var r=c(n(92)),i=c(n(93)),o=c(n(94)),a=c(n(95)),s=c(n(17));function c(e){return e&&e.__esModule?e:{default:e}}var u=function(){function e(e,t){if(void 0===t&&(t=!1),null==e||""===e)throw new Error("UserAgent parameter can't be empty");this._ua=e,this.parsedResult={},!0!==t&&this.parse()}var t=e.prototype;return t.getUA=function(){return this._ua},t.test=function(e){return e.test(this._ua)},t.parseBrowser=function(){var e=this;this.parsedResult.browser={};var t=s.default.find(r.default,(function(t){if("function"==typeof t.test)return t.test(e);if(t.test instanceof Array)return t.test.some((function(t){return e.test(t)}));throw new Error("Browser's test function is not valid")}));return t&&(this.parsedResult.browser=t.describe(this.getUA())),this.parsedResult.browser},t.getBrowser=function(){return this.parsedResult.browser?this.parsedResult.browser:this.parseBrowser()},t.getBrowserName=function(e){return e?String(this.getBrowser().name).toLowerCase()||"":this.getBrowser().name||""},t.getBrowserVersion=function(){return this.getBrowser().version},t.getOS=function(){return this.parsedResult.os?this.parsedResult.os:this.parseOS()},t.parseOS=function(){var e=this;this.parsedResult.os={};var t=s.default.find(i.default,(function(t){if("function"==typeof t.test)return t.test(e);if(t.test instanceof Array)return t.test.some((function(t){return e.test(t)}));throw new Error("Browser's test function is not valid")}));return t&&(this.parsedResult.os=t.describe(this.getUA())),this.parsedResult.os},t.getOSName=function(e){var t=this.getOS().name;return e?String(t).toLowerCase()||"":t||""},t.getOSVersion=function(){return this.getOS().version},t.getPlatform=function(){return this.parsedResult.platform?this.parsedResult.platform:this.parsePlatform()},t.getPlatformType=function(e){void 0===e&&(e=!1);var t=this.getPlatform().type;return e?String(t).toLowerCase()||"":t||""},t.parsePlatform=function(){var e=this;this.parsedResult.platform={};var t=s.default.find(o.default,(function(t){if("function"==typeof t.test)return t.test(e);if(t.test instanceof Array)return t.test.some((function(t){return e.test(t)}));throw new Error("Browser's test function is not valid")}));return t&&(this.parsedResult.platform=t.describe(this.getUA())),this.parsedResult.platform},t.getEngine=function(){return this.parsedResult.engine?this.parsedResult.engine:this.parseEngine()},t.getEngineName=function(e){return e?String(this.getEngine().name).toLowerCase()||"":this.getEngine().name||""},t.parseEngine=function(){var e=this;this.parsedResult.engine={};var t=s.default.find(a.default,(function(t){if("function"==typeof t.test)return t.test(e);if(t.test instanceof Array)return t.test.some((function(t){return e.test(t)}));throw new Error("Browser's test function is not valid")}));return t&&(this.parsedResult.engine=t.describe(this.getUA())),this.parsedResult.engine},t.parse=function(){return this.parseBrowser(),this.parseOS(),this.parsePlatform(),this.parseEngine(),this},t.getResult=function(){return s.default.assign({},this.parsedResult)},t.satisfies=function(e){var t=this,n={},r=0,i={},o=0;if(Object.keys(e).forEach((function(t){var a=e[t];"string"==typeof a?(i[t]=a,o+=1):"object"==typeof a&&(n[t]=a,r+=1)})),r>0){var a=Object.keys(n),c=s.default.find(a,(function(e){return t.isOS(e)}));if(c){var u=this.satisfies(n[c]);if(void 0!==u)return u}var l=s.default.find(a,(function(e){return t.isPlatform(e)}));if(l){var d=this.satisfies(n[l]);if(void 0!==d)return d}}if(o>0){var f=Object.keys(i),p=s.default.find(f,(function(e){return t.isBrowser(e,!0)}));if(void 0!==p)return this.compareVersion(i[p])}},t.isBrowser=function(e,t){void 0===t&&(t=!1);var n=this.getBrowserName().toLowerCase(),r=e.toLowerCase(),i=s.default.getBrowserTypeByAlias(r);return t&&i&&(r=i.toLowerCase()),r===n},t.compareVersion=function(e){var t=[0],n=e,r=!1,i=this.getBrowserVersion();if("string"==typeof i)return">"===e[0]||"<"===e[0]?(n=e.substr(1),"="===e[1]?(r=!0,n=e.substr(2)):t=[],">"===e[0]?t.push(1):t.push(-1)):"="===e[0]?n=e.substr(1):"~"===e[0]&&(r=!0,n=e.substr(1)),t.indexOf(s.default.compareVersions(i,n,r))>-1},t.isOS=function(e){return this.getOSName(!0)===String(e).toLowerCase()},t.isPlatform=function(e){return this.getPlatformType(!0)===String(e).toLowerCase()},t.isEngine=function(e){return this.getEngineName(!0)===String(e).toLowerCase()},t.is=function(e,t){return void 0===t&&(t=!1),this.isBrowser(e,t)||this.isOS(e)||this.isPlatform(e)},t.some=function(e){var t=this;return void 0===e&&(e=[]),e.some((function(e){return t.is(e)}))},e}();t.default=u,e.exports=t.default},92:function(e,t,n){"use strict";t.__esModule=!0,t.default=void 0;var r,i=(r=n(17))&&r.__esModule?r:{default:r},o=/version\/(\d+(\.?_?\d+)+)/i,a=[{test:[/googlebot/i],describe:function(e){var t={name:"Googlebot"},n=i.default.getFirstMatch(/googlebot\/(\d+(\.\d+))/i,e)||i.default.getFirstMatch(o,e);return n&&(t.version=n),t}},{test:[/opera/i],describe:function(e){var t={name:"Opera"},n=i.default.getFirstMatch(o,e)||i.default.getFirstMatch(/(?:opera)[\s/](\d+(\.?_?\d+)+)/i,e);return n&&(t.version=n),t}},{test:[/opr\/|opios/i],describe:function(e){var t={name:"Opera"},n=i.default.getFirstMatch(/(?:opr|opios)[\s/](\S+)/i,e)||i.default.getFirstMatch(o,e);return n&&(t.version=n),t}},{test:[/SamsungBrowser/i],describe:function(e){var t={name:"Samsung Internet for Android"},n=i.default.getFirstMatch(o,e)||i.default.getFirstMatch(/(?:SamsungBrowser)[\s/](\d+(\.?_?\d+)+)/i,e);return n&&(t.version=n),t}},{test:[/Whale/i],describe:function(e){var t={name:"NAVER Whale Browser"},n=i.default.getFirstMatch(o,e)||i.default.getFirstMatch(/(?:whale)[\s/](\d+(?:\.\d+)+)/i,e);return n&&(t.version=n),t}},{test:[/MZBrowser/i],describe:function(e){var t={name:"MZ Browser"},n=i.default.getFirstMatch(/(?:MZBrowser)[\s/](\d+(?:\.\d+)+)/i,e)||i.default.getFirstMatch(o,e);return n&&(t.version=n),t}},{test:[/focus/i],describe:function(e){var t={name:"Focus"},n=i.default.getFirstMatch(/(?:focus)[\s/](\d+(?:\.\d+)+)/i,e)||i.default.getFirstMatch(o,e);return n&&(t.version=n),t}},{test:[/swing/i],describe:function(e){var t={name:"Swing"},n=i.default.getFirstMatch(/(?:swing)[\s/](\d+(?:\.\d+)+)/i,e)||i.default.getFirstMatch(o,e);return n&&(t.version=n),t}},{test:[/coast/i],describe:function(e){var t={name:"Opera Coast"},n=i.default.getFirstMatch(o,e)||i.default.getFirstMatch(/(?:coast)[\s/](\d+(\.?_?\d+)+)/i,e);return n&&(t.version=n),t}},{test:[/opt\/\d+(?:.?_?\d+)+/i],describe:function(e){var t={name:"Opera Touch"},n=i.default.getFirstMatch(/(?:opt)[\s/](\d+(\.?_?\d+)+)/i,e)||i.default.getFirstMatch(o,e);return n&&(t.version=n),t}},{test:[/yabrowser/i],describe:function(e){var t={name:"Yandex Browser"},n=i.default.getFirstMatch(/(?:yabrowser)[\s/](\d+(\.?_?\d+)+)/i,e)||i.default.getFirstMatch(o,e);return n&&(t.version=n),t}},{test:[/ucbrowser/i],describe:function(e){var t={name:"UC Browser"},n=i.default.getFirstMatch(o,e)||i.default.getFirstMatch(/(?:ucbrowser)[\s/](\d+(\.?_?\d+)+)/i,e);return n&&(t.version=n),t}},{test:[/Maxthon|mxios/i],describe:function(e){var t={name:"Maxthon"},n=i.default.getFirstMatch(o,e)||i.default.getFirstMatch(/(?:Maxthon|mxios)[\s/](\d+(\.?_?\d+)+)/i,e);return n&&(t.version=n),t}},{test:[/epiphany/i],describe:function(e){var t={name:"Epiphany"},n=i.default.getFirstMatch(o,e)||i.default.getFirstMatch(/(?:epiphany)[\s/](\d+(\.?_?\d+)+)/i,e);return n&&(t.version=n),t}},{test:[/puffin/i],describe:function(e){var t={name:"Puffin"},n=i.default.getFirstMatch(o,e)||i.default.getFirstMatch(/(?:puffin)[\s/](\d+(\.?_?\d+)+)/i,e);return n&&(t.version=n),t}},{test:[/sleipnir/i],describe:function(e){var t={name:"Sleipnir"},n=i.default.getFirstMatch(o,e)||i.default.getFirstMatch(/(?:sleipnir)[\s/](\d+(\.?_?\d+)+)/i,e);return n&&(t.version=n),t}},{test:[/k-meleon/i],describe:function(e){var t={name:"K-Meleon"},n=i.default.getFirstMatch(o,e)||i.default.getFirstMatch(/(?:k-meleon)[\s/](\d+(\.?_?\d+)+)/i,e);return n&&(t.version=n),t}},{test:[/micromessenger/i],describe:function(e){var t={name:"WeChat"},n=i.default.getFirstMatch(/(?:micromessenger)[\s/](\d+(\.?_?\d+)+)/i,e)||i.default.getFirstMatch(o,e);return n&&(t.version=n),t}},{test:[/qqbrowser/i],describe:function(e){var t={name:/qqbrowserlite/i.test(e)?"QQ Browser Lite":"QQ Browser"},n=i.default.getFirstMatch(/(?:qqbrowserlite|qqbrowser)[/](\d+(\.?_?\d+)+)/i,e)||i.default.getFirstMatch(o,e);return n&&(t.version=n),t}},{test:[/msie|trident/i],describe:function(e){var t={name:"Internet Explorer"},n=i.default.getFirstMatch(/(?:msie |rv:)(\d+(\.?_?\d+)+)/i,e);return n&&(t.version=n),t}},{test:[/\sedg\//i],describe:function(e){var t={name:"Microsoft Edge"},n=i.default.getFirstMatch(/\sedg\/(\d+(\.?_?\d+)+)/i,e);return n&&(t.version=n),t}},{test:[/edg([ea]|ios)/i],describe:function(e){var t={name:"Microsoft Edge"},n=i.default.getSecondMatch(/edg([ea]|ios)\/(\d+(\.?_?\d+)+)/i,e);return n&&(t.version=n),t}},{test:[/vivaldi/i],describe:function(e){var t={name:"Vivaldi"},n=i.default.getFirstMatch(/vivaldi\/(\d+(\.?_?\d+)+)/i,e);return n&&(t.version=n),t}},{test:[/seamonkey/i],describe:function(e){var t={name:"SeaMonkey"},n=i.default.getFirstMatch(/seamonkey\/(\d+(\.?_?\d+)+)/i,e);return n&&(t.version=n),t}},{test:[/sailfish/i],describe:function(e){var t={name:"Sailfish"},n=i.default.getFirstMatch(/sailfish\s?browser\/(\d+(\.\d+)?)/i,e);return n&&(t.version=n),t}},{test:[/silk/i],describe:function(e){var t={name:"Amazon Silk"},n=i.default.getFirstMatch(/silk\/(\d+(\.?_?\d+)+)/i,e);return n&&(t.version=n),t}},{test:[/phantom/i],describe:function(e){var t={name:"PhantomJS"},n=i.default.getFirstMatch(/phantomjs\/(\d+(\.?_?\d+)+)/i,e);return n&&(t.version=n),t}},{test:[/slimerjs/i],describe:function(e){var t={name:"SlimerJS"},n=i.default.getFirstMatch(/slimerjs\/(\d+(\.?_?\d+)+)/i,e);return n&&(t.version=n),t}},{test:[/blackberry|\bbb\d+/i,/rim\stablet/i],describe:function(e){var t={name:"BlackBerry"},n=i.default.getFirstMatch(o,e)||i.default.getFirstMatch(/blackberry[\d]+\/(\d+(\.?_?\d+)+)/i,e);return n&&(t.version=n),t}},{test:[/(web|hpw)[o0]s/i],describe:function(e){var t={name:"WebOS Browser"},n=i.default.getFirstMatch(o,e)||i.default.getFirstMatch(/w(?:eb)?[o0]sbrowser\/(\d+(\.?_?\d+)+)/i,e);return n&&(t.version=n),t}},{test:[/bada/i],describe:function(e){var t={name:"Bada"},n=i.default.getFirstMatch(/dolfin\/(\d+(\.?_?\d+)+)/i,e);return n&&(t.version=n),t}},{test:[/tizen/i],describe:function(e){var t={name:"Tizen"},n=i.default.getFirstMatch(/(?:tizen\s?)?browser\/(\d+(\.?_?\d+)+)/i,e)||i.default.getFirstMatch(o,e);return n&&(t.version=n),t}},{test:[/qupzilla/i],describe:function(e){var t={name:"QupZilla"},n=i.default.getFirstMatch(/(?:qupzilla)[\s/](\d+(\.?_?\d+)+)/i,e)||i.default.getFirstMatch(o,e);return n&&(t.version=n),t}},{test:[/firefox|iceweasel|fxios/i],describe:function(e){var t={name:"Firefox"},n=i.default.getFirstMatch(/(?:firefox|iceweasel|fxios)[\s/](\d+(\.?_?\d+)+)/i,e);return n&&(t.version=n),t}},{test:[/electron/i],describe:function(e){var t={name:"Electron"},n=i.default.getFirstMatch(/(?:electron)\/(\d+(\.?_?\d+)+)/i,e);return n&&(t.version=n),t}},{test:[/MiuiBrowser/i],describe:function(e){var t={name:"Miui"},n=i.default.getFirstMatch(/(?:MiuiBrowser)[\s/](\d+(\.?_?\d+)+)/i,e);return n&&(t.version=n),t}},{test:[/chromium/i],describe:function(e){var t={name:"Chromium"},n=i.default.getFirstMatch(/(?:chromium)[\s/](\d+(\.?_?\d+)+)/i,e)||i.default.getFirstMatch(o,e);return n&&(t.version=n),t}},{test:[/chrome|crios|crmo/i],describe:function(e){var t={name:"Chrome"},n=i.default.getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.?_?\d+)+)/i,e);return n&&(t.version=n),t}},{test:[/GSA/i],describe:function(e){var t={name:"Google Search"},n=i.default.getFirstMatch(/(?:GSA)\/(\d+(\.?_?\d+)+)/i,e);return n&&(t.version=n),t}},{test:function(e){var t=!e.test(/like android/i),n=e.test(/android/i);return t&&n},describe:function(e){var t={name:"Android Browser"},n=i.default.getFirstMatch(o,e);return n&&(t.version=n),t}},{test:[/playstation 4/i],describe:function(e){var t={name:"PlayStation 4"},n=i.default.getFirstMatch(o,e);return n&&(t.version=n),t}},{test:[/safari|applewebkit/i],describe:function(e){var t={name:"Safari"},n=i.default.getFirstMatch(o,e);return n&&(t.version=n),t}},{test:[/.*/i],describe:function(e){var t=-1!==e.search("\\(")?/^(.*)\/(.*)[ \t]\((.*)/:/^(.*)\/(.*) /;return{name:i.default.getFirstMatch(t,e),version:i.default.getSecondMatch(t,e)}}}];t.default=a,e.exports=t.default},93:function(e,t,n){"use strict";t.__esModule=!0,t.default=void 0;var r,i=(r=n(17))&&r.__esModule?r:{default:r},o=n(18),a=[{test:[/Roku\/DVP/],describe:function(e){var t=i.default.getFirstMatch(/Roku\/DVP-(\d+\.\d+)/i,e);return{name:o.OS_MAP.Roku,version:t}}},{test:[/windows phone/i],describe:function(e){var t=i.default.getFirstMatch(/windows phone (?:os)?\s?(\d+(\.\d+)*)/i,e);return{name:o.OS_MAP.WindowsPhone,version:t}}},{test:[/windows /i],describe:function(e){var t=i.default.getFirstMatch(/Windows ((NT|XP)( \d\d?.\d)?)/i,e),n=i.default.getWindowsVersionName(t);return{name:o.OS_MAP.Windows,version:t,versionName:n}}},{test:[/Macintosh(.*?) FxiOS(.*?)\//],describe:function(e){var t={name:o.OS_MAP.iOS},n=i.default.getSecondMatch(/(Version\/)(\d[\d.]+)/,e);return n&&(t.version=n),t}},{test:[/macintosh/i],describe:function(e){var t=i.default.getFirstMatch(/mac os x (\d+(\.?_?\d+)+)/i,e).replace(/[_\s]/g,"."),n=i.default.getMacOSVersionName(t),r={name:o.OS_MAP.MacOS,version:t};return n&&(r.versionName=n),r}},{test:[/(ipod|iphone|ipad)/i],describe:function(e){var t=i.default.getFirstMatch(/os (\d+([_\s]\d+)*) like mac os x/i,e).replace(/[_\s]/g,".");return{name:o.OS_MAP.iOS,version:t}}},{test:function(e){var t=!e.test(/like android/i),n=e.test(/android/i);return t&&n},describe:function(e){var t=i.default.getFirstMatch(/android[\s/-](\d+(\.\d+)*)/i,e),n=i.default.getAndroidVersionName(t),r={name:o.OS_MAP.Android,version:t};return n&&(r.versionName=n),r}},{test:[/(web|hpw)[o0]s/i],describe:function(e){var t=i.default.getFirstMatch(/(?:web|hpw)[o0]s\/(\d+(\.\d+)*)/i,e),n={name:o.OS_MAP.WebOS};return t&&t.length&&(n.version=t),n}},{test:[/blackberry|\bbb\d+/i,/rim\stablet/i],describe:function(e){var t=i.default.getFirstMatch(/rim\stablet\sos\s(\d+(\.\d+)*)/i,e)||i.default.getFirstMatch(/blackberry\d+\/(\d+([_\s]\d+)*)/i,e)||i.default.getFirstMatch(/\bbb(\d+)/i,e);return{name:o.OS_MAP.BlackBerry,version:t}}},{test:[/bada/i],describe:function(e){var t=i.default.getFirstMatch(/bada\/(\d+(\.\d+)*)/i,e);return{name:o.OS_MAP.Bada,version:t}}},{test:[/tizen/i],describe:function(e){var t=i.default.getFirstMatch(/tizen[/\s](\d+(\.\d+)*)/i,e);return{name:o.OS_MAP.Tizen,version:t}}},{test:[/linux/i],describe:function(){return{name:o.OS_MAP.Linux}}},{test:[/CrOS/],describe:function(){return{name:o.OS_MAP.ChromeOS}}},{test:[/PlayStation 4/],describe:function(e){var t=i.default.getFirstMatch(/PlayStation 4[/\s](\d+(\.\d+)*)/i,e);return{name:o.OS_MAP.PlayStation4,version:t}}}];t.default=a,e.exports=t.default},94:function(e,t,n){"use strict";t.__esModule=!0,t.default=void 0;var r,i=(r=n(17))&&r.__esModule?r:{default:r},o=n(18),a=[{test:[/googlebot/i],describe:function(){return{type:"bot",vendor:"Google"}}},{test:[/huawei/i],describe:function(e){var t=i.default.getFirstMatch(/(can-l01)/i,e)&&"Nova",n={type:o.PLATFORMS_MAP.mobile,vendor:"Huawei"};return t&&(n.model=t),n}},{test:[/nexus\s*(?:7|8|9|10).*/i],describe:function(){return{type:o.PLATFORMS_MAP.tablet,vendor:"Nexus"}}},{test:[/ipad/i],describe:function(){return{type:o.PLATFORMS_MAP.tablet,vendor:"Apple",model:"iPad"}}},{test:[/Macintosh(.*?) FxiOS(.*?)\//],describe:function(){return{type:o.PLATFORMS_MAP.tablet,vendor:"Apple",model:"iPad"}}},{test:[/kftt build/i],describe:function(){return{type:o.PLATFORMS_MAP.tablet,vendor:"Amazon",model:"Kindle Fire HD 7"}}},{test:[/silk/i],describe:function(){return{type:o.PLATFORMS_MAP.tablet,vendor:"Amazon"}}},{test:[/tablet(?! pc)/i],describe:function(){return{type:o.PLATFORMS_MAP.tablet}}},{test:function(e){var t=e.test(/ipod|iphone/i),n=e.test(/like (ipod|iphone)/i);return t&&!n},describe:function(e){var t=i.default.getFirstMatch(/(ipod|iphone)/i,e);return{type:o.PLATFORMS_MAP.mobile,vendor:"Apple",model:t}}},{test:[/nexus\s*[0-6].*/i,/galaxy nexus/i],describe:function(){return{type:o.PLATFORMS_MAP.mobile,vendor:"Nexus"}}},{test:[/[^-]mobi/i],describe:function(){return{type:o.PLATFORMS_MAP.mobile}}},{test:function(e){return"blackberry"===e.getBrowserName(!0)},describe:function(){return{type:o.PLATFORMS_MAP.mobile,vendor:"BlackBerry"}}},{test:function(e){return"bada"===e.getBrowserName(!0)},describe:function(){return{type:o.PLATFORMS_MAP.mobile}}},{test:function(e){return"windows phone"===e.getBrowserName()},describe:function(){return{type:o.PLATFORMS_MAP.mobile,vendor:"Microsoft"}}},{test:function(e){var t=Number(String(e.getOSVersion()).split(".")[0]);return"android"===e.getOSName(!0)&&t>=3},describe:function(){return{type:o.PLATFORMS_MAP.tablet}}},{test:function(e){return"android"===e.getOSName(!0)},describe:function(){return{type:o.PLATFORMS_MAP.mobile}}},{test:function(e){return"macos"===e.getOSName(!0)},describe:function(){return{type:o.PLATFORMS_MAP.desktop,vendor:"Apple"}}},{test:function(e){return"windows"===e.getOSName(!0)},describe:function(){return{type:o.PLATFORMS_MAP.desktop}}},{test:function(e){return"linux"===e.getOSName(!0)},describe:function(){return{type:o.PLATFORMS_MAP.desktop}}},{test:function(e){return"playstation 4"===e.getOSName(!0)},describe:function(){return{type:o.PLATFORMS_MAP.tv}}},{test:function(e){return"roku"===e.getOSName(!0)},describe:function(){return{type:o.PLATFORMS_MAP.tv}}}];t.default=a,e.exports=t.default},95:function(e,t,n){"use strict";t.__esModule=!0,t.default=void 0;var r,i=(r=n(17))&&r.__esModule?r:{default:r},o=n(18),a=[{test:function(e){return"microsoft edge"===e.getBrowserName(!0)},describe:function(e){if(/\sedg\//i.test(e))return{name:o.ENGINE_MAP.Blink};var t=i.default.getFirstMatch(/edge\/(\d+(\.?_?\d+)+)/i,e);return{name:o.ENGINE_MAP.EdgeHTML,version:t}}},{test:[/trident/i],describe:function(e){var t={name:o.ENGINE_MAP.Trident},n=i.default.getFirstMatch(/trident\/(\d+(\.?_?\d+)+)/i,e);return n&&(t.version=n),t}},{test:function(e){return e.test(/presto/i)},describe:function(e){var t={name:o.ENGINE_MAP.Presto},n=i.default.getFirstMatch(/presto\/(\d+(\.?_?\d+)+)/i,e);return n&&(t.version=n),t}},{test:function(e){var t=e.test(/gecko/i),n=e.test(/like gecko/i);return t&&!n},describe:function(e){var t={name:o.ENGINE_MAP.Gecko},n=i.default.getFirstMatch(/gecko\/(\d+(\.?_?\d+)+)/i,e);return n&&(t.version=n),t}},{test:[/(apple)?webkit\/537\.36/i],describe:function(){return{name:o.ENGINE_MAP.Blink}}},{test:[/(apple)?webkit/i],describe:function(e){var t={name:o.ENGINE_MAP.WebKit},n=i.default.getFirstMatch(/webkit\/(\d+(\.?_?\d+)+)/i,e);return n&&(t.version=n),t}}];t.default=a,e.exports=t.default}})},7:function(e){"use strict";var t,n="object"==typeof Reflect?Reflect:null,r=n&&"function"==typeof n.apply?n.apply:function(e,t,n){return Function.prototype.apply.call(e,t,n)};t=n&&"function"==typeof n.ownKeys?n.ownKeys:Object.getOwnPropertySymbols?function(e){return Object.getOwnPropertyNames(e).concat(Object.getOwnPropertySymbols(e))}:function(e){return Object.getOwnPropertyNames(e)};var i=Number.isNaN||function(e){return e!=e};function o(){o.init.call(this)}e.exports=o,e.exports.once=function(e,t){return new Promise((function(n,r){function i(n){e.removeListener(t,o),r(n)}function o(){"function"==typeof e.removeListener&&e.removeListener("error",i),n([].slice.call(arguments))}v(e,t,o,{once:!0}),"error"!==t&&function(e,t){"function"==typeof e.on&&v(e,"error",t,{once:!0})}(e,i)}))},o.EventEmitter=o,o.prototype._events=void 0,o.prototype._eventsCount=0,o.prototype._maxListeners=void 0;var a=10;function s(e){if("function"!=typeof e)throw new TypeError('The "listener" argument must be of type Function. Received type '+typeof e)}function c(e){return void 0===e._maxListeners?o.defaultMaxListeners:e._maxListeners}function u(e,t,n,r){var i,o,a,u;if(s(n),void 0===(o=e._events)?(o=e._events=Object.create(null),e._eventsCount=0):(void 0!==o.newListener&&(e.emit("newListener",t,n.listener?n.listener:n),o=e._events),a=o[t]),void 0===a)a=o[t]=n,++e._eventsCount;else if("function"==typeof a?a=o[t]=r?[n,a]:[a,n]:r?a.unshift(n):a.push(n),(i=c(e))>0&&a.length>i&&!a.warned){a.warned=!0;var l=new Error("Possible EventEmitter memory leak detected. "+a.length+" "+String(t)+" listeners added. Use emitter.setMaxListeners() to increase limit");l.name="MaxListenersExceededWarning",l.emitter=e,l.type=t,l.count=a.length,u=l,console&&console.warn&&console.warn(u)}return e}function l(){if(!this.fired)return this.target.removeListener(this.type,this.wrapFn),this.fired=!0,0===arguments.length?this.listener.call(this.target):this.listener.apply(this.target,arguments)}function d(e,t,n){var r={fired:!1,wrapFn:void 0,target:e,type:t,listener:n},i=l.bind(r);return i.listener=n,r.wrapFn=i,i}function f(e,t,n){var r=e._events;if(void 0===r)return[];var i=r[t];return void 0===i?[]:"function"==typeof i?n?[i.listener||i]:[i]:n?function(e){for(var t=new Array(e.length),n=0;n<t.length;++n)t[n]=e[n].listener||e[n];return t}(i):h(i,i.length)}function p(e){var t=this._events;if(void 0!==t){var n=t[e];if("function"==typeof n)return 1;if(void 0!==n)return n.length}return 0}function h(e,t){for(var n=new Array(t),r=0;r<t;++r)n[r]=e[r];return n}function v(e,t,n,r){if("function"==typeof e.on)r.once?e.once(t,n):e.on(t,n);else{if("function"!=typeof e.addEventListener)throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type '+typeof e);e.addEventListener(t,(function i(o){r.once&&e.removeEventListener(t,i),n(o)}))}}Object.defineProperty(o,"defaultMaxListeners",{enumerable:!0,get:function(){return a},set:function(e){if("number"!=typeof e||e<0||i(e))throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received '+e+".");a=e}}),o.init=function(){void 0!==this._events&&this._events!==Object.getPrototypeOf(this)._events||(this._events=Object.create(null),this._eventsCount=0),this._maxListeners=this._maxListeners||void 0},o.prototype.setMaxListeners=function(e){if("number"!=typeof e||e<0||i(e))throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received '+e+".");return this._maxListeners=e,this},o.prototype.getMaxListeners=function(){return c(this)},o.prototype.emit=function(e){for(var t=[],n=1;n<arguments.length;n++)t.push(arguments[n]);var i="error"===e,o=this._events;if(void 0!==o)i=i&&void 0===o.error;else if(!i)return!1;if(i){var a;if(t.length>0&&(a=t[0]),a instanceof Error)throw a;var s=new Error("Unhandled error."+(a?" ("+a.message+")":""));throw s.context=a,s}var c=o[e];if(void 0===c)return!1;if("function"==typeof c)r(c,this,t);else{var u=c.length,l=h(c,u);for(n=0;n<u;++n)r(l[n],this,t)}return!0},o.prototype.addListener=function(e,t){return u(this,e,t,!1)},o.prototype.on=o.prototype.addListener,o.prototype.prependListener=function(e,t){return u(this,e,t,!0)},o.prototype.once=function(e,t){return s(t),this.on(e,d(this,e,t)),this},o.prototype.prependOnceListener=function(e,t){return s(t),this.prependListener(e,d(this,e,t)),this},o.prototype.removeListener=function(e,t){var n,r,i,o,a;if(s(t),void 0===(r=this._events))return this;if(void 0===(n=r[e]))return this;if(n===t||n.listener===t)0==--this._eventsCount?this._events=Object.create(null):(delete r[e],r.removeListener&&this.emit("removeListener",e,n.listener||t));else if("function"!=typeof n){for(i=-1,o=n.length-1;o>=0;o--)if(n[o]===t||n[o].listener===t){a=n[o].listener,i=o;break}if(i<0)return this;0===i?n.shift():function(e,t){for(;t+1<e.length;t++)e[t]=e[t+1];e.pop()}(n,i),1===n.length&&(r[e]=n[0]),void 0!==r.removeListener&&this.emit("removeListener",e,a||t)}return this},o.prototype.off=o.prototype.removeListener,o.prototype.removeAllListeners=function(e){var t,n,r;if(void 0===(n=this._events))return this;if(void 0===n.removeListener)return 0===arguments.length?(this._events=Object.create(null),this._eventsCount=0):void 0!==n[e]&&(0==--this._eventsCount?this._events=Object.create(null):delete n[e]),this;if(0===arguments.length){var i,o=Object.keys(n);for(r=0;r<o.length;++r)"removeListener"!==(i=o[r])&&this.removeAllListeners(i);return this.removeAllListeners("removeListener"),this._events=Object.create(null),this._eventsCount=0,this}if("function"==typeof(t=n[e]))this.removeListener(e,t);else if(void 0!==t)for(r=t.length-1;r>=0;r--)this.removeListener(e,t[r]);return this},o.prototype.listeners=function(e){return f(this,e,!0)},o.prototype.rawListeners=function(e){return f(this,e,!1)},o.listenerCount=function(e,t){return"function"==typeof e.listenerCount?e.listenerCount(t):p.call(e,t)},o.prototype.listenerCount=p,o.prototype.eventNames=function(){return this._eventsCount>0?t(this._events):[]}}},t={};function n(r){var i=t[r];if(void 0!==i)return i.exports;var o=t[r]={exports:{}};return e[r].call(o.exports,o,o.exports,n),o.exports}return n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,{a:t}),t},n.d=function(e,t){for(var r in t)n.o(t,r)&&!n.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n(781)}()})),globalThis&&globalThis.Daily&&(globalThis.DailyIframe=globalThis.Daily);
},{}],6:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var R = typeof Reflect === 'object' ? Reflect : null
var ReflectApply = R && typeof R.apply === 'function'
  ? R.apply
  : function ReflectApply(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  }

var ReflectOwnKeys
if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target)
      .concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target);
  };
}

function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
}

function EventEmitter() {
  EventEmitter.init.call(this);
}
module.exports = EventEmitter;
module.exports.once = once;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

function checkListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
}

Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
  enumerable: true,
  get: function() {
    return defaultMaxListeners;
  },
  set: function(arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
    }
    defaultMaxListeners = arg;
  }
});

EventEmitter.init = function() {

  if (this._events === undefined ||
      this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }
  this._maxListeners = n;
  return this;
};

function _getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners(this);
};

EventEmitter.prototype.emit = function emit(type) {
  var args = [];
  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
  var doError = (type === 'error');

  var events = this._events;
  if (events !== undefined)
    doError = (doError && events.error === undefined);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    var er;
    if (args.length > 0)
      er = args[0];
    if (er instanceof Error) {
      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    }
    // At least give some kind of context to the user
    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
    err.context = er;
    throw err; // Unhandled 'error' event
  }

  var handler = events[type];

  if (handler === undefined)
    return false;

  if (typeof handler === 'function') {
    ReflectApply(handler, this, args);
  } else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      ReflectApply(listeners[i], this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  checkListener(listener);

  events = target._events;
  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
        prepend ? [listener, existing] : [existing, listener];
      // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }

    // Check for listener leak
    m = _getMaxListeners(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax
      var w = new Error('Possible EventEmitter memory leak detected. ' +
                          existing.length + ' ' + String(type) + ' listeners ' +
                          'added. Use emitter.setMaxListeners() to ' +
                          'increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0)
      return this.listener.call(this.target);
    return this.listener.apply(this.target, arguments);
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  checkListener(listener);
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      checkListener(listener);
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      checkListener(listener);

      events = this._events;
      if (events === undefined)
        return this;

      list = events[type];
      if (list === undefined)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener !== undefined)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (events === undefined)
        return this;

      // not listening for removeListener, no need to emit
      if (events.removeListener === undefined) {
        if (arguments.length === 0) {
          this._events = Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== undefined) {
          if (--this._eventsCount === 0)
            this._events = Object.create(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = Object.create(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners !== undefined) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (events === undefined)
    return [];

  var evlistener = events[type];
  if (evlistener === undefined)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ?
    unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events !== undefined) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener !== undefined) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function spliceOne(list, index) {
  for (; index + 1 < list.length; index++)
    list[index] = list[index + 1];
  list.pop();
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function once(emitter, name) {
  return new Promise(function (resolve, reject) {
    function errorListener(err) {
      emitter.removeListener(name, resolver);
      reject(err);
    }

    function resolver() {
      if (typeof emitter.removeListener === 'function') {
        emitter.removeListener('error', errorListener);
      }
      resolve([].slice.call(arguments));
    };

    eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
    if (name !== 'error') {
      addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
    }
  });
}

function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
  if (typeof emitter.on === 'function') {
    eventTargetAgnosticAddListener(emitter, 'error', handler, flags);
  }
}

function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
  if (typeof emitter.on === 'function') {
    if (flags.once) {
      emitter.once(name, listener);
    } else {
      emitter.on(name, listener);
    }
  } else if (typeof emitter.addEventListener === 'function') {
    // EventTarget does not have `error` event semantics like Node
    // EventEmitters, we do not listen for `error` events here.
    emitter.addEventListener(name, function wrapListener(arg) {
      // IE does not have builtin `{ once: true }` support so we
      // have to do it manually.
      if (flags.once) {
        emitter.removeEventListener(name, wrapListener);
      }
      listener(arg);
    });
  } else {
    throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
  }
}

},{}]},{},[1]);
