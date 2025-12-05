/*! For license information please see tgshiftschedule-card.js.LICENSE.txt */
(()=>{"use strict";var e,t,i={},n={};function r(e){var t=n[e];if(void 0!==t)return t.exports;var s=n[e]={exports:{}};return i[e](s,s.exports,r),s.exports}r.m=i,r.d=(e,t)=>{for(var i in t)r.o(t,i)&&!r.o(e,i)&&Object.defineProperty(e,i,{enumerable:!0,get:t[i]})},r.f={},r.e=e=>Promise.all(Object.keys(r.f).reduce(((t,i)=>(r.f[i](e,t),t)),[])),r.u=e=>e+".tgshiftschedule-card.js",r.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),r.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),e={},t="tgshiftschedule-card:",r.l=(i,n,s,a)=>{if(e[i])e[i].push(n);else{var o,l;if(void 0!==s)for(var c=document.getElementsByTagName("script"),d=0;d<c.length;d++){var h=c[d];if(h.getAttribute("src")==i||h.getAttribute("data-webpack")==t+s){o=h;break}}o||(l=!0,(o=document.createElement("script")).charset="utf-8",o.timeout=120,r.nc&&o.setAttribute("nonce",r.nc),o.setAttribute("data-webpack",t+s),o.src=i),e[i]=[n];var u=(t,n)=>{o.onerror=o.onload=null,clearTimeout(f);var r=e[i];if(delete e[i],o.parentNode&&o.parentNode.removeChild(o),r&&r.forEach((e=>e(n))),t)return t(n)},f=setTimeout(u.bind(null,void 0,{type:"timeout",target:o}),12e4);o.onerror=u.bind(null,o.onerror),o.onload=u.bind(null,o.onload),l&&document.head.appendChild(o)}},r.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},(()=>{var e;r.g.importScripts&&(e=r.g.location+"");var t=r.g.document;if(!e&&t&&(t.currentScript&&"SCRIPT"===t.currentScript.tagName.toUpperCase()&&(e=t.currentScript.src),!e)){var i=t.getElementsByTagName("script");if(i.length)for(var n=i.length-1;n>-1&&(!e||!/^http(s?):/.test(e));)e=i[n--].src}if(!e)throw new Error("Automatic publicPath is not supported in this browser");e=e.replace(/^blob:/,"").replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^\/]+$/,"/"),r.p=e})(),(()=>{var e={792:0};r.f.j=(t,i)=>{var n=r.o(e,t)?e[t]:void 0;if(0!==n)if(n)i.push(n[2]);else{var s=new Promise(((i,r)=>n=e[t]=[i,r]));i.push(n[2]=s);var a=r.p+r.u(t),o=new Error;r.l(a,(i=>{if(r.o(e,t)&&(0!==(n=e[t])&&(e[t]=void 0),n)){var s=i&&("load"===i.type?"missing":i.type),a=i&&i.target&&i.target.src;o.message="Loading chunk "+t+" failed.\n("+s+": "+a+")",o.name="ChunkLoadError",o.type=s,o.request=a,n[1](o)}}),"chunk-"+t,t)}};var t=(t,i)=>{var n,s,[a,o,l]=i,c=0;if(a.some((t=>0!==e[t]))){for(n in o)r.o(o,n)&&(r.m[n]=o[n]);l&&l(r)}for(t&&t(i);c<a.length;c++)s=a[c],r.o(e,s)&&e[s]&&e[s][0](),e[s]=0},i=self.webpackChunktgshiftschedule_card=self.webpackChunktgshiftschedule_card||[];i.forEach(t.bind(null,0)),i.push=t.bind(null,i.push.bind(i))})();const s=globalThis,a=s.ShadowRoot&&(void 0===s.ShadyCSS||s.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,o=Symbol(),l=new WeakMap;class c{constructor(e,t,i){if(this._$cssResult$=!0,i!==o)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(a&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=l.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&l.set(t,e))}return e}toString(){return this.cssText}}const d=e=>new c("string"==typeof e?e:e+"",void 0,o),h=(e,...t)=>{const i=1===e.length?e[0]:t.reduce(((t,i,n)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[n+1]),e[0]);return new c(i,e,o)},u=a?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return d(t)})(e):e,{is:f,defineProperty:g,getOwnPropertyDescriptor:p,getOwnPropertyNames:m,getOwnPropertySymbols:y,getPrototypeOf:b}=Object,_=globalThis,v=_.trustedTypes,w=v?v.emptyScript:"",$=_.reactiveElementPolyfillSupport,x=(e,t)=>e,E={toAttribute(e,t){switch(t){case Boolean:e=e?w:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},k=(e,t)=>!f(e,t),C={attribute:!0,type:String,converter:E,reflect:!1,useDefault:!1,hasChanged:k};Symbol.metadata??=Symbol("metadata"),_.litPropertyMetadata??=new WeakMap;class S extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=C){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),n=this.getPropertyDescriptor(e,i,t);void 0!==n&&g(this.prototype,e,n)}}static getPropertyDescriptor(e,t,i){const{get:n,set:r}=p(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:n,set(t){const s=n?.call(this);r?.call(this,t),this.requestUpdate(e,s,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??C}static _$Ei(){if(this.hasOwnProperty(x("elementProperties")))return;const e=b(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(x("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(x("properties"))){const e=this.properties,t=[...m(e),...y(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const i=this._$Eu(e,t);void 0!==i&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(u(e))}else void 0!==e&&t.push(u(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise((e=>this.enableUpdating=e)),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach((e=>e(this)))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,t)=>{if(a)e.adoptedStyleSheets=t.map((e=>e instanceof CSSStyleSheet?e:e.styleSheet));else for(const i of t){const t=document.createElement("style"),n=s.litNonce;void 0!==n&&t.setAttribute("nonce",n),t.textContent=i.cssText,e.appendChild(t)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach((e=>e.hostConnected?.()))}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach((e=>e.hostDisconnected?.()))}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),n=this.constructor._$Eu(e,i);if(void 0!==n&&!0===i.reflect){const r=(void 0!==i.converter?.toAttribute?i.converter:E).toAttribute(t,i.type);this._$Em=e,null==r?this.removeAttribute(n):this.setAttribute(n,r),this._$Em=null}}_$AK(e,t){const i=this.constructor,n=i._$Eh.get(e);if(void 0!==n&&this._$Em!==n){const e=i.getPropertyOptions(n),r="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:E;this._$Em=n,this[n]=r.fromAttribute(t,e.type)??this._$Ej?.get(n)??null,this._$Em=null}}requestUpdate(e,t,i){if(void 0!==e){const n=this.constructor,r=this[e];if(i??=n.getPropertyOptions(e),!((i.hasChanged??k)(r,t)||i.useDefault&&i.reflect&&r===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:n,wrapped:r},s){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,s??t??this[e]),!0!==r||void 0!==s)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===n&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,n=this[t];!0!==e||this._$AL.has(t)||void 0===n||this.C(t,void 0,i,n)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach((e=>e.hostUpdate?.())),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach((e=>e.hostUpdated?.())),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach((e=>this._$ET(e,this[e]))),this._$EM()}updated(e){}firstUpdated(e){}}S.elementStyles=[],S.shadowRootOptions={mode:"open"},S[x("elementProperties")]=new Map,S[x("finalized")]=new Map,$?.({ReactiveElement:S}),(_.reactiveElementVersions??=[]).push("2.1.0");const M=globalThis,A=M.trustedTypes,D=A?A.createPolicy("lit-html",{createHTML:e=>e}):void 0,O="$lit$",T=`lit$${Math.random().toFixed(9).slice(2)}$`,j="?"+T,P=`<${j}>`,U=document,R=()=>U.createComment(""),N=e=>null===e||"object"!=typeof e&&"function"!=typeof e,B=Array.isArray,I="[ \t\n\f\r]",H=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,z=/-->/g,L=/>/g,W=RegExp(`>|${I}(?:([^\\s"'>=/]+)(${I}*=${I}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),V=/'/g,F=/"/g,q=/^(?:script|style|textarea|title)$/i,K=e=>(t,...i)=>({_$litType$:e,strings:t,values:i}),Y=K(1),G=(K(2),K(3),Symbol.for("lit-noChange")),J=Symbol.for("lit-nothing"),Z=new WeakMap,Q=U.createTreeWalker(U,129);function X(e,t){if(!B(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==D?D.createHTML(t):t}const ee=(e,t)=>{const i=e.length-1,n=[];let r,s=2===t?"<svg>":3===t?"<math>":"",a=H;for(let t=0;t<i;t++){const i=e[t];let o,l,c=-1,d=0;for(;d<i.length&&(a.lastIndex=d,l=a.exec(i),null!==l);)d=a.lastIndex,a===H?"!--"===l[1]?a=z:void 0!==l[1]?a=L:void 0!==l[2]?(q.test(l[2])&&(r=RegExp("</"+l[2],"g")),a=W):void 0!==l[3]&&(a=W):a===W?">"===l[0]?(a=r??H,c=-1):void 0===l[1]?c=-2:(c=a.lastIndex-l[2].length,o=l[1],a=void 0===l[3]?W:'"'===l[3]?F:V):a===F||a===V?a=W:a===z||a===L?a=H:(a=W,r=void 0);const h=a===W&&e[t+1].startsWith("/>")?" ":"";s+=a===H?i+P:c>=0?(n.push(o),i.slice(0,c)+O+i.slice(c)+T+h):i+T+(-2===c?t:h)}return[X(e,s+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),n]};class te{constructor({strings:e,_$litType$:t},i){let n;this.parts=[];let r=0,s=0;const a=e.length-1,o=this.parts,[l,c]=ee(e,t);if(this.el=te.createElement(l,i),Q.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(n=Q.nextNode())&&o.length<a;){if(1===n.nodeType){if(n.hasAttributes())for(const e of n.getAttributeNames())if(e.endsWith(O)){const t=c[s++],i=n.getAttribute(e).split(T),a=/([.?@])?(.*)/.exec(t);o.push({type:1,index:r,name:a[2],strings:i,ctor:"."===a[1]?ae:"?"===a[1]?oe:"@"===a[1]?le:se}),n.removeAttribute(e)}else e.startsWith(T)&&(o.push({type:6,index:r}),n.removeAttribute(e));if(q.test(n.tagName)){const e=n.textContent.split(T),t=e.length-1;if(t>0){n.textContent=A?A.emptyScript:"";for(let i=0;i<t;i++)n.append(e[i],R()),Q.nextNode(),o.push({type:2,index:++r});n.append(e[t],R())}}}else if(8===n.nodeType)if(n.data===j)o.push({type:2,index:r});else{let e=-1;for(;-1!==(e=n.data.indexOf(T,e+1));)o.push({type:7,index:r}),e+=T.length-1}r++}}static createElement(e,t){const i=U.createElement("template");return i.innerHTML=e,i}}function ie(e,t,i=e,n){if(t===G)return t;let r=void 0!==n?i._$Co?.[n]:i._$Cl;const s=N(t)?void 0:t._$litDirective$;return r?.constructor!==s&&(r?._$AO?.(!1),void 0===s?r=void 0:(r=new s(e),r._$AT(e,i,n)),void 0!==n?(i._$Co??=[])[n]=r:i._$Cl=r),void 0!==r&&(t=ie(e,r._$AS(e,t.values),r,n)),t}class ne{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,n=(e?.creationScope??U).importNode(t,!0);Q.currentNode=n;let r=Q.nextNode(),s=0,a=0,o=i[0];for(;void 0!==o;){if(s===o.index){let t;2===o.type?t=new re(r,r.nextSibling,this,e):1===o.type?t=new o.ctor(r,o.name,o.strings,this,e):6===o.type&&(t=new ce(r,this,e)),this._$AV.push(t),o=i[++a]}s!==o?.index&&(r=Q.nextNode(),s++)}return Q.currentNode=U,n}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class re{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,n){this.type=2,this._$AH=J,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=n,this._$Cv=n?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=ie(this,e,t),N(e)?e===J||null==e||""===e?(this._$AH!==J&&this._$AR(),this._$AH=J):e!==this._$AH&&e!==G&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>B(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==J&&N(this._$AH)?this._$AA.nextSibling.data=e:this.T(U.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,n="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=te.createElement(X(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===n)this._$AH.p(t);else{const e=new ne(n,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=Z.get(e.strings);return void 0===t&&Z.set(e.strings,t=new te(e)),t}k(e){B(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,n=0;for(const r of e)n===t.length?t.push(i=new re(this.O(R()),this.O(R()),this,this.options)):i=t[n],i._$AI(r),n++;n<t.length&&(this._$AR(i&&i._$AB.nextSibling,n),t.length=n)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e&&e!==this._$AB;){const t=e.nextSibling;e.remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class se{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,n,r){this.type=1,this._$AH=J,this._$AN=void 0,this.element=e,this.name=t,this._$AM=n,this.options=r,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=J}_$AI(e,t=this,i,n){const r=this.strings;let s=!1;if(void 0===r)e=ie(this,e,t,0),s=!N(e)||e!==this._$AH&&e!==G,s&&(this._$AH=e);else{const n=e;let a,o;for(e=r[0],a=0;a<r.length-1;a++)o=ie(this,n[i+a],t,a),o===G&&(o=this._$AH[a]),s||=!N(o)||o!==this._$AH[a],o===J?e=J:e!==J&&(e+=(o??"")+r[a+1]),this._$AH[a]=o}s&&!n&&this.j(e)}j(e){e===J?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class ae extends se{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===J?void 0:e}}class oe extends se{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==J)}}class le extends se{constructor(e,t,i,n,r){super(e,t,i,n,r),this.type=5}_$AI(e,t=this){if((e=ie(this,e,t,0)??J)===G)return;const i=this._$AH,n=e===J&&i!==J||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,r=e!==J&&(i===J||n);n&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class ce{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){ie(this,e)}}const de=M.litHtmlPolyfillSupport;de?.(te,re),(M.litHtmlVersions??=[]).push("3.3.0");const he=globalThis;class ue extends S{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{const n=i?.renderBefore??t;let r=n._$litPart$;if(void 0===r){const e=i?.renderBefore??null;n._$litPart$=r=new re(t.insertBefore(R(),e),e,void 0,i??{})}return r._$AI(e),r})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return G}}ue._$litElement$=!0,ue.finalized=!0,he.litElementHydrateSupport?.({LitElement:ue});const fe=he.litElementPolyfillSupport;fe?.({LitElement:ue}),(he.litElementVersions??=[]).push("4.2.0");const ge="2025.12-0015",pe="tgshiftschedule-card",me="TG Schichtplan Card",ye="false";function be(e,t,i){return(t=function(e){var t=function(e){if("object"!=typeof e||!e)return e;var t=e[Symbol.toPrimitive];if(void 0!==t){var i=t.call(e,"string");if("object"!=typeof i)return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(e)}(e);return"symbol"==typeof t?t:t+""}(t))in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i,e}class _e{constructor(e,t,i,n){this.cardName=e||this.constructor.cardName||null,this.debugMode=t||this.constructor.debugMode||"true",this.className=i||this.constructor.className||null,this.version=n||this.constructor.version||null,this.getCardInfoString=[`%c${this.cardName}%c${this.version}%c`,"background: #9c27b0; color: white; padding: 2px 6px; border-top-left-radius: 12px; border-bottom-left-radius: 12px; font-weight: bold;","background: #00bcd4; color: white; padding: 2px 6px; border-top-right-radius: 12px; border-bottom-right-radius: 12px; font-weight: bold;",""]}_debug(...e){if(!this.debugMode)return;let t=null,i=null,n=null,r=null;Array.isArray(e[0])&&1===e[0].length&&e[0][0]&&"object"==typeof e[0][0]&&e[0][0].constructor&&(e[0][0].cardName||e[0][0].constructor.className)?(r=e[0][0],e=e.slice(1)):r=this,t=r.constructor.className?r.constructor.className:r.tagName?r.tagName.toLowerCase().replace(/[^a-z0-9]/g,""):r.constructor.name&&r.constructor.name.length>2?r.constructor.name:r.cardName?r.cardName:"unknownClass",n=r.cardName||this.cardName||"unknownCard";const s=this.debugMode.split(",").map((e=>e.trim().toLowerCase()));if(!("true"===s[0].toLowerCase()?!s.slice(1).includes(t.toLowerCase()):s.includes(t.toLowerCase())))return;if(!i)try{const e=(new Error).stack.split("\n")[2],t=[/at\s+\w+\.(\w+)/,/(\w+)@/,/(\w+)\s+\(/,/at\s+(\w+)/];for(const n of t){const t=e.match(n);if(t){i=t[1];break}}}catch(e){i=null}i=i||"unknownMethod";let a=`[${n}]:[${t}]:[${i}]`;for(;a.length<50;)a+=" "}}function ve(e,t,i){return(t=function(e){var t=function(e){if("object"!=typeof e||!e)return e;var t=e[Symbol.toPrimitive];if(void 0!==t){var i=t.call(e,"string");if("object"!=typeof i)return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(e)}(e);return"symbol"==typeof t?t:t+""}(t))in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i,e}be(_e,"cardName",me),be(_e,"debugMode",ye),be(_e,"className","TgCardHelper"),be(_e,"version",ge);class we extends ue{constructor(){super(),this.dM=`${this.constructor.className}: `,this.cardName=this.constructor.cardName,this.version=this.constructor.version,this.debugMode=this.constructor.debugMode,this.useDummyData=this.constructor.useDummyData,this.showVersion=this.constructor.showVersion,this.tgCardHelper=new _e(this.constructor.cardName,this.constructor.debugMode),this.getCardInfoString=this.tgCardHelper.getCardInfoString,this._debug("SuperBase-Konstruktor wird aufgerufen")}registerMeForChangeNotifys(e="",t=this){const i=`${this.dM||"?: "}registerMeForChangeNotifys() `;this._debug(`${i} Aufruf`,{eventTypes:e,that:t}),this.dispatchEvent(new CustomEvent("registerMeForChanges",{bubbles:!0,composed:!0,detail:{component:t,callback:this._handleOnChangeNotifys.bind(this),eventType:e,immediately:!0}}))}_handleOnChangeNotifys(e){const t=`${this.dM||"?: "}_handleOnChangeNotifys() `;this._debug(`${t}aufgerufen`,{eventdata:e});for(const i of Object.keys(e)){const n="_handleOnChangeNotify_"+i.charAt(0).toUpperCase()+i.slice(1);"function"==typeof this[n]?(this._debug(`${t} ${n} aufgerufen`,{eventdata:e[i]}),this[n](e[i])):this._debug(`${t} ${n} nicht gefunden`,{eventdata:e[i]})}}_debug(...e){this.tgCardHelper._debug([this],...e)}}var $e,xe,Ee,ke,Ce,Se,Me,Ae;function De(e,t,i,n){var r=Oe(Te(1&n?e.prototype:e),t,i);return 2&n&&"function"==typeof r?function(e){return r.apply(i,e)}:r}function Oe(){return Oe="undefined"!=typeof Reflect&&Reflect.get?Reflect.get.bind():function(e,t,i){var n=function(e,t){for(;!{}.hasOwnProperty.call(e,t)&&null!==(e=Te(e)););return e}(e,t);if(n){var r=Object.getOwnPropertyDescriptor(n,t);return r.get?r.get.call(arguments.length<3?e:i):r.value}},Oe.apply(null,arguments)}function Te(e){return Te=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(e){return e.__proto__||Object.getPrototypeOf(e)},Te(e)}function je(e,t,i){return(t=function(e){var t=function(e){if("object"!=typeof e||!e)return e;var t=e[Symbol.toPrimitive];if(void 0!==t){var i=t.call(e,"string");if("object"!=typeof i)return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(e)}(e);return"symbol"==typeof t?t:t+""}(t))in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i,e}ve(we,"cardName",me),ve(we,"version",ge),ve(we,"debugMode",ye),ve(we,"useDummyData","false"),ve(we,"showVersion",!1),ve(we,"className","SuperBase"),ve(we,"properties",{hass:{type:Object},config:{type:Object}}),ve(we,"styles",[h`
      :host {
        display: block;
      }
    `]);class Pe extends we{constructor(){super(),this.dM=`${this.constructor.className}: `,this._selectedTab=0,this._debug("CardBase-Modul wird geladen"),this.informAtChangesClients=[],this._registeredEventTypes=new Set,this.addEventListener("registerMeForChanges",this._onRegisterMeForChanges.bind(this))}async firstUpdated(){this._debug("CardBase firstUpdated: Start"),await super.firstUpdated(),this._debug("CardBase firstUpdated: Ende")}setConfig(e){if(this._debug("setConfig wird aufgerufen mit:",e),!e)throw new Error("Keine Konfiguration angegeben");const t=!this.config||0===Object.keys(this.config).length;this.config=t?{...this.getDefaultConfig(),...e}:{...this.config,...e},this._debug("config nach setConfig:",this.config)}getDefaultConfig(){return this._debug("getDefaultConfig wird aufgerufen"),{entity:"input_text.arbeitszeiten",numberOfMonths:14,initialDisplayedMonths:2,selectedCalendar:"a",calendars:[{shortcut:"a",name:"Kalender A",color:"#ff9800",enabled:!0,statusRelevant:!0},{shortcut:"b",name:"Kalender B",color:"#ff0000",enabled:!1,statusRelevant:!0},{shortcut:"c",name:"Kalender C",color:"#00ff00",enabled:!1,statusRelevant:!0},{shortcut:"d",name:"Kalender D",color:"#0000ff",enabled:!1,statusRelevant:!0},{shortcut:"e",name:"Kalender E",color:"#ffff00",enabled:!1,statusRelevant:!0}],holidays:{neujahr:!0,heilige_drei_koenige:!0,tag_der_arbeit:!0,friedensfest:!0,mariae_himmelfahrt:!0,tag_der_deutschen_einheit:!0,reformationstag:!0,allerheiligen:!0,weihnachten_1:!0,weihnachten_2:!0,karfreitag:!0,ostermontag:!0,christi_himmelfahrt:!0,pfingstmontag:!0,fronleichnam:!0,busstag:!0}}}render(e=""){return this._debug("render wird aufgerufen"),html`
      <ha-card>
        <div class="card-content">${e}</div>
        ${this.showVersion?html` <div class="version">Version: ${this.version}</div> `:""}
      </ha-card>
    `}_onRegisterMeForChanges(e){this._debug("Registrierungsanfrage empfangen",{component:e.target,detail:e.detail});const{component:t,callback:i,eventType:n="",immediately:r=!1}=e.detail;t&&"function"==typeof i?(this.registerInformAtChangesClients(t,n,r,i),this._debug("Komponente erfolgreich registriert",{component:t.tagName||t.constructor.name,eventType:n})):this._debug("Registrierung fehlgeschlagen",{componentExists:!!t,hasCallback:"function"==typeof i})}registerInformAtChangesClients(e,t="",i=!1,n=null){const r=`${this.dM||"?: "}registerInformAtChangesClients() `;this._debug(`${r}Anfrage`,{me:e,newEventType:t});const s=Array.isArray(t)?t.map((e=>e.toLowerCase())).sort():"string"==typeof t?t.split(",").map((e=>e.trim().toLowerCase())).filter((e=>e.length>0)).sort():[],a=this.informAtChangesClients.find((t=>t.me===e));let o=[];a&&(o=Array.isArray(a.eventType)?a.eventType.map((e=>e.toLowerCase())).sort():"string"==typeof a.eventType?a.eventType.split(",").map((e=>e.trim().toLowerCase())).filter((e=>e.length>0)).sort():[]);const l=s.filter((e=>!o.includes(e)));if(a&&0===l.length)return this._debug(`${r}Client war bereits mit allen Typen registriert`,{me:e,requestedEventTypes:s,existingEventTypes:o}),!1;if(a){const t=[...o,...l].sort();a.eventType=t,this._debug(`${r}Neue EventTypes hinzugefügt`,{me:e,newEventTypes:l,existingEventTypes:o,combinedEventTypes:t})}else this.informAtChangesClients.push({me:e,eventType:l,callback:n}),this._debug(`${r}Neuer Informer registriert`,{me:e,newEventTypes:l,totalObservers:this.informAtChangesClients.length});return l.forEach((t=>{this._registeredEventTypes.has(t)?this._debug(`${r}Listener für EventType bereits vorhanden`,{eventType:t}):(this._debug(`${r}Füge Listener für EventType hinzu`,{eventType:t}),this.addEventListener(t+"-event",this._notifyClientsAtChanges.bind(this)),this._registeredEventTypes.add(t));const n="_onRegisterMeFor_"+t.charAt(0).toUpperCase()+t.slice(1);this._debug(`${r}Registriere Komponente für EnvSniffer-Änderungen`,{fkt:n}),"function"==typeof this[n]&&this[n](i,e)})),!0}_notifyClientsAtChanges(e){this._debug("_notifyClientsAtChanges() Anfrage",{event:e});const t=e.type.replace("-event",""),i="_on"+t.charAt(0).toUpperCase()+t.slice(1);this._debug("_notifyClientsAtChanges() EventType extrahiert",{originalEventType:e.type,extractedEventType:t,clients:this.informAtChangesClients,fkt:i}),this.informAtChangesClients.forEach((n=>{if(t&&n.eventType.includes(t)&&n.me&&(n.me instanceof Element||n.me.nodeType)&&(document.contains(n.me)||n.me.isConnected)){const r="function"==typeof this[i]?this[i](n.me,e):e.detail||{},s={[t]:r};if(r&&n.callback&&"function"==typeof n.callback)try{this._debug("_notifyClientsAtChanges() Client benachrichtigen",{client:n.me.constructor.name,eventType:t,data:s}),n.callback(s)}catch(e){}}}))}}function Ue(){return Ue="undefined"!=typeof Reflect&&Reflect.get?Reflect.get.bind():function(e,t,i){var n=function(e,t){for(;!{}.hasOwnProperty.call(e,t)&&null!==(e=Re(e)););return e}(e,t);if(n){var r=Object.getOwnPropertyDescriptor(n,t);return r.get?r.get.call(arguments.length<3?e:i):r.value}},Ue.apply(null,arguments)}function Re(e){return Re=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(e){return e.__proto__||Object.getPrototypeOf(e)},Re(e)}function Ne(e,t,i){return(t=function(e){var t=function(e){if("object"!=typeof e||!e)return e;var t=e[Symbol.toPrimitive];if(void 0!==t){var i=t.call(e,"string");if("object"!=typeof i)return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(e)}(e);return"symbol"==typeof t?t:t+""}(t))in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i,e}$e=Pe,je(Pe,"className","CardBase"),je(Pe,"properties",{...De($e,"properties",$e),_selectedTab:{type:Number}}),je(Pe,"styles",[De($e,"styles",$e),h`
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
    `]);class Be extends we{constructor(){super(),this._debug("ViewBase-Konstruktor: Start"),this.config={},this.epgData=[],this._loading=!1,this._error=null,this._debug("ViewBase-Konstruktor: Initialisierung abgeschlossen")}async firstUpdated(){this._debug("ViewBase firstUpdated: Start"),await super.firstUpdated(),this._debug("ViewBase firstUpdated: Ende")}async _loadData(){if(this._debug("ViewBase _loadData wird aufgerufen"),this._dataProvider&&this.config.entity){this._loading=!0,this._error=null;try{this._debug("Starte _fetchViewData mit Konfiguration:",this.config);const e=await this._fetchViewData(this.config);this.epgData=e,this._debug("_fetchViewData erfolgreich:",e)}catch(e){this._error=e,this._debug("Fehler in _fetchViewData:",e)}finally{this._loading=!1}}else this._debug("ViewBase _loadData: Übersprungen - dataProvider oder entity fehlt",{dataProvider:!!this._dataProvider,entity:this.config.entity,config:this.config})}async _fetchViewData(e){throw new Error("_fetchViewData muss in der abgeleiteten Klasse implementiert werden")}render(){return this._loading?this._renderLoading():this._error?this._renderError():this._renderContent()}_renderLoading(){return html`<div class="loading">Lade Daten...</div>`}_renderError(){return html`<div class="error">${this._error}</div>`}_renderContent(){return html`<div>Keine Daten verfügbar</div>`}}function Ie(){return Ie="undefined"!=typeof Reflect&&Reflect.get?Reflect.get.bind():function(e,t,i){var n=function(e,t){for(;!{}.hasOwnProperty.call(e,t)&&null!==(e=He(e)););return e}(e,t);if(n){var r=Object.getOwnPropertyDescriptor(n,t);return r.get?r.get.call(arguments.length<3?e:i):r.value}},Ie.apply(null,arguments)}function He(e){return He=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(e){return e.__proto__||Object.getPrototypeOf(e)},He(e)}function ze(e,t,i){return(t=function(e){var t=function(e){if("object"!=typeof e||!e)return e;var t=e[Symbol.toPrimitive];if(void 0!==t){var i=t.call(e,"string");if("object"!=typeof i)return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(e)}(e);return"symbol"==typeof t?t:t+""}(t))in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i,e}xe=Be,Ne(Be,"className","ViewBase"),Ne(Be,"properties",{config:{type:Object},epgData:{type:Array},_loading:{type:Boolean},_error:{type:Object}}),Ne(Be,"styles",[function(e,t,i){var n=Ue(Re(e),"styles",i);return n}(xe,0,xe),h`
      :host {
        display: block;
      }
    `]);class Le extends Be{static get properties(){return{...super.properties,hass:{type:Object},config:{type:Object},lovelace:{type:Object},_workingDays:{type:Object},_storageWarning:{type:Object},_configWarning:{type:Object},_displayedMonths:{type:Number},_startMonthOffset:{type:Number},_selectedCalendar:{type:String}}}constructor(){super(),this._workingDays={},this._storageWarning=null,this._configWarning=null,this._knownEntityIds=null,this._cleanupDone=!1,this._displayedMonths=2,this._startMonthOffset=0,this._isWriting=!1,this._writeLockTimer=null,this._selectedCalendar=null}formatTwoDigits(e){return String(e).padStart(2,"0")}_isInEditorMode(){if(!0===this.lovelace?.editMode)return!0;let e=this,t=0;for(;e&&t<10;){if(e.classList?.contains("card-editor")||e.classList?.contains("hui-card-editor")||e.classList?.contains("edit-mode")||"true"===e.getAttribute?.("data-card-editor")||e.tagName?.toLowerCase().includes("editor"))return!0;if(e.id&&(e.id.includes("editor")||e.id.includes("config")))return!0;e=e.parentElement||e.parentNode,t++}const i=this.getRootNode();if(i&&i!==document){const e=i.host;if(e&&(e.classList?.contains("card-editor")||e.classList?.contains("hui-card-editor")||e.classList?.contains("edit-mode")))return!0}return!1}_getContrastColor(e){if(!e)return"#000000";const t=e.replace("#","");return(.299*parseInt(t.substr(0,2),16)+.587*parseInt(t.substr(2,2),16)+.114*parseInt(t.substr(4,2),16))/255>.5?"#000000":"#ffffff"}_getEasterDate(e){const t=e%19,i=Math.floor(e/100),n=e%100,r=Math.floor(i/4),s=i%4,a=Math.floor((i+8)/25),o=(19*t+i-r-Math.floor((i-a+1)/3)+15)%30,l=(32+2*s+2*Math.floor(n/4)-o-n%4)%7,c=Math.floor((t+11*o+22*l)/451),d=Math.floor((o+l-7*c+114)/31);return new Date(e,d-1,(o+l-7*c+114)%31+1)}_isHoliday(e,t,i){if(this._hass&&this._hass.states){const n=Object.keys(this._hass.states).filter((e=>e.startsWith("sensor.")&&(e.includes("holiday")||e.includes("feiertag"))&&"on"===this._hass.states[e].state));if(n.length>0)for(const r of n){const n=this._hass.states[r];if(n&&n.attributes){const r=`${e}-${String(t+1).padStart(2,"0")}-${String(i).padStart(2,"0")}`,s=`${String(i).padStart(2,"0")}.${String(t+1).padStart(2,"0")}.${e}`,a=["dates","holidays","feiertage","date","next_date","upcoming"];for(const e of a)if(n.attributes[e]){const t=n.attributes[e];if(Array.isArray(t)){if(t.some((e=>e===r||e===s||e.includes(r)||e.includes(s))))return!0}else if("string"==typeof t&&(t.includes(r)||t.includes(s)))return!0}}}}const n=this.config?.holidays||{},r=e=>!1!==n[e],s=this._getEasterDate(e),a=[{month:0,day:1,key:"neujahr"},{month:0,day:6,key:"heilige_drei_koenige"},{month:4,day:1,key:"tag_der_arbeit"},{month:7,day:8,key:"friedensfest"},{month:7,day:15,key:"mariae_himmelfahrt"},{month:9,day:3,key:"tag_der_deutschen_einheit"},{month:9,day:31,key:"reformationstag"},{month:10,day:1,key:"allerheiligen"},{month:11,day:25,key:"weihnachten_1"},{month:11,day:26,key:"weihnachten_2"}];for(const e of a)if(t===e.month&&i===e.day&&r(e.key))return!0;const o=s.getTime(),l=864e5,c=new Date(e,10,23).getDay(),d=new Date(e,10,23-(c<=3?3-c:c+7-3)),h=[{date:new Date(o-2*l),key:"karfreitag"},{date:new Date(o+864e5),key:"ostermontag"},{date:new Date(o+39*l),key:"christi_himmelfahrt"},{date:new Date(o+50*l),key:"pfingstmontag"},{date:new Date(o+60*l),key:"fronleichnam"},{date:d,key:"busstag"}];for(const n of h)if(n.date.getFullYear()===e&&n.date.getMonth()===t&&n.date.getDate()===i&&r(n.key))return!0;return!1}_isWeekend(e,t,i){const n=new Date(e,t,i).getDay();return 0===n||6===n}set hass(e){if(this._isWriting)return this._hass=e,void this.requestUpdate();const t=this._hass?.states[this._config?.entity]?.state,i=e?.states[this._config?.entity]?.state;let n=t!==i;if(!n&&this._config&&this._knownEntityIds)for(let t=1;t<this._knownEntityIds.length;t++){const i=this._knownEntityIds[t],r=this._hass?.states[i]?.state,s=e?.states[i]?.state;if(r!==s){n=!0;break}}this._hass=e,this._config&&(n&&this.loadWorkingDays(),this.checkConfigEntity()),this.requestUpdate()}set config(e){if(this._config=e,e&&e.initialDisplayedMonths){const t=e.numberOfMonths||14;this._displayedMonths=Math.min(e.initialDisplayedMonths,t)}else e&&e.numberOfMonths&&!this._displayedMonths?this._displayedMonths=e.numberOfMonths:e&&e.numberOfMonths&&(this._displayedMonths=Math.min(this._displayedMonths||2,e.numberOfMonths));if(e&&e.initialDisplayedMonths){const t=e.numberOfMonths||14;this._displayedMonths=Math.min(e.initialDisplayedMonths,t)}else e&&e.numberOfMonths&&!this._displayedMonths?this._displayedMonths=e.numberOfMonths:e&&e.numberOfMonths&&(this._displayedMonths=Math.min(this._displayedMonths||2,e.numberOfMonths));this._config=e;const t=this._getAllCalendars();e&&e.selectedCalendar?t.some((t=>t.shortcut===e.selectedCalendar))?this._selectedCalendar=e.selectedCalendar:t.length>0||t.length>0?(this._selectedCalendar=t[0].shortcut,e&&(e.selectedCalendar=this._selectedCalendar,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0})))):(this._selectedCalendar=null,e&&(e.selectedCalendar=null)):t.length>0?(this._selectedCalendar=t[0].shortcut,e&&(e.selectedCalendar=this._selectedCalendar,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0})))):(this._selectedCalendar=null,e&&(e.selectedCalendar=null)),this._hass&&(this.loadWorkingDays(),this.checkConfigEntity(),this.saveConfigToEntity()),this.requestUpdate()}async loadWorkingDays(){if(!this._hass||!this._config||!this._config.entity)return;const e=this.getAllEntityMaxLengths(),t=[],i=this._config.entity,n=this.findAdditionalEntities(i);this._knownEntityIds=[i,...n];for(const i of this._knownEntityIds){const n=this._hass.states[i];n&&n.state&&""!==n.state.trim()&&(t.push(n.state),n.state.length,e[i])}if(this._knownEntityIds&&this._knownEntityIds.slice(1),t.length>0){const e=t.join(";");this.parseWorkingDays(e)}else this._workingDays={};if(this.checkStorageUsage(),Object.keys(this._workingDays).length>0&&!this._cleanupDone){this._cleanupDone=!0;const e=this._config.numberOfMonths||2,t=new Date,i=t.getMonth()+1,n=t.getFullYear();let r,s;1===i?(r=12,s=(n-1)%100):(r=i-1,s=n%100);const a=[];a.push({year:s,month:r});for(let t=0;t<e;t++){const e=new Date(n,i-1+t,1),r=e.getFullYear()%100,s=e.getMonth()+1;a.push({year:r,month:s})}let o=!1;for(const e of Object.keys(this._workingDays)){const t=e.split(":");if(2===t.length){const i=parseInt(t[0]),n=parseInt(t[1]),r=a.some((e=>e.year===i&&e.month===n));r||(delete this._workingDays[e],o=!0)}else delete this._workingDays[e],o=!0}if(o){const e=this.serializeWorkingDays();try{await this._hass.callService("input_text","set_value",{entity_id:this._config.entity,value:e})}catch(e){}}}this.requestUpdate()}_parseWorkingDaysIntoObject(e,t){if(!e||""===e.trim())return;const i=e.split(";").filter((e=>""!==e.trim()));for(const e of i){const i=e.trim();if(!i)continue;const n=i.split(":");if(2===n.length){const e=n[0].trim(),i=n[1].trim();if(e&&i){const n=parseInt(e);if(!isNaN(n)&&n>=1&&n<=12){const e=(new Date).getFullYear()%100;t[`${this.formatTwoDigits(e)}:${this.formatTwoDigits(n)}`]=this._parseDaysWithElements(i)}}}else if(n.length>=3){const e=parseInt(n[0].trim()),i=parseInt(n[1].trim());if(e<=12&&i>12){const r=e,s=i,a=n.slice(2).join(":");a&&r>=1&&r<=12&&!isNaN(s)&&(t[`${this.formatTwoDigits(s)}:${this.formatTwoDigits(r)}`]=this._parseDaysWithElements(a))}else if(e>12&&i<=12){const r=e,s=i,a=n.slice(2).join(":");a&&s>=1&&s<=12&&!isNaN(r)&&(t[`${this.formatTwoDigits(r)}:${this.formatTwoDigits(s)}`]=this._parseDaysWithElements(a))}}}}_parseDaysWithElements(e){const t={},i=e.split(",").filter((e=>""!==e.trim()));for(const e of i){const i=e.trim();if(!i)continue;const n=i.match(/^(\d+)([a-z]*)$/i);if(n){const e=parseInt(n[1]),i=(n[2]||"").split("").filter((e=>""!==e.trim()));!isNaN(e)&&e>=1&&e<=31&&(t[e]?t[e]=[...new Set([...t[e],...i])]:t[e]=i)}}return t}parseWorkingDays(e){this._workingDays={},this._parseWorkingDaysIntoObject(e,this._workingDays)}findAdditionalEntities(e){const t=[];if(!this._hass||!this._hass.states)return t;const i=e.split(".");if(2!==i.length)return t;const[n,r]=i;for(let e=1;e<=999;e++){const i=`${n}.${r}_${String(e).padStart(3,"0")}`;if(!this._hass.states[i])break;t.push(i)}return t}getEntityMaxLength(e){if(!this._hass||!this._hass.states||!e)return null;const t=this._hass.states[e];if(!t||!t.attributes)return null;const i=t.attributes.max;return null!=i?parseInt(i):null}getAllEntityMaxLengths(){const e={};if(!this._hass||!this._config||!this._config.entity)return e;const t=this._config.entity,i=this.getEntityMaxLength(t);null!==i&&(e[t]=i);const n=this.findAdditionalEntities(t);for(const t of n){const i=this.getEntityMaxLength(t);null!==i&&(e[t]=i)}return e}checkStorageUsage(e=null){if(!this._hass||!this._config||!this._config.entity)return this._storageWarning=null,void this.requestUpdate();let t;t=this._knownEntityIds&&this._knownEntityIds.length>0?[...this._knownEntityIds]:[this._config.entity,...this.findAdditionalEntities(this._config.entity)];const i=this.getAllEntityMaxLengths();if(0===Object.keys(i).length)return this._storageWarning=null,void this.requestUpdate();let n=0,r=0;if(null!=e)n=e;else for(const e of t){const t=this._hass.states[e];t&&t.state&&(n+=t.state.length)}for(const e of t){const t=i[e];null!=t&&(r+=t)}if(0===r)return this._storageWarning=null,void this.requestUpdate();const s=n/r*100;this._storageWarning=s>=90?{show:!0,currentLength:n,maxLength:r,percentage:Math.round(10*s)/10}:null,this.requestUpdate()}getConfigEntityId(){return this._config&&this._config.entity?this._config.entity+"_config":null}checkConfigEntity(){if(!this._hass||!this._config||!this._config.entity)return this._configWarning=null,void this.requestUpdate();const e=this.getConfigEntityId();if(!e)return this._configWarning=null,void this.requestUpdate();this._hass.states[e]?this._configWarning&&"size"===this._configWarning.type||(this._configWarning=null):this._configWarning={show:!0,type:"missing",configEntityId:e},this.requestUpdate()}async saveConfigToEntity(){if(!this._hass||!this._config||!this._config.entity)return;const e=this.getConfigEntityId();if(!e)return;if(!this._hass.states[e])return void this.checkConfigEntity();const t=[];if(this._config.calendars)for(const e of this._config.calendars)if(e&&e.shortcut&&(!0===e.enabled||"true"===e.enabled||1===e.enabled)){const i=[e.shortcut,e.name||`Schicht ${e.shortcut.toUpperCase()}`];if(e.timeRanges&&Array.isArray(e.timeRanges)){const t=e.timeRanges[0];if(t&&Array.isArray(t)&&t.length>=2){const e=t[0]&&""!==t[0].trim()?t[0].trim():null,n=t[1]&&""!==t[1].trim()?t[1].trim():null;e&&n?i.push(e,n):i.push(null,null)}else i.push(null,null);const n=e.timeRanges[1];if(n&&Array.isArray(n)&&n.length>=2){const e=n[0]&&""!==n[0].trim()?n[0].trim():null,t=n[1]&&""!==n[1].trim()?n[1].trim():null;e&&t?i.push(e,t):i.push(null,null)}else i.push(null,null)}else i.push(null,null,null,null);const n=!1!==e.statusRelevant?1:0;i.push(n),t.push(i)}let i,n=JSON.stringify(t);n.startsWith("[")&&n.endsWith("]")&&(n=n.slice(1,-1));do{i=n.length,n=n.replace(/,null,/g,",,"),n=n.replace(/,null\]/g,",]"),n=n.replace(/\[null,/g,"[,"),n=n.replace(/,null$/g,",")}while(n.length!==i);n=n.replace(/","/g,","),n=n.replace(/\["/g,"["),n=n.replace(/"\]/g,"]"),n=n.replace(/,"/g,","),n=n.replace(/",/g,",");const r=n.length,s=this.getEntityMaxLength(e);if(null!==s&&r>s){const t=r/s*100;return this._configWarning={show:!0,type:"size",configEntityId:e,currentLength:r,maxLength:s,percentage:Math.round(10*t)/10},void this.requestUpdate()}try{await this._hass.callService("input_text","set_value",{entity_id:e,value:n}),this._configWarning=null,this.requestUpdate()}catch(e){this.checkConfigEntity()}}serializeWorkingDays(){const e=[],t=Object.keys(this._workingDays).sort(((e,t)=>{const[i,n]=e.split(":").map((e=>parseInt(e))),[r,s]=t.split(":").map((e=>parseInt(e)));return i!==r?i-r:n-s}));for(const i of t){const t=this._workingDays[i];if(!t||"object"!=typeof t||Array.isArray(t))continue;const n=Object.keys(t).map((e=>parseInt(e))).filter((e=>!isNaN(e))).sort(((e,t)=>e-t));if(n.length>0){const r=n.map((e=>{const i=t[e],n=this.formatTwoDigits(e);return Array.isArray(i)&&i.length>0?n+[...i].sort().join(""):n})).join(",");e.push(`${i}:${r}`)}}return e.join(";")}async distributeDataToEntities(e){if(this._hass&&this._config&&this._config.entity){this._isWriting=!0,this._writeLockTimer&&(clearTimeout(this._writeLockTimer),this._writeLockTimer=null);try{let t;if(this._knownEntityIds&&this._knownEntityIds.length>0){t=[...this._knownEntityIds];const e=this.findAdditionalEntities(this._config.entity),i=this._knownEntityIds.length-1;if(e.length>i){const n=e.slice(i);t.push(...n),this._knownEntityIds=[...t]}}else{t=[this._config.entity];const e=this.findAdditionalEntities(this._config.entity);t.push(...e),this._knownEntityIds=[...t]}const i={};let n=0;for(const e of t){const t=this.getEntityMaxLength(e);null!==t?(i[e]=t,n+=t):(i[e]=255,n+=255)}if(e&&e.length,!e||""===e.trim()){for(const e of t)try{await this._hass.callService("input_text","set_value",{entity_id:e,value:""})}catch(e){}return void(this._writeLockTimer=setTimeout((()=>{this._isWriting=!1,this._writeLockTimer=null}),5e3))}const r={};let s=0,a=e;for(;a.length>0&&s<t.length;){const e=t[s],n=i[e],o=Math.min(a.length,n),l=a.substring(0,o);r[e]=l,a=a.substring(o),a.length>0&&s++}if(a.length>0){const e=this.findAdditionalEntities(this._config.entity),n=this._knownEntityIds?this._knownEntityIds.length-1:0;if(e.length>n){const o=e.slice(n);t.push(...o),this._knownEntityIds=[...t];for(const e of o){const t=this.getEntityMaxLength(e);i[e]=null!==t?t:255}for(s=t.length-o.length;a.length>0&&s<t.length;){const e=t[s],n=i[e],o=Math.min(a.length,n),l=a.substring(0,o);r[e]=l,a=a.substring(o),a.length>0&&s++}}}for(const e of t){const t=r[e]||"",n=i[e];if(t.length>n){const i=t.substring(0,n);try{await this._hass.callService("input_text","set_value",{entity_id:e,value:i})}catch(e){}}else try{await this._hass.callService("input_text","set_value",{entity_id:e,value:t})}catch(e){}}const o=this.findAdditionalEntities(this._config.entity);for(const e of o)if(!(e in r))try{await this._hass.callService("input_text","set_value",{entity_id:e,value:""})}catch(e){}a.length}catch(e){}finally{this._writeLockTimer=setTimeout((()=>{this._isWriting=!1,this._writeLockTimer=null}),5e3)}}}async toggleDay(e,t,i=null){const n=parseInt(e),r=parseInt(t);if(isNaN(n)||isNaN(r))return;const s=new Date,a=s.getMonth()+1,o=s.getFullYear(),l=o%100;i||(i=l);const c=parseInt(i);let d=!1;if(d=1===a?12===n&&c===(o-1)%100:n===a-1&&c===l,d)return;if(!this._hass||!this._config||!this._config.entity)return;const h=`${this.formatTwoDigits(c)}:${this.formatTwoDigits(n)}`;this._workingDays[h]&&!Array.isArray(this._workingDays[h])||(this._workingDays[h]={});const u=this._getSelectedCalendarShortcut();if(!u)return;this._workingDays[h][r]||(this._workingDays[h][r]=[]);const f=[...this._workingDays[h][r]||[]],g=f.indexOf(u);g>-1?(f.splice(g,1),0===f.length?(delete this._workingDays[h][r],0===Object.keys(this._workingDays[h]).length&&delete this._workingDays[h]):this._workingDays[h][r]=f):f.includes(u)||(f.push(u),this._workingDays[h][r]=f);const p=this.serializeWorkingDays();await this.distributeDataToEntities(p),this.checkStorageUsage(p.length),this.requestUpdate()}getDaysInMonth(e,t){return new Date(e,t+1,0).getDate()}getFirstDayOfMonth(e,t){return new Date(e,t,1).getDay()}getWeekNumber(e){const t=new Date(Date.UTC(e.getFullYear(),e.getMonth(),e.getDate())),i=t.getUTCDay()||7;t.setUTCDate(t.getUTCDate()+4-i);const n=new Date(Date.UTC(t.getUTCFullYear(),0,1));return Math.ceil(((t-n)/864e5+1)/7)}getMonthName(e){return["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"][e]}renderDay(e,t,i,n,r,s,a,o){const l=new Date,c=l.getDate(),d=l.getMonth(),h=l.getFullYear(),u=this._getDayElements(n,e),f=a===h&&o===d&&e===c,g=this._getSelectedCalendarShortcut(),p=g&&u.includes(g),m=this._getCalendarByShortcut(g);let y="",b=null;const _=["a","b","c","d","e"];for(const e of _)if(u.includes(e)){const t=this._getCalendarByShortcut(e);if(t&&t.enabled){b=e;break}}let v=null;p&&m&&m.enabled?v=g:b&&(v=b);const w=null!==v;if(v){const e=this._getCalendarByShortcut(v);e&&e.color&&(y=`background-color: ${e.color};`)}const $=this._isWeekend(a,o,e),x=this._isHoliday(a,o,e),E=u.filter((e=>e!==v)).map((e=>{const t=this._getCalendarByShortcut(e);return t&&t.enabled&&t.color?Y`
                <span
                  class="shift-indicator"
                  style="background-color: ${t.color};"
                  title="${t.name||`Schicht ${e.toUpperCase()}`}">
                </span>
              `:null})).filter((e=>null!==e));return Y`
      <td>
        <button
          class="day-button ${w?"working":""} ${f?"today":""} ${s?"readonly":""} ${$?"weekend":""} ${x?"holiday":""}"
          style="${y}"
          @click=${()=>!s&&this.toggleDay(t,e,i)}
          ?disabled=${s}
          data-month="${t}"
          data-day="${e}"
          data-year="${i}">
          <span class="day-number">${e}</span>
          ${E.length>0?Y`<div class="shifts-container">${E}</div>`:""}
        </button>
      </td>
    `}renderMonth(e,t){const i=this.getDaysInMonth(e,t),n=(this.getFirstDayOfMonth(e,t)+6)%7,r=t+1,s=e%100,a=`${this.formatTwoDigits(s)}:${this.formatTwoDigits(r)}`;let o=[];this._workingDays[a]&&(Array.isArray(this._workingDays[a])?o=this._workingDays[a].map((e=>parseInt(e))).filter((e=>!isNaN(e))):"object"==typeof this._workingDays[a]&&(o=Object.keys(this._workingDays[a]).map((e=>parseInt(e))).filter((e=>!isNaN(e)))));const l=new Date,c=(l.getDate(),l.getMonth()),d=l.getFullYear();let h=!1;h=0===c?11===t&&e===d-1:t===c-1&&e===d;const u=[];let f=1;const g=new Date(e,t,1),p=this.getWeekNumber(g),m=[Y`<td class="week-label">${p}</td>`];for(let e=0;e<n;e++)m.push(Y`<td></td>`);for(let l=n;l<7&&f<=i;l++)m.push(this.renderDay(f,r,s,a,o,h,e,t)),f++;for(u.push(Y`<tr>${m}</tr>`);f<=i;){const n=new Date(e,t,f),l=this.getWeekNumber(n),c=[Y`<td class="week-label">${l}</td>`];for(let n=0;n<7;n++)f<=i?(c.push(this.renderDay(f,r,s,a,o,h,e,t)),f++):c.push(Y`<td></td>`);u.push(Y`<tr>${c}</tr>`)}return Y`
      <div class="month-container">
        <div class="month-header">${this.getMonthName(t)} ${e}</div>
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
            ${u}
          </tbody>
        </table>
      </div>
    `}changeDisplayedMonths(e){const t=this._config?.numberOfMonths||14,i=Math.max(1,Math.min(t,(this._displayedMonths||2)+e));i!==this._displayedMonths&&(this._displayedMonths=i,this.requestUpdate())}changeStartMonth(e){const t=this._config?.numberOfMonths||14,i=this._displayedMonths||2,n=this._startMonthOffset||0,r=t-i,s=Math.max(-1,Math.min(r,n+e));s!==n&&(this._startMonthOffset=s,this.requestUpdate())}getNavigationBounds(){const e=this._config?.numberOfMonths||14,t=this._displayedMonths||2,i=this._startMonthOffset||0;return{canGoBack:i>-1,canGoForward:i<e-t}}_getSelectedCalendarShortcut(){if(null!==this._selectedCalendar&&void 0!==this._selectedCalendar&&""!==this._selectedCalendar)return this._selectedCalendar;if(this._config?.selectedCalendar)return this._selectedCalendar=this._config.selectedCalendar,this._selectedCalendar;const e=this._getAllCalendars();return e.length>0?e[0].shortcut:null}_getCalendarByShortcut(e){return this._config?.calendars&&this._config.calendars.find((t=>t.shortcut===e))||null}_getAllCalendars(){return this._config?.calendars?this._config.calendars.filter((e=>e&&e.shortcut&&(!0===e.enabled||"true"===e.enabled||1===e.enabled))).sort(((e,t)=>e.shortcut.localeCompare(t.shortcut))):[]}_getSelectedCalendarValue(){const e=this._getAllCalendars();return 0===e.length?(null!==this._selectedCalendar&&(this._selectedCalendar=null,this._config&&(this._config.selectedCalendar=null),this.requestUpdate()),null):null===this._selectedCalendar||void 0===this._selectedCalendar?(this._selectedCalendar=e[0].shortcut,this._config&&(this._config.selectedCalendar=this._selectedCalendar),this.requestUpdate(),this._selectedCalendar):(e.some((e=>e.shortcut===this._selectedCalendar))||(this._selectedCalendar=e[0].shortcut,this._config&&(this._config.selectedCalendar=this._selectedCalendar),this.requestUpdate()),this._selectedCalendar)}_onCalendarSelectedByIndex(e){""!==e&&null!=e&&(this._selectedCalendar=e,this._config&&(this._config={...this._config,selectedCalendar:e},this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:!0,composed:!0})),this.saveConfigToEntity()),this.requestUpdate())}_getDayElements(e,t){return this._workingDays[e]&&"object"==typeof this._workingDays[e]?Array.isArray(this._workingDays[e])?[]:this._workingDays[e][t]||[]:[]}_getElementByShortcut(e){return this._config?.elements&&this._config.elements.find((t=>t.shortcut===e&&t.aktiv))||null}_getActiveElements(){return this._config?.useElements&&this._config?.elements?this._config.elements.map(((e,t)=>({element:e,originalIndex:t,isActive:!0===e.aktiv||"true"===e.aktiv||1===e.aktiv}))).filter((({isActive:e})=>e)).map((({element:e,originalIndex:t})=>({element:e,originalIndex:t}))):[]}_getSelectedElementValue(){const e=this._getActiveElements();if(0===e.length)return"";if(null===this._selectedElement||void 0===this._selectedElement)return this._selectedElement=e[0].originalIndex,this._config&&(this._config.selectedElement=this._selectedElement),this.requestUpdate(),"1";const t=e.findIndex((({originalIndex:e})=>e===this._selectedElement));if(t<0)return this._selectedElement=e[0].originalIndex,this._config&&(this._config.selectedElement=this._selectedElement),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:!0,composed:!0})),this.saveConfigToEntity(),this.requestUpdate(),"1";const i=String(t+1);return""===i||"undefined"===i||"null"===i||isNaN(t)?"1":i}_onElementSelected(e){const t=void 0!==e.detail?.value?e.detail.value:e.target.value;let i=null;if(""!==t&&null!=t){const e=this._getActiveElements(),n=parseInt(t)-1;!isNaN(n)&&n>=0&&e[n]?i=e[n].originalIndex:e.length>0&&(i=e[0].originalIndex)}else{const e=this._getActiveElements();e.length>0&&(i=e[0].originalIndex)}this._selectedElement=i,this._config&&null!==i&&(this._config={...this._config,selectedElement:i},this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:!0,composed:!0})),this.saveConfigToEntity()),this.requestUpdate()}render(){if(!this._config||!this._config.entity)return Y`<div class="error">Keine Entity konfiguriert</div>`;const e=this._config.numberOfMonths||14,t=this._displayedMonths||2,i=this._startMonthOffset||0,n=new Date,r=[];for(let e=0;e<t;e++){const t=new Date(n.getFullYear(),n.getMonth()+i+e,1),s=t.getFullYear(),a=t.getMonth();r.push({year:s,month:a})}const s=this._isInEditorMode(),a=this._storageWarning&&this._storageWarning.show,o=this._configWarning&&this._configWarning.show&&s,l=this.getNavigationBounds();return Y`
      <div class="calendar-wrapper ${a?"storage-warning-active":""}">
        ${a?Y`
              <div class="storage-warning">
                <div class="warning-icon">⚠️</div>
                <div class="warning-content">
                  <div class="warning-title">Speicherplatz fast voll!</div>
                  <div class="warning-message">
                    ${this._storageWarning.percentage}% der verfügbaren Speicherkapazität verwendet
                    (${this._storageWarning.currentLength} / ${this._storageWarning.maxLength} Zeichen).
                  </div>
                  <div class="warning-action">
                    Bitte legen Sie ein zusätzliches Input-Text-Feld an (z.B. ${this._config.entity}_${String(this.findAdditionalEntities(this._config.entity).length+1).padStart(3,"0")}).
                  </div>
                </div>
              </div>
            `:""}
        ${o?Y`
              <div class="storage-warning">
                <div class="warning-icon">⚠️</div>
                <div class="warning-content">
                  ${"missing"===this._configWarning.type?Y`
                        <div class="warning-title">Konfigurations-Entity fehlt!</div>
                        <div class="warning-message">
                          Die Konfigurations-Entity <code>${this._configWarning.configEntityId}</code> wurde nicht gefunden.
                        </div>
                        <div class="warning-action">
                          Bitte legen Sie diese Entity in Ihrer <code>configuration.yaml</code> an:
                          <pre>input_text:
  ${this._configWarning.configEntityId.replace("input_text.","")}:
    name: Schichtplan Konfiguration</pre>
                        </div>
                      `:Y`
                        <div class="warning-title">Konfigurations-Entity zu klein!</div>
                        <div class="warning-message">
                          Die Konfiguration passt nicht in die Entity <code>${this._configWarning.configEntityId}</code>.
                          ${this._configWarning.percentage}% der verfügbaren Speicherkapazität benötigt
                          (${this._configWarning.currentLength} / ${this._configWarning.maxLength} Zeichen).
                        </div>
                        <div class="warning-action">
                          Bitte erhöhen Sie die maximale Länge der Entity in Ihrer <code>configuration.yaml</code>:
                          <pre>input_text:
  ${this._configWarning.configEntityId.replace("input_text.","")}:
    name: Schichtplan Konfiguration
    max: ${Math.ceil(1.2*this._configWarning.currentLength)}</pre>
                        </div>
                      `}
                </div>
              </div>
            `:""}
        <div class="menu-bar">
          <button
            class="menu-button navigation-button"
            @click=${()=>this.changeStartMonth(-1)}
            ?disabled=${!l.canGoBack}
            title="Vorheriger Monat">
            ←
          </button>
          <button
            class="menu-button decrease-button"
            @click=${()=>this.changeDisplayedMonths(-1)}
            ?disabled=${t<=1}
            title="Weniger Monate anzeigen">
            −
          </button>
          <div class="menu-number">${t}</div>
          <button
            class="menu-button increase-button"
            @click=${()=>this.changeDisplayedMonths(1)}
            ?disabled=${t>=e}
            title="Mehr Monate anzeigen">
            +
          </button>
          <button
            class="menu-button navigation-button"
            @click=${()=>this.changeStartMonth(1)}
            ?disabled=${!l.canGoForward}
            title="Nächster Monat">
            →
          </button>
          ${(()=>{const e=this._getAllCalendars(),t=this._getSelectedCalendarValue();return Y`
                <div class="calendar-selector">
                  <ha-select
                    .value=${t||"a"}
                    @selected=${t=>{try{if(t&&("function"==typeof t.stopPropagation&&t.stopPropagation(),"function"==typeof t.stopImmediatePropagation&&t.stopImmediatePropagation()),!t||!t.detail)return;const i=t.detail.index;if(null!=i&&i>=0&&e&&e[i]){const t=e[i];t&&t.shortcut&&"function"==typeof this._onCalendarSelectedByIndex&&this._onCalendarSelectedByIndex(t.shortcut)}}catch(e){console.error("Error in calendar selection handler:",e)}}}
                    naturalMenuWidth
                    fixedMenuPosition
                  >
                    ${e.map((e=>{const t=e.color||"",i=e.color?this._getContrastColor(e.color):"";return Y`
                        <mwc-list-item
                          value="${e.shortcut}"
                          data-calendar-color="${t}"
                          data-calendar-text-color="${i}"
                          style="${t?`--calendar-bg-color: ${t}; --calendar-text-color: ${i};`:""}">
                          ${e.name||`Schicht ${e.shortcut.toUpperCase()}`}
                        </mwc-list-item>
                      `}))}
                  </ha-select>
                </div>
              `})()}
        </div>
        <div class="calendar-container">
          ${r.map((({year:e,month:t})=>this.renderMonth(e,t)))}
        </div>
      </div>
    `}}function We(){return We="undefined"!=typeof Reflect&&Reflect.get?Reflect.get.bind():function(e,t,i){var n=function(e,t){for(;!{}.hasOwnProperty.call(e,t)&&null!==(e=Ve(e)););return e}(e,t);if(n){var r=Object.getOwnPropertyDescriptor(n,t);return r.get?r.get.call(arguments.length<3?e:i):r.value}},We.apply(null,arguments)}function Ve(e){return Ve=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(e){return e.__proto__||Object.getPrototypeOf(e)},Ve(e)}function Fe(e,t,i){return(t=function(e){var t=function(e){if("object"!=typeof e||!e)return e;var t=e[Symbol.toPrimitive];if(void 0!==t){var i=t.call(e,"string");if("object"!=typeof i)return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(e)}(e);return"symbol"==typeof t?t:t+""}(t))in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i,e}Ee=Le,ze(Le,"className","ShiftScheduleView"),ze(Le,"DEFAULT_SELECTED_DAY_COLOR","#ff9800"),ze(Le,"CALENDARS",[{shortcut:"a",name:"Schicht A",defaultColor:"#ff9800"},{shortcut:"b",name:"Schicht B",defaultColor:"#ff0000"},{shortcut:"c",name:"Schicht C",defaultColor:"#00ff00"},{shortcut:"d",name:"Schicht D",defaultColor:"#0000ff"},{shortcut:"e",name:"Schicht E",defaultColor:"#ffff00"}]),ze(Le,"styles",[function(e,t,i){var n=Ie(He(e),"styles",i);return n}(Ee,0,Ee)||[],h`
      :host {
        display: block;
        --tgshiftschedule-default-selected-day-color: ${d(Ee.DEFAULT_SELECTED_DAY_COLOR)};
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

      .menu-bar {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 12px;
        margin-bottom: 16px;
        background-color: var(--card-background-color, #ffffff);
        border-radius: 4px;
        border: 1px solid var(--divider-color, #e0e0e0);
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
        transition: background-color 0.2s ease, opacity 0.2s ease;
      }

      .menu-button.navigation-button {
        background-color: var(--secondary-color, #757575);
      }

      .menu-button.navigation-button:hover:not(:disabled) {
        background-color: var(--secondary-color-dark, #616161);
      }

      .menu-button:hover:not(:disabled) {
        background-color: var(--primary-color-dark, #0288d1);
      }

      .menu-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

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

      .calendar-selector ha-select {
        width: 100%;
      }

      /* Stelle sicher, dass alle Items die Schichtfarbe als Hintergrund haben */
      .calendar-selector mwc-list-item[data-calendar-color] {
        background-color: var(--calendar-bg-color) !important;
        color: var(--calendar-text-color) !important;
      }

      /* Stelle sicher, dass auch das ausgewählte/aktivierte Item die Schichtfarbe behält */
      .calendar-selector mwc-list-item[data-calendar-color][selected],
      .calendar-selector mwc-list-item[data-calendar-color][activated],
      .calendar-selector mwc-list-item[data-calendar-color].selected,
      .calendar-selector mwc-list-item[data-calendar-color].activated {
        background-color: var(--calendar-bg-color) !important;
        color: var(--calendar-text-color) !important;
        --mdc-list-item-selected-background-color: var(--calendar-bg-color) !important;
        --mdc-list-item-activated-background-color: var(--calendar-bg-color) !important;
      }

      /* Überschreibe die Standard-Hintergrundfarbe für ausgewählte Items (::before Pseudo-Element) */
      .calendar-selector mwc-list-item[data-calendar-color][selected]::before,
      .calendar-selector mwc-list-item[data-calendar-color][activated]::before,
      .calendar-selector mwc-list-item[data-calendar-color].selected::before,
      .calendar-selector mwc-list-item[data-calendar-color].activated::before {
        background-color: var(--calendar-bg-color) !important;
        opacity: 1 !important;
      }

      /* Überschreibe auch für den Hover-State */
      .calendar-selector mwc-list-item[data-calendar-color]:hover {
        background-color: var(--calendar-bg-color) !important;
        opacity: 0.9 !important;
      }

      .calendar-container {
        display: flex;
        flex-direction: column;
        gap: 24px;
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

      .day-button.working {
        /* background-color wird jetzt dynamisch per style gesetzt, wenn eine Schicht ausgewählt ist */
        color: var(--text-primary-color, #ffffff);
        font-weight: bold;
      }

      /* Fallback: Wenn keine Schicht ausgewählt ist, verwende die Standardfarbe */
      .day-button.working:not([style*="background-color"]) {
        background-color: var(--accent-color, var(--tgshiftschedule-default-selected-day-color));
      }

      .day-button.today {
        border: 4px solid var(--primary-color, #03a9f4);
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

      /* Heute-Markierung hat Vorrang, aber kombiniert mit anderen Markierungen */
      .day-button.today.weekend {
        border: 5px solid var(--secondary-color, #757575);
      }

      .day-button.today.holiday {
        border: 5px solid var(--error-color, #f44336);
      }

      .day-button.today.weekend.holiday {
        border: 6px solid var(--error-color, #f44336);
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
    `]),customElements.get("shiftschedule-view")||customElements.define("shiftschedule-view",Le);class qe extends Pe{static get properties(){return{...super.properties,config:{type:Object},hass:{type:Object},lovelace:{type:Object},_view:{type:Object},_viewType:{type:String}}}static getConfigElement(){return document.createElement(`${pe}-editor`)}static getStubConfig(){return{entity:"input_text.arbeitszeiten",numberOfMonths:14,initialDisplayedMonths:2,useElements:!1,selectedElement:null,elements:[{benennung:"Element 1",aktiv:!0,color:"#ff0000",shortcut:"1"},{benennung:"Element 2",aktiv:!0,color:"#00ff00",shortcut:"2"},{benennung:"Element 3",aktiv:!0,color:"#0000ff",shortcut:"3"},{benennung:"Element 4",aktiv:!0,color:"#ffff00",shortcut:"4"}]}}constructor(){super(),this._debug("CardImpl-Modul wird geladen"),this.config=this.getDefaultConfig(),this._debug("CardImpl-Konstruktor: Initialisierung abgeschlossen")}getDefaultConfig(){return this._debug("CardImpl getDefaultConfig wird aufgerufen"),{entity:"input_text.arbeitszeiten",numberOfMonths:14,initialDisplayedMonths:2,selectedCalendar:"a",calendars:[{shortcut:"a",name:"Kalender A",color:"#ff9800",enabled:!0,statusRelevant:!0},{shortcut:"b",name:"Kalender B",color:"#ff0000",enabled:!1,statusRelevant:!0},{shortcut:"c",name:"Kalender C",color:"#00ff00",enabled:!1,statusRelevant:!0},{shortcut:"d",name:"Kalender D",color:"#0000ff",enabled:!1,statusRelevant:!0},{shortcut:"e",name:"Kalender E",color:"#ffff00",enabled:!1,statusRelevant:!0}]}}setConfig(e){if(this._debug("setConfig wird aufgerufen mit:",e),!e)throw new Error("Keine Konfiguration vorhanden");const t=this.getDefaultConfig();this.config={...t,...e,selectedCalendar:void 0!==e?.selectedCalendar?e.selectedCalendar:this.config?.selectedCalendar||t.selectedCalendar},this._debug("config nach setConfig:",this.config),this._viewType="ShiftScheduleView";try{this._view?this._debug("setConfig: Aktualisiere bestehende ShiftSchedule-View"):(this._debug("setConfig: Erstelle neue ShiftSchedule-View"),this._view=document.createElement("shiftschedule-view"),this._view.addEventListener("config-changed",(e=>{this._debug("config-changed Event von ShiftSchedule-View empfangen:",e.detail),e.detail&&e.detail.config&&(this.config=e.detail.config,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this.config},bubbles:!0,composed:!0})))})),this._hass&&(this._debug("setConfig: Übergebe gespeicherten hass an ShiftSchedule-View"),this._view.hass=this._hass),this.lovelace&&(this._debug("setConfig: Übergebe lovelace an ShiftSchedule-View"),this._view.lovelace=this.lovelace)),this._view.config=this.config,this._debug("setConfig: View initialisiert/aktualisiert:",{viewType:this._viewType,config:this.config})}catch(e){throw this._debug("setConfig: Fehler bei View-Initialisierung:",e),new Error(`Fehler bei der View-Initialisierung: ${e.message}`)}}set hass(e){this._hass=e,this._view?this._view.hass=e:this._debug("set hass: View noch nicht initialisiert, speichere hass für später")}set lovelace(e){this._lovelace=e,this._view&&(this._view.lovelace=e)}get lovelace(){return this._lovelace}get hass(){return this._hass}firstUpdated(){this._debug("firstUpdated wird aufgerufen"),this._view&&this._view.firstUpdated(),this._debug("firstUpdated abgeschlossen")}render(){if(!this._view)return Y`<div class="error">Keine View verfügbar</div>`;try{return Y`${this._view}`}catch(e){return this._debug("render: Fehler beim Rendern der View:",e),Y`<div class="error">Fehler beim Rendern: ${e.message}</div>`}}}function Ke(e,t,i){return(t=function(e){var t=function(e){if("object"!=typeof e||!e)return e;var t=e[Symbol.toPrimitive];if(void 0!==t){var i=t.call(e,"string");if("object"!=typeof i)return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(e)}(e);return"symbol"==typeof t?t:t+""}(t))in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i,e}function Ye(e,t,i,n){var r=Ge(Je(1&n?e.prototype:e),t,i);return 2&n&&"function"==typeof r?function(e){return r.apply(i,e)}:r}function Ge(){return Ge="undefined"!=typeof Reflect&&Reflect.get?Reflect.get.bind():function(e,t,i){var n=function(e,t){for(;!{}.hasOwnProperty.call(e,t)&&null!==(e=Je(e)););return e}(e,t);if(n){var r=Object.getOwnPropertyDescriptor(n,t);return r.get?r.get.call(arguments.length<3?e:i):r.value}},Ge.apply(null,arguments)}function Je(e){return Je=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(e){return e.__proto__||Object.getPrototypeOf(e)},Je(e)}ke=qe,Fe(qe,"className","CardImpl"),Fe(qe,"styles",[function(e,t,i){var n=We(Ve(e),"styles",i);return n}(ke,0,ke),h`
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
    `]);class Ze extends we{constructor(e={}){super(),this._debug("[EditorBase] EditorBase-Konstruktor wird aufgerufen"),this.config={type:"custom:tgeditor-card",...e},this._debug("[EditorBase] EditorBase config nach Konstruktor:",this.config)}async firstUpdated(){this._debug("[EditorBase] EditorBase firstUpdated wird aufgerufen"),await super.firstUpdated(),this._debug("[EditorBase] EditorBase firstUpdated abgeschlossen")}async loadHaForm(){if(this._debug("[EditorBase] EditorBase loadHaForm wird aufgerufen"),customElements.get("ha-form"))this._debug("[EditorBase] EditorBase ha-form bereits geladen");else{this._debug("[EditorBase] EditorBase ha-form nicht gefunden, lade custom-card-helpers");try{const e=await r.e(356).then(r.bind(r,356));this._debug("[EditorBase] EditorBase custom-card-helpers geladen"),await e.loadHaForm(),this._debug("[EditorBase] EditorBase ha-form geladen")}catch(e){throw e}}}getDefaultConfig(){throw this._debug("[EditorBase] EditorBase getDefaultConfig wird aufgerufen"),new Error("getDefaultConfig muss in der abgeleiteten Klasse implementiert werden")}getStubConfig(){return this._debug("[EditorBase] EditorBase getStubConfig wird aufgerufen"),this.getDefaultConfig()}setConfig(e){if(this._debug("[EditorBase] EditorBase setConfig wird aufgerufen mit:",e),!e)throw new Error("Keine Konfiguration angegeben");const t=!this.config||0===Object.keys(this.config).length;this.config=t?{...this.getDefaultConfig(),...e}:{...this.config,...e},this._debug("[EditorBase] EditorBase config nach setConfig:",this.config)}}function Qe(e,t,i){return(t=function(e){var t=function(e){if("object"!=typeof e||!e)return e;var t=e[Symbol.toPrimitive];if(void 0!==t){var i=t.call(e,"string");if("object"!=typeof i)return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(e)}(e);return"symbol"==typeof t?t:t+""}(t))in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i,e}function Xe(e,t,i,n){var r=et(tt(1&n?e.prototype:e),t,i);return 2&n&&"function"==typeof r?function(e){return r.apply(i,e)}:r}function et(){return et="undefined"!=typeof Reflect&&Reflect.get?Reflect.get.bind():function(e,t,i){var n=function(e,t){for(;!{}.hasOwnProperty.call(e,t)&&null!==(e=tt(e)););return e}(e,t);if(n){var r=Object.getOwnPropertyDescriptor(n,t);return r.get?r.get.call(arguments.length<3?e:i):r.value}},et.apply(null,arguments)}function tt(e){return tt=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(e){return e.__proto__||Object.getPrototypeOf(e)},tt(e)}Ke(Ze,"properties",{...Ye(Ce=Ze,"properties",Ce),_selectedTab:{type:Number}}),Ke(Ze,"styles",[Ye(Ce,"styles",Ce),h`
      :host {
        display: block;
      }
      .editor-container {
        padding: 16px;
      }
    `]);class it extends Ze{constructor(){super({entity:"input_text.arbeitszeiten",numberOfMonths:14,initialDisplayedMonths:2,selectedCalendar:"a",calendars:[{shortcut:"a",name:"Schicht A",color:"#ff9800",enabled:!0,statusRelevant:!0},{shortcut:"b",name:"Schicht B",color:"#ff0000",enabled:!1,statusRelevant:!0},{shortcut:"c",name:"Schicht C",color:"#00ff00",enabled:!1,statusRelevant:!0},{shortcut:"d",name:"Schicht D",color:"#0000ff",enabled:!1,statusRelevant:!0},{shortcut:"e",name:"Schicht E",color:"#ffff00",enabled:!1,statusRelevant:!0}],holidays:{neujahr:!0,heilige_drei_koenige:!0,tag_der_arbeit:!0,friedensfest:!0,mariae_himmelfahrt:!0,tag_der_deutschen_einheit:!0,reformationstag:!0,allerheiligen:!0,weihnachten_1:!0,weihnachten_2:!0,karfreitag:!0,ostermontag:!0,christi_himmelfahrt:!0,pfingstmontag:!0,fronleichnam:!0,busstag:!0}}),this._debug("EditorImpl-Modul wird geladen")}async firstUpdated(){this._debug("EditorImpl firstUpdated wird aufgerufen"),await super.firstUpdated(),this._debug("EditorImpl firstUpdated abgeschlossen")}render(){if(this._debug("EditorImpl render wird aufgerufen"),!this.hass)return this._debug("EditorImpl render: Kein hass"),Y`<div>Loading...</div>`;this._debug("EditorImpl render mit config:",this.config),this.config.calendars&&Array.isArray(this.config.calendars)||(this.config.calendars=[{shortcut:"a",name:"Schicht A",color:"#ff9800",enabled:!1,statusRelevant:!0},{shortcut:"b",name:"Schicht B",color:"#ff0000",enabled:!1,statusRelevant:!0},{shortcut:"c",name:"Schicht C",color:"#00ff00",enabled:!1,statusRelevant:!0},{shortcut:"d",name:"Schicht D",color:"#0000ff",enabled:!1,statusRelevant:!0},{shortcut:"e",name:"Schicht E",color:"#ffff00",enabled:!1,statusRelevant:!0}]);const e=new Map;return this.config.calendars.forEach((t=>e.set(t.shortcut,t))),this.config.calendars=[{shortcut:"a",name:"Schicht A",color:"#ff9800",enabled:!1,statusRelevant:!0},{shortcut:"b",name:"Schicht B",color:"#ff0000",enabled:!1,statusRelevant:!0},{shortcut:"c",name:"Schicht C",color:"#00ff00",enabled:!1,statusRelevant:!0},{shortcut:"d",name:"Schicht D",color:"#0000ff",enabled:!1,statusRelevant:!0},{shortcut:"e",name:"Schicht E",color:"#ffff00",enabled:!1,statusRelevant:!0}].map((t=>{const i=e.get(t.shortcut);return i?{...t,...i,shortcut:t.shortcut,statusRelevant:void 0===i.statusRelevant||i.statusRelevant}:t})),Y`
      <div class="card-config">
        <ha-form
          .hass=${this.hass}
          .data=${this.config}
          .schema=${this._getBasicSchema()}
          .computeLabel=${this._computeLabel}
          @value-changed=${this._valueChanged}
        ></ha-form>
        <div class="elements-section">
          <div class="calendars-list">
            ${this.config.calendars.map(((e,t)=>this._renderCalendar(t,e)))}
          </div>
        </div>
        <div class="elements-section">
          ${this._renderHolidays()}
        </div>
      </div>
    `}_updateUseElements(e){this.config={...this.config,useElements:e},this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this.config},bubbles:!0,composed:!0})),this.requestUpdate()}_getColorOptions(){return[{value:"#ff0000",name:"Rot"},{value:"#00ff00",name:"Grün"},{value:"#0000ff",name:"Blau"},{value:"#ffff00",name:"Gelb"},{value:"#ff00ff",name:"Magenta"},{value:"#00ffff",name:"Cyan"},{value:"#ff8800",name:"Orange"},{value:"#8800ff",name:"Violett"},{value:"#0088ff",name:"Hellblau"},{value:"#ff0088",name:"Pink"},{value:"#88ff00",name:"Lime"},{value:"#008888",name:"Türkis"},{value:"#888888",name:"Grau"},{value:"#000000",name:"Schwarz"},{value:"#ffffff",name:"Weiß"}]}_validateTime(e){return!e||""===e.trim()||/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(e.trim())}_validateTimeRange(e){if(!e||!Array.isArray(e)||e.length<2)return{isValid:!0,message:""};const t=e[0],i=e[1],n=t&&""!==t.trim(),r=i&&""!==i.trim();if(!n&&!r)return{isValid:!0,message:""};if(n&&r){const e=this._validateTime(t),n=this._validateTime(i);return e?n?{isValid:!0,message:""}:{isValid:!1,message:"Ungültiges Format für Endzeit. Bitte HH:MM verwenden (z.B. 17:00)"}:{isValid:!1,message:"Ungültiges Format für Startzeit. Bitte HH:MM verwenden (z.B. 08:30)"}}return n&&!r?{isValid:!1,message:"Bitte auch die Endzeit angeben"}:!n&&r?{isValid:!1,message:"Bitte auch die Startzeit angeben"}:{isValid:!0,message:""}}_renderCalendar(e,t){const i=this._getColorOptions(),n=t.color||"#ff0000",r=t.timeRanges||[[null,null],[null,null]],s=t.name||`Schicht ${t.shortcut.toUpperCase()}`,a=t.enabled||!1,o=this._validateTimeRange(r[0]),l=this._validateTimeRange(r[1]),c=!r[0]||!r[0][0]||this._validateTime(r[0][0]),d=!r[0]||!r[0][1]||this._validateTime(r[0][1]),h=!r[1]||!r[1][0]||this._validateTime(r[1][0]),u=!r[1]||!r[1][1]||this._validateTime(r[1][1]),f=!c||!o.isValid,g=!d||!o.isValid,p=!h||!l.isValid,m=!u||!l.isValid;return Y`
      <details class="calendar-item">
        <summary class="calendar-summary">
          <span class="calendar-summary-title">Schicht ${t.shortcut.toUpperCase()}: ${s}</span>
          <span class="calendar-summary-status">
            ${a?Y`<span class="status-badge status-enabled">Aktiviert</span>`:Y`<span class="status-badge status-disabled">Deaktiviert</span>`}
          </span>
        </summary>
        <div class="calendar-fields">
          <ha-textfield
            label="Name"
            .value=${t.name||""}
            maxlength="30"
            @input=${e=>this._updateCalendar(t.shortcut,"name",e.target.value)}
          ></ha-textfield>
          <div class="switch-item">
            <label class="switch-label">Aktiviert</label>
            <ha-switch
              .checked=${t.enabled||!1}
              @change=${e=>this._updateCalendar(t.shortcut,"enabled",e.target.checked)}
            ></ha-switch>
          </div>
          <div class="switch-item">
            <label class="switch-label">Status relevant</label>
            <ha-switch
              .checked=${!1!==t.statusRelevant}
              @change=${e=>this._updateCalendar(t.shortcut,"statusRelevant",e.target.checked)}
            ></ha-switch>
          </div>
          <div class="color-selector">
            <div class="color-selector-label">Farbe</div>
            <ha-combo-box
              label="Farbe"
              .value=${n}
              .items=${i.map((e=>({value:e.value,label:`${e.name} (${e.value})`})))}
              @value-changed=${e=>{const i=e.detail?.value;i&&this._updateCalendar(t.shortcut,"color",i)}}
            ></ha-combo-box>
            <div class="color-selected-preview">
              <span class="color-preview-large" style="background-color: ${n};"></span>
              <span class="color-selected-value">${n}</span>
            </div>
          </div>
          <div class="time-ranges">
            <div class="time-range-label">Zeiträume (optional)</div>
            <div class="time-range-item">
              <ha-textfield
                label="Startzeit 1"
                .value=${r[0]&&r[0][0]?r[0][0]:""}
                placeholder="HH:MM"
                pattern="^([0-1][0-9]|2[0-3]):[0-5][0-9]$"
                .error=${f}
                .helper=${f?o.message||"Ungültiges Format. Bitte HH:MM verwenden (z.B. 08:30)":""}
                @input=${e=>{const i=e.target.value.trim()||null,n=!i||this._validateTime(i);this._updateTimeRange(t.shortcut,0,0,i),setTimeout((()=>{const i=this.config.calendars?.find((e=>e.shortcut===t.shortcut)),r=i?.timeRanges?.[0]||[null,null],s=this._validateTimeRange(r),a=!n||!s.isValid;e.target.error=a,e.target.helper=a?s.message||"Ungültiges Format. Bitte HH:MM verwenden (z.B. 08:30)":"",this.requestUpdate()}),0)}}
                @blur=${e=>{const i=e.target.value.trim()||null,n=!i||this._validateTime(i),r=this.config.calendars?.find((e=>e.shortcut===t.shortcut)),s=r?.timeRanges?.[0]||[null,null],a=this._validateTimeRange(s),o=!n||!a.isValid;e.target.error=o,e.target.helper=o?a.message||"Ungültiges Format. Bitte HH:MM verwenden (z.B. 08:30)":"",this.requestUpdate()}}
              ></ha-textfield>
              <span class="time-separator">-</span>
              <ha-textfield
                label="Endzeit 1"
                .value=${r[0]&&r[0][1]?r[0][1]:""}
                placeholder="HH:MM"
                pattern="^([0-1][0-9]|2[0-3]):[0-5][0-9]$"
                .error=${g}
                .helper=${g?o.message||"Ungültiges Format. Bitte HH:MM verwenden (z.B. 17:00)":""}
                @input=${e=>{const i=e.target.value.trim()||null,n=!i||this._validateTime(i);this._updateTimeRange(t.shortcut,0,1,i),setTimeout((()=>{const i=this.config.calendars?.find((e=>e.shortcut===t.shortcut)),r=i?.timeRanges?.[0]||[null,null],s=this._validateTimeRange(r),a=!n||!s.isValid;e.target.error=a,e.target.helper=a?s.message||"Ungültiges Format. Bitte HH:MM verwenden (z.B. 17:00)":"",this.requestUpdate()}),0)}}
                @blur=${e=>{const i=e.target.value.trim()||null,n=!i||this._validateTime(i),r=this.config.calendars?.find((e=>e.shortcut===t.shortcut)),s=r?.timeRanges?.[0]||[null,null],a=this._validateTimeRange(s),o=!n||!a.isValid;e.target.error=o,e.target.helper=o?a.message||"Ungültiges Format. Bitte HH:MM verwenden (z.B. 17:00)":"",this.requestUpdate()}}
              ></ha-textfield>
            </div>
            <div class="time-range-item">
              <ha-textfield
                label="Startzeit 2"
                .value=${r[1]&&r[1][0]?r[1][0]:""}
                placeholder="HH:MM"
                pattern="^([0-1][0-9]|2[0-3]):[0-5][0-9]$"
                .error=${p}
                .helper=${p?l.message||"Ungültiges Format. Bitte HH:MM verwenden (z.B. 08:30)":""}
                @input=${e=>{const i=e.target.value.trim()||null,n=!i||this._validateTime(i);this._updateTimeRange(t.shortcut,1,0,i),setTimeout((()=>{const i=this.config.calendars?.find((e=>e.shortcut===t.shortcut)),r=i?.timeRanges?.[1]||[null,null],s=this._validateTimeRange(r),a=!n||!s.isValid;e.target.error=a,e.target.helper=a?s.message||"Ungültiges Format. Bitte HH:MM verwenden (z.B. 08:30)":"",this.requestUpdate()}),0)}}
                @blur=${e=>{const i=e.target.value.trim()||null,n=!i||this._validateTime(i),r=this.config.calendars?.find((e=>e.shortcut===t.shortcut)),s=r?.timeRanges?.[1]||[null,null],a=this._validateTimeRange(s),o=!n||!a.isValid;e.target.error=o,e.target.helper=o?a.message||"Ungültiges Format. Bitte HH:MM verwenden (z.B. 08:30)":"",this.requestUpdate()}}
              ></ha-textfield>
              <span class="time-separator">-</span>
              <ha-textfield
                label="Endzeit 2"
                .value=${r[1]&&r[1][1]?r[1][1]:""}
                placeholder="HH:MM"
                pattern="^([0-1][0-9]|2[0-3]):[0-5][0-9]$"
                .error=${m}
                .helper=${m?l.message||"Ungültiges Format. Bitte HH:MM verwenden (z.B. 17:00)":""}
                @input=${e=>{const i=e.target.value.trim()||null,n=!i||this._validateTime(i);this._updateTimeRange(t.shortcut,1,1,i),setTimeout((()=>{const i=this.config.calendars?.find((e=>e.shortcut===t.shortcut)),r=i?.timeRanges?.[1]||[null,null],s=this._validateTimeRange(r),a=!n||!s.isValid;e.target.error=a,e.target.helper=a?s.message||"Ungültiges Format. Bitte HH:MM verwenden (z.B. 17:00)":"",this.requestUpdate()}),0)}}
                @blur=${e=>{const i=e.target.value.trim()||null,n=!i||this._validateTime(i),r=this.config.calendars?.find((e=>e.shortcut===t.shortcut)),s=r?.timeRanges?.[1]||[null,null],a=this._validateTimeRange(s),o=!n||!a.isValid;e.target.error=o,e.target.helper=o?a.message||"Ungültiges Format. Bitte HH:MM verwenden (z.B. 17:00)":"",this.requestUpdate()}}
              ></ha-textfield>
            </div>
          </div>
        </div>
      </details>
    `}_renderHolidays(){return this.config.holidays||(this.config.holidays={neujahr:!0,heilige_drei_koenige:!0,tag_der_arbeit:!0,friedensfest:!0,mariae_himmelfahrt:!0,tag_der_deutschen_einheit:!0,reformationstag:!0,allerheiligen:!0,weihnachten_1:!0,weihnachten_2:!0,karfreitag:!0,ostermontag:!0,christi_himmelfahrt:!0,pfingstmontag:!0,fronleichnam:!0,busstag:!0}),Y`
      <details class="holidays-item">
        <summary class="holidays-summary">
          <span class="holidays-summary-title">Feiertage</span>
        </summary>
        <div class="holidays-fields">
          ${[{key:"neujahr",label:"Neujahr (1. Januar)"},{key:"heilige_drei_koenige",label:"Heilige Drei Könige (6. Januar)"},{key:"tag_der_arbeit",label:"Tag der Arbeit (1. Mai)"},{key:"friedensfest",label:"Friedensfest (8. August)"},{key:"mariae_himmelfahrt",label:"Mariä Himmelfahrt (15. August)"},{key:"tag_der_deutschen_einheit",label:"Tag der Deutschen Einheit (3. Oktober)"},{key:"reformationstag",label:"Reformationstag (31. Oktober)"},{key:"allerheiligen",label:"Allerheiligen (1. November)"},{key:"weihnachten_1",label:"1. Weihnachtsfeiertag (25. Dezember)"},{key:"weihnachten_2",label:"2. Weihnachtsfeiertag (26. Dezember)"},{key:"karfreitag",label:"Karfreitag"},{key:"ostermontag",label:"Ostermontag"},{key:"christi_himmelfahrt",label:"Christi Himmelfahrt"},{key:"pfingstmontag",label:"Pfingstmontag"},{key:"fronleichnam",label:"Fronleichnam"},{key:"busstag",label:"Buß- und Bettag"}].map((e=>Y`
            <div class="holiday-switch-item">
              <label class="holiday-label">${e.label}</label>
              <ha-switch
                .checked=${!1!==this.config.holidays[e.key]}
                @change=${t=>this._updateHoliday(e.key,t.target.checked)}
              ></ha-switch>
            </div>
          `))}
        </div>
      </details>
    `}_updateHoliday(e,t){this.config.holidays||(this.config.holidays={});const i={...this.config,holidays:{...this.config.holidays,[e]:t}};this.config=i,this.requestUpdate(),setTimeout((()=>{this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:i},bubbles:!0,composed:!0}))}),0)}_updateTimeRange(e,t,i,n){this.config.calendars||(this.config.calendars=[{shortcut:"a",name:"Schicht A",color:"#ff9800",enabled:!1},{shortcut:"b",name:"Schicht B",color:"#ff0000",enabled:!1},{shortcut:"c",name:"Schicht C",color:"#00ff00",enabled:!1},{shortcut:"d",name:"Schicht D",color:"#0000ff",enabled:!1},{shortcut:"e",name:"Schicht E",color:"#ffff00",enabled:!1}]);const r=this.config.calendars.map((r=>{if(r.shortcut===e){const e=(r.timeRanges||[[null,null],[null,null]]).map(((e,r)=>{if(r===t){const t=[...e];return t[i]=n||null,t}return e}));return{...r,timeRanges:e}}return r})),s={...this.config,calendars:r};this.config=s,this.requestUpdate(),setTimeout((()=>{this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:s},bubbles:!0,composed:!0}))}),0)}_updateCalendar(e,t,i){this.config.calendars||(this.config.calendars=[{shortcut:"a",name:"Schicht A",color:"#ff9800",enabled:!1},{shortcut:"b",name:"Schicht B",color:"#ff0000",enabled:!1},{shortcut:"c",name:"Schicht C",color:"#00ff00",enabled:!1},{shortcut:"d",name:"Schicht D",color:"#0000ff",enabled:!1},{shortcut:"e",name:"Schicht E",color:"#ffff00",enabled:!1}]);const n=this.config.calendars.map((n=>n.shortcut===e?{...n,[t]:i}:n)),r={...this.config,calendars:n};this.config=r,this.requestUpdate(),setTimeout((()=>{this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:r},bubbles:!0,composed:!0}))}),0)}_computeLabel(e){switch(e.name){case"entity":return"Entity (input_text)";case"numberOfMonths":return"Maximale Anzahl Monate";case"initialDisplayedMonths":return"Standardwert sichtbare Monate";default:return e.name}}_valueChanged(e){this._debug("EditorImpl _valueChanged wird aufgerufen mit:",e.detail);const t=e.detail.value;void 0!==t.initialDisplayedMonths&&void 0!==t.numberOfMonths?t.initialDisplayedMonths=Math.min(t.initialDisplayedMonths,t.numberOfMonths):void 0!==t.initialDisplayedMonths&&this.config.numberOfMonths?t.initialDisplayedMonths=Math.min(t.initialDisplayedMonths,this.config.numberOfMonths):void 0!==t.numberOfMonths&&this.config.initialDisplayedMonths&&this.config.initialDisplayedMonths>t.numberOfMonths&&(t.initialDisplayedMonths=t.numberOfMonths),this.config={...this.config,...t},this._debug("EditorImpl config nach _valueChanged:",this.config),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this.config},bubbles:!0,composed:!0}))}static getConfigElement(){return document.createElement(`${pe}-editor`)}static getStubConfig(){return{entity:"input_text.arbeitszeiten",numberOfMonths:14,initialDisplayedMonths:2,useElements:!1,selectedElement:null,elements:[{benennung:"Element 1",aktiv:!0,color:"#ff0000",shortcut:"1"},{benennung:"Element 2",aktiv:!0,color:"#00ff00",shortcut:"2"},{benennung:"Element 3",aktiv:!0,color:"#0000ff",shortcut:"3"},{benennung:"Element 4",aktiv:!0,color:"#ffff00",shortcut:"4"}],holidays:{neujahr:!0,heilige_drei_koenige:!0,tag_der_arbeit:!0,friedensfest:!0,mariae_himmelfahrt:!0,tag_der_deutschen_einheit:!0,reformationstag:!0,allerheiligen:!0,weihnachten_1:!0,weihnachten_2:!0,karfreitag:!0,ostermontag:!0,christi_himmelfahrt:!0,pfingstmontag:!0,fronleichnam:!0,busstag:!0}}}_getBasicSchema(){return[{name:"entity",selector:{entity:{domain:"input_text"}}},{name:"numberOfMonths",selector:{number:{min:1,max:14,step:1,mode:"box"}}},{name:"initialDisplayedMonths",selector:{number:{min:1,max:14,step:1,mode:"box"}}}]}}function nt(){return nt="undefined"!=typeof Reflect&&Reflect.get?Reflect.get.bind():function(e,t,i){var n=function(e,t){for(;!{}.hasOwnProperty.call(e,t)&&null!==(e=rt(e)););return e}(e,t);if(n){var r=Object.getOwnPropertyDescriptor(n,t);return r.get?r.get.call(arguments.length<3?e:i):r.value}},nt.apply(null,arguments)}function rt(e){return rt=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(e){return e.__proto__||Object.getPrototypeOf(e)},rt(e)}Qe(it,"properties",{...Xe(Se=it,"properties",Se)}),Qe(it,"styles",[Xe(Se,"styles",Se),h`
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

      .calendars-list {
        margin-top: 15px;
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
    `]);class st extends it{constructor(){super()}}function at(){return at="undefined"!=typeof Reflect&&Reflect.get?Reflect.get.bind():function(e,t,i){var n=function(e,t){for(;!{}.hasOwnProperty.call(e,t)&&null!==(e=ot(e)););return e}(e,t);if(n){var r=Object.getOwnPropertyDescriptor(n,t);return r.get?r.get.call(arguments.length<3?e:i):r.value}},at.apply(null,arguments)}function ot(e){return ot=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(e){return e.__proto__||Object.getPrototypeOf(e)},ot(e)}(function(e,t,i){(t=function(e){var t=function(e){if("object"!=typeof e||!e)return e;var t=e[Symbol.toPrimitive];if(void 0!==t){var i=t.call(e,"string");if("object"!=typeof i)return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(e)}(e);return"symbol"==typeof t?t:t+""}(t))in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i})(st,"styles",[function(e,t,i){var n=nt(rt(e),"styles",i);return n}(Me=st,0,Me),h`
      :host {
        display: block;
        padding-top: 2px;
        padding-bottom: 2px;
        padding-left: 16px;
        padding-right: 16px;
      }
    `]),customElements.get(`${pe}-editor`)||customElements.define(`${pe}-editor`,st);class lt extends qe{constructor(){super()}connectedCallback(){super.connectedCallback()}disconnectedCallback(){super.disconnectedCallback()}}if(function(e,t,i){(t=function(e){var t=function(e){if("object"!=typeof e||!e)return e;var t=e[Symbol.toPrimitive];if(void 0!==t){var i=t.call(e,"string");if("object"!=typeof i)return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(e)}(e);return"symbol"==typeof t?t:t+""}(t))in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i}(lt,"styles",[function(e,t,i){var n=at(ot(e),"styles",i);return n}(Ae=lt,0,Ae),h`
      :host {
      }
    `]),window.customCards&&window.customCards.push({type:pe,name:me,description:"Eine Schichtplan-Karte für Arbeitszeiten",preview:!0}),!customElements.get(pe))try{customElements.define(pe,lt)}catch(e){}})();
//# sourceMappingURL=tgshiftschedule-card.js.map