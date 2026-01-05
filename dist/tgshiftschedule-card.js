/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/@lit/reactive-element/development/css-tag.js":
/*!*******************************************************************!*\
  !*** ./node_modules/@lit/reactive-element/development/css-tag.js ***!
  \*******************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CSSResult: () => (/* binding */ CSSResult),
/* harmony export */   adoptStyles: () => (/* binding */ adoptStyles),
/* harmony export */   css: () => (/* binding */ css),
/* harmony export */   getCompatibleStyle: () => (/* binding */ getCompatibleStyle),
/* harmony export */   supportsAdoptingStyleSheets: () => (/* binding */ supportsAdoptingStyleSheets),
/* harmony export */   unsafeCSS: () => (/* binding */ unsafeCSS)
/* harmony export */ });
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const NODE_MODE = false;
// Allows minifiers to rename references to globalThis
const global = globalThis;
/**
 * Whether the current browser supports `adoptedStyleSheets`.
 */
const supportsAdoptingStyleSheets = global.ShadowRoot &&
    (global.ShadyCSS === undefined || global.ShadyCSS.nativeShadow) &&
    'adoptedStyleSheets' in Document.prototype &&
    'replace' in CSSStyleSheet.prototype;
const constructionToken = Symbol();
const cssTagCache = new WeakMap();
/**
 * A container for a string of CSS text, that may be used to create a CSSStyleSheet.
 *
 * CSSResult is the return value of `css`-tagged template literals and
 * `unsafeCSS()`. In order to ensure that CSSResults are only created via the
 * `css` tag and `unsafeCSS()`, CSSResult cannot be constructed directly.
 */
class CSSResult {
    constructor(cssText, strings, safeToken) {
        // This property needs to remain unminified.
        this['_$cssResult$'] = true;
        if (safeToken !== constructionToken) {
            throw new Error('CSSResult is not constructable. Use `unsafeCSS` or `css` instead.');
        }
        this.cssText = cssText;
        this._strings = strings;
    }
    // This is a getter so that it's lazy. In practice, this means stylesheets
    // are not created until the first element instance is made.
    get styleSheet() {
        // If `supportsAdoptingStyleSheets` is true then we assume CSSStyleSheet is
        // constructable.
        let styleSheet = this._styleSheet;
        const strings = this._strings;
        if (supportsAdoptingStyleSheets && styleSheet === undefined) {
            const cacheable = strings !== undefined && strings.length === 1;
            if (cacheable) {
                styleSheet = cssTagCache.get(strings);
            }
            if (styleSheet === undefined) {
                (this._styleSheet = styleSheet = new CSSStyleSheet()).replaceSync(this.cssText);
                if (cacheable) {
                    cssTagCache.set(strings, styleSheet);
                }
            }
        }
        return styleSheet;
    }
    toString() {
        return this.cssText;
    }
}
const textFromCSSResult = (value) => {
    // This property needs to remain unminified.
    if (value['_$cssResult$'] === true) {
        return value.cssText;
    }
    else if (typeof value === 'number') {
        return value;
    }
    else {
        throw new Error(`Value passed to 'css' function must be a 'css' function result: ` +
            `${value}. Use 'unsafeCSS' to pass non-literal values, but take care ` +
            `to ensure page security.`);
    }
};
/**
 * Wrap a value for interpolation in a {@linkcode css} tagged template literal.
 *
 * This is unsafe because untrusted CSS text can be used to phone home
 * or exfiltrate data to an attacker controlled site. Take care to only use
 * this with trusted input.
 */
const unsafeCSS = (value) => new CSSResult(typeof value === 'string' ? value : String(value), undefined, constructionToken);
/**
 * A template literal tag which can be used with LitElement's
 * {@linkcode LitElement.styles} property to set element styles.
 *
 * For security reasons, only literal string values and number may be used in
 * embedded expressions. To incorporate non-literal values {@linkcode unsafeCSS}
 * may be used inside an expression.
 */
const css = (strings, ...values) => {
    const cssText = strings.length === 1
        ? strings[0]
        : values.reduce((acc, v, idx) => acc + textFromCSSResult(v) + strings[idx + 1], strings[0]);
    return new CSSResult(cssText, strings, constructionToken);
};
/**
 * Applies the given styles to a `shadowRoot`. When Shadow DOM is
 * available but `adoptedStyleSheets` is not, styles are appended to the
 * `shadowRoot` to [mimic the native feature](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot/adoptedStyleSheets).
 * Note, when shimming is used, any styles that are subsequently placed into
 * the shadowRoot should be placed *before* any shimmed adopted styles. This
 * will match spec behavior that gives adopted sheets precedence over styles in
 * shadowRoot.
 */
const adoptStyles = (renderRoot, styles) => {
    if (supportsAdoptingStyleSheets) {
        renderRoot.adoptedStyleSheets = styles.map((s) => s instanceof CSSStyleSheet ? s : s.styleSheet);
    }
    else {
        for (const s of styles) {
            const style = document.createElement('style');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const nonce = global['litNonce'];
            if (nonce !== undefined) {
                style.setAttribute('nonce', nonce);
            }
            style.textContent = s.cssText;
            renderRoot.appendChild(style);
        }
    }
};
const cssResultFromStyleSheet = (sheet) => {
    let cssText = '';
    for (const rule of sheet.cssRules) {
        cssText += rule.cssText;
    }
    return unsafeCSS(cssText);
};
const getCompatibleStyle = supportsAdoptingStyleSheets ||
    (NODE_MODE && global.CSSStyleSheet === undefined)
    ? (s) => s
    : (s) => s instanceof CSSStyleSheet ? cssResultFromStyleSheet(s) : s;
//# sourceMappingURL=css-tag.js.map

/***/ }),

/***/ "./node_modules/@lit/reactive-element/development/decorators/base.js":
/*!***************************************************************************!*\
  !*** ./node_modules/@lit/reactive-element/development/decorators/base.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   desc: () => (/* binding */ desc)
/* harmony export */ });
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
/**
 * Wraps up a few best practices when returning a property descriptor from a
 * decorator.
 *
 * Marks the defined property as configurable, and enumerable, and handles
 * the case where we have a busted Reflect.decorate zombiefill (e.g. in Angular
 * apps).
 *
 * @internal
 */
const desc = (obj, name, descriptor) => {
    // For backwards compatibility, we keep them configurable and enumerable.
    descriptor.configurable = true;
    descriptor.enumerable = true;
    if (
    // We check for Reflect.decorate each time, in case the zombiefill
    // is applied via lazy loading some Angular code.
    Reflect.decorate &&
        typeof name !== 'object') {
        // If we're called as a legacy decorator, and Reflect.decorate is present
        // then we have no guarantees that the returned descriptor will be
        // defined on the class, so we must apply it directly ourselves.
        Object.defineProperty(obj, name, descriptor);
    }
    return descriptor;
};
//# sourceMappingURL=base.js.map

/***/ }),

/***/ "./node_modules/@lit/reactive-element/development/decorators/custom-element.js":
/*!*************************************************************************************!*\
  !*** ./node_modules/@lit/reactive-element/development/decorators/custom-element.js ***!
  \*************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   customElement: () => (/* binding */ customElement)
/* harmony export */ });
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
/**
 * Class decorator factory that defines the decorated class as a custom element.
 *
 * ```js
 * @customElement('my-element')
 * class MyElement extends LitElement {
 *   render() {
 *     return html``;
 *   }
 * }
 * ```
 * @category Decorator
 * @param tagName The tag name of the custom element to define.
 */
const customElement = (tagName) => (classOrTarget, context) => {
    if (context !== undefined) {
        context.addInitializer(() => {
            customElements.define(tagName, classOrTarget);
        });
    }
    else {
        customElements.define(tagName, classOrTarget);
    }
};
//# sourceMappingURL=custom-element.js.map

/***/ }),

/***/ "./node_modules/@lit/reactive-element/development/decorators/event-options.js":
/*!************************************************************************************!*\
  !*** ./node_modules/@lit/reactive-element/development/decorators/event-options.js ***!
  \************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   eventOptions: () => (/* binding */ eventOptions)
/* harmony export */ });
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
/**
 * Adds event listener options to a method used as an event listener in a
 * lit-html template.
 *
 * @param options An object that specifies event listener options as accepted by
 * `EventTarget#addEventListener` and `EventTarget#removeEventListener`.
 *
 * Current browsers support the `capture`, `passive`, and `once` options. See:
 * https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#Parameters
 *
 * ```ts
 * class MyElement {
 *   clicked = false;
 *
 *   render() {
 *     return html`
 *       <div @click=${this._onClick}>
 *         <button></button>
 *       </div>
 *     `;
 *   }
 *
 *   @eventOptions({capture: true})
 *   _onClick(e) {
 *     this.clicked = true;
 *   }
 * }
 * ```
 * @category Decorator
 */
function eventOptions(options) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ((protoOrValue, nameOrContext) => {
        const method = typeof protoOrValue === 'function'
            ? protoOrValue
            : protoOrValue[nameOrContext];
        Object.assign(method, options);
    });
}
//# sourceMappingURL=event-options.js.map

/***/ }),

/***/ "./node_modules/@lit/reactive-element/development/decorators/property.js":
/*!*******************************************************************************!*\
  !*** ./node_modules/@lit/reactive-element/development/decorators/property.js ***!
  \*******************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   property: () => (/* binding */ property),
/* harmony export */   standardProperty: () => (/* binding */ standardProperty)
/* harmony export */ });
/* harmony import */ var _reactive_element_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../reactive-element.js */ "./node_modules/@lit/reactive-element/development/reactive-element.js");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
/*
 * IMPORTANT: For compatibility with tsickle and the Closure JS compiler, all
 * property decorators (but not class decorators) in this file that have
 * an @ExportDecoratedItems annotation must be defined as a regular function,
 * not an arrow function.
 */

const DEV_MODE = true;
let issueWarning;
if (DEV_MODE) {
    // Ensure warnings are issued only 1x, even if multiple versions of Lit
    // are loaded.
    globalThis.litIssuedWarnings ??= new Set();
    /**
     * Issue a warning if we haven't already, based either on `code` or `warning`.
     * Warnings are disabled automatically only by `warning`; disabling via `code`
     * can be done by users.
     */
    issueWarning = (code, warning) => {
        warning += ` See https://lit.dev/msg/${code} for more information.`;
        if (!globalThis.litIssuedWarnings.has(warning) &&
            !globalThis.litIssuedWarnings.has(code)) {
            console.warn(warning);
            globalThis.litIssuedWarnings.add(warning);
        }
    };
}
const legacyProperty = (options, proto, name) => {
    const hasOwnProperty = proto.hasOwnProperty(name);
    proto.constructor.createProperty(name, options);
    // For accessors (which have a descriptor on the prototype) we need to
    // return a descriptor, otherwise TypeScript overwrites the descriptor we
    // define in createProperty() with the original descriptor. We don't do this
    // for fields, which don't have a descriptor, because this could overwrite
    // descriptor defined by other decorators.
    return hasOwnProperty
        ? Object.getOwnPropertyDescriptor(proto, name)
        : undefined;
};
// This is duplicated from a similar variable in reactive-element.ts, but
// actually makes sense to have this default defined with the decorator, so
// that different decorators could have different defaults.
const defaultPropertyDeclaration = {
    attribute: true,
    type: String,
    converter: _reactive_element_js__WEBPACK_IMPORTED_MODULE_0__.defaultConverter,
    reflect: false,
    hasChanged: _reactive_element_js__WEBPACK_IMPORTED_MODULE_0__.notEqual,
};
/**
 * Wraps a class accessor or setter so that `requestUpdate()` is called with the
 * property name and old value when the accessor is set.
 */
const standardProperty = (options = defaultPropertyDeclaration, target, context) => {
    const { kind, metadata } = context;
    if (DEV_MODE && metadata == null) {
        issueWarning('missing-class-metadata', `The class ${target} is missing decorator metadata. This ` +
            `could mean that you're using a compiler that supports decorators ` +
            `but doesn't support decorator metadata, such as TypeScript 5.1. ` +
            `Please update your compiler.`);
    }
    // Store the property options
    let properties = globalThis.litPropertyMetadata.get(metadata);
    if (properties === undefined) {
        globalThis.litPropertyMetadata.set(metadata, (properties = new Map()));
    }
    if (kind === 'setter') {
        options = Object.create(options);
        options.wrapped = true;
    }
    properties.set(context.name, options);
    if (kind === 'accessor') {
        // Standard decorators cannot dynamically modify the class, so we can't
        // replace a field with accessors. The user must use the new `accessor`
        // keyword instead.
        const { name } = context;
        return {
            set(v) {
                const oldValue = target.get.call(this);
                target.set.call(this, v);
                this.requestUpdate(name, oldValue, options);
            },
            init(v) {
                if (v !== undefined) {
                    this._$changeProperty(name, undefined, options, v);
                }
                return v;
            },
        };
    }
    else if (kind === 'setter') {
        const { name } = context;
        return function (value) {
            const oldValue = this[name];
            target.call(this, value);
            this.requestUpdate(name, oldValue, options);
        };
    }
    throw new Error(`Unsupported decorator location: ${kind}`);
};
/**
 * A class field or accessor decorator which creates a reactive property that
 * reflects a corresponding attribute value. When a decorated property is set
 * the element will update and render. A {@linkcode PropertyDeclaration} may
 * optionally be supplied to configure property features.
 *
 * This decorator should only be used for public fields. As public fields,
 * properties should be considered as primarily settable by element users,
 * either via attribute or the property itself.
 *
 * Generally, properties that are changed by the element should be private or
 * protected fields and should use the {@linkcode state} decorator.
 *
 * However, sometimes element code does need to set a public property. This
 * should typically only be done in response to user interaction, and an event
 * should be fired informing the user; for example, a checkbox sets its
 * `checked` property when clicked and fires a `changed` event. Mutating public
 * properties should typically not be done for non-primitive (object or array)
 * properties. In other cases when an element needs to manage state, a private
 * property decorated via the {@linkcode state} decorator should be used. When
 * needed, state properties can be initialized via public properties to
 * facilitate complex interactions.
 *
 * ```ts
 * class MyElement {
 *   @property({ type: Boolean })
 *   clicked = false;
 * }
 * ```
 * @category Decorator
 * @ExportDecoratedItems
 */
function property(options) {
    return (protoOrTarget, nameOrContext
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) => {
        return (typeof nameOrContext === 'object'
            ? standardProperty(options, protoOrTarget, nameOrContext)
            : legacyProperty(options, protoOrTarget, nameOrContext));
    };
}
//# sourceMappingURL=property.js.map

/***/ }),

/***/ "./node_modules/@lit/reactive-element/development/decorators/query-all.js":
/*!********************************************************************************!*\
  !*** ./node_modules/@lit/reactive-element/development/decorators/query-all.js ***!
  \********************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   queryAll: () => (/* binding */ queryAll)
/* harmony export */ });
/* harmony import */ var _base_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base.js */ "./node_modules/@lit/reactive-element/development/decorators/base.js");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

// Shared fragment used to generate empty NodeLists when a render root is
// undefined
let fragment;
/**
 * A property decorator that converts a class property into a getter
 * that executes a querySelectorAll on the element's renderRoot.
 *
 * @param selector A DOMString containing one or more selectors to match.
 *
 * See:
 * https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll
 *
 * ```ts
 * class MyElement {
 *   @queryAll('div')
 *   divs: NodeListOf<HTMLDivElement>;
 *
 *   render() {
 *     return html`
 *       <div id="first"></div>
 *       <div id="second"></div>
 *     `;
 *   }
 * }
 * ```
 * @category Decorator
 */
function queryAll(selector) {
    return ((obj, name) => {
        return (0,_base_js__WEBPACK_IMPORTED_MODULE_0__.desc)(obj, name, {
            get() {
                const container = this.renderRoot ?? (fragment ??= document.createDocumentFragment());
                return container.querySelectorAll(selector);
            },
        });
    });
}
//# sourceMappingURL=query-all.js.map

/***/ }),

/***/ "./node_modules/@lit/reactive-element/development/decorators/query-assigned-elements.js":
/*!**********************************************************************************************!*\
  !*** ./node_modules/@lit/reactive-element/development/decorators/query-assigned-elements.js ***!
  \**********************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   queryAssignedElements: () => (/* binding */ queryAssignedElements)
/* harmony export */ });
/* harmony import */ var _base_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base.js */ "./node_modules/@lit/reactive-element/development/decorators/base.js");
/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * A property decorator that converts a class property into a getter that
 * returns the `assignedElements` of the given `slot`. Provides a declarative
 * way to use
 * [`HTMLSlotElement.assignedElements`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLSlotElement/assignedElements).
 *
 * Can be passed an optional {@linkcode QueryAssignedElementsOptions} object.
 *
 * Example usage:
 * ```ts
 * class MyElement {
 *   @queryAssignedElements({ slot: 'list' })
 *   listItems!: Array<HTMLElement>;
 *   @queryAssignedElements()
 *   unnamedSlotEls!: Array<HTMLElement>;
 *
 *   render() {
 *     return html`
 *       <slot name="list"></slot>
 *       <slot></slot>
 *     `;
 *   }
 * }
 * ```
 *
 * Note, the type of this property should be annotated as `Array<HTMLElement>`.
 *
 * @category Decorator
 */
function queryAssignedElements(options) {
    return ((obj, name) => {
        const { slot, selector } = options ?? {};
        const slotSelector = `slot${slot ? `[name=${slot}]` : ':not([name])'}`;
        return (0,_base_js__WEBPACK_IMPORTED_MODULE_0__.desc)(obj, name, {
            get() {
                const slotEl = this.renderRoot?.querySelector(slotSelector);
                const elements = slotEl?.assignedElements(options) ?? [];
                return (selector === undefined
                    ? elements
                    : elements.filter((node) => node.matches(selector)));
            },
        });
    });
}
//# sourceMappingURL=query-assigned-elements.js.map

/***/ }),

/***/ "./node_modules/@lit/reactive-element/development/decorators/query-assigned-nodes.js":
/*!*******************************************************************************************!*\
  !*** ./node_modules/@lit/reactive-element/development/decorators/query-assigned-nodes.js ***!
  \*******************************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   queryAssignedNodes: () => (/* binding */ queryAssignedNodes)
/* harmony export */ });
/* harmony import */ var _base_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base.js */ "./node_modules/@lit/reactive-element/development/decorators/base.js");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

/**
 * A property decorator that converts a class property into a getter that
 * returns the `assignedNodes` of the given `slot`.
 *
 * Can be passed an optional {@linkcode QueryAssignedNodesOptions} object.
 *
 * Example usage:
 * ```ts
 * class MyElement {
 *   @queryAssignedNodes({slot: 'list', flatten: true})
 *   listItems!: Array<Node>;
 *
 *   render() {
 *     return html`
 *       <slot name="list"></slot>
 *     `;
 *   }
 * }
 * ```
 *
 * Note the type of this property should be annotated as `Array<Node>`. Use the
 * queryAssignedElements decorator to list only elements, and optionally filter
 * the element list using a CSS selector.
 *
 * @category Decorator
 */
function queryAssignedNodes(options) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ((obj, name) => {
        const { slot } = options ?? {};
        const slotSelector = `slot${slot ? `[name=${slot}]` : ':not([name])'}`;
        return (0,_base_js__WEBPACK_IMPORTED_MODULE_0__.desc)(obj, name, {
            get() {
                const slotEl = this.renderRoot?.querySelector(slotSelector);
                return (slotEl?.assignedNodes(options) ?? []);
            },
        });
    });
}
//# sourceMappingURL=query-assigned-nodes.js.map

/***/ }),

/***/ "./node_modules/@lit/reactive-element/development/decorators/query-async.js":
/*!**********************************************************************************!*\
  !*** ./node_modules/@lit/reactive-element/development/decorators/query-async.js ***!
  \**********************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   queryAsync: () => (/* binding */ queryAsync)
/* harmony export */ });
/* harmony import */ var _base_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base.js */ "./node_modules/@lit/reactive-element/development/decorators/base.js");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

// Note, in the future, we may extend this decorator to support the use case
// where the queried element may need to do work to become ready to interact
// with (e.g. load some implementation code). If so, we might elect to
// add a second argument defining a function that can be run to make the
// queried element loaded/updated/ready.
/**
 * A property decorator that converts a class property into a getter that
 * returns a promise that resolves to the result of a querySelector on the
 * element's renderRoot done after the element's `updateComplete` promise
 * resolves. When the queried property may change with element state, this
 * decorator can be used instead of requiring users to await the
 * `updateComplete` before accessing the property.
 *
 * @param selector A DOMString containing one or more selectors to match.
 *
 * See: https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector
 *
 * ```ts
 * class MyElement {
 *   @queryAsync('#first')
 *   first: Promise<HTMLDivElement>;
 *
 *   render() {
 *     return html`
 *       <div id="first"></div>
 *       <div id="second"></div>
 *     `;
 *   }
 * }
 *
 * // external usage
 * async doSomethingWithFirst() {
 *  (await aMyElement.first).doSomething();
 * }
 * ```
 * @category Decorator
 */
function queryAsync(selector) {
    return ((obj, name) => {
        return (0,_base_js__WEBPACK_IMPORTED_MODULE_0__.desc)(obj, name, {
            async get() {
                await this.updateComplete;
                return this.renderRoot?.querySelector(selector) ?? null;
            },
        });
    });
}
//# sourceMappingURL=query-async.js.map

/***/ }),

/***/ "./node_modules/@lit/reactive-element/development/decorators/query.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@lit/reactive-element/development/decorators/query.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   query: () => (/* binding */ query)
/* harmony export */ });
/* harmony import */ var _base_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./base.js */ "./node_modules/@lit/reactive-element/development/decorators/base.js");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

const DEV_MODE = true;
let issueWarning;
if (DEV_MODE) {
    // Ensure warnings are issued only 1x, even if multiple versions of Lit
    // are loaded.
    globalThis.litIssuedWarnings ??= new Set();
    /**
     * Issue a warning if we haven't already, based either on `code` or `warning`.
     * Warnings are disabled automatically only by `warning`; disabling via `code`
     * can be done by users.
     */
    issueWarning = (code, warning) => {
        warning += code
            ? ` See https://lit.dev/msg/${code} for more information.`
            : '';
        if (!globalThis.litIssuedWarnings.has(warning) &&
            !globalThis.litIssuedWarnings.has(code)) {
            console.warn(warning);
            globalThis.litIssuedWarnings.add(warning);
        }
    };
}
/**
 * A property decorator that converts a class property into a getter that
 * executes a querySelector on the element's renderRoot.
 *
 * @param selector A DOMString containing one or more selectors to match.
 * @param cache An optional boolean which when true performs the DOM query only
 *     once and caches the result.
 *
 * See: https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelector
 *
 * ```ts
 * class MyElement {
 *   @query('#first')
 *   first: HTMLDivElement;
 *
 *   render() {
 *     return html`
 *       <div id="first"></div>
 *       <div id="second"></div>
 *     `;
 *   }
 * }
 * ```
 * @category Decorator
 */
function query(selector, cache) {
    return ((protoOrTarget, nameOrContext, descriptor) => {
        const doQuery = (el) => {
            const result = (el.renderRoot?.querySelector(selector) ?? null);
            if (DEV_MODE && result === null && cache && !el.hasUpdated) {
                const name = typeof nameOrContext === 'object'
                    ? nameOrContext.name
                    : nameOrContext;
                issueWarning('', `@query'd field ${JSON.stringify(String(name))} with the 'cache' ` +
                    `flag set for selector '${selector}' has been accessed before ` +
                    `the first update and returned null. This is expected if the ` +
                    `renderRoot tree has not been provided beforehand (e.g. via ` +
                    `Declarative Shadow DOM). Therefore the value hasn't been cached.`);
            }
            // TODO: if we want to allow users to assert that the query will never
            // return null, we need a new option and to throw here if the result
            // is null.
            return result;
        };
        if (cache) {
            // Accessors to wrap from either:
            //   1. The decorator target, in the case of standard decorators
            //   2. The property descriptor, in the case of experimental decorators
            //      on auto-accessors.
            //   3. Functions that access our own cache-key property on the instance,
            //      in the case of experimental decorators on fields.
            const { get, set } = typeof nameOrContext === 'object'
                ? protoOrTarget
                : descriptor ??
                    (() => {
                        const key = DEV_MODE
                            ? Symbol(`${String(nameOrContext)} (@query() cache)`)
                            : Symbol();
                        return {
                            get() {
                                return this[key];
                            },
                            set(v) {
                                this[key] = v;
                            },
                        };
                    })();
            return (0,_base_js__WEBPACK_IMPORTED_MODULE_0__.desc)(protoOrTarget, nameOrContext, {
                get() {
                    let result = get.call(this);
                    if (result === undefined) {
                        result = doQuery(this);
                        if (result !== null || this.hasUpdated) {
                            set.call(this, result);
                        }
                    }
                    return result;
                },
            });
        }
        else {
            // This object works as the return type for both standard and
            // experimental decorators.
            return (0,_base_js__WEBPACK_IMPORTED_MODULE_0__.desc)(protoOrTarget, nameOrContext, {
                get() {
                    return doQuery(this);
                },
            });
        }
    });
}
//# sourceMappingURL=query.js.map

/***/ }),

/***/ "./node_modules/@lit/reactive-element/development/decorators/state.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@lit/reactive-element/development/decorators/state.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   state: () => (/* binding */ state)
/* harmony export */ });
/* harmony import */ var _property_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./property.js */ "./node_modules/@lit/reactive-element/development/decorators/property.js");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
/*
 * IMPORTANT: For compatibility with tsickle and the Closure JS compiler, all
 * property decorators (but not class decorators) in this file that have
 * an @ExportDecoratedItems annotation must be defined as a regular function,
 * not an arrow function.
 */

/**
 * Declares a private or protected reactive property that still triggers
 * updates to the element when it changes. It does not reflect from the
 * corresponding attribute.
 *
 * Properties declared this way must not be used from HTML or HTML templating
 * systems, they're solely for properties internal to the element. These
 * properties may be renamed by optimization tools like closure compiler.
 * @category Decorator
 */
function state(options) {
    return (0,_property_js__WEBPACK_IMPORTED_MODULE_0__.property)({
        ...options,
        // Add both `state` and `attribute` because we found a third party
        // controller that is keying off of PropertyOptions.state to determine
        // whether a field is a private internal property or not.
        state: true,
        attribute: false,
    });
}
//# sourceMappingURL=state.js.map

/***/ }),

/***/ "./node_modules/@lit/reactive-element/development/reactive-element.js":
/*!****************************************************************************!*\
  !*** ./node_modules/@lit/reactive-element/development/reactive-element.js ***!
  \****************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CSSResult: () => (/* reexport safe */ _css_tag_js__WEBPACK_IMPORTED_MODULE_0__.CSSResult),
/* harmony export */   ReactiveElement: () => (/* binding */ ReactiveElement),
/* harmony export */   adoptStyles: () => (/* reexport safe */ _css_tag_js__WEBPACK_IMPORTED_MODULE_0__.adoptStyles),
/* harmony export */   css: () => (/* reexport safe */ _css_tag_js__WEBPACK_IMPORTED_MODULE_0__.css),
/* harmony export */   defaultConverter: () => (/* binding */ defaultConverter),
/* harmony export */   getCompatibleStyle: () => (/* reexport safe */ _css_tag_js__WEBPACK_IMPORTED_MODULE_0__.getCompatibleStyle),
/* harmony export */   notEqual: () => (/* binding */ notEqual),
/* harmony export */   supportsAdoptingStyleSheets: () => (/* reexport safe */ _css_tag_js__WEBPACK_IMPORTED_MODULE_0__.supportsAdoptingStyleSheets),
/* harmony export */   unsafeCSS: () => (/* reexport safe */ _css_tag_js__WEBPACK_IMPORTED_MODULE_0__.unsafeCSS)
/* harmony export */ });
/* harmony import */ var _css_tag_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./css-tag.js */ "./node_modules/@lit/reactive-element/development/css-tag.js");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
/**
 * Use this module if you want to create your own base class extending
 * {@link ReactiveElement}.
 * @packageDocumentation
 */

// In the Node build, this import will be injected by Rollup:
// import {HTMLElement, customElements} from '@lit-labs/ssr-dom-shim';

// TODO (justinfagnani): Add `hasOwn` here when we ship ES2022
const { is, defineProperty, getOwnPropertyDescriptor, getOwnPropertyNames, getOwnPropertySymbols, getPrototypeOf, } = Object;
const NODE_MODE = false;
// Lets a minifier replace globalThis references with a minified name
const global = globalThis;
if (NODE_MODE) {
    global.customElements ??= customElements;
}
const DEV_MODE = true;
let issueWarning;
const trustedTypes = global
    .trustedTypes;
// Temporary workaround for https://crbug.com/993268
// Currently, any attribute starting with "on" is considered to be a
// TrustedScript source. Such boolean attributes must be set to the equivalent
// trusted emptyScript value.
const emptyStringForBooleanAttribute = trustedTypes
    ? trustedTypes.emptyScript
    : '';
const polyfillSupport = DEV_MODE
    ? global.reactiveElementPolyfillSupportDevMode
    : global.reactiveElementPolyfillSupport;
if (DEV_MODE) {
    // Ensure warnings are issued only 1x, even if multiple versions of Lit
    // are loaded.
    global.litIssuedWarnings ??= new Set();
    /**
     * Issue a warning if we haven't already, based either on `code` or `warning`.
     * Warnings are disabled automatically only by `warning`; disabling via `code`
     * can be done by users.
     */
    issueWarning = (code, warning) => {
        warning += ` See https://lit.dev/msg/${code} for more information.`;
        if (!global.litIssuedWarnings.has(warning) &&
            !global.litIssuedWarnings.has(code)) {
            console.warn(warning);
            global.litIssuedWarnings.add(warning);
        }
    };
    queueMicrotask(() => {
        issueWarning('dev-mode', `Lit is in dev mode. Not recommended for production!`);
        // Issue polyfill support warning.
        if (global.ShadyDOM?.inUse && polyfillSupport === undefined) {
            issueWarning('polyfill-support-missing', `Shadow DOM is being polyfilled via \`ShadyDOM\` but ` +
                `the \`polyfill-support\` module has not been loaded.`);
        }
    });
}
/**
 * Useful for visualizing and logging insights into what the Lit template system is doing.
 *
 * Compiled out of prod mode builds.
 */
const debugLogEvent = DEV_MODE
    ? (event) => {
        const shouldEmit = global
            .emitLitDebugLogEvents;
        if (!shouldEmit) {
            return;
        }
        global.dispatchEvent(new CustomEvent('lit-debug', {
            detail: event,
        }));
    }
    : undefined;
/*
 * When using Closure Compiler, JSCompiler_renameProperty(property, object) is
 * replaced at compile time by the munged name for object[property]. We cannot
 * alias this function, so we have to use a small shim that has the same
 * behavior when not compiling.
 */
/*@__INLINE__*/
const JSCompiler_renameProperty = (prop, _obj) => prop;
const defaultConverter = {
    toAttribute(value, type) {
        switch (type) {
            case Boolean:
                value = value ? emptyStringForBooleanAttribute : null;
                break;
            case Object:
            case Array:
                // if the value is `null` or `undefined` pass this through
                // to allow removing/no change behavior.
                value = value == null ? value : JSON.stringify(value);
                break;
        }
        return value;
    },
    fromAttribute(value, type) {
        let fromValue = value;
        switch (type) {
            case Boolean:
                fromValue = value !== null;
                break;
            case Number:
                fromValue = value === null ? null : Number(value);
                break;
            case Object:
            case Array:
                // Do *not* generate exception when invalid JSON is set as elements
                // don't normally complain on being mis-configured.
                // TODO(sorvell): Do generate exception in *dev mode*.
                try {
                    // Assert to adhere to Bazel's "must type assert JSON parse" rule.
                    fromValue = JSON.parse(value);
                }
                catch (e) {
                    fromValue = null;
                }
                break;
        }
        return fromValue;
    },
};
/**
 * Change function that returns true if `value` is different from `oldValue`.
 * This method is used as the default for a property's `hasChanged` function.
 */
const notEqual = (value, old) => !is(value, old);
const defaultPropertyDeclaration = {
    attribute: true,
    type: String,
    converter: defaultConverter,
    reflect: false,
    useDefault: false,
    hasChanged: notEqual,
};
// Ensure metadata is enabled. TypeScript does not polyfill
// Symbol.metadata, so we must ensure that it exists.
Symbol.metadata ??= Symbol('metadata');
// Map from a class's metadata object to property options
// Note that we must use nullish-coalescing assignment so that we only use one
// map even if we load multiple version of this module.
global.litPropertyMetadata ??= new WeakMap();
/**
 * Base element class which manages element properties and attributes. When
 * properties change, the `update` method is asynchronously called. This method
 * should be supplied by subclasses to render updates as desired.
 * @noInheritDoc
 */
class ReactiveElement
// In the Node build, this `extends` clause will be substituted with
// `(globalThis.HTMLElement ?? HTMLElement)`.
//
// This way, we will first prefer any global `HTMLElement` polyfill that the
// user has assigned, and then fall back to the `HTMLElement` shim which has
// been imported (see note at the top of this file about how this import is
// generated by Rollup). Note that the `HTMLElement` variable has been
// shadowed by this import, so it no longer refers to the global.
 extends HTMLElement {
    /**
     * Adds an initializer function to the class that is called during instance
     * construction.
     *
     * This is useful for code that runs against a `ReactiveElement`
     * subclass, such as a decorator, that needs to do work for each
     * instance, such as setting up a `ReactiveController`.
     *
     * ```ts
     * const myDecorator = (target: typeof ReactiveElement, key: string) => {
     *   target.addInitializer((instance: ReactiveElement) => {
     *     // This is run during construction of the element
     *     new MyController(instance);
     *   });
     * }
     * ```
     *
     * Decorating a field will then cause each instance to run an initializer
     * that adds a controller:
     *
     * ```ts
     * class MyElement extends LitElement {
     *   @myDecorator foo;
     * }
     * ```
     *
     * Initializers are stored per-constructor. Adding an initializer to a
     * subclass does not add it to a superclass. Since initializers are run in
     * constructors, initializers will run in order of the class hierarchy,
     * starting with superclasses and progressing to the instance's class.
     *
     * @nocollapse
     */
    static addInitializer(initializer) {
        this.__prepare();
        (this._initializers ??= []).push(initializer);
    }
    /**
     * Returns a list of attributes corresponding to the registered properties.
     * @nocollapse
     * @category attributes
     */
    static get observedAttributes() {
        // Ensure we've created all properties
        this.finalize();
        // this.__attributeToPropertyMap is only undefined after finalize() in
        // ReactiveElement itself. ReactiveElement.observedAttributes is only
        // accessed with ReactiveElement as the receiver when a subclass or mixin
        // calls super.observedAttributes
        return (this.__attributeToPropertyMap && [...this.__attributeToPropertyMap.keys()]);
    }
    /**
     * Creates a property accessor on the element prototype if one does not exist
     * and stores a {@linkcode PropertyDeclaration} for the property with the
     * given options. The property setter calls the property's `hasChanged`
     * property option or uses a strict identity check to determine whether or not
     * to request an update.
     *
     * This method may be overridden to customize properties; however,
     * when doing so, it's important to call `super.createProperty` to ensure
     * the property is setup correctly. This method calls
     * `getPropertyDescriptor` internally to get a descriptor to install.
     * To customize what properties do when they are get or set, override
     * `getPropertyDescriptor`. To customize the options for a property,
     * implement `createProperty` like this:
     *
     * ```ts
     * static createProperty(name, options) {
     *   options = Object.assign(options, {myOption: true});
     *   super.createProperty(name, options);
     * }
     * ```
     *
     * @nocollapse
     * @category properties
     */
    static createProperty(name, options = defaultPropertyDeclaration) {
        // If this is a state property, force the attribute to false.
        if (options.state) {
            options.attribute = false;
        }
        this.__prepare();
        // Whether this property is wrapping accessors.
        // Helps control the initial value change and reflection logic.
        if (this.prototype.hasOwnProperty(name)) {
            options = Object.create(options);
            options.wrapped = true;
        }
        this.elementProperties.set(name, options);
        if (!options.noAccessor) {
            const key = DEV_MODE
                ? // Use Symbol.for in dev mode to make it easier to maintain state
                    // when doing HMR.
                    Symbol.for(`${String(name)} (@property() cache)`)
                : Symbol();
            const descriptor = this.getPropertyDescriptor(name, key, options);
            if (descriptor !== undefined) {
                defineProperty(this.prototype, name, descriptor);
            }
        }
    }
    /**
     * Returns a property descriptor to be defined on the given named property.
     * If no descriptor is returned, the property will not become an accessor.
     * For example,
     *
     * ```ts
     * class MyElement extends LitElement {
     *   static getPropertyDescriptor(name, key, options) {
     *     const defaultDescriptor =
     *         super.getPropertyDescriptor(name, key, options);
     *     const setter = defaultDescriptor.set;
     *     return {
     *       get: defaultDescriptor.get,
     *       set(value) {
     *         setter.call(this, value);
     *         // custom action.
     *       },
     *       configurable: true,
     *       enumerable: true
     *     }
     *   }
     * }
     * ```
     *
     * @nocollapse
     * @category properties
     */
    static getPropertyDescriptor(name, key, options) {
        const { get, set } = getOwnPropertyDescriptor(this.prototype, name) ?? {
            get() {
                return this[key];
            },
            set(v) {
                this[key] = v;
            },
        };
        if (DEV_MODE && get == null) {
            if ('value' in (getOwnPropertyDescriptor(this.prototype, name) ?? {})) {
                throw new Error(`Field ${JSON.stringify(String(name))} on ` +
                    `${this.name} was declared as a reactive property ` +
                    `but it's actually declared as a value on the prototype. ` +
                    `Usually this is due to using @property or @state on a method.`);
            }
            issueWarning('reactive-property-without-getter', `Field ${JSON.stringify(String(name))} on ` +
                `${this.name} was declared as a reactive property ` +
                `but it does not have a getter. This will be an error in a ` +
                `future version of Lit.`);
        }
        return {
            get,
            set(value) {
                const oldValue = get?.call(this);
                set?.call(this, value);
                this.requestUpdate(name, oldValue, options);
            },
            configurable: true,
            enumerable: true,
        };
    }
    /**
     * Returns the property options associated with the given property.
     * These options are defined with a `PropertyDeclaration` via the `properties`
     * object or the `@property` decorator and are registered in
     * `createProperty(...)`.
     *
     * Note, this method should be considered "final" and not overridden. To
     * customize the options for a given property, override
     * {@linkcode createProperty}.
     *
     * @nocollapse
     * @final
     * @category properties
     */
    static getPropertyOptions(name) {
        return this.elementProperties.get(name) ?? defaultPropertyDeclaration;
    }
    /**
     * Initializes static own properties of the class used in bookkeeping
     * for element properties, initializers, etc.
     *
     * Can be called multiple times by code that needs to ensure these
     * properties exist before using them.
     *
     * This method ensures the superclass is finalized so that inherited
     * property metadata can be copied down.
     * @nocollapse
     */
    static __prepare() {
        if (this.hasOwnProperty(JSCompiler_renameProperty('elementProperties', this))) {
            // Already prepared
            return;
        }
        // Finalize any superclasses
        const superCtor = getPrototypeOf(this);
        superCtor.finalize();
        // Create own set of initializers for this class if any exist on the
        // superclass and copy them down. Note, for a small perf boost, avoid
        // creating initializers unless needed.
        if (superCtor._initializers !== undefined) {
            this._initializers = [...superCtor._initializers];
        }
        // Initialize elementProperties from the superclass
        this.elementProperties = new Map(superCtor.elementProperties);
    }
    /**
     * Finishes setting up the class so that it's ready to be registered
     * as a custom element and instantiated.
     *
     * This method is called by the ReactiveElement.observedAttributes getter.
     * If you override the observedAttributes getter, you must either call
     * super.observedAttributes to trigger finalization, or call finalize()
     * yourself.
     *
     * @nocollapse
     */
    static finalize() {
        if (this.hasOwnProperty(JSCompiler_renameProperty('finalized', this))) {
            return;
        }
        this.finalized = true;
        this.__prepare();
        // Create properties from the static properties block:
        if (this.hasOwnProperty(JSCompiler_renameProperty('properties', this))) {
            const props = this.properties;
            const propKeys = [
                ...getOwnPropertyNames(props),
                ...getOwnPropertySymbols(props),
            ];
            for (const p of propKeys) {
                this.createProperty(p, props[p]);
            }
        }
        // Create properties from standard decorator metadata:
        const metadata = this[Symbol.metadata];
        if (metadata !== null) {
            const properties = litPropertyMetadata.get(metadata);
            if (properties !== undefined) {
                for (const [p, options] of properties) {
                    this.elementProperties.set(p, options);
                }
            }
        }
        // Create the attribute-to-property map
        this.__attributeToPropertyMap = new Map();
        for (const [p, options] of this.elementProperties) {
            const attr = this.__attributeNameForProperty(p, options);
            if (attr !== undefined) {
                this.__attributeToPropertyMap.set(attr, p);
            }
        }
        this.elementStyles = this.finalizeStyles(this.styles);
        if (DEV_MODE) {
            if (this.hasOwnProperty('createProperty')) {
                issueWarning('no-override-create-property', 'Overriding ReactiveElement.createProperty() is deprecated. ' +
                    'The override will not be called with standard decorators');
            }
            if (this.hasOwnProperty('getPropertyDescriptor')) {
                issueWarning('no-override-get-property-descriptor', 'Overriding ReactiveElement.getPropertyDescriptor() is deprecated. ' +
                    'The override will not be called with standard decorators');
            }
        }
    }
    /**
     * Takes the styles the user supplied via the `static styles` property and
     * returns the array of styles to apply to the element.
     * Override this method to integrate into a style management system.
     *
     * Styles are deduplicated preserving the _last_ instance in the list. This
     * is a performance optimization to avoid duplicated styles that can occur
     * especially when composing via subclassing. The last item is kept to try
     * to preserve the cascade order with the assumption that it's most important
     * that last added styles override previous styles.
     *
     * @nocollapse
     * @category styles
     */
    static finalizeStyles(styles) {
        const elementStyles = [];
        if (Array.isArray(styles)) {
            // Dedupe the flattened array in reverse order to preserve the last items.
            // Casting to Array<unknown> works around TS error that
            // appears to come from trying to flatten a type CSSResultArray.
            const set = new Set(styles.flat(Infinity).reverse());
            // Then preserve original order by adding the set items in reverse order.
            for (const s of set) {
                elementStyles.unshift((0,_css_tag_js__WEBPACK_IMPORTED_MODULE_0__.getCompatibleStyle)(s));
            }
        }
        else if (styles !== undefined) {
            elementStyles.push((0,_css_tag_js__WEBPACK_IMPORTED_MODULE_0__.getCompatibleStyle)(styles));
        }
        return elementStyles;
    }
    /**
     * Returns the property name for the given attribute `name`.
     * @nocollapse
     */
    static __attributeNameForProperty(name, options) {
        const attribute = options.attribute;
        return attribute === false
            ? undefined
            : typeof attribute === 'string'
                ? attribute
                : typeof name === 'string'
                    ? name.toLowerCase()
                    : undefined;
    }
    constructor() {
        super();
        this.__instanceProperties = undefined;
        /**
         * True if there is a pending update as a result of calling `requestUpdate()`.
         * Should only be read.
         * @category updates
         */
        this.isUpdatePending = false;
        /**
         * Is set to `true` after the first update. The element code cannot assume
         * that `renderRoot` exists before the element `hasUpdated`.
         * @category updates
         */
        this.hasUpdated = false;
        /**
         * Name of currently reflecting property
         */
        this.__reflectingProperty = null;
        this.__initialize();
    }
    /**
     * Internal only override point for customizing work done when elements
     * are constructed.
     */
    __initialize() {
        this.__updatePromise = new Promise((res) => (this.enableUpdating = res));
        this._$changedProperties = new Map();
        // This enqueues a microtask that must run before the first update, so it
        // must be called before requestUpdate()
        this.__saveInstanceProperties();
        // ensures first update will be caught by an early access of
        // `updateComplete`
        this.requestUpdate();
        this.constructor._initializers?.forEach((i) => i(this));
    }
    /**
     * Registers a `ReactiveController` to participate in the element's reactive
     * update cycle. The element automatically calls into any registered
     * controllers during its lifecycle callbacks.
     *
     * If the element is connected when `addController()` is called, the
     * controller's `hostConnected()` callback will be immediately called.
     * @category controllers
     */
    addController(controller) {
        (this.__controllers ??= new Set()).add(controller);
        // If a controller is added after the element has been connected,
        // call hostConnected. Note, re-using existence of `renderRoot` here
        // (which is set in connectedCallback) to avoid the need to track a
        // first connected state.
        if (this.renderRoot !== undefined && this.isConnected) {
            controller.hostConnected?.();
        }
    }
    /**
     * Removes a `ReactiveController` from the element.
     * @category controllers
     */
    removeController(controller) {
        this.__controllers?.delete(controller);
    }
    /**
     * Fixes any properties set on the instance before upgrade time.
     * Otherwise these would shadow the accessor and break these properties.
     * The properties are stored in a Map which is played back after the
     * constructor runs.
     */
    __saveInstanceProperties() {
        const instanceProperties = new Map();
        const elementProperties = this.constructor
            .elementProperties;
        for (const p of elementProperties.keys()) {
            if (this.hasOwnProperty(p)) {
                instanceProperties.set(p, this[p]);
                delete this[p];
            }
        }
        if (instanceProperties.size > 0) {
            this.__instanceProperties = instanceProperties;
        }
    }
    /**
     * Returns the node into which the element should render and by default
     * creates and returns an open shadowRoot. Implement to customize where the
     * element's DOM is rendered. For example, to render into the element's
     * childNodes, return `this`.
     *
     * @return Returns a node into which to render.
     * @category rendering
     */
    createRenderRoot() {
        const renderRoot = this.shadowRoot ??
            this.attachShadow(this.constructor.shadowRootOptions);
        (0,_css_tag_js__WEBPACK_IMPORTED_MODULE_0__.adoptStyles)(renderRoot, this.constructor.elementStyles);
        return renderRoot;
    }
    /**
     * On first connection, creates the element's renderRoot, sets up
     * element styling, and enables updating.
     * @category lifecycle
     */
    connectedCallback() {
        // Create renderRoot before controllers `hostConnected`
        this.renderRoot ??=
            this.createRenderRoot();
        this.enableUpdating(true);
        this.__controllers?.forEach((c) => c.hostConnected?.());
    }
    /**
     * Note, this method should be considered final and not overridden. It is
     * overridden on the element instance with a function that triggers the first
     * update.
     * @category updates
     */
    enableUpdating(_requestedUpdate) { }
    /**
     * Allows for `super.disconnectedCallback()` in extensions while
     * reserving the possibility of making non-breaking feature additions
     * when disconnecting at some point in the future.
     * @category lifecycle
     */
    disconnectedCallback() {
        this.__controllers?.forEach((c) => c.hostDisconnected?.());
    }
    /**
     * Synchronizes property values when attributes change.
     *
     * Specifically, when an attribute is set, the corresponding property is set.
     * You should rarely need to implement this callback. If this method is
     * overridden, `super.attributeChangedCallback(name, _old, value)` must be
     * called.
     *
     * See [responding to attribute changes](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#responding_to_attribute_changes)
     * on MDN for more information about the `attributeChangedCallback`.
     * @category attributes
     */
    attributeChangedCallback(name, _old, value) {
        this._$attributeToProperty(name, value);
    }
    __propertyToAttribute(name, value) {
        const elemProperties = this.constructor.elementProperties;
        const options = elemProperties.get(name);
        const attr = this.constructor.__attributeNameForProperty(name, options);
        if (attr !== undefined && options.reflect === true) {
            const converter = options.converter?.toAttribute !==
                undefined
                ? options.converter
                : defaultConverter;
            const attrValue = converter.toAttribute(value, options.type);
            if (DEV_MODE &&
                this.constructor.enabledWarnings.includes('migration') &&
                attrValue === undefined) {
                issueWarning('undefined-attribute-value', `The attribute value for the ${name} property is ` +
                    `undefined on element ${this.localName}. The attribute will be ` +
                    `removed, but in the previous version of \`ReactiveElement\`, ` +
                    `the attribute would not have changed.`);
            }
            // Track if the property is being reflected to avoid
            // setting the property again via `attributeChangedCallback`. Note:
            // 1. this takes advantage of the fact that the callback is synchronous.
            // 2. will behave incorrectly if multiple attributes are in the reaction
            // stack at time of calling. However, since we process attributes
            // in `update` this should not be possible (or an extreme corner case
            // that we'd like to discover).
            // mark state reflecting
            this.__reflectingProperty = name;
            if (attrValue == null) {
                this.removeAttribute(attr);
            }
            else {
                this.setAttribute(attr, attrValue);
            }
            // mark state not reflecting
            this.__reflectingProperty = null;
        }
    }
    /** @internal */
    _$attributeToProperty(name, value) {
        const ctor = this.constructor;
        // Note, hint this as an `AttributeMap` so closure clearly understands
        // the type; it has issues with tracking types through statics
        const propName = ctor.__attributeToPropertyMap.get(name);
        // Use tracking info to avoid reflecting a property value to an attribute
        // if it was just set because the attribute changed.
        if (propName !== undefined && this.__reflectingProperty !== propName) {
            const options = ctor.getPropertyOptions(propName);
            const converter = typeof options.converter === 'function'
                ? { fromAttribute: options.converter }
                : options.converter?.fromAttribute !== undefined
                    ? options.converter
                    : defaultConverter;
            // mark state reflecting
            this.__reflectingProperty = propName;
            this[propName] =
                converter.fromAttribute(value, options.type) ??
                    this.__defaultValues?.get(propName) ??
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    null;
            // mark state not reflecting
            this.__reflectingProperty = null;
        }
    }
    /**
     * Requests an update which is processed asynchronously. This should be called
     * when an element should update based on some state not triggered by setting
     * a reactive property. In this case, pass no arguments. It should also be
     * called when manually implementing a property setter. In this case, pass the
     * property `name` and `oldValue` to ensure that any configured property
     * options are honored.
     *
     * @param name name of requesting property
     * @param oldValue old value of requesting property
     * @param options property options to use instead of the previously
     *     configured options
     * @category updates
     */
    requestUpdate(name, oldValue, options) {
        // If we have a property key, perform property update steps.
        if (name !== undefined) {
            if (DEV_MODE && name instanceof Event) {
                issueWarning(``, `The requestUpdate() method was called with an Event as the property name. This is probably a mistake caused by binding this.requestUpdate as an event listener. Instead bind a function that will call it with no arguments: () => this.requestUpdate()`);
            }
            const ctor = this.constructor;
            const newValue = this[name];
            options ??= ctor.getPropertyOptions(name);
            const changed = (options.hasChanged ?? notEqual)(newValue, oldValue) ||
                // When there is no change, check a corner case that can occur when
                // 1. there's a initial value which was not reflected
                // 2. the property is subsequently set to this value.
                // For example, `prop: {useDefault: true, reflect: true}`
                // and el.prop = 'foo'. This should be considered a change if the
                // attribute is not set because we will now reflect the property to the attribute.
                (options.useDefault &&
                    options.reflect &&
                    newValue === this.__defaultValues?.get(name) &&
                    !this.hasAttribute(ctor.__attributeNameForProperty(name, options)));
            if (changed) {
                this._$changeProperty(name, oldValue, options);
            }
            else {
                // Abort the request if the property should not be considered changed.
                return;
            }
        }
        if (this.isUpdatePending === false) {
            this.__updatePromise = this.__enqueueUpdate();
        }
    }
    /**
     * @internal
     */
    _$changeProperty(name, oldValue, { useDefault, reflect, wrapped }, initializeValue) {
        // Record default value when useDefault is used. This allows us to
        // restore this value when the attribute is removed.
        if (useDefault && !(this.__defaultValues ??= new Map()).has(name)) {
            this.__defaultValues.set(name, initializeValue ?? oldValue ?? this[name]);
            // if this is not wrapping an accessor, it must be an initial setting
            // and in this case we do not want to record the change or reflect.
            if (wrapped !== true || initializeValue !== undefined) {
                return;
            }
        }
        // TODO (justinfagnani): Create a benchmark of Map.has() + Map.set(
        // vs just Map.set()
        if (!this._$changedProperties.has(name)) {
            // On the initial change, the old value should be `undefined`, except
            // with `useDefault`
            if (!this.hasUpdated && !useDefault) {
                oldValue = undefined;
            }
            this._$changedProperties.set(name, oldValue);
        }
        // Add to reflecting properties set.
        // Note, it's important that every change has a chance to add the
        // property to `__reflectingProperties`. This ensures setting
        // attribute + property reflects correctly.
        if (reflect === true && this.__reflectingProperty !== name) {
            (this.__reflectingProperties ??= new Set()).add(name);
        }
    }
    /**
     * Sets up the element to asynchronously update.
     */
    async __enqueueUpdate() {
        this.isUpdatePending = true;
        try {
            // Ensure any previous update has resolved before updating.
            // This `await` also ensures that property changes are batched.
            await this.__updatePromise;
        }
        catch (e) {
            // Refire any previous errors async so they do not disrupt the update
            // cycle. Errors are refired so developers have a chance to observe
            // them, and this can be done by implementing
            // `window.onunhandledrejection`.
            Promise.reject(e);
        }
        const result = this.scheduleUpdate();
        // If `scheduleUpdate` returns a Promise, we await it. This is done to
        // enable coordinating updates with a scheduler. Note, the result is
        // checked to avoid delaying an additional microtask unless we need to.
        if (result != null) {
            await result;
        }
        return !this.isUpdatePending;
    }
    /**
     * Schedules an element update. You can override this method to change the
     * timing of updates by returning a Promise. The update will await the
     * returned Promise, and you should resolve the Promise to allow the update
     * to proceed. If this method is overridden, `super.scheduleUpdate()`
     * must be called.
     *
     * For instance, to schedule updates to occur just before the next frame:
     *
     * ```ts
     * override protected async scheduleUpdate(): Promise<unknown> {
     *   await new Promise((resolve) => requestAnimationFrame(() => resolve()));
     *   super.scheduleUpdate();
     * }
     * ```
     * @category updates
     */
    scheduleUpdate() {
        const result = this.performUpdate();
        if (DEV_MODE &&
            this.constructor.enabledWarnings.includes('async-perform-update') &&
            typeof result?.then ===
                'function') {
            issueWarning('async-perform-update', `Element ${this.localName} returned a Promise from performUpdate(). ` +
                `This behavior is deprecated and will be removed in a future ` +
                `version of ReactiveElement.`);
        }
        return result;
    }
    /**
     * Performs an element update. Note, if an exception is thrown during the
     * update, `firstUpdated` and `updated` will not be called.
     *
     * Call `performUpdate()` to immediately process a pending update. This should
     * generally not be needed, but it can be done in rare cases when you need to
     * update synchronously.
     *
     * @category updates
     */
    performUpdate() {
        // Abort any update if one is not pending when this is called.
        // This can happen if `performUpdate` is called early to "flush"
        // the update.
        if (!this.isUpdatePending) {
            return;
        }
        debugLogEvent?.({ kind: 'update' });
        if (!this.hasUpdated) {
            // Create renderRoot before first update. This occurs in `connectedCallback`
            // but is done here to support out of tree calls to `enableUpdating`/`performUpdate`.
            this.renderRoot ??=
                this.createRenderRoot();
            if (DEV_MODE) {
                // Produce warning if any reactive properties on the prototype are
                // shadowed by class fields. Instance fields set before upgrade are
                // deleted by this point, so any own property is caused by class field
                // initialization in the constructor.
                const ctor = this.constructor;
                const shadowedProperties = [...ctor.elementProperties.keys()].filter((p) => this.hasOwnProperty(p) && p in getPrototypeOf(this));
                if (shadowedProperties.length) {
                    throw new Error(`The following properties on element ${this.localName} will not ` +
                        `trigger updates as expected because they are set using class ` +
                        `fields: ${shadowedProperties.join(', ')}. ` +
                        `Native class fields and some compiled output will overwrite ` +
                        `accessors used for detecting changes. See ` +
                        `https://lit.dev/msg/class-field-shadowing ` +
                        `for more information.`);
                }
            }
            // Mixin instance properties once, if they exist.
            if (this.__instanceProperties) {
                // TODO (justinfagnani): should we use the stored value? Could a new value
                // have been set since we stored the own property value?
                for (const [p, value] of this.__instanceProperties) {
                    this[p] = value;
                }
                this.__instanceProperties = undefined;
            }
            // Trigger initial value reflection and populate the initial
            // `changedProperties` map, but only for the case of properties created
            // via `createProperty` on accessors, which will not have already
            // populated the `changedProperties` map since they are not set.
            // We can't know if these accessors had initializers, so we just set
            // them anyway - a difference from experimental decorators on fields and
            // standard decorators on auto-accessors.
            // For context see:
            // https://github.com/lit/lit/pull/4183#issuecomment-1711959635
            const elementProperties = this.constructor
                .elementProperties;
            if (elementProperties.size > 0) {
                for (const [p, options] of elementProperties) {
                    const { wrapped } = options;
                    const value = this[p];
                    if (wrapped === true &&
                        !this._$changedProperties.has(p) &&
                        value !== undefined) {
                        this._$changeProperty(p, undefined, options, value);
                    }
                }
            }
        }
        let shouldUpdate = false;
        const changedProperties = this._$changedProperties;
        try {
            shouldUpdate = this.shouldUpdate(changedProperties);
            if (shouldUpdate) {
                this.willUpdate(changedProperties);
                this.__controllers?.forEach((c) => c.hostUpdate?.());
                this.update(changedProperties);
            }
            else {
                this.__markUpdated();
            }
        }
        catch (e) {
            // Prevent `firstUpdated` and `updated` from running when there's an
            // update exception.
            shouldUpdate = false;
            // Ensure element can accept additional updates after an exception.
            this.__markUpdated();
            throw e;
        }
        // The update is no longer considered pending and further updates are now allowed.
        if (shouldUpdate) {
            this._$didUpdate(changedProperties);
        }
    }
    /**
     * Invoked before `update()` to compute values needed during the update.
     *
     * Implement `willUpdate` to compute property values that depend on other
     * properties and are used in the rest of the update process.
     *
     * ```ts
     * willUpdate(changedProperties) {
     *   // only need to check changed properties for an expensive computation.
     *   if (changedProperties.has('firstName') || changedProperties.has('lastName')) {
     *     this.sha = computeSHA(`${this.firstName} ${this.lastName}`);
     *   }
     * }
     *
     * render() {
     *   return html`SHA: ${this.sha}`;
     * }
     * ```
     *
     * @category updates
     */
    willUpdate(_changedProperties) { }
    // Note, this is an override point for polyfill-support.
    // @internal
    _$didUpdate(changedProperties) {
        this.__controllers?.forEach((c) => c.hostUpdated?.());
        if (!this.hasUpdated) {
            this.hasUpdated = true;
            this.firstUpdated(changedProperties);
        }
        this.updated(changedProperties);
        if (DEV_MODE &&
            this.isUpdatePending &&
            this.constructor.enabledWarnings.includes('change-in-update')) {
            issueWarning('change-in-update', `Element ${this.localName} scheduled an update ` +
                `(generally because a property was set) ` +
                `after an update completed, causing a new update to be scheduled. ` +
                `This is inefficient and should be avoided unless the next update ` +
                `can only be scheduled as a side effect of the previous update.`);
        }
    }
    __markUpdated() {
        this._$changedProperties = new Map();
        this.isUpdatePending = false;
    }
    /**
     * Returns a Promise that resolves when the element has completed updating.
     * The Promise value is a boolean that is `true` if the element completed the
     * update without triggering another update. The Promise result is `false` if
     * a property was set inside `updated()`. If the Promise is rejected, an
     * exception was thrown during the update.
     *
     * To await additional asynchronous work, override the `getUpdateComplete`
     * method. For example, it is sometimes useful to await a rendered element
     * before fulfilling this Promise. To do this, first await
     * `super.getUpdateComplete()`, then any subsequent state.
     *
     * @return A promise of a boolean that resolves to true if the update completed
     *     without triggering another update.
     * @category updates
     */
    get updateComplete() {
        return this.getUpdateComplete();
    }
    /**
     * Override point for the `updateComplete` promise.
     *
     * It is not safe to override the `updateComplete` getter directly due to a
     * limitation in TypeScript which means it is not possible to call a
     * superclass getter (e.g. `super.updateComplete.then(...)`) when the target
     * language is ES5 (https://github.com/microsoft/TypeScript/issues/338).
     * This method should be overridden instead. For example:
     *
     * ```ts
     * class MyElement extends LitElement {
     *   override async getUpdateComplete() {
     *     const result = await super.getUpdateComplete();
     *     await this._myChild.updateComplete;
     *     return result;
     *   }
     * }
     * ```
     *
     * @return A promise of a boolean that resolves to true if the update completed
     *     without triggering another update.
     * @category updates
     */
    getUpdateComplete() {
        return this.__updatePromise;
    }
    /**
     * Controls whether or not `update()` should be called when the element requests
     * an update. By default, this method always returns `true`, but this can be
     * customized to control when to update.
     *
     * @param _changedProperties Map of changed properties with old values
     * @category updates
     */
    shouldUpdate(_changedProperties) {
        return true;
    }
    /**
     * Updates the element. This method reflects property values to attributes.
     * It can be overridden to render and keep updated element DOM.
     * Setting properties inside this method will *not* trigger
     * another update.
     *
     * @param _changedProperties Map of changed properties with old values
     * @category updates
     */
    update(_changedProperties) {
        // The forEach() expression will only run when __reflectingProperties is
        // defined, and it returns undefined, setting __reflectingProperties to
        // undefined
        this.__reflectingProperties &&= this.__reflectingProperties.forEach((p) => this.__propertyToAttribute(p, this[p]));
        this.__markUpdated();
    }
    /**
     * Invoked whenever the element is updated. Implement to perform
     * post-updating tasks via DOM APIs, for example, focusing an element.
     *
     * Setting properties inside this method will trigger the element to update
     * again after this update cycle completes.
     *
     * @param _changedProperties Map of changed properties with old values
     * @category updates
     */
    updated(_changedProperties) { }
    /**
     * Invoked when the element is first updated. Implement to perform one time
     * work on the element after update.
     *
     * ```ts
     * firstUpdated() {
     *   this.renderRoot.getElementById('my-text-area').focus();
     * }
     * ```
     *
     * Setting properties inside this method will trigger the element to update
     * again after this update cycle completes.
     *
     * @param _changedProperties Map of changed properties with old values
     * @category updates
     */
    firstUpdated(_changedProperties) { }
}
/**
 * Memoized list of all element styles.
 * Created lazily on user subclasses when finalizing the class.
 * @nocollapse
 * @category styles
 */
ReactiveElement.elementStyles = [];
/**
 * Options used when calling `attachShadow`. Set this property to customize
 * the options for the shadowRoot; for example, to create a closed
 * shadowRoot: `{mode: 'closed'}`.
 *
 * Note, these options are used in `createRenderRoot`. If this method
 * is customized, options should be respected if possible.
 * @nocollapse
 * @category rendering
 */
ReactiveElement.shadowRootOptions = { mode: 'open' };
// Assigned here to work around a jscompiler bug with static fields
// when compiling to ES5.
// https://github.com/google/closure-compiler/issues/3177
ReactiveElement[JSCompiler_renameProperty('elementProperties', ReactiveElement)] = new Map();
ReactiveElement[JSCompiler_renameProperty('finalized', ReactiveElement)] = new Map();
// Apply polyfills if available
polyfillSupport?.({ ReactiveElement });
// Dev mode warnings...
if (DEV_MODE) {
    // Default warning set.
    ReactiveElement.enabledWarnings = [
        'change-in-update',
        'async-perform-update',
    ];
    const ensureOwnWarnings = function (ctor) {
        if (!ctor.hasOwnProperty(JSCompiler_renameProperty('enabledWarnings', ctor))) {
            ctor.enabledWarnings = ctor.enabledWarnings.slice();
        }
    };
    ReactiveElement.enableWarning = function (warning) {
        ensureOwnWarnings(this);
        if (!this.enabledWarnings.includes(warning)) {
            this.enabledWarnings.push(warning);
        }
    };
    ReactiveElement.disableWarning = function (warning) {
        ensureOwnWarnings(this);
        const i = this.enabledWarnings.indexOf(warning);
        if (i >= 0) {
            this.enabledWarnings.splice(i, 1);
        }
    };
}
// IMPORTANT: do not change the property name or the assignment expression.
// This line will be used in regexes to search for ReactiveElement usage.
(global.reactiveElementVersions ??= []).push('2.1.0');
if (DEV_MODE && global.reactiveElementVersions.length > 1) {
    queueMicrotask(() => {
        issueWarning('multiple-versions', `Multiple versions of Lit loaded. Loading multiple versions ` +
            `is not recommended.`);
    });
}
//# sourceMappingURL=reactive-element.js.map

/***/ }),

/***/ "./node_modules/ansi-html-community/index.js":
/*!***************************************************!*\
  !*** ./node_modules/ansi-html-community/index.js ***!
  \***************************************************/
/***/ ((module) => {

"use strict";


module.exports = ansiHTML

// Reference to https://github.com/sindresorhus/ansi-regex
var _regANSI = /(?:(?:\u001b\[)|\u009b)(?:(?:[0-9]{1,3})?(?:(?:;[0-9]{0,3})*)?[A-M|f-m])|\u001b[A-M]/

var _defColors = {
  reset: ['fff', '000'], // [FOREGROUD_COLOR, BACKGROUND_COLOR]
  black: '000',
  red: 'ff0000',
  green: '209805',
  yellow: 'e8bf03',
  blue: '0000ff',
  magenta: 'ff00ff',
  cyan: '00ffee',
  lightgrey: 'f0f0f0',
  darkgrey: '888'
}
var _styles = {
  30: 'black',
  31: 'red',
  32: 'green',
  33: 'yellow',
  34: 'blue',
  35: 'magenta',
  36: 'cyan',
  37: 'lightgrey'
}
var _openTags = {
  '1': 'font-weight:bold', // bold
  '2': 'opacity:0.5', // dim
  '3': '<i>', // italic
  '4': '<u>', // underscore
  '8': 'display:none', // hidden
  '9': '<del>' // delete
}
var _closeTags = {
  '23': '</i>', // reset italic
  '24': '</u>', // reset underscore
  '29': '</del>' // reset delete
}

;[0, 21, 22, 27, 28, 39, 49].forEach(function (n) {
  _closeTags[n] = '</span>'
})

/**
 * Converts text with ANSI color codes to HTML markup.
 * @param {String} text
 * @returns {*}
 */
function ansiHTML (text) {
  // Returns the text if the string has no ANSI escape code.
  if (!_regANSI.test(text)) {
    return text
  }

  // Cache opened sequence.
  var ansiCodes = []
  // Replace with markup.
  var ret = text.replace(/\033\[(\d+)m/g, function (match, seq) {
    var ot = _openTags[seq]
    if (ot) {
      // If current sequence has been opened, close it.
      if (!!~ansiCodes.indexOf(seq)) { // eslint-disable-line no-extra-boolean-cast
        ansiCodes.pop()
        return '</span>'
      }
      // Open tag.
      ansiCodes.push(seq)
      return ot[0] === '<' ? ot : '<span style="' + ot + ';">'
    }

    var ct = _closeTags[seq]
    if (ct) {
      // Pop sequence
      ansiCodes.pop()
      return ct
    }
    return ''
  })

  // Make sure tags are closed.
  var l = ansiCodes.length
  ;(l > 0) && (ret += Array(l + 1).join('</span>'))

  return ret
}

/**
 * Customize colors.
 * @param {Object} colors reference to _defColors
 */
ansiHTML.setColors = function (colors) {
  if (typeof colors !== 'object') {
    throw new Error('`colors` parameter must be an Object.')
  }

  var _finalColors = {}
  for (var key in _defColors) {
    var hex = colors.hasOwnProperty(key) ? colors[key] : null
    if (!hex) {
      _finalColors[key] = _defColors[key]
      continue
    }
    if ('reset' === key) {
      if (typeof hex === 'string') {
        hex = [hex]
      }
      if (!Array.isArray(hex) || hex.length === 0 || hex.some(function (h) {
        return typeof h !== 'string'
      })) {
        throw new Error('The value of `' + key + '` property must be an Array and each item could only be a hex string, e.g.: FF0000')
      }
      var defHexColor = _defColors[key]
      if (!hex[0]) {
        hex[0] = defHexColor[0]
      }
      if (hex.length === 1 || !hex[1]) {
        hex = [hex[0]]
        hex.push(defHexColor[1])
      }

      hex = hex.slice(0, 2)
    } else if (typeof hex !== 'string') {
      throw new Error('The value of `' + key + '` property must be a hex string, e.g.: FF0000')
    }
    _finalColors[key] = hex
  }
  _setTags(_finalColors)
}

/**
 * Reset colors.
 */
ansiHTML.reset = function () {
  _setTags(_defColors)
}

/**
 * Expose tags, including open and close.
 * @type {Object}
 */
ansiHTML.tags = {}

if (Object.defineProperty) {
  Object.defineProperty(ansiHTML.tags, 'open', {
    get: function () { return _openTags }
  })
  Object.defineProperty(ansiHTML.tags, 'close', {
    get: function () { return _closeTags }
  })
} else {
  ansiHTML.tags.open = _openTags
  ansiHTML.tags.close = _closeTags
}

function _setTags (colors) {
  // reset all
  _openTags['0'] = 'font-weight:normal;opacity:1;color:#' + colors.reset[0] + ';background:#' + colors.reset[1]
  // inverse
  _openTags['7'] = 'color:#' + colors.reset[1] + ';background:#' + colors.reset[0]
  // dark grey
  _openTags['90'] = 'color:#' + colors.darkgrey

  for (var code in _styles) {
    var color = _styles[code]
    var oriColor = colors[color] || '000'
    _openTags[code] = 'color:#' + oriColor
    code = parseInt(code)
    _openTags[(code + 10).toString()] = 'background:#' + oriColor
  }
}

ansiHTML.reset()


/***/ }),

/***/ "./node_modules/events/events.js":
/*!***************************************!*\
  !*** ./node_modules/events/events.js ***!
  \***************************************/
/***/ ((module) => {

"use strict";
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


/***/ }),

/***/ "./node_modules/lit-element/development/lit-element.js":
/*!*************************************************************!*\
  !*** ./node_modules/lit-element/development/lit-element.js ***!
  \*************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CSSResult: () => (/* reexport safe */ _lit_reactive_element__WEBPACK_IMPORTED_MODULE_0__.CSSResult),
/* harmony export */   LitElement: () => (/* binding */ LitElement),
/* harmony export */   ReactiveElement: () => (/* reexport safe */ _lit_reactive_element__WEBPACK_IMPORTED_MODULE_0__.ReactiveElement),
/* harmony export */   _$LE: () => (/* binding */ _$LE),
/* harmony export */   _$LH: () => (/* reexport safe */ lit_html__WEBPACK_IMPORTED_MODULE_1__._$LH),
/* harmony export */   adoptStyles: () => (/* reexport safe */ _lit_reactive_element__WEBPACK_IMPORTED_MODULE_0__.adoptStyles),
/* harmony export */   css: () => (/* reexport safe */ _lit_reactive_element__WEBPACK_IMPORTED_MODULE_0__.css),
/* harmony export */   defaultConverter: () => (/* reexport safe */ _lit_reactive_element__WEBPACK_IMPORTED_MODULE_0__.defaultConverter),
/* harmony export */   getCompatibleStyle: () => (/* reexport safe */ _lit_reactive_element__WEBPACK_IMPORTED_MODULE_0__.getCompatibleStyle),
/* harmony export */   html: () => (/* reexport safe */ lit_html__WEBPACK_IMPORTED_MODULE_1__.html),
/* harmony export */   mathml: () => (/* reexport safe */ lit_html__WEBPACK_IMPORTED_MODULE_1__.mathml),
/* harmony export */   noChange: () => (/* reexport safe */ lit_html__WEBPACK_IMPORTED_MODULE_1__.noChange),
/* harmony export */   notEqual: () => (/* reexport safe */ _lit_reactive_element__WEBPACK_IMPORTED_MODULE_0__.notEqual),
/* harmony export */   nothing: () => (/* reexport safe */ lit_html__WEBPACK_IMPORTED_MODULE_1__.nothing),
/* harmony export */   render: () => (/* reexport safe */ lit_html__WEBPACK_IMPORTED_MODULE_1__.render),
/* harmony export */   supportsAdoptingStyleSheets: () => (/* reexport safe */ _lit_reactive_element__WEBPACK_IMPORTED_MODULE_0__.supportsAdoptingStyleSheets),
/* harmony export */   svg: () => (/* reexport safe */ lit_html__WEBPACK_IMPORTED_MODULE_1__.svg),
/* harmony export */   unsafeCSS: () => (/* reexport safe */ _lit_reactive_element__WEBPACK_IMPORTED_MODULE_0__.unsafeCSS)
/* harmony export */ });
/* harmony import */ var _lit_reactive_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @lit/reactive-element */ "./node_modules/@lit/reactive-element/development/reactive-element.js");
/* harmony import */ var lit_html__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lit-html */ "./node_modules/lit-html/development/lit-html.js");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
/**
 * The main LitElement module, which defines the {@linkcode LitElement} base
 * class and related APIs.
 *
 * LitElement components can define a template and a set of observed
 * properties. Changing an observed property triggers a re-render of the
 * element.
 *
 * Import {@linkcode LitElement} and {@linkcode html} from this module to
 * create a component:
 *
 *  ```js
 * import {LitElement, html} from 'lit-element';
 *
 * class MyElement extends LitElement {
 *
 *   // Declare observed properties
 *   static get properties() {
 *     return {
 *       adjective: {}
 *     }
 *   }
 *
 *   constructor() {
 *     this.adjective = 'awesome';
 *   }
 *
 *   // Define the element's template
 *   render() {
 *     return html`<p>your ${adjective} template here</p>`;
 *   }
 * }
 *
 * customElements.define('my-element', MyElement);
 * ```
 *
 * `LitElement` extends {@linkcode ReactiveElement} and adds lit-html
 * templating. The `ReactiveElement` class is provided for users that want to
 * build their own custom element base classes that don't use lit-html.
 *
 * @packageDocumentation
 */




/*
 * When using Closure Compiler, JSCompiler_renameProperty(property, object) is
 * replaced at compile time by the munged name for object[property]. We cannot
 * alias this function, so we have to use a small shim that has the same
 * behavior when not compiling.
 */
/*@__INLINE__*/
const JSCompiler_renameProperty = (prop, _obj) => prop;
const DEV_MODE = true;
// Allows minifiers to rename references to globalThis
const global = globalThis;
let issueWarning;
if (DEV_MODE) {
    // Ensure warnings are issued only 1x, even if multiple versions of Lit
    // are loaded.
    global.litIssuedWarnings ??= new Set();
    /**
     * Issue a warning if we haven't already, based either on `code` or `warning`.
     * Warnings are disabled automatically only by `warning`; disabling via `code`
     * can be done by users.
     */
    issueWarning = (code, warning) => {
        warning += ` See https://lit.dev/msg/${code} for more information.`;
        if (!global.litIssuedWarnings.has(warning) &&
            !global.litIssuedWarnings.has(code)) {
            console.warn(warning);
            global.litIssuedWarnings.add(warning);
        }
    };
}
/**
 * Base element class that manages element properties and attributes, and
 * renders a lit-html template.
 *
 * To define a component, subclass `LitElement` and implement a
 * `render` method to provide the component's template. Define properties
 * using the {@linkcode LitElement.properties properties} property or the
 * {@linkcode property} decorator.
 */
class LitElement extends _lit_reactive_element__WEBPACK_IMPORTED_MODULE_0__.ReactiveElement {
    constructor() {
        super(...arguments);
        /**
         * @category rendering
         */
        this.renderOptions = { host: this };
        this.__childPart = undefined;
    }
    /**
     * @category rendering
     */
    createRenderRoot() {
        const renderRoot = super.createRenderRoot();
        // When adoptedStyleSheets are shimmed, they are inserted into the
        // shadowRoot by createRenderRoot. Adjust the renderBefore node so that
        // any styles in Lit content render before adoptedStyleSheets. This is
        // important so that adoptedStyleSheets have precedence over styles in
        // the shadowRoot.
        this.renderOptions.renderBefore ??= renderRoot.firstChild;
        return renderRoot;
    }
    /**
     * Updates the element. This method reflects property values to attributes
     * and calls `render` to render DOM via lit-html. Setting properties inside
     * this method will *not* trigger another update.
     * @param changedProperties Map of changed properties with old values
     * @category updates
     */
    update(changedProperties) {
        // Setting properties in `render` should not trigger an update. Since
        // updates are allowed after super.update, it's important to call `render`
        // before that.
        const value = this.render();
        if (!this.hasUpdated) {
            this.renderOptions.isConnected = this.isConnected;
        }
        super.update(changedProperties);
        this.__childPart = (0,lit_html__WEBPACK_IMPORTED_MODULE_1__.render)(value, this.renderRoot, this.renderOptions);
    }
    /**
     * Invoked when the component is added to the document's DOM.
     *
     * In `connectedCallback()` you should setup tasks that should only occur when
     * the element is connected to the document. The most common of these is
     * adding event listeners to nodes external to the element, like a keydown
     * event handler added to the window.
     *
     * ```ts
     * connectedCallback() {
     *   super.connectedCallback();
     *   addEventListener('keydown', this._handleKeydown);
     * }
     * ```
     *
     * Typically, anything done in `connectedCallback()` should be undone when the
     * element is disconnected, in `disconnectedCallback()`.
     *
     * @category lifecycle
     */
    connectedCallback() {
        super.connectedCallback();
        this.__childPart?.setConnected(true);
    }
    /**
     * Invoked when the component is removed from the document's DOM.
     *
     * This callback is the main signal to the element that it may no longer be
     * used. `disconnectedCallback()` should ensure that nothing is holding a
     * reference to the element (such as event listeners added to nodes external
     * to the element), so that it is free to be garbage collected.
     *
     * ```ts
     * disconnectedCallback() {
     *   super.disconnectedCallback();
     *   window.removeEventListener('keydown', this._handleKeydown);
     * }
     * ```
     *
     * An element may be re-connected after being disconnected.
     *
     * @category lifecycle
     */
    disconnectedCallback() {
        super.disconnectedCallback();
        this.__childPart?.setConnected(false);
    }
    /**
     * Invoked on each update to perform rendering tasks. This method may return
     * any value renderable by lit-html's `ChildPart` - typically a
     * `TemplateResult`. Setting properties inside this method will *not* trigger
     * the element to update.
     * @category rendering
     */
    render() {
        return lit_html__WEBPACK_IMPORTED_MODULE_1__.noChange;
    }
}
// This property needs to remain unminified.
LitElement['_$litElement$'] = true;
/**
 * Ensure this class is marked as `finalized` as an optimization ensuring
 * it will not needlessly try to `finalize`.
 *
 * Note this property name is a string to prevent breaking Closure JS Compiler
 * optimizations. See @lit/reactive-element for more information.
 */
LitElement[JSCompiler_renameProperty('finalized', LitElement)] = true;
// Install hydration if available
global.litElementHydrateSupport?.({ LitElement });
// Apply polyfills if available
const polyfillSupport = DEV_MODE
    ? global.litElementPolyfillSupportDevMode
    : global.litElementPolyfillSupport;
polyfillSupport?.({ LitElement });
/**
 * END USERS SHOULD NOT RELY ON THIS OBJECT.
 *
 * Private exports for use by other Lit packages, not intended for use by
 * external users.
 *
 * We currently do not make a mangled rollup build of the lit-ssr code. In order
 * to keep a number of (otherwise private) top-level exports  mangled in the
 * client side code, we export a _$LE object containing those members (or
 * helper methods for accessing private fields of those members), and then
 * re-export them for use in lit-ssr. This keeps lit-ssr agnostic to whether the
 * client-side code is being used in `dev` mode or `prod` mode.
 *
 * This has a unique name, to disambiguate it from private exports in
 * lit-html, since this module re-exports all of lit-html.
 *
 * @private
 */
const _$LE = {
    _$attributeToProperty: (el, name, value) => {
        // eslint-disable-next-line
        el._$attributeToProperty(name, value);
    },
    // eslint-disable-next-line
    _$changedProperties: (el) => el._$changedProperties,
};
// IMPORTANT: do not change the property name or the assignment expression.
// This line will be used in regexes to search for LitElement usage.
(global.litElementVersions ??= []).push('4.2.0');
if (DEV_MODE && global.litElementVersions.length > 1) {
    queueMicrotask(() => {
        issueWarning('multiple-versions', `Multiple versions of Lit loaded. Loading multiple versions ` +
            `is not recommended.`);
    });
}
//# sourceMappingURL=lit-element.js.map

/***/ }),

/***/ "./node_modules/lit-html/development/is-server.js":
/*!********************************************************!*\
  !*** ./node_modules/lit-html/development/is-server.js ***!
  \********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   isServer: () => (/* binding */ isServer)
/* harmony export */ });
/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
/**
 * @fileoverview
 *
 * This file exports a boolean const whose value will depend on what environment
 * the module is being imported from.
 */
const NODE_MODE = false;
/**
 * A boolean that will be `true` in server environments like Node, and `false`
 * in browser environments. Note that your server environment or toolchain must
 * support the `"node"` export condition for this to be `true`.
 *
 * This can be used when authoring components to change behavior based on
 * whether or not the component is executing in an SSR context.
 */
const isServer = NODE_MODE;
//# sourceMappingURL=is-server.js.map

/***/ }),

/***/ "./node_modules/lit-html/development/lit-html.js":
/*!*******************************************************!*\
  !*** ./node_modules/lit-html/development/lit-html.js ***!
  \*******************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   _$LH: () => (/* binding */ _$LH),
/* harmony export */   html: () => (/* binding */ html),
/* harmony export */   mathml: () => (/* binding */ mathml),
/* harmony export */   noChange: () => (/* binding */ noChange),
/* harmony export */   nothing: () => (/* binding */ nothing),
/* harmony export */   render: () => (/* binding */ render),
/* harmony export */   svg: () => (/* binding */ svg)
/* harmony export */ });
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const DEV_MODE = true;
const ENABLE_EXTRA_SECURITY_HOOKS = true;
const ENABLE_SHADYDOM_NOPATCH = true;
const NODE_MODE = false;
// Allows minifiers to rename references to globalThis
const global = globalThis;
/**
 * Useful for visualizing and logging insights into what the Lit template system is doing.
 *
 * Compiled out of prod mode builds.
 */
const debugLogEvent = DEV_MODE
    ? (event) => {
        const shouldEmit = global
            .emitLitDebugLogEvents;
        if (!shouldEmit) {
            return;
        }
        global.dispatchEvent(new CustomEvent('lit-debug', {
            detail: event,
        }));
    }
    : undefined;
// Used for connecting beginRender and endRender events when there are nested
// renders when errors are thrown preventing an endRender event from being
// called.
let debugLogRenderId = 0;
let issueWarning;
if (DEV_MODE) {
    global.litIssuedWarnings ??= new Set();
    /**
     * Issue a warning if we haven't already, based either on `code` or `warning`.
     * Warnings are disabled automatically only by `warning`; disabling via `code`
     * can be done by users.
     */
    issueWarning = (code, warning) => {
        warning += code
            ? ` See https://lit.dev/msg/${code} for more information.`
            : '';
        if (!global.litIssuedWarnings.has(warning) &&
            !global.litIssuedWarnings.has(code)) {
            console.warn(warning);
            global.litIssuedWarnings.add(warning);
        }
    };
    queueMicrotask(() => {
        issueWarning('dev-mode', `Lit is in dev mode. Not recommended for production!`);
    });
}
const wrap = ENABLE_SHADYDOM_NOPATCH &&
    global.ShadyDOM?.inUse &&
    global.ShadyDOM?.noPatch === true
    ? global.ShadyDOM.wrap
    : (node) => node;
const trustedTypes = global.trustedTypes;
/**
 * Our TrustedTypePolicy for HTML which is declared using the html template
 * tag function.
 *
 * That HTML is a developer-authored constant, and is parsed with innerHTML
 * before any untrusted expressions have been mixed in. Therefor it is
 * considered safe by construction.
 */
const policy = trustedTypes
    ? trustedTypes.createPolicy('lit-html', {
        createHTML: (s) => s,
    })
    : undefined;
const identityFunction = (value) => value;
const noopSanitizer = (_node, _name, _type) => identityFunction;
/** Sets the global sanitizer factory. */
const setSanitizer = (newSanitizer) => {
    if (!ENABLE_EXTRA_SECURITY_HOOKS) {
        return;
    }
    if (sanitizerFactoryInternal !== noopSanitizer) {
        throw new Error(`Attempted to overwrite existing lit-html security policy.` +
            ` setSanitizeDOMValueFactory should be called at most once.`);
    }
    sanitizerFactoryInternal = newSanitizer;
};
/**
 * Only used in internal tests, not a part of the public API.
 */
const _testOnlyClearSanitizerFactoryDoNotCallOrElse = () => {
    sanitizerFactoryInternal = noopSanitizer;
};
const createSanitizer = (node, name, type) => {
    return sanitizerFactoryInternal(node, name, type);
};
// Added to an attribute name to mark the attribute as bound so we can find
// it easily.
const boundAttributeSuffix = '$lit$';
// This marker is used in many syntactic positions in HTML, so it must be
// a valid element name and attribute name. We don't support dynamic names (yet)
// but this at least ensures that the parse tree is closer to the template
// intention.
const marker = `lit$${Math.random().toFixed(9).slice(2)}$`;
// String used to tell if a comment is a marker comment
const markerMatch = '?' + marker;
// Text used to insert a comment marker node. We use processing instruction
// syntax because it's slightly smaller, but parses as a comment node.
const nodeMarker = `<${markerMatch}>`;
const d = NODE_MODE && global.document === undefined
    ? {
        createTreeWalker() {
            return {};
        },
    }
    : document;
// Creates a dynamic marker. We never have to search for these in the DOM.
const createMarker = () => d.createComment('');
const isPrimitive = (value) => value === null || (typeof value != 'object' && typeof value != 'function');
const isArray = Array.isArray;
const isIterable = (value) => isArray(value) ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    typeof value?.[Symbol.iterator] === 'function';
const SPACE_CHAR = `[ \t\n\f\r]`;
const ATTR_VALUE_CHAR = `[^ \t\n\f\r"'\`<>=]`;
const NAME_CHAR = `[^\\s"'>=/]`;
// These regexes represent the five parsing states that we care about in the
// Template's HTML scanner. They match the *end* of the state they're named
// after.
// Depending on the match, we transition to a new state. If there's no match,
// we stay in the same state.
// Note that the regexes are stateful. We utilize lastIndex and sync it
// across the multiple regexes used. In addition to the five regexes below
// we also dynamically create a regex to find the matching end tags for raw
// text elements.
/**
 * End of text is: `<` followed by:
 *   (comment start) or (tag) or (dynamic tag binding)
 */
const textEndRegex = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
const COMMENT_START = 1;
const TAG_NAME = 2;
const DYNAMIC_TAG_NAME = 3;
const commentEndRegex = /-->/g;
/**
 * Comments not started with <!--, like </{, can be ended by a single `>`
 */
const comment2EndRegex = />/g;
/**
 * The tagEnd regex matches the end of the "inside an opening" tag syntax
 * position. It either matches a `>`, an attribute-like sequence, or the end
 * of the string after a space (attribute-name position ending).
 *
 * See attributes in the HTML spec:
 * https://www.w3.org/TR/html5/syntax.html#elements-attributes
 *
 * " \t\n\f\r" are HTML space characters:
 * https://infra.spec.whatwg.org/#ascii-whitespace
 *
 * So an attribute is:
 *  * The name: any character except a whitespace character, ("), ('), ">",
 *    "=", or "/". Note: this is different from the HTML spec which also excludes control characters.
 *  * Followed by zero or more space characters
 *  * Followed by "="
 *  * Followed by zero or more space characters
 *  * Followed by:
 *    * Any character except space, ('), ("), "<", ">", "=", (`), or
 *    * (") then any non-("), or
 *    * (') then any non-(')
 */
const tagEndRegex = new RegExp(`>|${SPACE_CHAR}(?:(${NAME_CHAR}+)(${SPACE_CHAR}*=${SPACE_CHAR}*(?:${ATTR_VALUE_CHAR}|("|')|))|$)`, 'g');
const ENTIRE_MATCH = 0;
const ATTRIBUTE_NAME = 1;
const SPACES_AND_EQUALS = 2;
const QUOTE_CHAR = 3;
const singleQuoteAttrEndRegex = /'/g;
const doubleQuoteAttrEndRegex = /"/g;
/**
 * Matches the raw text elements.
 *
 * Comments are not parsed within raw text elements, so we need to search their
 * text content for marker strings.
 */
const rawTextElement = /^(?:script|style|textarea|title)$/i;
/** TemplateResult types */
const HTML_RESULT = 1;
const SVG_RESULT = 2;
const MATHML_RESULT = 3;
// TemplatePart types
// IMPORTANT: these must match the values in PartType
const ATTRIBUTE_PART = 1;
const CHILD_PART = 2;
const PROPERTY_PART = 3;
const BOOLEAN_ATTRIBUTE_PART = 4;
const EVENT_PART = 5;
const ELEMENT_PART = 6;
const COMMENT_PART = 7;
/**
 * Generates a template literal tag function that returns a TemplateResult with
 * the given result type.
 */
const tag = (type) => (strings, ...values) => {
    // Warn against templates octal escape sequences
    // We do this here rather than in render so that the warning is closer to the
    // template definition.
    if (DEV_MODE && strings.some((s) => s === undefined)) {
        console.warn('Some template strings are undefined.\n' +
            'This is probably caused by illegal octal escape sequences.');
    }
    if (DEV_MODE) {
        // Import static-html.js results in a circular dependency which g3 doesn't
        // handle. Instead we know that static values must have the field
        // `_$litStatic$`.
        if (values.some((val) => val?.['_$litStatic$'])) {
            issueWarning('', `Static values 'literal' or 'unsafeStatic' cannot be used as values to non-static templates.\n` +
                `Please use the static 'html' tag function. See https://lit.dev/docs/templates/expressions/#static-expressions`);
        }
    }
    return {
        // This property needs to remain unminified.
        ['_$litType$']: type,
        strings,
        values,
    };
};
/**
 * Interprets a template literal as an HTML template that can efficiently
 * render to and update a container.
 *
 * ```ts
 * const header = (title: string) => html`<h1>${title}</h1>`;
 * ```
 *
 * The `html` tag returns a description of the DOM to render as a value. It is
 * lazy, meaning no work is done until the template is rendered. When rendering,
 * if a template comes from the same expression as a previously rendered result,
 * it's efficiently updated instead of replaced.
 */
const html = tag(HTML_RESULT);
/**
 * Interprets a template literal as an SVG fragment that can efficiently render
 * to and update a container.
 *
 * ```ts
 * const rect = svg`<rect width="10" height="10"></rect>`;
 *
 * const myImage = html`
 *   <svg viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
 *     ${rect}
 *   </svg>`;
 * ```
 *
 * The `svg` *tag function* should only be used for SVG fragments, or elements
 * that would be contained **inside** an `<svg>` HTML element. A common error is
 * placing an `<svg>` *element* in a template tagged with the `svg` tag
 * function. The `<svg>` element is an HTML element and should be used within a
 * template tagged with the {@linkcode html} tag function.
 *
 * In LitElement usage, it's invalid to return an SVG fragment from the
 * `render()` method, as the SVG fragment will be contained within the element's
 * shadow root and thus not be properly contained within an `<svg>` HTML
 * element.
 */
const svg = tag(SVG_RESULT);
/**
 * Interprets a template literal as MathML fragment that can efficiently render
 * to and update a container.
 *
 * ```ts
 * const num = mathml`<mn>1</mn>`;
 *
 * const eq = html`
 *   <math>
 *     ${num}
 *   </math>`;
 * ```
 *
 * The `mathml` *tag function* should only be used for MathML fragments, or
 * elements that would be contained **inside** a `<math>` HTML element. A common
 * error is placing a `<math>` *element* in a template tagged with the `mathml`
 * tag function. The `<math>` element is an HTML element and should be used
 * within a template tagged with the {@linkcode html} tag function.
 *
 * In LitElement usage, it's invalid to return an MathML fragment from the
 * `render()` method, as the MathML fragment will be contained within the
 * element's shadow root and thus not be properly contained within a `<math>`
 * HTML element.
 */
const mathml = tag(MATHML_RESULT);
/**
 * A sentinel value that signals that a value was handled by a directive and
 * should not be written to the DOM.
 */
const noChange = Symbol.for('lit-noChange');
/**
 * A sentinel value that signals a ChildPart to fully clear its content.
 *
 * ```ts
 * const button = html`${
 *  user.isAdmin
 *    ? html`<button>DELETE</button>`
 *    : nothing
 * }`;
 * ```
 *
 * Prefer using `nothing` over other falsy values as it provides a consistent
 * behavior between various expression binding contexts.
 *
 * In child expressions, `undefined`, `null`, `''`, and `nothing` all behave the
 * same and render no nodes. In attribute expressions, `nothing` _removes_ the
 * attribute, while `undefined` and `null` will render an empty string. In
 * property expressions `nothing` becomes `undefined`.
 */
const nothing = Symbol.for('lit-nothing');
/**
 * The cache of prepared templates, keyed by the tagged TemplateStringsArray
 * and _not_ accounting for the specific template tag used. This means that
 * template tags cannot be dynamic - they must statically be one of html, svg,
 * or attr. This restriction simplifies the cache lookup, which is on the hot
 * path for rendering.
 */
const templateCache = new WeakMap();
const walker = d.createTreeWalker(d, 129 /* NodeFilter.SHOW_{ELEMENT|COMMENT} */);
let sanitizerFactoryInternal = noopSanitizer;
function trustFromTemplateString(tsa, stringFromTSA) {
    // A security check to prevent spoofing of Lit template results.
    // In the future, we may be able to replace this with Array.isTemplateObject,
    // though we might need to make that check inside of the html and svg
    // functions, because precompiled templates don't come in as
    // TemplateStringArray objects.
    if (!isArray(tsa) || !tsa.hasOwnProperty('raw')) {
        let message = 'invalid template strings array';
        if (DEV_MODE) {
            message = `
          Internal Error: expected template strings to be an array
          with a 'raw' field. Faking a template strings array by
          calling html or svg like an ordinary function is effectively
          the same as calling unsafeHtml and can lead to major security
          issues, e.g. opening your code up to XSS attacks.
          If you're using the html or svg tagged template functions normally
          and still seeing this error, please file a bug at
          https://github.com/lit/lit/issues/new?template=bug_report.md
          and include information about your build tooling, if any.
        `
                .trim()
                .replace(/\n */g, '\n');
        }
        throw new Error(message);
    }
    return policy !== undefined
        ? policy.createHTML(stringFromTSA)
        : stringFromTSA;
}
/**
 * Returns an HTML string for the given TemplateStringsArray and result type
 * (HTML or SVG), along with the case-sensitive bound attribute names in
 * template order. The HTML contains comment markers denoting the `ChildPart`s
 * and suffixes on bound attributes denoting the `AttributeParts`.
 *
 * @param strings template strings array
 * @param type HTML or SVG
 * @return Array containing `[html, attrNames]` (array returned for terseness,
 *     to avoid object fields since this code is shared with non-minified SSR
 *     code)
 */
const getTemplateHtml = (strings, type) => {
    // Insert makers into the template HTML to represent the position of
    // bindings. The following code scans the template strings to determine the
    // syntactic position of the bindings. They can be in text position, where
    // we insert an HTML comment, attribute value position, where we insert a
    // sentinel string and re-write the attribute name, or inside a tag where
    // we insert the sentinel string.
    const l = strings.length - 1;
    // Stores the case-sensitive bound attribute names in the order of their
    // parts. ElementParts are also reflected in this array as undefined
    // rather than a string, to disambiguate from attribute bindings.
    const attrNames = [];
    let html = type === SVG_RESULT ? '<svg>' : type === MATHML_RESULT ? '<math>' : '';
    // When we're inside a raw text tag (not it's text content), the regex
    // will still be tagRegex so we can find attributes, but will switch to
    // this regex when the tag ends.
    let rawTextEndRegex;
    // The current parsing state, represented as a reference to one of the
    // regexes
    let regex = textEndRegex;
    for (let i = 0; i < l; i++) {
        const s = strings[i];
        // The index of the end of the last attribute name. When this is
        // positive at end of a string, it means we're in an attribute value
        // position and need to rewrite the attribute name.
        // We also use a special value of -2 to indicate that we encountered
        // the end of a string in attribute name position.
        let attrNameEndIndex = -1;
        let attrName;
        let lastIndex = 0;
        let match;
        // The conditions in this loop handle the current parse state, and the
        // assignments to the `regex` variable are the state transitions.
        while (lastIndex < s.length) {
            // Make sure we start searching from where we previously left off
            regex.lastIndex = lastIndex;
            match = regex.exec(s);
            if (match === null) {
                break;
            }
            lastIndex = regex.lastIndex;
            if (regex === textEndRegex) {
                if (match[COMMENT_START] === '!--') {
                    regex = commentEndRegex;
                }
                else if (match[COMMENT_START] !== undefined) {
                    // We started a weird comment, like </{
                    regex = comment2EndRegex;
                }
                else if (match[TAG_NAME] !== undefined) {
                    if (rawTextElement.test(match[TAG_NAME])) {
                        // Record if we encounter a raw-text element. We'll switch to
                        // this regex at the end of the tag.
                        rawTextEndRegex = new RegExp(`</${match[TAG_NAME]}`, 'g');
                    }
                    regex = tagEndRegex;
                }
                else if (match[DYNAMIC_TAG_NAME] !== undefined) {
                    if (DEV_MODE) {
                        throw new Error('Bindings in tag names are not supported. Please use static templates instead. ' +
                            'See https://lit.dev/docs/templates/expressions/#static-expressions');
                    }
                    regex = tagEndRegex;
                }
            }
            else if (regex === tagEndRegex) {
                if (match[ENTIRE_MATCH] === '>') {
                    // End of a tag. If we had started a raw-text element, use that
                    // regex
                    regex = rawTextEndRegex ?? textEndRegex;
                    // We may be ending an unquoted attribute value, so make sure we
                    // clear any pending attrNameEndIndex
                    attrNameEndIndex = -1;
                }
                else if (match[ATTRIBUTE_NAME] === undefined) {
                    // Attribute name position
                    attrNameEndIndex = -2;
                }
                else {
                    attrNameEndIndex = regex.lastIndex - match[SPACES_AND_EQUALS].length;
                    attrName = match[ATTRIBUTE_NAME];
                    regex =
                        match[QUOTE_CHAR] === undefined
                            ? tagEndRegex
                            : match[QUOTE_CHAR] === '"'
                                ? doubleQuoteAttrEndRegex
                                : singleQuoteAttrEndRegex;
                }
            }
            else if (regex === doubleQuoteAttrEndRegex ||
                regex === singleQuoteAttrEndRegex) {
                regex = tagEndRegex;
            }
            else if (regex === commentEndRegex || regex === comment2EndRegex) {
                regex = textEndRegex;
            }
            else {
                // Not one of the five state regexes, so it must be the dynamically
                // created raw text regex and we're at the close of that element.
                regex = tagEndRegex;
                rawTextEndRegex = undefined;
            }
        }
        if (DEV_MODE) {
            // If we have a attrNameEndIndex, which indicates that we should
            // rewrite the attribute name, assert that we're in a valid attribute
            // position - either in a tag, or a quoted attribute value.
            console.assert(attrNameEndIndex === -1 ||
                regex === tagEndRegex ||
                regex === singleQuoteAttrEndRegex ||
                regex === doubleQuoteAttrEndRegex, 'unexpected parse state B');
        }
        // We have four cases:
        //  1. We're in text position, and not in a raw text element
        //     (regex === textEndRegex): insert a comment marker.
        //  2. We have a non-negative attrNameEndIndex which means we need to
        //     rewrite the attribute name to add a bound attribute suffix.
        //  3. We're at the non-first binding in a multi-binding attribute, use a
        //     plain marker.
        //  4. We're somewhere else inside the tag. If we're in attribute name
        //     position (attrNameEndIndex === -2), add a sequential suffix to
        //     generate a unique attribute name.
        // Detect a binding next to self-closing tag end and insert a space to
        // separate the marker from the tag end:
        const end = regex === tagEndRegex && strings[i + 1].startsWith('/>') ? ' ' : '';
        html +=
            regex === textEndRegex
                ? s + nodeMarker
                : attrNameEndIndex >= 0
                    ? (attrNames.push(attrName),
                        s.slice(0, attrNameEndIndex) +
                            boundAttributeSuffix +
                            s.slice(attrNameEndIndex)) +
                        marker +
                        end
                    : s + marker + (attrNameEndIndex === -2 ? i : end);
    }
    const htmlResult = html +
        (strings[l] || '<?>') +
        (type === SVG_RESULT ? '</svg>' : type === MATHML_RESULT ? '</math>' : '');
    // Returned as an array for terseness
    return [trustFromTemplateString(strings, htmlResult), attrNames];
};
class Template {
    constructor(
    // This property needs to remain unminified.
    { strings, ['_$litType$']: type }, options) {
        this.parts = [];
        let node;
        let nodeIndex = 0;
        let attrNameIndex = 0;
        const partCount = strings.length - 1;
        const parts = this.parts;
        // Create template element
        const [html, attrNames] = getTemplateHtml(strings, type);
        this.el = Template.createElement(html, options);
        walker.currentNode = this.el.content;
        // Re-parent SVG or MathML nodes into template root
        if (type === SVG_RESULT || type === MATHML_RESULT) {
            const wrapper = this.el.content.firstChild;
            wrapper.replaceWith(...wrapper.childNodes);
        }
        // Walk the template to find binding markers and create TemplateParts
        while ((node = walker.nextNode()) !== null && parts.length < partCount) {
            if (node.nodeType === 1) {
                if (DEV_MODE) {
                    const tag = node.localName;
                    // Warn if `textarea` includes an expression and throw if `template`
                    // does since these are not supported. We do this by checking
                    // innerHTML for anything that looks like a marker. This catches
                    // cases like bindings in textarea there markers turn into text nodes.
                    if (/^(?:textarea|template)$/i.test(tag) &&
                        node.innerHTML.includes(marker)) {
                        const m = `Expressions are not supported inside \`${tag}\` ` +
                            `elements. See https://lit.dev/msg/expression-in-${tag} for more ` +
                            `information.`;
                        if (tag === 'template') {
                            throw new Error(m);
                        }
                        else
                            issueWarning('', m);
                    }
                }
                // TODO (justinfagnani): for attempted dynamic tag names, we don't
                // increment the bindingIndex, and it'll be off by 1 in the element
                // and off by two after it.
                if (node.hasAttributes()) {
                    for (const name of node.getAttributeNames()) {
                        if (name.endsWith(boundAttributeSuffix)) {
                            const realName = attrNames[attrNameIndex++];
                            const value = node.getAttribute(name);
                            const statics = value.split(marker);
                            const m = /([.?@])?(.*)/.exec(realName);
                            parts.push({
                                type: ATTRIBUTE_PART,
                                index: nodeIndex,
                                name: m[2],
                                strings: statics,
                                ctor: m[1] === '.'
                                    ? PropertyPart
                                    : m[1] === '?'
                                        ? BooleanAttributePart
                                        : m[1] === '@'
                                            ? EventPart
                                            : AttributePart,
                            });
                            node.removeAttribute(name);
                        }
                        else if (name.startsWith(marker)) {
                            parts.push({
                                type: ELEMENT_PART,
                                index: nodeIndex,
                            });
                            node.removeAttribute(name);
                        }
                    }
                }
                // TODO (justinfagnani): benchmark the regex against testing for each
                // of the 3 raw text element names.
                if (rawTextElement.test(node.tagName)) {
                    // For raw text elements we need to split the text content on
                    // markers, create a Text node for each segment, and create
                    // a TemplatePart for each marker.
                    const strings = node.textContent.split(marker);
                    const lastIndex = strings.length - 1;
                    if (lastIndex > 0) {
                        node.textContent = trustedTypes
                            ? trustedTypes.emptyScript
                            : '';
                        // Generate a new text node for each literal section
                        // These nodes are also used as the markers for child parts
                        for (let i = 0; i < lastIndex; i++) {
                            node.append(strings[i], createMarker());
                            // Walk past the marker node we just added
                            walker.nextNode();
                            parts.push({ type: CHILD_PART, index: ++nodeIndex });
                        }
                        // Note because this marker is added after the walker's current
                        // node, it will be walked to in the outer loop (and ignored), so
                        // we don't need to adjust nodeIndex here
                        node.append(strings[lastIndex], createMarker());
                    }
                }
            }
            else if (node.nodeType === 8) {
                const data = node.data;
                if (data === markerMatch) {
                    parts.push({ type: CHILD_PART, index: nodeIndex });
                }
                else {
                    let i = -1;
                    while ((i = node.data.indexOf(marker, i + 1)) !== -1) {
                        // Comment node has a binding marker inside, make an inactive part
                        // The binding won't work, but subsequent bindings will
                        parts.push({ type: COMMENT_PART, index: nodeIndex });
                        // Move to the end of the match
                        i += marker.length - 1;
                    }
                }
            }
            nodeIndex++;
        }
        if (DEV_MODE) {
            // If there was a duplicate attribute on a tag, then when the tag is
            // parsed into an element the attribute gets de-duplicated. We can detect
            // this mismatch if we haven't precisely consumed every attribute name
            // when preparing the template. This works because `attrNames` is built
            // from the template string and `attrNameIndex` comes from processing the
            // resulting DOM.
            if (attrNames.length !== attrNameIndex) {
                throw new Error(`Detected duplicate attribute bindings. This occurs if your template ` +
                    `has duplicate attributes on an element tag. For example ` +
                    `"<input ?disabled=\${true} ?disabled=\${false}>" contains a ` +
                    `duplicate "disabled" attribute. The error was detected in ` +
                    `the following template: \n` +
                    '`' +
                    strings.join('${...}') +
                    '`');
            }
        }
        // We could set walker.currentNode to another node here to prevent a memory
        // leak, but every time we prepare a template, we immediately render it
        // and re-use the walker in new TemplateInstance._clone().
        debugLogEvent &&
            debugLogEvent({
                kind: 'template prep',
                template: this,
                clonableTemplate: this.el,
                parts: this.parts,
                strings,
            });
    }
    // Overridden via `litHtmlPolyfillSupport` to provide platform support.
    /** @nocollapse */
    static createElement(html, _options) {
        const el = d.createElement('template');
        el.innerHTML = html;
        return el;
    }
}
function resolveDirective(part, value, parent = part, attributeIndex) {
    // Bail early if the value is explicitly noChange. Note, this means any
    // nested directive is still attached and is not run.
    if (value === noChange) {
        return value;
    }
    let currentDirective = attributeIndex !== undefined
        ? parent.__directives?.[attributeIndex]
        : parent.__directive;
    const nextDirectiveConstructor = isPrimitive(value)
        ? undefined
        : // This property needs to remain unminified.
            value['_$litDirective$'];
    if (currentDirective?.constructor !== nextDirectiveConstructor) {
        // This property needs to remain unminified.
        currentDirective?.['_$notifyDirectiveConnectionChanged']?.(false);
        if (nextDirectiveConstructor === undefined) {
            currentDirective = undefined;
        }
        else {
            currentDirective = new nextDirectiveConstructor(part);
            currentDirective._$initialize(part, parent, attributeIndex);
        }
        if (attributeIndex !== undefined) {
            (parent.__directives ??= [])[attributeIndex] =
                currentDirective;
        }
        else {
            parent.__directive = currentDirective;
        }
    }
    if (currentDirective !== undefined) {
        value = resolveDirective(part, currentDirective._$resolve(part, value.values), currentDirective, attributeIndex);
    }
    return value;
}
/**
 * An updateable instance of a Template. Holds references to the Parts used to
 * update the template instance.
 */
class TemplateInstance {
    constructor(template, parent) {
        this._$parts = [];
        /** @internal */
        this._$disconnectableChildren = undefined;
        this._$template = template;
        this._$parent = parent;
    }
    // Called by ChildPart parentNode getter
    get parentNode() {
        return this._$parent.parentNode;
    }
    // See comment in Disconnectable interface for why this is a getter
    get _$isConnected() {
        return this._$parent._$isConnected;
    }
    // This method is separate from the constructor because we need to return a
    // DocumentFragment and we don't want to hold onto it with an instance field.
    _clone(options) {
        const { el: { content }, parts: parts, } = this._$template;
        const fragment = (options?.creationScope ?? d).importNode(content, true);
        walker.currentNode = fragment;
        let node = walker.nextNode();
        let nodeIndex = 0;
        let partIndex = 0;
        let templatePart = parts[0];
        while (templatePart !== undefined) {
            if (nodeIndex === templatePart.index) {
                let part;
                if (templatePart.type === CHILD_PART) {
                    part = new ChildPart(node, node.nextSibling, this, options);
                }
                else if (templatePart.type === ATTRIBUTE_PART) {
                    part = new templatePart.ctor(node, templatePart.name, templatePart.strings, this, options);
                }
                else if (templatePart.type === ELEMENT_PART) {
                    part = new ElementPart(node, this, options);
                }
                this._$parts.push(part);
                templatePart = parts[++partIndex];
            }
            if (nodeIndex !== templatePart?.index) {
                node = walker.nextNode();
                nodeIndex++;
            }
        }
        // We need to set the currentNode away from the cloned tree so that we
        // don't hold onto the tree even if the tree is detached and should be
        // freed.
        walker.currentNode = d;
        return fragment;
    }
    _update(values) {
        let i = 0;
        for (const part of this._$parts) {
            if (part !== undefined) {
                debugLogEvent &&
                    debugLogEvent({
                        kind: 'set part',
                        part,
                        value: values[i],
                        valueIndex: i,
                        values,
                        templateInstance: this,
                    });
                if (part.strings !== undefined) {
                    part._$setValue(values, part, i);
                    // The number of values the part consumes is part.strings.length - 1
                    // since values are in between template spans. We increment i by 1
                    // later in the loop, so increment it by part.strings.length - 2 here
                    i += part.strings.length - 2;
                }
                else {
                    part._$setValue(values[i]);
                }
            }
            i++;
        }
    }
}
class ChildPart {
    // See comment in Disconnectable interface for why this is a getter
    get _$isConnected() {
        // ChildParts that are not at the root should always be created with a
        // parent; only RootChildNode's won't, so they return the local isConnected
        // state
        return this._$parent?._$isConnected ?? this.__isConnected;
    }
    constructor(startNode, endNode, parent, options) {
        this.type = CHILD_PART;
        this._$committedValue = nothing;
        // The following fields will be patched onto ChildParts when required by
        // AsyncDirective
        /** @internal */
        this._$disconnectableChildren = undefined;
        this._$startNode = startNode;
        this._$endNode = endNode;
        this._$parent = parent;
        this.options = options;
        // Note __isConnected is only ever accessed on RootParts (i.e. when there is
        // no _$parent); the value on a non-root-part is "don't care", but checking
        // for parent would be more code
        this.__isConnected = options?.isConnected ?? true;
        if (ENABLE_EXTRA_SECURITY_HOOKS) {
            // Explicitly initialize for consistent class shape.
            this._textSanitizer = undefined;
        }
    }
    /**
     * The parent node into which the part renders its content.
     *
     * A ChildPart's content consists of a range of adjacent child nodes of
     * `.parentNode`, possibly bordered by 'marker nodes' (`.startNode` and
     * `.endNode`).
     *
     * - If both `.startNode` and `.endNode` are non-null, then the part's content
     * consists of all siblings between `.startNode` and `.endNode`, exclusively.
     *
     * - If `.startNode` is non-null but `.endNode` is null, then the part's
     * content consists of all siblings following `.startNode`, up to and
     * including the last child of `.parentNode`. If `.endNode` is non-null, then
     * `.startNode` will always be non-null.
     *
     * - If both `.endNode` and `.startNode` are null, then the part's content
     * consists of all child nodes of `.parentNode`.
     */
    get parentNode() {
        let parentNode = wrap(this._$startNode).parentNode;
        const parent = this._$parent;
        if (parent !== undefined &&
            parentNode?.nodeType === 11 /* Node.DOCUMENT_FRAGMENT */) {
            // If the parentNode is a DocumentFragment, it may be because the DOM is
            // still in the cloned fragment during initial render; if so, get the real
            // parentNode the part will be committed into by asking the parent.
            parentNode = parent.parentNode;
        }
        return parentNode;
    }
    /**
     * The part's leading marker node, if any. See `.parentNode` for more
     * information.
     */
    get startNode() {
        return this._$startNode;
    }
    /**
     * The part's trailing marker node, if any. See `.parentNode` for more
     * information.
     */
    get endNode() {
        return this._$endNode;
    }
    _$setValue(value, directiveParent = this) {
        if (DEV_MODE && this.parentNode === null) {
            throw new Error(`This \`ChildPart\` has no \`parentNode\` and therefore cannot accept a value. This likely means the element containing the part was manipulated in an unsupported way outside of Lit's control such that the part's marker nodes were ejected from DOM. For example, setting the element's \`innerHTML\` or \`textContent\` can do this.`);
        }
        value = resolveDirective(this, value, directiveParent);
        if (isPrimitive(value)) {
            // Non-rendering child values. It's important that these do not render
            // empty text nodes to avoid issues with preventing default <slot>
            // fallback content.
            if (value === nothing || value == null || value === '') {
                if (this._$committedValue !== nothing) {
                    debugLogEvent &&
                        debugLogEvent({
                            kind: 'commit nothing to child',
                            start: this._$startNode,
                            end: this._$endNode,
                            parent: this._$parent,
                            options: this.options,
                        });
                    this._$clear();
                }
                this._$committedValue = nothing;
            }
            else if (value !== this._$committedValue && value !== noChange) {
                this._commitText(value);
            }
            // This property needs to remain unminified.
        }
        else if (value['_$litType$'] !== undefined) {
            this._commitTemplateResult(value);
        }
        else if (value.nodeType !== undefined) {
            if (DEV_MODE && this.options?.host === value) {
                this._commitText(`[probable mistake: rendered a template's host in itself ` +
                    `(commonly caused by writing \${this} in a template]`);
                console.warn(`Attempted to render the template host`, value, `inside itself. This is almost always a mistake, and in dev mode `, `we render some warning text. In production however, we'll `, `render it, which will usually result in an error, and sometimes `, `in the element disappearing from the DOM.`);
                return;
            }
            this._commitNode(value);
        }
        else if (isIterable(value)) {
            this._commitIterable(value);
        }
        else {
            // Fallback, will render the string representation
            this._commitText(value);
        }
    }
    _insert(node) {
        return wrap(wrap(this._$startNode).parentNode).insertBefore(node, this._$endNode);
    }
    _commitNode(value) {
        if (this._$committedValue !== value) {
            this._$clear();
            if (ENABLE_EXTRA_SECURITY_HOOKS &&
                sanitizerFactoryInternal !== noopSanitizer) {
                const parentNodeName = this._$startNode.parentNode?.nodeName;
                if (parentNodeName === 'STYLE' || parentNodeName === 'SCRIPT') {
                    let message = 'Forbidden';
                    if (DEV_MODE) {
                        if (parentNodeName === 'STYLE') {
                            message =
                                `Lit does not support binding inside style nodes. ` +
                                    `This is a security risk, as style injection attacks can ` +
                                    `exfiltrate data and spoof UIs. ` +
                                    `Consider instead using css\`...\` literals ` +
                                    `to compose styles, and do dynamic styling with ` +
                                    `css custom properties, ::parts, <slot>s, ` +
                                    `and by mutating the DOM rather than stylesheets.`;
                        }
                        else {
                            message =
                                `Lit does not support binding inside script nodes. ` +
                                    `This is a security risk, as it could allow arbitrary ` +
                                    `code execution.`;
                        }
                    }
                    throw new Error(message);
                }
            }
            debugLogEvent &&
                debugLogEvent({
                    kind: 'commit node',
                    start: this._$startNode,
                    parent: this._$parent,
                    value: value,
                    options: this.options,
                });
            this._$committedValue = this._insert(value);
        }
    }
    _commitText(value) {
        // If the committed value is a primitive it means we called _commitText on
        // the previous render, and we know that this._$startNode.nextSibling is a
        // Text node. We can now just replace the text content (.data) of the node.
        if (this._$committedValue !== nothing &&
            isPrimitive(this._$committedValue)) {
            const node = wrap(this._$startNode).nextSibling;
            if (ENABLE_EXTRA_SECURITY_HOOKS) {
                if (this._textSanitizer === undefined) {
                    this._textSanitizer = createSanitizer(node, 'data', 'property');
                }
                value = this._textSanitizer(value);
            }
            debugLogEvent &&
                debugLogEvent({
                    kind: 'commit text',
                    node,
                    value,
                    options: this.options,
                });
            node.data = value;
        }
        else {
            if (ENABLE_EXTRA_SECURITY_HOOKS) {
                const textNode = d.createTextNode('');
                this._commitNode(textNode);
                // When setting text content, for security purposes it matters a lot
                // what the parent is. For example, <style> and <script> need to be
                // handled with care, while <span> does not. So first we need to put a
                // text node into the document, then we can sanitize its content.
                if (this._textSanitizer === undefined) {
                    this._textSanitizer = createSanitizer(textNode, 'data', 'property');
                }
                value = this._textSanitizer(value);
                debugLogEvent &&
                    debugLogEvent({
                        kind: 'commit text',
                        node: textNode,
                        value,
                        options: this.options,
                    });
                textNode.data = value;
            }
            else {
                this._commitNode(d.createTextNode(value));
                debugLogEvent &&
                    debugLogEvent({
                        kind: 'commit text',
                        node: wrap(this._$startNode).nextSibling,
                        value,
                        options: this.options,
                    });
            }
        }
        this._$committedValue = value;
    }
    _commitTemplateResult(result) {
        // This property needs to remain unminified.
        const { values, ['_$litType$']: type } = result;
        // If $litType$ is a number, result is a plain TemplateResult and we get
        // the template from the template cache. If not, result is a
        // CompiledTemplateResult and _$litType$ is a CompiledTemplate and we need
        // to create the <template> element the first time we see it.
        const template = typeof type === 'number'
            ? this._$getTemplate(result)
            : (type.el === undefined &&
                (type.el = Template.createElement(trustFromTemplateString(type.h, type.h[0]), this.options)),
                type);
        if (this._$committedValue?._$template === template) {
            debugLogEvent &&
                debugLogEvent({
                    kind: 'template updating',
                    template,
                    instance: this._$committedValue,
                    parts: this._$committedValue._$parts,
                    options: this.options,
                    values,
                });
            this._$committedValue._update(values);
        }
        else {
            const instance = new TemplateInstance(template, this);
            const fragment = instance._clone(this.options);
            debugLogEvent &&
                debugLogEvent({
                    kind: 'template instantiated',
                    template,
                    instance,
                    parts: instance._$parts,
                    options: this.options,
                    fragment,
                    values,
                });
            instance._update(values);
            debugLogEvent &&
                debugLogEvent({
                    kind: 'template instantiated and updated',
                    template,
                    instance,
                    parts: instance._$parts,
                    options: this.options,
                    fragment,
                    values,
                });
            this._commitNode(fragment);
            this._$committedValue = instance;
        }
    }
    // Overridden via `litHtmlPolyfillSupport` to provide platform support.
    /** @internal */
    _$getTemplate(result) {
        let template = templateCache.get(result.strings);
        if (template === undefined) {
            templateCache.set(result.strings, (template = new Template(result)));
        }
        return template;
    }
    _commitIterable(value) {
        // For an Iterable, we create a new InstancePart per item, then set its
        // value to the item. This is a little bit of overhead for every item in
        // an Iterable, but it lets us recurse easily and efficiently update Arrays
        // of TemplateResults that will be commonly returned from expressions like:
        // array.map((i) => html`${i}`), by reusing existing TemplateInstances.
        // If value is an array, then the previous render was of an
        // iterable and value will contain the ChildParts from the previous
        // render. If value is not an array, clear this part and make a new
        // array for ChildParts.
        if (!isArray(this._$committedValue)) {
            this._$committedValue = [];
            this._$clear();
        }
        // Lets us keep track of how many items we stamped so we can clear leftover
        // items from a previous render
        const itemParts = this._$committedValue;
        let partIndex = 0;
        let itemPart;
        for (const item of value) {
            if (partIndex === itemParts.length) {
                // If no existing part, create a new one
                // TODO (justinfagnani): test perf impact of always creating two parts
                // instead of sharing parts between nodes
                // https://github.com/lit/lit/issues/1266
                itemParts.push((itemPart = new ChildPart(this._insert(createMarker()), this._insert(createMarker()), this, this.options)));
            }
            else {
                // Reuse an existing part
                itemPart = itemParts[partIndex];
            }
            itemPart._$setValue(item);
            partIndex++;
        }
        if (partIndex < itemParts.length) {
            // itemParts always have end nodes
            this._$clear(itemPart && wrap(itemPart._$endNode).nextSibling, partIndex);
            // Truncate the parts array so _value reflects the current state
            itemParts.length = partIndex;
        }
    }
    /**
     * Removes the nodes contained within this Part from the DOM.
     *
     * @param start Start node to clear from, for clearing a subset of the part's
     *     DOM (used when truncating iterables)
     * @param from  When `start` is specified, the index within the iterable from
     *     which ChildParts are being removed, used for disconnecting directives in
     *     those Parts.
     *
     * @internal
     */
    _$clear(start = wrap(this._$startNode).nextSibling, from) {
        this._$notifyConnectionChanged?.(false, true, from);
        while (start && start !== this._$endNode) {
            const n = wrap(start).nextSibling;
            wrap(start).remove();
            start = n;
        }
    }
    /**
     * Implementation of RootPart's `isConnected`. Note that this method
     * should only be called on `RootPart`s (the `ChildPart` returned from a
     * top-level `render()` call). It has no effect on non-root ChildParts.
     * @param isConnected Whether to set
     * @internal
     */
    setConnected(isConnected) {
        if (this._$parent === undefined) {
            this.__isConnected = isConnected;
            this._$notifyConnectionChanged?.(isConnected);
        }
        else if (DEV_MODE) {
            throw new Error('part.setConnected() may only be called on a ' +
                'RootPart returned from render().');
        }
    }
}
class AttributePart {
    get tagName() {
        return this.element.tagName;
    }
    // See comment in Disconnectable interface for why this is a getter
    get _$isConnected() {
        return this._$parent._$isConnected;
    }
    constructor(element, name, strings, parent, options) {
        this.type = ATTRIBUTE_PART;
        /** @internal */
        this._$committedValue = nothing;
        /** @internal */
        this._$disconnectableChildren = undefined;
        this.element = element;
        this.name = name;
        this._$parent = parent;
        this.options = options;
        if (strings.length > 2 || strings[0] !== '' || strings[1] !== '') {
            this._$committedValue = new Array(strings.length - 1).fill(new String());
            this.strings = strings;
        }
        else {
            this._$committedValue = nothing;
        }
        if (ENABLE_EXTRA_SECURITY_HOOKS) {
            this._sanitizer = undefined;
        }
    }
    /**
     * Sets the value of this part by resolving the value from possibly multiple
     * values and static strings and committing it to the DOM.
     * If this part is single-valued, `this._strings` will be undefined, and the
     * method will be called with a single value argument. If this part is
     * multi-value, `this._strings` will be defined, and the method is called
     * with the value array of the part's owning TemplateInstance, and an offset
     * into the value array from which the values should be read.
     * This method is overloaded this way to eliminate short-lived array slices
     * of the template instance values, and allow a fast-path for single-valued
     * parts.
     *
     * @param value The part value, or an array of values for multi-valued parts
     * @param valueIndex the index to start reading values from. `undefined` for
     *   single-valued parts
     * @param noCommit causes the part to not commit its value to the DOM. Used
     *   in hydration to prime attribute parts with their first-rendered value,
     *   but not set the attribute, and in SSR to no-op the DOM operation and
     *   capture the value for serialization.
     *
     * @internal
     */
    _$setValue(value, directiveParent = this, valueIndex, noCommit) {
        const strings = this.strings;
        // Whether any of the values has changed, for dirty-checking
        let change = false;
        if (strings === undefined) {
            // Single-value binding case
            value = resolveDirective(this, value, directiveParent, 0);
            change =
                !isPrimitive(value) ||
                    (value !== this._$committedValue && value !== noChange);
            if (change) {
                this._$committedValue = value;
            }
        }
        else {
            // Interpolation case
            const values = value;
            value = strings[0];
            let i, v;
            for (i = 0; i < strings.length - 1; i++) {
                v = resolveDirective(this, values[valueIndex + i], directiveParent, i);
                if (v === noChange) {
                    // If the user-provided value is `noChange`, use the previous value
                    v = this._$committedValue[i];
                }
                change ||=
                    !isPrimitive(v) || v !== this._$committedValue[i];
                if (v === nothing) {
                    value = nothing;
                }
                else if (value !== nothing) {
                    value += (v ?? '') + strings[i + 1];
                }
                // We always record each value, even if one is `nothing`, for future
                // change detection.
                this._$committedValue[i] = v;
            }
        }
        if (change && !noCommit) {
            this._commitValue(value);
        }
    }
    /** @internal */
    _commitValue(value) {
        if (value === nothing) {
            wrap(this.element).removeAttribute(this.name);
        }
        else {
            if (ENABLE_EXTRA_SECURITY_HOOKS) {
                if (this._sanitizer === undefined) {
                    this._sanitizer = sanitizerFactoryInternal(this.element, this.name, 'attribute');
                }
                value = this._sanitizer(value ?? '');
            }
            debugLogEvent &&
                debugLogEvent({
                    kind: 'commit attribute',
                    element: this.element,
                    name: this.name,
                    value,
                    options: this.options,
                });
            wrap(this.element).setAttribute(this.name, (value ?? ''));
        }
    }
}
class PropertyPart extends AttributePart {
    constructor() {
        super(...arguments);
        this.type = PROPERTY_PART;
    }
    /** @internal */
    _commitValue(value) {
        if (ENABLE_EXTRA_SECURITY_HOOKS) {
            if (this._sanitizer === undefined) {
                this._sanitizer = sanitizerFactoryInternal(this.element, this.name, 'property');
            }
            value = this._sanitizer(value);
        }
        debugLogEvent &&
            debugLogEvent({
                kind: 'commit property',
                element: this.element,
                name: this.name,
                value,
                options: this.options,
            });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.element[this.name] = value === nothing ? undefined : value;
    }
}
class BooleanAttributePart extends AttributePart {
    constructor() {
        super(...arguments);
        this.type = BOOLEAN_ATTRIBUTE_PART;
    }
    /** @internal */
    _commitValue(value) {
        debugLogEvent &&
            debugLogEvent({
                kind: 'commit boolean attribute',
                element: this.element,
                name: this.name,
                value: !!(value && value !== nothing),
                options: this.options,
            });
        wrap(this.element).toggleAttribute(this.name, !!value && value !== nothing);
    }
}
class EventPart extends AttributePart {
    constructor(element, name, strings, parent, options) {
        super(element, name, strings, parent, options);
        this.type = EVENT_PART;
        if (DEV_MODE && this.strings !== undefined) {
            throw new Error(`A \`<${element.localName}>\` has a \`@${name}=...\` listener with ` +
                'invalid content. Event listeners in templates must have exactly ' +
                'one expression and no surrounding text.');
        }
    }
    // EventPart does not use the base _$setValue/_resolveValue implementation
    // since the dirty checking is more complex
    /** @internal */
    _$setValue(newListener, directiveParent = this) {
        newListener =
            resolveDirective(this, newListener, directiveParent, 0) ?? nothing;
        if (newListener === noChange) {
            return;
        }
        const oldListener = this._$committedValue;
        // If the new value is nothing or any options change we have to remove the
        // part as a listener.
        const shouldRemoveListener = (newListener === nothing && oldListener !== nothing) ||
            newListener.capture !==
                oldListener.capture ||
            newListener.once !==
                oldListener.once ||
            newListener.passive !==
                oldListener.passive;
        // If the new value is not nothing and we removed the listener, we have
        // to add the part as a listener.
        const shouldAddListener = newListener !== nothing &&
            (oldListener === nothing || shouldRemoveListener);
        debugLogEvent &&
            debugLogEvent({
                kind: 'commit event listener',
                element: this.element,
                name: this.name,
                value: newListener,
                options: this.options,
                removeListener: shouldRemoveListener,
                addListener: shouldAddListener,
                oldListener,
            });
        if (shouldRemoveListener) {
            this.element.removeEventListener(this.name, this, oldListener);
        }
        if (shouldAddListener) {
            this.element.addEventListener(this.name, this, newListener);
        }
        this._$committedValue = newListener;
    }
    handleEvent(event) {
        if (typeof this._$committedValue === 'function') {
            this._$committedValue.call(this.options?.host ?? this.element, event);
        }
        else {
            this._$committedValue.handleEvent(event);
        }
    }
}
class ElementPart {
    constructor(element, parent, options) {
        this.element = element;
        this.type = ELEMENT_PART;
        /** @internal */
        this._$disconnectableChildren = undefined;
        this._$parent = parent;
        this.options = options;
    }
    // See comment in Disconnectable interface for why this is a getter
    get _$isConnected() {
        return this._$parent._$isConnected;
    }
    _$setValue(value) {
        debugLogEvent &&
            debugLogEvent({
                kind: 'commit to element binding',
                element: this.element,
                value,
                options: this.options,
            });
        resolveDirective(this, value);
    }
}
/**
 * END USERS SHOULD NOT RELY ON THIS OBJECT.
 *
 * Private exports for use by other Lit packages, not intended for use by
 * external users.
 *
 * We currently do not make a mangled rollup build of the lit-ssr code. In order
 * to keep a number of (otherwise private) top-level exports mangled in the
 * client side code, we export a _$LH object containing those members (or
 * helper methods for accessing private fields of those members), and then
 * re-export them for use in lit-ssr. This keeps lit-ssr agnostic to whether the
 * client-side code is being used in `dev` mode or `prod` mode.
 *
 * This has a unique name, to disambiguate it from private exports in
 * lit-element, which re-exports all of lit-html.
 *
 * @private
 */
const _$LH = {
    // Used in lit-ssr
    _boundAttributeSuffix: boundAttributeSuffix,
    _marker: marker,
    _markerMatch: markerMatch,
    _HTML_RESULT: HTML_RESULT,
    _getTemplateHtml: getTemplateHtml,
    // Used in tests and private-ssr-support
    _TemplateInstance: TemplateInstance,
    _isIterable: isIterable,
    _resolveDirective: resolveDirective,
    _ChildPart: ChildPart,
    _AttributePart: AttributePart,
    _BooleanAttributePart: BooleanAttributePart,
    _EventPart: EventPart,
    _PropertyPart: PropertyPart,
    _ElementPart: ElementPart,
};
// Apply polyfills if available
const polyfillSupport = DEV_MODE
    ? global.litHtmlPolyfillSupportDevMode
    : global.litHtmlPolyfillSupport;
polyfillSupport?.(Template, ChildPart);
// IMPORTANT: do not change the property name or the assignment expression.
// This line will be used in regexes to search for lit-html usage.
(global.litHtmlVersions ??= []).push('3.3.0');
if (DEV_MODE && global.litHtmlVersions.length > 1) {
    queueMicrotask(() => {
        issueWarning('multiple-versions', `Multiple versions of Lit loaded. ` +
            `Loading multiple versions is not recommended.`);
    });
}
/**
 * Renders a value, usually a lit-html TemplateResult, to the container.
 *
 * This example renders the text "Hello, Zoe!" inside a paragraph tag, appending
 * it to the container `document.body`.
 *
 * ```js
 * import {html, render} from 'lit';
 *
 * const name = "Zoe";
 * render(html`<p>Hello, ${name}!</p>`, document.body);
 * ```
 *
 * @param value Any [renderable
 *   value](https://lit.dev/docs/templates/expressions/#child-expressions),
 *   typically a {@linkcode TemplateResult} created by evaluating a template tag
 *   like {@linkcode html} or {@linkcode svg}.
 * @param container A DOM container to render to. The first render will append
 *   the rendered value to the container, and subsequent renders will
 *   efficiently update the rendered value if the same result type was
 *   previously rendered there.
 * @param options See {@linkcode RenderOptions} for options documentation.
 * @see
 * {@link https://lit.dev/docs/libraries/standalone-templates/#rendering-lit-html-templates| Rendering Lit HTML Templates}
 */
const render = (value, container, options) => {
    if (DEV_MODE && container == null) {
        // Give a clearer error message than
        //     Uncaught TypeError: Cannot read properties of null (reading
        //     '_$litPart$')
        // which reads like an internal Lit error.
        throw new TypeError(`The container to render into may not be ${container}`);
    }
    const renderId = DEV_MODE ? debugLogRenderId++ : 0;
    const partOwnerNode = options?.renderBefore ?? container;
    // This property needs to remain unminified.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let part = partOwnerNode['_$litPart$'];
    debugLogEvent &&
        debugLogEvent({
            kind: 'begin render',
            id: renderId,
            value,
            container,
            options,
            part,
        });
    if (part === undefined) {
        const endNode = options?.renderBefore ?? null;
        // This property needs to remain unminified.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        partOwnerNode['_$litPart$'] = part = new ChildPart(container.insertBefore(createMarker(), endNode), endNode, undefined, options ?? {});
    }
    part._$setValue(value);
    debugLogEvent &&
        debugLogEvent({
            kind: 'end render',
            id: renderId,
            value,
            container,
            options,
            part,
        });
    return part;
};
if (ENABLE_EXTRA_SECURITY_HOOKS) {
    render.setSanitizer = setSanitizer;
    render.createSanitizer = createSanitizer;
    if (DEV_MODE) {
        render._testOnlyClearSanitizerFactoryDoNotCallOrElse =
            _testOnlyClearSanitizerFactoryDoNotCallOrElse;
    }
}
//# sourceMappingURL=lit-html.js.map

/***/ }),

/***/ "./node_modules/lit/decorators.js":
/*!****************************************!*\
  !*** ./node_modules/lit/decorators.js ***!
  \****************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   customElement: () => (/* reexport safe */ _lit_reactive_element_decorators_custom_element_js__WEBPACK_IMPORTED_MODULE_0__.customElement),
/* harmony export */   eventOptions: () => (/* reexport safe */ _lit_reactive_element_decorators_event_options_js__WEBPACK_IMPORTED_MODULE_3__.eventOptions),
/* harmony export */   property: () => (/* reexport safe */ _lit_reactive_element_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__.property),
/* harmony export */   query: () => (/* reexport safe */ _lit_reactive_element_decorators_query_js__WEBPACK_IMPORTED_MODULE_4__.query),
/* harmony export */   queryAll: () => (/* reexport safe */ _lit_reactive_element_decorators_query_all_js__WEBPACK_IMPORTED_MODULE_5__.queryAll),
/* harmony export */   queryAssignedElements: () => (/* reexport safe */ _lit_reactive_element_decorators_query_assigned_elements_js__WEBPACK_IMPORTED_MODULE_7__.queryAssignedElements),
/* harmony export */   queryAssignedNodes: () => (/* reexport safe */ _lit_reactive_element_decorators_query_assigned_nodes_js__WEBPACK_IMPORTED_MODULE_8__.queryAssignedNodes),
/* harmony export */   queryAsync: () => (/* reexport safe */ _lit_reactive_element_decorators_query_async_js__WEBPACK_IMPORTED_MODULE_6__.queryAsync),
/* harmony export */   standardProperty: () => (/* reexport safe */ _lit_reactive_element_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__.standardProperty),
/* harmony export */   state: () => (/* reexport safe */ _lit_reactive_element_decorators_state_js__WEBPACK_IMPORTED_MODULE_2__.state)
/* harmony export */ });
/* harmony import */ var _lit_reactive_element_decorators_custom_element_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @lit/reactive-element/decorators/custom-element.js */ "./node_modules/@lit/reactive-element/development/decorators/custom-element.js");
/* harmony import */ var _lit_reactive_element_decorators_property_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @lit/reactive-element/decorators/property.js */ "./node_modules/@lit/reactive-element/development/decorators/property.js");
/* harmony import */ var _lit_reactive_element_decorators_state_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @lit/reactive-element/decorators/state.js */ "./node_modules/@lit/reactive-element/development/decorators/state.js");
/* harmony import */ var _lit_reactive_element_decorators_event_options_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @lit/reactive-element/decorators/event-options.js */ "./node_modules/@lit/reactive-element/development/decorators/event-options.js");
/* harmony import */ var _lit_reactive_element_decorators_query_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @lit/reactive-element/decorators/query.js */ "./node_modules/@lit/reactive-element/development/decorators/query.js");
/* harmony import */ var _lit_reactive_element_decorators_query_all_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @lit/reactive-element/decorators/query-all.js */ "./node_modules/@lit/reactive-element/development/decorators/query-all.js");
/* harmony import */ var _lit_reactive_element_decorators_query_async_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @lit/reactive-element/decorators/query-async.js */ "./node_modules/@lit/reactive-element/development/decorators/query-async.js");
/* harmony import */ var _lit_reactive_element_decorators_query_assigned_elements_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @lit/reactive-element/decorators/query-assigned-elements.js */ "./node_modules/@lit/reactive-element/development/decorators/query-assigned-elements.js");
/* harmony import */ var _lit_reactive_element_decorators_query_assigned_nodes_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! @lit/reactive-element/decorators/query-assigned-nodes.js */ "./node_modules/@lit/reactive-element/development/decorators/query-assigned-nodes.js");

//# sourceMappingURL=decorators.js.map


/***/ }),

/***/ "./node_modules/lit/index.js":
/*!***********************************!*\
  !*** ./node_modules/lit/index.js ***!
  \***********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CSSResult: () => (/* reexport safe */ lit_element_lit_element_js__WEBPACK_IMPORTED_MODULE_2__.CSSResult),
/* harmony export */   LitElement: () => (/* reexport safe */ lit_element_lit_element_js__WEBPACK_IMPORTED_MODULE_2__.LitElement),
/* harmony export */   ReactiveElement: () => (/* reexport safe */ lit_element_lit_element_js__WEBPACK_IMPORTED_MODULE_2__.ReactiveElement),
/* harmony export */   _$LE: () => (/* reexport safe */ lit_element_lit_element_js__WEBPACK_IMPORTED_MODULE_2__._$LE),
/* harmony export */   _$LH: () => (/* reexport safe */ lit_element_lit_element_js__WEBPACK_IMPORTED_MODULE_2__._$LH),
/* harmony export */   adoptStyles: () => (/* reexport safe */ lit_element_lit_element_js__WEBPACK_IMPORTED_MODULE_2__.adoptStyles),
/* harmony export */   css: () => (/* reexport safe */ lit_element_lit_element_js__WEBPACK_IMPORTED_MODULE_2__.css),
/* harmony export */   defaultConverter: () => (/* reexport safe */ lit_element_lit_element_js__WEBPACK_IMPORTED_MODULE_2__.defaultConverter),
/* harmony export */   getCompatibleStyle: () => (/* reexport safe */ lit_element_lit_element_js__WEBPACK_IMPORTED_MODULE_2__.getCompatibleStyle),
/* harmony export */   html: () => (/* reexport safe */ lit_element_lit_element_js__WEBPACK_IMPORTED_MODULE_2__.html),
/* harmony export */   isServer: () => (/* reexport safe */ lit_html_is_server_js__WEBPACK_IMPORTED_MODULE_3__.isServer),
/* harmony export */   mathml: () => (/* reexport safe */ lit_element_lit_element_js__WEBPACK_IMPORTED_MODULE_2__.mathml),
/* harmony export */   noChange: () => (/* reexport safe */ lit_element_lit_element_js__WEBPACK_IMPORTED_MODULE_2__.noChange),
/* harmony export */   notEqual: () => (/* reexport safe */ lit_element_lit_element_js__WEBPACK_IMPORTED_MODULE_2__.notEqual),
/* harmony export */   nothing: () => (/* reexport safe */ lit_element_lit_element_js__WEBPACK_IMPORTED_MODULE_2__.nothing),
/* harmony export */   render: () => (/* reexport safe */ lit_element_lit_element_js__WEBPACK_IMPORTED_MODULE_2__.render),
/* harmony export */   supportsAdoptingStyleSheets: () => (/* reexport safe */ lit_element_lit_element_js__WEBPACK_IMPORTED_MODULE_2__.supportsAdoptingStyleSheets),
/* harmony export */   svg: () => (/* reexport safe */ lit_element_lit_element_js__WEBPACK_IMPORTED_MODULE_2__.svg),
/* harmony export */   unsafeCSS: () => (/* reexport safe */ lit_element_lit_element_js__WEBPACK_IMPORTED_MODULE_2__.unsafeCSS)
/* harmony export */ });
/* harmony import */ var _lit_reactive_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @lit/reactive-element */ "./node_modules/@lit/reactive-element/development/reactive-element.js");
/* harmony import */ var lit_html__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lit-html */ "./node_modules/lit-html/development/lit-html.js");
/* harmony import */ var lit_element_lit_element_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! lit-element/lit-element.js */ "./node_modules/lit-element/development/lit-element.js");
/* harmony import */ var lit_html_is_server_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! lit-html/is-server.js */ "./node_modules/lit-html/development/is-server.js");

//# sourceMappingURL=index.js.map


/***/ }),

/***/ "./node_modules/webpack-dev-server/client/clients/WebSocketClient.js":
/*!***************************************************************************!*\
  !*** ./node_modules/webpack-dev-server/client/clients/WebSocketClient.js ***!
  \***************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ WebSocketClient)
/* harmony export */ });
/* harmony import */ var _utils_log_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils/log.js */ "./node_modules/webpack-dev-server/client/utils/log.js");
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }

var WebSocketClient = /*#__PURE__*/function () {
  /**
   * @param {string} url
   */
  function WebSocketClient(url) {
    _classCallCheck(this, WebSocketClient);
    this.client = new WebSocket(url);
    this.client.onerror = function (error) {
      _utils_log_js__WEBPACK_IMPORTED_MODULE_0__.log.error(error);
    };
  }

  /**
   * @param {(...args: any[]) => void} f
   */
  return _createClass(WebSocketClient, [{
    key: "onOpen",
    value: function onOpen(f) {
      this.client.onopen = f;
    }

    /**
     * @param {(...args: any[]) => void} f
     */
  }, {
    key: "onClose",
    value: function onClose(f) {
      this.client.onclose = f;
    }

    // call f with the message string as the first argument
    /**
     * @param {(...args: any[]) => void} f
     */
  }, {
    key: "onMessage",
    value: function onMessage(f) {
      this.client.onmessage = function (e) {
        f(e.data);
      };
    }
  }]);
}();


/***/ }),

/***/ "./node_modules/webpack-dev-server/client/index.js?protocol=ws%3A&hostname=localhost&port=9000&pathname=%2Fws&logging=verbose&progress=true&overlay=%7B%22errors%22%3Atrue%2C%22warnings%22%3Atrue%7D&reconnect=10&hot=true&live-reload=true":
/*!***************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/webpack-dev-server/client/index.js?protocol=ws%3A&hostname=localhost&port=9000&pathname=%2Fws&logging=verbose&progress=true&overlay=%7B%22errors%22%3Atrue%2C%22warnings%22%3Atrue%7D&reconnect=10&hot=true&live-reload=true ***!
  \***************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
var __resourceQuery = "?protocol=ws%3A&hostname=localhost&port=9000&pathname=%2Fws&logging=verbose&progress=true&overlay=%7B%22errors%22%3Atrue%2C%22warnings%22%3Atrue%7D&reconnect=10&hot=true&live-reload=true";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createSocketURL: () => (/* binding */ createSocketURL),
/* harmony export */   getCurrentScriptSource: () => (/* binding */ getCurrentScriptSource),
/* harmony export */   parseURL: () => (/* binding */ parseURL)
/* harmony export */ });
/* harmony import */ var webpack_hot_log_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! webpack/hot/log.js */ "./node_modules/webpack/hot/log.js");
/* harmony import */ var webpack_hot_log_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(webpack_hot_log_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var webpack_hot_emitter_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! webpack/hot/emitter.js */ "./node_modules/webpack/hot/emitter.js");
/* harmony import */ var webpack_hot_emitter_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(webpack_hot_emitter_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _socket_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./socket.js */ "./node_modules/webpack-dev-server/client/socket.js");
/* harmony import */ var _overlay_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./overlay.js */ "./node_modules/webpack-dev-server/client/overlay.js");
/* harmony import */ var _utils_log_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./utils/log.js */ "./node_modules/webpack-dev-server/client/utils/log.js");
/* harmony import */ var _utils_sendMessage_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./utils/sendMessage.js */ "./node_modules/webpack-dev-server/client/utils/sendMessage.js");
/* harmony import */ var _progress_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./progress.js */ "./node_modules/webpack-dev-server/client/progress.js");
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
/* global __resourceQuery, __webpack_hash__ */
/// <reference types="webpack/module" />








/**
 * @typedef {Object} OverlayOptions
 * @property {boolean | (error: Error) => boolean} [warnings]
 * @property {boolean | (error: Error) => boolean} [errors]
 * @property {boolean | (error: Error) => boolean} [runtimeErrors]
 * @property {string} [trustedTypesPolicyName]
 */

/**
 * @typedef {Object} Options
 * @property {boolean} hot
 * @property {boolean} liveReload
 * @property {boolean} progress
 * @property {boolean | OverlayOptions} overlay
 * @property {string} [logging]
 * @property {number} [reconnect]
 */

/**
 * @typedef {Object} Status
 * @property {boolean} isUnloading
 * @property {string} currentHash
 * @property {string} [previousHash]
 */

/**
 * @param {boolean | { warnings?: boolean | string; errors?: boolean | string; runtimeErrors?: boolean | string; }} overlayOptions
 */
var decodeOverlayOptions = function decodeOverlayOptions(overlayOptions) {
  if (_typeof(overlayOptions) === "object") {
    ["warnings", "errors", "runtimeErrors"].forEach(function (property) {
      if (typeof overlayOptions[property] === "string") {
        var overlayFilterFunctionString = decodeURIComponent(overlayOptions[property]);

        // eslint-disable-next-line no-new-func
        overlayOptions[property] = new Function("message", "var callback = ".concat(overlayFilterFunctionString, "\n        return callback(message)"));
      }
    });
  }
};

/**
 * @type {Status}
 */
var status = {
  isUnloading: false,
  // eslint-disable-next-line camelcase
  currentHash: __webpack_require__.h()
};

/**
 * @returns {string}
 */
var getCurrentScriptSource = function getCurrentScriptSource() {
  // `document.currentScript` is the most accurate way to find the current script,
  // but is not supported in all browsers.
  if (document.currentScript) {
    return document.currentScript.getAttribute("src");
  }

  // Fallback to getting all scripts running in the document.
  var scriptElements = document.scripts || [];
  var scriptElementsWithSrc = Array.prototype.filter.call(scriptElements, function (element) {
    return element.getAttribute("src");
  });
  if (scriptElementsWithSrc.length > 0) {
    var currentScript = scriptElementsWithSrc[scriptElementsWithSrc.length - 1];
    return currentScript.getAttribute("src");
  }

  // Fail as there was no script to use.
  throw new Error("[webpack-dev-server] Failed to get current script source.");
};

/**
 * @param {string} resourceQuery
 * @returns {{ [key: string]: string | boolean }}
 */
var parseURL = function parseURL(resourceQuery) {
  /** @type {{ [key: string]: string }} */
  var result = {};
  if (typeof resourceQuery === "string" && resourceQuery !== "") {
    var searchParams = resourceQuery.slice(1).split("&");
    for (var i = 0; i < searchParams.length; i++) {
      var pair = searchParams[i].split("=");
      result[pair[0]] = decodeURIComponent(pair[1]);
    }
  } else {
    // Else, get the url from the <script> this file was called with.
    var scriptSource = getCurrentScriptSource();
    var scriptSourceURL;
    try {
      // The placeholder `baseURL` with `window.location.href`,
      // is to allow parsing of path-relative or protocol-relative URLs,
      // and will have no effect if `scriptSource` is a fully valid URL.
      scriptSourceURL = new URL(scriptSource, self.location.href);
    } catch (error) {
      // URL parsing failed, do nothing.
      // We will still proceed to see if we can recover using `resourceQuery`
    }
    if (scriptSourceURL) {
      result = scriptSourceURL;
      result.fromCurrentScript = true;
    }
  }
  return result;
};
var parsedResourceQuery = parseURL(__resourceQuery);
var enabledFeatures = {
  "Hot Module Replacement": false,
  "Live Reloading": false,
  Progress: false,
  Overlay: false
};

/** @type {Options} */
var options = {
  hot: false,
  liveReload: false,
  progress: false,
  overlay: false
};
if (parsedResourceQuery.hot === "true") {
  options.hot = true;
  enabledFeatures["Hot Module Replacement"] = true;
}
if (parsedResourceQuery["live-reload"] === "true") {
  options.liveReload = true;
  enabledFeatures["Live Reloading"] = true;
}
if (parsedResourceQuery.progress === "true") {
  options.progress = true;
  enabledFeatures.Progress = true;
}
if (parsedResourceQuery.overlay) {
  try {
    options.overlay = JSON.parse(parsedResourceQuery.overlay);
  } catch (e) {
    _utils_log_js__WEBPACK_IMPORTED_MODULE_4__.log.error("Error parsing overlay options from resource query:", e);
  }

  // Fill in default "true" params for partially-specified objects.
  if (_typeof(options.overlay) === "object") {
    options.overlay = _objectSpread({
      errors: true,
      warnings: true,
      runtimeErrors: true
    }, options.overlay);
    decodeOverlayOptions(options.overlay);
  }
  enabledFeatures.Overlay = options.overlay !== false;
}
if (parsedResourceQuery.logging) {
  options.logging = parsedResourceQuery.logging;
}
if (typeof parsedResourceQuery.reconnect !== "undefined") {
  options.reconnect = Number(parsedResourceQuery.reconnect);
}

/**
 * @param {string} level
 */
var setAllLogLevel = function setAllLogLevel(level) {
  // This is needed because the HMR logger operate separately from dev server logger
  webpack_hot_log_js__WEBPACK_IMPORTED_MODULE_0___default().setLogLevel(level === "verbose" || level === "log" ? "info" : level);
  (0,_utils_log_js__WEBPACK_IMPORTED_MODULE_4__.setLogLevel)(level);
};
if (options.logging) {
  setAllLogLevel(options.logging);
}
var logEnabledFeatures = function logEnabledFeatures(features) {
  var listEnabledFeatures = Object.keys(features);
  if (!features || listEnabledFeatures.length === 0) {
    return;
  }
  var logString = "Server started:";

  // Server started: Hot Module Replacement enabled, Live Reloading enabled, Overlay disabled.
  for (var i = 0; i < listEnabledFeatures.length; i++) {
    var key = listEnabledFeatures[i];
    logString += " ".concat(key, " ").concat(features[key] ? "enabled" : "disabled", ",");
  }
  // replace last comma with a period
  logString = logString.slice(0, -1).concat(".");
  _utils_log_js__WEBPACK_IMPORTED_MODULE_4__.log.info(logString);
};
logEnabledFeatures(enabledFeatures);
self.addEventListener("beforeunload", function () {
  status.isUnloading = true;
});
var overlay = typeof window !== "undefined" ? (0,_overlay_js__WEBPACK_IMPORTED_MODULE_3__.createOverlay)(_typeof(options.overlay) === "object" ? {
  trustedTypesPolicyName: options.overlay.trustedTypesPolicyName,
  catchRuntimeError: options.overlay.runtimeErrors
} : {
  trustedTypesPolicyName: false,
  catchRuntimeError: options.overlay
}) : {
  send: function send() {}
};

/**
 * @param {Options} options
 * @param {Status} currentStatus
 */
var reloadApp = function reloadApp(_ref, currentStatus) {
  var hot = _ref.hot,
    liveReload = _ref.liveReload;
  if (currentStatus.isUnloading) {
    return;
  }
  var currentHash = currentStatus.currentHash,
    previousHash = currentStatus.previousHash;
  var isInitial = currentHash.indexOf(/** @type {string} */previousHash) >= 0;
  if (isInitial) {
    return;
  }

  /**
   * @param {Window} rootWindow
   * @param {number} intervalId
   */
  function applyReload(rootWindow, intervalId) {
    clearInterval(intervalId);
    _utils_log_js__WEBPACK_IMPORTED_MODULE_4__.log.info("App updated. Reloading...");
    rootWindow.location.reload();
  }
  var search = self.location.search.toLowerCase();
  var allowToHot = search.indexOf("webpack-dev-server-hot=false") === -1;
  var allowToLiveReload = search.indexOf("webpack-dev-server-live-reload=false") === -1;
  if (hot && allowToHot) {
    _utils_log_js__WEBPACK_IMPORTED_MODULE_4__.log.info("App hot update...");
    webpack_hot_emitter_js__WEBPACK_IMPORTED_MODULE_1___default().emit("webpackHotUpdate", currentStatus.currentHash);
    if (typeof self !== "undefined" && self.window) {
      // broadcast update to window
      self.postMessage("webpackHotUpdate".concat(currentStatus.currentHash), "*");
    }
  }
  // allow refreshing the page only if liveReload isn't disabled
  else if (liveReload && allowToLiveReload) {
    var rootWindow = self;

    // use parent window for reload (in case we're in an iframe with no valid src)
    var intervalId = self.setInterval(function () {
      if (rootWindow.location.protocol !== "about:") {
        // reload immediately if protocol is valid
        applyReload(rootWindow, intervalId);
      } else {
        rootWindow = rootWindow.parent;
        if (rootWindow.parent === rootWindow) {
          // if parent equals current window we've reached the root which would continue forever, so trigger a reload anyways
          applyReload(rootWindow, intervalId);
        }
      }
    });
  }
};
var ansiRegex = new RegExp(["[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)", "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))"].join("|"), "g");

/**
 *
 * Strip [ANSI escape codes](https://en.wikipedia.org/wiki/ANSI_escape_code) from a string.
 * Adapted from code originally released by Sindre Sorhus
 * Licensed the MIT License
 *
 * @param {string} string
 * @return {string}
 */
var stripAnsi = function stripAnsi(string) {
  if (typeof string !== "string") {
    throw new TypeError("Expected a `string`, got `".concat(_typeof(string), "`"));
  }
  return string.replace(ansiRegex, "");
};
var onSocketMessage = {
  hot: function hot() {
    if (parsedResourceQuery.hot === "false") {
      return;
    }
    options.hot = true;
  },
  liveReload: function liveReload() {
    if (parsedResourceQuery["live-reload"] === "false") {
      return;
    }
    options.liveReload = true;
  },
  invalid: function invalid() {
    _utils_log_js__WEBPACK_IMPORTED_MODULE_4__.log.info("App updated. Recompiling...");

    // Fixes #1042. overlay doesn't clear if errors are fixed but warnings remain.
    if (options.overlay) {
      overlay.send({
        type: "DISMISS"
      });
    }
    (0,_utils_sendMessage_js__WEBPACK_IMPORTED_MODULE_5__["default"])("Invalid");
  },
  /**
   * @param {string} hash
   */
  hash: function hash(_hash) {
    status.previousHash = status.currentHash;
    status.currentHash = _hash;
  },
  logging: setAllLogLevel,
  /**
   * @param {boolean} value
   */
  overlay: function overlay(value) {
    if (typeof document === "undefined") {
      return;
    }
    options.overlay = value;
    decodeOverlayOptions(options.overlay);
  },
  /**
   * @param {number} value
   */
  reconnect: function reconnect(value) {
    if (parsedResourceQuery.reconnect === "false") {
      return;
    }
    options.reconnect = value;
  },
  /**
   * @param {boolean} value
   */
  progress: function progress(value) {
    options.progress = value;
  },
  /**
   * @param {{ pluginName?: string, percent: number, msg: string }} data
   */
  "progress-update": function progressUpdate(data) {
    if (options.progress) {
      _utils_log_js__WEBPACK_IMPORTED_MODULE_4__.log.info("".concat(data.pluginName ? "[".concat(data.pluginName, "] ") : "").concat(data.percent, "% - ").concat(data.msg, "."));
    }
    if ((0,_progress_js__WEBPACK_IMPORTED_MODULE_6__.isProgressSupported)()) {
      if (typeof options.progress === "string") {
        var progress = document.querySelector("wds-progress");
        if (!progress) {
          (0,_progress_js__WEBPACK_IMPORTED_MODULE_6__.defineProgressElement)();
          progress = document.createElement("wds-progress");
          document.body.appendChild(progress);
        }
        progress.setAttribute("progress", data.percent);
        progress.setAttribute("type", options.progress);
      }
    }
    (0,_utils_sendMessage_js__WEBPACK_IMPORTED_MODULE_5__["default"])("Progress", data);
  },
  "still-ok": function stillOk() {
    _utils_log_js__WEBPACK_IMPORTED_MODULE_4__.log.info("Nothing changed.");
    if (options.overlay) {
      overlay.send({
        type: "DISMISS"
      });
    }
    (0,_utils_sendMessage_js__WEBPACK_IMPORTED_MODULE_5__["default"])("StillOk");
  },
  ok: function ok() {
    (0,_utils_sendMessage_js__WEBPACK_IMPORTED_MODULE_5__["default"])("Ok");
    if (options.overlay) {
      overlay.send({
        type: "DISMISS"
      });
    }
    reloadApp(options, status);
  },
  /**
   * @param {string} file
   */
  "static-changed": function staticChanged(file) {
    _utils_log_js__WEBPACK_IMPORTED_MODULE_4__.log.info("".concat(file ? "\"".concat(file, "\"") : "Content", " from static directory was changed. Reloading..."));
    self.location.reload();
  },
  /**
   * @param {Error[]} warnings
   * @param {any} params
   */
  warnings: function warnings(_warnings, params) {
    _utils_log_js__WEBPACK_IMPORTED_MODULE_4__.log.warn("Warnings while compiling.");
    var printableWarnings = _warnings.map(function (error) {
      var _formatProblem = (0,_overlay_js__WEBPACK_IMPORTED_MODULE_3__.formatProblem)("warning", error),
        header = _formatProblem.header,
        body = _formatProblem.body;
      return "".concat(header, "\n").concat(stripAnsi(body));
    });
    (0,_utils_sendMessage_js__WEBPACK_IMPORTED_MODULE_5__["default"])("Warnings", printableWarnings);
    for (var i = 0; i < printableWarnings.length; i++) {
      _utils_log_js__WEBPACK_IMPORTED_MODULE_4__.log.warn(printableWarnings[i]);
    }
    var overlayWarningsSetting = typeof options.overlay === "boolean" ? options.overlay : options.overlay && options.overlay.warnings;
    if (overlayWarningsSetting) {
      var warningsToDisplay = typeof overlayWarningsSetting === "function" ? _warnings.filter(overlayWarningsSetting) : _warnings;
      if (warningsToDisplay.length) {
        overlay.send({
          type: "BUILD_ERROR",
          level: "warning",
          messages: _warnings
        });
      }
    }
    if (params && params.preventReloading) {
      return;
    }
    reloadApp(options, status);
  },
  /**
   * @param {Error[]} errors
   */
  errors: function errors(_errors) {
    _utils_log_js__WEBPACK_IMPORTED_MODULE_4__.log.error("Errors while compiling. Reload prevented.");
    var printableErrors = _errors.map(function (error) {
      var _formatProblem2 = (0,_overlay_js__WEBPACK_IMPORTED_MODULE_3__.formatProblem)("error", error),
        header = _formatProblem2.header,
        body = _formatProblem2.body;
      return "".concat(header, "\n").concat(stripAnsi(body));
    });
    (0,_utils_sendMessage_js__WEBPACK_IMPORTED_MODULE_5__["default"])("Errors", printableErrors);
    for (var i = 0; i < printableErrors.length; i++) {
      _utils_log_js__WEBPACK_IMPORTED_MODULE_4__.log.error(printableErrors[i]);
    }
    var overlayErrorsSettings = typeof options.overlay === "boolean" ? options.overlay : options.overlay && options.overlay.errors;
    if (overlayErrorsSettings) {
      var errorsToDisplay = typeof overlayErrorsSettings === "function" ? _errors.filter(overlayErrorsSettings) : _errors;
      if (errorsToDisplay.length) {
        overlay.send({
          type: "BUILD_ERROR",
          level: "error",
          messages: _errors
        });
      }
    }
  },
  /**
   * @param {Error} error
   */
  error: function error(_error) {
    _utils_log_js__WEBPACK_IMPORTED_MODULE_4__.log.error(_error);
  },
  close: function close() {
    _utils_log_js__WEBPACK_IMPORTED_MODULE_4__.log.info("Disconnected!");
    if (options.overlay) {
      overlay.send({
        type: "DISMISS"
      });
    }
    (0,_utils_sendMessage_js__WEBPACK_IMPORTED_MODULE_5__["default"])("Close");
  }
};

/**
 * @param {{ protocol?: string, auth?: string, hostname?: string, port?: string, pathname?: string, search?: string, hash?: string, slashes?: boolean }} objURL
 * @returns {string}
 */
var formatURL = function formatURL(objURL) {
  var protocol = objURL.protocol || "";
  if (protocol && protocol.substr(-1) !== ":") {
    protocol += ":";
  }
  var auth = objURL.auth || "";
  if (auth) {
    auth = encodeURIComponent(auth);
    auth = auth.replace(/%3A/i, ":");
    auth += "@";
  }
  var host = "";
  if (objURL.hostname) {
    host = auth + (objURL.hostname.indexOf(":") === -1 ? objURL.hostname : "[".concat(objURL.hostname, "]"));
    if (objURL.port) {
      host += ":".concat(objURL.port);
    }
  }
  var pathname = objURL.pathname || "";
  if (objURL.slashes) {
    host = "//".concat(host || "");
    if (pathname && pathname.charAt(0) !== "/") {
      pathname = "/".concat(pathname);
    }
  } else if (!host) {
    host = "";
  }
  var search = objURL.search || "";
  if (search && search.charAt(0) !== "?") {
    search = "?".concat(search);
  }
  var hash = objURL.hash || "";
  if (hash && hash.charAt(0) !== "#") {
    hash = "#".concat(hash);
  }
  pathname = pathname.replace(/[?#]/g,
  /**
   * @param {string} match
   * @returns {string}
   */
  function (match) {
    return encodeURIComponent(match);
  });
  search = search.replace("#", "%23");
  return "".concat(protocol).concat(host).concat(pathname).concat(search).concat(hash);
};

/**
 * @param {URL & { fromCurrentScript?: boolean }} parsedURL
 * @returns {string}
 */
var createSocketURL = function createSocketURL(parsedURL) {
  var hostname = parsedURL.hostname;

  // Node.js module parses it as `::`
  // `new URL(urlString, [baseURLString])` parses it as '[::]'
  var isInAddrAny = hostname === "0.0.0.0" || hostname === "::" || hostname === "[::]";

  // why do we need this check?
  // hostname n/a for file protocol (example, when using electron, ionic)
  // see: https://github.com/webpack/webpack-dev-server/pull/384
  if (isInAddrAny && self.location.hostname && self.location.protocol.indexOf("http") === 0) {
    hostname = self.location.hostname;
  }
  var socketURLProtocol = parsedURL.protocol || self.location.protocol;

  // When https is used in the app, secure web sockets are always necessary because the browser doesn't accept non-secure web sockets.
  if (socketURLProtocol === "auto:" || hostname && isInAddrAny && self.location.protocol === "https:") {
    socketURLProtocol = self.location.protocol;
  }
  socketURLProtocol = socketURLProtocol.replace(/^(?:http|.+-extension|file)/i, "ws");
  var socketURLAuth = "";

  // `new URL(urlString, [baseURLstring])` doesn't have `auth` property
  // Parse authentication credentials in case we need them
  if (parsedURL.username) {
    socketURLAuth = parsedURL.username;

    // Since HTTP basic authentication does not allow empty username,
    // we only include password if the username is not empty.
    if (parsedURL.password) {
      // Result: <username>:<password>
      socketURLAuth = socketURLAuth.concat(":", parsedURL.password);
    }
  }

  // In case the host is a raw IPv6 address, it can be enclosed in
  // the brackets as the brackets are needed in the final URL string.
  // Need to remove those as url.format blindly adds its own set of brackets
  // if the host string contains colons. That would lead to non-working
  // double brackets (e.g. [[::]]) host
  //
  // All of these web socket url params are optionally passed in through resourceQuery,
  // so we need to fall back to the default if they are not provided
  var socketURLHostname = (hostname || self.location.hostname || "localhost").replace(/^\[(.*)\]$/, "$1");
  var socketURLPort = parsedURL.port;
  if (!socketURLPort || socketURLPort === "0") {
    socketURLPort = self.location.port;
  }

  // If path is provided it'll be passed in via the resourceQuery as a
  // query param so it has to be parsed out of the querystring in order for the
  // client to open the socket to the correct location.
  var socketURLPathname = "/ws";
  if (parsedURL.pathname && !parsedURL.fromCurrentScript) {
    socketURLPathname = parsedURL.pathname;
  }
  return formatURL({
    protocol: socketURLProtocol,
    auth: socketURLAuth,
    hostname: socketURLHostname,
    port: socketURLPort,
    pathname: socketURLPathname,
    slashes: true
  });
};
var socketURL = createSocketURL(parsedResourceQuery);
(0,_socket_js__WEBPACK_IMPORTED_MODULE_2__["default"])(socketURL, onSocketMessage, options.reconnect);


/***/ }),

/***/ "./node_modules/webpack-dev-server/client/modules/logger/index.js":
/*!************************************************************************!*\
  !*** ./node_modules/webpack-dev-server/client/modules/logger/index.js ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, exports) => {

/******/ (function() { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./client-src/modules/logger/tapable.js":
/*!**********************************************!*\
  !*** ./client-src/modules/logger/tapable.js ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, __nested_webpack_exports__, __nested_webpack_require_372__) {

__nested_webpack_require_372__.r(__nested_webpack_exports__);
/* harmony export */ __nested_webpack_require_372__.d(__nested_webpack_exports__, {
/* harmony export */   SyncBailHook: function() { return /* binding */ SyncBailHook; }
/* harmony export */ });
function SyncBailHook() {
  return {
    call: function call() {}
  };
}

/**
 * Client stub for tapable SyncBailHook
 */
// eslint-disable-next-line import/prefer-default-export


/***/ }),

/***/ "./node_modules/webpack/lib/logging/Logger.js":
/*!****************************************************!*\
  !*** ./node_modules/webpack/lib/logging/Logger.js ***!
  \****************************************************/
/***/ (function(module) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/



function _typeof(o) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof (typeof Symbol !== "undefined" ? Symbol : function (i) { return i; }) && "symbol" == typeof (typeof Symbol !== "undefined" ? Symbol : function (i) { return i; }).iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof (typeof Symbol !== "undefined" ? Symbol : function (i) { return i; }) && o.constructor === (typeof Symbol !== "undefined" ? Symbol : function (i) { return i; }) && o !== (typeof Symbol !== "undefined" ? Symbol : function (i) { return i; }).prototype ? "symbol" : typeof o;
  }, _typeof(o);
}
function _toConsumableArray(r) {
  return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread();
}
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
  }
}
function _iterableToArray(r) {
  if ("undefined" != typeof (typeof Symbol !== "undefined" ? Symbol : function (i) { return i; }) && null != r[(typeof Symbol !== "undefined" ? Symbol : function (i) { return i; }).iterator] || null != r["@@iterator"]) return Array.from(r);
}
function _arrayWithoutHoles(r) {
  if (Array.isArray(r)) return _arrayLikeToArray(r);
}
function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
function _classCallCheck(a, n) {
  if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function");
}
function _defineProperties(e, r) {
  for (var t = 0; t < r.length; t++) {
    var o = r[t];
    o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o);
  }
}
function _createClass(e, r, t) {
  return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", {
    writable: !1
  }), e;
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == _typeof(i) ? i : i + "";
}
function _toPrimitive(t, r) {
  if ("object" != _typeof(t) || !t) return t;
  var e = t[(typeof Symbol !== "undefined" ? Symbol : function (i) { return i; }).toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != _typeof(i)) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
var LogType = Object.freeze({
  error: (/** @type {"error"} */"error"),
  // message, c style arguments
  warn: (/** @type {"warn"} */"warn"),
  // message, c style arguments
  info: (/** @type {"info"} */"info"),
  // message, c style arguments
  log: (/** @type {"log"} */"log"),
  // message, c style arguments
  debug: (/** @type {"debug"} */"debug"),
  // message, c style arguments

  trace: (/** @type {"trace"} */"trace"),
  // no arguments

  group: (/** @type {"group"} */"group"),
  // [label]
  groupCollapsed: (/** @type {"groupCollapsed"} */"groupCollapsed"),
  // [label]
  groupEnd: (/** @type {"groupEnd"} */"groupEnd"),
  // [label]

  profile: (/** @type {"profile"} */"profile"),
  // [profileName]
  profileEnd: (/** @type {"profileEnd"} */"profileEnd"),
  // [profileName]

  time: (/** @type {"time"} */"time"),
  // name, time as [seconds, nanoseconds]

  clear: (/** @type {"clear"} */"clear"),
  // no arguments
  status: (/** @type {"status"} */"status") // message, arguments
});
module.exports.LogType = LogType;

/** @typedef {typeof LogType[keyof typeof LogType]} LogTypeEnum */

var LOG_SYMBOL = (typeof Symbol !== "undefined" ? Symbol : function (i) { return i; })("webpack logger raw log method");
var TIMERS_SYMBOL = (typeof Symbol !== "undefined" ? Symbol : function (i) { return i; })("webpack logger times");
var TIMERS_AGGREGATES_SYMBOL = (typeof Symbol !== "undefined" ? Symbol : function (i) { return i; })("webpack logger aggregated times");
var WebpackLogger = /*#__PURE__*/function () {
  /**
   * @param {(type: LogTypeEnum, args?: EXPECTED_ANY[]) => void} log log function
   * @param {(name: string | (() => string)) => WebpackLogger} getChildLogger function to create child logger
   */
  function WebpackLogger(log, getChildLogger) {
    _classCallCheck(this, WebpackLogger);
    this[LOG_SYMBOL] = log;
    this.getChildLogger = getChildLogger;
  }

  /**
   * @param {...EXPECTED_ANY} args args
   */
  return _createClass(WebpackLogger, [{
    key: "error",
    value: function error() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      this[LOG_SYMBOL](LogType.error, args);
    }

    /**
     * @param {...EXPECTED_ANY} args args
     */
  }, {
    key: "warn",
    value: function warn() {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      this[LOG_SYMBOL](LogType.warn, args);
    }

    /**
     * @param {...EXPECTED_ANY} args args
     */
  }, {
    key: "info",
    value: function info() {
      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }
      this[LOG_SYMBOL](LogType.info, args);
    }

    /**
     * @param {...EXPECTED_ANY} args args
     */
  }, {
    key: "log",
    value: function log() {
      for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }
      this[LOG_SYMBOL](LogType.log, args);
    }

    /**
     * @param {...EXPECTED_ANY} args args
     */
  }, {
    key: "debug",
    value: function debug() {
      for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
        args[_key5] = arguments[_key5];
      }
      this[LOG_SYMBOL](LogType.debug, args);
    }

    /**
     * @param {EXPECTED_ANY} assertion assertion
     * @param {...EXPECTED_ANY} args args
     */
  }, {
    key: "assert",
    value: function assert(assertion) {
      if (!assertion) {
        for (var _len6 = arguments.length, args = new Array(_len6 > 1 ? _len6 - 1 : 0), _key6 = 1; _key6 < _len6; _key6++) {
          args[_key6 - 1] = arguments[_key6];
        }
        this[LOG_SYMBOL](LogType.error, args);
      }
    }
  }, {
    key: "trace",
    value: function trace() {
      this[LOG_SYMBOL](LogType.trace, ["Trace"]);
    }
  }, {
    key: "clear",
    value: function clear() {
      this[LOG_SYMBOL](LogType.clear);
    }

    /**
     * @param {...EXPECTED_ANY} args args
     */
  }, {
    key: "status",
    value: function status() {
      for (var _len7 = arguments.length, args = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
        args[_key7] = arguments[_key7];
      }
      this[LOG_SYMBOL](LogType.status, args);
    }

    /**
     * @param {...EXPECTED_ANY} args args
     */
  }, {
    key: "group",
    value: function group() {
      for (var _len8 = arguments.length, args = new Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
        args[_key8] = arguments[_key8];
      }
      this[LOG_SYMBOL](LogType.group, args);
    }

    /**
     * @param {...EXPECTED_ANY} args args
     */
  }, {
    key: "groupCollapsed",
    value: function groupCollapsed() {
      for (var _len9 = arguments.length, args = new Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
        args[_key9] = arguments[_key9];
      }
      this[LOG_SYMBOL](LogType.groupCollapsed, args);
    }
  }, {
    key: "groupEnd",
    value: function groupEnd() {
      this[LOG_SYMBOL](LogType.groupEnd);
    }

    /**
     * @param {string=} label label
     */
  }, {
    key: "profile",
    value: function profile(label) {
      this[LOG_SYMBOL](LogType.profile, [label]);
    }

    /**
     * @param {string=} label label
     */
  }, {
    key: "profileEnd",
    value: function profileEnd(label) {
      this[LOG_SYMBOL](LogType.profileEnd, [label]);
    }

    /**
     * @param {string} label label
     */
  }, {
    key: "time",
    value: function time(label) {
      /** @type {Map<string | undefined, [number, number]>} */
      this[TIMERS_SYMBOL] = this[TIMERS_SYMBOL] || new Map();
      this[TIMERS_SYMBOL].set(label, process.hrtime());
    }

    /**
     * @param {string=} label label
     */
  }, {
    key: "timeLog",
    value: function timeLog(label) {
      var prev = this[TIMERS_SYMBOL] && this[TIMERS_SYMBOL].get(label);
      if (!prev) {
        throw new Error("No such label '".concat(label, "' for WebpackLogger.timeLog()"));
      }
      var time = process.hrtime(prev);
      this[LOG_SYMBOL](LogType.time, [label].concat(_toConsumableArray(time)));
    }

    /**
     * @param {string=} label label
     */
  }, {
    key: "timeEnd",
    value: function timeEnd(label) {
      var prev = this[TIMERS_SYMBOL] && this[TIMERS_SYMBOL].get(label);
      if (!prev) {
        throw new Error("No such label '".concat(label, "' for WebpackLogger.timeEnd()"));
      }
      var time = process.hrtime(prev);
      /** @type {Map<string | undefined, [number, number]>} */
      this[TIMERS_SYMBOL].delete(label);
      this[LOG_SYMBOL](LogType.time, [label].concat(_toConsumableArray(time)));
    }

    /**
     * @param {string=} label label
     */
  }, {
    key: "timeAggregate",
    value: function timeAggregate(label) {
      var prev = this[TIMERS_SYMBOL] && this[TIMERS_SYMBOL].get(label);
      if (!prev) {
        throw new Error("No such label '".concat(label, "' for WebpackLogger.timeAggregate()"));
      }
      var time = process.hrtime(prev);
      /** @type {Map<string | undefined, [number, number]>} */
      this[TIMERS_SYMBOL].delete(label);
      /** @type {Map<string | undefined, [number, number]>} */
      this[TIMERS_AGGREGATES_SYMBOL] = this[TIMERS_AGGREGATES_SYMBOL] || new Map();
      var current = this[TIMERS_AGGREGATES_SYMBOL].get(label);
      if (current !== undefined) {
        if (time[1] + current[1] > 1e9) {
          time[0] += current[0] + 1;
          time[1] = time[1] - 1e9 + current[1];
        } else {
          time[0] += current[0];
          time[1] += current[1];
        }
      }
      this[TIMERS_AGGREGATES_SYMBOL].set(label, time);
    }

    /**
     * @param {string=} label label
     */
  }, {
    key: "timeAggregateEnd",
    value: function timeAggregateEnd(label) {
      if (this[TIMERS_AGGREGATES_SYMBOL] === undefined) return;
      var time = this[TIMERS_AGGREGATES_SYMBOL].get(label);
      if (time === undefined) return;
      this[TIMERS_AGGREGATES_SYMBOL].delete(label);
      this[LOG_SYMBOL](LogType.time, [label].concat(_toConsumableArray(time)));
    }
  }]);
}();
module.exports.Logger = WebpackLogger;

/***/ }),

/***/ "./node_modules/webpack/lib/logging/createConsoleLogger.js":
/*!*****************************************************************!*\
  !*** ./node_modules/webpack/lib/logging/createConsoleLogger.js ***!
  \*****************************************************************/
/***/ (function(module, __unused_webpack_exports, __nested_webpack_require_12803__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/



function _slicedToArray(r, e) {
  return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest();
}
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _iterableToArrayLimit(r, l) {
  var t = null == r ? null : "undefined" != typeof (typeof Symbol !== "undefined" ? Symbol : function (i) { return i; }) && r[(typeof Symbol !== "undefined" ? Symbol : function (i) { return i; }).iterator] || r["@@iterator"];
  if (null != t) {
    var e,
      n,
      i,
      u,
      a = [],
      f = !0,
      o = !1;
    try {
      if (i = (t = t.call(r)).next, 0 === l) {
        if (Object(t) !== t) return;
        f = !1;
      } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
    } catch (r) {
      o = !0, n = r;
    } finally {
      try {
        if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
      } finally {
        if (o) throw n;
      }
    }
    return a;
  }
}
function _arrayWithHoles(r) {
  if (Array.isArray(r)) return r;
}
function _toConsumableArray(r) {
  return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread();
}
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
  }
}
function _iterableToArray(r) {
  if ("undefined" != typeof (typeof Symbol !== "undefined" ? Symbol : function (i) { return i; }) && null != r[(typeof Symbol !== "undefined" ? Symbol : function (i) { return i; }).iterator] || null != r["@@iterator"]) return Array.from(r);
}
function _arrayWithoutHoles(r) {
  if (Array.isArray(r)) return _arrayLikeToArray(r);
}
function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
function _typeof(o) {
  "@babel/helpers - typeof";

  return _typeof = "function" == typeof (typeof Symbol !== "undefined" ? Symbol : function (i) { return i; }) && "symbol" == typeof (typeof Symbol !== "undefined" ? Symbol : function (i) { return i; }).iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof (typeof Symbol !== "undefined" ? Symbol : function (i) { return i; }) && o.constructor === (typeof Symbol !== "undefined" ? Symbol : function (i) { return i; }) && o !== (typeof Symbol !== "undefined" ? Symbol : function (i) { return i; }).prototype ? "symbol" : typeof o;
  }, _typeof(o);
}
var _require = __nested_webpack_require_12803__(/*! ./Logger */ "./node_modules/webpack/lib/logging/Logger.js"),
  LogType = _require.LogType;

/** @typedef {import("../../declarations/WebpackOptions").FilterItemTypes} FilterItemTypes */
/** @typedef {import("../../declarations/WebpackOptions").FilterTypes} FilterTypes */
/** @typedef {import("./Logger").LogTypeEnum} LogTypeEnum */

/** @typedef {(item: string) => boolean} FilterFunction */
/** @typedef {(value: string, type: LogTypeEnum, args?: EXPECTED_ANY[]) => void} LoggingFunction */

/**
 * @typedef {object} LoggerConsole
 * @property {() => void} clear
 * @property {() => void} trace
 * @property {(...args: EXPECTED_ANY[]) => void} info
 * @property {(...args: EXPECTED_ANY[]) => void} log
 * @property {(...args: EXPECTED_ANY[]) => void} warn
 * @property {(...args: EXPECTED_ANY[]) => void} error
 * @property {(...args: EXPECTED_ANY[]) => void=} debug
 * @property {(...args: EXPECTED_ANY[]) => void=} group
 * @property {(...args: EXPECTED_ANY[]) => void=} groupCollapsed
 * @property {(...args: EXPECTED_ANY[]) => void=} groupEnd
 * @property {(...args: EXPECTED_ANY[]) => void=} status
 * @property {(...args: EXPECTED_ANY[]) => void=} profile
 * @property {(...args: EXPECTED_ANY[]) => void=} profileEnd
 * @property {(...args: EXPECTED_ANY[]) => void=} logTime
 */

/**
 * @typedef {object} LoggerOptions
 * @property {false|true|"none"|"error"|"warn"|"info"|"log"|"verbose"} level loglevel
 * @property {FilterTypes|boolean} debug filter for debug logging
 * @property {LoggerConsole} console the console to log to
 */

/**
 * @param {FilterItemTypes} item an input item
 * @returns {FilterFunction | undefined} filter function
 */
var filterToFunction = function filterToFunction(item) {
  if (typeof item === "string") {
    var regExp = new RegExp("[\\\\/]".concat(item.replace(/[-[\]{}()*+?.\\^$|]/g, "\\$&"), "([\\\\/]|$|!|\\?)"));
    return function (ident) {
      return regExp.test(ident);
    };
  }
  if (item && _typeof(item) === "object" && typeof item.test === "function") {
    return function (ident) {
      return item.test(ident);
    };
  }
  if (typeof item === "function") {
    return item;
  }
  if (typeof item === "boolean") {
    return function () {
      return item;
    };
  }
};

/**
 * @enum {number}
 */
var LogLevel = {
  none: 6,
  false: 6,
  error: 5,
  warn: 4,
  info: 3,
  log: 2,
  true: 2,
  verbose: 1
};

/**
 * @param {LoggerOptions} options options object
 * @returns {LoggingFunction} logging function
 */
module.exports = function (_ref) {
  var _ref$level = _ref.level,
    level = _ref$level === void 0 ? "info" : _ref$level,
    _ref$debug = _ref.debug,
    debug = _ref$debug === void 0 ? false : _ref$debug,
    console = _ref.console;
  var debugFilters = /** @type {FilterFunction[]} */

  typeof debug === "boolean" ? [function () {
    return debug;
  }] : /** @type {FilterItemTypes[]} */[].concat(debug).map(filterToFunction);
  var loglevel = LogLevel["".concat(level)] || 0;

  /**
   * @param {string} name name of the logger
   * @param {LogTypeEnum} type type of the log entry
   * @param {EXPECTED_ANY[]=} args arguments of the log entry
   * @returns {void}
   */
  var logger = function logger(name, type, args) {
    var labeledArgs = function labeledArgs() {
      if (Array.isArray(args)) {
        if (args.length > 0 && typeof args[0] === "string") {
          return ["[".concat(name, "] ").concat(args[0])].concat(_toConsumableArray(args.slice(1)));
        }
        return ["[".concat(name, "]")].concat(_toConsumableArray(args));
      }
      return [];
    };
    var debug = debugFilters.some(function (f) {
      return f(name);
    });
    switch (type) {
      case LogType.debug:
        if (!debug) return;
        if (typeof console.debug === "function") {
          console.debug.apply(console, _toConsumableArray(labeledArgs()));
        } else {
          console.log.apply(console, _toConsumableArray(labeledArgs()));
        }
        break;
      case LogType.log:
        if (!debug && loglevel > LogLevel.log) return;
        console.log.apply(console, _toConsumableArray(labeledArgs()));
        break;
      case LogType.info:
        if (!debug && loglevel > LogLevel.info) return;
        console.info.apply(console, _toConsumableArray(labeledArgs()));
        break;
      case LogType.warn:
        if (!debug && loglevel > LogLevel.warn) return;
        console.warn.apply(console, _toConsumableArray(labeledArgs()));
        break;
      case LogType.error:
        if (!debug && loglevel > LogLevel.error) return;
        console.error.apply(console, _toConsumableArray(labeledArgs()));
        break;
      case LogType.trace:
        if (!debug) return;
        console.trace();
        break;
      case LogType.groupCollapsed:
        if (!debug && loglevel > LogLevel.log) return;
        if (!debug && loglevel > LogLevel.verbose) {
          if (typeof console.groupCollapsed === "function") {
            console.groupCollapsed.apply(console, _toConsumableArray(labeledArgs()));
          } else {
            console.log.apply(console, _toConsumableArray(labeledArgs()));
          }
          break;
        }
      // falls through
      case LogType.group:
        if (!debug && loglevel > LogLevel.log) return;
        if (typeof console.group === "function") {
          console.group.apply(console, _toConsumableArray(labeledArgs()));
        } else {
          console.log.apply(console, _toConsumableArray(labeledArgs()));
        }
        break;
      case LogType.groupEnd:
        if (!debug && loglevel > LogLevel.log) return;
        if (typeof console.groupEnd === "function") {
          console.groupEnd();
        }
        break;
      case LogType.time:
        {
          if (!debug && loglevel > LogLevel.log) return;
          var _args = _slicedToArray(/** @type {[string, number, number]} */
            args, 3),
            label = _args[0],
            start = _args[1],
            end = _args[2];
          var ms = start * 1000 + end / 1000000;
          var msg = "[".concat(name, "] ").concat(label, ": ").concat(ms, " ms");
          if (typeof console.logTime === "function") {
            console.logTime(msg);
          } else {
            console.log(msg);
          }
          break;
        }
      case LogType.profile:
        if (typeof console.profile === "function") {
          console.profile.apply(console, _toConsumableArray(labeledArgs()));
        }
        break;
      case LogType.profileEnd:
        if (typeof console.profileEnd === "function") {
          console.profileEnd.apply(console, _toConsumableArray(labeledArgs()));
        }
        break;
      case LogType.clear:
        if (!debug && loglevel > LogLevel.log) return;
        if (typeof console.clear === "function") {
          console.clear();
        }
        break;
      case LogType.status:
        if (!debug && loglevel > LogLevel.info) return;
        if (typeof console.status === "function") {
          if (!args || args.length === 0) {
            console.status();
          } else {
            console.status.apply(console, _toConsumableArray(labeledArgs()));
          }
        } else if (args && args.length !== 0) {
          console.info.apply(console, _toConsumableArray(labeledArgs()));
        }
        break;
      default:
        throw new Error("Unexpected LogType ".concat(type));
    }
  };
  return logger;
};

/***/ }),

/***/ "./node_modules/webpack/lib/logging/runtime.js":
/*!*****************************************************!*\
  !*** ./node_modules/webpack/lib/logging/runtime.js ***!
  \*****************************************************/
/***/ (function(module, __unused_webpack_exports, __nested_webpack_require_23778__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/



function _extends() {
  return _extends = Object.assign ? Object.assign.bind() : function (n) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
    }
    return n;
  }, _extends.apply(null, arguments);
}
var _require = __nested_webpack_require_23778__(/*! tapable */ "./client-src/modules/logger/tapable.js"),
  SyncBailHook = _require.SyncBailHook;
var _require2 = __nested_webpack_require_23778__(/*! ./Logger */ "./node_modules/webpack/lib/logging/Logger.js"),
  Logger = _require2.Logger;
var createConsoleLogger = __nested_webpack_require_23778__(/*! ./createConsoleLogger */ "./node_modules/webpack/lib/logging/createConsoleLogger.js");

/** @type {createConsoleLogger.LoggerOptions} */
var currentDefaultLoggerOptions = {
  level: "info",
  debug: false,
  console: console
};
var currentDefaultLogger = createConsoleLogger(currentDefaultLoggerOptions);

/**
 * @param {string} name name of the logger
 * @returns {Logger} a logger
 */
module.exports.getLogger = function (name) {
  return new Logger(function (type, args) {
    if (module.exports.hooks.log.call(name, type, args) === undefined) {
      currentDefaultLogger(name, type, args);
    }
  }, function (childName) {
    return module.exports.getLogger("".concat(name, "/").concat(childName));
  });
};

/**
 * @param {createConsoleLogger.LoggerOptions} options new options, merge with old options
 * @returns {void}
 */
module.exports.configureDefaultLogger = function (options) {
  _extends(currentDefaultLoggerOptions, options);
  currentDefaultLogger = createConsoleLogger(currentDefaultLoggerOptions);
};
module.exports.hooks = {
  log: new SyncBailHook(["origin", "type", "args"])
};

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/
/******/ 	// The require function
/******/ 	function __nested_webpack_require_25853__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __nested_webpack_require_25853__);
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	!function() {
/******/ 		// define getter functions for harmony exports
/******/ 		__nested_webpack_require_25853__.d = function(exports, definition) {
/******/ 			for(var key in definition) {
/******/ 				if(__nested_webpack_require_25853__.o(definition, key) && !__nested_webpack_require_25853__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	}();
/******/
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	!function() {
/******/ 		__nested_webpack_require_25853__.o = function(obj, prop) { return Object.prototype.hasOwnProperty.call(obj, prop); }
/******/ 	}();
/******/
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	!function() {
/******/ 		// define __esModule on exports
/******/ 		__nested_webpack_require_25853__.r = function(exports) {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	}();
/******/
/************************************************************************/
var __nested_webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
!function() {
/*!********************************************!*\
  !*** ./client-src/modules/logger/index.js ***!
  \********************************************/
__nested_webpack_require_25853__.r(__nested_webpack_exports__);
/* harmony export */ __nested_webpack_require_25853__.d(__nested_webpack_exports__, {
/* harmony export */   "default": function() { return /* reexport default export from named module */ webpack_lib_logging_runtime_js__WEBPACK_IMPORTED_MODULE_0__; }
/* harmony export */ });
/* harmony import */ var webpack_lib_logging_runtime_js__WEBPACK_IMPORTED_MODULE_0__ = __nested_webpack_require_25853__(/*! webpack/lib/logging/runtime.js */ "./node_modules/webpack/lib/logging/runtime.js");

}();
var __webpack_export_target__ = exports;
for(var __webpack_i__ in __nested_webpack_exports__) __webpack_export_target__[__webpack_i__] = __nested_webpack_exports__[__webpack_i__];
if(__nested_webpack_exports__.__esModule) Object.defineProperty(__webpack_export_target__, "__esModule", { value: true });
/******/ })()
;

/***/ }),

/***/ "./node_modules/webpack-dev-server/client/overlay.js":
/*!***********************************************************!*\
  !*** ./node_modules/webpack-dev-server/client/overlay.js ***!
  \***********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   createOverlay: () => (/* binding */ createOverlay),
/* harmony export */   formatProblem: () => (/* binding */ formatProblem)
/* harmony export */ });
/* harmony import */ var ansi_html_community__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ansi-html-community */ "./node_modules/ansi-html-community/index.js");
/* harmony import */ var ansi_html_community__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(ansi_html_community__WEBPACK_IMPORTED_MODULE_0__);
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
// The error overlay is inspired (and mostly copied) from Create React App (https://github.com/facebookincubator/create-react-app)
// They, in turn, got inspired by webpack-hot-middleware (https://github.com/glenjamin/webpack-hot-middleware).



/**
 * @type {(input: string, position: number) => string}
 */
var getCodePoint = String.prototype.codePointAt ? function (input, position) {
  return input.codePointAt(position);
} : function (input, position) {
  return (input.charCodeAt(position) - 0xd800) * 0x400 + input.charCodeAt(position + 1) - 0xdc00 + 0x10000;
};

/**
 * @param {string} macroText
 * @param {RegExp} macroRegExp
 * @param {(input: string) => string} macroReplacer
 * @returns {string}
 */
var replaceUsingRegExp = function replaceUsingRegExp(macroText, macroRegExp, macroReplacer) {
  macroRegExp.lastIndex = 0;
  var replaceMatch = macroRegExp.exec(macroText);
  var replaceResult;
  if (replaceMatch) {
    replaceResult = "";
    var replaceLastIndex = 0;
    do {
      if (replaceLastIndex !== replaceMatch.index) {
        replaceResult += macroText.substring(replaceLastIndex, replaceMatch.index);
      }
      var replaceInput = replaceMatch[0];
      replaceResult += macroReplacer(replaceInput);
      replaceLastIndex = replaceMatch.index + replaceInput.length;
      // eslint-disable-next-line no-cond-assign
    } while (replaceMatch = macroRegExp.exec(macroText));
    if (replaceLastIndex !== macroText.length) {
      replaceResult += macroText.substring(replaceLastIndex);
    }
  } else {
    replaceResult = macroText;
  }
  return replaceResult;
};
var references = {
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&apos;",
  "&": "&amp;"
};

/**
 * @param {string} text text
 * @returns {string}
 */
function encode(text) {
  if (!text) {
    return "";
  }
  return replaceUsingRegExp(text, /[<>'"&]/g, function (input) {
    var result = references[input];
    if (!result) {
      var code = input.length > 1 ? getCodePoint(input, 0) : input.charCodeAt(0);
      result = "&#".concat(code, ";");
    }
    return result;
  });
}

/**
 * @typedef {Object} StateDefinitions
 * @property {{[event: string]: { target: string; actions?: Array<string> }}} [on]
 */

/**
 * @typedef {Object} Options
 * @property {{[state: string]: StateDefinitions}} states
 * @property {object} context;
 * @property {string} initial
 */

/**
 * @typedef {Object} Implementation
 * @property {{[actionName: string]: (ctx: object, event: any) => object}} actions
 */

/**
 * A simplified `createMachine` from `@xstate/fsm` with the following differences:
 *
 *  - the returned machine is technically a "service". No `interpret(machine).start()` is needed.
 *  - the state definition only support `on` and target must be declared with { target: 'nextState', actions: [] } explicitly.
 *  - event passed to `send` must be an object with `type` property.
 *  - actions implementation will be [assign action](https://xstate.js.org/docs/guides/context.html#assign-action) if you return any value.
 *  Do not return anything if you just want to invoke side effect.
 *
 * The goal of this custom function is to avoid installing the entire `'xstate/fsm'` package, while enabling modeling using
 * state machine. You can copy the first parameter into the editor at https://stately.ai/viz to visualize the state machine.
 *
 * @param {Options} options
 * @param {Implementation} implementation
 */
function createMachine(_ref, _ref2) {
  var states = _ref.states,
    context = _ref.context,
    initial = _ref.initial;
  var actions = _ref2.actions;
  var currentState = initial;
  var currentContext = context;
  return {
    send: function send(event) {
      var currentStateOn = states[currentState].on;
      var transitionConfig = currentStateOn && currentStateOn[event.type];
      if (transitionConfig) {
        currentState = transitionConfig.target;
        if (transitionConfig.actions) {
          transitionConfig.actions.forEach(function (actName) {
            var actionImpl = actions[actName];
            var nextContextValue = actionImpl && actionImpl(currentContext, event);
            if (nextContextValue) {
              currentContext = _objectSpread(_objectSpread({}, currentContext), nextContextValue);
            }
          });
        }
      }
    }
  };
}

/**
 * @typedef {Object} ShowOverlayData
 * @property {'warning' | 'error'} level
 * @property {Array<string  | { moduleIdentifier?: string, moduleName?: string, loc?: string, message?: string }>} messages
 * @property {'build' | 'runtime'} messageSource
 */

/**
 * @typedef {Object} CreateOverlayMachineOptions
 * @property {(data: ShowOverlayData) => void} showOverlay
 * @property {() => void} hideOverlay
 */

/**
 * @param {CreateOverlayMachineOptions} options
 */
var createOverlayMachine = function createOverlayMachine(options) {
  var hideOverlay = options.hideOverlay,
    showOverlay = options.showOverlay;
  return createMachine({
    initial: "hidden",
    context: {
      level: "error",
      messages: [],
      messageSource: "build"
    },
    states: {
      hidden: {
        on: {
          BUILD_ERROR: {
            target: "displayBuildError",
            actions: ["setMessages", "showOverlay"]
          },
          RUNTIME_ERROR: {
            target: "displayRuntimeError",
            actions: ["setMessages", "showOverlay"]
          }
        }
      },
      displayBuildError: {
        on: {
          DISMISS: {
            target: "hidden",
            actions: ["dismissMessages", "hideOverlay"]
          },
          BUILD_ERROR: {
            target: "displayBuildError",
            actions: ["appendMessages", "showOverlay"]
          }
        }
      },
      displayRuntimeError: {
        on: {
          DISMISS: {
            target: "hidden",
            actions: ["dismissMessages", "hideOverlay"]
          },
          RUNTIME_ERROR: {
            target: "displayRuntimeError",
            actions: ["appendMessages", "showOverlay"]
          },
          BUILD_ERROR: {
            target: "displayBuildError",
            actions: ["setMessages", "showOverlay"]
          }
        }
      }
    }
  }, {
    actions: {
      dismissMessages: function dismissMessages() {
        return {
          messages: [],
          level: "error",
          messageSource: "build"
        };
      },
      appendMessages: function appendMessages(context, event) {
        return {
          messages: context.messages.concat(event.messages),
          level: event.level || context.level,
          messageSource: event.type === "RUNTIME_ERROR" ? "runtime" : "build"
        };
      },
      setMessages: function setMessages(context, event) {
        return {
          messages: event.messages,
          level: event.level || context.level,
          messageSource: event.type === "RUNTIME_ERROR" ? "runtime" : "build"
        };
      },
      hideOverlay: hideOverlay,
      showOverlay: showOverlay
    }
  });
};

/**
 *
 * @param {Error} error
 */
var parseErrorToStacks = function parseErrorToStacks(error) {
  if (!error || !(error instanceof Error)) {
    throw new Error("parseErrorToStacks expects Error object");
  }
  if (typeof error.stack === "string") {
    return error.stack.split("\n").filter(function (stack) {
      return stack !== "Error: ".concat(error.message);
    });
  }
};

/**
 * @callback ErrorCallback
 * @param {ErrorEvent} error
 * @returns {void}
 */

/**
 * @param {ErrorCallback} callback
 */
var listenToRuntimeError = function listenToRuntimeError(callback) {
  window.addEventListener("error", callback);
  return function cleanup() {
    window.removeEventListener("error", callback);
  };
};

/**
 * @callback UnhandledRejectionCallback
 * @param {PromiseRejectionEvent} rejectionEvent
 * @returns {void}
 */

/**
 * @param {UnhandledRejectionCallback} callback
 */
var listenToUnhandledRejection = function listenToUnhandledRejection(callback) {
  window.addEventListener("unhandledrejection", callback);
  return function cleanup() {
    window.removeEventListener("unhandledrejection", callback);
  };
};

// Styles are inspired by `react-error-overlay`

var msgStyles = {
  error: {
    backgroundColor: "rgba(206, 17, 38, 0.1)",
    color: "#fccfcf"
  },
  warning: {
    backgroundColor: "rgba(251, 245, 180, 0.1)",
    color: "#fbf5b4"
  }
};
var iframeStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: "100vw",
  height: "100vh",
  border: "none",
  "z-index": 9999999999
};
var containerStyle = {
  position: "fixed",
  boxSizing: "border-box",
  left: 0,
  top: 0,
  right: 0,
  bottom: 0,
  width: "100vw",
  height: "100vh",
  fontSize: "large",
  padding: "2rem 2rem 4rem 2rem",
  lineHeight: "1.2",
  whiteSpace: "pre-wrap",
  overflow: "auto",
  backgroundColor: "rgba(0, 0, 0, 0.9)",
  color: "white"
};
var headerStyle = {
  color: "#e83b46",
  fontSize: "2em",
  whiteSpace: "pre-wrap",
  fontFamily: "sans-serif",
  margin: "0 2rem 2rem 0",
  flex: "0 0 auto",
  maxHeight: "50%",
  overflow: "auto"
};
var dismissButtonStyle = {
  color: "#ffffff",
  lineHeight: "1rem",
  fontSize: "1.5rem",
  padding: "1rem",
  cursor: "pointer",
  position: "absolute",
  right: 0,
  top: 0,
  backgroundColor: "transparent",
  border: "none"
};
var msgTypeStyle = {
  color: "#e83b46",
  fontSize: "1.2em",
  marginBottom: "1rem",
  fontFamily: "sans-serif"
};
var msgTextStyle = {
  lineHeight: "1.5",
  fontSize: "1rem",
  fontFamily: "Menlo, Consolas, monospace"
};

// ANSI HTML

var colors = {
  reset: ["transparent", "transparent"],
  black: "181818",
  red: "E36049",
  green: "B3CB74",
  yellow: "FFD080",
  blue: "7CAFC2",
  magenta: "7FACCA",
  cyan: "C3C2EF",
  lightgrey: "EBE7E3",
  darkgrey: "6D7891"
};
ansi_html_community__WEBPACK_IMPORTED_MODULE_0___default().setColors(colors);

/**
 * @param {string} type
 * @param {string  | { file?: string, moduleName?: string, loc?: string, message?: string; stack?: string[] }} item
 * @returns {{ header: string, body: string }}
 */
var formatProblem = function formatProblem(type, item) {
  var header = type === "warning" ? "WARNING" : "ERROR";
  var body = "";
  if (typeof item === "string") {
    body += item;
  } else {
    var file = item.file || "";
    // eslint-disable-next-line no-nested-ternary
    var moduleName = item.moduleName ? item.moduleName.indexOf("!") !== -1 ? "".concat(item.moduleName.replace(/^(\s|\S)*!/, ""), " (").concat(item.moduleName, ")") : "".concat(item.moduleName) : "";
    var loc = item.loc;
    header += "".concat(moduleName || file ? " in ".concat(moduleName ? "".concat(moduleName).concat(file ? " (".concat(file, ")") : "") : file).concat(loc ? " ".concat(loc) : "") : "");
    body += item.message || "";
  }
  if (Array.isArray(item.stack)) {
    item.stack.forEach(function (stack) {
      if (typeof stack === "string") {
        body += "\r\n".concat(stack);
      }
    });
  }
  return {
    header: header,
    body: body
  };
};

/**
 * @typedef {Object} CreateOverlayOptions
 * @property {string | null} trustedTypesPolicyName
 * @property {boolean | (error: Error) => void} [catchRuntimeError]
 */

/**
 *
 * @param {CreateOverlayOptions} options
 */
var createOverlay = function createOverlay(options) {
  /** @type {HTMLIFrameElement | null | undefined} */
  var iframeContainerElement;
  /** @type {HTMLDivElement | null | undefined} */
  var containerElement;
  /** @type {HTMLDivElement | null | undefined} */
  var headerElement;
  /** @type {Array<(element: HTMLDivElement) => void>} */
  var onLoadQueue = [];
  /** @type {TrustedTypePolicy | undefined} */
  var overlayTrustedTypesPolicy;

  /**
   *
   * @param {HTMLElement} element
   * @param {CSSStyleDeclaration} style
   */
  function applyStyle(element, style) {
    Object.keys(style).forEach(function (prop) {
      element.style[prop] = style[prop];
    });
  }

  /**
   * @param {string | null} trustedTypesPolicyName
   */
  function createContainer(trustedTypesPolicyName) {
    // Enable Trusted Types if they are available in the current browser.
    if (window.trustedTypes) {
      overlayTrustedTypesPolicy = window.trustedTypes.createPolicy(trustedTypesPolicyName || "webpack-dev-server#overlay", {
        createHTML: function createHTML(value) {
          return value;
        }
      });
    }
    iframeContainerElement = document.createElement("iframe");
    iframeContainerElement.id = "webpack-dev-server-client-overlay";
    iframeContainerElement.src = "about:blank";
    applyStyle(iframeContainerElement, iframeStyle);
    iframeContainerElement.onload = function () {
      var contentElement = /** @type {Document} */
      (/** @type {HTMLIFrameElement} */
      iframeContainerElement.contentDocument).createElement("div");
      containerElement = /** @type {Document} */
      (/** @type {HTMLIFrameElement} */
      iframeContainerElement.contentDocument).createElement("div");
      contentElement.id = "webpack-dev-server-client-overlay-div";
      applyStyle(contentElement, containerStyle);
      headerElement = document.createElement("div");
      headerElement.innerText = "Compiled with problems:";
      applyStyle(headerElement, headerStyle);
      var closeButtonElement = document.createElement("button");
      applyStyle(closeButtonElement, dismissButtonStyle);
      closeButtonElement.innerText = "×";
      closeButtonElement.ariaLabel = "Dismiss";
      closeButtonElement.addEventListener("click", function () {
        // eslint-disable-next-line no-use-before-define
        overlayService.send({
          type: "DISMISS"
        });
      });
      contentElement.appendChild(headerElement);
      contentElement.appendChild(closeButtonElement);
      contentElement.appendChild(containerElement);

      /** @type {Document} */
      (/** @type {HTMLIFrameElement} */
      iframeContainerElement.contentDocument).body.appendChild(contentElement);
      onLoadQueue.forEach(function (onLoad) {
        onLoad(/** @type {HTMLDivElement} */contentElement);
      });
      onLoadQueue = [];

      /** @type {HTMLIFrameElement} */
      iframeContainerElement.onload = null;
    };
    document.body.appendChild(iframeContainerElement);
  }

  /**
   * @param {(element: HTMLDivElement) => void} callback
   * @param {string | null} trustedTypesPolicyName
   */
  function ensureOverlayExists(callback, trustedTypesPolicyName) {
    if (containerElement) {
      containerElement.innerHTML = overlayTrustedTypesPolicy ? overlayTrustedTypesPolicy.createHTML("") : "";
      // Everything is ready, call the callback right away.
      callback(containerElement);
      return;
    }
    onLoadQueue.push(callback);
    if (iframeContainerElement) {
      return;
    }
    createContainer(trustedTypesPolicyName);
  }

  // Successful compilation.
  function hide() {
    if (!iframeContainerElement) {
      return;
    }

    // Clean up and reset internal state.
    document.body.removeChild(iframeContainerElement);
    iframeContainerElement = null;
    containerElement = null;
  }

  // Compilation with errors (e.g. syntax error or missing modules).
  /**
   * @param {string} type
   * @param {Array<string  | { moduleIdentifier?: string, moduleName?: string, loc?: string, message?: string }>} messages
   * @param {string | null} trustedTypesPolicyName
   * @param {'build' | 'runtime'} messageSource
   */
  function show(type, messages, trustedTypesPolicyName, messageSource) {
    ensureOverlayExists(function () {
      headerElement.innerText = messageSource === "runtime" ? "Uncaught runtime errors:" : "Compiled with problems:";
      messages.forEach(function (message) {
        var entryElement = document.createElement("div");
        var msgStyle = type === "warning" ? msgStyles.warning : msgStyles.error;
        applyStyle(entryElement, _objectSpread(_objectSpread({}, msgStyle), {}, {
          padding: "1rem 1rem 1.5rem 1rem"
        }));
        var typeElement = document.createElement("div");
        var _formatProblem = formatProblem(type, message),
          header = _formatProblem.header,
          body = _formatProblem.body;
        typeElement.innerText = header;
        applyStyle(typeElement, msgTypeStyle);
        if (message.moduleIdentifier) {
          applyStyle(typeElement, {
            cursor: "pointer"
          });
          // element.dataset not supported in IE
          typeElement.setAttribute("data-can-open", true);
          typeElement.addEventListener("click", function () {
            fetch("/webpack-dev-server/open-editor?fileName=".concat(message.moduleIdentifier));
          });
        }

        // Make it look similar to our terminal.
        var text = ansi_html_community__WEBPACK_IMPORTED_MODULE_0___default()(encode(body));
        var messageTextNode = document.createElement("div");
        applyStyle(messageTextNode, msgTextStyle);
        messageTextNode.innerHTML = overlayTrustedTypesPolicy ? overlayTrustedTypesPolicy.createHTML(text) : text;
        entryElement.appendChild(typeElement);
        entryElement.appendChild(messageTextNode);

        /** @type {HTMLDivElement} */
        containerElement.appendChild(entryElement);
      });
    }, trustedTypesPolicyName);
  }
  var overlayService = createOverlayMachine({
    showOverlay: function showOverlay(_ref3) {
      var _ref3$level = _ref3.level,
        level = _ref3$level === void 0 ? "error" : _ref3$level,
        messages = _ref3.messages,
        messageSource = _ref3.messageSource;
      return show(level, messages, options.trustedTypesPolicyName, messageSource);
    },
    hideOverlay: hide
  });
  if (options.catchRuntimeError) {
    /**
     * @param {Error | undefined} error
     * @param {string} fallbackMessage
     */
    var handleError = function handleError(error, fallbackMessage) {
      var errorObject = error instanceof Error ? error : new Error(error || fallbackMessage);
      var shouldDisplay = typeof options.catchRuntimeError === "function" ? options.catchRuntimeError(errorObject) : true;
      if (shouldDisplay) {
        overlayService.send({
          type: "RUNTIME_ERROR",
          messages: [{
            message: errorObject.message,
            stack: parseErrorToStacks(errorObject)
          }]
        });
      }
    };
    listenToRuntimeError(function (errorEvent) {
      // error property may be empty in older browser like IE
      var error = errorEvent.error,
        message = errorEvent.message;
      if (!error && !message) {
        return;
      }

      // if error stack indicates a React error boundary caught the error, do not show overlay.
      if (error && error.stack && error.stack.includes("invokeGuardedCallbackDev")) {
        return;
      }
      handleError(error, message);
    });
    listenToUnhandledRejection(function (promiseRejectionEvent) {
      var reason = promiseRejectionEvent.reason;
      handleError(reason, "Unknown promise rejection reason");
    });
  }
  return overlayService;
};


/***/ }),

/***/ "./node_modules/webpack-dev-server/client/progress.js":
/*!************************************************************!*\
  !*** ./node_modules/webpack-dev-server/client/progress.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   defineProgressElement: () => (/* binding */ defineProgressElement),
/* harmony export */   isProgressSupported: () => (/* binding */ isProgressSupported)
/* harmony export */ });
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _callSuper(t, o, e) { return o = _getPrototypeOf(o), _possibleConstructorReturn(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], _getPrototypeOf(t).constructor) : o.apply(t, e)); }
function _possibleConstructorReturn(t, e) { if (e && ("object" == _typeof(e) || "function" == typeof e)) return e; if (void 0 !== e) throw new TypeError("Derived constructors may only return object or undefined"); return _assertThisInitialized(t); }
function _assertThisInitialized(e) { if (void 0 === e) throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); return e; }
function _inherits(t, e) { if ("function" != typeof e && null !== e) throw new TypeError("Super expression must either be null or a function"); t.prototype = Object.create(e && e.prototype, { constructor: { value: t, writable: !0, configurable: !0 } }), Object.defineProperty(t, "prototype", { writable: !1 }), e && _setPrototypeOf(t, e); }
function _wrapNativeSuper(t) { var r = "function" == typeof Map ? new Map() : void 0; return _wrapNativeSuper = function _wrapNativeSuper(t) { if (null === t || !_isNativeFunction(t)) return t; if ("function" != typeof t) throw new TypeError("Super expression must either be null or a function"); if (void 0 !== r) { if (r.has(t)) return r.get(t); r.set(t, Wrapper); } function Wrapper() { return _construct(t, arguments, _getPrototypeOf(this).constructor); } return Wrapper.prototype = Object.create(t.prototype, { constructor: { value: Wrapper, enumerable: !1, writable: !0, configurable: !0 } }), _setPrototypeOf(Wrapper, t); }, _wrapNativeSuper(t); }
function _construct(t, e, r) { if (_isNativeReflectConstruct()) return Reflect.construct.apply(null, arguments); var o = [null]; o.push.apply(o, e); var p = new (t.bind.apply(t, o))(); return r && _setPrototypeOf(p, r.prototype), p; }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
function _isNativeFunction(t) { try { return -1 !== Function.toString.call(t).indexOf("[native code]"); } catch (n) { return "function" == typeof t; } }
function _setPrototypeOf(t, e) { return _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function (t, e) { return t.__proto__ = e, t; }, _setPrototypeOf(t, e); }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _classPrivateMethodInitSpec(e, a) { _checkPrivateRedeclaration(e, a), a.add(e); }
function _checkPrivateRedeclaration(e, t) { if (t.has(e)) throw new TypeError("Cannot initialize the same private elements twice on an object"); }
function _assertClassBrand(e, t, n) { if ("function" == typeof e ? e === t : e.has(t)) return arguments.length < 3 ? t : n; throw new TypeError("Private element is not present on this object"); }
function isProgressSupported() {
  return "customElements" in self && !!HTMLElement.prototype.attachShadow;
}
function defineProgressElement() {
  var _WebpackDevServerProgress;
  if (customElements.get("wds-progress")) {
    return;
  }
  var _WebpackDevServerProgress_brand = /*#__PURE__*/new WeakSet();
  var WebpackDevServerProgress = /*#__PURE__*/function (_HTMLElement) {
    function WebpackDevServerProgress() {
      var _this;
      _classCallCheck(this, WebpackDevServerProgress);
      _this = _callSuper(this, WebpackDevServerProgress);
      _classPrivateMethodInitSpec(_this, _WebpackDevServerProgress_brand);
      _this.attachShadow({
        mode: "open"
      });
      _this.maxDashOffset = -219.99078369140625;
      _this.animationTimer = null;
      return _this;
    }
    _inherits(WebpackDevServerProgress, _HTMLElement);
    return _createClass(WebpackDevServerProgress, [{
      key: "connectedCallback",
      value: function connectedCallback() {
        _assertClassBrand(_WebpackDevServerProgress_brand, this, _reset).call(this);
      }
    }, {
      key: "attributeChangedCallback",
      value: function attributeChangedCallback(name, oldValue, newValue) {
        if (name === "progress") {
          _assertClassBrand(_WebpackDevServerProgress_brand, this, _update).call(this, Number(newValue));
        } else if (name === "type") {
          _assertClassBrand(_WebpackDevServerProgress_brand, this, _reset).call(this);
        }
      }
    }], [{
      key: "observedAttributes",
      get: function get() {
        return ["progress", "type"];
      }
    }]);
  }(/*#__PURE__*/_wrapNativeSuper(HTMLElement));
  _WebpackDevServerProgress = WebpackDevServerProgress;
  function _reset() {
    var _this$getAttribute, _Number;
    clearTimeout(this.animationTimer);
    this.animationTimer = null;
    var typeAttr = (_this$getAttribute = this.getAttribute("type")) === null || _this$getAttribute === void 0 ? void 0 : _this$getAttribute.toLowerCase();
    this.type = typeAttr === "circular" ? "circular" : "linear";
    var innerHTML = this.type === "circular" ? _circularTemplate.call(_WebpackDevServerProgress) : _linearTemplate.call(_WebpackDevServerProgress);
    this.shadowRoot.innerHTML = innerHTML;
    this.initialProgress = (_Number = Number(this.getAttribute("progress"))) !== null && _Number !== void 0 ? _Number : 0;
    _assertClassBrand(_WebpackDevServerProgress_brand, this, _update).call(this, this.initialProgress);
  }
  function _circularTemplate() {
    return "\n        <style>\n        :host {\n            width: 200px;\n            height: 200px;\n            position: fixed;\n            right: 5%;\n            top: 5%;\n            transition: opacity .25s ease-in-out;\n            z-index: 2147483645;\n        }\n\n        circle {\n            fill: #282d35;\n        }\n\n        path {\n            fill: rgba(0, 0, 0, 0);\n            stroke: rgb(186, 223, 172);\n            stroke-dasharray: 219.99078369140625;\n            stroke-dashoffset: -219.99078369140625;\n            stroke-width: 10;\n            transform: rotate(90deg) translate(0px, -80px);\n        }\n\n        text {\n            font-family: 'Open Sans', sans-serif;\n            font-size: 18px;\n            fill: #ffffff;\n            dominant-baseline: middle;\n            text-anchor: middle;\n        }\n\n        tspan#percent-super {\n            fill: #bdc3c7;\n            font-size: 0.45em;\n            baseline-shift: 10%;\n        }\n\n        @keyframes fade {\n            0% { opacity: 1; transform: scale(1); }\n            100% { opacity: 0; transform: scale(0); }\n        }\n\n        .disappear {\n            animation: fade 0.3s;\n            animation-fill-mode: forwards;\n            animation-delay: 0.5s;\n        }\n\n        .hidden {\n            display: none;\n        }\n        </style>\n        <svg id=\"progress\" class=\"hidden noselect\" viewBox=\"0 0 80 80\">\n        <circle cx=\"50%\" cy=\"50%\" r=\"35\"></circle>\n        <path d=\"M5,40a35,35 0 1,0 70,0a35,35 0 1,0 -70,0\"></path>\n        <text x=\"50%\" y=\"51%\">\n            <tspan id=\"percent-value\">0</tspan>\n            <tspan id=\"percent-super\">%</tspan>\n        </text>\n        </svg>\n      ";
  }
  function _linearTemplate() {
    return "\n        <style>\n        :host {\n            position: fixed;\n            top: 0;\n            left: 0;\n            height: 4px;\n            width: 100vw;\n            z-index: 2147483645;\n        }\n\n        #bar {\n            width: 0%;\n            height: 4px;\n            background-color: rgb(186, 223, 172);\n        }\n\n        @keyframes fade {\n            0% { opacity: 1; }\n            100% { opacity: 0; }\n        }\n\n        .disappear {\n            animation: fade 0.3s;\n            animation-fill-mode: forwards;\n            animation-delay: 0.5s;\n        }\n\n        .hidden {\n            display: none;\n        }\n        </style>\n        <div id=\"progress\"></div>\n        ";
  }
  function _update(percent) {
    var element = this.shadowRoot.querySelector("#progress");
    if (this.type === "circular") {
      var path = this.shadowRoot.querySelector("path");
      var value = this.shadowRoot.querySelector("#percent-value");
      var offset = (100 - percent) / 100 * this.maxDashOffset;
      path.style.strokeDashoffset = offset;
      value.textContent = percent;
    } else {
      element.style.width = "".concat(percent, "%");
    }
    if (percent >= 100) {
      _assertClassBrand(_WebpackDevServerProgress_brand, this, _hide).call(this);
    } else if (percent > 0) {
      _assertClassBrand(_WebpackDevServerProgress_brand, this, _show).call(this);
    }
  }
  function _show() {
    var element = this.shadowRoot.querySelector("#progress");
    element.classList.remove("hidden");
  }
  function _hide() {
    var _this2 = this;
    var element = this.shadowRoot.querySelector("#progress");
    if (this.type === "circular") {
      element.classList.add("disappear");
      element.addEventListener("animationend", function () {
        element.classList.add("hidden");
        _assertClassBrand(_WebpackDevServerProgress_brand, _this2, _update).call(_this2, 0);
      }, {
        once: true
      });
    } else if (this.type === "linear") {
      element.classList.add("disappear");
      this.animationTimer = setTimeout(function () {
        element.classList.remove("disappear");
        element.classList.add("hidden");
        element.style.width = "0%";
        _this2.animationTimer = null;
      }, 800);
    }
  }
  customElements.define("wds-progress", WebpackDevServerProgress);
}

/***/ }),

/***/ "./node_modules/webpack-dev-server/client/socket.js":
/*!**********************************************************!*\
  !*** ./node_modules/webpack-dev-server/client/socket.js ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   client: () => (/* binding */ client),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _clients_WebSocketClient_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./clients/WebSocketClient.js */ "./node_modules/webpack-dev-server/client/clients/WebSocketClient.js");
/* harmony import */ var _utils_log_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils/log.js */ "./node_modules/webpack-dev-server/client/utils/log.js");
/* provided dependency */ var __webpack_dev_server_client__ = __webpack_require__(/*! ./node_modules/webpack-dev-server/client/clients/WebSocketClient.js */ "./node_modules/webpack-dev-server/client/clients/WebSocketClient.js");
/* global __webpack_dev_server_client__ */




// this WebsocketClient is here as a default fallback, in case the client is not injected
/* eslint-disable camelcase */
var Client =
// eslint-disable-next-line no-nested-ternary
typeof __webpack_dev_server_client__ !== "undefined" ? typeof __webpack_dev_server_client__.default !== "undefined" ? __webpack_dev_server_client__.default : __webpack_dev_server_client__ : _clients_WebSocketClient_js__WEBPACK_IMPORTED_MODULE_0__["default"];
/* eslint-enable camelcase */

var retries = 0;
var maxRetries = 10;

// Initialized client is exported so external consumers can utilize the same instance
// It is mutable to enforce singleton
// eslint-disable-next-line import/no-mutable-exports
var client = null;
var timeout;

/**
 * @param {string} url
 * @param {{ [handler: string]: (data?: any, params?: any) => any }} handlers
 * @param {number} [reconnect]
 */
var socket = function initSocket(url, handlers, reconnect) {
  client = new Client(url);
  client.onOpen(function () {
    retries = 0;
    if (timeout) {
      clearTimeout(timeout);
    }
    if (typeof reconnect !== "undefined") {
      maxRetries = reconnect;
    }
  });
  client.onClose(function () {
    if (retries === 0) {
      handlers.close();
    }

    // Try to reconnect.
    client = null;

    // After 10 retries stop trying, to prevent logspam.
    if (retries < maxRetries) {
      // Exponentially increase timeout to reconnect.
      // Respectfully copied from the package `got`.
      // eslint-disable-next-line no-restricted-properties
      var retryInMs = 1000 * Math.pow(2, retries) + Math.random() * 100;
      retries += 1;
      _utils_log_js__WEBPACK_IMPORTED_MODULE_1__.log.info("Trying to reconnect...");
      timeout = setTimeout(function () {
        socket(url, handlers, reconnect);
      }, retryInMs);
    }
  });
  client.onMessage(
  /**
   * @param {any} data
   */
  function (data) {
    var message = JSON.parse(data);
    if (handlers[message.type]) {
      handlers[message.type](message.data, message.params);
    }
  });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (socket);

/***/ }),

/***/ "./node_modules/webpack-dev-server/client/utils/log.js":
/*!*************************************************************!*\
  !*** ./node_modules/webpack-dev-server/client/utils/log.js ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   log: () => (/* binding */ log),
/* harmony export */   setLogLevel: () => (/* binding */ setLogLevel)
/* harmony export */ });
/* harmony import */ var _modules_logger_index_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../modules/logger/index.js */ "./node_modules/webpack-dev-server/client/modules/logger/index.js");
/* harmony import */ var _modules_logger_index_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_modules_logger_index_js__WEBPACK_IMPORTED_MODULE_0__);

var name = "webpack-dev-server";
// default level is set on the client side, so it does not need
// to be set by the CLI or API
var defaultLevel = "info";

// options new options, merge with old options
/**
 * @param {false | true | "none" | "error" | "warn" | "info" | "log" | "verbose"} level
 * @returns {void}
 */
function setLogLevel(level) {
  _modules_logger_index_js__WEBPACK_IMPORTED_MODULE_0___default().configureDefaultLogger({
    level: level
  });
}
setLogLevel(defaultLevel);
var log = _modules_logger_index_js__WEBPACK_IMPORTED_MODULE_0___default().getLogger(name);


/***/ }),

/***/ "./node_modules/webpack-dev-server/client/utils/sendMessage.js":
/*!*********************************************************************!*\
  !*** ./node_modules/webpack-dev-server/client/utils/sendMessage.js ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* global __resourceQuery WorkerGlobalScope */

// Send messages to the outside, so plugins can consume it.
/**
 * @param {string} type
 * @param {any} [data]
 */
function sendMsg(type, data) {
  if (typeof self !== "undefined" && (typeof WorkerGlobalScope === "undefined" || !(self instanceof WorkerGlobalScope))) {
    self.postMessage({
      type: "webpack".concat(type),
      data: data
    }, "*");
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (sendMsg);

/***/ }),

/***/ "./node_modules/webpack/hot/dev-server.js":
/*!************************************************!*\
  !*** ./node_modules/webpack/hot/dev-server.js ***!
  \************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
/* globals __webpack_hash__ */
if (true) {
	/** @type {undefined|string} */
	var lastHash;
	var upToDate = function upToDate() {
		return /** @type {string} */ (lastHash).indexOf(__webpack_require__.h()) >= 0;
	};
	var log = __webpack_require__(/*! ./log */ "./node_modules/webpack/hot/log.js");
	var check = function check() {
		module.hot
			.check(true)
			.then(function (updatedModules) {
				if (!updatedModules) {
					log(
						"warning",
						"[HMR] Cannot find update. " +
							(typeof window !== "undefined"
								? "Need to do a full reload!"
								: "Please reload manually!")
					);
					log(
						"warning",
						"[HMR] (Probably because of restarting the webpack-dev-server)"
					);
					if (typeof window !== "undefined") {
						window.location.reload();
					}
					return;
				}

				if (!upToDate()) {
					check();
				}

				__webpack_require__(/*! ./log-apply-result */ "./node_modules/webpack/hot/log-apply-result.js")(updatedModules, updatedModules);

				if (upToDate()) {
					log("info", "[HMR] App is up to date.");
				}
			})
			.catch(function (err) {
				var status = module.hot.status();
				if (["abort", "fail"].indexOf(status) >= 0) {
					log(
						"warning",
						"[HMR] Cannot apply update. " +
							(typeof window !== "undefined"
								? "Need to do a full reload!"
								: "Please reload manually!")
					);
					log("warning", "[HMR] " + log.formatError(err));
					if (typeof window !== "undefined") {
						window.location.reload();
					}
				} else {
					log("warning", "[HMR] Update failed: " + log.formatError(err));
				}
			});
	};
	var hotEmitter = __webpack_require__(/*! ./emitter */ "./node_modules/webpack/hot/emitter.js");
	hotEmitter.on("webpackHotUpdate", function (currentHash) {
		lastHash = currentHash;
		if (!upToDate() && module.hot.status() === "idle") {
			log("info", "[HMR] Checking for updates on the server...");
			check();
		}
	});
	log("info", "[HMR] Waiting for update signal from WDS...");
} else // removed by dead control flow
{}


/***/ }),

/***/ "./node_modules/webpack/hot/emitter.js":
/*!*********************************************!*\
  !*** ./node_modules/webpack/hot/emitter.js ***!
  \*********************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var EventEmitter = __webpack_require__(/*! events */ "./node_modules/events/events.js");
module.exports = new EventEmitter();


/***/ }),

/***/ "./node_modules/webpack/hot/log-apply-result.js":
/*!******************************************************!*\
  !*** ./node_modules/webpack/hot/log-apply-result.js ***!
  \******************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

/**
 * @param {(string | number)[]} updatedModules updated modules
 * @param {(string | number)[] | null} renewedModules renewed modules
 */
module.exports = function (updatedModules, renewedModules) {
	var unacceptedModules = updatedModules.filter(function (moduleId) {
		return renewedModules && renewedModules.indexOf(moduleId) < 0;
	});
	var log = __webpack_require__(/*! ./log */ "./node_modules/webpack/hot/log.js");

	if (unacceptedModules.length > 0) {
		log(
			"warning",
			"[HMR] The following modules couldn't be hot updated: (They would need a full reload!)"
		);
		unacceptedModules.forEach(function (moduleId) {
			log("warning", "[HMR]  - " + moduleId);
		});
	}

	if (!renewedModules || renewedModules.length === 0) {
		log("info", "[HMR] Nothing hot updated.");
	} else {
		log("info", "[HMR] Updated modules:");
		renewedModules.forEach(function (moduleId) {
			if (typeof moduleId === "string" && moduleId.indexOf("!") !== -1) {
				var parts = moduleId.split("!");
				log.groupCollapsed("info", "[HMR]  - " + parts.pop());
				log("info", "[HMR]  - " + moduleId);
				log.groupEnd("info");
			} else {
				log("info", "[HMR]  - " + moduleId);
			}
		});
		var numberIds = renewedModules.every(function (moduleId) {
			return typeof moduleId === "number";
		});
		if (numberIds)
			log(
				"info",
				'[HMR] Consider using the optimization.moduleIds: "named" for module names.'
			);
	}
};


/***/ }),

/***/ "./node_modules/webpack/hot/log.js":
/*!*****************************************!*\
  !*** ./node_modules/webpack/hot/log.js ***!
  \*****************************************/
/***/ ((module) => {

/** @typedef {"info" | "warning" | "error"} LogLevel */

/** @type {LogLevel} */
var logLevel = "info";

function dummy() {}

/**
 * @param {LogLevel} level log level
 * @returns {boolean} true, if should log
 */
function shouldLog(level) {
	var shouldLog =
		(logLevel === "info" && level === "info") ||
		(["info", "warning"].indexOf(logLevel) >= 0 && level === "warning") ||
		(["info", "warning", "error"].indexOf(logLevel) >= 0 && level === "error");
	return shouldLog;
}

/**
 * @param {(msg?: string) => void} logFn log function
 * @returns {(level: LogLevel, msg?: string) => void} function that logs when log level is sufficient
 */
function logGroup(logFn) {
	return function (level, msg) {
		if (shouldLog(level)) {
			logFn(msg);
		}
	};
}

/**
 * @param {LogLevel} level log level
 * @param {string|Error} msg message
 */
module.exports = function (level, msg) {
	if (shouldLog(level)) {
		if (level === "info") {
			console.log(msg);
		} else if (level === "warning") {
			console.warn(msg);
		} else if (level === "error") {
			console.error(msg);
		}
	}
};

var group = console.group || dummy;
var groupCollapsed = console.groupCollapsed || dummy;
var groupEnd = console.groupEnd || dummy;

module.exports.group = logGroup(group);

module.exports.groupCollapsed = logGroup(groupCollapsed);

module.exports.groupEnd = logGroup(groupEnd);

/**
 * @param {LogLevel} level log level
 */
module.exports.setLogLevel = function (level) {
	logLevel = level;
};

/**
 * @param {Error} err error
 * @returns {string} formatted error
 */
module.exports.formatError = function (err) {
	var message = err.message;
	var stack = err.stack;
	if (!stack) {
		return message;
	} else if (stack.indexOf(message) < 0) {
		return message + "\n" + stack;
	}
	return stack;
};


/***/ }),

/***/ "./src/card-base.js":
/*!**************************!*\
  !*** ./src/card-base.js ***!
  \**************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CardBase: () => (/* binding */ CardBase)
/* harmony export */ });
/* harmony import */ var lit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lit */ "./node_modules/lit/index.js");
/* harmony import */ var _super_base_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./super-base.js */ "./src/super-base.js");
var _CardBase;
function _superPropGet(t, o, e, r) { var p = _get(_getPrototypeOf(1 & r ? t.prototype : t), o, e); return 2 & r && "function" == typeof p ? function (t) { return p.apply(e, t); } : p; }
function _get() { return _get = "undefined" != typeof Reflect && Reflect.get ? Reflect.get.bind() : function (e, t, r) { var p = _superPropBase(e, t); if (p) { var n = Object.getOwnPropertyDescriptor(p, t); return n.get ? n.get.call(arguments.length < 3 ? e : r) : n.value; } }, _get.apply(null, arguments); }
function _superPropBase(t, o) { for (; !{}.hasOwnProperty.call(t, o) && null !== (t = _getPrototypeOf(t));); return t; }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }


class CardBase extends _super_base_js__WEBPACK_IMPORTED_MODULE_1__.SuperBase {
  constructor() {
    super();
    this.dM = `${this.constructor.className}: `; // debugMsgPrefix - Prefix für Debug-Nachrichten

    this._selectedTab = 0;
    this._debug(`CardBase-Modul wird geladen`);

    // Array für Änderungs-Observer
    this.informAtChangesClients = [];

    // Eigene Verwaltung der registrierten EventTypes
    this._registeredEventTypes = new Set();

    // Registriere Event-Listener für automatische Registrierung
    this.addEventListener('registerMeForChanges', this._onRegisterMeForChanges.bind(this));
  }
  async firstUpdated() {
    this._debug('CardBase firstUpdated: Start');
    await super.firstUpdated();
    this._debug('CardBase firstUpdated: Ende');
  }
  setConfig(config) {
    this._debug('setConfig wird aufgerufen mit:', config);
    if (!config) {
      throw new Error('Keine Konfiguration angegeben');
    }

    // Prüfe, ob es sich um eine neue Konfiguration handelt
    const isNewConfig = !this.config || Object.keys(this.config).length === 0;

    // Wenn es eine neue Konfiguration ist, verwende sie direkt
    if (isNewConfig) {
      this.config = {
        ...this.getDefaultConfig(),
        ...config
      };
    } else {
      // Ansonsten behalte die bestehende Konfiguration bei und aktualisiere nur geänderte Werte
      this.config = {
        ...this.config,
        ...config
      };
    }
    this._debug('config nach setConfig:', this.config);
  }
  getDefaultConfig() {
    this._debug('getDefaultConfig wird aufgerufen');
    return {
      numberOfMonths: 14,
      initialDisplayedMonths: 2,
      selectedCalendar: 'a',
      // Erster aktivierter Kalender
      store_mode: 'saver',
      saver_key: 'Schichtplan',
      calendars: [{
        shortcut: 'a',
        name: 'Kalender A',
        color: '#ff9800',
        enabled: true,
        statusRelevant: true
      }, {
        shortcut: 'b',
        name: 'Kalender B',
        color: '#ff0000',
        enabled: false,
        statusRelevant: true
      }, {
        shortcut: 'c',
        name: 'Kalender C',
        color: '#00ff00',
        enabled: false,
        statusRelevant: true
      }, {
        shortcut: 'd',
        name: 'Kalender D',
        color: '#0000ff',
        enabled: false,
        statusRelevant: true
      }, {
        shortcut: 'e',
        name: 'Kalender E',
        color: '#ffff00',
        enabled: false,
        statusRelevant: true
      }],
      holidays: {
        neujahr: true,
        heilige_drei_koenige: true,
        tag_der_arbeit: true,
        friedensfest: true,
        mariae_himmelfahrt: true,
        tag_der_deutschen_einheit: true,
        reformationstag: true,
        allerheiligen: true,
        weihnachten_1: true,
        weihnachten_2: true,
        karfreitag: true,
        ostermontag: true,
        christi_himmelfahrt: true,
        pfingstmontag: true,
        fronleichnam: true,
        busstag: true
      }
    };
  }
  render(content = '') {
    this._debug('render wird aufgerufen');
    return html`
      <ha-card>
        <div class="card-content">${content}</div>
        ${this.showVersion ? html` <div class="version">Version: ${this.version}</div> ` : ''}
      </ha-card>
    `;
  }
  _onRegisterMeForChanges(event) {
    this._debug('Registrierungsanfrage empfangen', {
      component: event.target,
      detail: event.detail
    });
    const {
      component,
      callback,
      eventType = '',
      immediately = false
    } = event.detail;
    if (component && typeof callback === 'function') {
      this.registerInformAtChangesClients(component, eventType, immediately, callback);
      this._debug('Komponente erfolgreich registriert', {
        component: component.tagName || component.constructor.name,
        eventType: eventType
      });
    } else {
      this._debug('Registrierung fehlgeschlagen', {
        componentExists: !!component,
        hasCallback: typeof callback === 'function'
      });
    }
  }

  /**
   * Registriert einen Observer für View-Änderungen
   * @param {Object} me - Das Objekt, das über Änderungen informiert werden soll
   * @param {string|Array} eventType - Event-Typ als String oder Array von Strings
   * @param {Function} callback - Callback-Funktion, die bei Änderungen aufgerufen wird
   */
  registerInformAtChangesClients(me, eventType = '', immediately = false, callback = null) {
    const dM = `${this.dM || '?: '}registerInformAtChangesClients() `;
    this._debug(`${dM}Anfrage`, {
      me,
      newEventType: eventType
    });

    // Normalisiere die neuen EventTypes
    const eventTypes = Array.isArray(eventType) ? eventType.map(e => e.toLowerCase()).sort() : typeof eventType === 'string' ? eventType.split(',').map(e => e.trim().toLowerCase()).filter(e => e.length > 0).sort() : [];

    // Prüfe ob bereits ein Observer für denselben me existiert
    const existingMeInformer = this.informAtChangesClients.find(informer => informer.me === me);
    let existingEventTypes = [];
    if (existingMeInformer) {
      // Normalisiere die bestehenden eventTypes
      existingEventTypes = Array.isArray(existingMeInformer.eventType) ? existingMeInformer.eventType.map(e => e.toLowerCase()).sort() : typeof existingMeInformer.eventType === 'string' ? existingMeInformer.eventType.split(',').map(e => e.trim().toLowerCase()).filter(e => e.length > 0).sort() : [];
    }
    // Finde nur die wirklich neuen EventTypes
    const newEventTypes = eventTypes.filter(newType => !existingEventTypes.includes(newType));
    if (existingMeInformer && newEventTypes.length === 0) {
      this._debug(`${dM}Client war bereits mit allen Typen registriert`, {
        me,
        requestedEventTypes: eventTypes,
        existingEventTypes
      });
      return false;
    }
    if (existingMeInformer) {
      // Füge nur die neuen EventTypes hinzu
      const combinedEventTypes = [...existingEventTypes, ...newEventTypes].sort();
      existingMeInformer.eventType = combinedEventTypes;
      this._debug(`${dM}Neue EventTypes hinzugefügt`, {
        me,
        newEventTypes,
        existingEventTypes,
        combinedEventTypes
      });
    } else {
      // Füge neuen Client hinzu
      this.informAtChangesClients.push({
        me,
        eventType: newEventTypes,
        callback
      });
      this._debug(`${dM}Neuer Informer registriert`, {
        me,
        newEventTypes,
        totalObservers: this.informAtChangesClients.length
      });
    }
    newEventTypes.forEach(eventType => {
      // Prüfe ob bereits ein Listener für diesen EventType existiert
      if (!this._registeredEventTypes.has(eventType)) {
        this._debug(`${dM}Füge Listener für EventType hinzu`, {
          eventType
        });
        this.addEventListener(eventType + '-event', this._notifyClientsAtChanges.bind(this));
        this._registeredEventTypes.add(eventType);
      } else {
        this._debug(`${dM}Listener für EventType bereits vorhanden`, {
          eventType
        });
      }
      const fkt = '_onRegisterMeFor_' + eventType.charAt(0).toUpperCase() + eventType.slice(1);
      this._debug(`${dM}Registriere Komponente für EnvSniffer-Änderungen`, {
        fkt
      });
      if (typeof this[fkt] === 'function') {
        this[fkt](immediately, me);
      }
    });
    return true;
  }
  _notifyClientsAtChanges(event) {
    this._debug('_notifyClientsAtChanges() Anfrage', {
      event
    });
    // Sichere Extraktion des EventTypes (entferne '-event' Suffix)
    const eventType = event.type.replace('-event', '');
    const fkt = '_on' + eventType.charAt(0).toUpperCase() + eventType.slice(1);
    // const data = {[eventType]: (typeof this[fkt] === 'function') ? this[fkt](event.detail) : event.detail};

    this._debug('_notifyClientsAtChanges() EventType extrahiert', {
      originalEventType: event.type,
      extractedEventType: eventType,
      clients: this.informAtChangesClients,
      fkt: fkt
    });
    this.informAtChangesClients.forEach(client => {
      // Prüfe ob client.me auf ein existierendes DOM-Element verweist
      if (eventType && client.eventType.includes(eventType) && client.me && (client.me instanceof Element || client.me.nodeType)) {
        // Zusätzliche Prüfung: Ist das Element noch im DOM?
        if (document.contains(client.me) || client.me.isConnected) {
          // Client benachrichtigen
          const details = typeof this[fkt] === 'function' ? this[fkt](client.me, event) : event.detail || {};
          const data = {
            [eventType]: details
          };
          if (details && client.callback && typeof client.callback === 'function') {
            try {
              this._debug('_notifyClientsAtChanges() Client benachrichtigen', {
                client: client.me.constructor.name,
                eventType: eventType,
                data: data
              });
              client.callback(data);
            } catch (error) {
              // Fehler beim Benachrichtigen des Clients
            }
          }
        }
      }
    });
  }
}
_CardBase = CardBase;
_defineProperty(CardBase, "className", 'CardBase');
_defineProperty(CardBase, "properties", {
  ..._superPropGet(_CardBase, "properties", _CardBase),
  _selectedTab: {
    type: Number
  }
});
_defineProperty(CardBase, "styles", [_superPropGet(_CardBase, "styles", _CardBase), (0,lit__WEBPACK_IMPORTED_MODULE_0__.css)`
      :host {
        display: block;
      }

      ha-card {
        padding: 16px;
      }

      .loading {
        text-align: center;
        padding: 20px;
        color: var(--secondary-text-color);
      }

      .error {
        text-align: center;
        padding: 20px;
        color: var(--error-color);
      }
    `]);

/***/ }),

/***/ "./src/card-config.js":
/*!****************************!*\
  !*** ./src/card-config.js ***!
  \****************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CardDescription: () => (/* binding */ CardDescription),
/* harmony export */   CardFilename: () => (/* binding */ CardFilename),
/* harmony export */   CardName: () => (/* binding */ CardName),
/* harmony export */   CardRegname: () => (/* binding */ CardRegname),
/* harmony export */   DebugMode: () => (/* binding */ DebugMode),
/* harmony export */   DefaultConfig: () => (/* binding */ DefaultConfig),
/* harmony export */   SaveDebounceTime: () => (/* binding */ SaveDebounceTime),
/* harmony export */   UseDummyData: () => (/* binding */ UseDummyData),
/* harmony export */   Version: () => (/* binding */ Version),
/* harmony export */   showVersion: () => (/* binding */ showVersion)
/* harmony export */ });
const Version = '2026.01-0004';
const CardRegname = 'tgshiftschedule-card';
const CardName = 'TG Schichtplan Card';
const CardDescription = 'Eine Schichtplan-Karte für Arbeitszeiten';
const CardFilename = 'tgshiftschedule-card.js';
const DebugMode = 'true'; // Aktiviere Debug für alle Komponenten
const UseDummyData = 'false';
const showVersion = false;
const SaveDebounceTime = 300; // Debounce-Zeit in Millisekunden für das Speichern von Änderungen (0 = sofort, ohne Debouncing)

// Schichtplan-Konfiguration
const DefaultConfig = {
  entity: '' // input_text Entity für Speicherung (muss konfiguriert werden)
};


/***/ }),

/***/ "./src/card-impl.js":
/*!**************************!*\
  !*** ./src/card-impl.js ***!
  \**************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CardImpl: () => (/* binding */ CardImpl)
/* harmony export */ });
/* harmony import */ var lit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lit */ "./node_modules/lit/index.js");
/* harmony import */ var _card_base_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./card-base.js */ "./src/card-base.js");
/* harmony import */ var _views_shiftschedule_view_shiftschedule_view_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./views/shiftschedule-view/shiftschedule-view.js */ "./src/views/shiftschedule-view/shiftschedule-view.js");
/* harmony import */ var _card_config_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./card-config.js */ "./src/card-config.js");
var _CardImpl;
function _superPropGet(t, o, e, r) { var p = _get(_getPrototypeOf(1 & r ? t.prototype : t), o, e); return 2 & r && "function" == typeof p ? function (t) { return p.apply(e, t); } : p; }
function _get() { return _get = "undefined" != typeof Reflect && Reflect.get ? Reflect.get.bind() : function (e, t, r) { var p = _superPropBase(e, t); if (p) { var n = Object.getOwnPropertyDescriptor(p, t); return n.get ? n.get.call(arguments.length < 3 ? e : r) : n.value; } }, _get.apply(null, arguments); }
function _superPropBase(t, o) { for (; !{}.hasOwnProperty.call(t, o) && null !== (t = _getPrototypeOf(t));); return t; }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }


 // Import für Custom Element Registrierung

class CardImpl extends _card_base_js__WEBPACK_IMPORTED_MODULE_1__.CardBase {
  static get properties() {
    return {
      ...super.properties,
      config: {
        type: Object
      },
      hass: {
        type: Object
      },
      lovelace: {
        type: Object
      },
      _view: {
        type: Object
      },
      _viewType: {
        type: String
      }
    };
  }
  static getConfigElement() {
    return document.createElement(`${_card_config_js__WEBPACK_IMPORTED_MODULE_3__.CardRegname}-editor`);
  }
  static getStubConfig() {
    return {
      numberOfMonths: 14,
      initialDisplayedMonths: 2,
      store_mode: 'saver',
      saver_key: 'Schichtplan',
      useElements: false,
      selectedElement: null,
      elements: [{
        benennung: 'Element 1',
        aktiv: true,
        color: '#ff0000',
        shortcut: '1'
      }, {
        benennung: 'Element 2',
        aktiv: true,
        color: '#00ff00',
        shortcut: '2'
      }, {
        benennung: 'Element 3',
        aktiv: true,
        color: '#0000ff',
        shortcut: '3'
      }, {
        benennung: 'Element 4',
        aktiv: true,
        color: '#ffff00',
        shortcut: '4'
      }]
    };
  }
  constructor() {
    super();
    this._debug(`CardImpl-Modul wird geladen`);
    this.config = this.getDefaultConfig();
    this._debug('CardImpl-Konstruktor: Initialisierung abgeschlossen');
  }
  getDefaultConfig() {
    this._debug(`CardImpl getDefaultConfig wird aufgerufen`);
    return {
      numberOfMonths: 14,
      initialDisplayedMonths: 2,
      selectedCalendar: 'a',
      // Erster aktivierter Kalender
      store_mode: 'saver',
      saver_key: 'Schichtplan',
      calendars: [{
        shortcut: 'a',
        name: 'Kalender A',
        color: '#ff9800',
        enabled: true,
        statusRelevant: true
      }, {
        shortcut: 'b',
        name: 'Kalender B',
        color: '#ff0000',
        enabled: false,
        statusRelevant: true
      }, {
        shortcut: 'c',
        name: 'Kalender C',
        color: '#00ff00',
        enabled: false,
        statusRelevant: true
      }, {
        shortcut: 'd',
        name: 'Kalender D',
        color: '#0000ff',
        enabled: false,
        statusRelevant: true
      }, {
        shortcut: 'e',
        name: 'Kalender E',
        color: '#ffff00',
        enabled: false,
        statusRelevant: true
      }]
    };
  }
  setConfig(config) {
    this._debug('setConfig wird aufgerufen mit:', config);
    if (!config) {
      throw new Error('Keine Konfiguration vorhanden');
    }

    // Merge Config: Behalte selectedCalendar aus der übergebenen Config, falls vorhanden
    const defaultConfig = this.getDefaultConfig();
    this.config = {
      ...defaultConfig,
      ...config,
      // Stelle sicher, dass selectedCalendar aus der übergebenen Config beibehalten wird
      selectedCalendar: config?.selectedCalendar !== undefined ? config.selectedCalendar : this.config?.selectedCalendar || defaultConfig.selectedCalendar
    };
    this._debug('config nach setConfig:', this.config);

    // View initialisieren oder aktualisieren
    this._viewType = 'ShiftScheduleView';
    try {
      if (!this._view) {
        // Erstelle ShiftScheduleView als Custom Element nur wenn noch nicht vorhanden
        this._debug('setConfig: Erstelle neue ShiftSchedule-View');
        this._view = document.createElement('shiftschedule-view');

        // Event-Listener für Config-Änderungen von der View
        this._view.addEventListener('config-changed', ev => {
          this._debug('config-changed Event von ShiftSchedule-View empfangen:', ev.detail);
          if (ev.detail && ev.detail.config) {
            this.config = ev.detail.config;
            // Speichere die Config (nur wenn durch Benutzeraktion geändert)
            if (this._view._handleConfigChanged) {
              this._view._handleConfigChanged();
            }
            // Dispatch das Event weiter, damit Home Assistant die Config aktualisiert
            this.dispatchEvent(new CustomEvent('config-changed', {
              detail: {
                config: this.config
              },
              bubbles: true,
              composed: true
            }));
          }
        });

        // Übergebe hass und lovelace an die View, falls sie bereits gesetzt wurden
        if (this._hass) {
          this._debug('setConfig: Übergebe gespeicherten hass an ShiftSchedule-View');
          this._view.hass = this._hass;
        }
        if (this.lovelace) {
          this._debug('setConfig: Übergebe lovelace an ShiftSchedule-View');
          this._view.lovelace = this.lovelace;
        }
      } else {
        // View existiert bereits, aktualisiere nur die Config
        this._debug('setConfig: Aktualisiere bestehende ShiftSchedule-View');
      }

      // Aktualisiere die Config der View (wichtig: auch wenn View bereits existiert)
      this._view.config = this.config;
      this._debug('setConfig: View initialisiert/aktualisiert:', {
        viewType: this._viewType,
        config: this.config
      });
    } catch (error) {
      this._debug('setConfig: Fehler bei View-Initialisierung:', error);
      throw new Error(`Fehler bei der View-Initialisierung: ${error.message}`);
    }
  }
  set hass(hass) {
    // this._debug('set hass wird aufgerufen');
    this._hass = hass;
    if (this._view) {
      this._view.hass = hass;
    } else {
      this._debug('set hass: View noch nicht initialisiert, speichere hass für später');
    }
  }
  set lovelace(lovelace) {
    this._lovelace = lovelace;
    if (this._view) {
      this._view.lovelace = lovelace;
    }
  }
  get lovelace() {
    return this._lovelace;
  }
  get hass() {
    return this._hass;
  }
  firstUpdated() {
    this._debug('firstUpdated wird aufgerufen');
    if (this._view) {
      this._view.firstUpdated();
    }
    this._debug('firstUpdated abgeschlossen');
  }
  render() {
    if (!this._view) {
      return (0,lit__WEBPACK_IMPORTED_MODULE_0__.html)`<div class="error">Keine View verfügbar</div>`;
    }
    try {
      return (0,lit__WEBPACK_IMPORTED_MODULE_0__.html)`${this._view}`;
    } catch (error) {
      this._debug('render: Fehler beim Rendern der View:', error);
      return (0,lit__WEBPACK_IMPORTED_MODULE_0__.html)`<div class="error">Fehler beim Rendern: ${error.message}</div>`;
    }
  }
}
_CardImpl = CardImpl;
_defineProperty(CardImpl, "className", 'CardImpl');
_defineProperty(CardImpl, "styles", [_superPropGet(_CardImpl, "styles", _CardImpl), (0,lit__WEBPACK_IMPORTED_MODULE_0__.css)`
      :host {
        display: block;
      }

      ha-card {
        padding: 16px;
      }

      .loading {
        text-align: center;
        padding: 20px;
        color: var(--secondary-text-color);
      }

      .error {
        text-align: center;
        padding: 20px;
        color: var(--error-color);
      }
    `]);

/***/ }),

/***/ "./src/card.js":
/*!*********************!*\
  !*** ./src/card.js ***!
  \*********************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Card: () => (/* binding */ Card)
/* harmony export */ });
/* harmony import */ var lit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lit */ "./node_modules/lit/index.js");
/* harmony import */ var lit_decorators_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lit/decorators.js */ "./node_modules/lit/decorators.js");
/* harmony import */ var _card_impl_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./card-impl.js */ "./src/card-impl.js");
/* harmony import */ var _editor_editor_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./editor/editor.js */ "./src/editor/editor.js");
/* harmony import */ var _card_config_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./card-config.js */ "./src/card-config.js");
var _Card;
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _superPropGet(t, o, e, r) { var p = _get(_getPrototypeOf(1 & r ? t.prototype : t), o, e); return 2 & r && "function" == typeof p ? function (t) { return p.apply(e, t); } : p; }
function _get() { return _get = "undefined" != typeof Reflect && Reflect.get ? Reflect.get.bind() : function (e, t, r) { var p = _superPropBase(e, t); if (p) { var n = Object.getOwnPropertyDescriptor(p, t); return n.get ? n.get.call(arguments.length < 3 ? e : r) : n.value; } }, _get.apply(null, arguments); }
function _superPropBase(t, o) { for (; !{}.hasOwnProperty.call(t, o) && null !== (t = _getPrototypeOf(t));); return t; }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }





class Card extends _card_impl_js__WEBPACK_IMPORTED_MODULE_2__.CardImpl {
  constructor() {
    super();
  }
  connectedCallback() {
    super.connectedCallback();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
  }
}

// Registriere die Karte in der UI
_Card = Card;
// className wird von CardImpl geerbt (ist 'CardImpl')
_defineProperty(Card, "styles", [_superPropGet(_Card, "styles", _Card), (0,lit__WEBPACK_IMPORTED_MODULE_0__.css)`
      :host {
      }
    `]);
if (window.customCards) {
  window.customCards.push({
    type: _card_config_js__WEBPACK_IMPORTED_MODULE_4__.CardRegname,
    name: _card_config_js__WEBPACK_IMPORTED_MODULE_4__.CardName,
    description: _card_config_js__WEBPACK_IMPORTED_MODULE_4__.CardDescription,
    preview: true
  });
}

// Registriere die Karte als Custom Element
if (!customElements.get(_card_config_js__WEBPACK_IMPORTED_MODULE_4__.CardRegname)) {
  try {
    customElements.define(_card_config_js__WEBPACK_IMPORTED_MODULE_4__.CardRegname, Card);
  } catch (error) {}
}

/***/ }),

/***/ "./src/editor/editor-base.js":
/*!***********************************!*\
  !*** ./src/editor/editor-base.js ***!
  \***********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EditorBase: () => (/* binding */ EditorBase)
/* harmony export */ });
/* harmony import */ var lit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lit */ "./node_modules/lit/index.js");
/* harmony import */ var _super_base_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../super-base.js */ "./src/super-base.js");
var _EditorBase;
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _superPropGet(t, o, e, r) { var p = _get(_getPrototypeOf(1 & r ? t.prototype : t), o, e); return 2 & r && "function" == typeof p ? function (t) { return p.apply(e, t); } : p; }
function _get() { return _get = "undefined" != typeof Reflect && Reflect.get ? Reflect.get.bind() : function (e, t, r) { var p = _superPropBase(e, t); if (p) { var n = Object.getOwnPropertyDescriptor(p, t); return n.get ? n.get.call(arguments.length < 3 ? e : r) : n.value; } }, _get.apply(null, arguments); }
function _superPropBase(t, o) { for (; !{}.hasOwnProperty.call(t, o) && null !== (t = _getPrototypeOf(t));); return t; }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }


class EditorBase extends _super_base_js__WEBPACK_IMPORTED_MODULE_1__.SuperBase {
  constructor(defaultConfig = {}) {
    super();
    this._debug('[EditorBase] EditorBase-Konstruktor wird aufgerufen');
    this.config = {
      type: 'custom:tgeditor-card',
      ...defaultConfig
    };
    this._debug('[EditorBase] EditorBase config nach Konstruktor:', this.config);
  }
  async firstUpdated() {
    this._debug('[EditorBase] EditorBase firstUpdated wird aufgerufen');
    await super.firstUpdated();
    this._debug('[EditorBase] EditorBase firstUpdated abgeschlossen');
  }
  async loadHaForm() {
    this._debug('[EditorBase] EditorBase loadHaForm wird aufgerufen');
    if (!customElements.get('ha-form')) {
      this._debug('[EditorBase] EditorBase ha-form nicht gefunden, lade custom-card-helpers');
      try {
        const cardHelpers = await __webpack_require__.e(/*! import() */ "vendors-node_modules_custom-card-helpers_dist_index_m_js").then(__webpack_require__.bind(__webpack_require__, /*! custom-card-helpers */ "./node_modules/custom-card-helpers/dist/index.m.js"));
        this._debug('[EditorBase] EditorBase custom-card-helpers geladen');
        await cardHelpers.loadHaForm();
        this._debug('[EditorBase] EditorBase ha-form geladen');
      } catch (error) {
        throw error;
      }
    } else {
      this._debug('[EditorBase] EditorBase ha-form bereits geladen');
    }
  }
  getDefaultConfig() {
    this._debug('[EditorBase] EditorBase getDefaultConfig wird aufgerufen');
    throw new Error('getDefaultConfig muss in der abgeleiteten Klasse implementiert werden');
  }
  getStubConfig() {
    this._debug('[EditorBase] EditorBase getStubConfig wird aufgerufen');
    return this.getDefaultConfig();
  }
  setConfig(config) {
    this._debug('[EditorBase] EditorBase setConfig wird aufgerufen mit:', config);
    if (!config) {
      throw new Error('Keine Konfiguration angegeben');
    }

    // Prüfe, ob es sich um eine neue Konfiguration handelt
    const isNewConfig = !this.config || Object.keys(this.config).length === 0;

    // Wenn es eine neue Konfiguration ist, verwende sie direkt
    if (isNewConfig) {
      this.config = {
        ...this.getDefaultConfig(),
        ...config
      };
    } else {
      // Ansonsten behalte die bestehende Konfiguration bei und aktualisiere nur geänderte Werte
      this.config = {
        ...this.config,
        ...config
      };
    }
    this._debug('[EditorBase] EditorBase config nach setConfig:', this.config);
  }
}
_EditorBase = EditorBase;
_defineProperty(EditorBase, "properties", {
  ..._superPropGet(_EditorBase, "properties", _EditorBase),
  _selectedTab: {
    type: Number
  }
});
_defineProperty(EditorBase, "styles", [_superPropGet(_EditorBase, "styles", _EditorBase), (0,lit__WEBPACK_IMPORTED_MODULE_0__.css)`
      :host {
        display: block;
      }
      .editor-container {
        padding: 16px;
      }
    `]);

/***/ }),

/***/ "./src/editor/editor-impl.js":
/*!***********************************!*\
  !*** ./src/editor/editor-impl.js ***!
  \***********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EditorImpl: () => (/* binding */ EditorImpl)
/* harmony export */ });
/* harmony import */ var lit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lit */ "./node_modules/lit/index.js");
/* harmony import */ var _editor_base_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./editor-base.js */ "./src/editor/editor-base.js");
/* harmony import */ var _card_config_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../card-config.js */ "./src/card-config.js");
var _EditorImpl;
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _superPropGet(t, o, e, r) { var p = _get(_getPrototypeOf(1 & r ? t.prototype : t), o, e); return 2 & r && "function" == typeof p ? function (t) { return p.apply(e, t); } : p; }
function _get() { return _get = "undefined" != typeof Reflect && Reflect.get ? Reflect.get.bind() : function (e, t, r) { var p = _superPropBase(e, t); if (p) { var n = Object.getOwnPropertyDescriptor(p, t); return n.get ? n.get.call(arguments.length < 3 ? e : r) : n.value; } }, _get.apply(null, arguments); }
function _superPropBase(t, o) { for (; !{}.hasOwnProperty.call(t, o) && null !== (t = _getPrototypeOf(t));); return t; }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }



class EditorImpl extends _editor_base_js__WEBPACK_IMPORTED_MODULE_1__.EditorBase {
  constructor() {
    super({
      numberOfMonths: 14,
      initialDisplayedMonths: 2,
      selectedCalendar: 'a',
      store_mode: 'saver',
      saver_key: 'Schichtplan',
      calendars: [{
        shortcut: 'a',
        name: 'Schicht A',
        color: '#ff9800',
        enabled: true,
        statusRelevant: true
      }, {
        shortcut: 'b',
        name: 'Schicht B',
        color: '#ff0000',
        enabled: false,
        statusRelevant: true
      }, {
        shortcut: 'c',
        name: 'Schicht C',
        color: '#00ff00',
        enabled: false,
        statusRelevant: true
      }, {
        shortcut: 'd',
        name: 'Schicht D',
        color: '#0000ff',
        enabled: false,
        statusRelevant: true
      }, {
        shortcut: 'e',
        name: 'Schicht E',
        color: '#ffff00',
        enabled: false,
        statusRelevant: true
      }],
      holidays: {
        neujahr: true,
        heilige_drei_koenige: true,
        tag_der_arbeit: true,
        friedensfest: true,
        mariae_himmelfahrt: true,
        tag_der_deutschen_einheit: true,
        reformationstag: true,
        allerheiligen: true,
        weihnachten_1: true,
        weihnachten_2: true,
        karfreitag: true,
        ostermontag: true,
        christi_himmelfahrt: true,
        pfingstmontag: true,
        fronleichnam: true,
        busstag: true
      }
    });
    this._debug(`EditorImpl-Modul wird geladen`);
  }
  async firstUpdated() {
    this._debug(`EditorImpl firstUpdated wird aufgerufen`);
    await super.firstUpdated();
    this._debug(`EditorImpl firstUpdated abgeschlossen`);
  }
  render() {
    this._debug('EditorImpl render wird aufgerufen');
    if (!this.hass) {
      this._debug(`EditorImpl render: Kein hass`);
      return (0,lit__WEBPACK_IMPORTED_MODULE_0__.html)`<div>Loading...</div>`;
    }
    this._debug(`EditorImpl render mit config:`, this.config);

    // Stelle sicher, dass calendars Array vorhanden ist und alle 5 Kalender enthält
    if (!this.config.calendars || !Array.isArray(this.config.calendars)) {
      this.config.calendars = [{
        shortcut: 'a',
        name: 'Schicht A',
        color: '#ff9800',
        enabled: false,
        statusRelevant: true
      }, {
        shortcut: 'b',
        name: 'Schicht B',
        color: '#ff0000',
        enabled: false,
        statusRelevant: true
      }, {
        shortcut: 'c',
        name: 'Schicht C',
        color: '#00ff00',
        enabled: false,
        statusRelevant: true
      }, {
        shortcut: 'd',
        name: 'Schicht D',
        color: '#0000ff',
        enabled: false,
        statusRelevant: true
      }, {
        shortcut: 'e',
        name: 'Schicht E',
        color: '#ffff00',
        enabled: false,
        statusRelevant: true
      }];
    }

    // Stelle sicher, dass genau 5 Kalender vorhanden sind (a, b, c, d, e)
    const defaultCalendars = [{
      shortcut: 'a',
      name: 'Schicht A',
      color: '#ff9800',
      enabled: false,
      statusRelevant: true
    }, {
      shortcut: 'b',
      name: 'Schicht B',
      color: '#ff0000',
      enabled: false,
      statusRelevant: true
    }, {
      shortcut: 'c',
      name: 'Schicht C',
      color: '#00ff00',
      enabled: false,
      statusRelevant: true
    }, {
      shortcut: 'd',
      name: 'Schicht D',
      color: '#0000ff',
      enabled: false,
      statusRelevant: true
    }, {
      shortcut: 'e',
      name: 'Schicht E',
      color: '#ffff00',
      enabled: false,
      statusRelevant: true
    }];

    // Initialisiere oder aktualisiere Kalender-Array
    const calendarsMap = new Map();
    this.config.calendars.forEach(cal => calendarsMap.set(cal.shortcut, cal));

    // Füge fehlende Kalender hinzu oder aktualisiere vorhandene
    this.config.calendars = defaultCalendars.map(defaultCal => {
      const existing = calendarsMap.get(defaultCal.shortcut);
      if (existing) {
        // Behalte konfigurierte Werte, aber stelle sicher, dass shortcut fix bleibt
        // Stelle sicher, dass statusRelevant vorhanden ist (Default: true)
        return {
          ...defaultCal,
          ...existing,
          shortcut: defaultCal.shortcut,
          statusRelevant: existing.statusRelevant !== undefined ? existing.statusRelevant : true
        };
      }
      return defaultCal;
    });

    // Stelle sicher, dass store_mode immer 'saver' ist und saver_key gesetzt ist
    this.config.store_mode = 'saver';
    if (!this.config.saver_key) {
      this.config.saver_key = 'Schichtplan';
    }
    return (0,lit__WEBPACK_IMPORTED_MODULE_0__.html)`
      <div class="card-config">
        <div class="saver-info-message">
          <p>
            <strong>💾 Saver-Integration:</strong> Diese Karte verwendet die 
            <a href="https://github.com/PiotrMachowski/Home-Assistant-custom-components-Saver" target="_blank" rel="noopener noreferrer">Saver-Integration</a> 
            zur Speicherung der Schichtdaten. Die Daten werden in Saver-Variablen gespeichert, ohne Längenbegrenzung.
          </p>
        </div>
        <ha-form
          .hass=${this.hass}
          .data=${this.config}
          .schema=${this._getBasicSchema()}
          .computeLabel=${this._computeLabel}
          @value-changed=${this._valueChanged}
        ></ha-form>
        <div class="elements-section">${this._renderHolidays()}</div>
      </div>
    `;
  }
  _updateUseElements(value) {
    this.config = {
      ...this.config,
      useElements: value
    };
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: {
        config: this.config
      },
      bubbles: true,
      composed: true
    }));
    this.requestUpdate();
  }
  _getColorOptions() {
    // Liste von vordefinierten Farben
    return [{
      value: '#ff0000',
      name: 'Rot'
    }, {
      value: '#00ff00',
      name: 'Grün'
    }, {
      value: '#0000ff',
      name: 'Blau'
    }, {
      value: '#ffff00',
      name: 'Gelb'
    }, {
      value: '#ff00ff',
      name: 'Magenta'
    }, {
      value: '#00ffff',
      name: 'Cyan'
    }, {
      value: '#ff8800',
      name: 'Orange'
    }, {
      value: '#8800ff',
      name: 'Violett'
    }, {
      value: '#0088ff',
      name: 'Hellblau'
    }, {
      value: '#ff0088',
      name: 'Pink'
    }, {
      value: '#88ff00',
      name: 'Lime'
    }, {
      value: '#008888',
      name: 'Türkis'
    }, {
      value: '#888888',
      name: 'Grau'
    }, {
      value: '#000000',
      name: 'Schwarz'
    }, {
      value: '#ffffff',
      name: 'Weiß'
    }];
  }
  _validateTime(timeString) {
    if (!timeString || timeString.trim() === '') {
      return true; // Leer ist erlaubt (optional)
    }
    const timePattern = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    return timePattern.test(timeString.trim());
  }
  _validateTimeRange(range) {
    if (!range || !Array.isArray(range) || range.length < 2) {
      return {
        isValid: true,
        message: ''
      }; // Leer ist erlaubt
    }
    const start = range[0];
    const end = range[1];
    const hasStart = start && start.trim() !== '';
    const hasEnd = end && end.trim() !== '';

    // Beide leer = OK (optional)
    if (!hasStart && !hasEnd) {
      return {
        isValid: true,
        message: ''
      };
    }

    // Beide gesetzt = prüfe Format
    if (hasStart && hasEnd) {
      const startValid = this._validateTime(start);
      const endValid = this._validateTime(end);
      if (!startValid) {
        return {
          isValid: false,
          message: 'Ungültiges Format für Startzeit. Bitte HH:MM verwenden (z.B. 08:30)'
        };
      }
      if (!endValid) {
        return {
          isValid: false,
          message: 'Ungültiges Format für Endzeit. Bitte HH:MM verwenden (z.B. 17:00)'
        };
      }
      return {
        isValid: true,
        message: ''
      };
    }

    // Nur eine Zeit gesetzt = Fehler
    if (hasStart && !hasEnd) {
      return {
        isValid: false,
        message: 'Bitte auch die Endzeit angeben'
      };
    }
    if (!hasStart && hasEnd) {
      return {
        isValid: false,
        message: 'Bitte auch die Startzeit angeben'
      };
    }
    return {
      isValid: true,
      message: ''
    };
  }
  _renderCalendar(index, calendar) {
    const colorOptions = this._getColorOptions();
    const currentColor = calendar.color || '#ff0000';
    const timeRanges = calendar.timeRanges || [[null, null], [null, null]];
    const shiftName = calendar.name || `Schicht ${calendar.shortcut.toUpperCase()}`;
    const isEnabled = calendar.enabled || false;

    // Validiere Zeiträume für visuelles Feedback
    const range1Validation = this._validateTimeRange(timeRanges[0]);
    const range2Validation = this._validateTimeRange(timeRanges[1]);

    // Prüfe einzelne Zeiten für Format-Validierung
    const isValidTimeRange1Start = !timeRanges[0] || !timeRanges[0][0] || this._validateTime(timeRanges[0][0]);
    const isValidTimeRange1End = !timeRanges[0] || !timeRanges[0][1] || this._validateTime(timeRanges[0][1]);
    const isValidTimeRange2Start = !timeRanges[1] || !timeRanges[1][0] || this._validateTime(timeRanges[1][0]);
    const isValidTimeRange2End = !timeRanges[1] || !timeRanges[1][1] || this._validateTime(timeRanges[1][1]);

    // Kombiniere Format- und Vollständigkeits-Validierung
    const range1StartError = !isValidTimeRange1Start || !range1Validation.isValid;
    const range1EndError = !isValidTimeRange1End || !range1Validation.isValid;
    const range2StartError = !isValidTimeRange2Start || !range2Validation.isValid;
    const range2EndError = !isValidTimeRange2End || !range2Validation.isValid;
    return (0,lit__WEBPACK_IMPORTED_MODULE_0__.html)`
      <details class="calendar-item">
        <summary class="calendar-summary">
          <span class="calendar-summary-title"
            >Schicht ${calendar.shortcut.toUpperCase()}: ${shiftName}</span
          >
          <span class="calendar-summary-status">
            ${isEnabled ? (0,lit__WEBPACK_IMPORTED_MODULE_0__.html)`<span class="status-badge status-enabled">Aktiviert</span>` : (0,lit__WEBPACK_IMPORTED_MODULE_0__.html)`<span class="status-badge status-disabled">Deaktiviert</span>`}
          </span>
        </summary>
        <div class="calendar-fields">
          <ha-textfield
            label="Name"
            .value=${calendar.name || ''}
            maxlength="30"
            @input=${e => this._updateCalendar(calendar.shortcut, 'name', e.target.value)}
          ></ha-textfield>
          <div class="switch-item">
            <label class="switch-label">Aktiviert</label>
            <ha-switch
              .checked=${calendar.enabled || false}
              @change=${e => this._updateCalendar(calendar.shortcut, 'enabled', e.target.checked)}
            ></ha-switch>
          </div>
          <div class="switch-item">
            <label class="switch-label">Status relevant</label>
            <ha-switch
              .checked=${calendar.statusRelevant !== false}
              @change=${e => this._updateCalendar(calendar.shortcut, 'statusRelevant', e.target.checked)}
            ></ha-switch>
          </div>
          <div class="color-selector">
            <div class="color-selector-label">Farbe</div>
            <ha-combo-box
              label="Farbe"
              .value=${currentColor}
              .items=${colorOptions.map(color => ({
      value: color.value,
      label: `${color.name} (${color.value})`
    }))}
              @value-changed=${e => {
      const value = e.detail?.value;
      if (value) {
        this._updateCalendar(calendar.shortcut, 'color', value);
      }
    }}
            ></ha-combo-box>
            <div class="color-selected-preview">
              <span class="color-preview-large" style="background-color: ${currentColor};"></span>
              <span class="color-selected-value">${currentColor}</span>
            </div>
          </div>
          <div class="time-ranges">
            <div class="time-range-label">Zeiträume (optional)</div>
            <div class="time-range-item">
              <ha-textfield
                label="Startzeit 1"
                .value=${timeRanges[0] && timeRanges[0][0] ? timeRanges[0][0] : ''}
                placeholder="HH:MM"
                pattern="^([0-1][0-9]|2[0-3]):[0-5][0-9]$"
                .error=${range1StartError}
                .helper=${range1StartError ? range1Validation.message || 'Ungültiges Format. Bitte HH:MM verwenden (z.B. 08:30)' : ''}
                @input=${e => {
      const value = e.target.value.trim() || null;
      const formatValid = !value || this._validateTime(value);
      this._updateTimeRange(calendar.shortcut, 0, 0, value);
      // Prüfe Vollständigkeit nach Update
      setTimeout(() => {
        const updatedCal = this.config.calendars?.find(c => c.shortcut === calendar.shortcut);
        const updatedRange = updatedCal?.timeRanges?.[0] || [null, null];
        const rangeValidation = this._validateTimeRange(updatedRange);
        const hasError = !formatValid || !rangeValidation.isValid;
        e.target.error = hasError;
        e.target.helper = hasError ? rangeValidation.message || 'Ungültiges Format. Bitte HH:MM verwenden (z.B. 08:30)' : '';
        this.requestUpdate();
      }, 0);
    }}
                @blur=${e => {
      const value = e.target.value.trim() || null;
      const formatValid = !value || this._validateTime(value);
      const updatedCal = this.config.calendars?.find(c => c.shortcut === calendar.shortcut);
      const updatedRange = updatedCal?.timeRanges?.[0] || [null, null];
      const rangeValidation = this._validateTimeRange(updatedRange);
      const hasError = !formatValid || !rangeValidation.isValid;
      e.target.error = hasError;
      e.target.helper = hasError ? rangeValidation.message || 'Ungültiges Format. Bitte HH:MM verwenden (z.B. 08:30)' : '';
      this.requestUpdate();
    }}
              ></ha-textfield>
              <span class="time-separator">-</span>
              <ha-textfield
                label="Endzeit 1"
                .value=${timeRanges[0] && timeRanges[0][1] ? timeRanges[0][1] : ''}
                placeholder="HH:MM"
                pattern="^([0-1][0-9]|2[0-3]):[0-5][0-9]$"
                .error=${range1EndError}
                .helper=${range1EndError ? range1Validation.message || 'Ungültiges Format. Bitte HH:MM verwenden (z.B. 17:00)' : ''}
                @input=${e => {
      const value = e.target.value.trim() || null;
      const formatValid = !value || this._validateTime(value);
      this._updateTimeRange(calendar.shortcut, 0, 1, value);
      setTimeout(() => {
        const updatedCal = this.config.calendars?.find(c => c.shortcut === calendar.shortcut);
        const updatedRange = updatedCal?.timeRanges?.[0] || [null, null];
        const rangeValidation = this._validateTimeRange(updatedRange);
        const hasError = !formatValid || !rangeValidation.isValid;
        e.target.error = hasError;
        e.target.helper = hasError ? rangeValidation.message || 'Ungültiges Format. Bitte HH:MM verwenden (z.B. 17:00)' : '';
        this.requestUpdate();
      }, 0);
    }}
                @blur=${e => {
      const value = e.target.value.trim() || null;
      const formatValid = !value || this._validateTime(value);
      const updatedCal = this.config.calendars?.find(c => c.shortcut === calendar.shortcut);
      const updatedRange = updatedCal?.timeRanges?.[0] || [null, null];
      const rangeValidation = this._validateTimeRange(updatedRange);
      const hasError = !formatValid || !rangeValidation.isValid;
      e.target.error = hasError;
      e.target.helper = hasError ? rangeValidation.message || 'Ungültiges Format. Bitte HH:MM verwenden (z.B. 17:00)' : '';
      this.requestUpdate();
    }}
              ></ha-textfield>
            </div>
            <div class="time-range-item">
              <ha-textfield
                label="Startzeit 2"
                .value=${timeRanges[1] && timeRanges[1][0] ? timeRanges[1][0] : ''}
                placeholder="HH:MM"
                pattern="^([0-1][0-9]|2[0-3]):[0-5][0-9]$"
                .error=${range2StartError}
                .helper=${range2StartError ? range2Validation.message || 'Ungültiges Format. Bitte HH:MM verwenden (z.B. 08:30)' : ''}
                @input=${e => {
      const value = e.target.value.trim() || null;
      const formatValid = !value || this._validateTime(value);
      this._updateTimeRange(calendar.shortcut, 1, 0, value);
      setTimeout(() => {
        const updatedCal = this.config.calendars?.find(c => c.shortcut === calendar.shortcut);
        const updatedRange = updatedCal?.timeRanges?.[1] || [null, null];
        const rangeValidation = this._validateTimeRange(updatedRange);
        const hasError = !formatValid || !rangeValidation.isValid;
        e.target.error = hasError;
        e.target.helper = hasError ? rangeValidation.message || 'Ungültiges Format. Bitte HH:MM verwenden (z.B. 08:30)' : '';
        this.requestUpdate();
      }, 0);
    }}
                @blur=${e => {
      const value = e.target.value.trim() || null;
      const formatValid = !value || this._validateTime(value);
      const updatedCal = this.config.calendars?.find(c => c.shortcut === calendar.shortcut);
      const updatedRange = updatedCal?.timeRanges?.[1] || [null, null];
      const rangeValidation = this._validateTimeRange(updatedRange);
      const hasError = !formatValid || !rangeValidation.isValid;
      e.target.error = hasError;
      e.target.helper = hasError ? rangeValidation.message || 'Ungültiges Format. Bitte HH:MM verwenden (z.B. 08:30)' : '';
      this.requestUpdate();
    }}
              ></ha-textfield>
              <span class="time-separator">-</span>
              <ha-textfield
                label="Endzeit 2"
                .value=${timeRanges[1] && timeRanges[1][1] ? timeRanges[1][1] : ''}
                placeholder="HH:MM"
                pattern="^([0-1][0-9]|2[0-3]):[0-5][0-9]$"
                .error=${range2EndError}
                .helper=${range2EndError ? range2Validation.message || 'Ungültiges Format. Bitte HH:MM verwenden (z.B. 17:00)' : ''}
                @input=${e => {
      const value = e.target.value.trim() || null;
      const formatValid = !value || this._validateTime(value);
      this._updateTimeRange(calendar.shortcut, 1, 1, value);
      setTimeout(() => {
        const updatedCal = this.config.calendars?.find(c => c.shortcut === calendar.shortcut);
        const updatedRange = updatedCal?.timeRanges?.[1] || [null, null];
        const rangeValidation = this._validateTimeRange(updatedRange);
        const hasError = !formatValid || !rangeValidation.isValid;
        e.target.error = hasError;
        e.target.helper = hasError ? rangeValidation.message || 'Ungültiges Format. Bitte HH:MM verwenden (z.B. 17:00)' : '';
        this.requestUpdate();
      }, 0);
    }}
                @blur=${e => {
      const value = e.target.value.trim() || null;
      const formatValid = !value || this._validateTime(value);
      const updatedCal = this.config.calendars?.find(c => c.shortcut === calendar.shortcut);
      const updatedRange = updatedCal?.timeRanges?.[1] || [null, null];
      const rangeValidation = this._validateTimeRange(updatedRange);
      const hasError = !formatValid || !rangeValidation.isValid;
      e.target.error = hasError;
      e.target.helper = hasError ? rangeValidation.message || 'Ungültiges Format. Bitte HH:MM verwenden (z.B. 17:00)' : '';
      this.requestUpdate();
    }}
              ></ha-textfield>
            </div>
          </div>
        </div>
      </details>
    `;
  }
  _renderHolidays() {
    // Stelle sicher, dass holidays Konfiguration existiert
    if (!this.config.holidays) {
      this.config.holidays = {
        neujahr: true,
        heilige_drei_koenige: true,
        tag_der_arbeit: true,
        friedensfest: true,
        mariae_himmelfahrt: true,
        tag_der_deutschen_einheit: true,
        reformationstag: true,
        allerheiligen: true,
        weihnachten_1: true,
        weihnachten_2: true,
        karfreitag: true,
        ostermontag: true,
        christi_himmelfahrt: true,
        pfingstmontag: true,
        fronleichnam: true,
        busstag: true
      };
    }
    const holidays = [{
      key: 'neujahr',
      label: 'Neujahr (1. Januar)'
    }, {
      key: 'heilige_drei_koenige',
      label: 'Heilige Drei Könige (6. Januar)'
    }, {
      key: 'tag_der_arbeit',
      label: 'Tag der Arbeit (1. Mai)'
    }, {
      key: 'friedensfest',
      label: 'Friedensfest (8. August)'
    }, {
      key: 'mariae_himmelfahrt',
      label: 'Mariä Himmelfahrt (15. August)'
    }, {
      key: 'tag_der_deutschen_einheit',
      label: 'Tag der Deutschen Einheit (3. Oktober)'
    }, {
      key: 'reformationstag',
      label: 'Reformationstag (31. Oktober)'
    }, {
      key: 'allerheiligen',
      label: 'Allerheiligen (1. November)'
    }, {
      key: 'weihnachten_1',
      label: '1. Weihnachtsfeiertag (25. Dezember)'
    }, {
      key: 'weihnachten_2',
      label: '2. Weihnachtsfeiertag (26. Dezember)'
    }, {
      key: 'karfreitag',
      label: 'Karfreitag'
    }, {
      key: 'ostermontag',
      label: 'Ostermontag'
    }, {
      key: 'christi_himmelfahrt',
      label: 'Christi Himmelfahrt'
    }, {
      key: 'pfingstmontag',
      label: 'Pfingstmontag'
    }, {
      key: 'fronleichnam',
      label: 'Fronleichnam'
    }, {
      key: 'busstag',
      label: 'Buß- und Bettag'
    }];
    return (0,lit__WEBPACK_IMPORTED_MODULE_0__.html)`
      <details class="holidays-item">
        <summary class="holidays-summary">
          <span class="holidays-summary-title">Feiertage</span>
        </summary>
        <div class="holidays-fields">
          ${holidays.map(holiday => (0,lit__WEBPACK_IMPORTED_MODULE_0__.html)`
              <div class="holiday-switch-item">
                <label class="holiday-label">${holiday.label}</label>
                <ha-switch
                  .checked=${this.config.holidays[holiday.key] !== false}
                  @change=${e => this._updateHoliday(holiday.key, e.target.checked)}
                ></ha-switch>
              </div>
            `)}
        </div>
      </details>
    `;
  }
  _updateHoliday(key, enabled) {
    if (!this.config.holidays) {
      this.config.holidays = {};
    }

    // Aktualisiere die Config direkt (immutable update)
    const newConfig = {
      ...this.config,
      holidays: {
        ...this.config.holidays,
        [key]: enabled
      }
    };

    // Aktualisiere die Config direkt
    this.config = newConfig;

    // Aktualisiere die Ansicht sofort
    this.requestUpdate();

    // Dispatch config-changed Event
    setTimeout(() => {
      this.dispatchEvent(new CustomEvent('config-changed', {
        detail: {
          config: newConfig
        },
        bubbles: true,
        composed: true
      }));
    }, 0);
  }
  _updateTimeRange(shortcut, rangeIndex, timeIndex, value) {
    // rangeIndex: 0 oder 1 (erster oder zweiter Zeitraum)
    // timeIndex: 0 oder 1 (Start oder End)
    if (!this.config.calendars) {
      this.config.calendars = [{
        shortcut: 'a',
        name: 'Schicht A',
        color: '#ff9800',
        enabled: false
      }, {
        shortcut: 'b',
        name: 'Schicht B',
        color: '#ff0000',
        enabled: false
      }, {
        shortcut: 'c',
        name: 'Schicht C',
        color: '#00ff00',
        enabled: false
      }, {
        shortcut: 'd',
        name: 'Schicht D',
        color: '#0000ff',
        enabled: false
      }, {
        shortcut: 'e',
        name: 'Schicht E',
        color: '#ffff00',
        enabled: false
      }];
    }

    // Erstelle eine neue Kopie des Arrays und aktualisiere den betroffenen Kalender
    const newCalendars = this.config.calendars.map(cal => {
      if (cal.shortcut === shortcut) {
        // Stelle sicher, dass timeRanges Array existiert
        const timeRanges = cal.timeRanges || [[null, null], [null, null]];
        // Erstelle eine Kopie des timeRanges Arrays
        const newTimeRanges = timeRanges.map((range, idx) => {
          if (idx === rangeIndex) {
            // Erstelle eine Kopie des Zeitraums
            const newRange = [...range];
            newRange[timeIndex] = value || null;
            return newRange;
          }
          return range;
        });
        return {
          ...cal,
          timeRanges: newTimeRanges
        };
      }
      return cal;
    });

    // Aktualisiere die Config direkt (immutable update)
    const newConfig = {
      ...this.config,
      calendars: newCalendars
    };

    // Aktualisiere die Config direkt
    this.config = newConfig;

    // Aktualisiere die Ansicht sofort
    this.requestUpdate();

    // Dispatch config-changed Event
    setTimeout(() => {
      this.dispatchEvent(new CustomEvent('config-changed', {
        detail: {
          config: newConfig
        },
        bubbles: true,
        composed: true
      }));
    }, 0);
  }
  _updateCalendar(shortcut, property, value) {
    if (!this.config.calendars) {
      this.config.calendars = [{
        shortcut: 'a',
        name: 'Schicht A',
        color: '#ff9800',
        enabled: false
      }, {
        shortcut: 'b',
        name: 'Schicht B',
        color: '#ff0000',
        enabled: false
      }, {
        shortcut: 'c',
        name: 'Schicht C',
        color: '#00ff00',
        enabled: false
      }, {
        shortcut: 'd',
        name: 'Schicht D',
        color: '#0000ff',
        enabled: false
      }, {
        shortcut: 'e',
        name: 'Schicht E',
        color: '#ffff00',
        enabled: false
      }];
    }

    // Erstelle eine neue Kopie des Arrays und aktualisiere den betroffenen Kalender
    const newCalendars = this.config.calendars.map(cal => {
      if (cal.shortcut === shortcut) {
        return {
          ...cal,
          [property]: value
        };
      }
      return cal;
    });

    // Aktualisiere die Config direkt (immutable update)
    const newConfig = {
      ...this.config,
      calendars: newCalendars
    };

    // Aktualisiere die Config direkt
    this.config = newConfig;

    // Aktualisiere die Ansicht sofort
    this.requestUpdate();

    // Dispatch config-changed Event - Home Assistant speichert die Config automatisch
    // Verwende setTimeout, um sicherzustellen, dass das Event nicht den Editor schließt
    setTimeout(() => {
      this.dispatchEvent(new CustomEvent('config-changed', {
        detail: {
          config: newConfig
        },
        bubbles: true,
        composed: true
      }));
    }, 0);
  }
  _computeLabel(schema) {
    switch (schema.name) {
      case 'numberOfMonths':
        return 'Maximale Anzahl Monate';
      case 'initialDisplayedMonths':
        return 'Standardwert sichtbare Monate';
      case 'saver_key':
        return 'Saver-Variablenname';
      default:
        return schema.name;
    }
  }
  _valueChanged(ev) {
    this._debug('EditorImpl _valueChanged wird aufgerufen mit:', ev.detail);
    const newValue = ev.detail.value;
    const oldStoreMode = this.config.store_mode;

    // Stelle sicher, dass initialDisplayedMonths nicht größer als numberOfMonths ist
    if (newValue.initialDisplayedMonths !== undefined && newValue.numberOfMonths !== undefined) {
      newValue.initialDisplayedMonths = Math.min(newValue.initialDisplayedMonths, newValue.numberOfMonths);
    } else if (newValue.initialDisplayedMonths !== undefined && this.config.numberOfMonths) {
      newValue.initialDisplayedMonths = Math.min(newValue.initialDisplayedMonths, this.config.numberOfMonths);
    } else if (newValue.numberOfMonths !== undefined && this.config.initialDisplayedMonths) {
      // Wenn numberOfMonths geändert wird, passe initialDisplayedMonths an, falls nötig
      if (this.config.initialDisplayedMonths > newValue.numberOfMonths) {
        newValue.initialDisplayedMonths = newValue.numberOfMonths;
      }
    }

    // Stelle sicher, dass store_mode immer 'saver' ist und saver_key gesetzt ist
    newValue.store_mode = 'saver';
    if (newValue.saver_key === undefined) {
      newValue.saver_key = this.config.saver_key || 'Schichtplan';
    }
    this.config = {
      ...this.config,
      ...newValue
    };
    this._debug('EditorImpl config nach _valueChanged:', this.config);
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: {
        config: this.config
      },
      bubbles: true,
      composed: true
    }));
  }
  static getConfigElement() {
    return document.createElement(`${_card_config_js__WEBPACK_IMPORTED_MODULE_2__.CardRegname}-editor`);
  }
  static getStubConfig() {
    return {
      numberOfMonths: 14,
      initialDisplayedMonths: 2,
      store_mode: 'saver',
      saver_key: 'Schichtplan',
      useElements: false,
      selectedElement: null,
      elements: [{
        benennung: 'Element 1',
        aktiv: true,
        color: '#ff0000',
        shortcut: '1'
      }, {
        benennung: 'Element 2',
        aktiv: true,
        color: '#00ff00',
        shortcut: '2'
      }, {
        benennung: 'Element 3',
        aktiv: true,
        color: '#0000ff',
        shortcut: '3'
      }, {
        benennung: 'Element 4',
        aktiv: true,
        color: '#ffff00',
        shortcut: '4'
      }],
      holidays: {
        neujahr: true,
        heilige_drei_koenige: true,
        tag_der_arbeit: true,
        friedensfest: true,
        mariae_himmelfahrt: true,
        tag_der_deutschen_einheit: true,
        reformationstag: true,
        allerheiligen: true,
        weihnachten_1: true,
        weihnachten_2: true,
        karfreitag: true,
        ostermontag: true,
        christi_himmelfahrt: true,
        pfingstmontag: true,
        fronleichnam: true,
        busstag: true
      }
    };
  }
  _getBasicSchema() {
    const schema = [{
      name: 'saver_key',
      selector: {
        text: {}
      }
    }, {
      name: 'numberOfMonths',
      selector: {
        number: {
          min: 1,
          max: 14,
          step: 1,
          mode: 'box'
        }
      }
    }, {
      name: 'initialDisplayedMonths',
      selector: {
        number: {
          min: 1,
          max: 14,
          step: 1,
          mode: 'box'
        }
      }
    }];
    return schema;
  }
}
_EditorImpl = EditorImpl;
_defineProperty(EditorImpl, "properties", {
  ..._superPropGet(_EditorImpl, "properties", _EditorImpl)
});
_defineProperty(EditorImpl, "styles", [_superPropGet(_EditorImpl, "styles", _EditorImpl), (0,lit__WEBPACK_IMPORTED_MODULE_0__.css)`
      :host {
        display: block;
      }

      .card-config {
        padding: 10px;
      }

      .elements-section {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid var(--divider-color, #e0e0e0);
      }

      .elements-header {
        margin-bottom: 15px;
      }

      .elements-header ha-combo-box {
        width: 100%;
      }

      .saver-info-message {
        margin-bottom: 20px;
        padding: 12px;
        background-color: var(--info-color, #2196f3);
        color: white;
        border-radius: 4px;
      }

      .saver-info-message p {
        margin: 0;
      }

      .saver-info-message a {
        color: white;
        text-decoration: underline;
        font-weight: 500;
      }

      .saver-info-message a:hover {
        text-decoration: none;
      }

      .info-message {
        margin-top: 15px;
        padding: 12px;
        background-color: var(--info-color, #2196f3);
        color: white;
        border-radius: 4px;
      }

      .info-message p {
        margin: 0;
      }

      .calendar-item {
        margin-bottom: 12px;
        background-color: var(--card-background-color, #ffffff);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 4px;
        overflow: hidden;
      }

      .calendar-item[open] {
        border-color: var(--primary-color, #03a9f4);
      }

      .calendar-summary {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 15px;
        cursor: pointer;
        list-style: none;
        user-select: none;
        background-color: var(--card-background-color, #ffffff);
        transition: background-color 0.2s ease;
      }

      .calendar-summary::-webkit-details-marker {
        display: none;
      }

      .calendar-summary::before {
        content: '▶';
        display: inline-block;
        margin-right: 8px;
        transition: transform 0.2s ease;
        color: var(--primary-color, #03a9f4);
        font-size: 10px;
      }

      .calendar-item[open] .calendar-summary::before {
        transform: rotate(90deg);
      }

      .calendar-summary:hover {
        background-color: var(--divider-color, #f5f5f5);
      }

      .calendar-summary-title {
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color, #000000);
        flex: 1;
      }

      .calendar-summary-status {
        display: flex;
        align-items: center;
        margin-left: 12px;
      }

      .status-badge {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 500;
        text-transform: uppercase;
      }

      .status-enabled {
        background-color: var(--success-color, #4caf50);
        color: white;
      }

      .status-disabled {
        background-color: var(--disabled-color, #9e9e9e);
        color: white;
      }

      .calendar-fields {
        display: grid;
        grid-template-columns: 1fr;
        gap: 15px;
        padding: 15px;
        border-top: 1px solid var(--divider-color, #e0e0e0);
      }

      .calendar-fields ha-textfield,
      .calendar-fields ha-switch,
      .calendar-fields .color-selector {
        width: 100%;
      }

      .switch-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .switch-label {
        flex: 1;
        font-size: 14px;
        color: var(--primary-text-color, #000000);
        cursor: pointer;
      }

      .calendar-fields ha-switch {
        flex-shrink: 0;
      }

      ha-switch {
        display: flex;
        align-items: center;
      }

      .color-selector {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .color-selector-label {
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color, #000000);
      }

      .color-selector ha-combo-box {
        width: 100%;
      }

      .color-option {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 4px 0;
      }

      .color-preview {
        display: inline-block;
        width: 24px;
        height: 24px;
        border-radius: 4px;
        border: 1px solid var(--divider-color, #e0e0e0);
        flex-shrink: 0;
      }

      .color-preview-large {
        display: inline-block;
        width: 32px;
        height: 32px;
        border-radius: 4px;
        border: 2px solid var(--divider-color, #e0e0e0);
        flex-shrink: 0;
      }

      .color-name {
        flex: 1;
        font-weight: 500;
      }

      .color-value {
        font-size: 12px;
        color: var(--secondary-text-color, #888888);
        font-family: monospace;
      }

      .color-selected-preview {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px;
        background-color: var(--card-background-color, #f5f5f5);
        border-radius: 4px;
        border: 1px solid var(--divider-color, #e0e0e0);
      }

      .color-selected-value {
        font-size: 14px;
        font-family: monospace;
        color: var(--primary-text-color, #000000);
        font-weight: 500;
      }

      .time-ranges {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-top: 15px;
        padding: 12px;
        background-color: var(--card-background-color, #f5f5f5);
        border-radius: 4px;
        border: 1px solid var(--divider-color, #e0e0e0);
      }

      .time-range-label {
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color, #000000);
        margin-bottom: 8px;
      }

      .time-range-item {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .time-range-item ha-textfield {
        flex: 1;
      }

      .time-separator {
        font-size: 16px;
        font-weight: 500;
        color: var(--primary-text-color, #000000);
        flex-shrink: 0;
      }

      .holidays-item {
        margin-bottom: 12px;
        background-color: var(--card-background-color, #ffffff);
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 4px;
        overflow: hidden;
      }

      .holidays-item[open] {
        border-color: var(--primary-color, #03a9f4);
      }

      .holidays-summary {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 15px;
        cursor: pointer;
        list-style: none;
        user-select: none;
        background-color: var(--card-background-color, #ffffff);
        transition: background-color 0.2s ease;
      }

      .holidays-summary::-webkit-details-marker {
        display: none;
      }

      .holidays-summary::before {
        content: '▶';
        display: inline-block;
        margin-right: 8px;
        transition: transform 0.2s ease;
        color: var(--primary-color, #03a9f4);
        font-size: 10px;
      }

      .holidays-item[open] .holidays-summary::before {
        transform: rotate(90deg);
      }

      .holidays-summary:hover {
        background-color: var(--divider-color, #f5f5f5);
      }

      .holidays-summary-title {
        font-size: 14px;
        font-weight: 500;
        color: var(--primary-text-color, #000000);
        flex: 1;
      }

      .holidays-fields {
        display: grid;
        grid-template-columns: 1fr;
        gap: 12px;
        padding: 15px;
        border-top: 1px solid var(--divider-color, #e0e0e0);
      }

      .holiday-switch-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .holiday-label {
        flex: 1;
        font-size: 14px;
        color: var(--primary-text-color, #000000);
        cursor: pointer;
      }

      .holidays-fields ha-switch {
        flex-shrink: 0;
      }
    `]);

/***/ }),

/***/ "./src/editor/editor.js":
/*!******************************!*\
  !*** ./src/editor/editor.js ***!
  \******************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Editor: () => (/* binding */ Editor)
/* harmony export */ });
/* harmony import */ var lit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lit */ "./node_modules/lit/index.js");
/* harmony import */ var _editor_impl_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./editor-impl.js */ "./src/editor/editor-impl.js");
/* harmony import */ var _card_config_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../card-config.js */ "./src/card-config.js");
var _Editor;
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _superPropGet(t, o, e, r) { var p = _get(_getPrototypeOf(1 & r ? t.prototype : t), o, e); return 2 & r && "function" == typeof p ? function (t) { return p.apply(e, t); } : p; }
function _get() { return _get = "undefined" != typeof Reflect && Reflect.get ? Reflect.get.bind() : function (e, t, r) { var p = _superPropBase(e, t); if (p) { var n = Object.getOwnPropertyDescriptor(p, t); return n.get ? n.get.call(arguments.length < 3 ? e : r) : n.value; } }, _get.apply(null, arguments); }
function _superPropBase(t, o) { for (; !{}.hasOwnProperty.call(t, o) && null !== (t = _getPrototypeOf(t));); return t; }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }



class Editor extends _editor_impl_js__WEBPACK_IMPORTED_MODULE_1__.EditorImpl {
  constructor() {
    super();
  }
}
_Editor = Editor;
_defineProperty(Editor, "styles", [_superPropGet(_Editor, "styles", _Editor), (0,lit__WEBPACK_IMPORTED_MODULE_0__.css)`
      :host {
        display: block;
        padding-top: 2px;
        padding-bottom: 2px;
        padding-left: 16px;
        padding-right: 16px;
      }
    `]);
if (!customElements.get(`${_card_config_js__WEBPACK_IMPORTED_MODULE_2__.CardRegname}-editor`)) {
  customElements.define(`${_card_config_js__WEBPACK_IMPORTED_MODULE_2__.CardRegname}-editor`, Editor);
}

/***/ }),

/***/ "./src/storage/entity-storage.js":
/*!***************************************!*\
  !*** ./src/storage/entity-storage.js ***!
  \***************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   EntityStorage: () => (/* binding */ EntityStorage)
/* harmony export */ });
/* harmony import */ var _storage_interface_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./storage-interface.js */ "./src/storage/storage-interface.js");
/**
 * Entity-Storage-Implementierung
 * 
 * Speichert Daten in input_text Entities (mit Multi-Entity-Support)
 * Kann später leicht entfernt werden, wenn nur Saver-Storage verwendet werden soll.
 */


class EntityStorage extends _storage_interface_js__WEBPACK_IMPORTED_MODULE_0__.IStorageAdapter {
  static isApplicable(storeMode) {
    return storeMode === 'text_entity' || !storeMode || storeMode === '';
  }
  constructor(hass, config, debug) {
    super(hass, config, debug);
    this._knownEntityIds = null; // Cache für bekannte Entities
  }
  isAvailable() {
    return !!(this._hass && this._config && this._config.entity);
  }

  /**
   * Findet zusätzliche Entities (z.B. input_text.arbeitszeiten_001, _002, etc.)
   * @private
   */
  findAdditionalEntities(baseEntityId) {
    const additionalEntities = [];
    if (!this._hass || !this._hass.states) {
      return additionalEntities;
    }
    const entityParts = baseEntityId.split('.');
    if (entityParts.length !== 2) {
      return additionalEntities;
    }
    const [domain, baseName] = entityParts;

    // Suche nach Entities mit _001, _002, etc. (bis _999)
    for (let i = 1; i <= 999; i++) {
      const suffix = String(i).padStart(3, '0');
      const additionalEntityId = `${domain}.${baseName}_${suffix}`;
      if (this._hass.states[additionalEntityId]) {
        additionalEntities.push(additionalEntityId);
      } else {
        // Wenn eine Entity nicht existiert, breche ab (Entities sind sequenziell)
        break;
      }
    }
    return additionalEntities;
  }

  /**
   * Ermittelt die maximale Länge einer Entity
   * @private
   */
  getEntityMaxLength(entityId) {
    if (!this._hass || !this._hass.states || !entityId) {
      return null;
    }
    const entity = this._hass.states[entityId];
    if (!entity || !entity.attributes) {
      return null;
    }
    const maxLength = entity.attributes.max;
    if (maxLength !== undefined && maxLength !== null) {
      return parseInt(maxLength);
    }
    return null;
  }

  /**
   * Ermittelt die maximale Länge aller Entities
   * @private
   */
  getAllEntityMaxLengths() {
    const maxLengths = {};
    if (!this._hass || !this._config || !this._config.entity) {
      return maxLengths;
    }
    const mainEntityId = this._config.entity;
    const mainMaxLength = this.getEntityMaxLength(mainEntityId);
    if (mainMaxLength !== null) {
      maxLengths[mainEntityId] = mainMaxLength;
    }
    const additionalEntities = this.findAdditionalEntities(mainEntityId);
    for (const additionalEntityId of additionalEntities) {
      const additionalMaxLength = this.getEntityMaxLength(additionalEntityId);
      if (additionalMaxLength !== null) {
        maxLengths[additionalEntityId] = additionalMaxLength;
      }
    }
    return maxLengths;
  }

  /**
   * Sammelt alle Entity-IDs (Haupt-Entity + zusätzliche)
   * @private
   */
  _getAllEntityIds() {
    if (this._knownEntityIds && this._knownEntityIds.length > 0) {
      return [...this._knownEntityIds];
    }
    const allEntityIds = [this._config.entity];
    const additionalEntities = this.findAdditionalEntities(this._config.entity);
    allEntityIds.push(...additionalEntities);
    this._knownEntityIds = [...allEntityIds];
    return allEntityIds;
  }
  async saveData(serializedData) {
    if (!this.isAvailable()) {
      this._debug('[EntityStorage] saveData: Nicht verfügbar');
      return;
    }
    this._debug(`[EntityStorage] saveData: Start, Datenlänge: ${serializedData ? serializedData.length : 0} Zeichen`);
    try {
      // Verwende die gecachte Liste der Entities, falls verfügbar
      let allEntityIds = this._getAllEntityIds();

      // Prüfe ob neue Entities hinzugekommen sind
      const currentAdditionalEntities = this.findAdditionalEntities(this._config.entity);
      const knownAdditionalCount = this._knownEntityIds ? this._knownEntityIds.length - 1 : 0;
      if (currentAdditionalEntities.length > knownAdditionalCount) {
        const newEntities = currentAdditionalEntities.slice(knownAdditionalCount);
        allEntityIds.push(...newEntities);
        this._knownEntityIds = [...allEntityIds];
      }
      this._debug(`[EntityStorage] saveData: Verwende ${allEntityIds.length} Entities: ${allEntityIds.join(', ')}`);

      // Ermittle die maximale Länge für jede Entity
      const maxLengths = {};
      let totalMaxLength = 0;
      for (const entityId of allEntityIds) {
        const maxLength = this.getEntityMaxLength(entityId);
        if (maxLength !== null) {
          maxLengths[entityId] = maxLength;
          totalMaxLength += maxLength;
        } else {
          maxLengths[entityId] = 255; // Standard
          totalMaxLength += 255;
        }
      }
      const dataLength = serializedData ? serializedData.length : 0;
      this._debug(`[EntityStorage] saveData: Datenlänge: ${dataLength} Zeichen, verfügbarer Speicher: ${totalMaxLength} Zeichen`);

      // Wenn keine Daten vorhanden sind, setze alle Entities auf leer
      if (!serializedData || serializedData.trim() === '') {
        this._debug('[EntityStorage] saveData: Keine Daten vorhanden, setze alle Entities auf leer');
        for (const entityId of allEntityIds) {
          try {
            await this._hass.callService('input_text', 'set_value', {
              entity_id: entityId,
              value: ''
            });
          } catch (error) {
            this._debug(`[EntityStorage] saveData: Fehler beim Leeren von "${entityId}": ${error.message}`);
          }
        }
        return;
      }

      // Verteile die Daten zeichenweise auf die Entities
      const entityValues = {};
      let currentEntityIndex = 0;
      let remainingData = serializedData;
      while (remainingData.length > 0 && currentEntityIndex < allEntityIds.length) {
        const currentEntityId = allEntityIds[currentEntityIndex];
        const maxLength = maxLengths[currentEntityId];
        const charsToTake = Math.min(remainingData.length, maxLength);
        const valueToWrite = remainingData.substring(0, charsToTake);
        entityValues[currentEntityId] = valueToWrite;
        remainingData = remainingData.substring(charsToTake);
        if (remainingData.length > 0) {
          currentEntityIndex++;
        }
      }

      // Wenn am Ende noch Text über ist, prüfe ob neue Entities hinzugekommen sind
      if (remainingData.length > 0) {
        const currentAdditionalEntities = this.findAdditionalEntities(this._config.entity);
        const knownAdditionalCount = this._knownEntityIds ? this._knownEntityIds.length - 1 : 0;
        if (currentAdditionalEntities.length > knownAdditionalCount) {
          const newEntities = currentAdditionalEntities.slice(knownAdditionalCount);
          allEntityIds.push(...newEntities);
          this._knownEntityIds = [...allEntityIds];
          for (const newEntityId of newEntities) {
            const maxLength = this.getEntityMaxLength(newEntityId);
            if (maxLength !== null) {
              maxLengths[newEntityId] = maxLength;
            } else {
              maxLengths[newEntityId] = 255;
            }
          }

          // Versuche erneut zu verteilen
          while (remainingData.length > 0 && currentEntityIndex < allEntityIds.length) {
            const currentEntityId = allEntityIds[currentEntityIndex];
            const maxLength = maxLengths[currentEntityId];
            const charsToTake = Math.min(remainingData.length, maxLength);
            const valueToWrite = remainingData.substring(0, charsToTake);
            entityValues[currentEntityId] = valueToWrite;
            remainingData = remainingData.substring(charsToTake);
            if (remainingData.length > 0) {
              currentEntityIndex++;
            }
          }
        }
      }

      // Schreibe alle Entity-Werte
      for (const [entityId, value] of Object.entries(entityValues)) {
        try {
          await this._hass.callService('input_text', 'set_value', {
            entity_id: entityId,
            value: value
          });
          this._debug(`[EntityStorage] saveData: Entity "${entityId}" geschrieben, Länge: ${value.length} Zeichen`);
        } catch (error) {
          this._debug(`[EntityStorage] saveData: Fehler beim Schreiben in "${entityId}": ${error.message}`);
        }
      }
      this._debug('[EntityStorage] saveData: Erfolgreich abgeschlossen');
    } catch (error) {
      this._debug(`[EntityStorage] saveData: Fehler: ${error.message}`, error);
      throw error;
    }
  }
  async loadData() {
    if (!this.isAvailable()) {
      this._debug('[EntityStorage] loadData: Nicht verfügbar');
      return null;
    }
    this._debug(`[EntityStorage] loadData: Start, entity: "${this._config.entity}"`);

    // Ermittle die maximale Länge für alle Entities
    const maxLengths = this.getAllEntityMaxLengths();

    // Sammle alle Daten-Strings aus der Haupt-Entity und zusätzlichen Entities
    const dataStrings = [];
    const baseEntityId = this._config.entity;
    const additionalEntities = this.findAdditionalEntities(baseEntityId);
    this._debug(`[EntityStorage] loadData: Gefundene Entities: Haupt: "${baseEntityId}", Zusätzliche: ${additionalEntities.length}`);

    // Speichere die Liste der bekannten Entities
    this._knownEntityIds = [baseEntityId, ...additionalEntities];

    // Lade Daten aus allen Entities
    for (const entityId of this._knownEntityIds) {
      const entity = this._hass.states[entityId];
      if (entity && entity.state && entity.state.trim() !== '') {
        const entityData = entity.state;
        dataStrings.push(entityData);
        this._debug(`[EntityStorage] loadData: Entity "${entityId}" hat Daten, Länge: ${entityData.length} Zeichen`);
      } else {
        this._debug(`[EntityStorage] loadData: Entity "${entityId}" ist leer oder nicht vorhanden`);
      }
    }

    // Füge alle Strings zusammen (mit ";" als Trennzeichen)
    if (dataStrings.length > 0) {
      const dataString = dataStrings.join(';');
      this._debug(`[EntityStorage] loadData: Daten kombiniert, Gesamtlänge: ${dataString.length} Zeichen`);
      return dataString;
    } else {
      this._debug('[EntityStorage] loadData: Keine Daten in Entities gefunden');
      return null;
    }
  }

  /**
   * Erstellt die Config-Daten im komprimierten Format (für text_input Entities)
   * @private
   */
  _createCompressedConfig(activeShifts) {
    let configJson = JSON.stringify(activeShifts);

    // Entferne die äußere Klammer
    if (configJson.startsWith('[') && configJson.endsWith(']')) {
      configJson = configJson.slice(1, -1);
    }

    // Entferne "null" aus dem String
    let previousLength;
    do {
      previousLength = configJson.length;
      configJson = configJson.replace(/,null,/g, ',,');
      configJson = configJson.replace(/,null\]/g, ',]');
      configJson = configJson.replace(/\[null,/g, '[,');
      configJson = configJson.replace(/,null$/g, ',');
    } while (configJson.length !== previousLength);

    // Entferne Anführungszeichen um Strings
    configJson = configJson.replace(/","/g, ',');
    configJson = configJson.replace(/\["/g, '[');
    configJson = configJson.replace(/"\]/g, ']');
    configJson = configJson.replace(/,"/g, ',');
    configJson = configJson.replace(/",/g, ',');
    return configJson;
  }

  /**
   * Ermittelt die Config-Entity-ID
   * @private
   */
  getConfigEntityId() {
    if (!this._config || !this._config.entity) {
      return null;
    }
    return this._config.entity + '_config';
  }

  /**
   * Ermittelt die Status-Entity-ID
   * @private
   */
  getStatusEntityId() {
    if (!this._config || !this._config.entity) {
      return null;
    }
    return this._config.entity + '_status';
  }
  async saveConfig(activeShifts) {
    if (!this.isAvailable()) {
      this._debug('[EntityStorage] saveConfig: Nicht verfügbar');
      return;
    }
    const configEntityId = this.getConfigEntityId();
    if (!configEntityId) {
      this._debug('[EntityStorage] saveConfig: Keine configEntityId');
      return;
    }
    this._debug(`[EntityStorage] saveConfig: Start, configEntityId: "${configEntityId}"`);

    // Prüfe ob die Entity existiert
    const configEntity = this._hass.states[configEntityId];
    if (!configEntity) {
      this._debug(`[EntityStorage] saveConfig: Entity "${configEntityId}" existiert nicht`);
      return;
    }

    // Komprimiertes Format für text_input Entities
    const configJson = this._createCompressedConfig(activeShifts);
    const configJsonLength = configJson.length;
    this._debug(`[EntityStorage] saveConfig: Config erstellt (komprimiert), Länge: ${configJsonLength} Zeichen`);

    // Prüfe ob der JSON-Text in das Entity passt
    const maxLength = this.getEntityMaxLength(configEntityId);
    if (maxLength !== null && configJsonLength > maxLength) {
      this._debug(`[EntityStorage] saveConfig: Config ist zu lang (${configJsonLength} > ${maxLength} Zeichen)`);
      // Warnung wird von getWarnings() zurückgegeben
    }
    try {
      await this._hass.callService('input_text', 'set_value', {
        entity_id: configEntityId,
        value: configJson
      });
      this._debug(`[EntityStorage] saveConfig: Config erfolgreich gespeichert`);
    } catch (error) {
      this._debug(`[EntityStorage] saveConfig: Fehler beim Speichern: ${error.message}`, error);
      throw error;
    }
  }
  async loadConfig() {
    if (!this.isAvailable()) {
      this._debug('[EntityStorage] loadConfig: Nicht verfügbar');
      return null;
    }
    const configEntityId = this.getConfigEntityId();
    if (!configEntityId) {
      return null;
    }
    const configEntity = this._hass.states[configEntityId];
    if (!configEntity || !configEntity.state || configEntity.state.trim() === '') {
      return null;
    }
    return configEntity.state;
  }
  checkStorageUsage(dataLength = null) {
    if (!this.isAvailable()) {
      return null;
    }
    const allEntityIds = this._getAllEntityIds();
    const maxLengths = this.getAllEntityMaxLengths();
    if (Object.keys(maxLengths).length === 0) {
      return null;
    }

    // Berechne Gesamtlänge und maximale Gesamtlänge
    let totalCurrentLength = 0;
    let totalMaxLength = 0;
    if (dataLength !== null && dataLength !== undefined) {
      totalCurrentLength = dataLength;
    } else {
      // Lese Längen aus den aktuellen States
      for (const entityId of allEntityIds) {
        const entity = this._hass.states[entityId];
        if (entity && entity.state) {
          totalCurrentLength += entity.state.length;
        }
      }
    }

    // Berechne maximale Gesamtlänge
    for (const entityId of allEntityIds) {
      const maxLength = maxLengths[entityId];
      if (maxLength !== undefined && maxLength !== null) {
        totalMaxLength += maxLength;
      }
    }
    if (totalMaxLength === 0) {
      return null;
    }
    const percentage = totalCurrentLength / totalMaxLength * 100;

    // Prüfe ob 90% überschritten werden
    if (percentage >= 90) {
      return {
        show: true,
        currentLength: totalCurrentLength,
        maxLength: totalMaxLength,
        percentage: Math.round(percentage * 10) / 10
      };
    }
    return null;
  }
  getWarnings() {
    if (!this.isAvailable()) {
      return null;
    }
    const warnings = {
      config: null,
      status: null
    };

    // Prüfe Config-Entity
    const configEntityId = this.getConfigEntityId();
    if (configEntityId) {
      if (!this._hass || !this._hass.states[configEntityId]) {
        warnings.config = {
          show: true,
          type: 'missing',
          configEntityId: configEntityId
        };
      }
    }

    // Prüfe Status-Entity
    const statusEntityId = this.getStatusEntityId();
    if (statusEntityId) {
      if (!this._hass || !this._hass.states[statusEntityId]) {
        warnings.status = {
          show: true,
          type: 'missing',
          statusEntityId: statusEntityId
        };
      }
    }
    return warnings.config || warnings.status ? warnings : null;
  }
}

/***/ }),

/***/ "./src/storage/saver-storage.js":
/*!**************************************!*\
  !*** ./src/storage/saver-storage.js ***!
  \**************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SaverStorage: () => (/* binding */ SaverStorage)
/* harmony export */ });
/* harmony import */ var _storage_interface_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./storage-interface.js */ "./src/storage/storage-interface.js");
/**
 * Saver-Storage-Implementierung
 * 
 * Speichert Daten in Saver-Variablen (HACS Integration)
 * Kann später leicht entfernt werden, wenn nur Entity-Storage verwendet werden soll.
 */


class SaverStorage extends _storage_interface_js__WEBPACK_IMPORTED_MODULE_0__.IStorageAdapter {
  static isApplicable(storeMode) {
    return storeMode === 'saver';
  }
  constructor(hass, config, debug) {
    super(hass, config, debug);
    this._saverKey = config?.saver_key || 'Schichtplan';
  }
  isAvailable() {
    if (!this._hass || !this._config || !this._config.saver_key) {
      return false;
    }
    // Prüfe ob Saver-Entity existiert
    const saverEntity = this._hass.states?.['saver.saver'];
    return !!saverEntity;
  }

  /**
   * Liest eine Saver-Variable
   * @private
   */
  _readSaverVariable(key) {
    if (!this._hass || !this._hass.states) {
      return null;
    }
    const saverEntity = this._hass.states['saver.saver'];
    if (!saverEntity || !saverEntity.attributes || !saverEntity.attributes.variables) {
      return null;
    }
    const value = saverEntity.attributes.variables[key];
    if (value === undefined || value === null) {
      return null;
    }
    return String(value).trim();
  }
  async saveData(serializedData) {
    if (!this.isAvailable()) {
      this._debug('[SaverStorage] saveData: Nicht verfügbar');
      return;
    }
    this._debug(`[SaverStorage] saveData: Start, saver_key: "${this._saverKey}", Datenlänge: ${serializedData.length} Zeichen`);
    try {
      // Prüfe ob sich der Wert geändert hat
      const oldValue = this._readSaverVariable(this._saverKey);
      this._debug(`[SaverStorage] saveData: Saver-Variable "${this._saverKey}" existiert: ${oldValue !== null}, alte Länge: ${oldValue?.length || 0} Zeichen`);

      // Nur schreiben wenn Variable nicht existiert oder Wert sich geändert hat
      if (oldValue === null || oldValue !== serializedData) {
        this._debug(`[SaverStorage] saveData: Schreibe in Saver (Variable existiert nicht oder Wert hat sich geändert)`);
        await this._hass.callService('saver', 'set_variable', {
          name: this._saverKey,
          value: serializedData || ''
        });
        this._debug(`[SaverStorage] saveData: Erfolgreich in Saver geschrieben`);
      } else {
        this._debug(`[SaverStorage] saveData: Kein Schreiben nötig, Wert hat sich nicht geändert`);
      }
    } catch (error) {
      this._debug(`[SaverStorage] saveData: Fehler beim Schreiben in Saver: ${error.message}`, error);
      console.warn('[TG Schichtplan] Fehler beim Schreiben in Saver:', error);
      throw error; // Wirf Fehler weiter, damit Fallback-Mechanismus greifen kann
    }
  }
  async loadData() {
    if (!this.isAvailable()) {
      this._debug('[SaverStorage] loadData: Nicht verfügbar');
      return null;
    }
    this._debug(`[SaverStorage] loadData: Versuche Daten von Saver-Variable "${this._saverKey}" zu laden`);
    const data = this._readSaverVariable(this._saverKey);
    if (data && data.trim() !== '') {
      this._debug(`[SaverStorage] loadData: Daten erfolgreich geladen, Länge: ${data.length} Zeichen`);
      return data;
    }
    this._debug('[SaverStorage] loadData: Keine Daten gefunden');
    return null;
  }

  /**
   * Erstellt die Config-Daten im vollständigen JSON-Format (für Saver)
   * Verwendet direkt das Format vom Config-Panel (calendars-Array)
   * @private
   */
  _createFullJsonConfig(calendars) {
    const configObject = {
      calendars: calendars,
      setup: {
        timer_entity: this._config?.entity || '',
        store_mode: this._config?.store_mode || 'saver'
      },
      lastchange: Math.floor(Date.now() / 1000) // Unix-Timestamp - wird bei jedem Speichern aktualisiert
    };
    this._debug(`[SaverStorage] _createFullJsonConfig: lastchange auf ${configObject.lastchange} gesetzt (aktueller Unix-Timestamp)`);
    return JSON.stringify(configObject);
  }
  async saveConfig(calendars) {
    if (!this.isAvailable()) {
      this._debug('[SaverStorage] saveConfig: Nicht verfügbar');
      return;
    }
    const configKey = `${this._saverKey}_config`;
    this._debug(`[SaverStorage] saveConfig: Saver-Key: "${this._saverKey}", Config-Key: "${configKey}"`);
    const configJson = this._createFullJsonConfig(calendars);
    this._debug(`[SaverStorage] saveConfig: JSON-Config erstellt, Länge: ${configJson.length} Zeichen, Kalender: ${calendars?.length || 0}`);
    try {
      await this._hass.callService('saver', 'set_variable', {
        name: configKey,
        value: String(configJson)
      });
      this._debug(`[SaverStorage] saveConfig: Variable "${configKey}" wurde im Saver gespeichert`);
    } catch (error) {
      this._debug(`[SaverStorage] saveConfig: Fehler beim Schreiben: ${error.message}`, error);
      throw error;
    }
  }
  async loadConfig() {
    if (!this.isAvailable()) {
      this._debug('[SaverStorage] loadConfig: Nicht verfügbar');
      return null;
    }
    const configKey = `${this._saverKey}_config`;
    this._debug(`[SaverStorage] loadConfig: Versuche Config von Saver-Variable "${configKey}" zu laden`);
    const config = this._readSaverVariable(configKey);
    if (config && config.trim() !== '') {
      this._debug(`[SaverStorage] loadConfig: Config erfolgreich geladen, Länge: ${config.length} Zeichen`);
      return config;
    }
    this._debug('[SaverStorage] loadConfig: Keine Config gefunden');
    return null;
  }
  getWarnings() {
    // Saver hat keine Warnungen (keine Entity-Prüfung nötig)
    return null;
  }
}

/***/ }),

/***/ "./src/storage/storage-factory.js":
/*!****************************************!*\
  !*** ./src/storage/storage-factory.js ***!
  \****************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   StorageFactory: () => (/* binding */ StorageFactory)
/* harmony export */ });
/* harmony import */ var _saver_storage_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./saver-storage.js */ "./src/storage/saver-storage.js");
/* harmony import */ var _entity_storage_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./entity-storage.js */ "./src/storage/entity-storage.js");
/**
 * Storage-Factory
 * 
 * Erstellt den passenden Storage-Adapter basierend auf dem store_mode
 */



class StorageFactory {
  /**
   * Erstellt den passenden Storage-Adapter
   * @param {Object} hass - Home Assistant Objekt
   * @param {Object} config - Konfiguration
   * @param {Function} debug - Debug-Funktion
   * @returns {IStorageAdapter} - Der passende Storage-Adapter
   */
  static createStorage(hass, config, debug) {
    const storeMode = config?.store_mode || 'text_entity';

    // Prüfe welche Storage-Implementierung verwendet werden soll
    if (_saver_storage_js__WEBPACK_IMPORTED_MODULE_0__.SaverStorage.isApplicable(storeMode)) {
      debug('[StorageFactory] Erstelle SaverStorage');
      return new _saver_storage_js__WEBPACK_IMPORTED_MODULE_0__.SaverStorage(hass, config, debug);
    } else if (_entity_storage_js__WEBPACK_IMPORTED_MODULE_1__.EntityStorage.isApplicable(storeMode)) {
      debug('[StorageFactory] Erstelle EntityStorage');
      return new _entity_storage_js__WEBPACK_IMPORTED_MODULE_1__.EntityStorage(hass, config, debug);
    } else {
      // Fallback zu EntityStorage
      debug('[StorageFactory] Unbekannter store_mode, verwende EntityStorage als Fallback');
      return new _entity_storage_js__WEBPACK_IMPORTED_MODULE_1__.EntityStorage(hass, config, debug);
    }
  }

  /**
   * Prüft, ob ein bestimmter Storage-Typ verfügbar ist
   * @param {string} storeMode - Der store_mode
   * @param {Object} hass - Home Assistant Objekt
   * @param {Object} config - Konfiguration
   * @returns {boolean}
   */
  static isStorageAvailable(storeMode, hass, config) {
    const storage = this.createStorage(hass, config, () => {});
    return storage.isAvailable();
  }
}

/***/ }),

/***/ "./src/storage/storage-interface.js":
/*!******************************************!*\
  !*** ./src/storage/storage-interface.js ***!
  \******************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   IStorageAdapter: () => (/* binding */ IStorageAdapter)
/* harmony export */ });
/**
 * Storage-Interface für verschiedene Speicher-Mechanismen
 * 
 * Dieses Interface ermöglicht es, verschiedene Storage-Implementierungen
 * (z.B. Saver, Entity) zu kapseln und später leicht zu entfernen oder zu wechseln.
 */

/**
 * @interface IStorageAdapter
 * 
 * Basis-Interface für alle Storage-Adapter
 */
class IStorageAdapter {
  /**
   * Prüft, ob dieser Storage-Adapter für den gegebenen store_mode verwendet werden soll
   * @param {string} storeMode - Der store_mode aus der Config ('saver' oder 'text_entity')
   * @returns {boolean} - true wenn dieser Adapter verwendet werden soll
   */
  static isApplicable(storeMode) {
    throw new Error('isApplicable muss in der abgeleiteten Klasse implementiert werden');
  }

  /**
   * Initialisiert den Storage-Adapter
   * @param {Object} hass - Home Assistant Objekt
   * @param {Object} config - Konfiguration
   * @param {Function} debug - Debug-Funktion
   */
  constructor(hass, config, debug) {
    this._hass = hass;
    this._config = config;
    this._debug = debug;
  }

  /**
   * Speichert die serialisierten Daten
   * @param {string} serializedData - Serialisierte Daten als String
   * @returns {Promise<void>}
   */
  async saveData(serializedData) {
    throw new Error('saveData muss in der abgeleiteten Klasse implementiert werden');
  }

  /**
   * Lädt die Daten
   * @returns {Promise<string|null>} - Die geladenen Daten oder null wenn keine vorhanden
   */
  async loadData() {
    throw new Error('loadData muss in der abgeleiteten Klasse implementiert werden');
  }

  /**
   * Speichert die Konfiguration
   * @param {Array} activeShifts - Array der aktiven Schichten
   * @returns {Promise<void>}
   */
  async saveConfig(activeShifts) {
    throw new Error('saveConfig muss in der abgeleiteten Klasse implementiert werden');
  }

  /**
   * Lädt die Konfiguration
   * @returns {Promise<string|null>} - Die geladene Konfiguration oder null wenn keine vorhanden
   */
  async loadConfig() {
    throw new Error('loadConfig muss in der abgeleiteten Klasse implementiert werden');
  }

  /**
   * Prüft, ob die Storage-Komponente verfügbar/konfiguriert ist
   * @returns {boolean}
   */
  isAvailable() {
    throw new Error('isAvailable muss in der abgeleiteten Klasse implementiert werden');
  }

  /**
   * Gibt Warnungen zurück (z.B. bei fehlenden Entities oder Speicherproblemen)
   * @returns {Object|null} - Warnungsobjekt oder null
   */
  getWarnings() {
    throw new Error('getWarnings muss in der abgeleiteten Klasse implementiert werden');
  }

  /**
   * Prüft die Speichernutzung (nur für Entity-Storage relevant)
   * @param {number} dataLength - Länge der zu speichernden Daten
   * @returns {Object|null} - Nutzungsobjekt oder null
   */
  checkStorageUsage(dataLength) {
    // Optional - Standard-Implementierung gibt null zurück
    return null;
  }
}

/***/ }),

/***/ "./src/super-base.js":
/*!***************************!*\
  !*** ./src/super-base.js ***!
  \***************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SuperBase: () => (/* binding */ SuperBase)
/* harmony export */ });
/* harmony import */ var lit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lit */ "./node_modules/lit/index.js");
/* harmony import */ var _card_config_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./card-config.js */ "./src/card-config.js");
/* harmony import */ var _tools_tg_card_helper_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./tools/tg-card-helper.js */ "./src/tools/tg-card-helper.js");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }



class SuperBase extends lit__WEBPACK_IMPORTED_MODULE_0__.LitElement {
  constructor() {
    super();
    this.dM = `${this.constructor.className}: `; // debugMsgPrefix - Prefix für Debug-Nachrichten

    this.cardName = this.constructor.cardName;
    this.version = this.constructor.version;
    this.debugMode = this.constructor.debugMode;
    this.useDummyData = this.constructor.useDummyData;
    this.showVersion = this.constructor.showVersion;
    this.tgCardHelper = new _tools_tg_card_helper_js__WEBPACK_IMPORTED_MODULE_2__.TgCardHelper(this.constructor.cardName, this.constructor.debugMode);
    this.getCardInfoString = this.tgCardHelper.getCardInfoString;
    this._debug('SuperBase-Konstruktor wird aufgerufen');
  }
  registerMeForChangeNotifys(eventTypes = '', that = this) {
    const dM = `${this.dM || '?: '}registerMeForChangeNotifys() `;
    this._debug(`${dM} Aufruf`, {
      eventTypes,
      that
    });
    this.dispatchEvent(new CustomEvent('registerMeForChanges', {
      bubbles: true,
      composed: true,
      detail: {
        component: that,
        callback: this._handleOnChangeNotifys.bind(this),
        eventType: eventTypes,
        immediately: true
      }
    }));
  }
  _handleOnChangeNotifys(eventdata) {
    const dM = `${this.dM || '?: '}_handleOnChangeNotifys() `;
    this._debug(`${dM}aufgerufen`, {
      eventdata
    });
    for (const eventType of Object.keys(eventdata)) {
      const fkt = '_handleOnChangeNotify_' + eventType.charAt(0).toUpperCase() + eventType.slice(1);
      if (typeof this[fkt] === 'function') {
        this._debug(`${dM} ${fkt} aufgerufen`, {
          eventdata: eventdata[eventType]
        });
        this[fkt](eventdata[eventType]);
      } else {
        this._debug(`${dM} ${fkt} nicht gefunden`, {
          eventdata: eventdata[eventType]
        });
      }
    }
  }
  _debug(...args) {
    // Delegiere komplett an den TgCardHelper mit Kontext-Informationen
    this.tgCardHelper._debug([this], ...args);
  }
}
_defineProperty(SuperBase, "cardName", _card_config_js__WEBPACK_IMPORTED_MODULE_1__.CardName);
_defineProperty(SuperBase, "version", _card_config_js__WEBPACK_IMPORTED_MODULE_1__.Version);
_defineProperty(SuperBase, "debugMode", _card_config_js__WEBPACK_IMPORTED_MODULE_1__.DebugMode);
_defineProperty(SuperBase, "useDummyData", _card_config_js__WEBPACK_IMPORTED_MODULE_1__.UseDummyData);
_defineProperty(SuperBase, "showVersion", _card_config_js__WEBPACK_IMPORTED_MODULE_1__.showVersion);
_defineProperty(SuperBase, "className", 'SuperBase');
_defineProperty(SuperBase, "properties", {
  hass: {
    type: Object
  },
  config: {
    type: Object
  }
});
_defineProperty(SuperBase, "styles", [(0,lit__WEBPACK_IMPORTED_MODULE_0__.css)`
      :host {
        display: block;
      }
    `]);

/***/ }),

/***/ "./src/tools/tg-card-helper.js":
/*!*************************************!*\
  !*** ./src/tools/tg-card-helper.js ***!
  \*************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TgCardHelper: () => (/* binding */ TgCardHelper)
/* harmony export */ });
/* harmony import */ var _card_config_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../card-config.js */ "./src/card-config.js");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }

class TgCardHelper {
  constructor(cardName, debugMode, className, version) {
    this.cardName = cardName || this.constructor.cardName || null;
    this.debugMode = debugMode || this.constructor.debugMode || 'true';
    this.className = className || this.constructor.className || null;
    this.version = version || this.constructor.version || null;
    this.getCardInfoString = [`%c${this.cardName}%c${this.version}%c`, 'background: #9c27b0; color: white; padding: 2px 6px; border-top-left-radius: 12px; border-bottom-left-radius: 12px; font-weight: bold;', 'background: #00bcd4; color: white; padding: 2px 6px; border-top-right-radius: 12px; border-bottom-right-radius: 12px; font-weight: bold;', ''];

    // this._debug('tgCardHelper initialisiert');
  }
  _debug(...args) {
    // Prüfe ob Debug aktiviert ist (kann String 'true' oder Boolean true sein)
    if (!this.debugMode || this.debugMode === 'false' || this.debugMode === false) return;

    // Versuche verschiedene Methoden, um den echten Klassennamen zu bekommen
    let classNameDefault = 'unknownClass';
    let methodNameDefault = 'unknownMethod';
    let cardNameDefault = 'unknownCard';
    let className = null;
    let methodName = null;
    let cardName = null;
    let contextObject = null;

    // Prüfe ob das erste Argument ein Kontext-Objekt ist (this aus SuperBase)
    // Kontext-Objekt erkennt man daran, dass es eine constructor-Eigenschaft hat UND
    // spezifische Eigenschaften unserer Klassen hat (cardName ist einzigartig für unsere Klassen)
    if (Array.isArray(args[0]) && args[0].length === 1 && args[0][0] && typeof args[0][0] === 'object' && args[0][0].constructor && (args[0][0].cardName || args[0][0].constructor.className)) {
      contextObject = args[0][0];
      args = args.slice(1);
    } else {
      contextObject = this;
    }

    // Extrahiere Informationen aus dem Kontext-Objekt (immer vorhanden)
    // Methode 1: Statischer Klassennamen (falls definiert)
    if (contextObject.constructor.className) {
      className = contextObject.constructor.className;
    }
    // Methode 2: Tag-Name des Custom Elements
    else if (contextObject.tagName) {
      className = contextObject.tagName.toLowerCase().replace(/[^a-z0-9]/g, '');
    }
    // Methode 3: Constructor name (kann minifiziert sein)
    else if (contextObject.constructor.name && contextObject.constructor.name.length > 2) {
      className = contextObject.constructor.name;
    }
    // Methode 4: Fallback auf cardName
    else if (contextObject.cardName) {
      className = contextObject.cardName;
    }
    // Methode 5: Fallback auf Default
    else {
      className = classNameDefault;
    }
    cardName = contextObject.cardName || this.cardName || cardNameDefault;

    // Prüfe sofort, ob wir Debug-Meldungen für diese Klasse ausgeben sollen
    const debugList = this.debugMode.split(',').map(item => item.trim().toLowerCase());
    const shouldDebug = debugList[0].toLowerCase() === 'true' ? !debugList.slice(1).includes(className.toLowerCase()) : debugList.includes(className.toLowerCase());

    // Wenn wir keine Debug-Meldungen ausgeben sollen, beende hier
    if (!shouldDebug) return;

    // Ermittle den Methodennamen nur wenn wir Debug-Meldungen ausgeben
    if (!methodName) {
      try {
        const stack = new Error().stack.split('\n');
        const callerLine = stack[2]; // Index 2 für die aufrufende Methode

        // Verschiedene Regex-Patterns für verschiedene Browser-Formate
        const patterns = [/at\s+\w+\.(\w+)/,
        // Chrome/Node.js: "at ClassName.methodName"
        /(\w+)@/,
        // Firefox: "methodName@"
        /(\w+)\s+\(/,
        // Alternative: "methodName("
        /at\s+(\w+)/ // Fallback: "at methodName"
        ];
        for (const pattern of patterns) {
          const methodMatch = callerLine.match(pattern);
          if (methodMatch) {
            methodName = methodMatch[1];
            break;
          }
        }
      } catch (error) {
        // Fallback falls Stack Trace nicht verfügbar
        methodName = null;
      }
    }
    methodName = methodName || methodNameDefault;

    // Erstelle Debug-Ausgabe
    let path = `[${cardName}]:[${className}]:[${methodName}]`;
    while (path.length < 50) {
      path = path + ' ';
    }

    // Erstelle die vollständige Debug-Ausgabe mit Formatierung
    const debugArgs = [path, ...args];

    // Verwende console.log mit dem formatierten Pfad
    console.log(...this.getCardInfoString, ...debugArgs);
  }
}
_defineProperty(TgCardHelper, "cardName", _card_config_js__WEBPACK_IMPORTED_MODULE_0__.CardName);
_defineProperty(TgCardHelper, "debugMode", _card_config_js__WEBPACK_IMPORTED_MODULE_0__.DebugMode);
_defineProperty(TgCardHelper, "className", 'TgCardHelper');
_defineProperty(TgCardHelper, "version", _card_config_js__WEBPACK_IMPORTED_MODULE_0__.Version);

/***/ }),

/***/ "./src/utils/color-utils.js":
/*!**********************************!*\
  !*** ./src/utils/color-utils.js ***!
  \**********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ColorUtils: () => (/* binding */ ColorUtils)
/* harmony export */ });
/**
 * ColorUtils - Wiederverwendbare Farb-Utilities
 * 
 * Diese Utilities können in anderen Projekten verwendet werden.
 * 
 * @example
 * import { ColorUtils } from './utils/color-utils';
 * class MyView extends LitElement {
 *   constructor() {
 *     super();
 *     Object.assign(this, ColorUtils);
 *   }
 * }
 */
const ColorUtils = {
  /**
   * Berechnet die Kontrastfarbe (schwarz oder weiß) für eine gegebene Hintergrundfarbe
   * Verwendet WCAG-Luminanz-Berechnung
   * @param {string} hexColor - Hex-Farbe (z.B. "#ff9800" oder "ff9800")
   * @returns {string} "#000000" für helle Hintergründe, "#ffffff" für dunkle Hintergründe
   */
  _getContrastColor(hexColor) {
    if (!hexColor) return '#000000';

    // Entferne # falls vorhanden
    const hex = hexColor.replace('#', '');

    // Konvertiere zu RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Berechne relative Luminanz (nach WCAG)
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Wenn Luminanz > 0.5, verwende schwarz, sonst weiß
    return luminance > 0.5 ? '#000000' : '#ffffff';
  },
  /**
   * Konvertiert eine Hex-Farbe zu RGB
   * @param {string} hex - Hex-Farbe (z.B. "#ff9800" oder "ff9800")
   * @returns {Object} {r, g, b} oder null bei Fehler
   */
  hexToRgb(hex) {
    if (!hex) return null;
    const cleanHex = hex.replace('#', '');
    if (cleanHex.length !== 6) return null;
    return {
      r: parseInt(cleanHex.substr(0, 2), 16),
      g: parseInt(cleanHex.substr(2, 2), 16),
      b: parseInt(cleanHex.substr(4, 2), 16)
    };
  },
  /**
   * Konvertiert RGB zu Hex-Farbe
   * @param {number} r - Rot (0-255)
   * @param {number} g - Grün (0-255)
   * @param {number} b - Blau (0-255)
   * @returns {string} Hex-Farbe (z.B. "#ff9800")
   */
  rgbToHex(r, g, b) {
    const toHex = n => {
      const hex = Math.round(n).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
};

/***/ }),

/***/ "./src/utils/date-utils.js":
/*!*********************************!*\
  !*** ./src/utils/date-utils.js ***!
  \*********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DateUtils: () => (/* binding */ DateUtils)
/* harmony export */ });
/**
 * DateUtils - Wiederverwendbare Datum-Utilities
 * 
 * Diese Utilities können in anderen Projekten verwendet werden.
 * 
 * @example
 * import { DateUtils } from './utils/date-utils';
 * class MyView extends LitElement {
 *   constructor() {
 *     super();
 *     Object.assign(this, DateUtils);
 *   }
 * }
 */
const DateUtils = {
  /**
   * Formatiert eine Zahl auf zwei Ziffern (z.B. 1 -> "01", 25 -> "25")
   * @param {number} num - Die zu formatierende Zahl
   * @returns {string} Formatierte Zahl als String mit führender Null
   */
  formatTwoDigits(num) {
    return String(num).padStart(2, '0');
  },
  /**
   * Gibt die Anzahl der Tage in einem Monat zurück
   * @param {number} year - Jahr (z.B. 2025)
   * @param {number} month - Monat (0-11, 0 = Januar)
   * @returns {number} Anzahl der Tage im Monat
   */
  getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  },
  /**
   * Gibt den Wochentag des ersten Tages eines Monats zurück
   * @param {number} year - Jahr (z.B. 2025)
   * @param {number} month - Monat (0-11, 0 = Januar)
   * @returns {number} Wochentag (0 = Sonntag, 1 = Montag, ..., 6 = Samstag)
   */
  getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
  },
  /**
   * Gibt den deutschen Monatsnamen zurück
   * @param {number} month - Monat (0-11, 0 = Januar)
   * @returns {string} Monatsname auf Deutsch
   */
  getMonthName(month) {
    const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
    return months[month] || '';
  },
  /**
   * Gibt den ersten Wochentag eines Monats zurück (Montag = 0)
   * @param {number} year - Jahr (z.B. 2025)
   * @param {number} month - Monat (0-11, 0 = Januar)
   * @returns {number} Wochentag mit Montag = 0 (0 = Montag, 1 = Dienstag, ..., 6 = Sonntag)
   */
  getFirstDayOfWeekMondayBased(year, month) {
    const firstDay = this.getFirstDayOfMonth(year, month);
    // Konvertiere von Sonntag=0 zu Montag=0
    return (firstDay + 6) % 7;
  }
};

/***/ }),

/***/ "./src/views/shiftschedule-view/menu-bar-template.js":
/*!***********************************************************!*\
  !*** ./src/views/shiftschedule-view/menu-bar-template.js ***!
  \***********************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   renderMenuBar: () => (/* binding */ renderMenuBar)
/* harmony export */ });
/* harmony import */ var lit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lit */ "./node_modules/lit/index.js");


/**
 * Template-Funktion für die gemeinsame Menu-Bar-Struktur
 * 
 * @param {Object} options - Konfigurationsobjekt
 * @param {import('lit').TemplateResult|string} options.left - Inhalt für menu-bar-left
 * @param {import('lit').TemplateResult|string} options.center - Inhalt für menu-bar-center
 * @param {import('lit').TemplateResult|string} options.right - Inhalt für menu-bar-right
 * @param {import('lit').TemplateResult|string} options.fullWidth - Inhalt für menu-bar-full-width
 * @returns {import('lit').TemplateResult}
 */
function renderMenuBar({
  left = '',
  center = '',
  right = '',
  fullWidth = ''
}) {
  return (0,lit__WEBPACK_IMPORTED_MODULE_0__.html)`
    <div class="menu-bar-row">
      <div class="menu-bar-left">${left}</div>
      <div class="menu-bar-center">${center}</div>
      <div class="menu-bar-right">${right}</div>
    </div>
    ${fullWidth ? (0,lit__WEBPACK_IMPORTED_MODULE_0__.html)`<div class="menu-bar-full-width">${fullWidth}</div>` : ''}
  `;
}

/***/ }),

/***/ "./src/views/shiftschedule-view/mixins/calendar-mixin.js":
/*!***************************************************************!*\
  !*** ./src/views/shiftschedule-view/mixins/calendar-mixin.js ***!
  \***************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CalendarMixin: () => (/* binding */ CalendarMixin)
/* harmony export */ });
/**
 * CalendarMixin - Kalender-Management und -Berechnungen
 * 
 * Wiederverwendbar in anderen Projekten!
 * 
 * **Abhängigkeiten (müssen in der Hauptklasse initialisiert werden):**
 * - `this.config` - Konfigurationsobjekt mit `calendars` Array
 * - `this._selectedCalendar` - String mit dem Shortcut des ausgewählten Kalenders
 * 
 * **Statische Konstante (muss in Hauptklasse definiert werden):**
 * - `ShiftScheduleView.CALENDARS` - Array mit Standard-Kalender-Definitionen
 * 
 * @example
 * import { CalendarMixin } from './mixins/calendar-mixin';
 * class MyView extends LitElement {
 *   static CALENDARS = [
 *     { shortcut: 'a', name: 'Schicht A', defaultColor: '#ff9800' },
 *     // ...
 *   ];
 *   
 *   constructor() {
 *     super();
 *     this._selectedCalendar = null;
 *     Object.assign(this, CalendarMixin);
 *   }
 * }
 */
const CalendarMixin = {
  /**
   * Gibt alle aktivierten Kalender zurück
   * @returns {Array} Array von Kalender-Objekten, sortiert nach Shortcut
   */
  _getAllCalendars() {
    // Gibt nur aktivierte Kalender zurück
    if (!this._config?.calendars) {
      return [];
    }

    // Filtere nur aktivierte Kalender und sortiere nach Shortcut (a, b, c, d, e)
    return this._config.calendars.filter(cal => cal && cal.shortcut && (cal.enabled === true || cal.enabled === 'true' || cal.enabled === 1)).sort((a, b) => a.shortcut.localeCompare(b.shortcut));
  },
  /**
   * Gibt das Kalender-Objekt für einen gegebenen Shortcut zurück
   * @param {string} shortcut - Shortcut des Kalenders (z.B. 'a', 'b', 'c')
   * @returns {Object|null} Kalender-Objekt oder null wenn nicht gefunden
   */
  _getCalendarByShortcut(shortcut) {
    // Gibt das Kalender-Objekt für einen gegebenen Shortcut zurück
    if (!this._config?.calendars) {
      return null;
    }
    return this._config.calendars.find(cal => cal.shortcut === shortcut) || null;
  },
  /**
   * Gibt die Standardfarbe für einen gegebenen Shortcut zurück
   * @param {string} shortcut - Shortcut des Kalenders (z.B. 'a', 'b', 'c')
   * @returns {string} Hex-Farbe (z.B. '#ff9800')
   */
  _getDefaultColorForShortcut(shortcut) {
    // Gibt die Standardfarbe für einen gegebenen Shortcut zurück
    // Prüfe ob die Hauptklasse eine CALENDARS-Konstante hat
    const CalendarsClass = this.constructor;
    if (CalendarsClass && CalendarsClass.CALENDARS) {
      const defaultCalendar = CalendarsClass.CALENDARS.find(cal => cal.shortcut === shortcut);
      return defaultCalendar ? defaultCalendar.defaultColor : '#ff9800';
    }
    // Fallback, falls CALENDARS nicht definiert ist
    return '#ff9800';
  },
  /**
   * Gibt den Shortcut des ausgewählten Kalenders zurück
   * @returns {string|null} Shortcut des ausgewählten Kalenders oder null
   */
  _getSelectedCalendarShortcut() {
    // Gibt den Shortcut des ausgewählten Kalenders zurück

    // Prüfe zuerst _selectedCalendar
    if (this._selectedCalendar !== null && this._selectedCalendar !== undefined && this._selectedCalendar !== '') {
      return this._selectedCalendar;
    }

    // Falls _selectedCalendar nicht gesetzt ist, prüfe die Config
    if (this._config?.selectedCalendar) {
      this._selectedCalendar = this._config.selectedCalendar;
      return this._selectedCalendar;
    }

    // Fallback: Verwende den ersten aktivierten Kalender
    const allCalendars = this._getAllCalendars();
    if (allCalendars.length > 0) {
      return allCalendars[0].shortcut;
    }
    // Wenn kein Kalender aktiviert ist, gibt es keinen Fallback
    return null;
  }
};

/***/ }),

/***/ "./src/views/shiftschedule-view/mixins/config-management-mixin.js":
/*!************************************************************************!*\
  !*** ./src/views/shiftschedule-view/mixins/config-management-mixin.js ***!
  \************************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ConfigManagementMixin: () => (/* binding */ ConfigManagementMixin)
/* harmony export */ });
/**
 * ConfigManagementMixin - Config-Format-Konvertierung
 * 
 * Wiederverwendbar in anderen Projekten!
 * 
 * **Abhängigkeiten (müssen in der Hauptklasse initialisiert werden):**
 * - `this._config` - Konfigurationsobjekt
 * 
 * @example
 * import { ConfigManagementMixin } from './mixins/config-management-mixin';
 * class MyView extends LitElement {
 *   constructor() {
 *     super();
 *     Object.assign(this, ConfigManagementMixin);
 *   }
 * }
 */
const ConfigManagementMixin = {
  /**
   * Erstellt die Config-Daten im komprimierten Format (für text_input Entities)
   * Entfernt Anführungszeichen und null-Werte für kompakte Speicherung
   * @param {Array} activeShifts - Array der aktiven Schichten
   * @returns {string} Komprimierte Config als String
   */
  _createCompressedConfig(activeShifts) {
    // Speichere als JSON (direktes Array, kein Objekt-Wrapper)
    let configJson = JSON.stringify(activeShifts);

    // Entferne die äußere Klammer (erstes [ und letztes ])
    if (configJson.startsWith('[') && configJson.endsWith(']')) {
      configJson = configJson.slice(1, -1);
    }

    // Entferne "null" aus dem String (behalte Kommas)
    // Wiederhole die Ersetzung, bis keine null mehr vorhanden sind (für mehrere null hintereinander)
    let previousLength;
    do {
      previousLength = configJson.length;
      // Ersetze ,null, durch ,, (mehrfach, bis keine null mehr vorhanden sind)
      configJson = configJson.replace(/,null,/g, ',,');
      // Ersetze ,null] durch ,] (falls am Ende eines Arrays)
      configJson = configJson.replace(/,null\]/g, ',]');
      // Ersetze [null, durch [, (falls am Anfang eines Arrays)
      configJson = configJson.replace(/\[null,/g, '[,');
      // Ersetze ,null, am Ende des Strings (falls letztes Element null ist)
      configJson = configJson.replace(/,null$/g, ',');
    } while (configJson.length !== previousLength);

    // Entferne Anführungszeichen um Strings
    // Ersetze "," durch , (Anführungszeichen um Kommas)
    configJson = configJson.replace(/","/g, ',');
    // Ersetze [" durch [ (Anführungszeichen am Anfang eines Arrays)
    configJson = configJson.replace(/\["/g, '[');
    // Ersetze "] durch ] (Anführungszeichen am Ende eines Arrays)
    configJson = configJson.replace(/"\]/g, ']');
    // Ersetze ," durch , (Anführungszeichen nach Komma)
    configJson = configJson.replace(/,"/g, ',');
    // Ersetze ", durch , (Anführungszeichen vor Komma)
    configJson = configJson.replace(/",/g, ',');
    return configJson;
  },
  /**
   * Erstellt die Config-Daten im vollständigen JSON-Format (für Saver)
   * @param {Array} activeShifts - Array der aktiven Schichten
   * @returns {string} Vollständiges JSON als String
   */
  _createFullJsonConfig(activeShifts) {
    // Vollständiges JSON-Format: Objekt mit shifts, setup und lastchange
    // Format: {shifts:[], setup:{}, lastchange:123456789}
    const configObject = {
      shifts: activeShifts,
      setup: {
        timer_entity: this._config?.entity || '',
        store_mode: this._config?.store_mode || 'saver'
      },
      lastchange: Math.floor(Date.now() / 1000) // Unix-Timestamp (Sekunden seit 1970-01-01)
    };
    return JSON.stringify(configObject);
  }
};

/***/ }),

/***/ "./src/views/shiftschedule-view/mixins/data-management-mixin.js":
/*!**********************************************************************!*\
  !*** ./src/views/shiftschedule-view/mixins/data-management-mixin.js ***!
  \**********************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DataManagementMixin: () => (/* binding */ DataManagementMixin)
/* harmony export */ });
/**
 * DataManagementMixin - Serialisierung und Parsing von WorkingDays
 * 
 * Wiederverwendbar in anderen Projekten!
 * 
 * **Abhängigkeiten (müssen in der Hauptklasse initialisiert werden):**
 * - `this._workingDays` - Objekt mit WorkingDays-Daten: `{"year:month": {day: [elements]}}`
 * - `this.formatTwoDigits()` - Methode aus DateUtils (wird per Object.assign hinzugefügt)
 * 
 * @example
 * import { DataManagementMixin } from './mixins/data-management-mixin';
 * import { DateUtils } from '../../utils/date-utils';
 * class MyView extends LitElement {
 *   constructor() {
 *     super();
 *     this._workingDays = {};
 *     Object.assign(this, DateUtils, DataManagementMixin);
 *   }
 * }
 */
const DataManagementMixin = {
  /**
   * Serialisiert WorkingDays zu String-Format
   * Format: <jahr>:<monat>:<tag><elementen>,<tag><elementen>;<jahr>:<monat>:<tag><elementen>
   * Beispiel: "25:11:01a,02ab,03b;25:12:01a,09a"
   * @returns {string} Serialisierte Daten
   */
  serializeWorkingDays() {
    const parts = [];
    // Sortiere nach Jahr:Monat
    const keys = Object.keys(this._workingDays).sort((a, b) => {
      const [yearA, monthA] = a.split(':').map(x => parseInt(x));
      const [yearB, monthB] = b.split(':').map(x => parseInt(x));
      if (yearA !== yearB) return yearA - yearB;
      return monthA - monthB;
    });
    for (const key of keys) {
      const days = this._workingDays[key];
      if (!days || typeof days !== 'object' || Array.isArray(days)) continue;

      // Struktur: {day: [elements]}
      const dayEntries = Object.keys(days).map(d => parseInt(d)).filter(d => !isNaN(d)).sort((a, b) => a - b);
      if (dayEntries.length > 0) {
        // Format: <jahr>:<monat>:<tag><elementen>,<tag><elementen>
        // Beispiel: "25:11:01a,02ab,03b"
        const formattedDays = dayEntries.map(dayNum => {
          const elements = days[dayNum];
          const dayStr = this.formatTwoDigits(dayNum);
          if (Array.isArray(elements) && elements.length > 0) {
            // Sortiere die Kalender-Shortcuts alphabetisch (a, b, c, d, e) für konsistente Reihenfolge
            const sortedElements = [...elements].sort();
            // Tag mit Elementen: "01a", "02ab", etc.
            return dayStr + sortedElements.join('');
          } else {
            // Tag ohne Elemente
            return dayStr;
          }
        }).join(',');
        parts.push(`${key}:${formattedDays}`);
      }
    }
    return parts.join(';');
  },
  /**
   * Parst Daten-String zu WorkingDays-Objekt
   * @param {string} dataString - Serialisierte Daten
   */
  parseWorkingDays(dataString) {
    this._workingDays = {};
    this._parseWorkingDaysIntoObject(dataString, this._workingDays);
  },
  /**
   * Parst Daten-String in ein Ziel-Objekt
   * @private
   * @param {string} dataString - Serialisierte Daten
   * @param {Object} targetObject - Ziel-Objekt für die geparsten Daten
   */
  _parseWorkingDaysIntoObject(dataString, targetObject) {
    if (!dataString || dataString.trim() === '') return;
    const parts = dataString.split(';').filter(p => p.trim() !== '');
    for (const part of parts) {
      const trimmedPart = part.trim();
      if (!trimmedPart) continue;

      // Format: <jahr>:<monat>:<tag><elementen>,<tag><elementen> oder altes Format
      // Beispiel: "25:11:01a,02ah,03b" oder "25:11:01,02,03" (altes Format ohne Elemente)
      const colons = trimmedPart.split(':');
      if (colons.length === 2) {
        // Altes Format ohne Jahr (Kompatibilität): <monat>:<tag>,<tag>
        const month = colons[0].trim();
        const daysStr = colons[1].trim();
        if (month && daysStr) {
          const monthNum = parseInt(month);
          if (!isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
            // Verwende aktuelles Jahr
            const now = new Date();
            const year = now.getFullYear() % 100;
            const key = `${this.formatTwoDigits(year)}:${this.formatTwoDigits(monthNum)}`;
            targetObject[key] = this._parseDaysWithElements(daysStr);
          }
        }
      } else if (colons.length >= 3) {
        // Prüfe ob erstes Element ein Jahr ist (kleiner als 13) oder ein Monat
        const first = parseInt(colons[0].trim());
        const second = parseInt(colons[1].trim());
        if (first <= 12 && second > 12) {
          // Altes Format: <monat>:<jahr>:<tag>,<tag> - konvertiere zu neuem Format
          const monthNum = first;
          const yearNum = second;
          const daysStr = colons.slice(2).join(':');
          if (daysStr && monthNum >= 1 && monthNum <= 12 && !isNaN(yearNum)) {
            const key = `${this.formatTwoDigits(yearNum)}:${this.formatTwoDigits(monthNum)}`;
            targetObject[key] = this._parseDaysWithElements(daysStr);
          }
        } else if (first > 12 && second <= 12) {
          // Neues Format: <jahr>:<monat>:<tag><elementen>,<tag><elementen>
          const yearNum = first;
          const monthNum = second;
          const daysStr = colons.slice(2).join(':');
          if (daysStr && monthNum >= 1 && monthNum <= 12 && !isNaN(yearNum)) {
            const key = `${this.formatTwoDigits(yearNum)}:${this.formatTwoDigits(monthNum)}`;
            targetObject[key] = this._parseDaysWithElements(daysStr);
          }
        }
      }
    }
  },
  /**
   * Parst Tage mit Elementen: "01a,02ah,03b" -> {1: ["a"], 2: ["a", "h"], 3: ["b"]}
   * Oder altes Format ohne Elemente: "01,02,03" -> {1: [], 2: [], 3: []}
   * @private
   * @param {string} daysStr - String mit Tagen und Elementen
   * @returns {Object} Objekt mit Tagen als Keys und Elementen als Arrays
   */
  _parseDaysWithElements(daysStr) {
    const result = {};
    const dayEntries = daysStr.split(',').filter(d => d.trim() !== '');
    for (const entry of dayEntries) {
      const trimmed = entry.trim();
      if (!trimmed) continue;

      // Extrahiere Tag und Elemente: "01a" -> day=1, elements=["a"]
      // Oder: "02ah" -> day=2, elements=["a", "h"]
      // Oder altes Format: "01" -> day=1, elements=[]
      const match = trimmed.match(/^(\d+)([a-z]*)$/i);
      if (match) {
        const dayNum = parseInt(match[1]);
        const elementsStr = match[2] || '';
        // WICHTIG: Filtere nur leere Strings heraus, nicht einzelne Buchstaben
        // split('') teilt jeden Buchstaben in ein separates Array-Element
        const elements = elementsStr.split('').filter(e => e && e.trim() !== '');
        if (!isNaN(dayNum) && dayNum >= 1 && dayNum <= 31) {
          // Wenn der Tag bereits existiert, füge Elemente hinzu (keine Duplikate)
          if (result[dayNum]) {
            // Vereinige Arrays und entferne Duplikate
            result[dayNum] = [...new Set([...result[dayNum], ...elements])];
          } else {
            result[dayNum] = elements;
          }
        }
      } else {
        // Debug-Log wenn kein Match gefunden wurde (nur wenn _debug vorhanden)
        if (trimmed.includes('03') && this._debug) {
          this._debug(`[Parsing] Kein Match für "${trimmed}"`);
        }
      }
    }
    return result;
  }
};

/***/ }),

/***/ "./src/views/shiftschedule-view/mixins/holiday-mixin.js":
/*!**************************************************************!*\
  !*** ./src/views/shiftschedule-view/mixins/holiday-mixin.js ***!
  \**************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   HolidayMixin: () => (/* binding */ HolidayMixin)
/* harmony export */ });
/**
 * HolidayMixin - Feiertags-Berechnung für deutsche Feiertage
 * 
 * Wiederverwendbar in anderen Projekten!
 * 
 * **Abhängigkeiten (müssen in der Hauptklasse initialisiert werden):**
 * - `this._holidayCache` - Cache-Objekt: `{}`
 * - `this._cachedHolidayEntities` - Array oder null
 * - `this._hass` - Home Assistant Objekt (optional, für Holiday-Entities)
 * - `this.config` - Konfigurationsobjekt mit `holidays` Property (optional)
 * 
 * @example
 * import { HolidayMixin } from './mixins/holiday-mixin';
 * class MyView extends LitElement {
 *   constructor() {
 *     super();
 *     this._holidayCache = {};
 *     this._cachedHolidayEntities = null;
 *     Object.assign(this, HolidayMixin);
 *   }
 * }
 */
const HolidayMixin = {
  /**
   * Berechnet das Osterdatum für ein gegebenes Jahr (nach Gauß-Algorithmus)
   * @param {number} year - Jahr (z.B. 2025)
   * @returns {Date} Osterdatum
   */
  _getEasterDate(year) {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = (h + l - 7 * m + 114) % 31 + 1;
    return new Date(year, month - 1, day);
  },
  /**
   * Prüft ob ein Datum ein Feiertag ist (mit Cache)
   * Versucht zuerst Home Assistant Holiday-Sensoren zu verwenden, falls vorhanden
   * @param {number} year - Jahr (z.B. 2025)
   * @param {number} month - Monat (0-11, 0 = Januar)
   * @param {number} day - Tag (1-31)
   * @returns {boolean} true wenn Feiertag
   */
  _isHoliday(year, month, day) {
    // Cache-Key: "2025-12" für Monat/Jahr
    const cacheKey = `${year}-${String(month + 1).padStart(2, '0')}`;

    // Prüfe Cache
    if (this._holidayCache && this._holidayCache[cacheKey] && this._holidayCache[cacheKey][day] !== undefined) {
      return this._holidayCache[cacheKey][day];
    }

    // Initialisiere Cache für diesen Monat
    if (!this._holidayCache) {
      this._holidayCache = {};
    }
    if (!this._holidayCache[cacheKey]) {
      this._holidayCache[cacheKey] = {};
    }
    let result = false;

    // Prüfe ob Home Assistant Holiday-Sensoren verfügbar sind
    if (this._hass && this._hass.states) {
      // Suche nach Holiday-Sensoren (z.B. sensor.germany_holidays, sensor.holidays, etc.)
      // OPTIMIERUNG: Cache Holiday-Entities, nicht bei jedem Aufruf suchen
      if (!this._cachedHolidayEntities) {
        this._cachedHolidayEntities = Object.keys(this._hass.states).filter(entityId => {
          return entityId.startsWith('sensor.') && (entityId.includes('holiday') || entityId.includes('feiertag')) && this._hass.states[entityId].state === 'on';
        });
      }
      const holidayEntities = this._cachedHolidayEntities;
      if (holidayEntities.length > 0) {
        // Prüfe ob das Datum in den Holiday-Attributen enthalten ist
        for (const entityId of holidayEntities) {
          const entity = this._hass.states[entityId];
          if (entity && entity.attributes) {
            // Prüfe verschiedene mögliche Attribute-Formate
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dateStrShort = `${String(day).padStart(2, '0')}.${String(month + 1).padStart(2, '0')}.${year}`;

            // Prüfe verschiedene Attribute-Namen
            const possibleAttrs = ['dates', 'holidays', 'feiertage', 'date', 'next_date', 'upcoming'];
            for (const attr of possibleAttrs) {
              if (entity.attributes[attr]) {
                const attrValue = entity.attributes[attr];
                if (Array.isArray(attrValue)) {
                  if (attrValue.some(d => d === dateStr || d === dateStrShort || d.includes(dateStr) || d.includes(dateStrShort))) {
                    result = true;
                    break;
                  }
                } else if (typeof attrValue === 'string') {
                  if (attrValue.includes(dateStr) || attrValue.includes(dateStrShort)) {
                    result = true;
                    break;
                  }
                }
              }
            }
          }
        }
      }
    }

    // Hole Feiertags-Konfiguration aus der Config (Standard: alle aktiviert)
    const holidaysConfig = this.config?.holidays || {};
    const isHolidayEnabled = key => holidaysConfig[key] !== false; // Default: true wenn nicht gesetzt

    // Fallback: Berechne deutsche Feiertage selbst
    const easter = this._getEasterDate(year);

    // Feste Feiertage mit Konfigurationsprüfung
    const fixedHolidays = [{
      month: 0,
      day: 1,
      key: 'neujahr'
    },
    // Neujahr
    {
      month: 0,
      day: 6,
      key: 'heilige_drei_koenige'
    },
    // Heilige Drei Könige
    {
      month: 4,
      day: 1,
      key: 'tag_der_arbeit'
    },
    // Tag der Arbeit
    {
      month: 7,
      day: 8,
      key: 'friedensfest'
    },
    // Friedensfest (nur in Augsburg)
    {
      month: 7,
      day: 15,
      key: 'mariae_himmelfahrt'
    },
    // Mariä Himmelfahrt
    {
      month: 9,
      day: 3,
      key: 'tag_der_deutschen_einheit'
    },
    // Tag der Deutschen Einheit
    {
      month: 9,
      day: 31,
      key: 'reformationstag'
    },
    // Reformationstag
    {
      month: 10,
      day: 1,
      key: 'allerheiligen'
    },
    // Allerheiligen
    {
      month: 11,
      day: 25,
      key: 'weihnachten_1'
    },
    // 1. Weihnachtsfeiertag
    {
      month: 11,
      day: 26,
      key: 'weihnachten_2'
    } // 2. Weihnachtsfeiertag
    ];
    if (!result) {
      // Prüfe feste Feiertage
      for (const holiday of fixedHolidays) {
        if (month === holiday.month && day === holiday.day && isHolidayEnabled(holiday.key)) {
          result = true;
          break;
        }
      }
    }
    if (!result) {
      // Bewegliche Feiertage (abhängig von Ostern)
      const easterTime = easter.getTime();
      const oneDay = 24 * 60 * 60 * 1000;

      // Buß- und Bettag: Mittwoch vor dem 23. November (oder am 23. November, falls es ein Mittwoch ist)
      const nov23 = new Date(year, 10, 23); // 23. November (month ist 0-basiert)
      const dayOfWeekNov23 = nov23.getDay(); // 0 = Sonntag, 1 = Montag, ..., 3 = Mittwoch, ..., 6 = Samstag
      // Berechne wie viele Tage zurück zum Mittwoch
      const daysToSubtract = dayOfWeekNov23 <= 3 ? 3 - dayOfWeekNov23 : dayOfWeekNov23 + 7 - 3;
      const busstag = new Date(year, 10, 23 - daysToSubtract);
      const movableHolidays = [{
        date: new Date(easterTime - 2 * oneDay),
        key: 'karfreitag'
      },
      // Karfreitag
      {
        date: new Date(easterTime + 1 * oneDay),
        key: 'ostermontag'
      },
      // Ostermontag
      {
        date: new Date(easterTime + 39 * oneDay),
        key: 'christi_himmelfahrt'
      },
      // Christi Himmelfahrt
      {
        date: new Date(easterTime + 50 * oneDay),
        key: 'pfingstmontag'
      },
      // Pfingstmontag
      {
        date: new Date(easterTime + 60 * oneDay),
        key: 'fronleichnam'
      },
      // Fronleichnam (nur in bestimmten Bundesländern)
      {
        date: busstag,
        key: 'busstag'
      } // Buß- und Bettag (nur in Sachsen)
      ];

      // Prüfe bewegliche Feiertage
      for (const holiday of movableHolidays) {
        if (holiday.date.getFullYear() === year && holiday.date.getMonth() === month && holiday.date.getDate() === day && isHolidayEnabled(holiday.key)) {
          result = true;
          break;
        }
      }
    }

    // Cache speichern
    this._holidayCache[cacheKey][day] = result;
    return result;
  },
  /**
   * Prüft ob ein Datum ein Wochenende ist
   * @param {number} year - Jahr (z.B. 2025)
   * @param {number} month - Monat (0-11, 0 = Januar)
   * @param {number} day - Tag (1-31)
   * @returns {boolean} true wenn Wochenende (Samstag oder Sonntag)
   */
  _isWeekend(year, month, day) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Sonntag = 0, Samstag = 6
  }
};

/***/ }),

/***/ "./src/views/shiftschedule-view/mixins/rendering-mixin.js":
/*!****************************************************************!*\
  !*** ./src/views/shiftschedule-view/mixins/rendering-mixin.js ***!
  \****************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RenderingMixin: () => (/* binding */ RenderingMixin)
/* harmony export */ });
/**
 * RenderingMixin - DOM-Manipulation und Rendering-Helper
 * 
 * **Abhängigkeiten (müssen in der Hauptklasse initialisiert werden):**
 * - `this._workingDays` - WorkingDays-Daten
 * - `this._storageWarning` - Storage-Warnung
 * - `this._configWarning` - Config-Warnung
 * - `this._statusWarning` - Status-Warnung
 * - `this._config` - Konfiguration
 * - `this._isInEditorMode()` - Methode aus Hauptklasse
 * - `this._getSelectedCalendarShortcut()` - Methode aus CalendarMixin
 * - `this._getCalendarByShortcut()` - Methode aus CalendarMixin
 * - `this._isHoliday()` - Methode aus HolidayMixin
 * - `this._isWeekend()` - Methode aus HolidayMixin
 * - `this._getContrastColor()` - Methode aus ColorUtils
 * - `this.formatTwoDigits()` - Methode aus DateUtils
 * - `this.getDaysInMonth()` - Methode aus DateUtils
 * - `this.getFirstDayOfMonth()` - Methode aus DateUtils
 * - `this.getMonthName()` - Methode aus DateUtils
 * 
 * @example
 * import { RenderingMixin } from './mixins/rendering-mixin';
 * import { HolidayMixin } from './mixins/holiday-mixin';
 * import { CalendarMixin } from './mixins/calendar-mixin';
 * import { DateUtils } from '../../utils/date-utils';
 * import { ColorUtils } from '../../utils/color-utils';
 * 
 * class MyView extends LitElement {
 *   constructor() {
 *     super();
 *     Object.assign(this, HolidayMixin, CalendarMixin, DateUtils, ColorUtils, RenderingMixin);
 *   }
 * }
 */
const RenderingMixin = {
  /**
   * Gibt die Elemente für einen bestimmten Tag zurück
   * @param {string} monthKey - Monats-Key (z.B. "25:11")
   * @param {number} day - Tag (1-31)
   * @returns {Array} Array von Elementen (z.B. ["a", "b"])
   */
  _getDayElements(monthKey, day) {
    // Gibt die Elemente für einen bestimmten Tag zurück
    // Reduziere Debug-Ausgaben: Nur bei ersten 3 Tagen oder wenn keine Daten gefunden werden
    const shouldDebug = day <= 3 || !this._workingDays[monthKey];
    if (shouldDebug && this._debug) {
      this._debug(`[Render] _getDayElements: Suche nach monthKey="${monthKey}", day=${day}`);
    }
    if (!this._workingDays[monthKey] || typeof this._workingDays[monthKey] !== 'object') {
      if (shouldDebug && this._debug) {
        this._debug(`[Render] _getDayElements: Keine Daten für monthKey="${monthKey}" gefunden oder kein Objekt`);
        this._debug(`[Render] _getDayElements: Verfügbare Keys in _workingDays:`, Object.keys(this._workingDays));
      }
      return [];
    }
    if (Array.isArray(this._workingDays[monthKey])) {
      // Altes Format: Array von Tagen
      if (shouldDebug && this._debug) {
        this._debug(`[Render] _getDayElements: Altes Format (Array) für monthKey="${monthKey}"`);
      }
      return [];
    }
    const elements = this._workingDays[monthKey][day] || [];
    if (shouldDebug && elements.length > 0 && this._debug) {
      this._debug(`[Render] _getDayElements: Gefundene Elemente für "${monthKey}", Tag ${day}:`, elements);
    }
    return elements;
  },
  /**
   * Rendert eine Warnung für eine fehlende Entity
   * @param {string} entityId - Entity-ID (z.B. "input_text.config")
   * @param {string} entityName - Name der Entity (z.B. "Konfigurations-Entity")
   * @param {number} maxLength - Maximale Länge (Standard: 255)
   * @param {boolean} isConfig - Ob es eine Config-Entity ist
   * @returns {TemplateResult} HTML-Template
   */
  _renderMissingEntityWarning(entityId, entityName, maxLength = 255, isConfig = false) {
    const entityNameShort = entityId.replace('input_text.', '');
    // html muss aus lit importiert werden - wird in Hauptklasse verwendet
    const {
      html
    } = this.constructor.litHtml || {};
    if (!html) {
      // Fallback wenn html nicht verfügbar ist
      return null;
    }
    return html`
      <div class="storage-warning">
        <div class="warning-icon">⚠️</div>
        <div class="warning-content">
          <div class="warning-title">${entityName} fehlt!</div>
          <div class="warning-message">
            Die Entity <code>${entityId}</code> wurde nicht gefunden.
          </div>
          <div class="warning-action">
            Bitte legen Sie diese Entity über die UI an:
            <ul>
              <li>Einstellungen → Automatisierungen &amp; Szenen → Hilfsmittel</li>
              <li>Hinzufügen → Text</li>
              <li>Name: <code>${entityNameShort}</code></li>
              <li>Maximale Länge: <code>${maxLength}</code> Zeichen</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  }
};

/***/ }),

/***/ "./src/views/shiftschedule-view/shared-menu-styles.js":
/*!************************************************************!*\
  !*** ./src/views/shiftschedule-view/shared-menu-styles.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   sharedMenuStyles: () => (/* binding */ sharedMenuStyles)
/* harmony export */ });
/* harmony import */ var lit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lit */ "./node_modules/lit/index.js");


/**
 * Gemeinsame CSS-Styles für Menu-Bars
 * Diese Styles werden von shiftschedule-view.js und shift-config-panel.js verwendet
 */
const sharedMenuStyles = (0,lit__WEBPACK_IMPORTED_MODULE_0__.css)`
  /* Gemeinsame Vorlage für Menu-Bar: a (links), b (zentriert), c (rechts), d (zentriert) */
  .menu-bar-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .menu-bar-left {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-shrink: 0;
  }

  .menu-bar-center {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 1;
    min-width: 0;
  }

  .menu-bar-right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-shrink: 0;
  }

  .menu-bar-full-width {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  .menu-button {
    width: 32px;
    height: 32px;
    border-radius: 4px;
    border: 1px solid var(--divider-color, #e0e0e0);
    background-color: var(--primary-color, #03a9f4);
    color: var(--text-primary-color, #ffffff);
    font-size: 20px;
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition:
      background-color 0.2s ease,
      opacity 0.2s ease;
  }

  .menu-button:hover:not(:disabled) {
    background-color: var(--primary-color-dark, #0288d1);
  }

  .menu-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .cancel-button {
    background: none;
    border: none;
    color: var(--secondary-text-color, #757575);
  }

  .cancel-button:hover {
    color: var(--error-color, #f44336);
  }

  .confirm-button {
    background: none;
    border: none;
    color: var(--success-color, #4caf50);
  }

  .confirm-button:hover:not(:disabled) {
    color: var(--success-color-dark, #45a049);
    transform: scale(1.1);
  }

  .confirm-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .menu-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }

  .menu-button.navigation-button {
    background-color: var(--secondary-color, #757575);
  }

  .menu-button.navigation-button:hover:not(:disabled) {
    background-color: var(--secondary-color-dark, #616161);
  }

  /* Gemeinsame Styles für Farbleisten */
  .shifts-color-bar,
  .color-bar {
    display: flex;
    gap: 4px;
    align-items: stretch;
    width: 100%;
  }

  .shift-color-button,
  .color-button {
    flex: 1;
    min-width: 0;
    height: 30px;
    border-radius: 4px;
    border: 2px solid transparent;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 12px;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding: 0 4px;
  }

  .shift-color-button:hover,
  .color-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  .shift-color-button.selected,
  .color-button.selected {
    border: 3px solid var(--primary-color, #03a9f4);
    box-shadow: 
      0 0 0 2px var(--card-background-color, #ffffff),
      0 0 0 4px var(--primary-color, #03a9f4),
      0 2px 8px rgba(0, 0, 0, 0.3);
    transform: translateY(-1px);
  }

  .shift-color-button.disabled,
  .color-button.disabled {
    opacity: 0.3;
  }

  .shift-color-button.disabled::after,
  .color-button.disabled::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      rgba(0, 0, 0, 0.1) 10px,
      rgba(0, 0, 0, 0.1) 20px
    );
    pointer-events: none;
  }
`;

/***/ }),

/***/ "./src/views/shiftschedule-view/shift-config-panel.js":
/*!************************************************************!*\
  !*** ./src/views/shiftschedule-view/shift-config-panel.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ShiftConfigPanel: () => (/* binding */ ShiftConfigPanel)
/* harmony export */ });
/* harmony import */ var lit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lit */ "./node_modules/lit/index.js");
/* harmony import */ var _shared_menu_styles_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./shared-menu-styles.js */ "./src/views/shiftschedule-view/shared-menu-styles.js");
/* harmony import */ var _menu_bar_template_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./menu-bar-template.js */ "./src/views/shiftschedule-view/menu-bar-template.js");
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
/**
 * ShiftConfigPanel - Konfigurationspanel für Schichten
 * 
 * Verwaltet die Konfiguration aller Schichten (aktiv/inaktiv, Reihenfolge, etc.)
 */




class ShiftConfigPanel extends lit__WEBPACK_IMPORTED_MODULE_0__.LitElement {
  constructor() {
    super();
    this.calendars = [];
    this.selectedShortcut = null;
    this._validationErrors = {};
  }
  connectedCallback() {
    super.connectedCallback();
    this._updateValidationErrors();
  }
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('calendars') || changedProperties.has('selectedShortcut')) {
      this._updateValidationErrors();
    }
  }
  _validateCalendar(calendar) {
    const errors = {};

    // Validiere Schicht-ID
    if (!calendar.shortcut || !/^[a-z]$/.test(calendar.shortcut)) {
      errors.shortcut = true;
    }

    // Validiere Zeiträume
    if (calendar.timeRanges && Array.isArray(calendar.timeRanges)) {
      const timeRangeIds = [];
      calendar.timeRanges.forEach((range, index) => {
        const rangeData = typeof range === 'object' && range.times ? range : {
          id: null,
          times: range || [null, null]
        };

        // Validiere Zeitraum-ID
        if (!rangeData.id || !/^[1-9]$/.test(rangeData.id)) {
          errors[`timeRange_${index}_id`] = true;
        } else {
          // Prüfe auf doppelte IDs
          const idNum = parseInt(rangeData.id);
          if (timeRangeIds.includes(idNum)) {
            errors[`timeRange_${index}_id`] = true;
          } else {
            timeRangeIds.push(idNum);
          }
        }

        // Validiere Zeit-Format (optional, aber wenn vorhanden, muss es gültig sein)
        if (rangeData.times && rangeData.times[0] && !/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(rangeData.times[0])) {
          errors[`timeRange_${index}_start`] = true;
        }
        if (rangeData.times && rangeData.times[1] && !/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(rangeData.times[1])) {
          errors[`timeRange_${index}_end`] = true;
        }
      });
    }
    return errors;
  }
  _hasValidationErrors() {
    if (!this.selectedShortcut) {
      return false;
    }
    const calendar = this.calendars.find(cal => cal.shortcut === this.selectedShortcut);
    if (!calendar) {
      return false;
    }
    const errors = this._validateCalendar(calendar);
    return Object.keys(errors).length > 0;
  }
  _triggerColorPicker(shortcut) {
    // Finde das versteckte Color-Input-Element und triggere den Click
    const colorInput = this.shadowRoot.querySelector(`input[type="color"]`);
    if (colorInput) {
      colorInput.click();
    }
  }
  updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has('calendars') || changedProperties.has('selectedShortcut')) {
      this._updateValidationErrors();
    }
  }
  render() {
    const editingCalendar = this.calendars.find(cal => cal.shortcut === this.selectedShortcut);
    const selectedIndex = this.calendars.findIndex(cal => cal.shortcut === this.selectedShortcut);
    return (0,lit__WEBPACK_IMPORTED_MODULE_0__.html)`
      <div class="config-menu-bar">
        ${(0,_menu_bar_template_js__WEBPACK_IMPORTED_MODULE_2__.renderMenuBar)({
      left: (0,lit__WEBPACK_IMPORTED_MODULE_0__.html)`
            <button class="cancel-button menu-button" @click=${this._handleClose} title="Abbrechen">×</button>
          `,
      center: '',
      right: (0,lit__WEBPACK_IMPORTED_MODULE_0__.html)`
            <button 
              class="confirm-button menu-button" 
              @click=${this._handleSave} 
              title="Speichern"
              ?disabled=${this._hasValidationErrors()}
            >✓</button>
          `,
      fullWidth: (0,lit__WEBPACK_IMPORTED_MODULE_0__.html)`
            <div class="color-bar">
              ${this.calendars.map((calendar, index) => {
        const isSelected = calendar.shortcut === this.selectedShortcut;
        const hasErrors = this._hasValidationErrors() && isSelected;
        return (0,lit__WEBPACK_IMPORTED_MODULE_0__.html)`
                  <button
                    class="color-button ${isSelected ? 'selected' : ''} ${calendar.enabled ? '' : 'disabled'}"
                    style="background-color: ${calendar.color || '#ff9800'};"
                    @click=${() => {
          if (!this._hasValidationErrors()) {
            this.selectedShortcut = calendar.shortcut;
            this._updateValidationErrors();
          }
        }}
                    ?disabled=${hasErrors}
                    title="${calendar.name || `Schicht ${calendar.shortcut.toUpperCase()}`} ${calendar.enabled ? '' : '(deaktiviert)'}${hasErrors ? ' (Fehlerhafte Eingabe)' : ''}"
                  ></button>
                `;
      })}
              <button
                class="color-button add-shift-color-button"
                @click=${this._addShift}
                title="Neue Schicht hinzufügen"
                ?disabled=${this._hasValidationErrors()}
              >
                +
              </button>
            </div>
          `
    })}
      </div>
      <div class="config-panel">
        ${editingCalendar ? (0,lit__WEBPACK_IMPORTED_MODULE_0__.html)`
              <div class="shift-editor">
                <!-- Zeile 1: Name, Farbe, ID -->
                <div class="editor-row">
                  <div class="editor-field">
                    <label>Name</label>
                    <ha-textfield
                      .value=${editingCalendar.name || ''}
                      @input=${e => this._updateCalendar(editingCalendar.shortcut, {
      name: e.target.value
    })}
                      placeholder="Schichtname"
                    ></ha-textfield>
                  </div>
                  
                  <div class="editor-field">
                    <label>Farbe</label>
                    <div class="color-input-group">
                      <input
                        type="color"
                        .value=${editingCalendar.color || '#ff9800'}
                        @input=${e => this._updateCalendar(editingCalendar.shortcut, {
      color: e.target.value
    })}
                        class="color-picker-input"
                        title="Farbauswahl öffnen"
                      />
                      <div
                        class="color-preview-large"
                        style="background-color: ${editingCalendar.color || '#ff9800'}; cursor: pointer;"
                        @click=${() => this._triggerColorPicker(editingCalendar.shortcut)}
                        title="Farbauswahl öffnen"
                      ></div>
                    </div>
                  </div>
                  
                  <div class="editor-field id-field">
                    <label>ID</label>
                    <ha-textfield
                      .value=${editingCalendar.shortcut || ''}
                      @input=${e => {
      this._updateCalendarId(editingCalendar.shortcut, e.target.value);
      this._updateValidationErrors();
    }}
                      placeholder="a"
                      maxlength="1"
                      pattern="[a-z]"
                      .error=${this._validationErrors[`${editingCalendar.shortcut}_shortcut`] || false}
                    ></ha-textfield>
                  </div>
                </div>
                
                <!-- Zeile 2: Aktiviert, Relevant -->
                <div class="editor-row">
                  <div class="switch-item">
                    <label class="switch-label">Aktiviert</label>
                    <ha-switch
                      .checked=${editingCalendar.enabled !== false}
                      @change=${e => this._updateCalendar(editingCalendar.shortcut, {
      enabled: e.target.checked
    })}
                    ></ha-switch>
                  </div>
                  <div class="switch-item">
                    <label class="switch-label">Status relevant</label>
                    <ha-switch
                      .checked=${editingCalendar.statusRelevant !== false}
                      @change=${e => this._updateCalendar(editingCalendar.shortcut, {
      statusRelevant: e.target.checked
    })}
                    ></ha-switch>
                  </div>
                </div>
                
                <!-- Zeile 3: Zeiträume -->
                <div class="editor-row">
                  <div class="editor-section full-width">
                    <div class="time-ranges-header">
                      <label>Zeiträume</label>
                      <button
                        class="time-range-add-button"
                        @click=${() => this._addTimeRange(editingCalendar.shortcut)}
                        title="Zeitbereich hinzufügen"
                        ?disabled=${editingCalendar.timeRanges && editingCalendar.timeRanges.length >= 9 || false}
                      >
                        +
                      </button>
                    </div>
                    ${editingCalendar.timeRanges && editingCalendar.timeRanges.length > 0 ? (0,lit__WEBPACK_IMPORTED_MODULE_0__.html)`
                        <div class="time-ranges-table">
                          <div class="time-ranges-header-row">
                            <div class="time-range-header-cell id-header">ID</div>
                            <div class="time-range-header-cell">Start</div>
                            <div class="time-range-header-cell">ENDE</div>
                            <div class="time-range-header-cell action-header"></div>
                          </div>
                          ${editingCalendar.timeRanges.map((range, rangeIndex) => {
      const rangeData = typeof range === 'object' && range.times ? range : {
        id: null,
        times: range || [null, null]
      };
      return (0,lit__WEBPACK_IMPORTED_MODULE_0__.html)`
                        <div class="time-range-row">
                          <div class="time-range-cell id-cell">
                            <ha-textfield
                              .value=${rangeData.id || ''}
                              @input=${e => {
        this._updateTimeRangeId(editingCalendar.shortcut, rangeIndex, e.target.value);
        this._updateValidationErrors();
      }}
                              placeholder="1"
                              maxlength="1"
                              pattern="[1-9]"
                              .error=${this._validationErrors[`${editingCalendar.shortcut}_timeRange_${rangeIndex}_id`] || false}
                            ></ha-textfield>
                          </div>
                          <div class="time-range-cell">
                            <ha-textfield
                              type="time"
                              .value=${rangeData.times[0] || ''}
                              @input=${e => {
        this._updateTimeRange(editingCalendar.shortcut, rangeIndex, 0, e.target.value || null);
        this._updateValidationErrors();
      }}
                              placeholder="HH:MM"
                              pattern="[0-9]{2}:[0-9]{2}"
                              .error=${this._validationErrors[`${editingCalendar.shortcut}_timeRange_${rangeIndex}_start`] || false}
                            ></ha-textfield>
                          </div>
                          <div class="time-range-cell">
                            <ha-textfield
                              type="time"
                              .value=${rangeData.times[1] || ''}
                              @input=${e => {
        this._updateTimeRange(editingCalendar.shortcut, rangeIndex, 1, e.target.value || null);
        this._updateValidationErrors();
      }}
                              placeholder="HH:MM"
                              pattern="[0-9]{2}:[0-9]{2}"
                              .error=${this._validationErrors[`${editingCalendar.shortcut}_timeRange_${rangeIndex}_end`] || false}
                            ></ha-textfield>
                          </div>
                          <div class="time-range-cell action-cell">
                            <button
                              class="time-range-delete-button"
                              @click=${() => this._removeTimeRange(editingCalendar.shortcut, rangeIndex)}
                              title="Zeitbereich entfernen"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                        `;
    })}
                        </div>
                      ` : ''}
                  </div>
                </div>
                
                <!-- Zeile 4: Papierkorb und Pfeile -->
                <div class="editor-row">
                  <div class="action-buttons">
                    <button
                      class="control-button delete"
                      @click=${() => this._deleteShift(editingCalendar.shortcut)}
                      title="Löschen"
                    >
                      🗑️
                    </button>
                    <button
                      class="control-button"
                      @click=${() => this._moveShift(selectedIndex, -1)}
                      ?disabled=${selectedIndex <= 0}
                      title="Nach oben"
                    >
                      ←
                    </button>
                    <button
                      class="control-button"
                      @click=${() => this._moveShift(selectedIndex, 1)}
                      ?disabled=${selectedIndex >= this.calendars.length - 1}
                      title="Nach unten"
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>
              ` : ''}
      </div>
    `;
  }
  _handleClose() {
    this.dispatchEvent(new CustomEvent('close'));
  }
  _handleSave() {
    this.dispatchEvent(new CustomEvent('save', {
      detail: {
        calendars: this.calendars
      }
    }));
  }
  _moveShift(index, direction) {
    if (index + direction < 0 || index + direction >= this.calendars.length) {
      return;
    }
    const newCalendars = [...this.calendars];
    const [moved] = newCalendars.splice(index, 1);
    newCalendars.splice(index + direction, 0, moved);
    this.calendars = newCalendars;
    this._updateValidationErrors();
  }
  _deleteShift(shortcut) {
    if (this.calendars.length <= 1) {
      return; // Mindestens eine Schicht muss vorhanden sein
    }
    this.calendars = this.calendars.filter(cal => cal.shortcut !== shortcut);
    if (this.selectedShortcut === shortcut) {
      this.selectedShortcut = this.calendars.length > 0 ? this.calendars[0].shortcut : null;
    }
    this._updateValidationErrors();
  }
  _toggleEnabled(shortcut, enabled) {
    this.calendars = this.calendars.map(cal => cal.shortcut === shortcut ? {
      ...cal,
      enabled
    } : cal);
    this._updateValidationErrors();
  }
  _addShift() {
    // Finde den nächsten verfügbaren Shortcut
    const existingShortcuts = this.calendars.map(cal => cal.shortcut);
    const allShortcuts = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
    const availableShortcut = allShortcuts.find(s => !existingShortcuts.includes(s));
    if (!availableShortcut) {
      return; // Maximale Anzahl von Schichten erreicht
    }
    const defaultColors = ['#ff9800', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffa500', '#800080', '#008000'];
    const newShift = {
      shortcut: availableShortcut,
      name: `Schicht ${availableShortcut.toUpperCase()}`,
      color: defaultColors[this.calendars.length % defaultColors.length],
      enabled: true,
      statusRelevant: true,
      timeRanges: []
    };
    this.calendars = [...this.calendars, newShift];
    this.selectedShortcut = newShift.shortcut;
    this._updateValidationErrors();
  }
  _updateCalendar(shortcut, updates) {
    this.calendars = this.calendars.map(cal => cal.shortcut === shortcut ? {
      ...cal,
      ...updates
    } : cal);
    this._updateValidationErrors();
  }
  _normalizeTimeRange(range) {
    // Konvertiere altes Format [start, end] zu neuem Format { id, times: [start, end] }
    if (Array.isArray(range)) {
      return {
        id: null,
        times: range
      };
    }
    if (typeof range === 'object' && range.times) {
      return range;
    }
    return {
      id: null,
      times: [null, null]
    };
  }
  _normalizeTimeRanges(timeRanges) {
    if (!timeRanges || !Array.isArray(timeRanges)) {
      return [];
    }
    return timeRanges.map(range => {
      const normalized = this._normalizeTimeRange(range);
      // Keine Default-ID setzen - ID muss explizit gesetzt werden
      return normalized;
    });
  }
  _updateTimeRange(shortcut, rangeIndex, timeIndex, value) {
    this.calendars = this.calendars.map(cal => {
      if (cal.shortcut === shortcut) {
        const timeRanges = this._normalizeTimeRanges(cal.timeRanges);
        const newTimeRanges = [...timeRanges];
        if (!newTimeRanges[rangeIndex]) {
          newTimeRanges[rangeIndex] = {
            id: null,
            times: [null, null]
          };
        }
        newTimeRanges[rangeIndex] = {
          ...newTimeRanges[rangeIndex],
          times: [...newTimeRanges[rangeIndex].times]
        };
        newTimeRanges[rangeIndex].times[timeIndex] = value;
        return {
          ...cal,
          timeRanges: newTimeRanges
        };
      }
      return cal;
    });
    this._updateValidationErrors();
  }
  _updateTimeRangeId(shortcut, rangeIndex, newId) {
    // Validiere die neue ID (nur Ziffern 1-9)
    const normalizedId = newId.trim() || null;
    this.calendars = this.calendars.map(cal => {
      if (cal.shortcut === shortcut) {
        const timeRanges = this._normalizeTimeRanges(cal.timeRanges);
        const newTimeRanges = [...timeRanges];
        if (newTimeRanges[rangeIndex]) {
          newTimeRanges[rangeIndex] = {
            ...newTimeRanges[rangeIndex],
            id: normalizedId
          };
        }
        return {
          ...cal,
          timeRanges: newTimeRanges
        };
      }
      return cal;
    });
    this._updateValidationErrors();
  }
  _addTimeRange(shortcut) {
    this.calendars = this.calendars.map(cal => {
      if (cal.shortcut === shortcut) {
        const timeRanges = this._normalizeTimeRanges(cal.timeRanges);

        // Prüfe ob bereits 9 Zeiträume vorhanden sind
        if (timeRanges.length >= 9) {
          return cal; // Keine weiteren Zeiträume möglich
        }

        // Finde die erste verfügbare ID im Bereich 1-9
        const existingIds = timeRanges.map(r => r.id).map(id => parseInt(id) || 0).filter(id => id >= 1 && id <= 9);
        let newId = null;
        // Prüfe alle IDs von 1 bis 9 und finde die erste, die nicht verwendet wird
        for (let i = 1; i <= 9; i++) {
          if (!existingIds.includes(i)) {
            newId = String(i);
            break;
          }
        }
        return {
          ...cal,
          timeRanges: [...timeRanges, {
            id: newId,
            times: [null, null]
          }]
        };
      }
      return cal;
    });
    this._updateValidationErrors();
  }
  _removeTimeRange(shortcut, rangeIndex) {
    this.calendars = this.calendars.map(cal => {
      if (cal.shortcut === shortcut) {
        const timeRanges = this._normalizeTimeRanges(cal.timeRanges);
        const newTimeRanges = [...timeRanges];
        newTimeRanges.splice(rangeIndex, 1);
        // Erlaube leeres Array (keine Zeiträume)
        return {
          ...cal,
          timeRanges: newTimeRanges.length > 0 ? newTimeRanges : []
        };
      }
      return cal;
    });
    this._updateValidationErrors();
  }
  _updateValidationErrors() {
    const errors = {};
    this.calendars.forEach(cal => {
      const calErrors = this._validateCalendar(cal);
      Object.keys(calErrors).forEach(key => {
        errors[`${cal.shortcut}_${key}`] = true;
      });
    });
    this._validationErrors = errors;

    // Debug: Zeige Validierungsergebnis
    const hasErrors = Object.keys(errors).length > 0;
    const selectedCalendar = this.calendars.find(cal => cal.shortcut === this.selectedShortcut);
    const selectedHasErrors = selectedCalendar ? Object.keys(errors).some(key => key.startsWith(`${this.selectedShortcut}_`)) : false;
    console.log('[ShiftConfigPanel] Validierung:', {
      erfolgreich: !hasErrors,
      fehlerfrei: !selectedHasErrors,
      gesamtFehler: Object.keys(errors).length,
      fehlerDetails: errors,
      aktuelleSchicht: this.selectedShortcut,
      aktuelleSchichtFehler: selectedHasErrors
    });
    this.requestUpdate();
  }
  _updateCalendarId(oldShortcut, newShortcut) {
    // Validiere die neue ID (nur ein Zeichen, a-z)
    const normalizedNewShortcut = newShortcut.toLowerCase().trim();
    if (!normalizedNewShortcut || normalizedNewShortcut.length === 0) {
      this._updateValidationErrors();
      return; // Leere ID nicht erlauben
    }

    // Prüfe ob es ein einzelner Kleinbuchstabe ist
    if (normalizedNewShortcut.length !== 1 || !/^[a-z]$/.test(normalizedNewShortcut)) {
      this._updateValidationErrors();
      return;
    }

    // Prüfe ob die neue ID bereits verwendet wird
    const existingCalendar = this.calendars.find(cal => cal.shortcut === normalizedNewShortcut && cal.shortcut !== oldShortcut);
    if (existingCalendar) {
      this._updateValidationErrors();
      return;
    }

    // Aktualisiere die ID
    this.calendars = this.calendars.map(cal => {
      if (cal.shortcut === oldShortcut) {
        return {
          ...cal,
          shortcut: normalizedNewShortcut
        };
      }
      return cal;
    });

    // Aktualisiere selectedShortcut falls nötig
    if (this.selectedShortcut === oldShortcut) {
      this.selectedShortcut = normalizedNewShortcut;
    }
    this._updateValidationErrors();
  }
}
_defineProperty(ShiftConfigPanel, "properties", {
  calendars: {
    type: Array
  },
  selectedShortcut: {
    type: String
  },
  hass: {
    type: Object
  },
  _validationErrors: {
    type: Object,
    state: true
  }
});
_defineProperty(ShiftConfigPanel, "styles", [_shared_menu_styles_js__WEBPACK_IMPORTED_MODULE_1__.sharedMenuStyles, (0,lit__WEBPACK_IMPORTED_MODULE_0__.css)`
    :host {
      display: block;
      width: 100%;
    }

    /* Gemeinsame Menu-Styles werden aus shared-menu-styles.js importiert */

    .config-menu-bar {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 12px;
      background-color: var(--card-background-color, #ffffff);
      border-radius: 4px 4px 0 0;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-bottom: none;
    }

    .config-panel {
      background-color: var(--card-background-color, #ffffff);
      border-radius: 0 0 4px 4px;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-top: none;
      display: flex;
      flex-direction: column;
      padding: 12px;
    }


    /* Gemeinsame Menu-Styles und Farbleisten-Styles werden aus shared-menu-styles.js importiert */

    .control-button {
      width: 40px;
      height: 40px;
      border-radius: 4px;
      border: 1px solid var(--divider-color, #e0e0e0);
      background-color: var(--card-background-color, #ffffff);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s;
      font-size: 18px;
    }

    .control-button:hover:not(:disabled) {
      background-color: var(--divider-color, #e0e0e0);
    }

    .control-button:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .control-button.delete {
      color: var(--error-color, #f44336);
    }

    .control-button.delete:hover:not(:disabled) {
      background-color: var(--error-color, #f44336);
      color: white;
    }

    .add-shift-color-button {
      flex: 0 0 30px !important;
      background-color: var(--divider-color, #e0e0e0) !important;
      color: var(--primary-text-color, #212121);
      font-size: 24px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px dashed var(--divider-color, #e0e0e0) !important;
      min-width: 30px;
      max-width: 30px;
    }

    .add-shift-color-button:hover:not(:disabled) {
      background-color: var(--primary-color, #03a9f4) !important;
      color: white;
      border-color: var(--primary-color, #03a9f4) !important;
    }

    .add-shift-color-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }


    .shift-item.disabled {
      opacity: 0.5;
    }

    .shifts-list {
      margin-bottom: 24px;
    }

    .shift-editor {
      border-top: 1px solid var(--divider-color, #e0e0e0);
      padding-top: 16px;
      margin-top: 16px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .editor-row {
      display: flex;
      align-items: flex-start;
      gap: 16px;
      flex-wrap: wrap;
    }

    .editor-field {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 150px;
    }

    .editor-field.id-field {
      flex: 0 0 auto;
      min-width: 80px;
      max-width: 100px;
    }

    .editor-field label {
      display: block;
      margin-bottom: 8px;
      font-weight: bold;
      color: var(--primary-text-color, #212121);
    }

    ha-textfield[error] {
      --mdc-text-field-outline-color: var(--error-color, #f44336);
      --mdc-text-field-focus-outline-color: var(--error-color, #f44336);
    }

    .editor-section {
      margin-bottom: 0;
      flex: 1;
      min-width: 100%;
    }

    .editor-section.full-width {
      width: 100%;
    }

    .editor-section label {
      display: block;
      margin-bottom: 8px;
      font-weight: bold;
      color: var(--primary-text-color, #212121);
    }

    .color-input-group {
      display: flex;
      gap: 12px;
      align-items: center;
      position: relative;
    }

    .color-picker-input {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
      pointer-events: none;
    }

    .color-preview-large {
      width: 60px;
      height: 60px;
      border-radius: 4px;
      border: 2px solid var(--divider-color, #e0e0e0);
      flex-shrink: 0;
    }

    .color-picker-input {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
      pointer-events: none;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
    }

    .switch-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex: 1;
      min-width: 200px;
    }

    .switch-label {
      flex: 1;
      font-size: 14px;
      color: var(--primary-text-color, #000000);
      cursor: pointer;
    }

    .switch-item ha-switch {
      flex-shrink: 0;
    }

    .time-ranges-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .time-range-add-button {
      width: 28px;
      height: 28px;
      border-radius: 4px;
      border: 1px solid var(--divider-color, #e0e0e0);
      background-color: var(--card-background-color, #ffffff);
      color: var(--primary-color, #03a9f4);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: bold;
      transition: background-color 0.2s;
    }

    .time-range-add-button:hover:not(:disabled) {
      background-color: var(--primary-color, #03a9f4);
      color: white;
    }

    .time-range-add-button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .time-ranges-table {
      display: flex;
      flex-direction: column;
      border: 1px solid var(--divider-color, #e0e0e0);
      border-radius: 4px;
      overflow: hidden;
    }

    .time-ranges-header-row {
      display: grid;
      grid-template-columns: 60px 1fr 1fr 40px;
      background-color: var(--divider-color, #f5f5f5);
      border-bottom: 1px solid var(--divider-color, #e0e0e0);
    }

    .time-range-header-cell {
      padding: 8px 12px;
      font-weight: bold;
      font-size: 14px;
      color: var(--primary-text-color, #212121);
      border-right: 1px solid var(--divider-color, #e0e0e0);
    }

    .time-range-header-cell:last-child {
      border-right: none;
    }

    .time-range-row {
      display: grid;
      grid-template-columns: 60px 1fr 1fr 40px;
      border-bottom: 1px solid var(--divider-color, #e0e0e0);
    }

    .time-range-row:last-child {
      border-bottom: none;
    }

    .time-range-cell {
      padding: 8px 12px;
      display: flex;
      align-items: center;
      border-right: 1px solid var(--divider-color, #e0e0e0);
    }

    .time-range-cell:last-child {
      border-right: none;
    }

    .time-range-cell.id-cell {
      padding: 8px;
    }

    .time-range-cell.action-cell {
      padding: 4px;
      justify-content: center;
    }

    .time-range-cell ha-textfield {
      width: 100%;
    }

    .time-range-delete-button {
      width: 28px;
      height: 28px;
      border-radius: 4px;
      border: 1px solid var(--divider-color, #e0e0e0);
      background-color: var(--card-background-color, #ffffff);
      color: var(--error-color, #f44336);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: bold;
      transition: background-color 0.2s;
      flex-shrink: 0;
    }

    .time-range-delete-button:hover:not(:disabled) {
      background-color: var(--error-color, #f44336);
      color: white;
    }

    .time-range-delete-button:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    ha-textfield[error] {
      --mdc-text-field-outline-color: var(--error-color, #f44336);
      --mdc-text-field-focus-outline-color: var(--error-color, #f44336);
    }
    `]);
customElements.define('shift-config-panel', ShiftConfigPanel);

/***/ }),

/***/ "./src/views/shiftschedule-view/shiftschedule-view.js":
/*!************************************************************!*\
  !*** ./src/views/shiftschedule-view/shiftschedule-view.js ***!
  \************************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ShiftScheduleView: () => (/* binding */ ShiftScheduleView)
/* harmony export */ });
/* harmony import */ var lit__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! lit */ "./node_modules/lit/index.js");
/* harmony import */ var _view_base_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../view-base.js */ "./src/views/view-base.js");
/* harmony import */ var _card_config_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../card-config.js */ "./src/card-config.js");
/* harmony import */ var _storage_storage_factory_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../storage/storage-factory.js */ "./src/storage/storage-factory.js");
/* harmony import */ var _mixins_holiday_mixin_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./mixins/holiday-mixin.js */ "./src/views/shiftschedule-view/mixins/holiday-mixin.js");
/* harmony import */ var _mixins_data_management_mixin_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./mixins/data-management-mixin.js */ "./src/views/shiftschedule-view/mixins/data-management-mixin.js");
/* harmony import */ var _mixins_calendar_mixin_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./mixins/calendar-mixin.js */ "./src/views/shiftschedule-view/mixins/calendar-mixin.js");
/* harmony import */ var _mixins_config_management_mixin_js__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./mixins/config-management-mixin.js */ "./src/views/shiftschedule-view/mixins/config-management-mixin.js");
/* harmony import */ var _mixins_rendering_mixin_js__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./mixins/rendering-mixin.js */ "./src/views/shiftschedule-view/mixins/rendering-mixin.js");
/* harmony import */ var _utils_date_utils_js__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../../utils/date-utils.js */ "./src/utils/date-utils.js");
/* harmony import */ var _utils_color_utils_js__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ../../utils/color-utils.js */ "./src/utils/color-utils.js");
/* harmony import */ var _shared_menu_styles_js__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./shared-menu-styles.js */ "./src/views/shiftschedule-view/shared-menu-styles.js");
/* harmony import */ var _menu_bar_template_js__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./menu-bar-template.js */ "./src/views/shiftschedule-view/menu-bar-template.js");
/* harmony import */ var _shift_config_panel_js__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./shift-config-panel.js */ "./src/views/shiftschedule-view/shift-config-panel.js");
var _ShiftScheduleView;
function _superPropGet(t, o, e, r) { var p = _get(_getPrototypeOf(1 & r ? t.prototype : t), o, e); return 2 & r && "function" == typeof p ? function (t) { return p.apply(e, t); } : p; }
function _get() { return _get = "undefined" != typeof Reflect && Reflect.get ? Reflect.get.bind() : function (e, t, r) { var p = _superPropBase(e, t); if (p) { var n = Object.getOwnPropertyDescriptor(p, t); return n.get ? n.get.call(arguments.length < 3 ? e : r) : n.value; } }, _get.apply(null, arguments); }
function _superPropBase(t, o) { for (; !{}.hasOwnProperty.call(t, o) && null !== (t = _getPrototypeOf(t));); return t; }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }




// Mixins für wiederverwendbare Funktionalität





// Utilities


// Gemeinsame Menu-Styles

// Menu-Bar Template

// Konfigurationspanel

class ShiftScheduleView extends _view_base_js__WEBPACK_IMPORTED_MODULE_1__.ViewBase {
  static get properties() {
    return {
      ...super.properties,
      hass: {
        type: Object
      },
      config: {
        type: Object
      },
      lovelace: {
        type: Object
      },
      _workingDays: {
        type: Object
      },
      _storageWarning: {
        type: Object
      },
      _configWarning: {
        type: Object
      },
      _statusWarning: {
        type: Object
      },
      _displayedMonths: {
        type: Number
      },
      _startMonthOffset: {
        type: Number
      },
      _selectedCalendar: {
        type: String
      },
      _showConfigPanel: {
        type: Boolean
      }
    };
  }
  constructor() {
    super();
    this._workingDays = {}; // {"year:month": {day: [elements]}} - z.B. {"25:11": {1: ["a"], 2: ["a", "h"], 3: ["b"]}}
    this._storageWarning = null; // { show: boolean, currentLength: number, maxLength: number, percentage: number }
    this._configWarning = null; // { show: boolean, configEntityId: string }
    this._statusWarning = null; // { show: boolean, statusEntityId: string }
    this._knownEntityIds = null; // Cache für bekannte Entities [mainEntity, ...additionalEntities] - WIRD VON ENTITY-STORAGE VERWENDET
    this._cleanupDone = false; // Flag, ob die Bereinigung bereits beim initialen Laden ausgeführt wurde
    this._displayedMonths = 2; // Anzahl der angezeigten Monate (wird aus config.numberOfMonths initialisiert)
    this._startMonthOffset = 0; // Offset für den Startmonat (0 = aktueller Monat, -1 = Vormonat, +1 = nächster Monat)
    this._isWriting = false; // Flag, ob gerade geschrieben wird
    this._writeLockTimer = null; // Timer für das 5-Sekunden-Lock nach dem Schreiben
    this._selectedCalendar = null; // Shortcut des ausgewählten Kalenders (wird beim Setzen der Config initialisiert)
    this._isInitialLoad = true; // Flag, ob gerade der initiale Load läuft (verhindert Config-Schreiben beim Laden)
    this._directDOMUpdateInProgress = new Set(); // Set von Button-Keys, die gerade per direkter DOM-Manipulation aktualisiert werden
    // Performance-Caches
    this._holidayCache = {}; // Cache für Feiertage: {"2025-12": {1: true, 25: true, ...}}
    this._cachedHolidayEntities = null; // Cache für Holiday-Entities (wird bei hass-Update invalidiert)
    this._editorModeCache = null; // Cache für Editor-Mode-Erkennung
    this._editorModeCacheTime = 0; // Zeitstempel für Cache-Invalidierung
    // Debouncing für Speicher-Operationen
    this._saveDebounceTimer = null; // Timer für Debouncing beim Speichern
    // Storage-Adapter (wird bei setConfig oder set hass initialisiert)
    this._storage = null;
    // Konfigurationspanel
    this._showConfigPanel = false;

    // Mixins hinzufügen (für wiederverwendbare Funktionalität)
    Object.assign(this, _utils_date_utils_js__WEBPACK_IMPORTED_MODULE_9__.DateUtils);
    Object.assign(this, _utils_color_utils_js__WEBPACK_IMPORTED_MODULE_10__.ColorUtils);
    Object.assign(this, _mixins_holiday_mixin_js__WEBPACK_IMPORTED_MODULE_4__.HolidayMixin);
    Object.assign(this, _mixins_data_management_mixin_js__WEBPACK_IMPORTED_MODULE_5__.DataManagementMixin);
    Object.assign(this, _mixins_calendar_mixin_js__WEBPACK_IMPORTED_MODULE_6__.CalendarMixin);
    Object.assign(this, _mixins_config_management_mixin_js__WEBPACK_IMPORTED_MODULE_7__.ConfigManagementMixin);
    Object.assign(this, _mixins_rendering_mixin_js__WEBPACK_IMPORTED_MODULE_8__.RenderingMixin);
  }

  // formatTwoDigits() ist jetzt in DateUtils

  // Prüft, ob die Karte im Editor-Modus angezeigt wird (mit Cache)
  _isInEditorMode() {
    // Cache: Prüfe ob Cache noch gültig ist (5 Sekunden)
    const now = Date.now();
    if (this._editorModeCache !== null && now - this._editorModeCacheTime < 5000) {
      return this._editorModeCache;
    }
    let result = false;

    // Methode 1: Prüfe URL-Parameter ?edit=1
    if (typeof window !== 'undefined' && window.location) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('edit') === '1') {
        result = true;
      }
    }
    if (!result) {
      // Methode 2: Prüfe lovelace.editMode
      if (this.lovelace?.editMode === true) {
        result = true;
      }
    }
    if (!result) {
      // Methode 3: Prüfe, ob hui-dialog-edit-card im DOM existiert
      if (typeof document !== 'undefined') {
        const editDialog = document.querySelector('hui-dialog-edit-card');
        if (editDialog) {
          result = true;
        }
      }
    }
    if (!result) {
      // Methode 4: Prüfe, ob die Karte in einem Editor-Container ist
      let element = this;
      let depth = 0;
      const maxDepth = 20; // Erhöht für bessere Erkennung

      while (element && depth < maxDepth) {
        // Prüfe auf hui-dialog-edit-card im Parent-Baum
        if (element.tagName?.toLowerCase() === 'hui-dialog-edit-card') {
          result = true;
          break;
        }

        // Prüfe auf Editor-spezifische Klassen oder Attribute
        if (element.classList?.contains('card-editor') || element.classList?.contains('hui-card-editor') || element.classList?.contains('edit-mode') || element.classList?.contains('hui-card-config-editor') || element.getAttribute?.('data-card-editor') === 'true' || element.tagName?.toLowerCase().includes('editor') || element.tagName?.toLowerCase() === 'hui-card-element-editor') {
          result = true;
          break;
        }

        // Prüfe auf Editor-spezifische IDs
        if (element.id && (element.id.includes('editor') || element.id.includes('config'))) {
          result = true;
          break;
        }

        // Prüfe auf Editor-spezifische Attribute
        if (element.hasAttribute && (element.hasAttribute('data-card-editor') || element.hasAttribute('data-editor'))) {
          result = true;
          break;
        }
        element = element.parentElement || element.parentNode;
        depth++;
      }
    }
    if (!result) {
      // Methode 5: Prüfe, ob die Karte in einem Shadow DOM mit Editor-Klassen ist
      const root = this.getRootNode();
      if (root && root !== document) {
        const host = root.host;
        if (host) {
          if (host.tagName?.toLowerCase() === 'hui-dialog-edit-card' || host.classList?.contains('card-editor') || host.classList?.contains('hui-card-editor') || host.classList?.contains('edit-mode') || host.classList?.contains('hui-card-config-editor') || host.tagName?.toLowerCase() === 'hui-card-element-editor') {
            result = true;
          }
        }
      }
    }
    if (!result) {
      // Methode 6: Prüfe URL-Pfad (falls im Editor-Modus)
      if (typeof window !== 'undefined' && window.location) {
        const url = window.location.href || window.location.pathname;
        if (url && (url.includes('/config/lovelace/dashboards') || url.includes('/editor'))) {
          result = true;
        }
      }
    }

    // Cache speichern
    this._editorModeCache = result;
    this._editorModeCacheTime = now;
    return result;
  }

  // Berechnet die Kontrastfarbe (schwarz oder weiß) für eine gegebene Hintergrundfarbe
  // _getContrastColor() ist jetzt in ColorUtils
  // _getEasterDate(), _isHoliday(), _isWeekend() sind jetzt in HolidayMixin

  /**
   * Initialisiert den Storage-Adapter basierend auf der Konfiguration
   * @private
   */
  _initializeStorage() {
    if (!this._hass || !this._config) {
      this._debug('[Storage] _initializeStorage: hass oder config fehlt');
      this._storage = null;
      return;
    }
    try {
      this._storage = _storage_storage_factory_js__WEBPACK_IMPORTED_MODULE_3__.StorageFactory.createStorage(this._hass, this._config, this._debug.bind(this));
      this._debug(`[Storage] _initializeStorage: Storage-Adapter erstellt, store_mode: "${this._config.store_mode}"`);
    } catch (error) {
      this._debug(`[Storage] _initializeStorage: Fehler beim Erstellen des Storage-Adapters: ${error.message}`, error);
      this._storage = null;
    }
  }
  get hass() {
    return this._hass;
  }
  set hass(hass) {
    // Ignoriere Updates während des Schreibens und 5 Sekunden danach
    if (this._isWriting) {
      this._hass = hass; // Aktualisiere hass trotzdem, aber lade keine Daten
      this.requestUpdate();
      return;
    }
    const previousEntityState = this._hass?.states?.[this._config?.entity]?.state;
    const newEntityState = hass?.states?.[this._config?.entity]?.state;

    // Prüfe auch zusätzliche Entities auf Änderungen
    let hasAnyEntityChanged = previousEntityState !== newEntityState;
    if (!hasAnyEntityChanged && this._config && this._knownEntityIds && hass?.states) {
      // Prüfe alle bekannten zusätzlichen Entities
      for (let i = 1; i < this._knownEntityIds.length; i++) {
        const entityId = this._knownEntityIds[i];
        const prevState = this._hass?.states?.[entityId]?.state;
        const newState = hass?.states?.[entityId]?.state;
        if (prevState !== newState) {
          hasAnyEntityChanged = true;
          break;
        }
      }
    }

    // Prüfe ob sich die saver_config geändert hat (nur bei store_mode === 'saver')
    let hasSaverConfigChanged = false;
    if (this._config && this._config.store_mode === 'saver' && this._hass && hass && hass?.states) {
      try {
        const saverEntity = hass.states['saver.saver'];
        const previousSaverEntity = this._hass?.states?.['saver.saver'];
        if (saverEntity && saverEntity.attributes && saverEntity.attributes.variables) {
          const configKey = `${this._config.saver_key || 'Schichtplan'}_config`;
          const previousConfigValue = previousSaverEntity?.attributes?.variables?.[configKey];
          const newConfigValue = saverEntity.attributes.variables[configKey];
          if (previousConfigValue !== newConfigValue) {
            hasSaverConfigChanged = true;
            this._debug('[Config] set hass: saver_config hat sich geändert, lade Konfiguration neu');
          }
        }
      } catch (error) {
        this._debug('[Config] set hass: Fehler beim Prüfen der saver_config:', error);
      }
    }
    const wasHassSet = !!this._hass;
    this._hass = hass;

    // Cache-Invalidierung: Holiday-Entities Cache zurücksetzen bei hass-Update
    this._cachedHolidayEntities = null;

    // Initialisiere Storage-Adapter neu, falls Config bereits vorhanden
    if (this._config) {
      this._initializeStorage();
    }

    // Wenn hass zum ersten Mal gesetzt wird und die Konfiguration bereits vorhanden ist,
    // markiere initialen Load als abgeschlossen
    if (!wasHassSet && hass && this._config && this._isInitialLoad) {
      this._debug('[Config] set hass: hass zum ersten Mal gesetzt - markiere initialen Load als abgeschlossen');
      this._isInitialLoad = false;
    }
    if (this._config) {
      // Lade Daten beim ersten Setzen von hass oder wenn sich ein State geändert hat
      if ((!wasHassSet || hasAnyEntityChanged) && hass?.states) {
        try {
          this.loadWorkingDays();
        } catch (error) {
          this._debug('[Config] set hass: Fehler beim Laden der Arbeitszeiten:', error);
        }
      }

      // Beim ersten Setzen von hass: Lade die Konfiguration aus dem Storage, falls noch nicht geladen
      if (!wasHassSet && this._storage) {
        this._debug('[Config] set hass: hass zum ersten Mal gesetzt - lade Konfiguration aus Storage');
        // Verwende Promise ohne await, da set hass() nicht async ist
        this._storage.loadConfig().then(storageConfig => {
          if (storageConfig) {
            try {
              const parsedConfig = JSON.parse(storageConfig);

              // Neues Format: Objekt mit "calendars" Property
              if (parsedConfig && typeof parsedConfig === 'object' && Array.isArray(parsedConfig.calendars)) {
                this._debug('[Config] set hass: Konfiguration aus Storage geladen (neues Format mit calendars) beim ersten hass-Set');

                // Ersetze this._config.calendars vollständig mit den geladenen Kalendern
                this._config.calendars = parsedConfig.calendars.map(cal => {
                  // Stelle sicher, dass timeRanges im korrekten Format sind
                  let timeRanges = [];
                  if (cal.timeRanges && Array.isArray(cal.timeRanges)) {
                    timeRanges = cal.timeRanges.map((range, idx) => {
                      // Prüfe zuerst, ob es ein Array ist (altes Format)
                      if (Array.isArray(range)) {
                        // Altes Format: [start, end] - konvertiere zu neuem Format
                        this._debug(`[Config] set hass: Zeitraum ${idx} für "${cal.shortcut}": Altes Format [start, end] erkannt`);
                        return {
                          id: null,
                          times: [...range]
                        };
                      } else if (typeof range === 'object' && range !== null && range.times && Array.isArray(range.times)) {
                        // Neues Format: { id, times: [start, end] }
                        const normalizedRange = {
                          id: range.id || null,
                          times: [...range.times]
                        };
                        this._debug(`[Config] set hass: Zeitraum ${idx} für "${cal.shortcut}": Neues Format erkannt, id="${normalizedRange.id}", times=[${normalizedRange.times.join(',')}]`);
                        return normalizedRange;
                      } else {
                        this._debug(`[Config] set hass: Zeitraum ${idx} für "${cal.shortcut}": Unbekanntes Format, verwende Default`);
                        return {
                          id: null,
                          times: [null, null]
                        };
                      }
                    });
                  }
                  return {
                    shortcut: cal.shortcut,
                    name: cal.name || `Schicht ${cal.shortcut?.toUpperCase() || ''}`,
                    color: cal.color || this._getDefaultColorForShortcut(cal.shortcut),
                    enabled: cal.enabled === true || cal.enabled === 'true' || cal.enabled === 1,
                    statusRelevant: cal.statusRelevant === true || cal.statusRelevant === 'true' || cal.statusRelevant === 1,
                    timeRanges: timeRanges
                  };
                });
                this._debug(`[Config] set hass: ${this._config.calendars.length} Kalender geladen beim ersten hass-Set`);
                this._config.calendars.forEach(cal => {
                  this._debug(`[Config] set hass: Kalender "${cal.shortcut}":`, {
                    name: cal.name,
                    enabled: cal.enabled,
                    statusRelevant: cal.statusRelevant,
                    timeRanges_count: cal.timeRanges?.length || 0
                  });
                });
                this._debug('[Config] set hass: Konfiguration aus Saver geladen und this._config aktualisiert');
                this.requestUpdate();
              } else {
                this._debug('[Config] set hass: Konfiguration konnte nicht geparst werden - erwartetes Format: { calendars: [...] }');
              }
            } catch (error) {
              this._debug('[Config] set hass: Fehler beim Parsen der Konfiguration aus dem Storage:', error);
            }
          }
        }).catch(error => {
          this._debug('[Config] set hass: Fehler beim Laden der Konfiguration aus dem Storage:', error);
        });
      }

      // Wenn sich die saver_config geändert hat, lade die Konfiguration neu
      if (hasSaverConfigChanged && this._storage) {
        this._debug('[Config] set hass: Lade Konfiguration aus Storage neu');
        // Lade die Konfiguration aus dem Storage und aktualisiere this._config
        this._storage.loadConfig().then(storageConfig => {
          if (storageConfig) {
            try {
              const parsedConfig = JSON.parse(storageConfig);

              // Neues Format: Objekt mit "calendars" Property
              if (parsedConfig && typeof parsedConfig === 'object' && Array.isArray(parsedConfig.calendars)) {
                this._debug('[Config] set hass: Konfiguration aus Saver neu geladen (neues Format mit calendars)');

                // Ersetze this._config.calendars vollständig mit den geladenen Kalendern
                this._config.calendars = parsedConfig.calendars.map(cal => {
                  // Stelle sicher, dass timeRanges im korrekten Format sind
                  let timeRanges = [];
                  if (cal.timeRanges && Array.isArray(cal.timeRanges)) {
                    timeRanges = cal.timeRanges.map((range, idx) => {
                      // Prüfe zuerst, ob es ein Array ist (altes Format)
                      if (Array.isArray(range)) {
                        // Altes Format: [start, end] - konvertiere zu neuem Format
                        this._debug(`[Config] set hass: Zeitraum ${idx} für "${cal.shortcut}": Altes Format [start, end] erkannt`);
                        return {
                          id: null,
                          times: [...range]
                        };
                      } else if (typeof range === 'object' && range !== null && range.times && Array.isArray(range.times)) {
                        // Neues Format: { id, times: [start, end] }
                        const normalizedRange = {
                          id: range.id || null,
                          times: [...range.times]
                        };
                        this._debug(`[Config] set hass: Zeitraum ${idx} für "${cal.shortcut}": Neues Format erkannt, id="${normalizedRange.id}", times=[${normalizedRange.times.join(',')}]`);
                        return normalizedRange;
                      } else {
                        this._debug(`[Config] set hass: Zeitraum ${idx} für "${cal.shortcut}": Unbekanntes Format, verwende Default`);
                        return {
                          id: null,
                          times: [null, null]
                        };
                      }
                    });
                  }
                  return {
                    shortcut: cal.shortcut,
                    name: cal.name || `Schicht ${cal.shortcut?.toUpperCase() || ''}`,
                    color: cal.color || this._getDefaultColorForShortcut(cal.shortcut),
                    enabled: cal.enabled === true || cal.enabled === 'true' || cal.enabled === 1,
                    statusRelevant: cal.statusRelevant === true || cal.statusRelevant === 'true' || cal.statusRelevant === 1,
                    timeRanges: timeRanges
                  };
                });
                this._debug(`[Config] set hass: ${this._config.calendars.length} Kalender geladen`);
                this._config.calendars.forEach(cal => {
                  this._debug(`[Config] set hass: Kalender "${cal.shortcut}":`, {
                    name: cal.name,
                    enabled: cal.enabled,
                    statusRelevant: cal.statusRelevant,
                    timeRanges_count: cal.timeRanges?.length || 0
                  });
                });
                this._debug('[Config] set hass: Konfiguration aus Storage neu geladen und this._config aktualisiert');
                // Wichtig: requestUpdate() aufrufen, damit die UI neu gerendert wird
                this.requestUpdate();
              } else {
                this._debug('[Config] set hass: Konfiguration konnte nicht geparst werden - erwartetes Format: { calendars: [...] }');
              }
            } catch (error) {
              this._debug('[Config] set hass: Fehler beim Parsen der neu geladenen Konfiguration:', error);
            }
          }
        }).catch(error => {
          this._debug('[Config] set hass: Fehler beim Neuladen der Konfiguration aus dem Storage:', error);
        });
      }

      // Prüfe Config-Entity und Status-Entity nur bei text_entity Modus
      // (bei Saver werden diese nicht benötigt)
      if (this._config.store_mode !== 'saver' && hass?.states) {
        try {
          this.checkConfigEntity();
          this.checkStatusEntity();
        } catch (error) {
          this._debug('[Config] set hass: Fehler beim Prüfen der Config/Status-Entities:', error);
        }
      }
    }
    this.requestUpdate();
  }
  get config() {
    return this._config;
  }
  set config(config) {
    this._debug('[Config] set config: === WIRD AUFGERUFEN ===');
    this._debug('[Config] set config: _isInitialLoad Status:', this._isInitialLoad);
    const wasInitialLoad = this._isInitialLoad;

    // Lade Konfiguration aus dem Storage, wenn store_mode == 'saver' und hass verfügbar ist
    // ABER: Nur beim initialen Laden, nicht wenn die Konfiguration vom Editor kommt
    // (beim Editor-Schließen wird die Konfiguration gespeichert, dann sollte sie nicht wieder überschrieben werden)
    if (config && config.store_mode === 'saver' && this._hass && wasInitialLoad) {
      this._debug('[Config] set config: Initialer Load - lade Konfiguration aus dem Storage und merge mit übergebener Config');
      // Initialisiere Storage, falls noch nicht geschehen
      if (!this._storage) {
        this._initializeStorage();
      }
      if (this._storage) {
        // Verwende Promise, da set config() nicht async ist
        this._storage.loadConfig().then(storageConfig => {
          if (storageConfig) {
            try {
              const parsedConfig = JSON.parse(storageConfig);

              // Neues Format: Objekt mit "calendars" Property
              if (parsedConfig && typeof parsedConfig === 'object' && Array.isArray(parsedConfig.calendars)) {
                this._debug('[Config] set config: Konfiguration aus Saver geparst (neues Format mit calendars)');

                // Starte mit der bestehenden internen Konfiguration (falls vorhanden) oder der übergebenen Config
                // Die übergebene Config hat Vorrang für Darstellungsparameter
                const mergedConfig = {
                  ...this._config,
                  // Starte mit bestehender interner Konfiguration
                  ...config // Überschreibe mit übergebener Config (Darstellungsparameter)
                };

                // Ersetze calendars vollständig mit den geladenen Kalendern aus dem Saver
                mergedConfig.calendars = parsedConfig.calendars.map(cal => {
                  // Stelle sicher, dass timeRanges im korrekten Format sind
                  let timeRanges = [];
                  if (cal.timeRanges && Array.isArray(cal.timeRanges)) {
                    timeRanges = cal.timeRanges.map((range, idx) => {
                      // Prüfe zuerst, ob es ein Array ist (altes Format)
                      if (Array.isArray(range)) {
                        // Altes Format: [start, end] - konvertiere zu neuem Format
                        this._debug(`[Config] set config: Zeitraum ${idx} für "${cal.shortcut}": Altes Format [start, end] erkannt`);
                        return {
                          id: null,
                          times: [...range]
                        };
                      } else if (typeof range === 'object' && range !== null && range.times && Array.isArray(range.times)) {
                        // Neues Format: { id, times: [start, end] }
                        const normalizedRange = {
                          id: range.id || null,
                          times: [...range.times]
                        };
                        this._debug(`[Config] set config: Zeitraum ${idx} für "${cal.shortcut}": Neues Format erkannt, id="${normalizedRange.id}", times=[${normalizedRange.times.join(',')}]`);
                        return normalizedRange;
                      } else {
                        this._debug(`[Config] set config: Zeitraum ${idx} für "${cal.shortcut}": Unbekanntes Format, verwende Default`);
                        return {
                          id: null,
                          times: [null, null]
                        };
                      }
                    });
                  }
                  return {
                    shortcut: cal.shortcut,
                    name: cal.name || `Schicht ${cal.shortcut?.toUpperCase() || ''}`,
                    color: cal.color || this._getDefaultColorForShortcut(cal.shortcut),
                    enabled: cal.enabled === true || cal.enabled === 'true' || cal.enabled === 1,
                    statusRelevant: cal.statusRelevant === true || cal.statusRelevant === 'true' || cal.statusRelevant === 1,
                    timeRanges: timeRanges
                  };
                });
                this._debug(`[Config] set config: ${mergedConfig.calendars.length} Kalender aus Saver geladen`);
                mergedConfig.calendars.forEach(cal => {
                  this._debug(`[Config] set config: Kalender "${cal.shortcut}":`, {
                    name: cal.name,
                    enabled: cal.enabled,
                    statusRelevant: cal.statusRelevant,
                    timeRanges_count: cal.timeRanges?.length || 0
                  });
                });

                // Verwende die gemergte Konfiguration - diese überschreibt vollständig this._config
                config = mergedConfig;
                this._config = mergedConfig;
                this._debug('[Config] set config: Konfiguration vollständig mit storage_config synchronisiert');
                this.requestUpdate();
              } else {
                this._debug('[Config] set config: Konfiguration konnte nicht geparst werden - erwartetes Format: { calendars: [...] }');
              }
            } catch (error) {
              this._debug('[Config] set config: Fehler beim Parsen der Konfiguration aus dem Storage:', error);
            }
          }
        }).catch(error => {
          this._debug('[Config] set config: Fehler beim Laden der Konfiguration aus dem Storage:', error);
        });
      }
    }
    this._config = config;
    this._debug('[Config] set config: Neue Konfiguration erhalten', {
      store_mode: config?.store_mode,
      saver_key: config?.saver_key,
      calendars_count: config?.calendars?.length,
      hasHass: !!this._hass
    });

    // Initialisiere _displayedMonths aus der Config
    if (config && config.initialDisplayedMonths) {
      // Verwende initialDisplayedMonths als Standardwert
      const maxMonths = config.numberOfMonths || 14;
      this._displayedMonths = Math.min(config.initialDisplayedMonths, maxMonths);
    } else if (config && config.numberOfMonths && !this._displayedMonths) {
      // Fallback: Verwende numberOfMonths, falls initialDisplayedMonths nicht gesetzt ist
      this._displayedMonths = config.numberOfMonths;
    } else if (config && config.numberOfMonths) {
      // Stelle sicher, dass _displayedMonths nicht größer als numberOfMonths ist
      this._displayedMonths = Math.min(this._displayedMonths || 2, config.numberOfMonths);
    }

    // Initialisiere _selectedCalendar - prüfe nur aktivierte Kalender
    // Setze _config zuerst, damit _getAllCalendars() funktioniert
    this._config = config;
    const allCalendars = this._getAllCalendars();

    // Synchronisiere _selectedCalendar immer mit config.selectedCalendar
    if (config && config.selectedCalendar) {
      // Prüfe ob der ausgewählte Kalender aktiviert ist
      const exists = allCalendars.some(cal => cal.shortcut === config.selectedCalendar);
      if (exists) {
        // Aktualisiere _selectedCalendar, auch wenn es bereits gesetzt ist
        this._selectedCalendar = config.selectedCalendar;
      } else {
        // Wenn der ausgewählte Kalender nicht aktiviert ist, verwende den ersten aktivierten
        if (allCalendars.length > 0) {
          this._selectedCalendar = allCalendars[0].shortcut;
          if (config) {
            config.selectedCalendar = this._selectedCalendar;
            // Nur config-changed Event auslösen, wenn nicht initialer Load
            if (!wasInitialLoad) {
              this.dispatchEvent(new CustomEvent('config-changed', {
                detail: {
                  config: config
                },
                bubbles: true,
                composed: true
              }));
            }
          }
        } else {
          // Ausgewählter Kalender ist nicht aktiviert, verwende den ersten aktivierten
          if (allCalendars.length > 0) {
            this._selectedCalendar = allCalendars[0].shortcut;
            if (config) {
              config.selectedCalendar = this._selectedCalendar;
              // Nur config-changed Event auslösen, wenn nicht initialer Load
              if (!wasInitialLoad) {
                this.dispatchEvent(new CustomEvent('config-changed', {
                  detail: {
                    config: config
                  },
                  bubbles: true,
                  composed: true
                }));
              }
            }
          } else {
            // Kein Kalender aktiviert - keine automatische Aktivierung
            this._selectedCalendar = null;
            if (config) {
              config.selectedCalendar = null;
            }
          }
        }
      }
    } else {
      // Wenn kein selectedCalendar gesetzt ist, verwende den ersten aktivierten Kalender
      if (allCalendars.length > 0) {
        this._selectedCalendar = allCalendars[0].shortcut;
        if (config) {
          config.selectedCalendar = this._selectedCalendar;
          // Nur config-changed Event auslösen, wenn nicht initialer Load
          if (!wasInitialLoad) {
            this.dispatchEvent(new CustomEvent('config-changed', {
              detail: {
                config: config
              },
              bubbles: true,
              composed: true
            }));
          }
        }
      } else {
        // Kein Kalender aktiviert - keine automatische Aktivierung
        this._selectedCalendar = null;
        if (config) {
          config.selectedCalendar = null;
        }
      }
    }

    // Wenn hass vorhanden ist, bedeutet das, dass die Karte bereits initialisiert wurde
    // Setze _isInitialLoad auf false, wenn hass vorhanden ist (Karte ist bereit)
    if (this._hass && this._isInitialLoad) {
      this._debug('[Config] set config: hass vorhanden - markiere initialen Load als abgeschlossen');
      this._isInitialLoad = false;
    }
    if (this._hass) {
      // Initialisiere Storage-Adapter
      this._initializeStorage();
      this.loadWorkingDays();
      // Prüfe Warnungen über Storage-Adapter
      this._updateWarnings();

      // Wenn die Konfiguration gesetzt wird und es nicht der initiale Load ist,
      // speichere die Konfiguration (z.B. wenn der Editor geschlossen wird)
      // Dies stellt sicher, dass Änderungen im Editor immer gespeichert werden
      // Prüfe jetzt nochmal, da _isInitialLoad möglicherweise gerade auf false gesetzt wurde
      const isStillInitialLoad = this._isInitialLoad;
      if (!isStillInitialLoad && this._config) {
        this._debug('[Config] set config: Konfiguration wurde gesetzt (nicht initialer Load)');
        this._debug('[Config] set config: Editor wurde geschlossen - speichere Konfiguration');
        // Verwende setTimeout, um sicherzustellen, dass die Konfiguration vollständig gesetzt ist
        setTimeout(() => {
          this._debug('[Config] set config: Starte saveConfigToEntity() nach setTimeout');
          this.saveConfigToEntity();
        }, 0);
      } else if (isStillInitialLoad) {
        this._debug('[Config] set config: Initialer Load erkannt - überspringe Speichern');
      }
    } else {
      this._debug('[Config] set config: hass noch nicht verfügbar - warte auf Initialisierung');
    }

    // Markiere initialen Load als abgeschlossen NACH dem ersten Rendering
    // (nicht hier, sondern in firstUpdated oder nach dem ersten config-changed Event)

    this.requestUpdate();
  }

  // Wird aufgerufen, wenn ein config-changed Event empfangen wird
  // (nur dann wird die Config gespeichert, nicht beim initialen Laden)
  _handleConfigChanged() {
    this._debug('[Config] _handleConfigChanged: Event empfangen - Konfiguration wurde geändert');

    // Verhindere Speichern beim initialen Load
    if (this._isInitialLoad) {
      this._debug('[Config] _handleConfigChanged: Initialer Load erkannt, überspringe Config-Speichern');
      this._debug('[Config] _handleConfigChanged: Markiere initialen Load als abgeschlossen');
      // Markiere initialen Load als abgeschlossen NACH dem ersten Event
      this._isInitialLoad = false;
      return;
    }
    if (!this._hass) {
      this._debug('[Config] _handleConfigChanged: Abbruch - hass nicht verfügbar');
      return;
    }
    if (!this._config) {
      this._debug('[Config] _handleConfigChanged: Abbruch - config nicht verfügbar');
      return;
    }
    this._debug('[Config] _handleConfigChanged: Starte saveConfigToEntity()');
    this.saveConfigToEntity();
  }

  // Liest eine Saver-Variable (z.B. "Schichtplan" aus saver.saver.attributes.variables)
  _readSaverVariable(key) {
    if (!this._hass || !this._hass.states || !key) {
      this._debug('[Saver] _readSaverVariable: Kein hass oder key vorhanden');
      return null;
    }

    // Saver-Variablen sind in saver.saver.attributes.variables gespeichert
    const saverEntity = this._hass?.states?.['saver.saver'];
    if (saverEntity && saverEntity.attributes && saverEntity.attributes.variables) {
      const variables = saverEntity.attributes.variables;
      const variableValue = variables[key];
      if (variableValue !== undefined && variableValue !== null) {
        // Konvertiere zu String und trimme
        const value = String(variableValue).trim();
        if (value !== '') {
          this._debug(`[Saver] _readSaverVariable: Variable "${key}" gefunden in saver.saver.attributes.variables, Länge: ${value.length} Zeichen`);
          // Zeige ersten 100 Zeichen der Daten für Debug
          if (value.length > 0) {
            const preview = value.substring(0, 100);
            this._debug(`[Saver] _readSaverVariable: Daten-Vorschau: "${preview}${value.length > 100 ? '...' : ''}"`);
          }
          return value;
        }
      }

      // Debug: Zeige verfügbare Variablen
      const availableKeys = Object.keys(variables);
      this._debug(`[Saver] _readSaverVariable: Variable "${key}" nicht gefunden. Verfügbare Variablen: ${availableKeys.length > 0 ? availableKeys.join(', ') : 'keine'}`);
    } else {
      this._debug(`[Saver] _readSaverVariable: saver.saver Entity nicht gefunden oder hat keine variables-Attribute`);
    }
    this._debug(`[Saver] _readSaverVariable: Variable "${key}" nicht gefunden oder leer`);
    return null;
  }

  // Prüft ob Saver verfügbar ist (mindestens eine Saver-Entity existiert)
  _isSaverAvailable() {
    if (!this._hass || !this._hass.states) {
      return false;
    }
    // Prüfe ob irgendeine saver.* Entity existiert
    return Object.keys(this._hass.states).some(entityId => entityId.startsWith('saver.'));
  }

  // Liest Daten vom Saver (wenn store_mode == 'saver' und Saver verfügbar)
  _loadDataFromSaver() {
    if (!this._config || this._config.store_mode !== 'saver') {
      this._debug('[Saver] _loadDataFromSaver: store_mode ist nicht "saver"');
      return null;
    }
    const saverKey = this._config.saver_key || 'Schichtplan';
    this._debug(`[Saver] _loadDataFromSaver: Versuche Daten von Saver-Variable "${saverKey}" zu laden`);
    const data = this._readSaverVariable(saverKey);

    // Wenn Daten vorhanden, gib sie zurück
    if (data && data.trim() !== '') {
      this._debug(`[Saver] _loadDataFromSaver: Daten erfolgreich geladen, Länge: ${data.length} Zeichen`);
      return data;
    }
    this._debug('[Saver] _loadDataFromSaver: Keine Daten gefunden');
    return null;
  }

  // Liest Config vom Saver (wenn store_mode == 'saver' und Saver verfügbar)
  _loadConfigFromSaver() {
    if (!this._config || this._config.store_mode !== 'saver') {
      this._debug('[Saver] _loadConfigFromSaver: store_mode ist nicht "saver"');
      return null;
    }
    const saverKey = this._config.saver_key || 'Schichtplan';
    const configKey = `${saverKey}_config`;
    this._debug(`[Saver] _loadConfigFromSaver: Versuche Config von Saver-Variable "${configKey}" zu laden`);
    const config = this._readSaverVariable(configKey);

    // Wenn Config vorhanden, gib sie zurück
    if (config && config.trim() !== '') {
      this._debug(`[Saver] _loadConfigFromSaver: Config erfolgreich geladen, Länge: ${config.length} Zeichen`);
      return config;
    }
    this._debug('[Saver] _loadConfigFromSaver: Keine Config gefunden');
    return null;
  }

  /**
   * Aktualisiert Warnungen basierend auf dem Storage-Adapter
   * @private
   */
  _updateWarnings() {
    if (!this._storage) {
      return;
    }
    const warnings = this._storage.getWarnings();
    if (warnings) {
      if (warnings.config) {
        this._configWarning = warnings.config;
        this._updateConfigWarningDirectly();
      }
      if (warnings.status) {
        this._statusWarning = warnings.status;
        this._updateStatusWarningDirectly();
      }
    } else {
      // Keine Warnungen - setze auf null
      if (this._configWarning) {
        this._configWarning = null;
        this._updateConfigWarningDirectly();
      }
      if (this._statusWarning) {
        this._statusWarning = null;
        this._updateStatusWarningDirectly();
      }
    }
  }
  async loadWorkingDays() {
    if (!this._hass || !this._config || !this._config.entity) {
      this._debug('[Laden] loadWorkingDays: Kein hass, config oder entity vorhanden');
      return;
    }

    // Stelle sicher, dass Storage initialisiert ist
    if (!this._storage) {
      this._initializeStorage();
    }
    if (!this._storage) {
      this._debug('[Laden] loadWorkingDays: Kein Storage-Adapter verfügbar');
      return;
    }
    this._debug(`[Laden] loadWorkingDays: Start, store_mode: "${this._config.store_mode}", entity: "${this._config.entity}"`);
    let dataString = null;
    let dataSource = 'none';

    // Versuche zuerst den primären Storage-Adapter
    try {
      dataString = await this._storage.loadData();
      if (dataString) {
        dataSource = this._config.store_mode === 'saver' ? 'saver' : 'entities';
        this._debug(`[Laden] loadWorkingDays: Daten von ${dataSource} geladen, Länge: ${dataString.length} Zeichen`);
      }
    } catch (error) {
      this._debug(`[Laden] loadWorkingDays: Fehler beim Laden: ${error.message}`, error);
    }

    // Fallback: Wenn Saver-Modus und keine Daten, versuche EntityStorage
    if ((!dataString || dataString.trim() === '') && this._config.store_mode === 'saver') {
      this._debug('[Laden] loadWorkingDays: Keine Daten vom Saver, Fallback zu Entities');
      try {
        const fallbackStorage = _storage_storage_factory_js__WEBPACK_IMPORTED_MODULE_3__.StorageFactory.createStorage(this._hass, {
          ...this._config,
          store_mode: 'text_entity'
        }, this._debug.bind(this));
        dataString = await fallbackStorage.loadData();
        if (dataString) {
          dataSource = 'entities-fallback';
          this._debug(`[Laden] loadWorkingDays: Daten von Entities (Fallback) geladen, Länge: ${dataString.length} Zeichen`);
        }
      } catch (error) {
        this._debug(`[Laden] loadWorkingDays: Fehler beim Fallback-Laden: ${error.message}`, error);
      }
    }

    // Synchronisiere _knownEntityIds mit EntityStorage (falls verwendet)
    if (this._storage && this._storage._knownEntityIds) {
      this._knownEntityIds = this._storage._knownEntityIds;
    }

    // Parse die Daten (egal ob von Saver oder Entities)
    if (dataString && dataString.trim() !== '') {
      this._debug(`[Laden] loadWorkingDays: Parse Daten von Quelle: "${dataSource}"`);
      this._debug(`[Laden] loadWorkingDays: Daten-String (erste 200 Zeichen): ${dataString.substring(0, 200)}...`);
      this.parseWorkingDays(dataString);
      const workingDaysCount = Object.keys(this._workingDays).length;
      this._debug(`[Laden] loadWorkingDays: Daten geparst, ${workingDaysCount} Monate gefunden`);
      this._debug(`[Laden] loadWorkingDays: Verfügbare Keys in _workingDays:`, Object.keys(this._workingDays));
      // Zeige Details für jeden Monat
      Object.keys(this._workingDays).forEach(key => {
        const monthData = this._workingDays[key];
        if (typeof monthData === 'object' && !Array.isArray(monthData)) {
          const daysCount = Object.keys(monthData).length;
          this._debug(`[Laden] loadWorkingDays: Monat "${key}": ${daysCount} Tage mit Daten`);
          // Zeige erste 5 Tage als Beispiel
          const sampleDays = Object.keys(monthData).slice(0, 5);
          sampleDays.forEach(day => {
            this._debug(`[Laden] loadWorkingDays: Monat "${key}", Tag ${day}:`, monthData[day]);
          });
        }
      });
    } else {
      this._debug('[Laden] loadWorkingDays: Keine Daten zum Parsen vorhanden, setze _workingDays auf {}');
      this._workingDays = {};
    }

    // Prüfe Speicherverbrauch und zeige Warnung bei 90%+
    // Nur bei text_entity Modus (Saver hat keine Längenbegrenzung)
    if (this._config.store_mode !== 'saver') {
      this.checkStorageUsage();
    } else {
      // Bei Saver-Modus keine Speicherwarnung nötig
      this._storageWarning = null;
    }

    // Bereinige alte Monate: entferne alle Monate, die nicht angezeigt werden
    // Die Karte zeigt numberOfMonths Monate an (ab aktueller Monat)
    // Behalten wir: Vormonat (aktuell - 1) und alle angezeigten Monate (aktuell bis aktuell + numberOfMonths - 1)
    // Führe die Bereinigung nur beim initialen Laden aus, nicht bei jedem State-Update
    // (um zu verhindern, dass gerade geschriebene Daten sofort wieder gelöscht werden)
    if (Object.keys(this._workingDays).length > 0 && !this._cleanupDone) {
      this._cleanupDone = true;
      const numberOfMonths = this._config.numberOfMonths || 2;
      const now = new Date();
      const currentMonth = now.getMonth() + 1; // 1-12
      const currentYearFull = now.getFullYear();
      const currentYear = currentYearFull % 100; // Kurzform, z.B. 25

      // Berechne Vormonat und sein Jahr
      let previousMonth, previousYear;
      if (currentMonth === 1) {
        previousMonth = 12;
        previousYear = (currentYearFull - 1) % 100; // Jahr des Vormonats (Dezember des Vorjahres)
      } else {
        previousMonth = currentMonth - 1;
        previousYear = currentYear;
      }

      // Erstelle Liste aller Monate, die behalten werden sollen
      const monthsToKeep = [];

      // Füge Vormonat hinzu
      monthsToKeep.push({
        year: previousYear,
        month: previousMonth
      });

      // Füge alle angezeigten Monate hinzu
      for (let i = 0; i < numberOfMonths; i++) {
        const date = new Date(currentYearFull, currentMonth - 1 + i, 1);
        const year = date.getFullYear() % 100;
        const month = date.getMonth() + 1;
        monthsToKeep.push({
          year,
          month
        });
      }
      let hasChanges = false;
      for (const key of Object.keys(this._workingDays)) {
        // Parse den Key um zu prüfen, ob er behalten werden soll
        const keyParts = key.split(':');
        if (keyParts.length === 2) {
          const keyYear = parseInt(keyParts[0]);
          const keyMonth = parseInt(keyParts[1]);

          // Prüfe ob dieser Key in der Liste der zu behaltenden Monate ist
          const shouldKeep = monthsToKeep.some(m => m.year === keyYear && m.month === keyMonth);

          //   key,
          //   keyYear,
          //   keyMonth,
          //   shouldKeep,
          //   monthsToKeep: monthsToKeep.map(m => `${m.year}:${m.month}`)
          // });

          if (!shouldKeep) {
            delete this._workingDays[key];
            hasChanges = true;
          }
        } else {
          // Ungültiges Format, entfernen
          delete this._workingDays[key];
          hasChanges = true;
        }
      }

      // Wenn Änderungen vorgenommen wurden, speichere die bereinigten Daten
      if (hasChanges) {
        const cleanedValue = this.serializeWorkingDays();
        try {
          await this._hass.callService('input_text', 'set_value', {
            entity_id: this._config.entity,
            value: cleanedValue
          });
        } catch (error) {}
      }
    }
    this.requestUpdate();
  }
  _parseWorkingDaysIntoObject(dataString, targetObject) {
    if (!dataString || dataString.trim() === '') return;
    const parts = dataString.split(';').filter(p => p.trim() !== '');
    for (const part of parts) {
      const trimmedPart = part.trim();
      if (!trimmedPart) continue;

      // Format: <jahr>:<monat>:<tag><elementen>,<tag><elementen> oder altes Format
      // Beispiel: "25:11:01a,02ah,03b" oder "25:11:01,02,03" (altes Format ohne Elemente)
      const colons = trimmedPart.split(':');
      if (colons.length === 2) {
        // Altes Format ohne Jahr (Kompatibilität): <monat>:<tag>,<tag>
        const month = colons[0].trim();
        const daysStr = colons[1].trim();
        if (month && daysStr) {
          const monthNum = parseInt(month);
          if (!isNaN(monthNum) && monthNum >= 1 && monthNum <= 12) {
            // Verwende aktuelles Jahr
            const now = new Date();
            const year = now.getFullYear() % 100;
            const key = `${this.formatTwoDigits(year)}:${this.formatTwoDigits(monthNum)}`;
            targetObject[key] = this._parseDaysWithElements(daysStr);
          }
        }
      } else if (colons.length >= 3) {
        // Prüfe ob erstes Element ein Jahr ist (kleiner als 13) oder ein Monat
        const first = parseInt(colons[0].trim());
        const second = parseInt(colons[1].trim());
        if (first <= 12 && second > 12) {
          // Altes Format: <monat>:<jahr>:<tag>,<tag> - konvertiere zu neuem Format
          const monthNum = first;
          const yearNum = second;
          const daysStr = colons.slice(2).join(':');
          if (daysStr && monthNum >= 1 && monthNum <= 12 && !isNaN(yearNum)) {
            const key = `${this.formatTwoDigits(yearNum)}:${this.formatTwoDigits(monthNum)}`;
            targetObject[key] = this._parseDaysWithElements(daysStr);
          }
        } else if (first > 12 && second <= 12) {
          // Neues Format: <jahr>:<monat>:<tag><elementen>,<tag><elementen>
          const yearNum = first;
          const monthNum = second;
          const daysStr = colons.slice(2).join(':');
          if (daysStr && monthNum >= 1 && monthNum <= 12 && !isNaN(yearNum)) {
            const key = `${this.formatTwoDigits(yearNum)}:${this.formatTwoDigits(monthNum)}`;
            targetObject[key] = this._parseDaysWithElements(daysStr);
          }
        }
      }
    }
  }

  // Parst Tage mit Elementen: "01a,02ah,03b" -> {1: ["a"], 2: ["a", "h"], 3: ["b"]}
  // Oder altes Format ohne Elemente: "01,02,03" -> {1: [], 2: [], 3: []}
  _parseDaysWithElements(daysStr) {
    const result = {};
    const dayEntries = daysStr.split(',').filter(d => d.trim() !== '');
    for (const entry of dayEntries) {
      const trimmed = entry.trim();
      if (!trimmed) continue;

      // Extrahiere Tag und Elemente: "01a" -> day=1, elements=["a"]
      // Oder: "02ah" -> day=2, elements=["a", "h"]
      // Oder altes Format: "01" -> day=1, elements=[]
      const match = trimmed.match(/^(\d+)([a-z]*)$/i);
      if (match) {
        const dayNum = parseInt(match[1]);
        const elementsStr = match[2] || '';
        // WICHTIG: Filtere nur leere Strings heraus, nicht einzelne Buchstaben
        // split('') teilt jeden Buchstaben in ein separates Array-Element
        const elements = elementsStr.split('').filter(e => e && e.trim() !== '');
        if (!isNaN(dayNum) && dayNum >= 1 && dayNum <= 31) {
          // Wenn der Tag bereits existiert, füge Elemente hinzu (keine Duplikate)
          if (result[dayNum]) {
            // Vereinige Arrays und entferne Duplikate
            result[dayNum] = [...new Set([...result[dayNum], ...elements])];
          } else {
            result[dayNum] = elements;
          }
        }
      } else {
        // Debug-Log wenn kein Match gefunden wurde
        if (trimmed.includes('03')) {
          this._debug(`[Parsing] Kein Match für "${trimmed}"`);
        }
      }
    }
    return result;
  }
  parseWorkingDays(dataString) {
    this._workingDays = {};
    this._parseWorkingDaysIntoObject(dataString, this._workingDays);
  }
  findAdditionalEntities(baseEntityId) {
    const additionalEntities = [];
    if (!this._hass || !this._hass.states) {
      return additionalEntities;
    }

    // Extrahiere den Domain-Teil (z.B. "input_text.arbeitszeiten")
    const entityParts = baseEntityId.split('.');
    if (entityParts.length !== 2) {
      return additionalEntities;
    }
    const [domain, baseName] = entityParts;

    // Suche nach Entities mit _001, _002, etc. (bis _999)
    for (let i = 1; i <= 999; i++) {
      const suffix = String(i).padStart(3, '0'); // _001, _002, ..., _999
      const additionalEntityId = `${domain}.${baseName}_${suffix}`;
      if (this._hass?.states?.[additionalEntityId]) {
        additionalEntities.push(additionalEntityId);
      } else {
        // Wenn eine Entity nicht existiert, breche ab (Entities sind sequenziell)
        // Es macht keinen Sinn weiterzusuchen, wenn _001 fehlt
        break;
      }
    }
    return additionalEntities;
  }
  getEntityMaxLength(entityId) {
    if (!this._hass || !this._hass.states || !entityId) {
      return null;
    }
    const entity = this._hass?.states?.[entityId];
    if (!entity || !entity.attributes) {
      return null;
    }

    // input_text Entities haben ein 'max' Attribut, das die maximale Länge definiert
    const maxLength = entity.attributes.max;
    if (maxLength !== undefined && maxLength !== null) {
      return parseInt(maxLength);
    }
    return null;
  }
  getAllEntityMaxLengths() {
    const maxLengths = {};
    if (!this._hass || !this._config || !this._config.entity) {
      return maxLengths;
    }

    // Prüfe Haupt-Entity
    const mainEntityId = this._config.entity;
    const mainMaxLength = this.getEntityMaxLength(mainEntityId);
    if (mainMaxLength !== null) {
      maxLengths[mainEntityId] = mainMaxLength;
    }

    // Prüfe zusätzliche Entities
    const additionalEntities = this.findAdditionalEntities(mainEntityId);
    for (const additionalEntityId of additionalEntities) {
      const additionalMaxLength = this.getEntityMaxLength(additionalEntityId);
      if (additionalMaxLength !== null) {
        maxLengths[additionalEntityId] = additionalMaxLength;
      }
    }
    return maxLengths;
  }
  checkStorageUsage(serializedDataLength = null) {
    // Warnungen nur bei text_entity Modus (Saver hat keine Längenbegrenzung)
    if (this._config && this._config.store_mode === 'saver') {
      this._storageWarning = null;
      this._updateStorageWarningDirectly();
      return;
    }
    if (!this._hass || !this._config || !this._config.entity) {
      this._storageWarning = null;
      this._updateStorageWarningDirectly();
      return;
    }

    // Verwende _knownEntityIds falls verfügbar, sonst suche neu
    let allEntityIds;
    if (this._knownEntityIds && this._knownEntityIds.length > 0) {
      allEntityIds = [...this._knownEntityIds];
    } else {
      // Fallback: Suche Entities neu
      allEntityIds = [this._config.entity, ...this.findAdditionalEntities(this._config.entity)];
    }
    const maxLengths = this.getAllEntityMaxLengths();
    if (Object.keys(maxLengths).length === 0) {
      this._storageWarning = null;
      this._updateStorageWarningDirectly();
      return;
    }

    // Berechne Gesamtlänge und maximale Gesamtlänge
    let totalCurrentLength = 0;
    let totalMaxLength = 0;

    // Wenn eine serializedDataLength übergeben wurde, verwende diese (z.B. nach toggleDay)
    // Ansonsten lese die Längen aus den aktuellen States
    if (serializedDataLength !== null && serializedDataLength !== undefined) {
      totalCurrentLength = serializedDataLength;
    } else {
      // Lese Längen aus den aktuellen States
      for (const entityId of allEntityIds) {
        const entity = this._hass?.states?.[entityId];
        if (entity && entity.state) {
          totalCurrentLength += entity.state.length;
        }
      }
    }

    // Berechne maximale Gesamtlänge
    for (const entityId of allEntityIds) {
      const maxLength = maxLengths[entityId];
      if (maxLength !== undefined && maxLength !== null) {
        totalMaxLength += maxLength;
      }
    }
    if (totalMaxLength === 0) {
      this._storageWarning = null;
      this._updateStorageWarningDirectly();
      return;
    }
    const percentage = totalCurrentLength / totalMaxLength * 100;

    // Prüfe ob 90% überschritten werden
    if (percentage >= 90) {
      this._storageWarning = {
        show: true,
        currentLength: totalCurrentLength,
        maxLength: totalMaxLength,
        percentage: Math.round(percentage * 10) / 10
      };
    } else {
      this._storageWarning = null;
    }

    // Aktualisiere Warnung direkt im DOM ohne Re-Rendering
    this._updateStorageWarningDirectly();
  }
  getConfigEntityId() {
    // Leite die Config-Entity-ID aus der Haupt-Entity ab
    if (!this._config || !this._config.entity) {
      return null;
    }
    // Füge "_config" an die Entity-ID an
    // z.B. "input_text.arbeitszeiten" -> "input_text.arbeitszeiten_config"
    return this._config.entity + '_config';
  }
  getStatusEntityId() {
    // Leite die Status-Entity-ID aus der Haupt-Entity ab
    if (!this._config || !this._config.entity) {
      return null;
    }
    // Füge "_status" an die Entity-ID an
    // z.B. "input_text.arbeitszeiten" -> "input_text.arbeitszeiten_status"
    return this._config.entity + '_status';
  }
  checkConfigEntity() {
    // Warnungen nur bei text_entity Modus (bei Saver wird Config anders gespeichert)
    if (this._config && this._config.store_mode === 'saver') {
      this._configWarning = null;
      this._updateConfigWarningDirectly();
      return;
    }

    // Prüfe ob die Config-Entity existiert
    if (!this._config || !this._config.entity) {
      this._configWarning = null;
      this._updateConfigWarningDirectly();
      return;
    }
    const configEntityId = this.getConfigEntityId();
    if (!configEntityId) {
      this._configWarning = null;
      this._updateConfigWarningDirectly();
      return;
    }

    // Wenn kein hass vorhanden ist (z.B. im Editor), zeige Warnung im Editor-Modus
    if (!this._hass || !this._hass.states) {
      if (this._isInEditorMode()) {
        this._configWarning = {
          show: true,
          type: 'missing',
          configEntityId: configEntityId
        };
      } else {
        this._configWarning = null;
      }
      this._updateConfigWarningDirectly();
      return;
    }
    const configEntity = this._hass.states[configEntityId];
    if (!configEntity) {
      this._configWarning = {
        show: true,
        type: 'missing',
        configEntityId: configEntityId
      };
    } else {
      // Prüfe ob es eine Größen-Warnung gibt, die beibehalten werden soll
      if (this._configWarning && this._configWarning.type === 'size') {
        // Behalte die Größen-Warnung
      } else {
        this._configWarning = null;
      }
    }
    this._updateConfigWarningDirectly();
  }

  // Rendert eine Warnung für eine fehlende Entity
  _renderMissingEntityWarning(entityId, entityName, maxLength = 255, isConfig = false) {
    const entityNameShort = entityId.replace('input_text.', '');
    return (0,lit__WEBPACK_IMPORTED_MODULE_0__.html)`
      <div class="storage-warning">
        <div class="warning-icon">⚠️</div>
        <div class="warning-content">
          <div class="warning-title">${entityName} fehlt!</div>
          <div class="warning-message">
            Die Entity <code>${entityId}</code> wurde nicht gefunden.
          </div>
          <div class="warning-action">
            Bitte legen Sie diese Entity über die UI an:
            <ul>
              <li>Einstellungen → Automatisierungen &amp; Szenen → Hilfsmittel</li>
              <li>Hinzufügen → Text</li>
              <li>Name: <code>${entityNameShort}</code></li>
              <li>Maximale Länge: <code>${maxLength}</code> Zeichen</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  }
  checkStatusEntity() {
    // Warnungen nur bei text_entity Modus (bei Saver wird Status anders gespeichert)
    if (this._config && this._config.store_mode === 'saver') {
      this._statusWarning = null;
      this._updateStatusWarningDirectly();
      return;
    }

    // Prüfe ob die Status-Entity existiert
    if (!this._config || !this._config.entity) {
      this._statusWarning = null;
      this._updateStatusWarningDirectly();
      return;
    }
    const statusEntityId = this.getStatusEntityId();
    if (!statusEntityId) {
      this._statusWarning = null;
      this._updateStatusWarningDirectly();
      return;
    }

    // Wenn kein hass vorhanden ist (z.B. im Editor), zeige Warnung im Editor-Modus
    if (!this._hass || !this._hass.states) {
      if (this._isInEditorMode()) {
        this._statusWarning = {
          show: true,
          type: 'missing',
          statusEntityId: statusEntityId
        };
      } else {
        this._statusWarning = null;
      }
      this._updateStatusWarningDirectly();
      return;
    }
    const statusEntity = this._hass.states[statusEntityId];
    if (!statusEntity) {
      this._statusWarning = {
        show: true,
        type: 'missing',
        statusEntityId: statusEntityId
      };
    } else {
      this._statusWarning = null;
    }
    this._updateStatusWarningDirectly();
  }

  // Erstellt die Config-Daten im komprimierten Format (für text_input Entities)
  _createCompressedConfig(activeShifts) {
    // Speichere als JSON (direktes Array, kein Objekt-Wrapper)
    let configJson = JSON.stringify(activeShifts);

    // Entferne die äußere Klammer (erstes [ und letztes ])
    if (configJson.startsWith('[') && configJson.endsWith(']')) {
      configJson = configJson.slice(1, -1);
    }

    // Entferne "null" aus dem String (behalte Kommas)
    // Wiederhole die Ersetzung, bis keine null mehr vorhanden sind (für mehrere null hintereinander)
    let previousLength;
    do {
      previousLength = configJson.length;
      // Ersetze ,null, durch ,, (mehrfach, bis keine null mehr vorhanden sind)
      configJson = configJson.replace(/,null,/g, ',,');
      // Ersetze ,null] durch ,] (falls am Ende eines Arrays)
      configJson = configJson.replace(/,null\]/g, ',]');
      // Ersetze [null, durch [, (falls am Anfang eines Arrays)
      configJson = configJson.replace(/\[null,/g, '[,');
      // Ersetze ,null, am Ende des Strings (falls letztes Element null ist)
      configJson = configJson.replace(/,null$/g, ',');
    } while (configJson.length !== previousLength);

    // Entferne Anführungszeichen um Strings
    // Ersetze "," durch , (Anführungszeichen um Kommas)
    configJson = configJson.replace(/","/g, ',');
    // Ersetze [" durch [ (Anführungszeichen am Anfang eines Arrays)
    configJson = configJson.replace(/\["/g, '[');
    // Ersetze "] durch ] (Anführungszeichen am Ende eines Arrays)
    configJson = configJson.replace(/"\]/g, ']');
    // Ersetze ," durch , (Anführungszeichen nach Komma)
    configJson = configJson.replace(/,"/g, ',');
    // Ersetze ", durch , (Anführungszeichen vor Komma)
    configJson = configJson.replace(/",/g, ',');
    return configJson;
  }

  // Erstellt die Config-Daten im vollständigen JSON-Format (für Saver)
  _createFullJsonConfig(activeShifts) {
    // Vollständiges JSON-Format: Objekt mit shifts, setup und lastchange
    // Format: {shifts:[], setup:{}, lastchange:123456789}
    const configObject = {
      shifts: activeShifts,
      setup: {
        timer_entity: this._config?.entity || '',
        store_mode: this._config?.store_mode || 'saver'
      },
      lastchange: Math.floor(Date.now() / 1000) // Unix-Timestamp (Sekunden seit 1970-01-01)
    };
    return JSON.stringify(configObject);
  }
  async saveConfigToEntity() {
    this._debug('[Config] saveConfigToEntity: === START: Speichere Konfiguration ===');

    // Speichere die Konfiguration in der Config-Entity oder im Saver
    // Verhindere Speichern beim initialen Load
    if (this._isInitialLoad) {
      this._debug('[Config] saveConfigToEntity: Initialer Load, überspringe Config-Speichern');
      return;
    }
    if (!this._hass || !this._config || !this._config.entity) {
      this._debug('[Config] saveConfigToEntity: Abbruch - hass, config oder entity fehlt', {
        hasHass: !!this._hass,
        hasConfig: !!this._config,
        hasEntity: !!(this._config && this._config.entity)
      });
      return;
    }
    this._debug('[Config] saveConfigToEntity: Prüfe Konfiguration', {
      store_mode: this._config.store_mode,
      saver_key: this._config.saver_key,
      entity: this._config.entity,
      calendars_count: this._config.calendars ? this._config.calendars.length : 0
    });

    // Debug: Zeige alle empfangenen Kalender-Daten
    if (this._config.calendars && this._config.calendars.length > 0) {
      this._debug('[Config] saveConfigToEntity: Empfangene Kalender-Daten:', JSON.stringify(this._config.calendars, null, 2));
      this._config.calendars.forEach((cal, index) => {
        this._debug(`[Config] saveConfigToEntity: Kalender ${index + 1}:`, {
          shortcut: cal.shortcut,
          name: cal.name,
          color: cal.color,
          enabled: cal.enabled,
          statusRelevant: cal.statusRelevant,
          timeRanges_count: cal.timeRanges ? cal.timeRanges.length : 0,
          timeRanges: cal.timeRanges || []
        });
      });
    } else {
      this._debug('[Config] saveConfigToEntity: Keine Kalender-Daten vorhanden');
    }

    // Verwende direkt das calendars-Format vom Config-Panel (keine Konvertierung mehr nötig)
    const calendars = this._config.calendars || [];
    this._debug(`[Config] saveConfigToEntity: Speichere ${calendars.length} Kalender im neuen Format (direkt vom Config-Panel)`);

    // Debug: Zeige alle Kalender-Daten
    calendars.forEach((cal, index) => {
      this._debug(`[Config] saveConfigToEntity: Kalender ${index + 1}:`, {
        shortcut: cal.shortcut,
        name: cal.name,
        color: cal.color,
        enabled: cal.enabled,
        statusRelevant: cal.statusRelevant,
        timeRanges_count: cal.timeRanges ? cal.timeRanges.length : 0,
        timeRanges: cal.timeRanges || []
      });
    });

    // Stelle sicher, dass Storage initialisiert ist
    if (!this._storage) {
      this._debug('[Config] saveConfigToEntity: Storage nicht initialisiert, initialisiere...');
      this._initializeStorage();
    }
    if (!this._storage) {
      this._debug('[Config] saveConfigToEntity: Kein Storage-Adapter verfügbar');
      return;
    }
    this._debug('[Config] saveConfigToEntity: Storage-Adapter gefunden, starte Speichern...', {
      storageType: this._config.store_mode,
      storageAdapter: this._storage.constructor.name
    });
    try {
      // Verwende Storage-Adapter zum Speichern der Config
      // Für Saver: Direkt calendars-Format verwenden
      // Für Entity: Konvertierung zu komprimiertem Format (bleibt unverändert)
      this._debug('[Config] saveConfigToEntity: Rufe _storage.saveConfig() auf...');
      if (this._config.store_mode === 'saver') {
        // Saver: Direkt calendars-Format verwenden
        await this._storage.saveConfig(calendars);
      } else {
        // Entity: Konvertierung zu komprimiertem Format (für Rückwärtskompatibilität)
        // TODO: Könnte später auch auf calendars-Format umgestellt werden
        const allShifts = this._convertCalendarsToShifts(calendars);
        await this._storage.saveConfig(allShifts);
      }

      // Aktualisiere Warnungen
      this._updateWarnings();
      this._debug('[Config] saveConfigToEntity: === ENDE: Erfolgreich gespeichert ===');
    } catch (error) {
      // Fehler beim Schreiben - versuche Fallback
      this._debug(`[Config] saveConfigToEntity: === FEHLER === Beim Schreiben: ${error.message}`, error);

      // Fallback: Wenn SaverStorage fehlschlägt, versuche EntityStorage
      if (this._config.store_mode === 'saver') {
        this._debug('[Config] saveConfigToEntity: Fallback zu EntityStorage');
        try {
          const fallbackStorage = _storage_storage_factory_js__WEBPACK_IMPORTED_MODULE_3__.StorageFactory.createStorage(this._hass, {
            ...this._config,
            store_mode: 'text_entity'
          }, this._debug.bind(this));
          // Entity-Storage benötigt komprimiertes Format
          const allShifts = this._convertCalendarsToShifts(calendars);
          await fallbackStorage.saveConfig(allShifts);
          this._updateWarnings();
        } catch (fallbackError) {
          this._debug(`[Config] saveConfigToEntity: Auch Fallback fehlgeschlagen: ${fallbackError.message}`, fallbackError);
          this.checkConfigEntity();
        }
      } else {
        this.checkConfigEntity();
      }
    }
  }

  /**
   * Konvertiert calendars-Format zu komprimiertem shifts-Format (für Entity-Storage)
   * @private
   */
  _convertCalendarsToShifts(calendars) {
    const allShifts = [];
    if (calendars && Array.isArray(calendars)) {
      for (const calendar of calendars) {
        if (calendar && calendar.shortcut) {
          const isEnabled = calendar.enabled === true || calendar.enabled === 'true' || calendar.enabled === 1;
          const shiftData = [calendar.shortcut, calendar.name || `Schicht ${calendar.shortcut.toUpperCase()}`];

          // Konvertiere Zeiträume vom neuen Format zu altem Format
          if (calendar.timeRanges && Array.isArray(calendar.timeRanges) && calendar.timeRanges.length > 0) {
            // Zeitraum 1
            const range1 = calendar.timeRanges[0];
            let start1 = null;
            let end1 = null;
            if (range1) {
              if (typeof range1 === 'object' && range1.times && Array.isArray(range1.times)) {
                start1 = range1.times[0] && range1.times[0].trim() !== '' ? range1.times[0].trim() : null;
                end1 = range1.times[1] && range1.times[1].trim() !== '' ? range1.times[1].trim() : null;
              } else if (Array.isArray(range1) && range1.length >= 2) {
                start1 = range1[0] && range1[0].trim() !== '' ? range1[0].trim() : null;
                end1 = range1[1] && range1[1].trim() !== '' ? range1[1].trim() : null;
              }
            }
            shiftData.push(start1, end1);

            // Zeitraum 2
            const range2 = calendar.timeRanges[1];
            let start2 = null;
            let end2 = null;
            if (range2) {
              if (typeof range2 === 'object' && range2.times && Array.isArray(range2.times)) {
                start2 = range2.times[0] && range2.times[0].trim() !== '' ? range2.times[0].trim() : null;
                end2 = range2.times[1] && range2.times[1].trim() !== '' ? range2.times[1].trim() : null;
              } else if (Array.isArray(range2) && range2.length >= 2) {
                start2 = range2[0] && range2[0].trim() !== '' ? range2[0].trim() : null;
                end2 = range2[1] && range2[1].trim() !== '' ? range2[1].trim() : null;
              }
            }
            shiftData.push(start2, end2);
          } else {
            shiftData.push(null, null, null, null);
          }

          // statusRelevant
          const statusRelevant = calendar.statusRelevant !== false ? 1 : 0;
          shiftData.push(statusRelevant);

          // enabled
          const enabled = isEnabled ? 1 : 0;
          shiftData.push(enabled);
          allShifts.push(shiftData);
        }
      }
    }
    return allShifts;
  }
  async _saveConfigToEntityFallback(activeShifts) {
    const configEntityId = this.getConfigEntityId();
    if (!configEntityId) {
      this._debug('[Config] _saveConfigToEntityFallback: Keine configEntityId');
      return;
    }
    this._debug(`[Config] _saveConfigToEntityFallback: Start, configEntityId: "${configEntityId}"`);

    // Prüfe ob die Entity existiert
    const configEntity = this._hass.states[configEntityId];
    if (!configEntity) {
      // Entity existiert nicht, zeige Warnung
      this._debug(`[Config] _saveConfigToEntityFallback: Entity "${configEntityId}" existiert nicht`);
      this.checkConfigEntity();
      return;
    }

    // Komprimiertes Format für text_input Entities
    const configJson = this._createCompressedConfig(activeShifts);
    const configJsonLength = configJson.length;
    this._debug(`[Config] _saveConfigToEntityFallback: Config erstellt (komprimiert), Länge: ${configJsonLength} Zeichen`);

    // Prüfe ob der JSON-Text in das Entity passt
    const maxLength = this.getEntityMaxLength(configEntityId);
    if (maxLength !== null && configJsonLength > maxLength) {
      // JSON ist zu lang, zeige Warnung
      const percentage = configJsonLength / maxLength * 100;
      this._configWarning = {
        show: true,
        type: 'size',
        configEntityId: configEntityId,
        currentLength: configJsonLength,
        maxLength: maxLength,
        percentage: Math.round(percentage * 10) / 10
      };
      this._updateConfigWarningDirectly();
      return;
    }
    try {
      this._debug(`[Config] _saveConfigToEntityFallback: Schreibe Config in Entity "${configEntityId}"`);
      await this._hass.callService('input_text', 'set_value', {
        entity_id: configEntityId,
        value: configJson
      });
      this._debug(`[Config] _saveConfigToEntityFallback: Erfolgreich in Entity geschrieben`);
      // Warnung entfernen, da Entity existiert und erfolgreich beschrieben wurde
      this._configWarning = null;
      this._updateConfigWarningDirectly();
    } catch (error) {
      // Fehler beim Schreiben - könnte bedeuten, dass Entity nicht existiert
      this._debug(`[Config] _saveConfigToEntityFallback: Fehler beim Schreiben in Entity: ${error.message}`, error);
      this.checkConfigEntity();
    }
  }
  serializeWorkingDays() {
    const parts = [];
    // Sortiere nach Jahr:Monat
    const keys = Object.keys(this._workingDays).sort((a, b) => {
      const [yearA, monthA] = a.split(':').map(x => parseInt(x));
      const [yearB, monthB] = b.split(':').map(x => parseInt(x));
      if (yearA !== yearB) return yearA - yearB;
      return monthA - monthB;
    });
    for (const key of keys) {
      const days = this._workingDays[key];
      if (!days || typeof days !== 'object' || Array.isArray(days)) continue;

      // Struktur: {day: [elements]}
      const dayEntries = Object.keys(days).map(d => parseInt(d)).filter(d => !isNaN(d)).sort((a, b) => a - b);
      if (dayEntries.length > 0) {
        // Format: <jahr>:<monat>:<tag><elementen>,<tag><elementen>
        // Beispiel: "25:11:01a,02ab,03b"
        const formattedDays = dayEntries.map(dayNum => {
          const elements = days[dayNum];
          const dayStr = this.formatTwoDigits(dayNum);
          if (Array.isArray(elements) && elements.length > 0) {
            // Sortiere die Kalender-Shortcuts alphabetisch (a, b, c, d, e) für konsistente Reihenfolge
            const sortedElements = [...elements].sort();
            // Tag mit Elementen: "01a", "02ab", etc.
            return dayStr + sortedElements.join('');
          } else {
            // Tag ohne Elemente
            return dayStr;
          }
        }).join(',');
        parts.push(`${key}:${formattedDays}`);
      }
    }
    return parts.join(';');
  }
  async distributeDataToEntities(serializedData) {
    if (!this._hass || !this._config || !this._config.entity) {
      this._debug('[Speichern] distributeDataToEntities: Kein hass, config oder entity vorhanden');
      return;
    }
    this._debug(`[Speichern] distributeDataToEntities: Start, Datenlänge: ${serializedData ? serializedData.length : 0} Zeichen`);

    // Setze Schreib-Lock
    this._isWriting = true;
    this._debug('[Speichern] distributeDataToEntities: Schreib-Lock gesetzt');

    // Lösche vorhandenen Timer, falls vorhanden
    if (this._writeLockTimer) {
      clearTimeout(this._writeLockTimer);
      this._writeLockTimer = null;
    }
    try {
      // Verwende die gecachte Liste der Entities, falls verfügbar
      // Prüfe aber auch, ob neue Entities hinzugekommen sind
      let allEntityIds;
      if (this._knownEntityIds && this._knownEntityIds.length > 0) {
        // Verwende gecachte Liste
        allEntityIds = [...this._knownEntityIds];

        // Prüfe ob neue Entities hinzugekommen sind
        const currentAdditionalEntities = this.findAdditionalEntities(this._config.entity);
        const knownAdditionalCount = this._knownEntityIds.length - 1; // -1 für Haupt-Entity
        if (currentAdditionalEntities.length > knownAdditionalCount) {
          // Neue Entities gefunden, aktualisiere die Liste
          const newEntities = currentAdditionalEntities.slice(knownAdditionalCount);
          allEntityIds.push(...newEntities);
          this._knownEntityIds = [...allEntityIds];
        }
      } else {
        // Keine gecachte Liste vorhanden, sammle Entities neu
        allEntityIds = [this._config.entity];
        const additionalEntities = this.findAdditionalEntities(this._config.entity);
        allEntityIds.push(...additionalEntities);
        this._knownEntityIds = [...allEntityIds];
      }
      this._debug(`[Speichern] distributeDataToEntities: Verwende ${allEntityIds.length} Entities: ${allEntityIds.join(', ')}`);

      // Ermittle die maximale Länge für jede Entity
      const maxLengths = {};
      let totalMaxLength = 0;
      for (const entityId of allEntityIds) {
        const maxLength = this.getEntityMaxLength(entityId);
        if (maxLength !== null) {
          maxLengths[entityId] = maxLength;
          totalMaxLength += maxLength;
        } else {
          // Wenn keine max-Länge bekannt ist, verwende einen Standardwert (z.B. 255)
          maxLengths[entityId] = 255;
          totalMaxLength += 255;
        }
      }

      // Debug: Zeige wie viele Zeichen wir schreiben wollen vs. können
      const dataLength = serializedData ? serializedData.length : 0;
      this._debug(`[Speichern] distributeDataToEntities: Datenlänge: ${dataLength} Zeichen, verfügbarer Speicher: ${totalMaxLength} Zeichen`);

      // Wenn keine Daten vorhanden sind, setze alle Entities auf leer
      if (!serializedData || serializedData.trim() === '') {
        this._debug('[Speichern] distributeDataToEntities: Keine Daten vorhanden, setze alle Entities auf leer');
        for (const entityId of allEntityIds) {
          try {
            await this._hass.callService('input_text', 'set_value', {
              entity_id: entityId,
              value: ''
            });
            this._debug(`[Speichern] distributeDataToEntities: Entity "${entityId}" auf leer gesetzt`);
          } catch (error) {
            this._debug(`[Speichern] distributeDataToEntities: Fehler beim Leeren von "${entityId}": ${error.message}`);
          }
        }
        // Setze Timer auch wenn keine Daten vorhanden waren
        this._writeLockTimer = setTimeout(() => {
          this._isWriting = false;
          this._writeLockTimer = null;
          this._debug('[Speichern] distributeDataToEntities: Schreib-Lock nach 5 Sekunden entfernt (keine Daten)');
        }, 5000);
        return;
      }

      // Verteile die Daten zeichenweise auf die Entities (umgekehrt zum Einlesen)
      // Wir haben einen Datenstring über alles und schreiben nur so viele Zeichen wie aufgenommen werden können
      const entityValues = {};
      let currentEntityIndex = 0;
      let remainingData = serializedData;

      // Verteile die Daten auf die verfügbaren Entities
      while (remainingData.length > 0 && currentEntityIndex < allEntityIds.length) {
        const currentEntityId = allEntityIds[currentEntityIndex];
        const maxLength = maxLengths[currentEntityId];

        // Nimm so viele Zeichen wie möglich aus remainingData
        const charsToTake = Math.min(remainingData.length, maxLength);
        const valueToWrite = remainingData.substring(0, charsToTake);
        entityValues[currentEntityId] = valueToWrite;
        remainingData = remainingData.substring(charsToTake);

        // Wenn noch Daten übrig sind, wechsle zur nächsten Entity
        if (remainingData.length > 0) {
          currentEntityIndex++;
        }
      }

      // Wenn am Ende noch Text über ist, prüfe ob zwischenzeitlich eine zusätzliche Entität angelegt wurde
      if (remainingData.length > 0) {
        // Prüfe ob neue Entities hinzugekommen sind
        const currentAdditionalEntities = this.findAdditionalEntities(this._config.entity);
        const knownAdditionalCount = this._knownEntityIds ? this._knownEntityIds.length - 1 : 0; // -1 für Haupt-Entity

        if (currentAdditionalEntities.length > knownAdditionalCount) {
          // Neue Entities gefunden
          const newEntities = currentAdditionalEntities.slice(knownAdditionalCount);

          // Aktualisiere die Liste
          allEntityIds.push(...newEntities);
          this._knownEntityIds = [...allEntityIds];

          // Ermittle max-Längen für neue Entities
          for (const newEntityId of newEntities) {
            const maxLength = this.getEntityMaxLength(newEntityId);
            if (maxLength !== null) {
              maxLengths[newEntityId] = maxLength;
            } else {
              maxLengths[newEntityId] = 255;
            }
          }

          // Verteile die verbleibenden Daten auf die neuen Entities
          currentEntityIndex = allEntityIds.length - newEntities.length;
          while (remainingData.length > 0 && currentEntityIndex < allEntityIds.length) {
            const currentEntityId = allEntityIds[currentEntityIndex];
            const maxLength = maxLengths[currentEntityId];
            const charsToTake = Math.min(remainingData.length, maxLength);
            const valueToWrite = remainingData.substring(0, charsToTake);
            entityValues[currentEntityId] = valueToWrite;
            remainingData = remainingData.substring(charsToTake);
            if (remainingData.length > 0) {
              currentEntityIndex++;
            }
          }
        } else {}
      }

      // Schreibe die Werte in die Entities (sequenziell, um sicherzustellen, dass alle Calls abgeschlossen sind)
      this._debug(`[Speichern] distributeDataToEntities: Schreibe in ${allEntityIds.length} Entities`);
      for (const entityId of allEntityIds) {
        const value = entityValues[entityId] || '';
        const maxLength = maxLengths[entityId];

        // Der Wert sollte nie die maximale Länge überschreiten, da wir zeichenweise verteilen
        if (value.length > maxLength) {
          // Kürze den Wert auf die maximale Länge (als Notfall-Lösung)
          const truncatedValue = value.substring(0, maxLength);
          this._debug(`[Speichern] distributeDataToEntities: Schreibe in "${entityId}" (gekürzt von ${value.length} auf ${truncatedValue.length} Zeichen)`);
          try {
            await this._hass.callService('input_text', 'set_value', {
              entity_id: entityId,
              value: truncatedValue
            });
            this._debug(`[Speichern] distributeDataToEntities: Erfolgreich in "${entityId}" geschrieben`);
          } catch (error) {
            this._debug(`[Speichern] distributeDataToEntities: Fehler beim Schreiben in "${entityId}": ${error.message}`);
          }
        } else {
          this._debug(`[Speichern] distributeDataToEntities: Schreibe in "${entityId}" (${value.length} Zeichen)`);
          try {
            await this._hass.callService('input_text', 'set_value', {
              entity_id: entityId,
              value: value
            });
            this._debug(`[Speichern] distributeDataToEntities: Erfolgreich in "${entityId}" geschrieben`);
          } catch (error) {
            this._debug(`[Speichern] distributeDataToEntities: Fehler beim Schreiben in "${entityId}": ${error.message}`);
          }
        }
      }

      // Leere alle zusätzlichen Entities, die nicht verwendet wurden (um alte Daten zu entfernen)
      // Wir müssen alle bekannten zusätzlichen Entities prüfen, nicht nur die in allEntityIds
      const allAdditionalEntities = this.findAdditionalEntities(this._config.entity);
      this._debug(`[Speichern] distributeDataToEntities: Prüfe ${allAdditionalEntities.length} zusätzliche Entities zum Leeren`);
      for (const additionalEntityId of allAdditionalEntities) {
        // Wenn diese Entity nicht in entityValues ist, bedeutet das, dass sie nicht verwendet wurde
        if (!(additionalEntityId in entityValues)) {
          this._debug(`[Speichern] distributeDataToEntities: Leere nicht verwendete Entity "${additionalEntityId}"`);
          try {
            await this._hass.callService('input_text', 'set_value', {
              entity_id: additionalEntityId,
              value: ''
            });
            this._debug(`[Speichern] distributeDataToEntities: Entity "${additionalEntityId}" erfolgreich geleert`);
          } catch (error) {
            this._debug(`[Speichern] distributeDataToEntities: Fehler beim Leeren von "${additionalEntityId}": ${error.message}`);
          }
        }
      }

      // Wenn noch Daten übrig sind, die nicht gespeichert werden konnten
      if (remainingData.length > 0) {
        this._debug(`[Speichern] distributeDataToEntities: WARNUNG - ${remainingData.length} Zeichen konnten nicht gespeichert werden!`);
      }
    } catch (error) {
      this._debug(`[Speichern] distributeDataToEntities: Fehler beim Verteilen der Daten: ${error.message}`, error);
    } finally {
      // Schreib-Lock für weitere 5 Sekunden aufrechterhalten (um sicherzustellen, dass alle Updates verarbeitet wurden)
      this._writeLockTimer = setTimeout(() => {
        this._isWriting = false;
        this._writeLockTimer = null;
        this._debug('[Speichern] distributeDataToEntities: Schreib-Lock nach 5 Sekunden entfernt');
      }, 5000);
      this._debug('[Speichern] distributeDataToEntities: Abgeschlossen, Schreib-Lock wird in 5 Sekunden entfernt');
    }
  }
  async toggleDay(month, day, year = null) {
    // Stelle sicher, dass month und day Zahlen sind
    const monthNum = parseInt(month);
    const dayNum = parseInt(day);
    if (isNaN(monthNum) || isNaN(dayNum)) {
      return;
    }

    // Prüfe ob dieser Monat der Vormonat ist (schreibgeschützt)
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYearFull = now.getFullYear();
    const currentYear = currentYearFull % 100;

    // Bestimme das Jahr (Kurzform, z.B. 25 für 2025)
    if (!year) {
      year = currentYear;
    }
    const yearNum = parseInt(year);
    let isPreviousMonth = false;
    if (currentMonth === 1) {
      // Aktuell ist Januar, Vormonat ist Dezember des Vorjahres
      isPreviousMonth = monthNum === 12 && yearNum === (currentYearFull - 1) % 100;
    } else {
      // Vormonat ist aktueller Monat - 1 im gleichen Jahr
      isPreviousMonth = monthNum === currentMonth - 1 && yearNum === currentYear;
    }
    if (isPreviousMonth) {
      return;
    }
    if (!this._hass || !this._config || !this._config.entity) {
      return;
    }

    // yearNum wurde bereits oben deklariert
    const key = `${this.formatTwoDigits(yearNum)}:${this.formatTwoDigits(monthNum)}`;

    // Stelle sicher, dass die Struktur ein Objekt ist (nicht Array)
    if (!this._workingDays[key] || Array.isArray(this._workingDays[key])) {
      this._workingDays[key] = {};
    }

    // Hole das ausgewählte Kalender-Shortcut
    const selectedCalendarShortcut = this._getSelectedCalendarShortcut();
    if (!selectedCalendarShortcut) {
      // Kein Kalender ausgewählt - kann nicht togglen
      return;
    }

    // Tag mit Kalender
    if (!this._workingDays[key][dayNum]) {
      this._workingDays[key][dayNum] = [];
    }

    // WICHTIG: Erstelle eine Kopie des Arrays, um sicherzustellen, dass wir mit dem richtigen Array arbeiten
    const elements = [...(this._workingDays[key][dayNum] || [])];
    const elementIndex = elements.indexOf(selectedCalendarShortcut);

    // MARKIERE BUTTON ALS "WIRD DIREKT AKTUALISIERT" BEVOR _workingDays GEÄNDERT WIRD
    // Dies verhindert, dass Lit ein Update auslöst, während wir direkt manipulieren
    const buttonKey = `${yearNum}:${monthNum}:${dayNum}`;
    this._directDOMUpdateInProgress.add(buttonKey);
    let finalElements = [];
    if (elementIndex > -1) {
      // Kalender entfernen
      elements.splice(elementIndex, 1);
      // Speichere die finalen Elemente BEVOR wir möglicherweise den Monat löschen
      finalElements = elements;
      // Wenn keine Kalender mehr vorhanden sind, entferne den Tag
      if (elements.length === 0) {
        delete this._workingDays[key][dayNum];
        // Wenn keine Tage mehr vorhanden sind, entferne den Monat
        if (Object.keys(this._workingDays[key]).length === 0) {
          delete this._workingDays[key];
        }
      } else {
        // Aktualisiere das Array im _workingDays
        this._workingDays[key][dayNum] = elements;
      }
    } else {
      // Kalender hinzufügen (nur wenn noch nicht vorhanden)
      if (!elements.includes(selectedCalendarShortcut)) {
        elements.push(selectedCalendarShortcut);
        // Aktualisiere das Array im _workingDays
        this._workingDays[key][dayNum] = elements;
      }
      // Speichere die finalen Elemente
      finalElements = this._workingDays[key] && this._workingDays[key][dayNum] ? this._workingDays[key][dayNum] : elements;
    }

    // OPTIMIERUNG: Direkte DOM-Manipulation statt komplettes Re-Rendering
    // Verwende die finalen elements (bereits vor dem möglichen Löschen gespeichert)
    this._updateDayButtonDirectly(monthNum, dayNum, yearNum, key, finalElements);

    // OPTIMIERUNG: Debounced Speichern - warte nach dem letzten Klick, bevor gespeichert wird
    this._scheduleDebouncedSave();
  }

  // Plant ein debounced Speichern der Daten
  _scheduleDebouncedSave() {
    // Lese Debounce-Zeit aus der Config (Standard: 300ms)
    const debounceTime = this._getSaveDebounceTime();

    // Wenn Debounce-Zeit 0 ist, speichere sofort
    if (debounceTime === 0) {
      this._saveToHA();
      return;
    }

    // Lösche vorhandenen Timer
    if (this._saveDebounceTimer) {
      clearTimeout(this._saveDebounceTimer);
      this._saveDebounceTimer = null;
    }

    // Setze neuen Timer
    this._saveDebounceTimer = setTimeout(() => {
      this._saveDebounceTimer = null;
      this._saveToHA();
    }, debounceTime);
  }

  // Speichert die Daten asynchron in Home Assistant
  async _saveToHA() {
    try {
      this._debug('[Speichern] _saveToHA: Start');

      // Stelle sicher, dass Storage initialisiert ist
      if (!this._storage) {
        this._initializeStorage();
      }
      if (!this._storage) {
        this._debug('[Speichern] _saveToHA: Kein Storage-Adapter verfügbar');
        return;
      }
      const serializedData = this.serializeWorkingDays();
      this._debug(`[Speichern] _saveToHA: Daten serialisiert, Länge: ${serializedData.length} Zeichen, store_mode: "${this._config.store_mode}"`);

      // Setze Schreib-Lock
      this._isWriting = true;
      if (this._writeLockTimer) {
        clearTimeout(this._writeLockTimer);
      }
      try {
        // Verwende Storage-Adapter zum Speichern
        await this._storage.saveData(serializedData);

        // Prüfe Speicherverbrauch (nur für EntityStorage relevant)
        const storageUsage = this._storage.checkStorageUsage(serializedData.length);
        if (storageUsage) {
          this._storageWarning = storageUsage;
          this._updateStorageWarningDirectly();
        } else {
          this._storageWarning = null;
          this._updateStorageWarningDirectly();
        }
        this._debug('[Speichern] _saveToHA: Erfolgreich abgeschlossen');
      } catch (error) {
        // Fehler beim Speichern - versuche Fallback
        this._debug(`[Speichern] _saveToHA: Fehler beim Speichern, versuche Fallback: ${error.message}`, error);

        // Fallback: Wenn SaverStorage fehlschlägt, versuche EntityStorage
        if (this._config.store_mode === 'saver') {
          this._debug('[Speichern] _saveToHA: Fallback zu EntityStorage');
          const fallbackStorage = _storage_storage_factory_js__WEBPACK_IMPORTED_MODULE_3__.StorageFactory.createStorage(this._hass, {
            ...this._config,
            store_mode: 'text_entity'
          }, this._debug.bind(this));
          await fallbackStorage.saveData(serializedData);
        } else {
          throw error; // Bei EntityStorage gibt es keinen Fallback
        }
      } finally {
        // Setze Timer für Schreib-Lock (5 Sekunden)
        this._writeLockTimer = setTimeout(() => {
          this._isWriting = false;
          this._writeLockTimer = null;
          this._debug('[Speichern] _saveToHA: Schreib-Lock entfernt');
        }, 5000);
      }
    } catch (error) {
      this._debug(`[Speichern] _saveToHA: Fehler beim Speichern: ${error.message}`, error);
      console.error('[TG Schichtplan] Fehler beim Speichern:', error);
      // Optional: Hier könnte man eine Fehlermeldung anzeigen
    }
  }

  // Speichert Daten in den Saver
  async _saveDataToSaver(serializedData) {
    if (!this._hass || !this._config || !this._config.saver_key) {
      this._debug('[Speichern] _saveDataToSaver: Kein hass, config oder saver_key vorhanden');
      return;
    }
    const saverKey = this._config.saver_key || 'Schichtplan';
    this._debug(`[Speichern] _saveDataToSaver: Start, saver_key: "${saverKey}", Datenlänge: ${serializedData.length} Zeichen`);
    try {
      // Prüfe ob die Saver-Variable existiert und ob sich der Wert geändert hat
      // Saver-Variablen sind in saver.saver.attributes.variables gespeichert
      const saverEntity = this._hass?.states?.['saver.saver'];
      let oldValue = '';
      if (saverEntity && saverEntity.attributes && saverEntity.attributes.variables) {
        const existingValue = saverEntity.attributes.variables[saverKey];
        if (existingValue !== undefined && existingValue !== null) {
          oldValue = String(existingValue).trim();
        }
      }
      this._debug(`[Speichern] _saveDataToSaver: Saver-Variable "${saverKey}" existiert: ${oldValue !== ''}, alte Länge: ${oldValue.length} Zeichen`);

      // Nur schreiben wenn Variable nicht existiert oder Wert sich geändert hat
      if (oldValue === '' || oldValue !== serializedData) {
        this._debug(`[Speichern] _saveDataToSaver: Schreibe in Saver (Variable existiert nicht oder Wert hat sich geändert)`);
        await this._hass.callService('saver', 'set_variable', {
          name: saverKey,
          value: serializedData || ''
        });
        this._debug(`[Speichern] _saveDataToSaver: Erfolgreich in Saver geschrieben`);
      } else {
        this._debug(`[Speichern] _saveDataToSaver: Kein Schreiben nötig, Wert hat sich nicht geändert`);
      }
    } catch (error) {
      // Fehler beim Schreiben in Saver - Fallback zu Entities
      this._debug(`[Speichern] _saveDataToSaver: Fehler beim Schreiben in Saver, Fallback zu Entities: ${error.message}`, error);
      console.warn('[TG Schichtplan] Fehler beim Schreiben in Saver, Fallback zu Entities:', error);
      await this.distributeDataToEntities(serializedData);
    }
  }

  // Liest die Debounce-Zeit aus der Config
  _getSaveDebounceTime() {
    // Versuche aus Config zu lesen
    if (this._config && typeof this._config.saveDebounceTime === 'number') {
      return Math.max(0, this._config.saveDebounceTime); // Mindestens 0
    }

    // Fallback: Verwende Standard-Wert aus card-config.js
    return _card_config_js__WEBPACK_IMPORTED_MODULE_2__.SaveDebounceTime || 300; // Standard: 300ms
  }

  // Aktualisiert einen einzelnen Button direkt im DOM ohne komplettes Re-Rendering
  _updateDayButtonDirectly(monthNum, dayNum, yearNum, key, dayElements) {
    if (!this.shadowRoot) {
      // Shadow DOM noch nicht bereit, Fallback zu requestUpdate
      this.requestUpdate();
      return;
    }

    // Button sollte bereits in _directDOMUpdateInProgress sein (wurde in toggleDay gesetzt)
    // Falls nicht, füge ihn hinzu (Fallback für direkte Aufrufe)
    const buttonKey = `${yearNum}:${monthNum}:${dayNum}`;
    if (!this._directDOMUpdateInProgress.has(buttonKey)) {
      this._directDOMUpdateInProgress.add(buttonKey);
    }

    // Finde den Button im DOM
    const button = this.shadowRoot.querySelector(`button[data-month="${monthNum}"][data-day="${dayNum}"][data-year="${yearNum}"]`);
    if (!button) {
      // Button nicht gefunden, Fallback zu requestUpdate
      this._directDOMUpdateInProgress.delete(buttonKey);
      this.requestUpdate();
      return;
    }

    // Berechne die neuen Werte für diesen Button
    const selectedShortcut = this._getSelectedCalendarShortcut();
    const hasSelectedShift = selectedShortcut && dayElements.includes(selectedShortcut);
    const selectedCalendar = this._getCalendarByShortcut(selectedShortcut);

    // Finde die erste aktivierte Schicht
    let firstActiveShift = null;
    const shiftOrder = ['a', 'b', 'c', 'd', 'e'];
    for (const shortcut of shiftOrder) {
      if (dayElements.includes(shortcut)) {
        const calendar = this._getCalendarByShortcut(shortcut);
        if (calendar && calendar.enabled) {
          firstActiveShift = shortcut;
          break;
        }
      }
    }

    // Bestimme welche Schicht den Tag färben soll
    let activeShiftForColor = null;
    if (hasSelectedShift && selectedCalendar && selectedCalendar.enabled) {
      activeShiftForColor = selectedShortcut;
    } else if (firstActiveShift) {
      activeShiftForColor = firstActiveShift;
    }
    const isWorking = activeShiftForColor !== null;

    // Aktualisiere CSS-Klasse
    if (isWorking) {
      button.classList.add('working');
    } else {
      button.classList.remove('working');
    }

    // Aktualisiere Hintergrundfarbe
    if (activeShiftForColor) {
      const activeCalendar = this._getCalendarByShortcut(activeShiftForColor);
      if (activeCalendar && activeCalendar.color) {
        button.style.backgroundColor = activeCalendar.color;
      } else {
        button.style.backgroundColor = '';
      }
    } else {
      button.style.backgroundColor = '';
    }

    // Aktualisiere Shift-Indikatoren
    // Entferne zuerst alle vorhandenen Container und Indikatoren
    const existingContainer = button.querySelector('.shifts-container');
    if (existingContainer) {
      existingContainer.remove();
    }

    // Erstelle neue Indikatoren für alle Schichten außer der, die den Tag färbt
    const shiftIndicators = dayElements.filter(shortcut => shortcut !== activeShiftForColor).map(shortcut => {
      const calendar = this._getCalendarByShortcut(shortcut);
      if (calendar && calendar.enabled && calendar.color) {
        const indicator = document.createElement('span');
        indicator.className = 'shift-indicator';
        indicator.style.backgroundColor = calendar.color;
        indicator.title = calendar.name || `Schicht ${shortcut.toUpperCase()}`;
        return indicator;
      }
      return null;
    }).filter(indicator => indicator !== null);

    // Füge Indikatoren nur hinzu, wenn welche vorhanden sind
    if (shiftIndicators.length > 0) {
      const container = document.createElement('div');
      container.className = 'shifts-container';
      // Markiere Container als manuell erstellt, damit das Template sie nicht überschreibt
      container.setAttribute('data-manual-update', 'true');
      shiftIndicators.forEach(ind => container.appendChild(ind));
      button.appendChild(container);
    }

    // Entferne Markierung nach Abschluss der direkten DOM-Manipulation
    // Verzögert, damit Lit-Updates, die durch _workingDays-Änderung ausgelöst werden, übersprungen werden können
    setTimeout(() => {
      this._directDOMUpdateInProgress.delete(buttonKey);
    }, 100); // Länger warten, damit Lit-Updates abgeschlossen sind
  }
  getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
  }
  getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
  }
  getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  }
  getMonthName(month) {
    const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
    return months[month];
  }

  /**
   * Rendert einen einzelnen Tag-Button für den Kalender
   * @param {number} currentDay - Der Tag (1-31)
   * @param {number} monthKey - Der Monat (1-12)
   * @param {number} yearKey - Das Jahr in Kurzform (z.B. 25 für 2025)
   * @param {string} key - Der Schlüssel für diesen Monat (z.B. "25:11")
   * @param {number[]} workingDays - Array der Arbeitstage für diesen Monat
   * @param {boolean} isPreviousMonth - Ob dieser Monat der Vormonat ist (schreibgeschützt)
   * @param {number} year - Das vollständige Jahr
   * @param {number} month - Der Monat (0-11)
   * @returns {TemplateResult} HTML-Template für den Tag-Button
   */
  renderDay(currentDay, monthKey, yearKey, key, workingDays, isPreviousMonth, year, month) {
    const now = new Date();
    const today = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const dayElements = this._getDayElements(key, currentDay);
    const isToday = year === currentYear && month === currentMonth && currentDay === today;

    // Prüfe ob der ausgewählte Kalender an diesem Tag aktiv ist
    const selectedShortcut = this._getSelectedCalendarShortcut();
    const hasSelectedShift = selectedShortcut && dayElements.includes(selectedShortcut);
    const selectedCalendar = this._getCalendarByShortcut(selectedShortcut);
    let buttonStyle = '';

    // Finde die erste aktivierte Schicht (in der Reihenfolge a, b, c, d, e)
    // die an diesem Tag aktiv ist
    let firstActiveShift = null;
    const shiftOrder = ['a', 'b', 'c', 'd', 'e'];
    for (const shortcut of shiftOrder) {
      if (dayElements.includes(shortcut)) {
        const calendar = this._getCalendarByShortcut(shortcut);
        if (calendar && calendar.enabled) {
          firstActiveShift = shortcut;
          break;
        }
      }
    }

    // Bestimme welche Schicht den Tag färben soll
    let activeShiftForColor = null;
    if (hasSelectedShift && selectedCalendar && selectedCalendar.enabled) {
      // Wenn der ausgewählte Kalender aktiv ist, verwende diesen
      activeShiftForColor = selectedShortcut;
    } else if (firstActiveShift) {
      // Ansonsten verwende die erste aktivierte Schicht
      activeShiftForColor = firstActiveShift;
    }

    // isWorking ist true, wenn eine Schicht den Tag färbt
    const isWorking = activeShiftForColor !== null;

    // Verwende die Farbe der aktiven Schicht
    if (activeShiftForColor) {
      const activeCalendar = this._getCalendarByShortcut(activeShiftForColor);
      if (activeCalendar && activeCalendar.color) {
        buttonStyle = `background-color: ${activeCalendar.color};`;
      }
    }

    // Prüfe ob es ein Wochenende oder Feiertag ist
    const isWeekend = this._isWeekend(year, month, currentDay);
    const isHoliday = this._isHoliday(year, month, currentDay);

    // Erstelle visuelle Darstellung der Kalender (alle außer der Schicht, die den Tag färbt)
    // Nur aktivierte Kalender werden angezeigt
    const shiftIndicators = dayElements.filter(shortcut => shortcut !== activeShiftForColor) // Filtere die Schicht heraus, die den Tag färbt
    .map(shortcut => {
      const calendar = this._getCalendarByShortcut(shortcut);
      // Nur anzeigen, wenn der Kalender aktiviert ist
      if (calendar && calendar.enabled && calendar.color) {
        return (0,lit__WEBPACK_IMPORTED_MODULE_0__.html)`
            <span
              class="shift-indicator"
              style="background-color: ${calendar.color};"
              title="${calendar.name || `Schicht ${shortcut.toUpperCase()}`}"
            >
            </span>
          `;
      }
      return null; // Nicht anzeigen, wenn Kalender deaktiviert ist
    }).filter(indicator => indicator !== null); // Entferne null-Werte

    return (0,lit__WEBPACK_IMPORTED_MODULE_0__.html)`
      <td>
        <button
          class="day-button ${isWorking ? 'working' : ''} ${isToday ? 'today' : ''} ${isPreviousMonth ? 'readonly' : ''} ${isWeekend ? 'weekend' : ''} ${isHoliday ? 'holiday' : ''}"
          style="${buttonStyle}"
          @click=${e => {
      if (!isPreviousMonth) {
        this.toggleDay(monthKey, currentDay, yearKey);
        // Entferne Fokus nach Klick (wichtig für mobile Geräte)
        // Setze Fokus explizit auf die Karte selbst
        setTimeout(() => {
          e.target.blur();
          // Setze Fokus auf das Hauptcontainer-Element der Karte
          if (this.shadowRoot) {
            const wrapper = this.shadowRoot.querySelector('.calendar-wrapper');
            if (wrapper) {
              // Stelle sicher, dass das Element fokussierbar ist
              if (!wrapper.hasAttribute('tabindex')) {
                wrapper.setAttribute('tabindex', '-1');
              }
              wrapper.focus();
            } else {
              // Fallback: Setze Fokus auf die Komponente selbst
              if (this.focus) {
                this.focus();
              }
            }
          }
        }, 0);
      }
    }}
          ?disabled=${isPreviousMonth}
          data-month="${monthKey}"
          data-day="${currentDay}"
          data-year="${yearKey}"
        >
          <span class="day-number">${currentDay}</span>
          ${(() => {
      // Prüfe ob dieser Button bereits manuell aktualisiert wurde
      // Wenn ja, rendere keine Indikatoren (werden per direkter DOM-Manipulation verwaltet)
      const buttonKey = `${yearKey}:${monthKey}:${currentDay}`;
      if (this._directDOMUpdateInProgress && this._directDOMUpdateInProgress.has(buttonKey)) {
        return '';
      }
      // Prüfe auch, ob im DOM bereits ein manuell erstellter Container existiert
      if (this.shadowRoot) {
        const existingButton = this.shadowRoot.querySelector(`button[data-month="${monthKey}"][data-day="${currentDay}"][data-year="${yearKey}"]`);
        if (existingButton && existingButton.querySelector('.shifts-container[data-manual-update="true"]')) {
          return '';
        }
      }
      return shiftIndicators.length > 0 ? (0,lit__WEBPACK_IMPORTED_MODULE_0__.html)`<div class="shifts-container">${shiftIndicators}</div>` : '';
    })()}
        </button>
      </td>
    `;
  }
  renderMonth(year, month) {
    const daysInMonth = this.getDaysInMonth(year, month);
    const firstDay = this.getFirstDayOfMonth(year, month);
    const firstDayMonday = (firstDay + 6) % 7;
    const monthKey = month + 1;
    const yearKey = year % 100; // Kurzform, z.B. 25 für 2025
    const key = `${this.formatTwoDigits(yearKey)}:${this.formatTwoDigits(monthKey)}`;

    // Hole alle Tage für diesen Monat (neue Struktur: {day: [elements]})
    let workingDays = [];
    if (this._workingDays[key]) {
      if (Array.isArray(this._workingDays[key])) {
        // Kompatibilität: Altes Format [days]
        workingDays = this._workingDays[key].map(d => parseInt(d)).filter(d => !isNaN(d));
      } else if (typeof this._workingDays[key] === 'object') {
        // Neue Struktur: {day: [elements]}
        workingDays = Object.keys(this._workingDays[key]).map(d => parseInt(d)).filter(d => !isNaN(d));
      }
    }
    const now = new Date();
    const today = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Prüfe ob dieser Monat der Vormonat ist (schreibgeschützt)
    let isPreviousMonth = false;
    if (currentMonth === 0) {
      // Aktuell ist Januar, Vormonat ist Dezember des Vorjahres
      isPreviousMonth = month === 11 && year === currentYear - 1;
    } else {
      // Vormonat ist aktueller Monat - 1 im gleichen Jahr
      isPreviousMonth = month === currentMonth - 1 && year === currentYear;
    }
    const rows = [];
    let day = 1;

    // Erste Woche
    const firstDate = new Date(year, month, 1);
    const weekNumber = this.getWeekNumber(firstDate);
    const firstRowCells = [(0,lit__WEBPACK_IMPORTED_MODULE_0__.html)`<td class="week-label">${weekNumber}</td>`];
    for (let i = 0; i < firstDayMonday; i++) {
      firstRowCells.push((0,lit__WEBPACK_IMPORTED_MODULE_0__.html)`<td></td>`);
    }
    for (let i = firstDayMonday; i < 7 && day <= daysInMonth; i++) {
      firstRowCells.push(this.renderDay(day, monthKey, yearKey, key, workingDays, isPreviousMonth, year, month));
      day++;
    }
    rows.push((0,lit__WEBPACK_IMPORTED_MODULE_0__.html)`<tr>
        ${firstRowCells}
      </tr>`);

    // Weitere Wochen
    while (day <= daysInMonth) {
      const date = new Date(year, month, day);
      const weekNum = this.getWeekNumber(date);
      const rowCells = [(0,lit__WEBPACK_IMPORTED_MODULE_0__.html)`<td class="week-label">${weekNum}</td>`];

      // Rendere immer 7 Zellen pro Woche (Tage oder leere Zellen)
      for (let i = 0; i < 7; i++) {
        if (day <= daysInMonth) {
          rowCells.push(this.renderDay(day, monthKey, yearKey, key, workingDays, isPreviousMonth, year, month));
          day++;
        } else {
          // Leere Zelle am Ende der letzten Woche
          rowCells.push((0,lit__WEBPACK_IMPORTED_MODULE_0__.html)`<td></td>`);
        }
      }
      rows.push((0,lit__WEBPACK_IMPORTED_MODULE_0__.html)`<tr>
          ${rowCells}
        </tr>`);
    }
    return (0,lit__WEBPACK_IMPORTED_MODULE_0__.html)`
      <div class="month-container">
        <div class="month-header">${this.getMonthName(month)} ${year}</div>
        <table class="calendar-table">
          <thead>
            <tr>
              <th class="week-label">KW</th>
              <th>Mo</th>
              <th>Di</th>
              <th>Mi</th>
              <th>Do</th>
              <th>Fr</th>
              <th>Sa</th>
              <th>So</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;
  }
  changeDisplayedMonths(delta) {
    const maxMonths = this._config?.numberOfMonths || 14;
    const newValue = Math.max(1, Math.min(maxMonths, (this._displayedMonths || 2) + delta));
    if (newValue !== this._displayedMonths) {
      this._displayedMonths = newValue;
      this.requestUpdate();
    }
  }
  changeStartMonth(delta) {
    const maxMonths = this._config?.numberOfMonths || 14;
    const displayedMonths = this._displayedMonths || 2;
    const currentOffset = this._startMonthOffset || 0;

    // Berechne die Grenzen für die Navigation
    // Minimum: -1 (Vormonat)
    // Maximum: maxMonths - displayedMonths (damit der letzte angezeigte Monat nicht über maxMonths hinausgeht)
    const minOffset = -1;
    const maxOffset = maxMonths - displayedMonths;
    const newOffset = Math.max(minOffset, Math.min(maxOffset, currentOffset + delta));
    if (newOffset !== currentOffset) {
      this._startMonthOffset = newOffset;
      this.requestUpdate();
    }
  }
  getNavigationBounds() {
    const maxMonths = this._config?.numberOfMonths || 14;
    const displayedMonths = this._displayedMonths || 2;
    const currentOffset = this._startMonthOffset || 0;
    const minOffset = -1;
    const maxOffset = maxMonths - displayedMonths;
    return {
      canGoBack: currentOffset > minOffset,
      canGoForward: currentOffset < maxOffset
    };
  }
  _getSelectedCalendarShortcut() {
    // Gibt den Shortcut des ausgewählten Kalenders zurück

    // Prüfe zuerst _selectedCalendar
    if (this._selectedCalendar !== null && this._selectedCalendar !== undefined && this._selectedCalendar !== '') {
      return this._selectedCalendar;
    }

    // Falls _selectedCalendar nicht gesetzt ist, prüfe die Config
    if (this._config?.selectedCalendar) {
      this._selectedCalendar = this._config.selectedCalendar;
      return this._selectedCalendar;
    }

    // Fallback: Verwende den ersten aktivierten Kalender
    const allCalendars = this._getAllCalendars();
    if (allCalendars.length > 0) {
      return allCalendars[0].shortcut;
    }
    // Wenn kein Kalender aktiviert ist, gibt es keinen Fallback
    return null;
  }
  _getCalendarByShortcut(shortcut) {
    // Gibt das Kalender-Objekt für einen gegebenen Shortcut zurück
    if (!this._config?.calendars) {
      return null;
    }
    return this._config.calendars.find(cal => cal.shortcut === shortcut) || null;
  }
  _getDefaultColorForShortcut(shortcut) {
    // Gibt die Standardfarbe für einen gegebenen Shortcut zurück
    const defaultCalendar = ShiftScheduleView.CALENDARS.find(cal => cal.shortcut === shortcut);
    return defaultCalendar ? defaultCalendar.defaultColor : '#ff9800';
  }
  _getAllCalendars() {
    // Gibt nur aktivierte Kalender zurück
    if (!this._config?.calendars) {
      return [];
    }

    // Filtere nur aktivierte Kalender und sortiere nach Shortcut (a, b, c, d, e)
    return this._config.calendars.filter(cal => cal && cal.shortcut && (cal.enabled === true || cal.enabled === 'true' || cal.enabled === 1)).sort((a, b) => a.shortcut.localeCompare(b.shortcut));
  }
  _getSelectedCalendarValue() {
    const allCalendars = this._getAllCalendars();
    if (allCalendars.length === 0) {
      // Wenn keine Kalender aktiviert sind, gibt es keinen ausgewählten Kalender
      if (this._selectedCalendar !== null) {
        this._selectedCalendar = null;
        if (this._config) {
          this._config.selectedCalendar = null;
        }
        this.requestUpdate();
      }
      return null;
    }

    // Wenn _selectedCalendar noch nicht gesetzt ist, setze es auf den ersten aktivierten Kalender
    if (this._selectedCalendar === null || this._selectedCalendar === undefined) {
      this._selectedCalendar = allCalendars[0].shortcut;
      // Speichere es auch in der Config
      if (this._config) {
        this._config.selectedCalendar = this._selectedCalendar;
      }
      // Aktualisiere die Ansicht
      this.requestUpdate();
      return this._selectedCalendar;
    }

    // Prüfe ob der ausgewählte Kalender aktiviert ist
    const exists = allCalendars.some(cal => cal.shortcut === this._selectedCalendar);
    if (!exists) {
      // Wenn der ausgewählte Kalender nicht aktiviert ist, verwende den ersten aktivierten
      this._selectedCalendar = allCalendars[0].shortcut;
      if (this._config) {
        this._config.selectedCalendar = this._selectedCalendar;
      }
      this.requestUpdate();
      return this._selectedCalendar;
    }
    return this._selectedCalendar;
  }
  _onCalendarSelectedByIndex(shortcut) {
    if (shortcut !== '' && shortcut !== null && shortcut !== undefined) {
      this._selectedCalendar = shortcut;

      // Aktualisiere die Config mit der neuen Auswahl
      if (this._config) {
        this._config = {
          ...this._config,
          selectedCalendar: shortcut
        };

        // Dispatch config-changed Event, damit die Card die Config aktualisiert
        // (nur wenn nicht initialer Load)
        if (!this._isInitialLoad) {
          this.dispatchEvent(new CustomEvent('config-changed', {
            detail: {
              config: this._config
            },
            bubbles: true,
            composed: true
          }));
          // Speichere die Config in die Entity (nur bei Benutzeraktionen)
          this.saveConfigToEntity();
        }
      }

      // Aktualisiere alle Buttons, die die neue aktive Schicht haben
      // Dies ist notwendig, um die Hintergrundfarben und Indikatoren korrekt zu aktualisieren
      // (z.B. wenn Tag 2 die Schicht "a" hat und wir zu "a" wechseln, sollte Tag 2 orange werden)
      // ABER: Nur wenn es sich nicht um den initialen Load handelt UND die Daten bereits geladen sind
      // Beim initialen Load werden die Buttons bereits korrekt durch Lit gerendert
      if (!this._isInitialLoad && this.shadowRoot && this._workingDays && Object.keys(this._workingDays).length > 0) {
        // Verwende setTimeout, um sicherzustellen, dass _selectedCalendar bereits aktualisiert wurde
        setTimeout(() => {
          this._updateAllDayButtonsForCalendarChange();
        }, 0);
      }
    }
  }

  // Aktualisiert alle Tag-Buttons nach Kalender-Auswahl (nur Farben/Klassen, kein komplettes Re-Rendering)
  _updateAllDayButtonsForCalendarChange() {
    if (!this.shadowRoot) return;
    const buttons = this.shadowRoot.querySelectorAll('button.day-button');
    const selectedShortcut = this._getSelectedCalendarShortcut();
    const selectedCalendar = this._getCalendarByShortcut(selectedShortcut);
    buttons.forEach(button => {
      const monthKey = button.getAttribute('data-month');
      const dayNum = parseInt(button.getAttribute('data-day'));
      const yearKey = button.getAttribute('data-year');
      if (!monthKey || !dayNum || !yearKey) return;

      // Formatiere den Key mit formatTwoDigits, damit er mit den gespeicherten Daten übereinstimmt
      const key = `${this.formatTwoDigits(parseInt(yearKey))}:${this.formatTwoDigits(parseInt(monthKey))}`;
      const dayElements = this._getDayElements(key, dayNum);
      const hasSelectedShift = selectedShortcut && dayElements.includes(selectedShortcut);

      // Finde die erste aktivierte Schicht
      let firstActiveShift = null;
      const shiftOrder = ['a', 'b', 'c', 'd', 'e'];
      for (const shortcut of shiftOrder) {
        if (dayElements.includes(shortcut)) {
          const calendar = this._getCalendarByShortcut(shortcut);
          if (calendar && calendar.enabled) {
            firstActiveShift = shortcut;
            break;
          }
        }
      }

      // Bestimme welche Schicht den Tag färben soll
      let activeShiftForColor = null;
      if (hasSelectedShift && selectedCalendar && selectedCalendar.enabled) {
        activeShiftForColor = selectedShortcut;
      } else if (firstActiveShift) {
        activeShiftForColor = firstActiveShift;
      }
      const isWorking = activeShiftForColor !== null;

      // Aktualisiere CSS-Klasse
      if (isWorking) {
        button.classList.add('working');
      } else {
        button.classList.remove('working');
      }

      // Aktualisiere Hintergrundfarbe
      if (activeShiftForColor) {
        const activeCalendar = this._getCalendarByShortcut(activeShiftForColor);
        if (activeCalendar && activeCalendar.color) {
          button.style.backgroundColor = activeCalendar.color;
        } else {
          button.style.backgroundColor = '';
        }
      } else {
        button.style.backgroundColor = '';
      }

      // Aktualisiere Shift-Indikatoren (ähnlich wie in _updateDayButtonDirectly)
      // Entferne zuerst alle vorhandenen Container und Indikatoren
      const existingContainer = button.querySelector('.shifts-container');
      if (existingContainer) {
        existingContainer.remove();
      }
      const shiftIndicators = dayElements.filter(shortcut => shortcut !== activeShiftForColor).map(shortcut => {
        const calendar = this._getCalendarByShortcut(shortcut);
        if (calendar && calendar.enabled && calendar.color) {
          const indicator = document.createElement('span');
          indicator.className = 'shift-indicator';
          indicator.style.backgroundColor = calendar.color;
          indicator.title = calendar.name || `Schicht ${shortcut.toUpperCase()}`;
          return indicator;
        }
        return null;
      }).filter(indicator => indicator !== null);

      // Füge Indikatoren nur hinzu, wenn welche vorhanden sind
      if (shiftIndicators.length > 0) {
        const container = document.createElement('div');
        container.className = 'shifts-container';
        // Markiere Container als manuell erstellt, damit das Template sie nicht überschreibt
        container.setAttribute('data-manual-update', 'true');
        shiftIndicators.forEach(ind => container.appendChild(ind));
        button.appendChild(container);
      }
      // Wenn keine Indikatoren vorhanden sind, wurde der Container bereits oben entfernt
    });
  }

  // Aktualisiert die Storage-Warnung direkt im DOM ohne Re-Rendering
  _updateStorageWarningDirectly() {
    if (!this.shadowRoot) {
      // Shadow DOM noch nicht bereit, Fallback zu requestUpdate
      this.requestUpdate();
      return;
    }
    const wrapper = this.shadowRoot.querySelector('.calendar-wrapper');
    if (!wrapper) {
      // Wrapper nicht gefunden, Fallback zu requestUpdate
      this.requestUpdate();
      return;
    }
    const isEditorMode = this._isInEditorMode();
    const hasStorageWarning = this._storageWarning && this._storageWarning.show;

    // Aktualisiere CSS-Klasse
    if (hasStorageWarning) {
      wrapper.classList.add('storage-warning-active');
    } else {
      wrapper.classList.remove('storage-warning-active');
    }

    // Finde oder erstelle Storage-Warnung
    let storageWarningEl = wrapper.querySelector('.storage-warning[data-warning-type="storage"]');
    if (hasStorageWarning) {
      if (!storageWarningEl) {
        // Erstelle neue Warnung
        storageWarningEl = document.createElement('div');
        storageWarningEl.className = 'storage-warning';
        storageWarningEl.setAttribute('data-warning-type', 'storage');
        wrapper.insertBefore(storageWarningEl, wrapper.firstChild);
      }

      // Aktualisiere Inhalt
      const additionalEntities = this.findAdditionalEntities(this._config.entity);
      const nextEntitySuffix = String(additionalEntities.length + 1).padStart(3, '0');
      storageWarningEl.innerHTML = `
        <div class="warning-icon">⚠️</div>
        <div class="warning-content">
          <div class="warning-title">Speicherplatz fast voll!</div>
          <div class="warning-message">
            ${this._storageWarning.percentage}% der verfügbaren Speicherkapazität verwendet
            (${this._storageWarning.currentLength} / ${this._storageWarning.maxLength} Zeichen).
          </div>
          <div class="warning-action">
            Bitte legen Sie ein zusätzliches Input-Text-Feld an (z.B. ${this._config.entity}_${nextEntitySuffix}).
          </div>
        </div>
      `;
    } else if (storageWarningEl) {
      // Entferne Warnung wenn nicht mehr nötig
      storageWarningEl.remove();
    }
  }

  // Aktualisiert die Config-Warnung direkt im DOM ohne Re-Rendering
  _updateConfigWarningDirectly() {
    if (!this.shadowRoot) {
      // Shadow DOM noch nicht bereit, Fallback zu requestUpdate
      this.requestUpdate();
      return;
    }
    const wrapper = this.shadowRoot.querySelector('.calendar-wrapper');
    if (!wrapper) {
      // Wrapper nicht gefunden, Fallback zu requestUpdate
      this.requestUpdate();
      return;
    }
    const isEditorMode = this._isInEditorMode();
    const hasConfigWarning = this._configWarning && this._configWarning.show && (this._configWarning.type === 'size' || this._configWarning.type === 'missing' && isEditorMode);

    // Finde alle Config-Warnungen (size und missing)
    const configWarningSize = wrapper.querySelector('.storage-warning[data-warning-type="config-size"]');
    const configWarningMissing = wrapper.querySelector('.storage-warning[data-warning-type="config-missing"]');
    if (hasConfigWarning && this._configWarning.type === 'size') {
      // Size-Warnung anzeigen/aktualisieren
      let warningEl = configWarningSize;
      if (!warningEl) {
        warningEl = document.createElement('div');
        warningEl.className = 'storage-warning';
        warningEl.setAttribute('data-warning-type', 'config-size');
        // Füge nach Storage-Warnung ein, falls vorhanden
        const storageWarning = wrapper.querySelector('.storage-warning[data-warning-type="storage"]');
        if (storageWarning) {
          storageWarning.insertAdjacentElement('afterend', warningEl);
        } else {
          wrapper.insertBefore(warningEl, wrapper.firstChild);
        }
      }
      warningEl.innerHTML = `
        <div class="warning-icon">⚠️</div>
        <div class="warning-content">
          <div class="warning-title">Konfigurations-Entity zu klein!</div>
          <div class="warning-message">
            Die Konfiguration passt nicht in die Entity <code>${this._configWarning.configEntityId}</code>.
            ${this._configWarning.percentage}% der verfügbaren Speicherkapazität benötigt
            (${this._configWarning.currentLength} / ${this._configWarning.maxLength} Zeichen).
          </div>
          <div class="warning-action">
            Bitte erhöhen Sie die maximale Länge der Entity über die UI:
            <ul>
              <li>Einstellungen → Automatisierungen &amp; Szenen → Hilfsmittel</li>
              <li>Entity <code>${this._configWarning.configEntityId.replace('input_text.', '')}</code> bearbeiten</li>
              <li>Maximale Länge auf mindestens <code>${Math.ceil(this._configWarning.currentLength * 1.2)}</code> Zeichen erhöhen</li>
            </ul>
          </div>
        </div>
      `;
    } else if (configWarningSize) {
      configWarningSize.remove();
    }
    if (hasConfigWarning && this._configWarning.type === 'missing' && isEditorMode) {
      // Missing-Warnung anzeigen/aktualisieren
      let warningEl = configWarningMissing;
      if (!warningEl) {
        warningEl = document.createElement('div');
        warningEl.className = 'storage-warning';
        warningEl.setAttribute('data-warning-type', 'config-missing');
        // Füge nach anderen Warnungen ein
        const lastWarning = wrapper.querySelector('.storage-warning:last-of-type');
        if (lastWarning) {
          lastWarning.insertAdjacentElement('afterend', warningEl);
        } else {
          wrapper.insertBefore(warningEl, wrapper.firstChild);
        }
      }
      // Erstelle HTML-String für missing entity warning
      const entityNameShort = this._configWarning.configEntityId.replace('input_text.', '');
      warningEl.innerHTML = `
        <div class="warning-icon">⚠️</div>
        <div class="warning-content">
          <div class="warning-title">Konfigurations-Entity fehlt!</div>
          <div class="warning-message">
            Die Entity <code>${this._configWarning.configEntityId}</code> wurde nicht gefunden.
          </div>
          <div class="warning-action">
            Bitte legen Sie diese Entity über die UI an:
            <ul>
              <li>Einstellungen → Automatisierungen &amp; Szenen → Hilfsmittel</li>
              <li>Hilfsmittel hinzufügen → Text</li>
              <li>Entity-ID: <code>${this._configWarning.configEntityId}</code></li>
              <li>Maximale Länge: <code>255</code> Zeichen (oder mehr)</li>
            </ul>
          </div>
        </div>
      `;
    } else if (configWarningMissing) {
      configWarningMissing.remove();
    }
  }

  // Aktualisiert die Status-Warnung direkt im DOM ohne Re-Rendering
  _updateStatusWarningDirectly() {
    if (!this.shadowRoot) {
      // Shadow DOM noch nicht bereit, Fallback zu requestUpdate
      this.requestUpdate();
      return;
    }
    const wrapper = this.shadowRoot.querySelector('.calendar-wrapper');
    if (!wrapper) {
      // Wrapper nicht gefunden, Fallback zu requestUpdate
      this.requestUpdate();
      return;
    }
    const isEditorMode = this._isInEditorMode();
    const hasStatusWarning = this._statusWarning && this._statusWarning.show && isEditorMode;
    const statusWarningEl = wrapper.querySelector('.storage-warning[data-warning-type="status"]');
    if (hasStatusWarning) {
      let warningEl = statusWarningEl;
      if (!warningEl) {
        warningEl = document.createElement('div');
        warningEl.className = 'storage-warning';
        warningEl.setAttribute('data-warning-type', 'status');
        // Füge nach anderen Warnungen ein
        const lastWarning = wrapper.querySelector('.storage-warning:last-of-type');
        if (lastWarning) {
          lastWarning.insertAdjacentElement('afterend', warningEl);
        } else {
          wrapper.insertBefore(warningEl, wrapper.firstChild);
        }
      }
      warningEl.innerHTML = `
        <div class="warning-icon">⚠️</div>
        <div class="warning-content">
          <div class="warning-title">Status-Entity fehlt!</div>
          <div class="warning-message">
            Die Entity <code>${this._statusWarning.statusEntityId}</code> wurde nicht gefunden.
          </div>
          <div class="warning-action">
            Bitte legen Sie diese Entity über die UI an:
            <ul>
              <li>Einstellungen → Automatisierungen &amp; Szenen → Hilfsmittel</li>
              <li>Hilfsmittel hinzufügen → Text</li>
              <li>Entity-ID: <code>${this._statusWarning.statusEntityId}</code></li>
              <li>Maximale Länge: <code>255</code> Zeichen (oder mehr)</li>
            </ul>
          </div>
        </div>
      `;
    } else if (statusWarningEl) {
      statusWarningEl.remove();
    }
  }
  _getDayElements(monthKey, day) {
    // Gibt die Elemente für einen bestimmten Tag zurück
    // Reduziere Debug-Ausgaben: Nur bei ersten 3 Tagen oder wenn keine Daten gefunden werden
    const shouldDebug = day <= 3 || !this._workingDays[monthKey];
    if (shouldDebug) {
      this._debug(`[Render] _getDayElements: Suche nach monthKey="${monthKey}", day=${day}`);
    }
    if (!this._workingDays[monthKey] || typeof this._workingDays[monthKey] !== 'object') {
      if (shouldDebug) {
        this._debug(`[Render] _getDayElements: Keine Daten für monthKey="${monthKey}" gefunden oder kein Objekt`);
        this._debug(`[Render] _getDayElements: Verfügbare Keys in _workingDays:`, Object.keys(this._workingDays));
      }
      return [];
    }
    if (Array.isArray(this._workingDays[monthKey])) {
      // Altes Format: Array von Tagen
      if (shouldDebug) {
        this._debug(`[Render] _getDayElements: Altes Format (Array) für monthKey="${monthKey}"`);
      }
      return [];
    }
    const elements = this._workingDays[monthKey][day] || [];
    if (shouldDebug && elements.length > 0) {
      this._debug(`[Render] _getDayElements: Gefundene Elemente für "${monthKey}", Tag ${day}:`, elements);
    }
    return elements;
  }

  // Optimierung: Verhindere unnötige Re-Renderings
  shouldUpdate(changedProperties) {
    // Prüfe ob sich relevante Properties geändert haben
    const relevantProps = ['hass', 'config', '_workingDays', '_displayedMonths', '_startMonthOffset', '_selectedCalendar', '_storageWarning', '_configWarning', '_statusWarning', '_showConfigPanel'];

    // Wenn nur _workingDays geändert wurde und direkte DOM-Updates im Gange sind,
    // überspringe das Update, um Verdopplungen zu vermeiden
    if (changedProperties.has('_workingDays') && changedProperties.size === 1 && this._directDOMUpdateInProgress.size > 0) {
      // Überspringe Update, da direkte DOM-Manipulation verwendet wird
      return false;
    }
    return relevantProps.some(prop => changedProperties.has(prop));
  }
  render() {
    if (!this._config || !this._config.entity) {
      return (0,lit__WEBPACK_IMPORTED_MODULE_0__.html)`<div class="error">Keine Entity konfiguriert</div>`;
    }
    const maxMonths = this._config.numberOfMonths || 14;
    const displayedMonths = this._displayedMonths || 2;
    const startMonthOffset = this._startMonthOffset || 0;
    const now = new Date();
    const months = [];
    for (let i = 0; i < displayedMonths; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + startMonthOffset + i, 1);
      const year = date.getFullYear();
      const month = date.getMonth();
      months.push({
        year,
        month
      });
    }
    const isEditorMode = this._isInEditorMode();
    // Speicherwarnung wird immer angezeigt (auch im normalen Modus)
    const hasStorageWarning = this._storageWarning && this._storageWarning.show;
    // Config-Warnung: "missing" nur im Editor, "size" immer (auch im normalen Modus)
    const hasConfigWarning = this._configWarning && this._configWarning.show && (this._configWarning.type === 'size' ||
    // Speicherplatz-Warnung immer anzeigen
    this._configWarning.type === 'missing' && isEditorMode); // Fehlende Entity nur im Editor
    // Status-Warnung wird nur im Editor-Modus angezeigt
    const hasStatusWarning = this._statusWarning && this._statusWarning.show && isEditorMode;
    const navBounds = this.getNavigationBounds();
    return (0,lit__WEBPACK_IMPORTED_MODULE_0__.html)`
      <div class="calendar-wrapper ${hasStorageWarning ? 'storage-warning-active' : ''}">
        <div class="schichtplan-wrapper">
        ${hasStorageWarning ? (0,lit__WEBPACK_IMPORTED_MODULE_0__.html)`
              <div class="storage-warning" data-warning-type="storage">
                <div class="warning-icon">⚠️</div>
                <div class="warning-content">
                  <div class="warning-title">Speicherplatz fast voll!</div>
                  <div class="warning-message">
                    ${this._storageWarning.percentage}% der verfügbaren Speicherkapazität verwendet
                    (${this._storageWarning.currentLength} / ${this._storageWarning.maxLength}
                    Zeichen).
                  </div>
                  <div class="warning-action">
                    Bitte legen Sie ein zusätzliches Input-Text-Feld an (z.B.
                    ${this._config.entity}_${String(this.findAdditionalEntities(this._config.entity).length + 1).padStart(3, '0')}).
                  </div>
                </div>
              </div>
            ` : ''}
        ${hasConfigWarning && this._configWarning.type === 'size' ? (0,lit__WEBPACK_IMPORTED_MODULE_0__.html)`
              <div class="storage-warning" data-warning-type="config-size">
                <div class="warning-icon">⚠️</div>
                <div class="warning-content">
                  <div class="warning-title">Konfigurations-Entity zu klein!</div>
                  <div class="warning-message">
                    Die Konfiguration passt nicht in die Entity
                    <code>${this._configWarning.configEntityId}</code>.
                    ${this._configWarning.percentage}% der verfügbaren Speicherkapazität benötigt
                    (${this._configWarning.currentLength} / ${this._configWarning.maxLength}
                    Zeichen).
                  </div>
                  <div class="warning-action">
                    Bitte erhöhen Sie die maximale Länge der Entity über die UI:
                    <ul>
                      <li>Einstellungen → Automatisierungen &amp; Szenen → Hilfsmittel</li>
                      <li>
                        Entity
                        <code
                          >${this._configWarning.configEntityId.replace('input_text.', '')}</code
                        >
                        bearbeiten
                      </li>
                      <li>
                        Maximale Länge auf mindestens
                        <code>${Math.ceil(this._configWarning.currentLength * 1.2)}</code> Zeichen
                        erhöhen
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            ` : ''}
        ${hasConfigWarning && this._configWarning.type === 'missing' ? (0,lit__WEBPACK_IMPORTED_MODULE_0__.html)`
              <div class="storage-warning" data-warning-type="config-missing">
                ${this._renderMissingEntityWarning(this._configWarning.configEntityId, 'Konfigurations-Entity', 255, true)}
              </div>
            ` : ''}
        ${hasStatusWarning ? (0,lit__WEBPACK_IMPORTED_MODULE_0__.html)`
              <div class="storage-warning" data-warning-type="status">
                ${this._renderMissingEntityWarning(this._statusWarning.statusEntityId, 'Status-Entity', 255, false)}
              </div>
            ` : ''}
        ${!this._showConfigPanel ? (0,lit__WEBPACK_IMPORTED_MODULE_0__.html)`
              <div class="schichtplan-wrapper">
                <div class="schichtplan-menu-bar">
                  ${(0,_menu_bar_template_js__WEBPACK_IMPORTED_MODULE_12__.renderMenuBar)({
      left: '',
      center: (0,lit__WEBPACK_IMPORTED_MODULE_0__.html)`
                      <div class="menu-controls">
                        <button
                          class="menu-button navigation-button"
                          @click=${() => this.changeStartMonth(-1)}
                          ?disabled=${!navBounds.canGoBack}
                          title="Vorheriger Monat"
                        >
                          ←
                        </button>
                        <button
                          class="menu-button decrease-button"
                          @click=${() => this.changeDisplayedMonths(-1)}
                          ?disabled=${displayedMonths <= 1}
                          title="Weniger Monate anzeigen"
                        >
                          −
                        </button>
                        <div class="menu-number">${displayedMonths}</div>
                        <button
                          class="menu-button increase-button"
                          @click=${() => this.changeDisplayedMonths(1)}
                          ?disabled=${displayedMonths >= maxMonths}
                          title="Mehr Monate anzeigen"
                        >
                          +
                        </button>
                        <button
                          class="menu-button navigation-button"
                          @click=${() => this.changeStartMonth(1)}
                          ?disabled=${!navBounds.canGoForward}
                          title="Nächster Monat"
                        >
                          →
                        </button>
                      </div>
                    `,
      right: (0,lit__WEBPACK_IMPORTED_MODULE_0__.html)`
                      <button
                        class="menu-button config-button"
                        @click=${e => {
        e.stopPropagation();
        e.preventDefault();
        this._showConfigPanel = true;
        this.requestUpdate();
      }}
                        title="Schichtkonfiguration"
                      >
                        ⚙️
                      </button>
                    `,
      fullWidth: (() => {
        const allCalendars = this._getAllCalendars();
        const selectedShortcut = this._getSelectedCalendarShortcut();
        return (0,lit__WEBPACK_IMPORTED_MODULE_0__.html)`
                        <div class="color-bar">
                          ${allCalendars.map(calendar => {
          const isSelected = calendar.shortcut === selectedShortcut;
          const textColor = this._getContrastColor(calendar.color || '#ff9800');
          return (0,lit__WEBPACK_IMPORTED_MODULE_0__.html)`
                              <button
                                class="color-button ${isSelected ? 'selected' : ''}"
                                style="background-color: ${calendar.color || '#ff9800'}; color: ${textColor};"
                                @click=${() => this._onCalendarSelectedByIndex(calendar.shortcut)}
                                title="${calendar.name || `Schicht ${calendar.shortcut.toUpperCase()}`}"
                              >${calendar.name || `Schicht ${calendar.shortcut.toUpperCase()}`}</button>
                            `;
        })}
                        </div>
                      `;
      })()
    })}
                </div>
                <div class="schichtplan-panel">
                  ${months.map(({
      year,
      month
    }) => this.renderMonth(year, month))}
                </div>
              </div>
            ` : (0,lit__WEBPACK_IMPORTED_MODULE_0__.html)``}
        ${this._showConfigPanel ? (0,lit__WEBPACK_IMPORTED_MODULE_0__.html)`
              <div class="config-wrapper">
                <shift-config-panel
                  .calendars=${this._config?.calendars || []}
                  .selectedShortcut=${this._getSelectedCalendarShortcut()}
                  .hass=${this._hass}
                  @close=${() => {
      this._showConfigPanel = false;
      this.requestUpdate();
    }}
                  @save=${e => this._handleConfigPanelSave(e.detail.calendars)}
                ></shift-config-panel>
              </div>
            ` : (0,lit__WEBPACK_IMPORTED_MODULE_0__.html)``}
      </div>
    `;
  }
  _handleConfigPanelSave(calendars) {
    // Aktualisiere die Config mit den neuen Kalendern
    if (this._config) {
      this._config.calendars = calendars;

      // Speichere nur über Saver (nicht über Editor)
      this.saveConfigToEntity();

      // Schließe das Panel
      this._showConfigPanel = false;

      // Aktualisiere die Ansicht
      this.requestUpdate();
    }
  }
}

// Registriere ShiftScheduleView als Custom Element
_ShiftScheduleView = ShiftScheduleView;
_defineProperty(ShiftScheduleView, "className", 'ShiftScheduleView');
// Zentrale Definition der Standardfarbe für ausgewählte Tage im Single-Modus
_defineProperty(ShiftScheduleView, "DEFAULT_SELECTED_DAY_COLOR", '#ff9800');
// Orange
// Fixe Schicht-Definition: 5 gleichberechtigte Schichten (a, b, c, d, e)
_defineProperty(ShiftScheduleView, "CALENDARS", [{
  shortcut: 'a',
  name: 'Schicht A',
  defaultColor: '#ff9800'
}, {
  shortcut: 'b',
  name: 'Schicht B',
  defaultColor: '#ff0000'
}, {
  shortcut: 'c',
  name: 'Schicht C',
  defaultColor: '#00ff00'
}, {
  shortcut: 'd',
  name: 'Schicht D',
  defaultColor: '#0000ff'
}, {
  shortcut: 'e',
  name: 'Schicht E',
  defaultColor: '#ffff00'
}]);
_defineProperty(ShiftScheduleView, "styles", [_superPropGet(_ShiftScheduleView, "styles", _ShiftScheduleView) || [], _shared_menu_styles_js__WEBPACK_IMPORTED_MODULE_11__.sharedMenuStyles, (0,lit__WEBPACK_IMPORTED_MODULE_0__.css)`
      :host {
        display: block;
        --tgshiftschedule-default-selected-day-color: ${(0,lit__WEBPACK_IMPORTED_MODULE_0__.unsafeCSS)(_ShiftScheduleView.DEFAULT_SELECTED_DAY_COLOR)};
      }

      .calendar-wrapper {
        display: block;
        transition: border-color 0.3s ease;
      }

      .calendar-wrapper.storage-warning-active {
        border: 3px solid var(--error-color, #f44336);
        border-radius: 4px;
        padding: 8px;
        box-shadow: 0 0 10px rgba(244, 67, 54, 0.3);
      }

      .schichtplan-wrapper {
        display: flex;
        flex-direction: column;
        gap: 0;
        margin-bottom: 16px;
      }

      .schichtplan-menu-bar,
      .config-menu-bar {
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 12px;
        padding: 12px;
        background-color: var(--card-background-color, #ffffff);
        border-radius: 4px 4px 0 0;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-bottom: none;
      }

      /* Gemeinsame Menu-Styles und Farbleisten-Styles werden aus shared-menu-styles.js importiert */

      .menu-number {
        font-size: 18px;
        font-weight: bold;
        min-width: 40px;
        text-align: center;
        color: var(--primary-text-color, #212121);
      }

      .element-selector {
        margin-left: 20px;
        min-width: 200px;
      }

      .config-button {
        font-size: 20px;
        background: none !important;
        border: none !important;
        color: var(--primary-text-color, #212121) !important;
        width: auto !important;
        height: auto !important;
        padding: 4px !important;
      }

      .config-button:hover {
        background: none !important;
        color: var(--primary-color, #03a9f4) !important;
        transform: scale(1.1);
      }

      .schichtplan-panel {
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding: 12px;
        background-color: var(--card-background-color, #ffffff);
        border-radius: 0 0 4px 4px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-top: none;
      }

      .config-wrapper {
        margin-bottom: 16px;
      }

      .month-container {
        display: flex;
        flex-direction: column;
      }

      .month-header {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 12px;
        text-align: center;
      }

      .calendar-table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
      }

      .calendar-table th {
        padding: 8px 4px;
        text-align: center;
        font-weight: bold;
        font-size: 12px;
        border-bottom: 2px solid var(--divider-color, #e0e0e0);
      }

      .calendar-table td {
        padding: 4px;
        text-align: center;
        vertical-align: middle;
      }

      .day-button {
        width: 100%;
        min-width: 32px;
        min-height: 32px;
        padding: 2px;
        border: 1px solid var(--divider-color, #e0e0e0);
        border-radius: 4px;
        background-color: var(--card-background-color, #ffffff);
        color: var(--primary-text-color, #000000);
        cursor: pointer;
        transition: all 0.2s;
        font-size: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 2px;
      }

      .day-number {
        font-size: 12px;
        font-weight: bold;
        line-height: 1;
      }

      .shifts-container {
        display: flex;
        flex-wrap: wrap;
        gap: 2px;
        justify-content: center;
        align-items: center;
        max-width: 100%;
      }

      .shift-indicator {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        border: 1px solid rgba(0, 0, 0, 0.2);
        flex-shrink: 0;
      }

      .day-button:hover:not(.working) {
        background-color: var(--primary-color, #03a9f4);
        color: var(--text-primary-color, #ffffff);
      }

      .day-button.working:hover {
        /* Behalte die Hintergrundfarbe bei, aber mache sie etwas dunkler */
        opacity: 0.9;
        filter: brightness(0.9);
      }

      /* Verhindere visuelle Markierung nach Klick auf mobilen Geräten */
      .day-button:active,
      .day-button:focus {
        outline: none !important;
        box-shadow: none !important;
      }

      /* Touch-spezifische Behandlung: Verhindere aktiven State nach Touch */
      .day-button {
        -webkit-tap-highlight-color: transparent;
        -webkit-touch-callout: none;
        touch-action: manipulation;
      }

      .day-button.working {
        /* background-color wird jetzt dynamisch per style gesetzt, wenn eine Schicht ausgewählt ist */
        color: var(--text-primary-color, #ffffff);
        font-weight: bold;
      }

      /* Fallback: Wenn keine Schicht ausgewählt ist, verwende die Standardfarbe */
      .day-button.working:not([style*='background-color']) {
        background-color: var(--accent-color, var(--tgshiftschedule-default-selected-day-color));
      }

      /* Basis: Heute-Markierung mit Outline (wird außerhalb des Borders gerendert) */
      .day-button.today {
        outline: 3px solid var(--primary-color, #03a9f4);
        outline-offset: 2px;
      }

      .day-button.weekend {
        border: 4px solid var(--secondary-color, #757575);
      }

      /* Feiertage haben Vorrang vor Wochenenden */
      .day-button.holiday {
        border: 4px solid var(--error-color, #f44336);
      }

      /* Wenn sowohl Wochenende als auch Feiertag, verwende Feiertagsfarbe (stärkere Umrandung) */
      .day-button.weekend.holiday {
        border: 5px solid var(--error-color, #f44336);
      }

      /* Heute + Wochenende: Border für Wochenende, Outline für heute */
      .day-button.today.weekend {
        border: 4px solid var(--secondary-color, #757575);
        outline: 3px solid var(--primary-color, #03a9f4);
        outline-offset: 2px;
      }

      /* Heute + Feiertag: Border für Feiertag, Outline für heute */
      .day-button.today.holiday {
        border: 4px solid var(--error-color, #f44336);
        outline: 3px solid var(--primary-color, #03a9f4);
        outline-offset: 2px;
      }

      /* Heute + Wochenende + Feiertag: Border für Feiertag (stärker), Outline für heute */
      .day-button.today.weekend.holiday {
        border: 5px solid var(--error-color, #f44336);
        outline: 3px solid var(--primary-color, #03a9f4);
        outline-offset: 2px;
      }

      .day-button.readonly,
      .day-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background-color: var(--disabled-color, #f5f5f5);
        color: var(--secondary-text-color, #888888);
      }

      .day-button.readonly:hover,
      .day-button:disabled:hover {
        background-color: var(--disabled-color, #f5f5f5);
        color: var(--secondary-text-color, #888888);
      }

      .day-number {
        font-size: 12px;
        font-weight: bold;
        line-height: 1;
      }

      .shifts-container {
        display: flex;
        flex-wrap: wrap;
        gap: 2px;
        justify-content: center;
        align-items: center;
        max-width: 100%;
      }

      .shift-indicator {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        border: 1px solid rgba(0, 0, 0, 0.2);
        flex-shrink: 0;
      }

      .day-button.working .day-number {
        color: var(--text-primary-color, #ffffff);
      }

      .week-label {
        font-size: 11px;
        color: var(--secondary-text-color, #888888);
        padding-right: 8px;
        text-align: right;
        width: 40px;
      }

      .error {
        text-align: center;
        padding: 20px;
        color: var(--error-color);
      }

      .storage-warning {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 16px;
        margin-bottom: 16px;
        background-color: var(--warning-color, var(--tgshiftschedule-default-selected-day-color));
        color: var(--text-primary-color, #ffffff);
        border-radius: 4px;
        border-left: 4px solid var(--error-color, #f44336);
      }

      .warning-icon {
        font-size: 24px;
        flex-shrink: 0;
      }

      .warning-content {
        flex: 1;
      }

      .warning-title {
        font-weight: bold;
        font-size: 16px;
        margin-bottom: 8px;
      }

      .warning-message {
        font-size: 14px;
        margin-bottom: 8px;
        line-height: 1.5;
      }

      .warning-action {
        font-size: 14px;
        font-weight: 500;
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid rgba(255, 255, 255, 0.3);
      }

      .warning-action ul {
        margin: 8px 0 0 0;
        padding-left: 20px;
        list-style-type: disc;
      }

      .warning-action li {
        margin: 4px 0;
        line-height: 1.5;
      }

      .warning-action code {
        background-color: rgba(0, 0, 0, 0.2);
        padding: 2px 6px;
        border-radius: 3px;
        font-family: 'Courier New', monospace;
        font-size: 13px;
      }
    `]);
if (!customElements.get('shiftschedule-view')) {
  customElements.define('shiftschedule-view', ShiftScheduleView);
}

/***/ }),

/***/ "./src/views/view-base.js":
/*!********************************!*\
  !*** ./src/views/view-base.js ***!
  \********************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ViewBase: () => (/* binding */ ViewBase)
/* harmony export */ });
/* harmony import */ var _super_base_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../super-base.js */ "./src/super-base.js");
/* harmony import */ var lit__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! lit */ "./node_modules/lit/index.js");
var _ViewBase;
function _superPropGet(t, o, e, r) { var p = _get(_getPrototypeOf(1 & r ? t.prototype : t), o, e); return 2 & r && "function" == typeof p ? function (t) { return p.apply(e, t); } : p; }
function _get() { return _get = "undefined" != typeof Reflect && Reflect.get ? Reflect.get.bind() : function (e, t, r) { var p = _superPropBase(e, t); if (p) { var n = Object.getOwnPropertyDescriptor(p, t); return n.get ? n.get.call(arguments.length < 3 ? e : r) : n.value; } }, _get.apply(null, arguments); }
function _superPropBase(t, o) { for (; !{}.hasOwnProperty.call(t, o) && null !== (t = _getPrototypeOf(t));); return t; }
function _getPrototypeOf(t) { return _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function (t) { return t.__proto__ || Object.getPrototypeOf(t); }, _getPrototypeOf(t); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }


class ViewBase extends _super_base_js__WEBPACK_IMPORTED_MODULE_0__.SuperBase {
  constructor() {
    super();
    this._debug('ViewBase-Konstruktor: Start');
    this.config = {};
    this.epgData = [];
    this._loading = false;
    this._error = null;
    this._debug('ViewBase-Konstruktor: Initialisierung abgeschlossen');
  }
  async firstUpdated() {
    this._debug('ViewBase firstUpdated: Start');
    await super.firstUpdated();
    this._debug('ViewBase firstUpdated: Ende');
  }
  async _loadData() {
    this._debug('ViewBase _loadData wird aufgerufen');
    if (!this._dataProvider || !this.config.entity) {
      this._debug('ViewBase _loadData: Übersprungen - dataProvider oder entity fehlt', {
        dataProvider: !!this._dataProvider,
        entity: this.config.entity,
        config: this.config
      });
      return;
    }
    this._loading = true;
    this._error = null;
    try {
      this._debug('Starte _fetchViewData mit Konfiguration:', this.config);
      const data = await this._fetchViewData(this.config);
      this.epgData = data;
      this._debug('_fetchViewData erfolgreich:', data);
    } catch (error) {
      this._error = error;
      this._debug('Fehler in _fetchViewData:', error);
    } finally {
      this._loading = false;
    }
  }
  async _fetchViewData(config) {
    throw new Error('_fetchViewData muss in der abgeleiteten Klasse implementiert werden');
  }

  // Basis-Rendering-Methode, die von den abgeleiteten Klassen überschrieben werden kann
  render() {
    if (this._loading) {
      return this._renderLoading();
    }
    if (this._error) {
      return this._renderError();
    }
    return this._renderContent();
  }
  _renderLoading() {
    return html`<div class="loading">Lade Daten...</div>`;
  }
  _renderError() {
    return html`<div class="error">${this._error}</div>`;
  }
  _renderContent() {
    return html`<div>Keine Daten verfügbar</div>`;
  }
}
_ViewBase = ViewBase;
_defineProperty(ViewBase, "className", 'ViewBase');
_defineProperty(ViewBase, "properties", {
  config: {
    type: Object
  },
  epgData: {
    type: Array
  },
  _loading: {
    type: Boolean
  },
  _error: {
    type: Object
  }
});
_defineProperty(ViewBase, "styles", [_superPropGet(_ViewBase, "styles", _ViewBase), (0,lit__WEBPACK_IMPORTED_MODULE_1__.css)`
      :host {
        display: block;
      }
    `]);

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var execOptions = { id: moduleId, module: module, factory: __webpack_modules__[moduleId], require: __webpack_require__ };
/******/ 		__webpack_require__.i.forEach(function(handler) { handler(execOptions); });
/******/ 		module = execOptions.module;
/******/ 		execOptions.factory.call(module.exports, module, module.exports, execOptions.require);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = __webpack_module_cache__;
/******/ 	
/******/ 	// expose the module execution interceptor
/******/ 	__webpack_require__.i = [];
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		__webpack_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__webpack_require__.e = (chunkId) => {
/******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
/******/ 				__webpack_require__.f[key](chunkId, promises);
/******/ 				return promises;
/******/ 			}, []));
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference all chunks
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames not based on template
/******/ 			if (chunkId === "main") return "tgshiftschedule-card.js";
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + ".tgshiftschedule-card.js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript update chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference all chunks
/******/ 		__webpack_require__.hu = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + "." + __webpack_require__.h() + ".hot-update.js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get update manifest filename */
/******/ 	(() => {
/******/ 		__webpack_require__.hmrF = () => ("main." + __webpack_require__.h() + ".hot-update.json");
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/getFullHash */
/******/ 	(() => {
/******/ 		__webpack_require__.h = () => ("d585536fee63c8af9e33")
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/load script */
/******/ 	(() => {
/******/ 		var inProgress = {};
/******/ 		var dataWebpackPrefix = "tgshiftschedule-card:";
/******/ 		// loadScript function to load a script via script tag
/******/ 		__webpack_require__.l = (url, done, key, chunkId) => {
/******/ 			if(inProgress[url]) { inProgress[url].push(done); return; }
/******/ 			var script, needAttach;
/******/ 			if(key !== undefined) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				for(var i = 0; i < scripts.length; i++) {
/******/ 					var s = scripts[i];
/******/ 					if(s.getAttribute("src") == url || s.getAttribute("data-webpack") == dataWebpackPrefix + key) { script = s; break; }
/******/ 				}
/******/ 			}
/******/ 			if(!script) {
/******/ 				needAttach = true;
/******/ 				script = document.createElement('script');
/******/ 		
/******/ 				script.charset = 'utf-8';
/******/ 				script.timeout = 120;
/******/ 				if (__webpack_require__.nc) {
/******/ 					script.setAttribute("nonce", __webpack_require__.nc);
/******/ 				}
/******/ 				script.setAttribute("data-webpack", dataWebpackPrefix + key);
/******/ 		
/******/ 				script.src = url;
/******/ 			}
/******/ 			inProgress[url] = [done];
/******/ 			var onScriptComplete = (prev, event) => {
/******/ 				// avoid mem leaks in IE.
/******/ 				script.onerror = script.onload = null;
/******/ 				clearTimeout(timeout);
/******/ 				var doneFns = inProgress[url];
/******/ 				delete inProgress[url];
/******/ 				script.parentNode && script.parentNode.removeChild(script);
/******/ 				doneFns && doneFns.forEach((fn) => (fn(event)));
/******/ 				if(prev) return prev(event);
/******/ 			}
/******/ 			var timeout = setTimeout(onScriptComplete.bind(null, undefined, { type: 'timeout', target: script }), 120000);
/******/ 			script.onerror = onScriptComplete.bind(null, script.onerror);
/******/ 			script.onload = onScriptComplete.bind(null, script.onload);
/******/ 			needAttach && document.head.appendChild(script);
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hot module replacement */
/******/ 	(() => {
/******/ 		var currentModuleData = {};
/******/ 		var installedModules = __webpack_require__.c;
/******/ 		
/******/ 		// module and require creation
/******/ 		var currentChildModule;
/******/ 		var currentParents = [];
/******/ 		
/******/ 		// status
/******/ 		var registeredStatusHandlers = [];
/******/ 		var currentStatus = "idle";
/******/ 		
/******/ 		// while downloading
/******/ 		var blockingPromises = 0;
/******/ 		var blockingPromisesWaiting = [];
/******/ 		
/******/ 		// The update info
/******/ 		var currentUpdateApplyHandlers;
/******/ 		var queuedInvalidatedModules;
/******/ 		
/******/ 		__webpack_require__.hmrD = currentModuleData;
/******/ 		
/******/ 		__webpack_require__.i.push(function (options) {
/******/ 			var module = options.module;
/******/ 			var require = createRequire(options.require, options.id);
/******/ 			module.hot = createModuleHotObject(options.id, module);
/******/ 			module.parents = currentParents;
/******/ 			module.children = [];
/******/ 			currentParents = [];
/******/ 			options.require = require;
/******/ 		});
/******/ 		
/******/ 		__webpack_require__.hmrC = {};
/******/ 		__webpack_require__.hmrI = {};
/******/ 		
/******/ 		function createRequire(require, moduleId) {
/******/ 			var me = installedModules[moduleId];
/******/ 			if (!me) return require;
/******/ 			var fn = function (request) {
/******/ 				if (me.hot.active) {
/******/ 					if (installedModules[request]) {
/******/ 						var parents = installedModules[request].parents;
/******/ 						if (parents.indexOf(moduleId) === -1) {
/******/ 							parents.push(moduleId);
/******/ 						}
/******/ 					} else {
/******/ 						currentParents = [moduleId];
/******/ 						currentChildModule = request;
/******/ 					}
/******/ 					if (me.children.indexOf(request) === -1) {
/******/ 						me.children.push(request);
/******/ 					}
/******/ 				} else {
/******/ 					console.warn(
/******/ 						"[HMR] unexpected require(" +
/******/ 							request +
/******/ 							") from disposed module " +
/******/ 							moduleId
/******/ 					);
/******/ 					currentParents = [];
/******/ 				}
/******/ 				return require(request);
/******/ 			};
/******/ 			var createPropertyDescriptor = function (name) {
/******/ 				return {
/******/ 					configurable: true,
/******/ 					enumerable: true,
/******/ 					get: function () {
/******/ 						return require[name];
/******/ 					},
/******/ 					set: function (value) {
/******/ 						require[name] = value;
/******/ 					}
/******/ 				};
/******/ 			};
/******/ 			for (var name in require) {
/******/ 				if (Object.prototype.hasOwnProperty.call(require, name) && name !== "e") {
/******/ 					Object.defineProperty(fn, name, createPropertyDescriptor(name));
/******/ 				}
/******/ 			}
/******/ 			fn.e = function (chunkId, fetchPriority) {
/******/ 				return trackBlockingPromise(require.e(chunkId, fetchPriority));
/******/ 			};
/******/ 			return fn;
/******/ 		}
/******/ 		
/******/ 		function createModuleHotObject(moduleId, me) {
/******/ 			var _main = currentChildModule !== moduleId;
/******/ 			var hot = {
/******/ 				// private stuff
/******/ 				_acceptedDependencies: {},
/******/ 				_acceptedErrorHandlers: {},
/******/ 				_declinedDependencies: {},
/******/ 				_selfAccepted: false,
/******/ 				_selfDeclined: false,
/******/ 				_selfInvalidated: false,
/******/ 				_disposeHandlers: [],
/******/ 				_main: _main,
/******/ 				_requireSelf: function () {
/******/ 					currentParents = me.parents.slice();
/******/ 					currentChildModule = _main ? undefined : moduleId;
/******/ 					__webpack_require__(moduleId);
/******/ 				},
/******/ 		
/******/ 				// Module API
/******/ 				active: true,
/******/ 				accept: function (dep, callback, errorHandler) {
/******/ 					if (dep === undefined) hot._selfAccepted = true;
/******/ 					else if (typeof dep === "function") hot._selfAccepted = dep;
/******/ 					else if (typeof dep === "object" && dep !== null) {
/******/ 						for (var i = 0; i < dep.length; i++) {
/******/ 							hot._acceptedDependencies[dep[i]] = callback || function () {};
/******/ 							hot._acceptedErrorHandlers[dep[i]] = errorHandler;
/******/ 						}
/******/ 					} else {
/******/ 						hot._acceptedDependencies[dep] = callback || function () {};
/******/ 						hot._acceptedErrorHandlers[dep] = errorHandler;
/******/ 					}
/******/ 				},
/******/ 				decline: function (dep) {
/******/ 					if (dep === undefined) hot._selfDeclined = true;
/******/ 					else if (typeof dep === "object" && dep !== null)
/******/ 						for (var i = 0; i < dep.length; i++)
/******/ 							hot._declinedDependencies[dep[i]] = true;
/******/ 					else hot._declinedDependencies[dep] = true;
/******/ 				},
/******/ 				dispose: function (callback) {
/******/ 					hot._disposeHandlers.push(callback);
/******/ 				},
/******/ 				addDisposeHandler: function (callback) {
/******/ 					hot._disposeHandlers.push(callback);
/******/ 				},
/******/ 				removeDisposeHandler: function (callback) {
/******/ 					var idx = hot._disposeHandlers.indexOf(callback);
/******/ 					if (idx >= 0) hot._disposeHandlers.splice(idx, 1);
/******/ 				},
/******/ 				invalidate: function () {
/******/ 					this._selfInvalidated = true;
/******/ 					switch (currentStatus) {
/******/ 						case "idle":
/******/ 							currentUpdateApplyHandlers = [];
/******/ 							Object.keys(__webpack_require__.hmrI).forEach(function (key) {
/******/ 								__webpack_require__.hmrI[key](
/******/ 									moduleId,
/******/ 									currentUpdateApplyHandlers
/******/ 								);
/******/ 							});
/******/ 							setStatus("ready");
/******/ 							break;
/******/ 						case "ready":
/******/ 							Object.keys(__webpack_require__.hmrI).forEach(function (key) {
/******/ 								__webpack_require__.hmrI[key](
/******/ 									moduleId,
/******/ 									currentUpdateApplyHandlers
/******/ 								);
/******/ 							});
/******/ 							break;
/******/ 						case "prepare":
/******/ 						case "check":
/******/ 						case "dispose":
/******/ 						case "apply":
/******/ 							(queuedInvalidatedModules = queuedInvalidatedModules || []).push(
/******/ 								moduleId
/******/ 							);
/******/ 							break;
/******/ 						default:
/******/ 							// ignore requests in error states
/******/ 							break;
/******/ 					}
/******/ 				},
/******/ 		
/******/ 				// Management API
/******/ 				check: hotCheck,
/******/ 				apply: hotApply,
/******/ 				status: function (l) {
/******/ 					if (!l) return currentStatus;
/******/ 					registeredStatusHandlers.push(l);
/******/ 				},
/******/ 				addStatusHandler: function (l) {
/******/ 					registeredStatusHandlers.push(l);
/******/ 				},
/******/ 				removeStatusHandler: function (l) {
/******/ 					var idx = registeredStatusHandlers.indexOf(l);
/******/ 					if (idx >= 0) registeredStatusHandlers.splice(idx, 1);
/******/ 				},
/******/ 		
/******/ 				// inherit from previous dispose call
/******/ 				data: currentModuleData[moduleId]
/******/ 			};
/******/ 			currentChildModule = undefined;
/******/ 			return hot;
/******/ 		}
/******/ 		
/******/ 		function setStatus(newStatus) {
/******/ 			currentStatus = newStatus;
/******/ 			var results = [];
/******/ 		
/******/ 			for (var i = 0; i < registeredStatusHandlers.length; i++)
/******/ 				results[i] = registeredStatusHandlers[i].call(null, newStatus);
/******/ 		
/******/ 			return Promise.all(results).then(function () {});
/******/ 		}
/******/ 		
/******/ 		function unblock() {
/******/ 			if (--blockingPromises === 0) {
/******/ 				setStatus("ready").then(function () {
/******/ 					if (blockingPromises === 0) {
/******/ 						var list = blockingPromisesWaiting;
/******/ 						blockingPromisesWaiting = [];
/******/ 						for (var i = 0; i < list.length; i++) {
/******/ 							list[i]();
/******/ 						}
/******/ 					}
/******/ 				});
/******/ 			}
/******/ 		}
/******/ 		
/******/ 		function trackBlockingPromise(promise) {
/******/ 			switch (currentStatus) {
/******/ 				case "ready":
/******/ 					setStatus("prepare");
/******/ 				/* fallthrough */
/******/ 				case "prepare":
/******/ 					blockingPromises++;
/******/ 					promise.then(unblock, unblock);
/******/ 					return promise;
/******/ 				default:
/******/ 					return promise;
/******/ 			}
/******/ 		}
/******/ 		
/******/ 		function waitForBlockingPromises(fn) {
/******/ 			if (blockingPromises === 0) return fn();
/******/ 			return new Promise(function (resolve) {
/******/ 				blockingPromisesWaiting.push(function () {
/******/ 					resolve(fn());
/******/ 				});
/******/ 			});
/******/ 		}
/******/ 		
/******/ 		function hotCheck(applyOnUpdate) {
/******/ 			if (currentStatus !== "idle") {
/******/ 				throw new Error("check() is only allowed in idle status");
/******/ 			}
/******/ 			return setStatus("check")
/******/ 				.then(__webpack_require__.hmrM)
/******/ 				.then(function (update) {
/******/ 					if (!update) {
/******/ 						return setStatus(applyInvalidatedModules() ? "ready" : "idle").then(
/******/ 							function () {
/******/ 								return null;
/******/ 							}
/******/ 						);
/******/ 					}
/******/ 		
/******/ 					return setStatus("prepare").then(function () {
/******/ 						var updatedModules = [];
/******/ 						currentUpdateApplyHandlers = [];
/******/ 		
/******/ 						return Promise.all(
/******/ 							Object.keys(__webpack_require__.hmrC).reduce(function (
/******/ 								promises,
/******/ 								key
/******/ 							) {
/******/ 								__webpack_require__.hmrC[key](
/******/ 									update.c,
/******/ 									update.r,
/******/ 									update.m,
/******/ 									promises,
/******/ 									currentUpdateApplyHandlers,
/******/ 									updatedModules
/******/ 								);
/******/ 								return promises;
/******/ 							}, [])
/******/ 						).then(function () {
/******/ 							return waitForBlockingPromises(function () {
/******/ 								if (applyOnUpdate) {
/******/ 									return internalApply(applyOnUpdate);
/******/ 								}
/******/ 								return setStatus("ready").then(function () {
/******/ 									return updatedModules;
/******/ 								});
/******/ 							});
/******/ 						});
/******/ 					});
/******/ 				});
/******/ 		}
/******/ 		
/******/ 		function hotApply(options) {
/******/ 			if (currentStatus !== "ready") {
/******/ 				return Promise.resolve().then(function () {
/******/ 					throw new Error(
/******/ 						"apply() is only allowed in ready status (state: " +
/******/ 							currentStatus +
/******/ 							")"
/******/ 					);
/******/ 				});
/******/ 			}
/******/ 			return internalApply(options);
/******/ 		}
/******/ 		
/******/ 		function internalApply(options) {
/******/ 			options = options || {};
/******/ 		
/******/ 			applyInvalidatedModules();
/******/ 		
/******/ 			var results = currentUpdateApplyHandlers.map(function (handler) {
/******/ 				return handler(options);
/******/ 			});
/******/ 			currentUpdateApplyHandlers = undefined;
/******/ 		
/******/ 			var errors = results
/******/ 				.map(function (r) {
/******/ 					return r.error;
/******/ 				})
/******/ 				.filter(Boolean);
/******/ 		
/******/ 			if (errors.length > 0) {
/******/ 				return setStatus("abort").then(function () {
/******/ 					throw errors[0];
/******/ 				});
/******/ 			}
/******/ 		
/******/ 			// Now in "dispose" phase
/******/ 			var disposePromise = setStatus("dispose");
/******/ 		
/******/ 			results.forEach(function (result) {
/******/ 				if (result.dispose) result.dispose();
/******/ 			});
/******/ 		
/******/ 			// Now in "apply" phase
/******/ 			var applyPromise = setStatus("apply");
/******/ 		
/******/ 			var error;
/******/ 			var reportError = function (err) {
/******/ 				if (!error) error = err;
/******/ 			};
/******/ 		
/******/ 			var outdatedModules = [];
/******/ 			results.forEach(function (result) {
/******/ 				if (result.apply) {
/******/ 					var modules = result.apply(reportError);
/******/ 					if (modules) {
/******/ 						for (var i = 0; i < modules.length; i++) {
/******/ 							outdatedModules.push(modules[i]);
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 			});
/******/ 		
/******/ 			return Promise.all([disposePromise, applyPromise]).then(function () {
/******/ 				// handle errors in accept handlers and self accepted module load
/******/ 				if (error) {
/******/ 					return setStatus("fail").then(function () {
/******/ 						throw error;
/******/ 					});
/******/ 				}
/******/ 		
/******/ 				if (queuedInvalidatedModules) {
/******/ 					return internalApply(options).then(function (list) {
/******/ 						outdatedModules.forEach(function (moduleId) {
/******/ 							if (list.indexOf(moduleId) < 0) list.push(moduleId);
/******/ 						});
/******/ 						return list;
/******/ 					});
/******/ 				}
/******/ 		
/******/ 				return setStatus("idle").then(function () {
/******/ 					return outdatedModules;
/******/ 				});
/******/ 			});
/******/ 		}
/******/ 		
/******/ 		function applyInvalidatedModules() {
/******/ 			if (queuedInvalidatedModules) {
/******/ 				if (!currentUpdateApplyHandlers) currentUpdateApplyHandlers = [];
/******/ 				Object.keys(__webpack_require__.hmrI).forEach(function (key) {
/******/ 					queuedInvalidatedModules.forEach(function (moduleId) {
/******/ 						__webpack_require__.hmrI[key](
/******/ 							moduleId,
/******/ 							currentUpdateApplyHandlers
/******/ 						);
/******/ 					});
/******/ 				});
/******/ 				queuedInvalidatedModules = undefined;
/******/ 				return true;
/******/ 			}
/******/ 		}
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT')
/******/ 				scriptUrl = document.currentScript.src;
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) {
/******/ 					var i = scripts.length - 1;
/******/ 					while (i > -1 && (!scriptUrl || !/^http(s?):/.test(scriptUrl))) scriptUrl = scripts[i--].src;
/******/ 				}
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/^blob:/, "").replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = __webpack_require__.hmrS_jsonp = __webpack_require__.hmrS_jsonp || {
/******/ 			"main": 0
/******/ 		};
/******/ 		
/******/ 		__webpack_require__.f.j = (chunkId, promises) => {
/******/ 				// JSONP chunk loading for javascript
/******/ 				var installedChunkData = __webpack_require__.o(installedChunks, chunkId) ? installedChunks[chunkId] : undefined;
/******/ 				if(installedChunkData !== 0) { // 0 means "already installed".
/******/ 		
/******/ 					// a Promise means "currently loading".
/******/ 					if(installedChunkData) {
/******/ 						promises.push(installedChunkData[2]);
/******/ 					} else {
/******/ 						if(true) { // all chunks have JS
/******/ 							// setup Promise in chunk cache
/******/ 							var promise = new Promise((resolve, reject) => (installedChunkData = installedChunks[chunkId] = [resolve, reject]));
/******/ 							promises.push(installedChunkData[2] = promise);
/******/ 		
/******/ 							// start chunk loading
/******/ 							var url = __webpack_require__.p + __webpack_require__.u(chunkId);
/******/ 							// create error before stack unwound to get useful stacktrace later
/******/ 							var error = new Error();
/******/ 							var loadingEnded = (event) => {
/******/ 								if(__webpack_require__.o(installedChunks, chunkId)) {
/******/ 									installedChunkData = installedChunks[chunkId];
/******/ 									if(installedChunkData !== 0) installedChunks[chunkId] = undefined;
/******/ 									if(installedChunkData) {
/******/ 										var errorType = event && (event.type === 'load' ? 'missing' : event.type);
/******/ 										var realSrc = event && event.target && event.target.src;
/******/ 										error.message = 'Loading chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
/******/ 										error.name = 'ChunkLoadError';
/******/ 										error.type = errorType;
/******/ 										error.request = realSrc;
/******/ 										installedChunkData[1](error);
/******/ 									}
/******/ 								}
/******/ 							};
/******/ 							__webpack_require__.l(url, loadingEnded, "chunk-" + chunkId, chunkId);
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 		};
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		var currentUpdatedModulesList;
/******/ 		var waitingUpdateResolves = {};
/******/ 		function loadUpdateChunk(chunkId, updatedModulesList) {
/******/ 			currentUpdatedModulesList = updatedModulesList;
/******/ 			return new Promise((resolve, reject) => {
/******/ 				waitingUpdateResolves[chunkId] = resolve;
/******/ 				// start update chunk loading
/******/ 				var url = __webpack_require__.p + __webpack_require__.hu(chunkId);
/******/ 				// create error before stack unwound to get useful stacktrace later
/******/ 				var error = new Error();
/******/ 				var loadingEnded = (event) => {
/******/ 					if(waitingUpdateResolves[chunkId]) {
/******/ 						waitingUpdateResolves[chunkId] = undefined
/******/ 						var errorType = event && (event.type === 'load' ? 'missing' : event.type);
/******/ 						var realSrc = event && event.target && event.target.src;
/******/ 						error.message = 'Loading hot update chunk ' + chunkId + ' failed.\n(' + errorType + ': ' + realSrc + ')';
/******/ 						error.name = 'ChunkLoadError';
/******/ 						error.type = errorType;
/******/ 						error.request = realSrc;
/******/ 						reject(error);
/******/ 					}
/******/ 				};
/******/ 				__webpack_require__.l(url, loadingEnded);
/******/ 			});
/******/ 		}
/******/ 		
/******/ 		self["webpackHotUpdatetgshiftschedule_card"] = (chunkId, moreModules, runtime) => {
/******/ 			for(var moduleId in moreModules) {
/******/ 				if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 					currentUpdate[moduleId] = moreModules[moduleId];
/******/ 					if(currentUpdatedModulesList) currentUpdatedModulesList.push(moduleId);
/******/ 				}
/******/ 			}
/******/ 			if(runtime) currentUpdateRuntime.push(runtime);
/******/ 			if(waitingUpdateResolves[chunkId]) {
/******/ 				waitingUpdateResolves[chunkId]();
/******/ 				waitingUpdateResolves[chunkId] = undefined;
/******/ 			}
/******/ 		};
/******/ 		
/******/ 		var currentUpdateChunks;
/******/ 		var currentUpdate;
/******/ 		var currentUpdateRemovedChunks;
/******/ 		var currentUpdateRuntime;
/******/ 		function applyHandler(options) {
/******/ 			if (__webpack_require__.f) delete __webpack_require__.f.jsonpHmr;
/******/ 			currentUpdateChunks = undefined;
/******/ 			function getAffectedModuleEffects(updateModuleId) {
/******/ 				var outdatedModules = [updateModuleId];
/******/ 				var outdatedDependencies = {};
/******/ 		
/******/ 				var queue = outdatedModules.map(function (id) {
/******/ 					return {
/******/ 						chain: [id],
/******/ 						id: id
/******/ 					};
/******/ 				});
/******/ 				while (queue.length > 0) {
/******/ 					var queueItem = queue.pop();
/******/ 					var moduleId = queueItem.id;
/******/ 					var chain = queueItem.chain;
/******/ 					var module = __webpack_require__.c[moduleId];
/******/ 					if (
/******/ 						!module ||
/******/ 						(module.hot._selfAccepted && !module.hot._selfInvalidated)
/******/ 					)
/******/ 						continue;
/******/ 					if (module.hot._selfDeclined) {
/******/ 						return {
/******/ 							type: "self-declined",
/******/ 							chain: chain,
/******/ 							moduleId: moduleId
/******/ 						};
/******/ 					}
/******/ 					if (module.hot._main) {
/******/ 						return {
/******/ 							type: "unaccepted",
/******/ 							chain: chain,
/******/ 							moduleId: moduleId
/******/ 						};
/******/ 					}
/******/ 					for (var i = 0; i < module.parents.length; i++) {
/******/ 						var parentId = module.parents[i];
/******/ 						var parent = __webpack_require__.c[parentId];
/******/ 						if (!parent) continue;
/******/ 						if (parent.hot._declinedDependencies[moduleId]) {
/******/ 							return {
/******/ 								type: "declined",
/******/ 								chain: chain.concat([parentId]),
/******/ 								moduleId: moduleId,
/******/ 								parentId: parentId
/******/ 							};
/******/ 						}
/******/ 						if (outdatedModules.indexOf(parentId) !== -1) continue;
/******/ 						if (parent.hot._acceptedDependencies[moduleId]) {
/******/ 							if (!outdatedDependencies[parentId])
/******/ 								outdatedDependencies[parentId] = [];
/******/ 							addAllToSet(outdatedDependencies[parentId], [moduleId]);
/******/ 							continue;
/******/ 						}
/******/ 						delete outdatedDependencies[parentId];
/******/ 						outdatedModules.push(parentId);
/******/ 						queue.push({
/******/ 							chain: chain.concat([parentId]),
/******/ 							id: parentId
/******/ 						});
/******/ 					}
/******/ 				}
/******/ 		
/******/ 				return {
/******/ 					type: "accepted",
/******/ 					moduleId: updateModuleId,
/******/ 					outdatedModules: outdatedModules,
/******/ 					outdatedDependencies: outdatedDependencies
/******/ 				};
/******/ 			}
/******/ 		
/******/ 			function addAllToSet(a, b) {
/******/ 				for (var i = 0; i < b.length; i++) {
/******/ 					var item = b[i];
/******/ 					if (a.indexOf(item) === -1) a.push(item);
/******/ 				}
/******/ 			}
/******/ 		
/******/ 			// at begin all updates modules are outdated
/******/ 			// the "outdated" status can propagate to parents if they don't accept the children
/******/ 			var outdatedDependencies = {};
/******/ 			var outdatedModules = [];
/******/ 			var appliedUpdate = {};
/******/ 		
/******/ 			var warnUnexpectedRequire = function warnUnexpectedRequire(module) {
/******/ 				console.warn(
/******/ 					"[HMR] unexpected require(" + module.id + ") to disposed module"
/******/ 				);
/******/ 			};
/******/ 		
/******/ 			for (var moduleId in currentUpdate) {
/******/ 				if (__webpack_require__.o(currentUpdate, moduleId)) {
/******/ 					var newModuleFactory = currentUpdate[moduleId];
/******/ 					var result = newModuleFactory
/******/ 						? getAffectedModuleEffects(moduleId)
/******/ 						: {
/******/ 								type: "disposed",
/******/ 								moduleId: moduleId
/******/ 							};
/******/ 					/** @type {Error|false} */
/******/ 					var abortError = false;
/******/ 					var doApply = false;
/******/ 					var doDispose = false;
/******/ 					var chainInfo = "";
/******/ 					if (result.chain) {
/******/ 						chainInfo = "\nUpdate propagation: " + result.chain.join(" -> ");
/******/ 					}
/******/ 					switch (result.type) {
/******/ 						case "self-declined":
/******/ 							if (options.onDeclined) options.onDeclined(result);
/******/ 							if (!options.ignoreDeclined)
/******/ 								abortError = new Error(
/******/ 									"Aborted because of self decline: " +
/******/ 										result.moduleId +
/******/ 										chainInfo
/******/ 								);
/******/ 							break;
/******/ 						case "declined":
/******/ 							if (options.onDeclined) options.onDeclined(result);
/******/ 							if (!options.ignoreDeclined)
/******/ 								abortError = new Error(
/******/ 									"Aborted because of declined dependency: " +
/******/ 										result.moduleId +
/******/ 										" in " +
/******/ 										result.parentId +
/******/ 										chainInfo
/******/ 								);
/******/ 							break;
/******/ 						case "unaccepted":
/******/ 							if (options.onUnaccepted) options.onUnaccepted(result);
/******/ 							if (!options.ignoreUnaccepted)
/******/ 								abortError = new Error(
/******/ 									"Aborted because " + moduleId + " is not accepted" + chainInfo
/******/ 								);
/******/ 							break;
/******/ 						case "accepted":
/******/ 							if (options.onAccepted) options.onAccepted(result);
/******/ 							doApply = true;
/******/ 							break;
/******/ 						case "disposed":
/******/ 							if (options.onDisposed) options.onDisposed(result);
/******/ 							doDispose = true;
/******/ 							break;
/******/ 						default:
/******/ 							throw new Error("Unexception type " + result.type);
/******/ 					}
/******/ 					if (abortError) {
/******/ 						return {
/******/ 							error: abortError
/******/ 						};
/******/ 					}
/******/ 					if (doApply) {
/******/ 						appliedUpdate[moduleId] = newModuleFactory;
/******/ 						addAllToSet(outdatedModules, result.outdatedModules);
/******/ 						for (moduleId in result.outdatedDependencies) {
/******/ 							if (__webpack_require__.o(result.outdatedDependencies, moduleId)) {
/******/ 								if (!outdatedDependencies[moduleId])
/******/ 									outdatedDependencies[moduleId] = [];
/******/ 								addAllToSet(
/******/ 									outdatedDependencies[moduleId],
/******/ 									result.outdatedDependencies[moduleId]
/******/ 								);
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 					if (doDispose) {
/******/ 						addAllToSet(outdatedModules, [result.moduleId]);
/******/ 						appliedUpdate[moduleId] = warnUnexpectedRequire;
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 			currentUpdate = undefined;
/******/ 		
/******/ 			// Store self accepted outdated modules to require them later by the module system
/******/ 			var outdatedSelfAcceptedModules = [];
/******/ 			for (var j = 0; j < outdatedModules.length; j++) {
/******/ 				var outdatedModuleId = outdatedModules[j];
/******/ 				var module = __webpack_require__.c[outdatedModuleId];
/******/ 				if (
/******/ 					module &&
/******/ 					(module.hot._selfAccepted || module.hot._main) &&
/******/ 					// removed self-accepted modules should not be required
/******/ 					appliedUpdate[outdatedModuleId] !== warnUnexpectedRequire &&
/******/ 					// when called invalidate self-accepting is not possible
/******/ 					!module.hot._selfInvalidated
/******/ 				) {
/******/ 					outdatedSelfAcceptedModules.push({
/******/ 						module: outdatedModuleId,
/******/ 						require: module.hot._requireSelf,
/******/ 						errorHandler: module.hot._selfAccepted
/******/ 					});
/******/ 				}
/******/ 			}
/******/ 		
/******/ 			var moduleOutdatedDependencies;
/******/ 		
/******/ 			return {
/******/ 				dispose: function () {
/******/ 					currentUpdateRemovedChunks.forEach(function (chunkId) {
/******/ 						delete installedChunks[chunkId];
/******/ 					});
/******/ 					currentUpdateRemovedChunks = undefined;
/******/ 		
/******/ 					var idx;
/******/ 					var queue = outdatedModules.slice();
/******/ 					while (queue.length > 0) {
/******/ 						var moduleId = queue.pop();
/******/ 						var module = __webpack_require__.c[moduleId];
/******/ 						if (!module) continue;
/******/ 		
/******/ 						var data = {};
/******/ 		
/******/ 						// Call dispose handlers
/******/ 						var disposeHandlers = module.hot._disposeHandlers;
/******/ 						for (j = 0; j < disposeHandlers.length; j++) {
/******/ 							disposeHandlers[j].call(null, data);
/******/ 						}
/******/ 						__webpack_require__.hmrD[moduleId] = data;
/******/ 		
/******/ 						// disable module (this disables requires from this module)
/******/ 						module.hot.active = false;
/******/ 		
/******/ 						// remove module from cache
/******/ 						delete __webpack_require__.c[moduleId];
/******/ 		
/******/ 						// when disposing there is no need to call dispose handler
/******/ 						delete outdatedDependencies[moduleId];
/******/ 		
/******/ 						// remove "parents" references from all children
/******/ 						for (j = 0; j < module.children.length; j++) {
/******/ 							var child = __webpack_require__.c[module.children[j]];
/******/ 							if (!child) continue;
/******/ 							idx = child.parents.indexOf(moduleId);
/******/ 							if (idx >= 0) {
/******/ 								child.parents.splice(idx, 1);
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 		
/******/ 					// remove outdated dependency from module children
/******/ 					var dependency;
/******/ 					for (var outdatedModuleId in outdatedDependencies) {
/******/ 						if (__webpack_require__.o(outdatedDependencies, outdatedModuleId)) {
/******/ 							module = __webpack_require__.c[outdatedModuleId];
/******/ 							if (module) {
/******/ 								moduleOutdatedDependencies =
/******/ 									outdatedDependencies[outdatedModuleId];
/******/ 								for (j = 0; j < moduleOutdatedDependencies.length; j++) {
/******/ 									dependency = moduleOutdatedDependencies[j];
/******/ 									idx = module.children.indexOf(dependency);
/******/ 									if (idx >= 0) module.children.splice(idx, 1);
/******/ 								}
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 				},
/******/ 				apply: function (reportError) {
/******/ 					// insert new code
/******/ 					for (var updateModuleId in appliedUpdate) {
/******/ 						if (__webpack_require__.o(appliedUpdate, updateModuleId)) {
/******/ 							__webpack_require__.m[updateModuleId] = appliedUpdate[updateModuleId];
/******/ 						}
/******/ 					}
/******/ 		
/******/ 					// run new runtime modules
/******/ 					for (var i = 0; i < currentUpdateRuntime.length; i++) {
/******/ 						currentUpdateRuntime[i](__webpack_require__);
/******/ 					}
/******/ 		
/******/ 					// call accept handlers
/******/ 					for (var outdatedModuleId in outdatedDependencies) {
/******/ 						if (__webpack_require__.o(outdatedDependencies, outdatedModuleId)) {
/******/ 							var module = __webpack_require__.c[outdatedModuleId];
/******/ 							if (module) {
/******/ 								moduleOutdatedDependencies =
/******/ 									outdatedDependencies[outdatedModuleId];
/******/ 								var callbacks = [];
/******/ 								var errorHandlers = [];
/******/ 								var dependenciesForCallbacks = [];
/******/ 								for (var j = 0; j < moduleOutdatedDependencies.length; j++) {
/******/ 									var dependency = moduleOutdatedDependencies[j];
/******/ 									var acceptCallback =
/******/ 										module.hot._acceptedDependencies[dependency];
/******/ 									var errorHandler =
/******/ 										module.hot._acceptedErrorHandlers[dependency];
/******/ 									if (acceptCallback) {
/******/ 										if (callbacks.indexOf(acceptCallback) !== -1) continue;
/******/ 										callbacks.push(acceptCallback);
/******/ 										errorHandlers.push(errorHandler);
/******/ 										dependenciesForCallbacks.push(dependency);
/******/ 									}
/******/ 								}
/******/ 								for (var k = 0; k < callbacks.length; k++) {
/******/ 									try {
/******/ 										callbacks[k].call(null, moduleOutdatedDependencies);
/******/ 									} catch (err) {
/******/ 										if (typeof errorHandlers[k] === "function") {
/******/ 											try {
/******/ 												errorHandlers[k](err, {
/******/ 													moduleId: outdatedModuleId,
/******/ 													dependencyId: dependenciesForCallbacks[k]
/******/ 												});
/******/ 											} catch (err2) {
/******/ 												if (options.onErrored) {
/******/ 													options.onErrored({
/******/ 														type: "accept-error-handler-errored",
/******/ 														moduleId: outdatedModuleId,
/******/ 														dependencyId: dependenciesForCallbacks[k],
/******/ 														error: err2,
/******/ 														originalError: err
/******/ 													});
/******/ 												}
/******/ 												if (!options.ignoreErrored) {
/******/ 													reportError(err2);
/******/ 													reportError(err);
/******/ 												}
/******/ 											}
/******/ 										} else {
/******/ 											if (options.onErrored) {
/******/ 												options.onErrored({
/******/ 													type: "accept-errored",
/******/ 													moduleId: outdatedModuleId,
/******/ 													dependencyId: dependenciesForCallbacks[k],
/******/ 													error: err
/******/ 												});
/******/ 											}
/******/ 											if (!options.ignoreErrored) {
/******/ 												reportError(err);
/******/ 											}
/******/ 										}
/******/ 									}
/******/ 								}
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 		
/******/ 					// Load self accepted modules
/******/ 					for (var o = 0; o < outdatedSelfAcceptedModules.length; o++) {
/******/ 						var item = outdatedSelfAcceptedModules[o];
/******/ 						var moduleId = item.module;
/******/ 						try {
/******/ 							item.require(moduleId);
/******/ 						} catch (err) {
/******/ 							if (typeof item.errorHandler === "function") {
/******/ 								try {
/******/ 									item.errorHandler(err, {
/******/ 										moduleId: moduleId,
/******/ 										module: __webpack_require__.c[moduleId]
/******/ 									});
/******/ 								} catch (err1) {
/******/ 									if (options.onErrored) {
/******/ 										options.onErrored({
/******/ 											type: "self-accept-error-handler-errored",
/******/ 											moduleId: moduleId,
/******/ 											error: err1,
/******/ 											originalError: err
/******/ 										});
/******/ 									}
/******/ 									if (!options.ignoreErrored) {
/******/ 										reportError(err1);
/******/ 										reportError(err);
/******/ 									}
/******/ 								}
/******/ 							} else {
/******/ 								if (options.onErrored) {
/******/ 									options.onErrored({
/******/ 										type: "self-accept-errored",
/******/ 										moduleId: moduleId,
/******/ 										error: err
/******/ 									});
/******/ 								}
/******/ 								if (!options.ignoreErrored) {
/******/ 									reportError(err);
/******/ 								}
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 		
/******/ 					return outdatedModules;
/******/ 				}
/******/ 			};
/******/ 		}
/******/ 		__webpack_require__.hmrI.jsonp = function (moduleId, applyHandlers) {
/******/ 			if (!currentUpdate) {
/******/ 				currentUpdate = {};
/******/ 				currentUpdateRuntime = [];
/******/ 				currentUpdateRemovedChunks = [];
/******/ 				applyHandlers.push(applyHandler);
/******/ 			}
/******/ 			if (!__webpack_require__.o(currentUpdate, moduleId)) {
/******/ 				currentUpdate[moduleId] = __webpack_require__.m[moduleId];
/******/ 			}
/******/ 		};
/******/ 		__webpack_require__.hmrC.jsonp = function (
/******/ 			chunkIds,
/******/ 			removedChunks,
/******/ 			removedModules,
/******/ 			promises,
/******/ 			applyHandlers,
/******/ 			updatedModulesList
/******/ 		) {
/******/ 			applyHandlers.push(applyHandler);
/******/ 			currentUpdateChunks = {};
/******/ 			currentUpdateRemovedChunks = removedChunks;
/******/ 			currentUpdate = removedModules.reduce(function (obj, key) {
/******/ 				obj[key] = false;
/******/ 				return obj;
/******/ 			}, {});
/******/ 			currentUpdateRuntime = [];
/******/ 			chunkIds.forEach(function (chunkId) {
/******/ 				if (
/******/ 					__webpack_require__.o(installedChunks, chunkId) &&
/******/ 					installedChunks[chunkId] !== undefined
/******/ 				) {
/******/ 					promises.push(loadUpdateChunk(chunkId, updatedModulesList));
/******/ 					currentUpdateChunks[chunkId] = true;
/******/ 				} else {
/******/ 					currentUpdateChunks[chunkId] = false;
/******/ 				}
/******/ 			});
/******/ 			if (__webpack_require__.f) {
/******/ 				__webpack_require__.f.jsonpHmr = function (chunkId, promises) {
/******/ 					if (
/******/ 						currentUpdateChunks &&
/******/ 						__webpack_require__.o(currentUpdateChunks, chunkId) &&
/******/ 						!currentUpdateChunks[chunkId]
/******/ 					) {
/******/ 						promises.push(loadUpdateChunk(chunkId));
/******/ 						currentUpdateChunks[chunkId] = true;
/******/ 					}
/******/ 				};
/******/ 			}
/******/ 		};
/******/ 		
/******/ 		__webpack_require__.hmrM = () => {
/******/ 			if (typeof fetch === "undefined") throw new Error("No browser support: need fetch API");
/******/ 			return fetch(__webpack_require__.p + __webpack_require__.hmrF()).then((response) => {
/******/ 				if(response.status === 404) return; // no update available
/******/ 				if(!response.ok) throw new Error("Failed to fetch update manifest " + response.statusText);
/******/ 				return response.json();
/******/ 			});
/******/ 		};
/******/ 		
/******/ 		// no on chunks loaded
/******/ 		
/******/ 		// install a JSONP callback for chunk loading
/******/ 		var webpackJsonpCallback = (parentChunkLoadingFunction, data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			// add "moreModules" to the modules object,
/******/ 			// then flag all "chunkIds" as loaded and fire callback
/******/ 			var moduleId, chunkId, i = 0;
/******/ 			if(chunkIds.some((id) => (installedChunks[id] !== 0))) {
/******/ 				for(moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 					}
/******/ 				}
/******/ 				if(runtime) var result = runtime(__webpack_require__);
/******/ 			}
/******/ 			if(parentChunkLoadingFunction) parentChunkLoadingFunction(data);
/******/ 			for(;i < chunkIds.length; i++) {
/******/ 				chunkId = chunkIds[i];
/******/ 				if(__webpack_require__.o(installedChunks, chunkId) && installedChunks[chunkId]) {
/******/ 					installedChunks[chunkId][0]();
/******/ 				}
/******/ 				installedChunks[chunkId] = 0;
/******/ 			}
/******/ 		
/******/ 		}
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunktgshiftschedule_card"] = self["webpackChunktgshiftschedule_card"] || [];
/******/ 		chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
/******/ 		chunkLoadingGlobal.push = webpackJsonpCallback.bind(null, chunkLoadingGlobal.push.bind(chunkLoadingGlobal));
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// module cache are used so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	__webpack_require__("./node_modules/webpack-dev-server/client/index.js?protocol=ws%3A&hostname=localhost&port=9000&pathname=%2Fws&logging=verbose&progress=true&overlay=%7B%22errors%22%3Atrue%2C%22warnings%22%3Atrue%7D&reconnect=10&hot=true&live-reload=true");
/******/ 	__webpack_require__("./node_modules/webpack/hot/dev-server.js");
/******/ 	var __webpack_exports__ = __webpack_require__("./src/card.js");
/******/ 	
/******/ })()
;
//# sourceMappingURL=tgshiftschedule-card.js.map