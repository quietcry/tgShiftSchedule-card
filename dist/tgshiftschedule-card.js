/*! For license information please see tgshiftschedule-card.js.LICENSE.txt */
(()=>{"use strict";var e,t,i={},n={};function s(e){var t=n[e];if(void 0!==t)return t.exports;var r=n[e]={exports:{}};return i[e](r,r.exports,s),r.exports}s.m=i,s.d=(e,t)=>{for(var i in t)s.o(t,i)&&!s.o(e,i)&&Object.defineProperty(e,i,{enumerable:!0,get:t[i]})},s.f={},s.e=e=>Promise.all(Object.keys(s.f).reduce(((t,i)=>(s.f[i](e,t),t)),[])),s.u=e=>e+".tgshiftschedule-card.js",s.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"==typeof window)return window}}(),s.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),e={},t="tgshiftschedule-card:",s.l=(i,n,r,a)=>{if(e[i])e[i].push(n);else{var o,l;if(void 0!==r)for(var c=document.getElementsByTagName("script"),h=0;h<c.length;h++){var d=c[h];if(d.getAttribute("src")==i||d.getAttribute("data-webpack")==t+r){o=d;break}}o||(l=!0,(o=document.createElement("script")).charset="utf-8",o.timeout=120,s.nc&&o.setAttribute("nonce",s.nc),o.setAttribute("data-webpack",t+r),o.src=i),e[i]=[n];var g=(t,n)=>{o.onerror=o.onload=null,clearTimeout(u);var s=e[i];if(delete e[i],o.parentNode&&o.parentNode.removeChild(o),s&&s.forEach((e=>e(n))),t)return t(n)},u=setTimeout(g.bind(null,void 0,{type:"timeout",target:o}),12e4);o.onerror=g.bind(null,o.onerror),o.onload=g.bind(null,o.onload),l&&document.head.appendChild(o)}},s.r=e=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},(()=>{var e;s.g.importScripts&&(e=s.g.location+"");var t=s.g.document;if(!e&&t&&(t.currentScript&&"SCRIPT"===t.currentScript.tagName.toUpperCase()&&(e=t.currentScript.src),!e)){var i=t.getElementsByTagName("script");if(i.length)for(var n=i.length-1;n>-1&&(!e||!/^http(s?):/.test(e));)e=i[n--].src}if(!e)throw new Error("Automatic publicPath is not supported in this browser");e=e.replace(/^blob:/,"").replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^\/]+$/,"/"),s.p=e})(),(()=>{var e={792:0};s.f.j=(t,i)=>{var n=s.o(e,t)?e[t]:void 0;if(0!==n)if(n)i.push(n[2]);else{var r=new Promise(((i,s)=>n=e[t]=[i,s]));i.push(n[2]=r);var a=s.p+s.u(t),o=new Error;s.l(a,(i=>{if(s.o(e,t)&&(0!==(n=e[t])&&(e[t]=void 0),n)){var r=i&&("load"===i.type?"missing":i.type),a=i&&i.target&&i.target.src;o.message="Loading chunk "+t+" failed.\n("+r+": "+a+")",o.name="ChunkLoadError",o.type=r,o.request=a,n[1](o)}}),"chunk-"+t,t)}};var t=(t,i)=>{var n,r,[a,o,l]=i,c=0;if(a.some((t=>0!==e[t]))){for(n in o)s.o(o,n)&&(s.m[n]=o[n]);l&&l(s)}for(t&&t(i);c<a.length;c++)r=a[c],s.o(e,r)&&e[r]&&e[r][0](),e[r]=0},i=self.webpackChunktgshiftschedule_card=self.webpackChunktgshiftschedule_card||[];i.forEach(t.bind(null,0)),i.push=t.bind(null,i.push.bind(i))})();const r=globalThis,a=r.ShadowRoot&&(void 0===r.ShadyCSS||r.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,o=Symbol(),l=new WeakMap;class c{constructor(e,t,i){if(this._$cssResult$=!0,i!==o)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(a&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=l.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&l.set(t,e))}return e}toString(){return this.cssText}}const h=e=>new c("string"==typeof e?e:e+"",void 0,o),d=(e,...t)=>{const i=1===e.length?e[0]:t.reduce(((t,i,n)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[n+1]),e[0]);return new c(i,e,o)},g=a?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return h(t)})(e):e,{is:u,defineProperty:f,getOwnPropertyDescriptor:p,getOwnPropertyNames:m,getOwnPropertySymbols:b,getPrototypeOf:_}=Object,y=globalThis,v=y.trustedTypes,w=v?v.emptyScript:"",S=y.reactiveElementPolyfillSupport,$=(e,t)=>e,C={toAttribute(e,t){switch(t){case Boolean:e=e?w:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},E=(e,t)=>!u(e,t),k={attribute:!0,type:String,converter:C,reflect:!1,useDefault:!1,hasChanged:E};Symbol.metadata??=Symbol("metadata"),y.litPropertyMetadata??=new WeakMap;class x extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=k){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),n=this.getPropertyDescriptor(e,i,t);void 0!==n&&f(this.prototype,e,n)}}static getPropertyDescriptor(e,t,i){const{get:n,set:s}=p(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:n,set(t){const r=n?.call(this);s?.call(this,t),this.requestUpdate(e,r,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??k}static _$Ei(){if(this.hasOwnProperty($("elementProperties")))return;const e=_(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty($("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty($("properties"))){const e=this.properties,t=[...m(e),...b(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const i=this._$Eu(e,t);void 0!==i&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(g(e))}else void 0!==e&&t.push(g(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise((e=>this.enableUpdating=e)),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach((e=>e(this)))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,t)=>{if(a)e.adoptedStyleSheets=t.map((e=>e instanceof CSSStyleSheet?e:e.styleSheet));else for(const i of t){const t=document.createElement("style"),n=r.litNonce;void 0!==n&&t.setAttribute("nonce",n),t.textContent=i.cssText,e.appendChild(t)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach((e=>e.hostConnected?.()))}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach((e=>e.hostDisconnected?.()))}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),n=this.constructor._$Eu(e,i);if(void 0!==n&&!0===i.reflect){const s=(void 0!==i.converter?.toAttribute?i.converter:C).toAttribute(t,i.type);this._$Em=e,null==s?this.removeAttribute(n):this.setAttribute(n,s),this._$Em=null}}_$AK(e,t){const i=this.constructor,n=i._$Eh.get(e);if(void 0!==n&&this._$Em!==n){const e=i.getPropertyOptions(n),s="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:C;this._$Em=n,this[n]=s.fromAttribute(t,e.type)??this._$Ej?.get(n)??null,this._$Em=null}}requestUpdate(e,t,i){if(void 0!==e){const n=this.constructor,s=this[e];if(i??=n.getPropertyOptions(e),!((i.hasChanged??E)(s,t)||i.useDefault&&i.reflect&&s===this._$Ej?.get(e)&&!this.hasAttribute(n._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:n,wrapped:s},r){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,r??t??this[e]),!0!==s||void 0!==r)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===n&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,n=this[t];!0!==e||this._$AL.has(t)||void 0===n||this.C(t,void 0,i,n)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach((e=>e.hostUpdate?.())),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach((e=>e.hostUpdated?.())),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach((e=>this._$ET(e,this[e]))),this._$EM()}updated(e){}firstUpdated(e){}}x.elementStyles=[],x.shadowRootOptions={mode:"open"},x[$("elementProperties")]=new Map,x[$("finalized")]=new Map,S?.({ReactiveElement:x}),(y.reactiveElementVersions??=[]).push("2.1.0");const D=globalThis,A=D.trustedTypes,T=A?A.createPolicy("lit-html",{createHTML:e=>e}):void 0,M="$lit$",O=`lit$${Math.random().toFixed(9).slice(2)}$`,R="?"+O,j=`<${R}>`,W=document,I=()=>W.createComment(""),L=e=>null===e||"object"!=typeof e&&"function"!=typeof e,z=Array.isArray,N="[ \t\n\f\r]",P=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,F=/-->/g,U=/>/g,B=RegExp(`>|${N}(?:([^\\s"'>=/]+)(${N}*=${N}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),H=/'/g,V=/"/g,K=/^(?:script|style|textarea|title)$/i,q=e=>(t,...i)=>({_$litType$:e,strings:t,values:i}),Z=q(1),J=(q(2),q(3),Symbol.for("lit-noChange")),G=Symbol.for("lit-nothing"),Y=new WeakMap,Q=W.createTreeWalker(W,129);function X(e,t){if(!z(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==T?T.createHTML(t):t}const ee=(e,t)=>{const i=e.length-1,n=[];let s,r=2===t?"<svg>":3===t?"<math>":"",a=P;for(let t=0;t<i;t++){const i=e[t];let o,l,c=-1,h=0;for(;h<i.length&&(a.lastIndex=h,l=a.exec(i),null!==l);)h=a.lastIndex,a===P?"!--"===l[1]?a=F:void 0!==l[1]?a=U:void 0!==l[2]?(K.test(l[2])&&(s=RegExp("</"+l[2],"g")),a=B):void 0!==l[3]&&(a=B):a===B?">"===l[0]?(a=s??P,c=-1):void 0===l[1]?c=-2:(c=a.lastIndex-l[2].length,o=l[1],a=void 0===l[3]?B:'"'===l[3]?V:H):a===V||a===H?a=B:a===F||a===U?a=P:(a=B,s=void 0);const d=a===B&&e[t+1].startsWith("/>")?" ":"";r+=a===P?i+j:c>=0?(n.push(o),i.slice(0,c)+M+i.slice(c)+O+d):i+O+(-2===c?t:d)}return[X(e,r+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),n]};class te{constructor({strings:e,_$litType$:t},i){let n;this.parts=[];let s=0,r=0;const a=e.length-1,o=this.parts,[l,c]=ee(e,t);if(this.el=te.createElement(l,i),Q.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(n=Q.nextNode())&&o.length<a;){if(1===n.nodeType){if(n.hasAttributes())for(const e of n.getAttributeNames())if(e.endsWith(M)){const t=c[r++],i=n.getAttribute(e).split(O),a=/([.?@])?(.*)/.exec(t);o.push({type:1,index:s,name:a[2],strings:i,ctor:"."===a[1]?ae:"?"===a[1]?oe:"@"===a[1]?le:re}),n.removeAttribute(e)}else e.startsWith(O)&&(o.push({type:6,index:s}),n.removeAttribute(e));if(K.test(n.tagName)){const e=n.textContent.split(O),t=e.length-1;if(t>0){n.textContent=A?A.emptyScript:"";for(let i=0;i<t;i++)n.append(e[i],I()),Q.nextNode(),o.push({type:2,index:++s});n.append(e[t],I())}}}else if(8===n.nodeType)if(n.data===R)o.push({type:2,index:s});else{let e=-1;for(;-1!==(e=n.data.indexOf(O,e+1));)o.push({type:7,index:s}),e+=O.length-1}s++}}static createElement(e,t){const i=W.createElement("template");return i.innerHTML=e,i}}function ie(e,t,i=e,n){if(t===J)return t;let s=void 0!==n?i._$Co?.[n]:i._$Cl;const r=L(t)?void 0:t._$litDirective$;return s?.constructor!==r&&(s?._$AO?.(!1),void 0===r?s=void 0:(s=new r(e),s._$AT(e,i,n)),void 0!==n?(i._$Co??=[])[n]=s:i._$Cl=s),void 0!==s&&(t=ie(e,s._$AS(e,t.values),s,n)),t}class ne{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,n=(e?.creationScope??W).importNode(t,!0);Q.currentNode=n;let s=Q.nextNode(),r=0,a=0,o=i[0];for(;void 0!==o;){if(r===o.index){let t;2===o.type?t=new se(s,s.nextSibling,this,e):1===o.type?t=new o.ctor(s,o.name,o.strings,this,e):6===o.type&&(t=new ce(s,this,e)),this._$AV.push(t),o=i[++a]}r!==o?.index&&(s=Q.nextNode(),r++)}return Q.currentNode=W,n}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class se{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,n){this.type=2,this._$AH=G,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=n,this._$Cv=n?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=ie(this,e,t),L(e)?e===G||null==e||""===e?(this._$AH!==G&&this._$AR(),this._$AH=G):e!==this._$AH&&e!==J&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>z(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==G&&L(this._$AH)?this._$AA.nextSibling.data=e:this.T(W.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,n="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=te.createElement(X(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===n)this._$AH.p(t);else{const e=new ne(n,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=Y.get(e.strings);return void 0===t&&Y.set(e.strings,t=new te(e)),t}k(e){z(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,n=0;for(const s of e)n===t.length?t.push(i=new se(this.O(I()),this.O(I()),this,this.options)):i=t[n],i._$AI(s),n++;n<t.length&&(this._$AR(i&&i._$AB.nextSibling,n),t.length=n)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e&&e!==this._$AB;){const t=e.nextSibling;e.remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class re{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,n,s){this.type=1,this._$AH=G,this._$AN=void 0,this.element=e,this.name=t,this._$AM=n,this.options=s,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=G}_$AI(e,t=this,i,n){const s=this.strings;let r=!1;if(void 0===s)e=ie(this,e,t,0),r=!L(e)||e!==this._$AH&&e!==J,r&&(this._$AH=e);else{const n=e;let a,o;for(e=s[0],a=0;a<s.length-1;a++)o=ie(this,n[i+a],t,a),o===J&&(o=this._$AH[a]),r||=!L(o)||o!==this._$AH[a],o===G?e=G:e!==G&&(e+=(o??"")+s[a+1]),this._$AH[a]=o}r&&!n&&this.j(e)}j(e){e===G?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class ae extends re{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===G?void 0:e}}class oe extends re{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==G)}}class le extends re{constructor(e,t,i,n,s){super(e,t,i,n,s),this.type=5}_$AI(e,t=this){if((e=ie(this,e,t,0)??G)===J)return;const i=this._$AH,n=e===G&&i!==G||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,s=e!==G&&(i===G||n);n&&this.element.removeEventListener(this.name,this,i),s&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class ce{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){ie(this,e)}}const he=D.litHtmlPolyfillSupport;he?.(te,se),(D.litHtmlVersions??=[]).push("3.3.0");const de=globalThis;class ge extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{const n=i?.renderBefore??t;let s=n._$litPart$;if(void 0===s){const e=i?.renderBefore??null;n._$litPart$=s=new se(t.insertBefore(I(),e),e,void 0,i??{})}return s._$AI(e),s})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return J}}ge._$litElement$=!0,ge.finalized=!0,de.litElementHydrateSupport?.({LitElement:ge});const ue=de.litElementPolyfillSupport;ue?.({LitElement:ge}),(de.litElementVersions??=[]).push("4.2.0");const fe="2026.01-0007",pe="tgshiftschedule-card",me="TG Schichtplan Card",be="true";function _e(e,t,i){return(t=function(e){var t=function(e){if("object"!=typeof e||!e)return e;var t=e[Symbol.toPrimitive];if(void 0!==t){var i=t.call(e,"string");if("object"!=typeof i)return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(e)}(e);return"symbol"==typeof t?t:t+""}(t))in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i,e}class ye{constructor(e,t,i,n){this.cardName=e||this.constructor.cardName||null,this.debugMode=t||this.constructor.debugMode||"true",this.className=i||this.constructor.className||null,this.version=n||this.constructor.version||null,this.getCardInfoString=[`%c${this.cardName}%c${this.version}%c`,"background: #9c27b0; color: white; padding: 2px 6px; border-top-left-radius: 12px; border-bottom-left-radius: 12px; font-weight: bold;","background: #00bcd4; color: white; padding: 2px 6px; border-top-right-radius: 12px; border-bottom-right-radius: 12px; font-weight: bold;",""]}_debug(...e){if(!this.debugMode||"false"===this.debugMode||!1===this.debugMode)return;let t=null,i=null,n=null,s=null;Array.isArray(e[0])&&1===e[0].length&&e[0][0]&&"object"==typeof e[0][0]&&e[0][0].constructor&&(e[0][0].cardName||e[0][0].constructor.className)?(s=e[0][0],e=e.slice(1)):s=this,t=s.constructor.className?s.constructor.className:s.tagName?s.tagName.toLowerCase().replace(/[^a-z0-9]/g,""):s.constructor.name&&s.constructor.name.length>2?s.constructor.name:s.cardName?s.cardName:"unknownClass",n=s.cardName||this.cardName||"unknownCard";const r=this.debugMode.split(",").map((e=>e.trim().toLowerCase()));if(!("true"===r[0].toLowerCase()?!r.slice(1).includes(t.toLowerCase()):r.includes(t.toLowerCase())))return;if(!i)try{const e=(new Error).stack.split("\n")[2],t=[/at\s+\w+\.(\w+)/,/(\w+)@/,/(\w+)\s+\(/,/at\s+(\w+)/];for(const n of t){const t=e.match(n);if(t){i=t[1];break}}}catch(e){i=null}i=i||"unknownMethod";let a=`[${n}]:[${t}]:[${i}]`;for(;a.length<50;)a+=" ";const o=[a,...e];console.log(...this.getCardInfoString,...o)}}function ve(e,t,i){return(t=function(e){var t=function(e){if("object"!=typeof e||!e)return e;var t=e[Symbol.toPrimitive];if(void 0!==t){var i=t.call(e,"string");if("object"!=typeof i)return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(e)}(e);return"symbol"==typeof t?t:t+""}(t))in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i,e}_e(ye,"cardName",me),_e(ye,"debugMode",be),_e(ye,"className","TgCardHelper"),_e(ye,"version",fe);class we extends ge{constructor(){super(),this.dM=`${this.constructor.className}: `,this.cardName=this.constructor.cardName,this.version=this.constructor.version,this.debugMode=this.constructor.debugMode,this.useDummyData=this.constructor.useDummyData,this.showVersion=this.constructor.showVersion,this.tgCardHelper=new ye(this.constructor.cardName,this.constructor.debugMode),this.getCardInfoString=this.tgCardHelper.getCardInfoString,this._debug("SuperBase-Konstruktor wird aufgerufen")}registerMeForChangeNotifys(e="",t=this){const i=`${this.dM||"?: "}registerMeForChangeNotifys() `;this._debug(`${i} Aufruf`,{eventTypes:e,that:t}),this.dispatchEvent(new CustomEvent("registerMeForChanges",{bubbles:!0,composed:!0,detail:{component:t,callback:this._handleOnChangeNotifys.bind(this),eventType:e,immediately:!0}}))}_handleOnChangeNotifys(e){const t=`${this.dM||"?: "}_handleOnChangeNotifys() `;this._debug(`${t}aufgerufen`,{eventdata:e});for(const i of Object.keys(e)){const n="_handleOnChangeNotify_"+i.charAt(0).toUpperCase()+i.slice(1);"function"==typeof this[n]?(this._debug(`${t} ${n} aufgerufen`,{eventdata:e[i]}),this[n](e[i])):this._debug(`${t} ${n} nicht gefunden`,{eventdata:e[i]})}}_debug(...e){this.tgCardHelper._debug([this],...e)}}var Se,$e;function Ce(e,t,i,n){var s=Ee(ke(1&n?e.prototype:e),t,i);return 2&n&&"function"==typeof s?function(e){return s.apply(i,e)}:s}function Ee(){return Ee="undefined"!=typeof Reflect&&Reflect.get?Reflect.get.bind():function(e,t,i){var n=function(e,t){for(;!{}.hasOwnProperty.call(e,t)&&null!==(e=ke(e)););return e}(e,t);if(n){var s=Object.getOwnPropertyDescriptor(n,t);return s.get?s.get.call(arguments.length<3?e:i):s.value}},Ee.apply(null,arguments)}function ke(e){return ke=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(e){return e.__proto__||Object.getPrototypeOf(e)},ke(e)}function xe(e,t,i){return(t=function(e){var t=function(e){if("object"!=typeof e||!e)return e;var t=e[Symbol.toPrimitive];if(void 0!==t){var i=t.call(e,"string");if("object"!=typeof i)return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(e)}(e);return"symbol"==typeof t?t:t+""}(t))in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i,e}ve(we,"cardName",me),ve(we,"version",fe),ve(we,"debugMode",be),ve(we,"useDummyData","false"),ve(we,"showVersion",!1),ve(we,"className","SuperBase"),ve(we,"properties",{hass:{type:Object},config:{type:Object}}),ve(we,"styles",[d`
      :host {
        display: block;
      }
    `]);class De extends we{constructor(){super(),this.dM=`${this.constructor.className}: `,this._selectedTab=0,this._debug("CardBase-Modul wird geladen"),this.informAtChangesClients=[],this._registeredEventTypes=new Set,this.addEventListener("registerMeForChanges",this._onRegisterMeForChanges.bind(this))}async firstUpdated(){this._debug("CardBase firstUpdated: Start"),await super.firstUpdated(),this._debug("CardBase firstUpdated: Ende")}setConfig(e){if(this._debug("setConfig wird aufgerufen mit:",e),!e)throw new Error("Keine Konfiguration angegeben");const t=!this.config||0===Object.keys(this.config).length;this.config=t?{...this.getDefaultConfig(),...e}:{...this.config,...e},this._debug("config nach setConfig:",this.config)}getDefaultConfig(){return this._debug("getDefaultConfig wird aufgerufen"),{numberOfMonths:14,initialDisplayedMonths:2,selectedCalendar:"a",store_mode:"saver",saver_key:"Schichtplan",calendars:[{shortcut:"a",name:"Kalender A",color:"#ff9800",enabled:!0,statusRelevant:!0},{shortcut:"b",name:"Kalender B",color:"#ff0000",enabled:!1,statusRelevant:!0},{shortcut:"c",name:"Kalender C",color:"#00ff00",enabled:!1,statusRelevant:!0},{shortcut:"d",name:"Kalender D",color:"#0000ff",enabled:!1,statusRelevant:!0},{shortcut:"e",name:"Kalender E",color:"#ffff00",enabled:!1,statusRelevant:!0}],holidays:{neujahr:!0,heilige_drei_koenige:!0,tag_der_arbeit:!0,friedensfest:!0,mariae_himmelfahrt:!0,tag_der_deutschen_einheit:!0,reformationstag:!0,allerheiligen:!0,weihnachten_1:!0,weihnachten_2:!0,karfreitag:!0,ostermontag:!0,christi_himmelfahrt:!0,pfingstmontag:!0,fronleichnam:!0,busstag:!0}}}render(e=""){return this._debug("render wird aufgerufen"),html`
      <ha-card>
        <div class="card-content">${e}</div>
        ${this.showVersion?html` <div class="version">Version: ${this.version}</div> `:""}
      </ha-card>
    `}_onRegisterMeForChanges(e){this._debug("Registrierungsanfrage empfangen",{component:e.target,detail:e.detail});const{component:t,callback:i,eventType:n="",immediately:s=!1}=e.detail;t&&"function"==typeof i?(this.registerInformAtChangesClients(t,n,s,i),this._debug("Komponente erfolgreich registriert",{component:t.tagName||t.constructor.name,eventType:n})):this._debug("Registrierung fehlgeschlagen",{componentExists:!!t,hasCallback:"function"==typeof i})}registerInformAtChangesClients(e,t="",i=!1,n=null){const s=`${this.dM||"?: "}registerInformAtChangesClients() `;this._debug(`${s}Anfrage`,{me:e,newEventType:t});const r=Array.isArray(t)?t.map((e=>e.toLowerCase())).sort():"string"==typeof t?t.split(",").map((e=>e.trim().toLowerCase())).filter((e=>e.length>0)).sort():[],a=this.informAtChangesClients.find((t=>t.me===e));let o=[];a&&(o=Array.isArray(a.eventType)?a.eventType.map((e=>e.toLowerCase())).sort():"string"==typeof a.eventType?a.eventType.split(",").map((e=>e.trim().toLowerCase())).filter((e=>e.length>0)).sort():[]);const l=r.filter((e=>!o.includes(e)));if(a&&0===l.length)return this._debug(`${s}Client war bereits mit allen Typen registriert`,{me:e,requestedEventTypes:r,existingEventTypes:o}),!1;if(a){const t=[...o,...l].sort();a.eventType=t,this._debug(`${s}Neue EventTypes hinzugefügt`,{me:e,newEventTypes:l,existingEventTypes:o,combinedEventTypes:t})}else this.informAtChangesClients.push({me:e,eventType:l,callback:n}),this._debug(`${s}Neuer Informer registriert`,{me:e,newEventTypes:l,totalObservers:this.informAtChangesClients.length});return l.forEach((t=>{this._registeredEventTypes.has(t)?this._debug(`${s}Listener für EventType bereits vorhanden`,{eventType:t}):(this._debug(`${s}Füge Listener für EventType hinzu`,{eventType:t}),this.addEventListener(t+"-event",this._notifyClientsAtChanges.bind(this)),this._registeredEventTypes.add(t));const n="_onRegisterMeFor_"+t.charAt(0).toUpperCase()+t.slice(1);this._debug(`${s}Registriere Komponente für EnvSniffer-Änderungen`,{fkt:n}),"function"==typeof this[n]&&this[n](i,e)})),!0}_notifyClientsAtChanges(e){this._debug("_notifyClientsAtChanges() Anfrage",{event:e});const t=e.type.replace("-event",""),i="_on"+t.charAt(0).toUpperCase()+t.slice(1);this._debug("_notifyClientsAtChanges() EventType extrahiert",{originalEventType:e.type,extractedEventType:t,clients:this.informAtChangesClients,fkt:i}),this.informAtChangesClients.forEach((n=>{if(t&&n.eventType.includes(t)&&n.me&&(n.me instanceof Element||n.me.nodeType)&&(document.contains(n.me)||n.me.isConnected)){const s="function"==typeof this[i]?this[i](n.me,e):e.detail||{},r={[t]:s};if(s&&n.callback&&"function"==typeof n.callback)try{this._debug("_notifyClientsAtChanges() Client benachrichtigen",{client:n.me.constructor.name,eventType:t,data:r}),n.callback(r)}catch(e){}}}))}}function Ae(){return Ae="undefined"!=typeof Reflect&&Reflect.get?Reflect.get.bind():function(e,t,i){var n=function(e,t){for(;!{}.hasOwnProperty.call(e,t)&&null!==(e=Te(e)););return e}(e,t);if(n){var s=Object.getOwnPropertyDescriptor(n,t);return s.get?s.get.call(arguments.length<3?e:i):s.value}},Ae.apply(null,arguments)}function Te(e){return Te=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(e){return e.__proto__||Object.getPrototypeOf(e)},Te(e)}function Me(e,t,i){return(t=function(e){var t=function(e){if("object"!=typeof e||!e)return e;var t=e[Symbol.toPrimitive];if(void 0!==t){var i=t.call(e,"string");if("object"!=typeof i)return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(e)}(e);return"symbol"==typeof t?t:t+""}(t))in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i,e}Se=De,xe(De,"className","CardBase"),xe(De,"properties",{...Ce(Se,"properties",Se),_selectedTab:{type:Number}}),xe(De,"styles",[Ce(Se,"styles",Se),d`
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
    `]);class Oe extends we{constructor(){super(),this._debug("ViewBase-Konstruktor: Start"),this.config={},this.epgData=[],this._loading=!1,this._error=null,this._debug("ViewBase-Konstruktor: Initialisierung abgeschlossen")}async firstUpdated(){this._debug("ViewBase firstUpdated: Start"),await super.firstUpdated(),this._debug("ViewBase firstUpdated: Ende")}async _loadData(){if(this._debug("ViewBase _loadData wird aufgerufen"),this._dataProvider&&this.config.entity){this._loading=!0,this._error=null;try{this._debug("Starte _fetchViewData mit Konfiguration:",this.config);const e=await this._fetchViewData(this.config);this.epgData=e,this._debug("_fetchViewData erfolgreich:",e)}catch(e){this._error=e,this._debug("Fehler in _fetchViewData:",e)}finally{this._loading=!1}}else this._debug("ViewBase _loadData: Übersprungen - dataProvider oder entity fehlt",{dataProvider:!!this._dataProvider,entity:this.config.entity,config:this.config})}async _fetchViewData(e){throw new Error("_fetchViewData muss in der abgeleiteten Klasse implementiert werden")}render(){return this._loading?this._renderLoading():this._error?this._renderError():this._renderContent()}_renderLoading(){return html`<div class="loading">Lade Daten...</div>`}_renderError(){return html`<div class="error">${this._error}</div>`}_renderContent(){return html`<div>Keine Daten verfügbar</div>`}}$e=Oe,Me(Oe,"className","ViewBase"),Me(Oe,"properties",{config:{type:Object},epgData:{type:Array},_loading:{type:Boolean},_error:{type:Object}}),Me(Oe,"styles",[function(e,t,i){var n=Ae(Te(e),"styles",i);return n}($e,0,$e),d`
      :host {
        display: block;
      }
    `]);class Re{static isApplicable(e){throw new Error("isApplicable muss in der abgeleiteten Klasse implementiert werden")}constructor(e,t,i){this._hass=e,this._config=t,this._debug=i}async saveData(e){throw new Error("saveData muss in der abgeleiteten Klasse implementiert werden")}async loadData(){throw new Error("loadData muss in der abgeleiteten Klasse implementiert werden")}async saveConfig(e){throw new Error("saveConfig muss in der abgeleiteten Klasse implementiert werden")}async loadConfig(){throw new Error("loadConfig muss in der abgeleiteten Klasse implementiert werden")}isAvailable(){throw new Error("isAvailable muss in der abgeleiteten Klasse implementiert werden")}getWarnings(){throw new Error("getWarnings muss in der abgeleiteten Klasse implementiert werden")}checkStorageUsage(e){return null}}class je extends Re{static isApplicable(e){return"saver"===e}constructor(e,t,i){super(e,t,i),this._saverKey=t?.saver_key||"Schichtplan"}isAvailable(){if(!this._hass||!this._config||!this._config.saver_key)return!1;const e=this._hass.states?.["saver.saver"];return!!e}_readSaverVariable(e){if(!this._hass||!this._hass.states)return null;const t=this._hass.states["saver.saver"];if(!t||!t.attributes||!t.attributes.variables)return null;const i=t.attributes.variables[e];return null==i?null:String(i).trim()}async saveData(e){if(this.isAvailable()){this._debug(`[SaverStorage] saveData: Start, saver_key: "${this._saverKey}", Datenlänge: ${e.length} Zeichen`);try{const t=this._readSaverVariable(this._saverKey);this._debug(`[SaverStorage] saveData: Saver-Variable "${this._saverKey}" existiert: ${null!==t}, alte Länge: ${t?.length||0} Zeichen`),null===t||t!==e?(this._debug("[SaverStorage] saveData: Schreibe in Saver (Variable existiert nicht oder Wert hat sich geändert)"),await this._hass.callService("saver","set_variable",{name:this._saverKey,value:e||""}),this._debug("[SaverStorage] saveData: Erfolgreich in Saver geschrieben")):this._debug("[SaverStorage] saveData: Kein Schreiben nötig, Wert hat sich nicht geändert")}catch(e){throw this._debug(`[SaverStorage] saveData: Fehler beim Schreiben in Saver: ${e.message}`,e),console.warn("[TG Schichtplan] Fehler beim Schreiben in Saver:",e),e}}else this._debug("[SaverStorage] saveData: Nicht verfügbar")}async loadData(){if(!this.isAvailable())return this._debug("[SaverStorage] loadData: Nicht verfügbar"),null;this._debug(`[SaverStorage] loadData: Versuche Daten von Saver-Variable "${this._saverKey}" zu laden`);const e=this._readSaverVariable(this._saverKey);return e&&""!==e.trim()?(this._debug(`[SaverStorage] loadData: Daten erfolgreich geladen, Länge: ${e.length} Zeichen`),e):(this._debug("[SaverStorage] loadData: Keine Daten gefunden"),null)}_createFullJsonConfig(e){const t={calendars:e,setup:{timer_entity:this._config?.entity||"",store_mode:this._config?.store_mode||"saver"},lastchange:Math.floor(Date.now()/1e3)};return this._debug(`[SaverStorage] _createFullJsonConfig: lastchange auf ${t.lastchange} gesetzt (aktueller Unix-Timestamp)`),JSON.stringify(t)}async saveConfig(e){if(!this.isAvailable())return void this._debug("[SaverStorage] saveConfig: Nicht verfügbar");const t=`${this._saverKey}_config`;this._debug(`[SaverStorage] saveConfig: Saver-Key: "${this._saverKey}", Config-Key: "${t}"`);const i=this._createFullJsonConfig(e);this._debug(`[SaverStorage] saveConfig: JSON-Config erstellt, Länge: ${i.length} Zeichen, Kalender: ${e?.length||0}`);try{await this._hass.callService("saver","set_variable",{name:t,value:String(i)}),this._debug(`[SaverStorage] saveConfig: Variable "${t}" wurde im Saver gespeichert`)}catch(e){throw this._debug(`[SaverStorage] saveConfig: Fehler beim Schreiben: ${e.message}`,e),e}}async loadConfig(){if(!this.isAvailable())return this._debug("[SaverStorage] loadConfig: Nicht verfügbar"),null;const e=`${this._saverKey}_config`;this._debug(`[SaverStorage] loadConfig: Versuche Config von Saver-Variable "${e}" zu laden`);const t=this._readSaverVariable(e);return t&&""!==t.trim()?(this._debug(`[SaverStorage] loadConfig: Config erfolgreich geladen, Länge: ${t.length} Zeichen`),t):(this._debug("[SaverStorage] loadConfig: Keine Config gefunden"),null)}getWarnings(){return null}}class We extends Re{static isApplicable(e){return"text_entity"===e||!e||""===e}constructor(e,t,i){super(e,t,i),this._knownEntityIds=null}isAvailable(){return!!(this._hass&&this._config&&this._config.entity)}findAdditionalEntities(e){const t=[];if(!this._hass||!this._hass.states)return t;const i=e.split(".");if(2!==i.length)return t;const[n,s]=i;for(let e=1;e<=999;e++){const i=`${n}.${s}_${String(e).padStart(3,"0")}`;if(!this._hass.states[i])break;t.push(i)}return t}getEntityMaxLength(e){if(!this._hass||!this._hass.states||!e)return null;const t=this._hass.states[e];if(!t||!t.attributes)return null;const i=t.attributes.max;return null!=i?parseInt(i):null}getAllEntityMaxLengths(){const e={};if(!this._hass||!this._config||!this._config.entity)return e;const t=this._config.entity,i=this.getEntityMaxLength(t);null!==i&&(e[t]=i);const n=this.findAdditionalEntities(t);for(const t of n){const i=this.getEntityMaxLength(t);null!==i&&(e[t]=i)}return e}_getAllEntityIds(){if(this._knownEntityIds&&this._knownEntityIds.length>0)return[...this._knownEntityIds];const e=[this._config.entity],t=this.findAdditionalEntities(this._config.entity);return e.push(...t),this._knownEntityIds=[...e],e}async saveData(e){if(this.isAvailable()){this._debug(`[EntityStorage] saveData: Start, Datenlänge: ${e?e.length:0} Zeichen`);try{let t=this._getAllEntityIds();const i=this.findAdditionalEntities(this._config.entity),n=this._knownEntityIds?this._knownEntityIds.length-1:0;if(i.length>n){const e=i.slice(n);t.push(...e),this._knownEntityIds=[...t]}this._debug(`[EntityStorage] saveData: Verwende ${t.length} Entities: ${t.join(", ")}`);const s={};let r=0;for(const e of t){const t=this.getEntityMaxLength(e);null!==t?(s[e]=t,r+=t):(s[e]=255,r+=255)}const a=e?e.length:0;if(this._debug(`[EntityStorage] saveData: Datenlänge: ${a} Zeichen, verfügbarer Speicher: ${r} Zeichen`),!e||""===e.trim()){this._debug("[EntityStorage] saveData: Keine Daten vorhanden, setze alle Entities auf leer");for(const e of t)try{await this._hass.callService("input_text","set_value",{entity_id:e,value:""})}catch(t){this._debug(`[EntityStorage] saveData: Fehler beim Leeren von "${e}": ${t.message}`)}return}const o={};let l=0,c=e;for(;c.length>0&&l<t.length;){const e=t[l],i=s[e],n=Math.min(c.length,i),r=c.substring(0,n);o[e]=r,c=c.substring(n),c.length>0&&l++}if(c.length>0){const e=this.findAdditionalEntities(this._config.entity),i=this._knownEntityIds?this._knownEntityIds.length-1:0;if(e.length>i){const n=e.slice(i);t.push(...n),this._knownEntityIds=[...t];for(const e of n){const t=this.getEntityMaxLength(e);s[e]=null!==t?t:255}for(;c.length>0&&l<t.length;){const e=t[l],i=s[e],n=Math.min(c.length,i),r=c.substring(0,n);o[e]=r,c=c.substring(n),c.length>0&&l++}}}for(const[e,t]of Object.entries(o))try{await this._hass.callService("input_text","set_value",{entity_id:e,value:t}),this._debug(`[EntityStorage] saveData: Entity "${e}" geschrieben, Länge: ${t.length} Zeichen`)}catch(t){this._debug(`[EntityStorage] saveData: Fehler beim Schreiben in "${e}": ${t.message}`)}this._debug("[EntityStorage] saveData: Erfolgreich abgeschlossen")}catch(e){throw this._debug(`[EntityStorage] saveData: Fehler: ${e.message}`,e),e}}else this._debug("[EntityStorage] saveData: Nicht verfügbar")}async loadData(){if(!this.isAvailable())return this._debug("[EntityStorage] loadData: Nicht verfügbar"),null;this._debug(`[EntityStorage] loadData: Start, entity: "${this._config.entity}"`),this.getAllEntityMaxLengths();const e=[],t=this._config.entity,i=this.findAdditionalEntities(t);this._debug(`[EntityStorage] loadData: Gefundene Entities: Haupt: "${t}", Zusätzliche: ${i.length}`),this._knownEntityIds=[t,...i];for(const t of this._knownEntityIds){const i=this._hass.states[t];if(i&&i.state&&""!==i.state.trim()){const n=i.state;e.push(n),this._debug(`[EntityStorage] loadData: Entity "${t}" hat Daten, Länge: ${n.length} Zeichen`)}else this._debug(`[EntityStorage] loadData: Entity "${t}" ist leer oder nicht vorhanden`)}if(e.length>0){const t=e.join(";");return this._debug(`[EntityStorage] loadData: Daten kombiniert, Gesamtlänge: ${t.length} Zeichen`),t}return this._debug("[EntityStorage] loadData: Keine Daten in Entities gefunden"),null}_createCompressedConfig(e){let t,i=JSON.stringify(e);i.startsWith("[")&&i.endsWith("]")&&(i=i.slice(1,-1));do{t=i.length,i=i.replace(/,null,/g,",,"),i=i.replace(/,null\]/g,",]"),i=i.replace(/\[null,/g,"[,"),i=i.replace(/,null$/g,",")}while(i.length!==t);return i=i.replace(/","/g,","),i=i.replace(/\["/g,"["),i=i.replace(/"\]/g,"]"),i=i.replace(/,"/g,","),i=i.replace(/",/g,","),i}getConfigEntityId(){return this._config&&this._config.entity?this._config.entity+"_config":null}getStatusEntityId(){return this._config&&this._config.entity?this._config.entity+"_status":null}async saveConfig(e){if(!this.isAvailable())return void this._debug("[EntityStorage] saveConfig: Nicht verfügbar");const t=this.getConfigEntityId();if(!t)return void this._debug("[EntityStorage] saveConfig: Keine configEntityId");if(this._debug(`[EntityStorage] saveConfig: Start, configEntityId: "${t}"`),!this._hass.states[t])return void this._debug(`[EntityStorage] saveConfig: Entity "${t}" existiert nicht`);const i=this._createCompressedConfig(e),n=i.length;this._debug(`[EntityStorage] saveConfig: Config erstellt (komprimiert), Länge: ${n} Zeichen`);const s=this.getEntityMaxLength(t);null!==s&&n>s&&this._debug(`[EntityStorage] saveConfig: Config ist zu lang (${n} > ${s} Zeichen)`);try{await this._hass.callService("input_text","set_value",{entity_id:t,value:i}),this._debug("[EntityStorage] saveConfig: Config erfolgreich gespeichert")}catch(e){throw this._debug(`[EntityStorage] saveConfig: Fehler beim Speichern: ${e.message}`,e),e}}async loadConfig(){if(!this.isAvailable())return this._debug("[EntityStorage] loadConfig: Nicht verfügbar"),null;const e=this.getConfigEntityId();if(!e)return null;const t=this._hass.states[e];return t&&t.state&&""!==t.state.trim()?t.state:null}checkStorageUsage(e=null){if(!this.isAvailable())return null;const t=this._getAllEntityIds(),i=this.getAllEntityMaxLengths();if(0===Object.keys(i).length)return null;let n=0,s=0;if(null!=e)n=e;else for(const e of t){const t=this._hass.states[e];t&&t.state&&(n+=t.state.length)}for(const e of t){const t=i[e];null!=t&&(s+=t)}if(0===s)return null;const r=n/s*100;return r>=90?{show:!0,currentLength:n,maxLength:s,percentage:Math.round(10*r)/10}:null}getWarnings(){if(!this.isAvailable())return null;const e={config:null,status:null},t=this.getConfigEntityId();t&&(this._hass&&this._hass.states[t]||(e.config={show:!0,type:"missing",configEntityId:t}));const i=this.getStatusEntityId();return i&&(this._hass&&this._hass.states[i]||(e.status={show:!0,type:"missing",statusEntityId:i})),e.config||e.status?e:null}}class Ie{static createStorage(e,t,i){const n=t?.store_mode||"text_entity";return je.isApplicable(n)?(i("[StorageFactory] Erstelle SaverStorage"),new je(e,t,i)):We.isApplicable(n)?(i("[StorageFactory] Erstelle EntityStorage"),new We(e,t,i)):(i("[StorageFactory] Unbekannter store_mode, verwende EntityStorage als Fallback"),new We(e,t,i))}static isStorageAvailable(e,t,i){return this.createStorage(t,i,(()=>{})).isAvailable()}}const Le={_getEasterDate(e){const t=e%19,i=Math.floor(e/100),n=e%100,s=Math.floor(i/4),r=i%4,a=Math.floor((i+8)/25),o=(19*t+i-s-Math.floor((i-a+1)/3)+15)%30,l=(32+2*r+2*Math.floor(n/4)-o-n%4)%7,c=Math.floor((t+11*o+22*l)/451),h=Math.floor((o+l-7*c+114)/31);return new Date(e,h-1,(o+l-7*c+114)%31+1)},_isHoliday(e,t,i){const n=`${e}-${String(t+1).padStart(2,"0")}`;if(this._holidayCache&&this._holidayCache[n]&&void 0!==this._holidayCache[n][i])return this._holidayCache[n][i];this._holidayCache||(this._holidayCache={}),this._holidayCache[n]||(this._holidayCache[n]={});let s=!1;if(this._hass&&this._hass.states){this._cachedHolidayEntities||(this._cachedHolidayEntities=Object.keys(this._hass.states).filter((e=>e.startsWith("sensor.")&&(e.includes("holiday")||e.includes("feiertag"))&&"on"===this._hass.states[e].state)));const n=this._cachedHolidayEntities;if(n.length>0)for(const r of n){const n=this._hass.states[r];if(n&&n.attributes){const r=`${e}-${String(t+1).padStart(2,"0")}-${String(i).padStart(2,"0")}`,a=`${String(i).padStart(2,"0")}.${String(t+1).padStart(2,"0")}.${e}`,o=["dates","holidays","feiertage","date","next_date","upcoming"];for(const e of o)if(n.attributes[e]){const t=n.attributes[e];if(Array.isArray(t)){if(t.some((e=>e===r||e===a||e.includes(r)||e.includes(a)))){s=!0;break}}else if("string"==typeof t&&(t.includes(r)||t.includes(a))){s=!0;break}}}}}const r=this.config?.holidays||{},a=e=>!1!==r[e],o=this._getEasterDate(e),l=[{month:0,day:1,key:"neujahr"},{month:0,day:6,key:"heilige_drei_koenige"},{month:4,day:1,key:"tag_der_arbeit"},{month:7,day:8,key:"friedensfest"},{month:7,day:15,key:"mariae_himmelfahrt"},{month:9,day:3,key:"tag_der_deutschen_einheit"},{month:9,day:31,key:"reformationstag"},{month:10,day:1,key:"allerheiligen"},{month:11,day:25,key:"weihnachten_1"},{month:11,day:26,key:"weihnachten_2"}];if(!s)for(const e of l)if(t===e.month&&i===e.day&&a(e.key)){s=!0;break}if(!s){const n=o.getTime(),r=864e5,l=new Date(e,10,23).getDay(),c=new Date(e,10,23-(l<=3?3-l:l+7-3)),h=[{date:new Date(n-2*r),key:"karfreitag"},{date:new Date(n+1*r),key:"ostermontag"},{date:new Date(n+39*r),key:"christi_himmelfahrt"},{date:new Date(n+50*r),key:"pfingstmontag"},{date:new Date(n+60*r),key:"fronleichnam"},{date:c,key:"busstag"}];for(const n of h)if(n.date.getFullYear()===e&&n.date.getMonth()===t&&n.date.getDate()===i&&a(n.key)){s=!0;break}}return this._holidayCache[n][i]=s,s},_isWeekend(e,t,i){const n=new Date(e,t,i).getDay();return 0===n||6===n}},ze={serializeWorkingDays(){const e=[],t=Object.keys(this._workingDays).sort(((e,t)=>{const[i,n]=e.split(":").map((e=>parseInt(e))),[s,r]=t.split(":").map((e=>parseInt(e)));return i!==s?i-s:n-r}));for(const i of t){const t=this._workingDays[i];if(!t||"object"!=typeof t||Array.isArray(t))continue;const n=Object.keys(t).map((e=>parseInt(e))).filter((e=>!isNaN(e))).sort(((e,t)=>e-t));if(n.length>0){const s=n.map((e=>{const i=t[e],n=this.formatTwoDigits(e);return Array.isArray(i)&&i.length>0?n+[...i].sort().join(""):n})).join(",");e.push(`${i}:${s}`)}}return e.join(";")},parseWorkingDays(e){this._workingDays={},this._parseWorkingDaysIntoObject(e,this._workingDays)},_parseWorkingDaysIntoObject(e,t){if(!e||""===e.trim())return;const i=e.split(";").filter((e=>""!==e.trim()));for(const e of i){const i=e.trim();if(!i)continue;const n=i.split(":");if(2===n.length){const e=n[0].trim(),i=n[1].trim();if(e&&i){const n=parseInt(e);if(!isNaN(n)&&n>=1&&n<=12){const e=(new Date).getFullYear()%100;t[`${this.formatTwoDigits(e)}:${this.formatTwoDigits(n)}`]=this._parseDaysWithElements(i)}}}else if(n.length>=3){const e=parseInt(n[0].trim()),i=parseInt(n[1].trim());if(e<=12&&i>12){const s=e,r=i,a=n.slice(2).join(":");a&&s>=1&&s<=12&&!isNaN(r)&&(t[`${this.formatTwoDigits(r)}:${this.formatTwoDigits(s)}`]=this._parseDaysWithElements(a))}else if(e>12&&i<=12){const s=e,r=i,a=n.slice(2).join(":");a&&r>=1&&r<=12&&!isNaN(s)&&(t[`${this.formatTwoDigits(s)}:${this.formatTwoDigits(r)}`]=this._parseDaysWithElements(a))}}}},_parseDaysWithElements(e){const t={},i=e.split(",").filter((e=>""!==e.trim()));for(const e of i){const i=e.trim();if(!i)continue;const n=i.match(/^(\d+)([a-z]*)$/i);if(n){const e=parseInt(n[1]),i=(n[2]||"").split("").filter((e=>e&&""!==e.trim()));!isNaN(e)&&e>=1&&e<=31&&(t[e]?t[e]=[...new Set([...t[e],...i])]:t[e]=i)}else i.includes("03")&&this._debug&&this._debug(`[Parsing] Kein Match für "${i}"`)}return t}},Ne={_getAllCalendars(){return this._config?.calendars?this._config.calendars.filter((e=>e&&e.shortcut&&(!0===e.enabled||"true"===e.enabled||1===e.enabled))).sort(((e,t)=>e.shortcut.localeCompare(t.shortcut))):[]},_getCalendarByShortcut(e){return this._config?.calendars&&this._config.calendars.find((t=>t.shortcut===e))||null},_getDefaultColorForShortcut(e){const t=this.constructor;if(t&&t.CALENDARS){const i=t.CALENDARS.find((t=>t.shortcut===e));return i?i.defaultColor:"#ff9800"}return"#ff9800"},_getSelectedCalendarShortcut(){if(null!==this._selectedCalendar&&void 0!==this._selectedCalendar&&""!==this._selectedCalendar)return this._selectedCalendar;if(this._config?.selectedCalendar)return this._selectedCalendar=this._config.selectedCalendar,this._selectedCalendar;const e=this._getAllCalendars();return e.length>0?e[0].shortcut:null}},Pe={_createCompressedConfig(e){let t,i=JSON.stringify(e);i.startsWith("[")&&i.endsWith("]")&&(i=i.slice(1,-1));do{t=i.length,i=i.replace(/,null,/g,",,"),i=i.replace(/,null\]/g,",]"),i=i.replace(/\[null,/g,"[,"),i=i.replace(/,null$/g,",")}while(i.length!==t);return i=i.replace(/","/g,","),i=i.replace(/\["/g,"["),i=i.replace(/"\]/g,"]"),i=i.replace(/,"/g,","),i=i.replace(/",/g,","),i},_createFullJsonConfig(e){const t={shifts:e,setup:{timer_entity:this._config?.entity||"",store_mode:this._config?.store_mode||"saver"},lastchange:Math.floor(Date.now()/1e3)};return JSON.stringify(t)}},Fe={_getDayElements(e,t){const i=t<=3||!this._workingDays[e];if(i&&this._debug&&this._debug(`[Render] _getDayElements: Suche nach monthKey="${e}", day=${t}`),!this._workingDays[e]||"object"!=typeof this._workingDays[e])return i&&this._debug&&(this._debug(`[Render] _getDayElements: Keine Daten für monthKey="${e}" gefunden oder kein Objekt`),this._debug("[Render] _getDayElements: Verfügbare Keys in _workingDays:",Object.keys(this._workingDays))),[];if(Array.isArray(this._workingDays[e]))return i&&this._debug&&this._debug(`[Render] _getDayElements: Altes Format (Array) für monthKey="${e}"`),[];const n=this._workingDays[e][t]||[];return i&&n.length>0&&this._debug&&this._debug(`[Render] _getDayElements: Gefundene Elemente für "${e}", Tag ${t}:`,n),n},_renderMissingEntityWarning(e,t,i=255,n=!1){const s=e.replace("input_text.",""),{html:r}=this.constructor.litHtml||{};return r?r`
      <div class="storage-warning">
        <div class="warning-icon">⚠️</div>
        <div class="warning-content">
          <div class="warning-title">${t} fehlt!</div>
          <div class="warning-message">
            Die Entity <code>${e}</code> wurde nicht gefunden.
          </div>
          <div class="warning-action">
            Bitte legen Sie diese Entity über die UI an:
            <ul>
              <li>Einstellungen → Automatisierungen &amp; Szenen → Hilfsmittel</li>
              <li>Hinzufügen → Text</li>
              <li>Name: <code>${s}</code></li>
              <li>Maximale Länge: <code>${i}</code> Zeichen</li>
            </ul>
          </div>
        </div>
      </div>
    `:null}},Ue={formatTwoDigits:e=>String(e).padStart(2,"0"),getDaysInMonth:(e,t)=>new Date(e,t+1,0).getDate(),getFirstDayOfMonth:(e,t)=>new Date(e,t,1).getDay(),getMonthName:e=>["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"][e]||"",getFirstDayOfWeekMondayBased(e,t){return(this.getFirstDayOfMonth(e,t)+6)%7}},Be={_getContrastColor(e){if(!e)return"#000000";const t=e.replace("#","");return(.299*parseInt(t.substr(0,2),16)+.587*parseInt(t.substr(2,2),16)+.114*parseInt(t.substr(4,2),16))/255>.5?"#000000":"#ffffff"},hexToRgb(e){if(!e)return null;const t=e.replace("#","");return 6!==t.length?null:{r:parseInt(t.substr(0,2),16),g:parseInt(t.substr(2,2),16),b:parseInt(t.substr(4,2),16)}},rgbToHex(e,t,i){const n=e=>{const t=Math.round(e).toString(16);return 1===t.length?"0"+t:t};return`#${n(e)}${n(t)}${n(i)}`}},He=d`
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
`;function Ve({left:e="",center:t="",right:i="",fullWidth:n=""}){return Z`
    <div class="menu-bar-row">
      <div class="menu-bar-left">${e}</div>
      <div class="menu-bar-center">${t}</div>
      <div class="menu-bar-right">${i}</div>
    </div>
    ${n?Z`<div class="menu-bar-full-width">${n}</div>`:""}
  `}function Ke(e,t,i){return(t=function(e){var t=function(e){if("object"!=typeof e||!e)return e;var t=e[Symbol.toPrimitive];if(void 0!==t){var i=t.call(e,"string");if("object"!=typeof i)return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(e)}(e);return"symbol"==typeof t?t:t+""}(t))in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i,e}class qe extends ge{constructor(){super(),this.calendars=[],this.selectedShortcut=null,this._validationErrors={}}connectedCallback(){super.connectedCallback(),this._updateValidationErrors()}updated(e){super.updated(e),(e.has("calendars")||e.has("selectedShortcut"))&&this._updateValidationErrors()}_validateCalendar(e){const t={};if(e.shortcut&&/^[a-z]$/.test(e.shortcut)||(t.shortcut=!0),e.timeRanges&&Array.isArray(e.timeRanges)){const i=[];e.timeRanges.forEach(((e,n)=>{const s="object"==typeof e&&e.times?e:{id:null,times:e||[null,null]};if(s.id&&/^[1-9]$/.test(s.id)){const e=parseInt(s.id);i.includes(e)?t[`timeRange_${n}_id`]=!0:i.push(e)}else t[`timeRange_${n}_id`]=!0;s.times&&s.times[0]&&!/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(s.times[0])&&(t[`timeRange_${n}_start`]=!0),s.times&&s.times[1]&&!/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(s.times[1])&&(t[`timeRange_${n}_end`]=!0)}))}return t}_hasValidationErrors(){if(!this.selectedShortcut)return!1;const e=this.calendars.find((e=>e.shortcut===this.selectedShortcut));if(!e)return!1;const t=this._validateCalendar(e);return Object.keys(t).length>0}_triggerColorPicker(e){const t=this.shadowRoot.querySelector('input[type="color"]');t&&t.click()}updated(e){super.updated(e),(e.has("calendars")||e.has("selectedShortcut"))&&this._updateValidationErrors()}render(){const e=this.calendars.find((e=>e.shortcut===this.selectedShortcut)),t=this.calendars.findIndex((e=>e.shortcut===this.selectedShortcut));return Z`
      <div class="config-menu-bar">
        ${Ve({left:Z`
            <button class="cancel-button menu-button" @click=${this._handleClose} title="Abbrechen">×</button>
          `,center:"",right:Z`
            <button 
              class="confirm-button menu-button" 
              @click=${this._handleSave} 
              title="Speichern"
              ?disabled=${this._hasValidationErrors()}
            >✓</button>
          `,fullWidth:Z`
            <div class="color-bar">
              ${this.calendars.map(((e,t)=>{const i=e.shortcut===this.selectedShortcut,n=this._hasValidationErrors()&&i;return Z`
                  <button
                    class="color-button ${i?"selected":""} ${e.enabled?"":"disabled"}"
                    style="background-color: ${e.color||"#ff9800"};"
                    @click=${()=>{this._hasValidationErrors()||(this.selectedShortcut=e.shortcut,this._updateValidationErrors())}}
                    ?disabled=${n}
                    title="${e.name||`Schicht ${e.shortcut.toUpperCase()}`} ${e.enabled?"":"(deaktiviert)"}${n?" (Fehlerhafte Eingabe)":""}"
                  ></button>
                `}))}
              <button
                class="color-button add-shift-color-button"
                @click=${this._addShift}
                title="Neue Schicht hinzufügen"
                ?disabled=${this._hasValidationErrors()}
              >
                +
              </button>
            </div>
          `})}
      </div>
      <div class="config-panel">
        ${e?Z`
              <div class="shift-editor">
                <!-- Zeile 1: Name, Farbe, ID -->
                <div class="editor-row">
                  <div class="editor-field">
                    <label>Name</label>
                    <ha-textfield
                      .value=${e.name||""}
                      @input=${t=>this._updateCalendar(e.shortcut,{name:t.target.value})}
                      placeholder="Schichtname"
                    ></ha-textfield>
                  </div>
                  
                  <div class="editor-field">
                    <label>Farbe</label>
                    <div class="color-input-group">
                      <input
                        type="color"
                        .value=${e.color||"#ff9800"}
                        @input=${t=>this._updateCalendar(e.shortcut,{color:t.target.value})}
                        class="color-picker-input"
                        title="Farbauswahl öffnen"
                      />
                      <div
                        class="color-preview-large"
                        style="background-color: ${e.color||"#ff9800"}; cursor: pointer;"
                        @click=${()=>this._triggerColorPicker(e.shortcut)}
                        title="Farbauswahl öffnen"
                      ></div>
                    </div>
                  </div>
                  
                  <div class="editor-field id-field">
                    <label>ID</label>
                    <ha-textfield
                      .value=${e.shortcut||""}
                      @input=${t=>{this._updateCalendarId(e.shortcut,t.target.value),this._updateValidationErrors()}}
                      placeholder="a"
                      maxlength="1"
                      pattern="[a-z]"
                      .error=${this._validationErrors[`${e.shortcut}_shortcut`]||!1}
                    ></ha-textfield>
                  </div>
                </div>
                
                <!-- Zeile 2: Aktiviert, Relevant -->
                <div class="editor-row">
                  <div class="switch-item">
                    <label class="switch-label">Aktiviert</label>
                    <ha-switch
                      .checked=${!1!==e.enabled}
                      @change=${t=>this._updateCalendar(e.shortcut,{enabled:t.target.checked})}
                    ></ha-switch>
                  </div>
                  <div class="switch-item">
                    <label class="switch-label">Status relevant</label>
                    <ha-switch
                      .checked=${!1!==e.statusRelevant}
                      @change=${t=>this._updateCalendar(e.shortcut,{statusRelevant:t.target.checked})}
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
                        @click=${()=>this._addTimeRange(e.shortcut)}
                        title="Zeitbereich hinzufügen"
                        ?disabled=${e.timeRanges&&e.timeRanges.length>=9||!1}
                      >
                        +
                      </button>
                    </div>
                    ${e.timeRanges&&e.timeRanges.length>0?Z`
                        <div class="time-ranges-table">
                          <div class="time-ranges-header-row">
                            <div class="time-range-header-cell id-header">ID</div>
                            <div class="time-range-header-cell">Start</div>
                            <div class="time-range-header-cell">ENDE</div>
                            <div class="time-range-header-cell action-header"></div>
                          </div>
                          ${e.timeRanges.map(((t,i)=>{const n="object"==typeof t&&t.times?t:{id:null,times:t||[null,null]};return Z`
                        <div class="time-range-row">
                          <div class="time-range-cell id-cell">
                            <ha-textfield
                              .value=${n.id||""}
                              @input=${t=>{this._updateTimeRangeId(e.shortcut,i,t.target.value),this._updateValidationErrors()}}
                              placeholder="1"
                              maxlength="1"
                              pattern="[1-9]"
                              .error=${this._validationErrors[`${e.shortcut}_timeRange_${i}_id`]||!1}
                            ></ha-textfield>
                          </div>
                          <div class="time-range-cell">
                            <ha-textfield
                              type="time"
                              .value=${n.times[0]||""}
                              @input=${t=>{this._updateTimeRange(e.shortcut,i,0,t.target.value||null),this._updateValidationErrors()}}
                              placeholder="HH:MM"
                              pattern="[0-9]{2}:[0-9]{2}"
                              .error=${this._validationErrors[`${e.shortcut}_timeRange_${i}_start`]||!1}
                            ></ha-textfield>
                          </div>
                          <div class="time-range-cell">
                            <ha-textfield
                              type="time"
                              .value=${n.times[1]||""}
                              @input=${t=>{this._updateTimeRange(e.shortcut,i,1,t.target.value||null),this._updateValidationErrors()}}
                              placeholder="HH:MM"
                              pattern="[0-9]{2}:[0-9]{2}"
                              .error=${this._validationErrors[`${e.shortcut}_timeRange_${i}_end`]||!1}
                            ></ha-textfield>
                          </div>
                          <div class="time-range-cell action-cell">
                            <button
                              class="time-range-delete-button"
                              @click=${()=>this._removeTimeRange(e.shortcut,i)}
                              title="Zeitbereich entfernen"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                        `}))}
                        </div>
                      `:""}
                  </div>
                </div>
                
                <!-- Zeile 4: Papierkorb und Pfeile -->
                <div class="editor-row">
                  <div class="action-buttons">
                    <button
                      class="control-button delete"
                      @click=${()=>this._deleteShift(e.shortcut)}
                      title="Löschen"
                    >
                      🗑️
                    </button>
                    <button
                      class="control-button"
                      @click=${()=>this._moveShift(t,-1)}
                      ?disabled=${t<=0}
                      title="Nach oben"
                    >
                      ←
                    </button>
                    <button
                      class="control-button"
                      @click=${()=>this._moveShift(t,1)}
                      ?disabled=${t>=this.calendars.length-1}
                      title="Nach unten"
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>
              `:""}
      </div>
    `}_handleClose(){this.dispatchEvent(new CustomEvent("close"))}_handleSave(){this.dispatchEvent(new CustomEvent("save",{detail:{calendars:this.calendars}}))}_moveShift(e,t){if(e+t<0||e+t>=this.calendars.length)return;const i=[...this.calendars],[n]=i.splice(e,1);i.splice(e+t,0,n),this.calendars=i,this._updateValidationErrors()}_deleteShift(e){this.calendars.length<=1||(this.calendars=this.calendars.filter((t=>t.shortcut!==e)),this.selectedShortcut===e&&(this.selectedShortcut=this.calendars.length>0?this.calendars[0].shortcut:null),this._updateValidationErrors())}_toggleEnabled(e,t){this.calendars=this.calendars.map((i=>i.shortcut===e?{...i,enabled:t}:i)),this._updateValidationErrors()}_addShift(){const e=this.calendars.map((e=>e.shortcut)),t=["a","b","c","d","e","f","g","h","i","j"].find((t=>!e.includes(t)));if(!t)return;const i=["#ff9800","#ff0000","#00ff00","#0000ff","#ffff00","#ff00ff","#00ffff","#ffa500","#800080","#008000"],n={shortcut:t,name:`Schicht ${t.toUpperCase()}`,color:i[this.calendars.length%i.length],enabled:!0,statusRelevant:!0,timeRanges:[]};this.calendars=[...this.calendars,n],this.selectedShortcut=n.shortcut,this._updateValidationErrors()}_updateCalendar(e,t){this.calendars=this.calendars.map((i=>i.shortcut===e?{...i,...t}:i)),this._updateValidationErrors()}_normalizeTimeRange(e){return Array.isArray(e)?{id:null,times:e}:"object"==typeof e&&e.times?e:{id:null,times:[null,null]}}_normalizeTimeRanges(e){return e&&Array.isArray(e)?e.map((e=>this._normalizeTimeRange(e))):[]}_updateTimeRange(e,t,i,n){this.calendars=this.calendars.map((s=>{if(s.shortcut===e){const e=[...this._normalizeTimeRanges(s.timeRanges)];return e[t]||(e[t]={id:null,times:[null,null]}),e[t]={...e[t],times:[...e[t].times]},e[t].times[i]=n,{...s,timeRanges:e}}return s})),this._updateValidationErrors()}_updateTimeRangeId(e,t,i){const n=i.trim()||null;this.calendars=this.calendars.map((i=>{if(i.shortcut===e){const e=[...this._normalizeTimeRanges(i.timeRanges)];return e[t]&&(e[t]={...e[t],id:n}),{...i,timeRanges:e}}return i})),this._updateValidationErrors()}_addTimeRange(e){this.calendars=this.calendars.map((t=>{if(t.shortcut===e){const e=this._normalizeTimeRanges(t.timeRanges);if(e.length>=9)return t;const i=e.map((e=>e.id)).map((e=>parseInt(e)||0)).filter((e=>e>=1&&e<=9));let n=null;for(let e=1;e<=9;e++)if(!i.includes(e)){n=String(e);break}return{...t,timeRanges:[...e,{id:n,times:[null,null]}]}}return t})),this._updateValidationErrors()}_removeTimeRange(e,t){this.calendars=this.calendars.map((i=>{if(i.shortcut===e){const e=[...this._normalizeTimeRanges(i.timeRanges)];return e.splice(t,1),{...i,timeRanges:e.length>0?e:[]}}return i})),this._updateValidationErrors()}_updateValidationErrors(){const e={};this.calendars.forEach((t=>{const i=this._validateCalendar(t);Object.keys(i).forEach((i=>{e[`${t.shortcut}_${i}`]=!0}))})),this._validationErrors=e;const t=Object.keys(e).length>0,i=!!this.calendars.find((e=>e.shortcut===this.selectedShortcut))&&Object.keys(e).some((e=>e.startsWith(`${this.selectedShortcut}_`)));console.log("[ShiftConfigPanel] Validierung:",{erfolgreich:!t,fehlerfrei:!i,gesamtFehler:Object.keys(e).length,fehlerDetails:e,aktuelleSchicht:this.selectedShortcut,aktuelleSchichtFehler:i}),this.requestUpdate()}_updateCalendarId(e,t){const i=t.toLowerCase().trim();i&&0!==i.length&&1===i.length&&/^[a-z]$/.test(i)?(this.calendars.find((t=>t.shortcut===i&&t.shortcut!==e))||(this.calendars=this.calendars.map((t=>t.shortcut===e?{...t,shortcut:i}:t)),this.selectedShortcut===e&&(this.selectedShortcut=i)),this._updateValidationErrors()):this._updateValidationErrors()}}var Ze,Je,Ge,Ye,Qe,Xe;function et(){return et="undefined"!=typeof Reflect&&Reflect.get?Reflect.get.bind():function(e,t,i){var n=function(e,t){for(;!{}.hasOwnProperty.call(e,t)&&null!==(e=tt(e)););return e}(e,t);if(n){var s=Object.getOwnPropertyDescriptor(n,t);return s.get?s.get.call(arguments.length<3?e:i):s.value}},et.apply(null,arguments)}function tt(e){return tt=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(e){return e.__proto__||Object.getPrototypeOf(e)},tt(e)}function it(e,t,i){return(t=function(e){var t=function(e){if("object"!=typeof e||!e)return e;var t=e[Symbol.toPrimitive];if(void 0!==t){var i=t.call(e,"string");if("object"!=typeof i)return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(e)}(e);return"symbol"==typeof t?t:t+""}(t))in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i,e}Ke(qe,"properties",{calendars:{type:Array},selectedShortcut:{type:String},hass:{type:Object},_validationErrors:{type:Object,state:!0}}),Ke(qe,"styles",[He,d`
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
    `]),customElements.define("shift-config-panel",qe);class nt extends Oe{static get properties(){return{...super.properties,hass:{type:Object},config:{type:Object},lovelace:{type:Object},_workingDays:{type:Object},_storageWarning:{type:Object},_configWarning:{type:Object},_statusWarning:{type:Object},_displayedMonths:{type:Number},_startMonthOffset:{type:Number},_selectedCalendar:{type:String},_showConfigPanel:{type:Boolean}}}constructor(){super(),this._workingDays={},this._storageWarning=null,this._configWarning=null,this._statusWarning=null,this._knownEntityIds=null,this._cleanupDone=!1,this._displayedMonths=2,this._startMonthOffset=0,this._isWriting=!1,this._writeLockTimer=null,this._selectedCalendar=null,this._isInitialLoad=!0,this._directDOMUpdateInProgress=new Set,this._holidayCache={},this._cachedHolidayEntities=null,this._editorModeCache=null,this._editorModeCacheTime=0,this._saveDebounceTimer=null,this._storage=null,this._showConfigPanel=!1,Object.assign(this,Ue),Object.assign(this,Be),Object.assign(this,Le),Object.assign(this,ze),Object.assign(this,Ne),Object.assign(this,Pe),Object.assign(this,Fe)}_isInEditorMode(){const e=Date.now();if(null!==this._editorModeCache&&e-this._editorModeCacheTime<5e3)return this._editorModeCache;let t=!1;if("undefined"!=typeof window&&window.location&&"1"===new URLSearchParams(window.location.search).get("edit")&&(t=!0),t||!0===this.lovelace?.editMode&&(t=!0),t||"undefined"==typeof document||document.querySelector("hui-dialog-edit-card")&&(t=!0),!t){let e=this,i=0;const n=20;for(;e&&i<n;){if("hui-dialog-edit-card"===e.tagName?.toLowerCase()){t=!0;break}if(e.classList?.contains("card-editor")||e.classList?.contains("hui-card-editor")||e.classList?.contains("edit-mode")||e.classList?.contains("hui-card-config-editor")||"true"===e.getAttribute?.("data-card-editor")||e.tagName?.toLowerCase().includes("editor")||"hui-card-element-editor"===e.tagName?.toLowerCase()){t=!0;break}if(e.id&&(e.id.includes("editor")||e.id.includes("config"))){t=!0;break}if(e.hasAttribute&&(e.hasAttribute("data-card-editor")||e.hasAttribute("data-editor"))){t=!0;break}e=e.parentElement||e.parentNode,i++}}if(!t){const e=this.getRootNode();if(e&&e!==document){const i=e.host;i&&("hui-dialog-edit-card"===i.tagName?.toLowerCase()||i.classList?.contains("card-editor")||i.classList?.contains("hui-card-editor")||i.classList?.contains("edit-mode")||i.classList?.contains("hui-card-config-editor")||"hui-card-element-editor"===i.tagName?.toLowerCase())&&(t=!0)}}if(!t&&"undefined"!=typeof window&&window.location){const e=window.location.href||window.location.pathname;e&&(e.includes("/config/lovelace/dashboards")||e.includes("/editor"))&&(t=!0)}return this._editorModeCache=t,this._editorModeCacheTime=e,t}_initializeStorage(){if(!this._hass||!this._config)return this._debug("[Storage] _initializeStorage: hass oder config fehlt"),void(this._storage=null);try{this._storage=Ie.createStorage(this._hass,this._config,this._debug.bind(this)),this._debug(`[Storage] _initializeStorage: Storage-Adapter erstellt, store_mode: "${this._config.store_mode}"`)}catch(e){this._debug(`[Storage] _initializeStorage: Fehler beim Erstellen des Storage-Adapters: ${e.message}`,e),this._storage=null}}get hass(){return this._hass}set hass(e){if(this._isWriting)return this._hass=e,void this.requestUpdate();const t=this._hass?.states?.[this._config?.entity]?.state,i=e?.states?.[this._config?.entity]?.state;let n=t!==i;if(!n&&this._config&&this._knownEntityIds&&e?.states)for(let t=1;t<this._knownEntityIds.length;t++){const i=this._knownEntityIds[t],s=this._hass?.states?.[i]?.state,r=e?.states?.[i]?.state;if(s!==r){n=!0;break}}let s=!1;if(this._config&&"saver"===this._config.store_mode&&this._hass&&e&&e?.states)try{const t=e.states["saver.saver"],i=this._hass?.states?.["saver.saver"];if(t&&t.attributes&&t.attributes.variables){const e=`${this._config.saver_key||"Schichtplan"}_config`,n=i?.attributes?.variables?.[e];n!==t.attributes.variables[e]&&(s=!0,this._debug("[Config] set hass: saver_config hat sich geändert, lade Konfiguration neu"))}}catch(e){this._debug("[Config] set hass: Fehler beim Prüfen der saver_config:",e)}const r=!!this._hass;if(this._hass=e,this._cachedHolidayEntities=null,this._config&&this._initializeStorage(),!r&&e&&this._config&&this._isInitialLoad&&(this._debug("[Config] set hass: hass zum ersten Mal gesetzt - markiere initialen Load als abgeschlossen"),this._isInitialLoad=!1),this._config){if((!r||n)&&e?.states)try{this.loadWorkingDays()}catch(e){this._debug("[Config] set hass: Fehler beim Laden der Arbeitszeiten:",e)}if(!r&&this._storage&&(this._debug("[Config] set hass: hass zum ersten Mal gesetzt - lade Konfiguration aus Storage"),this._storage.loadConfig().then((e=>{if(e)try{const t=JSON.parse(e);t&&"object"==typeof t&&Array.isArray(t.calendars)?(this._debug("[Config] set hass: Konfiguration aus Storage geladen (neues Format mit calendars) beim ersten hass-Set"),this._config.calendars=t.calendars.map((e=>{let t=[];return e.timeRanges&&Array.isArray(e.timeRanges)&&(t=e.timeRanges.map(((t,i)=>{if(Array.isArray(t))return this._debug(`[Config] set hass: Zeitraum ${i} für "${e.shortcut}": Altes Format [start, end] erkannt`),{id:null,times:[...t]};if("object"==typeof t&&null!==t&&t.times&&Array.isArray(t.times)){const n={id:t.id||null,times:[...t.times]};return this._debug(`[Config] set hass: Zeitraum ${i} für "${e.shortcut}": Neues Format erkannt, id="${n.id}", times=[${n.times.join(",")}]`),n}return this._debug(`[Config] set hass: Zeitraum ${i} für "${e.shortcut}": Unbekanntes Format, verwende Default`),{id:null,times:[null,null]}}))),{shortcut:e.shortcut,name:e.name||`Schicht ${e.shortcut?.toUpperCase()||""}`,color:e.color||this._getDefaultColorForShortcut(e.shortcut),enabled:!0===e.enabled||"true"===e.enabled||1===e.enabled,statusRelevant:!0===e.statusRelevant||"true"===e.statusRelevant||1===e.statusRelevant,timeRanges:t}})),this._debug(`[Config] set hass: ${this._config.calendars.length} Kalender geladen beim ersten hass-Set`),this._config.calendars.forEach((e=>{this._debug(`[Config] set hass: Kalender "${e.shortcut}":`,{name:e.name,enabled:e.enabled,statusRelevant:e.statusRelevant,timeRanges_count:e.timeRanges?.length||0})})),this._debug("[Config] set hass: Konfiguration aus Saver geladen und this._config aktualisiert"),this.requestUpdate()):this._debug("[Config] set hass: Konfiguration konnte nicht geparst werden - erwartetes Format: { calendars: [...] }")}catch(e){this._debug("[Config] set hass: Fehler beim Parsen der Konfiguration aus dem Storage:",e)}})).catch((e=>{this._debug("[Config] set hass: Fehler beim Laden der Konfiguration aus dem Storage:",e)}))),s&&this._storage&&(this._debug("[Config] set hass: Lade Konfiguration aus Storage neu"),this._storage.loadConfig().then((e=>{if(e)try{const t=JSON.parse(e);t&&"object"==typeof t&&Array.isArray(t.calendars)?(this._debug("[Config] set hass: Konfiguration aus Saver neu geladen (neues Format mit calendars)"),this._config.calendars=t.calendars.map((e=>{let t=[];return e.timeRanges&&Array.isArray(e.timeRanges)&&(t=e.timeRanges.map(((t,i)=>{if(Array.isArray(t))return this._debug(`[Config] set hass: Zeitraum ${i} für "${e.shortcut}": Altes Format [start, end] erkannt`),{id:null,times:[...t]};if("object"==typeof t&&null!==t&&t.times&&Array.isArray(t.times)){const n={id:t.id||null,times:[...t.times]};return this._debug(`[Config] set hass: Zeitraum ${i} für "${e.shortcut}": Neues Format erkannt, id="${n.id}", times=[${n.times.join(",")}]`),n}return this._debug(`[Config] set hass: Zeitraum ${i} für "${e.shortcut}": Unbekanntes Format, verwende Default`),{id:null,times:[null,null]}}))),{shortcut:e.shortcut,name:e.name||`Schicht ${e.shortcut?.toUpperCase()||""}`,color:e.color||this._getDefaultColorForShortcut(e.shortcut),enabled:!0===e.enabled||"true"===e.enabled||1===e.enabled,statusRelevant:!0===e.statusRelevant||"true"===e.statusRelevant||1===e.statusRelevant,timeRanges:t}})),this._debug(`[Config] set hass: ${this._config.calendars.length} Kalender geladen`),this._config.calendars.forEach((e=>{this._debug(`[Config] set hass: Kalender "${e.shortcut}":`,{name:e.name,enabled:e.enabled,statusRelevant:e.statusRelevant,timeRanges_count:e.timeRanges?.length||0})})),this._debug("[Config] set hass: Konfiguration aus Storage neu geladen und this._config aktualisiert"),this.requestUpdate()):this._debug("[Config] set hass: Konfiguration konnte nicht geparst werden - erwartetes Format: { calendars: [...] }")}catch(e){this._debug("[Config] set hass: Fehler beim Parsen der neu geladenen Konfiguration:",e)}})).catch((e=>{this._debug("[Config] set hass: Fehler beim Neuladen der Konfiguration aus dem Storage:",e)}))),"saver"!==this._config.store_mode&&e?.states)try{this.checkConfigEntity(),this.checkStatusEntity()}catch(e){this._debug("[Config] set hass: Fehler beim Prüfen der Config/Status-Entities:",e)}}this.requestUpdate()}get config(){return this._config}set config(e){if(this._debug("[Config] set config: === WIRD AUFGERUFEN ==="),this._debug("[Config] set config: _isInitialLoad Status:",this._isInitialLoad),this._config=e,this._debug("[Config] set config: Neue Konfiguration erhalten",{store_mode:e?.store_mode,saver_key:e?.saver_key,calendars_count:e?.calendars?.length,hasHass:!!this._hass}),e&&e.initialDisplayedMonths){const t=e.numberOfMonths||14;this._displayedMonths=Math.min(e.initialDisplayedMonths,t)}else e&&e.numberOfMonths&&!this._displayedMonths?this._displayedMonths=e.numberOfMonths:e&&e.numberOfMonths&&(this._displayedMonths=Math.min(this._displayedMonths||2,e.numberOfMonths));const t=this._getAllCalendars();if(e&&e.selectedCalendar?t.some((t=>t.shortcut===e.selectedCalendar))?this._selectedCalendar=e.selectedCalendar:t.length>0||t.length>0?(this._selectedCalendar=t[0].shortcut,e&&(e.selectedCalendar=this._selectedCalendar)):(this._selectedCalendar=null,e&&(e.selectedCalendar=null)):t.length>0?(this._selectedCalendar=t[0].shortcut,e&&(e.selectedCalendar=this._selectedCalendar)):(this._selectedCalendar=null,e&&(e.selectedCalendar=null)),this._hass&&this._isInitialLoad&&(this._debug("[Config] set config: hass vorhanden - markiere initialen Load als abgeschlossen"),this._isInitialLoad=!1),this._hass){this._initializeStorage(),this.loadWorkingDays(),this._updateWarnings();const e=this._isInitialLoad;!e&&this._config?(this._debug("[Config] set config: Konfiguration wurde gesetzt (nicht initialer Load)"),this._debug("[Config] set config: Editor wurde geschlossen - speichere Konfiguration"),setTimeout((()=>{this._debug("[Config] set config: Starte saveConfigToEntity() nach setTimeout"),this.saveConfigToEntity()}),0)):e&&this._debug("[Config] set config: Initialer Load erkannt - überspringe Speichern")}else this._debug("[Config] set config: hass noch nicht verfügbar - warte auf Initialisierung");this.requestUpdate()}_handleConfigChanged(){if(this._debug("[Config] _handleConfigChanged: Event empfangen - Konfiguration wurde geändert"),this._isInitialLoad)return this._debug("[Config] _handleConfigChanged: Initialer Load erkannt, überspringe Config-Speichern"),this._debug("[Config] _handleConfigChanged: Markiere initialen Load als abgeschlossen"),void(this._isInitialLoad=!1);this._hass?this._config?(this._debug("[Config] _handleConfigChanged: Starte saveConfigToEntity()"),this.saveConfigToEntity()):this._debug("[Config] _handleConfigChanged: Abbruch - config nicht verfügbar"):this._debug("[Config] _handleConfigChanged: Abbruch - hass nicht verfügbar")}_readSaverVariable(e){if(!this._hass||!this._hass.states||!e)return this._debug("[Saver] _readSaverVariable: Kein hass oder key vorhanden"),null;const t=this._hass?.states?.["saver.saver"];if(t&&t.attributes&&t.attributes.variables){const i=t.attributes.variables,n=i[e];if(null!=n){const t=String(n).trim();if(""!==t){if(this._debug(`[Saver] _readSaverVariable: Variable "${e}" gefunden in saver.saver.attributes.variables, Länge: ${t.length} Zeichen`),t.length>0){const e=t.substring(0,100);this._debug(`[Saver] _readSaverVariable: Daten-Vorschau: "${e}${t.length>100?"...":""}"`)}return t}}const s=Object.keys(i);this._debug(`[Saver] _readSaverVariable: Variable "${e}" nicht gefunden. Verfügbare Variablen: ${s.length>0?s.join(", "):"keine"}`)}else this._debug("[Saver] _readSaverVariable: saver.saver Entity nicht gefunden oder hat keine variables-Attribute");return this._debug(`[Saver] _readSaverVariable: Variable "${e}" nicht gefunden oder leer`),null}_isSaverAvailable(){return!(!this._hass||!this._hass.states)&&Object.keys(this._hass.states).some((e=>e.startsWith("saver.")))}_loadDataFromSaver(){if(!this._config||"saver"!==this._config.store_mode)return this._debug('[Saver] _loadDataFromSaver: store_mode ist nicht "saver"'),null;const e=this._config.saver_key||"Schichtplan";this._debug(`[Saver] _loadDataFromSaver: Versuche Daten von Saver-Variable "${e}" zu laden`);const t=this._readSaverVariable(e);return t&&""!==t.trim()?(this._debug(`[Saver] _loadDataFromSaver: Daten erfolgreich geladen, Länge: ${t.length} Zeichen`),t):(this._debug("[Saver] _loadDataFromSaver: Keine Daten gefunden"),null)}_loadConfigFromSaver(){if(!this._config||"saver"!==this._config.store_mode)return this._debug('[Saver] _loadConfigFromSaver: store_mode ist nicht "saver"'),null;const e=`${this._config.saver_key||"Schichtplan"}_config`;this._debug(`[Saver] _loadConfigFromSaver: Versuche Config von Saver-Variable "${e}" zu laden`);const t=this._readSaverVariable(e);return t&&""!==t.trim()?(this._debug(`[Saver] _loadConfigFromSaver: Config erfolgreich geladen, Länge: ${t.length} Zeichen`),t):(this._debug("[Saver] _loadConfigFromSaver: Keine Config gefunden"),null)}_updateWarnings(){if(!this._storage)return;const e=this._storage.getWarnings();e?(e.config&&(this._configWarning=e.config,this._updateConfigWarningDirectly()),e.status&&(this._statusWarning=e.status,this._updateStatusWarningDirectly())):(this._configWarning&&(this._configWarning=null,this._updateConfigWarningDirectly()),this._statusWarning&&(this._statusWarning=null,this._updateStatusWarningDirectly()))}async loadWorkingDays(){if(!this._hass||!this._config)return void this._debug("[Laden] loadWorkingDays: Kein hass oder config vorhanden");if("saver"!==this._config.store_mode&&!this._config.entity)return void this._debug("[Laden] loadWorkingDays: Keine entity vorhanden (text_entity Modus benötigt entity)");if(this._storage||this._initializeStorage(),!this._storage)return void this._debug("[Laden] loadWorkingDays: Kein Storage-Adapter verfügbar");this._debug(`[Laden] loadWorkingDays: Start, store_mode: "${this._config.store_mode}", entity: "${this._config.entity||"nicht benötigt (Saver-Modus)"}"`);let e=null,t="none";try{e=await this._storage.loadData(),e&&(t="saver"===this._config.store_mode?"saver":"entities",this._debug(`[Laden] loadWorkingDays: Daten von ${t} geladen, Länge: ${e.length} Zeichen`))}catch(e){this._debug(`[Laden] loadWorkingDays: Fehler beim Laden: ${e.message}`,e)}if((!e||""===e.trim())&&"saver"===this._config.store_mode){this._debug("[Laden] loadWorkingDays: Keine Daten vom Saver, Fallback zu Entities");try{const i=Ie.createStorage(this._hass,{...this._config,store_mode:"text_entity"},this._debug.bind(this));e=await i.loadData(),e&&(t="entities-fallback",this._debug(`[Laden] loadWorkingDays: Daten von Entities (Fallback) geladen, Länge: ${e.length} Zeichen`))}catch(e){this._debug(`[Laden] loadWorkingDays: Fehler beim Fallback-Laden: ${e.message}`,e)}}if(this._storage&&this._storage._knownEntityIds&&(this._knownEntityIds=this._storage._knownEntityIds),e&&""!==e.trim()){this._debug(`[Laden] loadWorkingDays: Parse Daten von Quelle: "${t}"`),this._debug(`[Laden] loadWorkingDays: Daten-String (erste 200 Zeichen): ${e.substring(0,200)}...`),this.parseWorkingDays(e);const i=Object.keys(this._workingDays).length;this._debug(`[Laden] loadWorkingDays: Daten geparst, ${i} Monate gefunden`),this._debug("[Laden] loadWorkingDays: Verfügbare Keys in _workingDays:",Object.keys(this._workingDays)),Object.keys(this._workingDays).forEach((e=>{const t=this._workingDays[e];if("object"==typeof t&&!Array.isArray(t)){const i=Object.keys(t).length;this._debug(`[Laden] loadWorkingDays: Monat "${e}": ${i} Tage mit Daten`),Object.keys(t).slice(0,5).forEach((i=>{this._debug(`[Laden] loadWorkingDays: Monat "${e}", Tag ${i}:`,t[i])}))}}))}else this._debug("[Laden] loadWorkingDays: Keine Daten zum Parsen vorhanden, setze _workingDays auf {}"),this._workingDays={};if("saver"!==this._config.store_mode?this.checkStorageUsage():this._storageWarning=null,Object.keys(this._workingDays).length>0&&!this._cleanupDone){this._cleanupDone=!0;const e=this._config.numberOfMonths||2,t=new Date,i=t.getMonth()+1,n=t.getFullYear();let s,r;1===i?(s=12,r=(n-1)%100):(s=i-1,r=n%100);const a=[];a.push({year:r,month:s});for(let t=0;t<e;t++){const e=new Date(n,i-1+t,1),s=e.getFullYear()%100,r=e.getMonth()+1;a.push({year:s,month:r})}let o=!1;for(const e of Object.keys(this._workingDays)){const t=e.split(":");if(2===t.length){const i=parseInt(t[0]),n=parseInt(t[1]),s=a.some((e=>e.year===i&&e.month===n));s||(delete this._workingDays[e],o=!0)}else delete this._workingDays[e],o=!0}if(o){const e=this.serializeWorkingDays();try{await this._hass.callService("input_text","set_value",{entity_id:this._config.entity,value:e})}catch(e){}}}this.requestUpdate()}_parseWorkingDaysIntoObject(e,t){if(!e||""===e.trim())return;const i=e.split(";").filter((e=>""!==e.trim()));for(const e of i){const i=e.trim();if(!i)continue;const n=i.split(":");if(2===n.length){const e=n[0].trim(),i=n[1].trim();if(e&&i){const n=parseInt(e);if(!isNaN(n)&&n>=1&&n<=12){const e=(new Date).getFullYear()%100;t[`${this.formatTwoDigits(e)}:${this.formatTwoDigits(n)}`]=this._parseDaysWithElements(i)}}}else if(n.length>=3){const e=parseInt(n[0].trim()),i=parseInt(n[1].trim());if(e<=12&&i>12){const s=e,r=i,a=n.slice(2).join(":");a&&s>=1&&s<=12&&!isNaN(r)&&(t[`${this.formatTwoDigits(r)}:${this.formatTwoDigits(s)}`]=this._parseDaysWithElements(a))}else if(e>12&&i<=12){const s=e,r=i,a=n.slice(2).join(":");a&&r>=1&&r<=12&&!isNaN(s)&&(t[`${this.formatTwoDigits(s)}:${this.formatTwoDigits(r)}`]=this._parseDaysWithElements(a))}}}}_parseDaysWithElements(e){const t={},i=e.split(",").filter((e=>""!==e.trim()));for(const e of i){const i=e.trim();if(!i)continue;const n=i.match(/^(\d+)([a-z]*)$/i);if(n){const e=parseInt(n[1]),i=(n[2]||"").split("").filter((e=>e&&""!==e.trim()));!isNaN(e)&&e>=1&&e<=31&&(t[e]?t[e]=[...new Set([...t[e],...i])]:t[e]=i)}else i.includes("03")&&this._debug(`[Parsing] Kein Match für "${i}"`)}return t}parseWorkingDays(e){this._workingDays={},this._parseWorkingDaysIntoObject(e,this._workingDays)}findAdditionalEntities(e){const t=[];if(!this._hass||!this._hass.states)return t;const i=e.split(".");if(2!==i.length)return t;const[n,s]=i;for(let e=1;e<=999;e++){const i=`${n}.${s}_${String(e).padStart(3,"0")}`;if(!this._hass?.states?.[i])break;t.push(i)}return t}getEntityMaxLength(e){if(!this._hass||!this._hass.states||!e)return null;const t=this._hass?.states?.[e];if(!t||!t.attributes)return null;const i=t.attributes.max;return null!=i?parseInt(i):null}getAllEntityMaxLengths(){const e={};if(!this._hass||!this._config||!this._config.entity)return e;const t=this._config.entity,i=this.getEntityMaxLength(t);null!==i&&(e[t]=i);const n=this.findAdditionalEntities(t);for(const t of n){const i=this.getEntityMaxLength(t);null!==i&&(e[t]=i)}return e}checkStorageUsage(e=null){if(this._config&&"saver"===this._config.store_mode)return this._storageWarning=null,void this._updateStorageWarningDirectly();if(!this._hass||!this._config||!this._config.entity)return this._storageWarning=null,void this._updateStorageWarningDirectly();let t;t=this._knownEntityIds&&this._knownEntityIds.length>0?[...this._knownEntityIds]:[this._config.entity,...this.findAdditionalEntities(this._config.entity)];const i=this.getAllEntityMaxLengths();if(0===Object.keys(i).length)return this._storageWarning=null,void this._updateStorageWarningDirectly();let n=0,s=0;if(null!=e)n=e;else for(const e of t){const t=this._hass?.states?.[e];t&&t.state&&(n+=t.state.length)}for(const e of t){const t=i[e];null!=t&&(s+=t)}if(0===s)return this._storageWarning=null,void this._updateStorageWarningDirectly();const r=n/s*100;this._storageWarning=r>=90?{show:!0,currentLength:n,maxLength:s,percentage:Math.round(10*r)/10}:null,this._updateStorageWarningDirectly()}getConfigEntityId(){return this._config&&this._config.entity?this._config.entity+"_config":null}getStatusEntityId(){return this._config&&this._config.entity?this._config.entity+"_status":null}checkConfigEntity(){if(this._config&&"saver"===this._config.store_mode)return this._configWarning=null,void this._updateConfigWarningDirectly();if(!this._config||!this._config.entity)return this._configWarning=null,void this._updateConfigWarningDirectly();const e=this.getConfigEntityId();return e?this._hass&&this._hass.states?(this._hass.states[e]?this._configWarning&&"size"===this._configWarning.type||(this._configWarning=null):this._configWarning={show:!0,type:"missing",configEntityId:e},void this._updateConfigWarningDirectly()):(this._isInEditorMode()?this._configWarning={show:!0,type:"missing",configEntityId:e}:this._configWarning=null,void this._updateConfigWarningDirectly()):(this._configWarning=null,void this._updateConfigWarningDirectly())}_renderMissingEntityWarning(e,t,i=255,n=!1){const s=e.replace("input_text.","");return Z`
      <div class="storage-warning">
        <div class="warning-icon">⚠️</div>
        <div class="warning-content">
          <div class="warning-title">${t} fehlt!</div>
          <div class="warning-message">
            Die Entity <code>${e}</code> wurde nicht gefunden.
          </div>
          <div class="warning-action">
            Bitte legen Sie diese Entity über die UI an:
            <ul>
              <li>Einstellungen → Automatisierungen &amp; Szenen → Hilfsmittel</li>
              <li>Hinzufügen → Text</li>
              <li>Name: <code>${s}</code></li>
              <li>Maximale Länge: <code>${i}</code> Zeichen</li>
            </ul>
          </div>
        </div>
      </div>
    `}checkStatusEntity(){if(this._config&&"saver"===this._config.store_mode)return this._statusWarning=null,void this._updateStatusWarningDirectly();if(!this._config||!this._config.entity)return this._statusWarning=null,void this._updateStatusWarningDirectly();const e=this.getStatusEntityId();if(!e)return this._statusWarning=null,void this._updateStatusWarningDirectly();if(!this._hass||!this._hass.states)return this._isInEditorMode()?this._statusWarning={show:!0,type:"missing",statusEntityId:e}:this._statusWarning=null,void this._updateStatusWarningDirectly();const t=this._hass.states[e];this._statusWarning=t?null:{show:!0,type:"missing",statusEntityId:e},this._updateStatusWarningDirectly()}_createCompressedConfig(e){let t,i=JSON.stringify(e);i.startsWith("[")&&i.endsWith("]")&&(i=i.slice(1,-1));do{t=i.length,i=i.replace(/,null,/g,",,"),i=i.replace(/,null\]/g,",]"),i=i.replace(/\[null,/g,"[,"),i=i.replace(/,null$/g,",")}while(i.length!==t);return i=i.replace(/","/g,","),i=i.replace(/\["/g,"["),i=i.replace(/"\]/g,"]"),i=i.replace(/,"/g,","),i=i.replace(/",/g,","),i}_createFullJsonConfig(e){const t={shifts:e,setup:{timer_entity:this._config?.entity||"",store_mode:this._config?.store_mode||"saver"},lastchange:Math.floor(Date.now()/1e3)};return JSON.stringify(t)}async saveConfigToEntity(){if(this._debug("[Config] saveConfigToEntity: === START: Speichere Konfiguration ==="),this._isInitialLoad)return void this._debug("[Config] saveConfigToEntity: Initialer Load, überspringe Config-Speichern");if(!this._hass||!this._config||!this._config.entity)return void this._debug("[Config] saveConfigToEntity: Abbruch - hass, config oder entity fehlt",{hasHass:!!this._hass,hasConfig:!!this._config,hasEntity:!(!this._config||!this._config.entity)});this._debug("[Config] saveConfigToEntity: Prüfe Konfiguration",{store_mode:this._config.store_mode,saver_key:this._config.saver_key,entity:this._config.entity,calendars_count:this._config.calendars?this._config.calendars.length:0}),this._config.calendars&&this._config.calendars.length>0?(this._debug("[Config] saveConfigToEntity: Empfangene Kalender-Daten:",JSON.stringify(this._config.calendars,null,2)),this._config.calendars.forEach(((e,t)=>{this._debug(`[Config] saveConfigToEntity: Kalender ${t+1}:`,{shortcut:e.shortcut,name:e.name,color:e.color,enabled:e.enabled,statusRelevant:e.statusRelevant,timeRanges_count:e.timeRanges?e.timeRanges.length:0,timeRanges:e.timeRanges||[]})}))):this._debug("[Config] saveConfigToEntity: Keine Kalender-Daten vorhanden");const e=this._config.calendars||[];if(this._debug(`[Config] saveConfigToEntity: Speichere ${e.length} Kalender im neuen Format (direkt vom Config-Panel)`),e.forEach(((e,t)=>{this._debug(`[Config] saveConfigToEntity: Kalender ${t+1}:`,{shortcut:e.shortcut,name:e.name,color:e.color,enabled:e.enabled,statusRelevant:e.statusRelevant,timeRanges_count:e.timeRanges?e.timeRanges.length:0,timeRanges:e.timeRanges||[]})})),this._storage||(this._debug("[Config] saveConfigToEntity: Storage nicht initialisiert, initialisiere..."),this._initializeStorage()),this._storage){this._debug("[Config] saveConfigToEntity: Storage-Adapter gefunden, starte Speichern...",{storageType:this._config.store_mode,storageAdapter:this._storage.constructor.name});try{if(this._debug("[Config] saveConfigToEntity: Rufe _storage.saveConfig() auf..."),"saver"===this._config.store_mode)await this._storage.saveConfig(e);else{const t=this._convertCalendarsToShifts(e);await this._storage.saveConfig(t)}this._updateWarnings(),this._debug("[Config] saveConfigToEntity: === ENDE: Erfolgreich gespeichert ===")}catch(t){if(this._debug(`[Config] saveConfigToEntity: === FEHLER === Beim Schreiben: ${t.message}`,t),"saver"===this._config.store_mode){this._debug("[Config] saveConfigToEntity: Fallback zu EntityStorage");try{const t=Ie.createStorage(this._hass,{...this._config,store_mode:"text_entity"},this._debug.bind(this)),i=this._convertCalendarsToShifts(e);await t.saveConfig(i),this._updateWarnings()}catch(e){this._debug(`[Config] saveConfigToEntity: Auch Fallback fehlgeschlagen: ${e.message}`,e),this.checkConfigEntity()}}else this.checkConfigEntity()}}else this._debug("[Config] saveConfigToEntity: Kein Storage-Adapter verfügbar")}_convertCalendarsToShifts(e){const t=[];if(e&&Array.isArray(e))for(const i of e)if(i&&i.shortcut){const e=!0===i.enabled||"true"===i.enabled||1===i.enabled,n=[i.shortcut,i.name||`Schicht ${i.shortcut.toUpperCase()}`];if(i.timeRanges&&Array.isArray(i.timeRanges)&&i.timeRanges.length>0){const e=i.timeRanges[0];let t=null,s=null;e&&("object"==typeof e&&e.times&&Array.isArray(e.times)?(t=e.times[0]&&""!==e.times[0].trim()?e.times[0].trim():null,s=e.times[1]&&""!==e.times[1].trim()?e.times[1].trim():null):Array.isArray(e)&&e.length>=2&&(t=e[0]&&""!==e[0].trim()?e[0].trim():null,s=e[1]&&""!==e[1].trim()?e[1].trim():null)),n.push(t,s);const r=i.timeRanges[1];let a=null,o=null;r&&("object"==typeof r&&r.times&&Array.isArray(r.times)?(a=r.times[0]&&""!==r.times[0].trim()?r.times[0].trim():null,o=r.times[1]&&""!==r.times[1].trim()?r.times[1].trim():null):Array.isArray(r)&&r.length>=2&&(a=r[0]&&""!==r[0].trim()?r[0].trim():null,o=r[1]&&""!==r[1].trim()?r[1].trim():null)),n.push(a,o)}else n.push(null,null,null,null);const s=!1!==i.statusRelevant?1:0;n.push(s);const r=e?1:0;n.push(r),t.push(n)}return t}async _saveConfigToEntityFallback(e){const t=this.getConfigEntityId();if(!t)return void this._debug("[Config] _saveConfigToEntityFallback: Keine configEntityId");if(this._debug(`[Config] _saveConfigToEntityFallback: Start, configEntityId: "${t}"`),!this._hass.states[t])return this._debug(`[Config] _saveConfigToEntityFallback: Entity "${t}" existiert nicht`),void this.checkConfigEntity();const i=this._createCompressedConfig(e),n=i.length;this._debug(`[Config] _saveConfigToEntityFallback: Config erstellt (komprimiert), Länge: ${n} Zeichen`);const s=this.getEntityMaxLength(t);if(null!==s&&n>s){const e=n/s*100;return this._configWarning={show:!0,type:"size",configEntityId:t,currentLength:n,maxLength:s,percentage:Math.round(10*e)/10},void this._updateConfigWarningDirectly()}try{this._debug(`[Config] _saveConfigToEntityFallback: Schreibe Config in Entity "${t}"`),await this._hass.callService("input_text","set_value",{entity_id:t,value:i}),this._debug("[Config] _saveConfigToEntityFallback: Erfolgreich in Entity geschrieben"),this._configWarning=null,this._updateConfigWarningDirectly()}catch(e){this._debug(`[Config] _saveConfigToEntityFallback: Fehler beim Schreiben in Entity: ${e.message}`,e),this.checkConfigEntity()}}serializeWorkingDays(){const e=[],t=Object.keys(this._workingDays).sort(((e,t)=>{const[i,n]=e.split(":").map((e=>parseInt(e))),[s,r]=t.split(":").map((e=>parseInt(e)));return i!==s?i-s:n-r}));for(const i of t){const t=this._workingDays[i];if(!t||"object"!=typeof t||Array.isArray(t))continue;const n=Object.keys(t).map((e=>parseInt(e))).filter((e=>!isNaN(e))).sort(((e,t)=>e-t));if(n.length>0){const s=n.map((e=>{const i=t[e],n=this.formatTwoDigits(e);return Array.isArray(i)&&i.length>0?n+[...i].sort().join(""):n})).join(",");e.push(`${i}:${s}`)}}return e.join(";")}async distributeDataToEntities(e){if(this._hass&&this._config&&this._config.entity){this._debug(`[Speichern] distributeDataToEntities: Start, Datenlänge: ${e?e.length:0} Zeichen`),this._isWriting=!0,this._debug("[Speichern] distributeDataToEntities: Schreib-Lock gesetzt"),this._writeLockTimer&&(clearTimeout(this._writeLockTimer),this._writeLockTimer=null);try{let t;if(this._knownEntityIds&&this._knownEntityIds.length>0){t=[...this._knownEntityIds];const e=this.findAdditionalEntities(this._config.entity),i=this._knownEntityIds.length-1;if(e.length>i){const n=e.slice(i);t.push(...n),this._knownEntityIds=[...t]}}else{t=[this._config.entity];const e=this.findAdditionalEntities(this._config.entity);t.push(...e),this._knownEntityIds=[...t]}this._debug(`[Speichern] distributeDataToEntities: Verwende ${t.length} Entities: ${t.join(", ")}`);const i={};let n=0;for(const e of t){const t=this.getEntityMaxLength(e);null!==t?(i[e]=t,n+=t):(i[e]=255,n+=255)}const s=e?e.length:0;if(this._debug(`[Speichern] distributeDataToEntities: Datenlänge: ${s} Zeichen, verfügbarer Speicher: ${n} Zeichen`),!e||""===e.trim()){this._debug("[Speichern] distributeDataToEntities: Keine Daten vorhanden, setze alle Entities auf leer");for(const e of t)try{await this._hass.callService("input_text","set_value",{entity_id:e,value:""}),this._debug(`[Speichern] distributeDataToEntities: Entity "${e}" auf leer gesetzt`)}catch(t){this._debug(`[Speichern] distributeDataToEntities: Fehler beim Leeren von "${e}": ${t.message}`)}return void(this._writeLockTimer=setTimeout((()=>{this._isWriting=!1,this._writeLockTimer=null,this._debug("[Speichern] distributeDataToEntities: Schreib-Lock nach 5 Sekunden entfernt (keine Daten)")}),5e3))}const r={};let a=0,o=e;for(;o.length>0&&a<t.length;){const e=t[a],n=i[e],s=Math.min(o.length,n),l=o.substring(0,s);r[e]=l,o=o.substring(s),o.length>0&&a++}if(o.length>0){const e=this.findAdditionalEntities(this._config.entity),n=this._knownEntityIds?this._knownEntityIds.length-1:0;if(e.length>n){const s=e.slice(n);t.push(...s),this._knownEntityIds=[...t];for(const e of s){const t=this.getEntityMaxLength(e);i[e]=null!==t?t:255}for(a=t.length-s.length;o.length>0&&a<t.length;){const e=t[a],n=i[e],s=Math.min(o.length,n),l=o.substring(0,s);r[e]=l,o=o.substring(s),o.length>0&&a++}}}this._debug(`[Speichern] distributeDataToEntities: Schreibe in ${t.length} Entities`);for(const e of t){const t=r[e]||"",n=i[e];if(t.length>n){const i=t.substring(0,n);this._debug(`[Speichern] distributeDataToEntities: Schreibe in "${e}" (gekürzt von ${t.length} auf ${i.length} Zeichen)`);try{await this._hass.callService("input_text","set_value",{entity_id:e,value:i}),this._debug(`[Speichern] distributeDataToEntities: Erfolgreich in "${e}" geschrieben`)}catch(t){this._debug(`[Speichern] distributeDataToEntities: Fehler beim Schreiben in "${e}": ${t.message}`)}}else{this._debug(`[Speichern] distributeDataToEntities: Schreibe in "${e}" (${t.length} Zeichen)`);try{await this._hass.callService("input_text","set_value",{entity_id:e,value:t}),this._debug(`[Speichern] distributeDataToEntities: Erfolgreich in "${e}" geschrieben`)}catch(t){this._debug(`[Speichern] distributeDataToEntities: Fehler beim Schreiben in "${e}": ${t.message}`)}}}const l=this.findAdditionalEntities(this._config.entity);this._debug(`[Speichern] distributeDataToEntities: Prüfe ${l.length} zusätzliche Entities zum Leeren`);for(const e of l)if(!(e in r)){this._debug(`[Speichern] distributeDataToEntities: Leere nicht verwendete Entity "${e}"`);try{await this._hass.callService("input_text","set_value",{entity_id:e,value:""}),this._debug(`[Speichern] distributeDataToEntities: Entity "${e}" erfolgreich geleert`)}catch(t){this._debug(`[Speichern] distributeDataToEntities: Fehler beim Leeren von "${e}": ${t.message}`)}}o.length>0&&this._debug(`[Speichern] distributeDataToEntities: WARNUNG - ${o.length} Zeichen konnten nicht gespeichert werden!`)}catch(e){this._debug(`[Speichern] distributeDataToEntities: Fehler beim Verteilen der Daten: ${e.message}`,e)}finally{this._writeLockTimer=setTimeout((()=>{this._isWriting=!1,this._writeLockTimer=null,this._debug("[Speichern] distributeDataToEntities: Schreib-Lock nach 5 Sekunden entfernt")}),5e3),this._debug("[Speichern] distributeDataToEntities: Abgeschlossen, Schreib-Lock wird in 5 Sekunden entfernt")}}else this._debug("[Speichern] distributeDataToEntities: Kein hass, config oder entity vorhanden")}async toggleDay(e,t,i=null){const n=parseInt(e),s=parseInt(t);if(isNaN(n)||isNaN(s))return;const r=new Date,a=r.getMonth()+1,o=r.getFullYear(),l=o%100;i||(i=l);const c=parseInt(i);let h=!1;if(h=1===a?12===n&&c===(o-1)%100:n===a-1&&c===l,h)return;if(!this._hass||!this._config||!this._config.entity)return;const d=`${this.formatTwoDigits(c)}:${this.formatTwoDigits(n)}`;this._workingDays[d]&&!Array.isArray(this._workingDays[d])||(this._workingDays[d]={});const g=this._getSelectedCalendarShortcut();if(!g)return;this._workingDays[d][s]||(this._workingDays[d][s]=[]);const u=[...this._workingDays[d][s]||[]],f=u.indexOf(g),p=`${c}:${n}:${s}`;this._directDOMUpdateInProgress.add(p);let m=[];f>-1?(u.splice(f,1),m=u,0===u.length?(delete this._workingDays[d][s],0===Object.keys(this._workingDays[d]).length&&delete this._workingDays[d]):this._workingDays[d][s]=u):(u.includes(g)||(u.push(g),this._workingDays[d][s]=u),m=this._workingDays[d]&&this._workingDays[d][s]?this._workingDays[d][s]:u),this._updateDayButtonDirectly(n,s,c,d,m),this._scheduleDebouncedSave()}_scheduleDebouncedSave(){const e=this._getSaveDebounceTime();0!==e?(this._saveDebounceTimer&&(clearTimeout(this._saveDebounceTimer),this._saveDebounceTimer=null),this._saveDebounceTimer=setTimeout((()=>{this._saveDebounceTimer=null,this._saveToHA()}),e)):this._saveToHA()}async _saveToHA(){try{if(this._debug("[Speichern] _saveToHA: Start"),this._storage||this._initializeStorage(),!this._storage)return void this._debug("[Speichern] _saveToHA: Kein Storage-Adapter verfügbar");const e=this.serializeWorkingDays();this._debug(`[Speichern] _saveToHA: Daten serialisiert, Länge: ${e.length} Zeichen, store_mode: "${this._config.store_mode}"`),this._isWriting=!0,this._writeLockTimer&&clearTimeout(this._writeLockTimer);try{await this._storage.saveData(e);const t=this._storage.checkStorageUsage(e.length);t?(this._storageWarning=t,this._updateStorageWarningDirectly()):(this._storageWarning=null,this._updateStorageWarningDirectly()),this._debug("[Speichern] _saveToHA: Erfolgreich abgeschlossen")}catch(t){if(this._debug(`[Speichern] _saveToHA: Fehler beim Speichern, versuche Fallback: ${t.message}`,t),"saver"!==this._config.store_mode)throw t;{this._debug("[Speichern] _saveToHA: Fallback zu EntityStorage");const t=Ie.createStorage(this._hass,{...this._config,store_mode:"text_entity"},this._debug.bind(this));await t.saveData(e)}}finally{this._writeLockTimer=setTimeout((()=>{this._isWriting=!1,this._writeLockTimer=null,this._debug("[Speichern] _saveToHA: Schreib-Lock entfernt")}),5e3)}}catch(e){this._debug(`[Speichern] _saveToHA: Fehler beim Speichern: ${e.message}`,e),console.error("[TG Schichtplan] Fehler beim Speichern:",e)}}async _saveDataToSaver(e){if(!this._hass||!this._config||!this._config.saver_key)return void this._debug("[Speichern] _saveDataToSaver: Kein hass, config oder saver_key vorhanden");const t=this._config.saver_key||"Schichtplan";this._debug(`[Speichern] _saveDataToSaver: Start, saver_key: "${t}", Datenlänge: ${e.length} Zeichen`);try{const i=this._hass?.states?.["saver.saver"];let n="";if(i&&i.attributes&&i.attributes.variables){const e=i.attributes.variables[t];null!=e&&(n=String(e).trim())}this._debug(`[Speichern] _saveDataToSaver: Saver-Variable "${t}" existiert: ${""!==n}, alte Länge: ${n.length} Zeichen`),""===n||n!==e?(this._debug("[Speichern] _saveDataToSaver: Schreibe in Saver (Variable existiert nicht oder Wert hat sich geändert)"),await this._hass.callService("saver","set_variable",{name:t,value:e||""}),this._debug("[Speichern] _saveDataToSaver: Erfolgreich in Saver geschrieben")):this._debug("[Speichern] _saveDataToSaver: Kein Schreiben nötig, Wert hat sich nicht geändert")}catch(t){this._debug(`[Speichern] _saveDataToSaver: Fehler beim Schreiben in Saver, Fallback zu Entities: ${t.message}`,t),console.warn("[TG Schichtplan] Fehler beim Schreiben in Saver, Fallback zu Entities:",t),await this.distributeDataToEntities(e)}}_getSaveDebounceTime(){return this._config&&"number"==typeof this._config.saveDebounceTime?Math.max(0,this._config.saveDebounceTime):300}_updateDayButtonDirectly(e,t,i,n,s){if(!this.shadowRoot)return void this.requestUpdate();const r=`${i}:${e}:${t}`;this._directDOMUpdateInProgress.has(r)||this._directDOMUpdateInProgress.add(r);const a=this.shadowRoot.querySelector(`button[data-month="${e}"][data-day="${t}"][data-year="${i}"]`);if(!a)return this._directDOMUpdateInProgress.delete(r),void this.requestUpdate();const o=this._getSelectedCalendarShortcut(),l=o&&s.includes(o),c=this._getCalendarByShortcut(o);let h=null;const d=["a","b","c","d","e"];for(const e of d)if(s.includes(e)){const t=this._getCalendarByShortcut(e);if(t&&t.enabled){h=e;break}}let g=null;if(l&&c&&c.enabled?g=o:h&&(g=h),null!==g?a.classList.add("working"):a.classList.remove("working"),g){const e=this._getCalendarByShortcut(g);e&&e.color?a.style.backgroundColor=e.color:a.style.backgroundColor=""}else a.style.backgroundColor="";const u=a.querySelector(".shifts-container");u&&u.remove();const f=s.filter((e=>e!==g)).map((e=>{const t=this._getCalendarByShortcut(e);if(t&&t.enabled&&t.color){const i=document.createElement("span");return i.className="shift-indicator",i.style.backgroundColor=t.color,i.title=t.name||`Schicht ${e.toUpperCase()}`,i}return null})).filter((e=>null!==e));if(f.length>0){const e=document.createElement("div");e.className="shifts-container",e.setAttribute("data-manual-update","true"),f.forEach((t=>e.appendChild(t))),a.appendChild(e)}setTimeout((()=>{this._directDOMUpdateInProgress.delete(r)}),100)}getDaysInMonth(e,t){return new Date(e,t+1,0).getDate()}getFirstDayOfMonth(e,t){return new Date(e,t,1).getDay()}getWeekNumber(e){const t=new Date(Date.UTC(e.getFullYear(),e.getMonth(),e.getDate())),i=t.getUTCDay()||7;t.setUTCDate(t.getUTCDate()+4-i);const n=new Date(Date.UTC(t.getUTCFullYear(),0,1));return Math.ceil(((t-n)/864e5+1)/7)}getMonthName(e){return["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"][e]}renderDay(e,t,i,n,s,r,a,o){const l=new Date,c=l.getDate(),h=l.getMonth(),d=l.getFullYear(),g=this._getDayElements(n,e),u=a===d&&o===h&&e===c,f=this._getSelectedCalendarShortcut(),p=f&&g.includes(f),m=this._getCalendarByShortcut(f);let b="",_=null;const y=["a","b","c","d","e"];for(const e of y)if(g.includes(e)){const t=this._getCalendarByShortcut(e);if(t&&t.enabled){_=e;break}}let v=null;p&&m&&m.enabled?v=f:_&&(v=_);const w=null!==v;if(v){const e=this._getCalendarByShortcut(v);e&&e.color&&(b=`background-color: ${e.color};`)}const S=this._isWeekend(a,o,e),$=this._isHoliday(a,o,e),C=g.filter((e=>e!==v)).map((e=>{const t=this._getCalendarByShortcut(e);return t&&t.enabled&&t.color?Z`
            <span
              class="shift-indicator"
              style="background-color: ${t.color};"
              title="${t.name||`Schicht ${e.toUpperCase()}`}"
            >
            </span>
          `:null})).filter((e=>null!==e));return Z`
      <td>
        <button
          class="day-button ${w?"working":""} ${u?"today":""} ${r?"readonly":""} ${S?"weekend":""} ${$?"holiday":""}"
          style="${b}"
          @click=${n=>{r||(this.toggleDay(t,e,i),setTimeout((()=>{if(n.target.blur(),this.shadowRoot){const e=this.shadowRoot.querySelector(".calendar-wrapper");e?(e.hasAttribute("tabindex")||e.setAttribute("tabindex","-1"),e.focus()):this.focus&&this.focus()}}),0))}}
          ?disabled=${r}
          data-month="${t}"
          data-day="${e}"
          data-year="${i}"
        >
          <span class="day-number">${e}</span>
          ${(()=>{const n=`${i}:${t}:${e}`;if(this._directDOMUpdateInProgress&&this._directDOMUpdateInProgress.has(n))return"";if(this.shadowRoot){const n=this.shadowRoot.querySelector(`button[data-month="${t}"][data-day="${e}"][data-year="${i}"]`);if(n&&n.querySelector('.shifts-container[data-manual-update="true"]'))return""}return C.length>0?Z`<div class="shifts-container">${C}</div>`:""})()}
        </button>
      </td>
    `}renderMonth(e,t){const i=this.getDaysInMonth(e,t),n=(this.getFirstDayOfMonth(e,t)+6)%7,s=t+1,r=e%100,a=`${this.formatTwoDigits(r)}:${this.formatTwoDigits(s)}`;let o=[];this._workingDays[a]&&(Array.isArray(this._workingDays[a])?o=this._workingDays[a].map((e=>parseInt(e))).filter((e=>!isNaN(e))):"object"==typeof this._workingDays[a]&&(o=Object.keys(this._workingDays[a]).map((e=>parseInt(e))).filter((e=>!isNaN(e)))));const l=new Date,c=(l.getDate(),l.getMonth()),h=l.getFullYear();let d=!1;d=0===c?11===t&&e===h-1:t===c-1&&e===h;const g=[];let u=1;const f=new Date(e,t,1),p=this.getWeekNumber(f),m=[Z`<td class="week-label">${p}</td>`];for(let e=0;e<n;e++)m.push(Z`<td></td>`);for(let l=n;l<7&&u<=i;l++)m.push(this.renderDay(u,s,r,a,o,d,e,t)),u++;for(g.push(Z`<tr>
        ${m}
      </tr>`);u<=i;){const n=new Date(e,t,u),l=this.getWeekNumber(n),c=[Z`<td class="week-label">${l}</td>`];for(let n=0;n<7;n++)u<=i?(c.push(this.renderDay(u,s,r,a,o,d,e,t)),u++):c.push(Z`<td></td>`);g.push(Z`<tr>
          ${c}
        </tr>`)}return Z`
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
            ${g}
          </tbody>
        </table>
      </div>
    `}changeDisplayedMonths(e){const t=this._config?.numberOfMonths||14,i=Math.max(1,Math.min(t,(this._displayedMonths||2)+e));i!==this._displayedMonths&&(this._displayedMonths=i,this.requestUpdate())}changeStartMonth(e){const t=this._config?.numberOfMonths||14,i=this._displayedMonths||2,n=this._startMonthOffset||0,s=t-i,r=Math.max(-1,Math.min(s,n+e));r!==n&&(this._startMonthOffset=r,this.requestUpdate())}getNavigationBounds(){const e=this._config?.numberOfMonths||14,t=this._displayedMonths||2,i=this._startMonthOffset||0;return{canGoBack:i>-1,canGoForward:i<e-t}}_getSelectedCalendarShortcut(){if(null!==this._selectedCalendar&&void 0!==this._selectedCalendar&&""!==this._selectedCalendar)return this._selectedCalendar;if(this._config?.selectedCalendar)return this._selectedCalendar=this._config.selectedCalendar,this._selectedCalendar;const e=this._getAllCalendars();return e.length>0?e[0].shortcut:null}_getCalendarByShortcut(e){return this._config?.calendars&&this._config.calendars.find((t=>t.shortcut===e))||null}_getDefaultColorForShortcut(e){const t=nt.CALENDARS.find((t=>t.shortcut===e));return t?t.defaultColor:"#ff9800"}_getAllCalendars(){return this._config?.calendars?this._config.calendars.filter((e=>e&&e.shortcut&&(!0===e.enabled||"true"===e.enabled||1===e.enabled))).sort(((e,t)=>e.shortcut.localeCompare(t.shortcut))):[]}_getSelectedCalendarValue(){const e=this._getAllCalendars();return 0===e.length?(null!==this._selectedCalendar&&(this._selectedCalendar=null,this._config&&(this._config.selectedCalendar=null),this.requestUpdate()),null):null===this._selectedCalendar||void 0===this._selectedCalendar?(this._selectedCalendar=e[0].shortcut,this._config&&(this._config.selectedCalendar=this._selectedCalendar),this.requestUpdate(),this._selectedCalendar):(e.some((e=>e.shortcut===this._selectedCalendar))||(this._selectedCalendar=e[0].shortcut,this._config&&(this._config.selectedCalendar=this._selectedCalendar),this.requestUpdate()),this._selectedCalendar)}_onCalendarSelectedByIndex(e){""!==e&&null!=e&&(this._selectedCalendar=e,this._config&&(this._config={...this._config,selectedCalendar:e},this._isInitialLoad||(this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:!0,composed:!0})),this.saveConfigToEntity())),!this._isInitialLoad&&this.shadowRoot&&this._workingDays&&Object.keys(this._workingDays).length>0&&setTimeout((()=>{this._updateAllDayButtonsForCalendarChange()}),0))}_updateAllDayButtonsForCalendarChange(){if(!this.shadowRoot)return;const e=this.shadowRoot.querySelectorAll("button.day-button"),t=this._getSelectedCalendarShortcut(),i=this._getCalendarByShortcut(t);e.forEach((e=>{const n=e.getAttribute("data-month"),s=parseInt(e.getAttribute("data-day")),r=e.getAttribute("data-year");if(!n||!s||!r)return;const a=`${this.formatTwoDigits(parseInt(r))}:${this.formatTwoDigits(parseInt(n))}`,o=this._getDayElements(a,s),l=t&&o.includes(t);let c=null;const h=["a","b","c","d","e"];for(const e of h)if(o.includes(e)){const t=this._getCalendarByShortcut(e);if(t&&t.enabled){c=e;break}}let d=null;if(l&&i&&i.enabled?d=t:c&&(d=c),null!==d?e.classList.add("working"):e.classList.remove("working"),d){const t=this._getCalendarByShortcut(d);t&&t.color?e.style.backgroundColor=t.color:e.style.backgroundColor=""}else e.style.backgroundColor="";const g=e.querySelector(".shifts-container");g&&g.remove();const u=o.filter((e=>e!==d)).map((e=>{const t=this._getCalendarByShortcut(e);if(t&&t.enabled&&t.color){const i=document.createElement("span");return i.className="shift-indicator",i.style.backgroundColor=t.color,i.title=t.name||`Schicht ${e.toUpperCase()}`,i}return null})).filter((e=>null!==e));if(u.length>0){const t=document.createElement("div");t.className="shifts-container",t.setAttribute("data-manual-update","true"),u.forEach((e=>t.appendChild(e))),e.appendChild(t)}}))}_updateStorageWarningDirectly(){if(!this.shadowRoot)return void this.requestUpdate();const e=this.shadowRoot.querySelector(".calendar-wrapper");if(!e)return void this.requestUpdate();this._isInEditorMode();const t=this._storageWarning&&this._storageWarning.show;t?e.classList.add("storage-warning-active"):e.classList.remove("storage-warning-active");let i=e.querySelector('.storage-warning[data-warning-type="storage"]');if(t){i||(i=document.createElement("div"),i.className="storage-warning",i.setAttribute("data-warning-type","storage"),e.insertBefore(i,e.firstChild));const t=this.findAdditionalEntities(this._config.entity),n=String(t.length+1).padStart(3,"0");i.innerHTML=`\n        <div class="warning-icon">⚠️</div>\n        <div class="warning-content">\n          <div class="warning-title">Speicherplatz fast voll!</div>\n          <div class="warning-message">\n            ${this._storageWarning.percentage}% der verfügbaren Speicherkapazität verwendet\n            (${this._storageWarning.currentLength} / ${this._storageWarning.maxLength} Zeichen).\n          </div>\n          <div class="warning-action">\n            Bitte legen Sie ein zusätzliches Input-Text-Feld an (z.B. ${this._config.entity}_${n}).\n          </div>\n        </div>\n      `}else i&&i.remove()}_updateConfigWarningDirectly(){if(!this.shadowRoot)return void this.requestUpdate();const e=this.shadowRoot.querySelector(".calendar-wrapper");if(!e)return void this.requestUpdate();const t=this._isInEditorMode(),i=this._configWarning&&this._configWarning.show&&("size"===this._configWarning.type||"missing"===this._configWarning.type&&t),n=e.querySelector('.storage-warning[data-warning-type="config-size"]'),s=e.querySelector('.storage-warning[data-warning-type="config-missing"]');if(i&&"size"===this._configWarning.type){let t=n;if(!t){t=document.createElement("div"),t.className="storage-warning",t.setAttribute("data-warning-type","config-size");const i=e.querySelector('.storage-warning[data-warning-type="storage"]');i?i.insertAdjacentElement("afterend",t):e.insertBefore(t,e.firstChild)}t.innerHTML=`\n        <div class="warning-icon">⚠️</div>\n        <div class="warning-content">\n          <div class="warning-title">Konfigurations-Entity zu klein!</div>\n          <div class="warning-message">\n            Die Konfiguration passt nicht in die Entity <code>${this._configWarning.configEntityId}</code>.\n            ${this._configWarning.percentage}% der verfügbaren Speicherkapazität benötigt\n            (${this._configWarning.currentLength} / ${this._configWarning.maxLength} Zeichen).\n          </div>\n          <div class="warning-action">\n            Bitte erhöhen Sie die maximale Länge der Entity über die UI:\n            <ul>\n              <li>Einstellungen → Automatisierungen &amp; Szenen → Hilfsmittel</li>\n              <li>Entity <code>${this._configWarning.configEntityId.replace("input_text.","")}</code> bearbeiten</li>\n              <li>Maximale Länge auf mindestens <code>${Math.ceil(1.2*this._configWarning.currentLength)}</code> Zeichen erhöhen</li>\n            </ul>\n          </div>\n        </div>\n      `}else n&&n.remove();if(i&&"missing"===this._configWarning.type&&t){let t=s;if(!t){t=document.createElement("div"),t.className="storage-warning",t.setAttribute("data-warning-type","config-missing");const i=e.querySelector(".storage-warning:last-of-type");i?i.insertAdjacentElement("afterend",t):e.insertBefore(t,e.firstChild)}this._configWarning.configEntityId.replace("input_text.",""),t.innerHTML=`\n        <div class="warning-icon">⚠️</div>\n        <div class="warning-content">\n          <div class="warning-title">Konfigurations-Entity fehlt!</div>\n          <div class="warning-message">\n            Die Entity <code>${this._configWarning.configEntityId}</code> wurde nicht gefunden.\n          </div>\n          <div class="warning-action">\n            Bitte legen Sie diese Entity über die UI an:\n            <ul>\n              <li>Einstellungen → Automatisierungen &amp; Szenen → Hilfsmittel</li>\n              <li>Hilfsmittel hinzufügen → Text</li>\n              <li>Entity-ID: <code>${this._configWarning.configEntityId}</code></li>\n              <li>Maximale Länge: <code>255</code> Zeichen (oder mehr)</li>\n            </ul>\n          </div>\n        </div>\n      `}else s&&s.remove()}_updateStatusWarningDirectly(){if(!this.shadowRoot)return void this.requestUpdate();const e=this.shadowRoot.querySelector(".calendar-wrapper");if(!e)return void this.requestUpdate();const t=this._isInEditorMode(),i=this._statusWarning&&this._statusWarning.show&&t,n=e.querySelector('.storage-warning[data-warning-type="status"]');if(i){let t=n;if(!t){t=document.createElement("div"),t.className="storage-warning",t.setAttribute("data-warning-type","status");const i=e.querySelector(".storage-warning:last-of-type");i?i.insertAdjacentElement("afterend",t):e.insertBefore(t,e.firstChild)}t.innerHTML=`\n        <div class="warning-icon">⚠️</div>\n        <div class="warning-content">\n          <div class="warning-title">Status-Entity fehlt!</div>\n          <div class="warning-message">\n            Die Entity <code>${this._statusWarning.statusEntityId}</code> wurde nicht gefunden.\n          </div>\n          <div class="warning-action">\n            Bitte legen Sie diese Entity über die UI an:\n            <ul>\n              <li>Einstellungen → Automatisierungen &amp; Szenen → Hilfsmittel</li>\n              <li>Hilfsmittel hinzufügen → Text</li>\n              <li>Entity-ID: <code>${this._statusWarning.statusEntityId}</code></li>\n              <li>Maximale Länge: <code>255</code> Zeichen (oder mehr)</li>\n            </ul>\n          </div>\n        </div>\n      `}else n&&n.remove()}_getDayElements(e,t){const i=t<=3||!this._workingDays[e];if(i&&this._debug(`[Render] _getDayElements: Suche nach monthKey="${e}", day=${t}`),!this._workingDays[e]||"object"!=typeof this._workingDays[e])return i&&(this._debug(`[Render] _getDayElements: Keine Daten für monthKey="${e}" gefunden oder kein Objekt`),this._debug("[Render] _getDayElements: Verfügbare Keys in _workingDays:",Object.keys(this._workingDays))),[];if(Array.isArray(this._workingDays[e]))return i&&this._debug(`[Render] _getDayElements: Altes Format (Array) für monthKey="${e}"`),[];const n=this._workingDays[e][t]||[];return i&&n.length>0&&this._debug(`[Render] _getDayElements: Gefundene Elemente für "${e}", Tag ${t}:`,n),n}shouldUpdate(e){return!(e.has("_workingDays")&&1===e.size&&this._directDOMUpdateInProgress.size>0)&&["hass","config","_workingDays","_displayedMonths","_startMonthOffset","_selectedCalendar","_storageWarning","_configWarning","_statusWarning","_showConfigPanel"].some((t=>e.has(t)))}render(){if(!this._config)return Z`<div class="error">Keine Konfiguration vorhanden</div>`;const e=this._config.numberOfMonths||14,t=this._displayedMonths||2,i=this._startMonthOffset||0,n=new Date,s=[];for(let e=0;e<t;e++){const t=new Date(n.getFullYear(),n.getMonth()+i+e,1),r=t.getFullYear(),a=t.getMonth();s.push({year:r,month:a})}const r=this._isInEditorMode(),a=this._storageWarning&&this._storageWarning.show,o=this._configWarning&&this._configWarning.show&&("size"===this._configWarning.type||"missing"===this._configWarning.type&&r),l=this._statusWarning&&this._statusWarning.show&&r,c=this.getNavigationBounds();return Z`
      <div class="calendar-wrapper ${a?"storage-warning-active":""}">
        <div class="schichtplan-wrapper">
        ${a?Z`
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
                    ${this._config.entity}_${String(this.findAdditionalEntities(this._config.entity).length+1).padStart(3,"0")}).
                  </div>
                </div>
              </div>
            `:""}
        ${o&&"size"===this._configWarning.type?Z`
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
                          >${this._configWarning.configEntityId.replace("input_text.","")}</code
                        >
                        bearbeiten
                      </li>
                      <li>
                        Maximale Länge auf mindestens
                        <code>${Math.ceil(1.2*this._configWarning.currentLength)}</code> Zeichen
                        erhöhen
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            `:""}
        ${o&&"missing"===this._configWarning.type?Z`
              <div class="storage-warning" data-warning-type="config-missing">
                ${this._renderMissingEntityWarning(this._configWarning.configEntityId,"Konfigurations-Entity",255,!0)}
              </div>
            `:""}
        ${l?Z`
              <div class="storage-warning" data-warning-type="status">
                ${this._renderMissingEntityWarning(this._statusWarning.statusEntityId,"Status-Entity",255,!1)}
              </div>
            `:""}
        ${this._showConfigPanel?Z``:Z`
              <div class="schichtplan-wrapper">
                <div class="schichtplan-menu-bar">
                  ${Ve({left:"",center:Z`
                      <div class="menu-controls">
                        <button
                          class="menu-button navigation-button"
                          @click=${()=>this.changeStartMonth(-1)}
                          ?disabled=${!c.canGoBack}
                          title="Vorheriger Monat"
                        >
                          ←
                        </button>
                        <button
                          class="menu-button decrease-button"
                          @click=${()=>this.changeDisplayedMonths(-1)}
                          ?disabled=${t<=1}
                          title="Weniger Monate anzeigen"
                        >
                          −
                        </button>
                        <div class="menu-number">${t}</div>
                        <button
                          class="menu-button increase-button"
                          @click=${()=>this.changeDisplayedMonths(1)}
                          ?disabled=${t>=e}
                          title="Mehr Monate anzeigen"
                        >
                          +
                        </button>
                        <button
                          class="menu-button navigation-button"
                          @click=${()=>this.changeStartMonth(1)}
                          ?disabled=${!c.canGoForward}
                          title="Nächster Monat"
                        >
                          →
                        </button>
                      </div>
                    `,right:Z`
                      <button
                        class="menu-button config-button"
                        @click=${e=>{e.stopPropagation(),e.preventDefault(),this._showConfigPanel=!0,this.requestUpdate()}}
                        title="Schichtkonfiguration"
                      >
                        ⚙️
                      </button>
                    `,fullWidth:(()=>{const e=this._getAllCalendars(),t=this._getSelectedCalendarShortcut();return Z`
                        <div class="color-bar">
                          ${e.map((e=>{const i=e.shortcut===t,n=this._getContrastColor(e.color||"#ff9800");return Z`
                              <button
                                class="color-button ${i?"selected":""}"
                                style="background-color: ${e.color||"#ff9800"}; color: ${n};"
                                @click=${()=>this._onCalendarSelectedByIndex(e.shortcut)}
                                title="${e.name||`Schicht ${e.shortcut.toUpperCase()}`}"
                              >${e.name||`Schicht ${e.shortcut.toUpperCase()}`}</button>
                            `}))}
                        </div>
                      `})()})}
                </div>
                <div class="schichtplan-panel">
                  ${s.map((({year:e,month:t})=>this.renderMonth(e,t)))}
                </div>
              </div>
            `}
        ${this._showConfigPanel?Z`
              <div class="config-wrapper">
                <shift-config-panel
                  .calendars=${this._config?.calendars||[]}
                  .selectedShortcut=${this._getSelectedCalendarShortcut()}
                  .hass=${this._hass}
                  @close=${()=>{this._showConfigPanel=!1,this.requestUpdate()}}
                  @save=${e=>this._handleConfigPanelSave(e.detail.calendars)}
                ></shift-config-panel>
              </div>
            `:Z``}
      </div>
    `}_handleConfigPanelSave(e){this._config&&(this._config.calendars=e,this.saveConfigToEntity(),this._showConfigPanel=!1,this.requestUpdate())}}function st(){return st="undefined"!=typeof Reflect&&Reflect.get?Reflect.get.bind():function(e,t,i){var n=function(e,t){for(;!{}.hasOwnProperty.call(e,t)&&null!==(e=rt(e)););return e}(e,t);if(n){var s=Object.getOwnPropertyDescriptor(n,t);return s.get?s.get.call(arguments.length<3?e:i):s.value}},st.apply(null,arguments)}function rt(e){return rt=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(e){return e.__proto__||Object.getPrototypeOf(e)},rt(e)}function at(e,t,i){return(t=function(e){var t=function(e){if("object"!=typeof e||!e)return e;var t=e[Symbol.toPrimitive];if(void 0!==t){var i=t.call(e,"string");if("object"!=typeof i)return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(e)}(e);return"symbol"==typeof t?t:t+""}(t))in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i,e}Ze=nt,it(nt,"className","ShiftScheduleView"),it(nt,"DEFAULT_SELECTED_DAY_COLOR","#ff9800"),it(nt,"CALENDARS",[{shortcut:"a",name:"Schicht A",defaultColor:"#ff9800"},{shortcut:"b",name:"Schicht B",defaultColor:"#ff0000"},{shortcut:"c",name:"Schicht C",defaultColor:"#00ff00"},{shortcut:"d",name:"Schicht D",defaultColor:"#0000ff"},{shortcut:"e",name:"Schicht E",defaultColor:"#ffff00"}]),it(nt,"styles",[function(e,t,i){var n=et(tt(e),"styles",i);return n}(Ze,0,Ze)||[],He,d`
      :host {
        display: block;
        --tgshiftschedule-default-selected-day-color: ${h(Ze.DEFAULT_SELECTED_DAY_COLOR)};
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
    `]),customElements.get("shiftschedule-view")||customElements.define("shiftschedule-view",nt);class ot extends De{static get properties(){return{...super.properties,config:{type:Object},hass:{type:Object},lovelace:{type:Object},_view:{type:Object},_viewType:{type:String}}}static getConfigElement(){return document.createElement(`${pe}-editor`)}static getStubConfig(){return{numberOfMonths:14,initialDisplayedMonths:2,store_mode:"saver",saver_key:"Schichtplan"}}constructor(){super(),this._debug("CardImpl-Modul wird geladen"),this.config=this.getDefaultConfig(),this._debug("CardImpl-Konstruktor: Initialisierung abgeschlossen")}getDefaultConfig(){return this._debug("CardImpl getDefaultConfig wird aufgerufen"),{numberOfMonths:14,initialDisplayedMonths:2,selectedCalendar:"a",store_mode:"saver",saver_key:"Schichtplan",calendars:[{shortcut:"a",name:"Kalender A",color:"#ff9800",enabled:!0,statusRelevant:!0},{shortcut:"b",name:"Kalender B",color:"#ff0000",enabled:!1,statusRelevant:!0},{shortcut:"c",name:"Kalender C",color:"#00ff00",enabled:!1,statusRelevant:!0},{shortcut:"d",name:"Kalender D",color:"#0000ff",enabled:!1,statusRelevant:!0},{shortcut:"e",name:"Kalender E",color:"#ffff00",enabled:!1,statusRelevant:!0}]}}setConfig(e){if(this._debug("setConfig wird aufgerufen mit:",e),!e)throw new Error("Keine Konfiguration vorhanden");const t=this.getDefaultConfig();this.config={...t,...e,selectedCalendar:void 0!==e?.selectedCalendar?e.selectedCalendar:this.config?.selectedCalendar||t.selectedCalendar},this._debug("config nach setConfig:",this.config),this._viewType="ShiftScheduleView";try{this._view?this._debug("setConfig: Aktualisiere bestehende ShiftSchedule-View"):(this._debug("setConfig: Erstelle neue ShiftSchedule-View"),this._view=document.createElement("shiftschedule-view"),this._view.addEventListener("config-changed",(e=>{this._debug("config-changed Event von ShiftSchedule-View empfangen:",e.detail),e.detail&&e.detail.config&&(this.config=e.detail.config,this._view._handleConfigChanged&&this._view._handleConfigChanged(),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this.config},bubbles:!0,composed:!0})))})),this._hass&&(this._debug("setConfig: Übergebe gespeicherten hass an ShiftSchedule-View"),this._view.hass=this._hass),this.lovelace&&(this._debug("setConfig: Übergebe lovelace an ShiftSchedule-View"),this._view.lovelace=this.lovelace)),this._view.config=this.config,this._debug("setConfig: View initialisiert/aktualisiert:",{viewType:this._viewType,config:this.config})}catch(e){throw this._debug("setConfig: Fehler bei View-Initialisierung:",e),new Error(`Fehler bei der View-Initialisierung: ${e.message}`)}}set hass(e){this._hass=e,this._view?this._view.hass=e:this._debug("set hass: View noch nicht initialisiert, speichere hass für später")}set lovelace(e){this._lovelace=e,this._view&&(this._view.lovelace=e)}get lovelace(){return this._lovelace}get hass(){return this._hass}firstUpdated(){this._debug("firstUpdated wird aufgerufen"),this._view&&this._view.firstUpdated(),this._debug("firstUpdated abgeschlossen")}render(){if(!this._view)return Z`<div class="error">Keine View verfügbar</div>`;try{return Z`${this._view}`}catch(e){return this._debug("render: Fehler beim Rendern der View:",e),Z`<div class="error">Fehler beim Rendern: ${e.message}</div>`}}}function lt(e,t,i){return(t=function(e){var t=function(e){if("object"!=typeof e||!e)return e;var t=e[Symbol.toPrimitive];if(void 0!==t){var i=t.call(e,"string");if("object"!=typeof i)return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(e)}(e);return"symbol"==typeof t?t:t+""}(t))in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i,e}function ct(e,t,i,n){var s=ht(dt(1&n?e.prototype:e),t,i);return 2&n&&"function"==typeof s?function(e){return s.apply(i,e)}:s}function ht(){return ht="undefined"!=typeof Reflect&&Reflect.get?Reflect.get.bind():function(e,t,i){var n=function(e,t){for(;!{}.hasOwnProperty.call(e,t)&&null!==(e=dt(e)););return e}(e,t);if(n){var s=Object.getOwnPropertyDescriptor(n,t);return s.get?s.get.call(arguments.length<3?e:i):s.value}},ht.apply(null,arguments)}function dt(e){return dt=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(e){return e.__proto__||Object.getPrototypeOf(e)},dt(e)}Je=ot,at(ot,"className","CardImpl"),at(ot,"styles",[function(e,t,i){var n=st(rt(e),"styles",i);return n}(Je,0,Je),d`
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
    `]);class gt extends we{constructor(e={}){super(),this._debug("[EditorBase] EditorBase-Konstruktor wird aufgerufen"),this.config={type:"custom:tgeditor-card",...e},this._debug("[EditorBase] EditorBase config nach Konstruktor:",this.config)}async firstUpdated(){this._debug("[EditorBase] EditorBase firstUpdated wird aufgerufen"),await super.firstUpdated(),this._debug("[EditorBase] EditorBase firstUpdated abgeschlossen")}async loadHaForm(){if(this._debug("[EditorBase] EditorBase loadHaForm wird aufgerufen"),customElements.get("ha-form"))this._debug("[EditorBase] EditorBase ha-form bereits geladen");else{this._debug("[EditorBase] EditorBase ha-form nicht gefunden, lade custom-card-helpers");try{const e=await s.e(356).then(s.bind(s,356));this._debug("[EditorBase] EditorBase custom-card-helpers geladen"),await e.loadHaForm(),this._debug("[EditorBase] EditorBase ha-form geladen")}catch(e){throw e}}}getDefaultConfig(){throw this._debug("[EditorBase] EditorBase getDefaultConfig wird aufgerufen"),new Error("getDefaultConfig muss in der abgeleiteten Klasse implementiert werden")}getStubConfig(){return this._debug("[EditorBase] EditorBase getStubConfig wird aufgerufen"),this.getDefaultConfig()}setConfig(e){if(this._debug("[EditorBase] EditorBase setConfig wird aufgerufen mit:",e),!e)throw new Error("Keine Konfiguration angegeben");const t=!this.config||0===Object.keys(this.config).length;this.config=t?{...this.getDefaultConfig(),...e}:{...this.config,...e},this._debug("[EditorBase] EditorBase config nach setConfig:",this.config)}}function ut(e,t,i){return(t=function(e){var t=function(e){if("object"!=typeof e||!e)return e;var t=e[Symbol.toPrimitive];if(void 0!==t){var i=t.call(e,"string");if("object"!=typeof i)return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(e)}(e);return"symbol"==typeof t?t:t+""}(t))in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i,e}function ft(e,t,i,n){var s=pt(mt(1&n?e.prototype:e),t,i);return 2&n&&"function"==typeof s?function(e){return s.apply(i,e)}:s}function pt(){return pt="undefined"!=typeof Reflect&&Reflect.get?Reflect.get.bind():function(e,t,i){var n=function(e,t){for(;!{}.hasOwnProperty.call(e,t)&&null!==(e=mt(e)););return e}(e,t);if(n){var s=Object.getOwnPropertyDescriptor(n,t);return s.get?s.get.call(arguments.length<3?e:i):s.value}},pt.apply(null,arguments)}function mt(e){return mt=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(e){return e.__proto__||Object.getPrototypeOf(e)},mt(e)}lt(gt,"properties",{...ct(Ge=gt,"properties",Ge),_selectedTab:{type:Number}}),lt(gt,"styles",[ct(Ge,"styles",Ge),d`
      :host {
        display: block;
      }
      .editor-container {
        padding: 16px;
      }
    `]);class bt extends gt{constructor(){super({numberOfMonths:14,initialDisplayedMonths:2,selectedCalendar:"a",store_mode:"saver",saver_key:"Schichtplan",calendars:[{shortcut:"a",name:"Schicht A",color:"#ff9800",enabled:!0,statusRelevant:!0},{shortcut:"b",name:"Schicht B",color:"#ff0000",enabled:!1,statusRelevant:!0},{shortcut:"c",name:"Schicht C",color:"#00ff00",enabled:!1,statusRelevant:!0},{shortcut:"d",name:"Schicht D",color:"#0000ff",enabled:!1,statusRelevant:!0},{shortcut:"e",name:"Schicht E",color:"#ffff00",enabled:!1,statusRelevant:!0}],holidays:{neujahr:!0,heilige_drei_koenige:!0,tag_der_arbeit:!0,friedensfest:!0,mariae_himmelfahrt:!0,tag_der_deutschen_einheit:!0,reformationstag:!0,allerheiligen:!0,weihnachten_1:!0,weihnachten_2:!0,karfreitag:!0,ostermontag:!0,christi_himmelfahrt:!0,pfingstmontag:!0,fronleichnam:!0,busstag:!0}}),this._debug("EditorImpl-Modul wird geladen")}async firstUpdated(){this._debug("EditorImpl firstUpdated wird aufgerufen"),await super.firstUpdated(),this._debug("EditorImpl firstUpdated abgeschlossen")}render(){if(this._debug("EditorImpl render wird aufgerufen"),!this.hass)return this._debug("EditorImpl render: Kein hass"),Z`<div>Loading...</div>`;this._debug("EditorImpl render mit config:",this.config),this.config.calendars&&Array.isArray(this.config.calendars)||(this.config.calendars=[{shortcut:"a",name:"Schicht A",color:"#ff9800",enabled:!1,statusRelevant:!0},{shortcut:"b",name:"Schicht B",color:"#ff0000",enabled:!1,statusRelevant:!0},{shortcut:"c",name:"Schicht C",color:"#00ff00",enabled:!1,statusRelevant:!0},{shortcut:"d",name:"Schicht D",color:"#0000ff",enabled:!1,statusRelevant:!0},{shortcut:"e",name:"Schicht E",color:"#ffff00",enabled:!1,statusRelevant:!0}]);const e=new Map;return this.config.calendars.forEach((t=>e.set(t.shortcut,t))),this.config.calendars=[{shortcut:"a",name:"Schicht A",color:"#ff9800",enabled:!1,statusRelevant:!0},{shortcut:"b",name:"Schicht B",color:"#ff0000",enabled:!1,statusRelevant:!0},{shortcut:"c",name:"Schicht C",color:"#00ff00",enabled:!1,statusRelevant:!0},{shortcut:"d",name:"Schicht D",color:"#0000ff",enabled:!1,statusRelevant:!0},{shortcut:"e",name:"Schicht E",color:"#ffff00",enabled:!1,statusRelevant:!0}].map((t=>{const i=e.get(t.shortcut);return i?{...t,...i,shortcut:t.shortcut,statusRelevant:void 0===i.statusRelevant||i.statusRelevant}:t})),this.config.store_mode="saver",this.config.saver_key||(this.config.saver_key="Schichtplan"),Z`
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
    `}_getColorOptions(){return[{value:"#ff0000",name:"Rot"},{value:"#00ff00",name:"Grün"},{value:"#0000ff",name:"Blau"},{value:"#ffff00",name:"Gelb"},{value:"#ff00ff",name:"Magenta"},{value:"#00ffff",name:"Cyan"},{value:"#ff8800",name:"Orange"},{value:"#8800ff",name:"Violett"},{value:"#0088ff",name:"Hellblau"},{value:"#ff0088",name:"Pink"},{value:"#88ff00",name:"Lime"},{value:"#008888",name:"Türkis"},{value:"#888888",name:"Grau"},{value:"#000000",name:"Schwarz"},{value:"#ffffff",name:"Weiß"}]}_validateTime(e){return!e||""===e.trim()||/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(e.trim())}_validateTimeRange(e){if(!e||!Array.isArray(e)||e.length<2)return{isValid:!0,message:""};const t=e[0],i=e[1],n=t&&""!==t.trim(),s=i&&""!==i.trim();if(!n&&!s)return{isValid:!0,message:""};if(n&&s){const e=this._validateTime(t),n=this._validateTime(i);return e?n?{isValid:!0,message:""}:{isValid:!1,message:"Ungültiges Format für Endzeit. Bitte HH:MM verwenden (z.B. 17:00)"}:{isValid:!1,message:"Ungültiges Format für Startzeit. Bitte HH:MM verwenden (z.B. 08:30)"}}return n&&!s?{isValid:!1,message:"Bitte auch die Endzeit angeben"}:!n&&s?{isValid:!1,message:"Bitte auch die Startzeit angeben"}:{isValid:!0,message:""}}_renderCalendar(e,t){const i=this._getColorOptions(),n=t.color||"#ff0000",s=t.timeRanges||[[null,null],[null,null]],r=t.name||`Schicht ${t.shortcut.toUpperCase()}`,a=t.enabled||!1,o=this._validateTimeRange(s[0]),l=this._validateTimeRange(s[1]),c=!s[0]||!s[0][0]||this._validateTime(s[0][0]),h=!s[0]||!s[0][1]||this._validateTime(s[0][1]),d=!s[1]||!s[1][0]||this._validateTime(s[1][0]),g=!s[1]||!s[1][1]||this._validateTime(s[1][1]),u=!c||!o.isValid,f=!h||!o.isValid,p=!d||!l.isValid,m=!g||!l.isValid;return Z`
      <details class="calendar-item">
        <summary class="calendar-summary">
          <span class="calendar-summary-title"
            >Schicht ${t.shortcut.toUpperCase()}: ${r}</span
          >
          <span class="calendar-summary-status">
            ${a?Z`<span class="status-badge status-enabled">Aktiviert</span>`:Z`<span class="status-badge status-disabled">Deaktiviert</span>`}
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
                .value=${s[0]&&s[0][0]?s[0][0]:""}
                placeholder="HH:MM"
                pattern="^([0-1][0-9]|2[0-3]):[0-5][0-9]$"
                .error=${u}
                .helper=${u?o.message||"Ungültiges Format. Bitte HH:MM verwenden (z.B. 08:30)":""}
                @input=${e=>{const i=e.target.value.trim()||null,n=!i||this._validateTime(i);this._updateTimeRange(t.shortcut,0,0,i),setTimeout((()=>{const i=this.config.calendars?.find((e=>e.shortcut===t.shortcut)),s=i?.timeRanges?.[0]||[null,null],r=this._validateTimeRange(s),a=!n||!r.isValid;e.target.error=a,e.target.helper=a?r.message||"Ungültiges Format. Bitte HH:MM verwenden (z.B. 08:30)":"",this.requestUpdate()}),0)}}
                @blur=${e=>{const i=e.target.value.trim()||null,n=!i||this._validateTime(i),s=this.config.calendars?.find((e=>e.shortcut===t.shortcut)),r=s?.timeRanges?.[0]||[null,null],a=this._validateTimeRange(r),o=!n||!a.isValid;e.target.error=o,e.target.helper=o?a.message||"Ungültiges Format. Bitte HH:MM verwenden (z.B. 08:30)":"",this.requestUpdate()}}
              ></ha-textfield>
              <span class="time-separator">-</span>
              <ha-textfield
                label="Endzeit 1"
                .value=${s[0]&&s[0][1]?s[0][1]:""}
                placeholder="HH:MM"
                pattern="^([0-1][0-9]|2[0-3]):[0-5][0-9]$"
                .error=${f}
                .helper=${f?o.message||"Ungültiges Format. Bitte HH:MM verwenden (z.B. 17:00)":""}
                @input=${e=>{const i=e.target.value.trim()||null,n=!i||this._validateTime(i);this._updateTimeRange(t.shortcut,0,1,i),setTimeout((()=>{const i=this.config.calendars?.find((e=>e.shortcut===t.shortcut)),s=i?.timeRanges?.[0]||[null,null],r=this._validateTimeRange(s),a=!n||!r.isValid;e.target.error=a,e.target.helper=a?r.message||"Ungültiges Format. Bitte HH:MM verwenden (z.B. 17:00)":"",this.requestUpdate()}),0)}}
                @blur=${e=>{const i=e.target.value.trim()||null,n=!i||this._validateTime(i),s=this.config.calendars?.find((e=>e.shortcut===t.shortcut)),r=s?.timeRanges?.[0]||[null,null],a=this._validateTimeRange(r),o=!n||!a.isValid;e.target.error=o,e.target.helper=o?a.message||"Ungültiges Format. Bitte HH:MM verwenden (z.B. 17:00)":"",this.requestUpdate()}}
              ></ha-textfield>
            </div>
            <div class="time-range-item">
              <ha-textfield
                label="Startzeit 2"
                .value=${s[1]&&s[1][0]?s[1][0]:""}
                placeholder="HH:MM"
                pattern="^([0-1][0-9]|2[0-3]):[0-5][0-9]$"
                .error=${p}
                .helper=${p?l.message||"Ungültiges Format. Bitte HH:MM verwenden (z.B. 08:30)":""}
                @input=${e=>{const i=e.target.value.trim()||null,n=!i||this._validateTime(i);this._updateTimeRange(t.shortcut,1,0,i),setTimeout((()=>{const i=this.config.calendars?.find((e=>e.shortcut===t.shortcut)),s=i?.timeRanges?.[1]||[null,null],r=this._validateTimeRange(s),a=!n||!r.isValid;e.target.error=a,e.target.helper=a?r.message||"Ungültiges Format. Bitte HH:MM verwenden (z.B. 08:30)":"",this.requestUpdate()}),0)}}
                @blur=${e=>{const i=e.target.value.trim()||null,n=!i||this._validateTime(i),s=this.config.calendars?.find((e=>e.shortcut===t.shortcut)),r=s?.timeRanges?.[1]||[null,null],a=this._validateTimeRange(r),o=!n||!a.isValid;e.target.error=o,e.target.helper=o?a.message||"Ungültiges Format. Bitte HH:MM verwenden (z.B. 08:30)":"",this.requestUpdate()}}
              ></ha-textfield>
              <span class="time-separator">-</span>
              <ha-textfield
                label="Endzeit 2"
                .value=${s[1]&&s[1][1]?s[1][1]:""}
                placeholder="HH:MM"
                pattern="^([0-1][0-9]|2[0-3]):[0-5][0-9]$"
                .error=${m}
                .helper=${m?l.message||"Ungültiges Format. Bitte HH:MM verwenden (z.B. 17:00)":""}
                @input=${e=>{const i=e.target.value.trim()||null,n=!i||this._validateTime(i);this._updateTimeRange(t.shortcut,1,1,i),setTimeout((()=>{const i=this.config.calendars?.find((e=>e.shortcut===t.shortcut)),s=i?.timeRanges?.[1]||[null,null],r=this._validateTimeRange(s),a=!n||!r.isValid;e.target.error=a,e.target.helper=a?r.message||"Ungültiges Format. Bitte HH:MM verwenden (z.B. 17:00)":"",this.requestUpdate()}),0)}}
                @blur=${e=>{const i=e.target.value.trim()||null,n=!i||this._validateTime(i),s=this.config.calendars?.find((e=>e.shortcut===t.shortcut)),r=s?.timeRanges?.[1]||[null,null],a=this._validateTimeRange(r),o=!n||!a.isValid;e.target.error=o,e.target.helper=o?a.message||"Ungültiges Format. Bitte HH:MM verwenden (z.B. 17:00)":"",this.requestUpdate()}}
              ></ha-textfield>
            </div>
          </div>
        </div>
      </details>
    `}_renderHolidays(){return this.config.holidays||(this.config.holidays={neujahr:!0,heilige_drei_koenige:!0,tag_der_arbeit:!0,friedensfest:!0,mariae_himmelfahrt:!0,tag_der_deutschen_einheit:!0,reformationstag:!0,allerheiligen:!0,weihnachten_1:!0,weihnachten_2:!0,karfreitag:!0,ostermontag:!0,christi_himmelfahrt:!0,pfingstmontag:!0,fronleichnam:!0,busstag:!0}),Z`
      <details class="holidays-item">
        <summary class="holidays-summary">
          <span class="holidays-summary-title">Feiertage</span>
        </summary>
        <div class="holidays-fields">
          ${[{key:"neujahr",label:"Neujahr (1. Januar)"},{key:"heilige_drei_koenige",label:"Heilige Drei Könige (6. Januar)"},{key:"tag_der_arbeit",label:"Tag der Arbeit (1. Mai)"},{key:"friedensfest",label:"Friedensfest (8. August)"},{key:"mariae_himmelfahrt",label:"Mariä Himmelfahrt (15. August)"},{key:"tag_der_deutschen_einheit",label:"Tag der Deutschen Einheit (3. Oktober)"},{key:"reformationstag",label:"Reformationstag (31. Oktober)"},{key:"allerheiligen",label:"Allerheiligen (1. November)"},{key:"weihnachten_1",label:"1. Weihnachtsfeiertag (25. Dezember)"},{key:"weihnachten_2",label:"2. Weihnachtsfeiertag (26. Dezember)"},{key:"karfreitag",label:"Karfreitag"},{key:"ostermontag",label:"Ostermontag"},{key:"christi_himmelfahrt",label:"Christi Himmelfahrt"},{key:"pfingstmontag",label:"Pfingstmontag"},{key:"fronleichnam",label:"Fronleichnam"},{key:"busstag",label:"Buß- und Bettag"}].map((e=>Z`
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
    `}_updateHoliday(e,t){this.config.holidays||(this.config.holidays={});const i={...this.config,holidays:{...this.config.holidays,[e]:t}};this.config=i,this.requestUpdate(),setTimeout((()=>{this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:i},bubbles:!0,composed:!0}))}),0)}_updateTimeRange(e,t,i,n){this.config.calendars||(this.config.calendars=[{shortcut:"a",name:"Schicht A",color:"#ff9800",enabled:!1},{shortcut:"b",name:"Schicht B",color:"#ff0000",enabled:!1},{shortcut:"c",name:"Schicht C",color:"#00ff00",enabled:!1},{shortcut:"d",name:"Schicht D",color:"#0000ff",enabled:!1},{shortcut:"e",name:"Schicht E",color:"#ffff00",enabled:!1}]);const s=this.config.calendars.map((s=>{if(s.shortcut===e){const e=(s.timeRanges||[[null,null],[null,null]]).map(((e,s)=>{if(s===t){const t=[...e];return t[i]=n||null,t}return e}));return{...s,timeRanges:e}}return s})),r={...this.config,calendars:s};this.config=r,this.requestUpdate(),setTimeout((()=>{this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:r},bubbles:!0,composed:!0}))}),0)}_updateCalendar(e,t,i){this.config.calendars||(this.config.calendars=[{shortcut:"a",name:"Schicht A",color:"#ff9800",enabled:!1},{shortcut:"b",name:"Schicht B",color:"#ff0000",enabled:!1},{shortcut:"c",name:"Schicht C",color:"#00ff00",enabled:!1},{shortcut:"d",name:"Schicht D",color:"#0000ff",enabled:!1},{shortcut:"e",name:"Schicht E",color:"#ffff00",enabled:!1}]);const n=this.config.calendars.map((n=>n.shortcut===e?{...n,[t]:i}:n)),s={...this.config,calendars:n};this.config=s,this.requestUpdate(),setTimeout((()=>{this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:s},bubbles:!0,composed:!0}))}),0)}_computeLabel(e){switch(e.name){case"numberOfMonths":return"Maximale Anzahl Monate";case"initialDisplayedMonths":return"Standardwert sichtbare Monate";case"saver_key":return"Saver-Variablenname";default:return e.name}}_valueChanged(e){this._debug("EditorImpl _valueChanged wird aufgerufen mit:",e.detail);const t=e.detail.value;this.config.store_mode,void 0!==t.initialDisplayedMonths&&void 0!==t.numberOfMonths?t.initialDisplayedMonths=Math.min(t.initialDisplayedMonths,t.numberOfMonths):void 0!==t.initialDisplayedMonths&&this.config.numberOfMonths?t.initialDisplayedMonths=Math.min(t.initialDisplayedMonths,this.config.numberOfMonths):void 0!==t.numberOfMonths&&this.config.initialDisplayedMonths&&this.config.initialDisplayedMonths>t.numberOfMonths&&(t.initialDisplayedMonths=t.numberOfMonths),t.store_mode="saver",void 0===t.saver_key&&(t.saver_key=this.config.saver_key||"Schichtplan"),this.config={...this.config,...t},this._debug("EditorImpl config nach _valueChanged:",this.config),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this.config},bubbles:!0,composed:!0}))}static getConfigElement(){return document.createElement(`${pe}-editor`)}static getStubConfig(){return{numberOfMonths:14,initialDisplayedMonths:2,store_mode:"saver",saver_key:"Schichtplan",holidays:{neujahr:!0,heilige_drei_koenige:!0,tag_der_arbeit:!0,friedensfest:!0,mariae_himmelfahrt:!0,tag_der_deutschen_einheit:!0,reformationstag:!0,allerheiligen:!0,weihnachten_1:!0,weihnachten_2:!0,karfreitag:!0,ostermontag:!0,christi_himmelfahrt:!0,pfingstmontag:!0,fronleichnam:!0,busstag:!0}}}_getBasicSchema(){return[{name:"saver_key",selector:{text:{}}},{name:"numberOfMonths",selector:{number:{min:1,max:14,step:1,mode:"box"}}},{name:"initialDisplayedMonths",selector:{number:{min:1,max:14,step:1,mode:"box"}}}]}}function _t(){return _t="undefined"!=typeof Reflect&&Reflect.get?Reflect.get.bind():function(e,t,i){var n=function(e,t){for(;!{}.hasOwnProperty.call(e,t)&&null!==(e=yt(e)););return e}(e,t);if(n){var s=Object.getOwnPropertyDescriptor(n,t);return s.get?s.get.call(arguments.length<3?e:i):s.value}},_t.apply(null,arguments)}function yt(e){return yt=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(e){return e.__proto__||Object.getPrototypeOf(e)},yt(e)}ut(bt,"properties",{...ft(Ye=bt,"properties",Ye)}),ut(bt,"styles",[ft(Ye,"styles",Ye),d`
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
    `]);class vt extends bt{constructor(){super()}}function wt(){return wt="undefined"!=typeof Reflect&&Reflect.get?Reflect.get.bind():function(e,t,i){var n=function(e,t){for(;!{}.hasOwnProperty.call(e,t)&&null!==(e=St(e)););return e}(e,t);if(n){var s=Object.getOwnPropertyDescriptor(n,t);return s.get?s.get.call(arguments.length<3?e:i):s.value}},wt.apply(null,arguments)}function St(e){return St=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(e){return e.__proto__||Object.getPrototypeOf(e)},St(e)}(function(e,t,i){(t=function(e){var t=function(e){if("object"!=typeof e||!e)return e;var t=e[Symbol.toPrimitive];if(void 0!==t){var i=t.call(e,"string");if("object"!=typeof i)return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(e)}(e);return"symbol"==typeof t?t:t+""}(t))in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i})(vt,"styles",[function(e,t,i){var n=_t(yt(e),"styles",i);return n}(Qe=vt,0,Qe),d`
      :host {
        display: block;
        padding-top: 2px;
        padding-bottom: 2px;
        padding-left: 16px;
        padding-right: 16px;
      }
    `]),customElements.get(`${pe}-editor`)||customElements.define(`${pe}-editor`,vt);class $t extends ot{constructor(){super()}connectedCallback(){super.connectedCallback()}disconnectedCallback(){super.disconnectedCallback()}}if(function(e,t,i){(t=function(e){var t=function(e){if("object"!=typeof e||!e)return e;var t=e[Symbol.toPrimitive];if(void 0!==t){var i=t.call(e,"string");if("object"!=typeof i)return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(e)}(e);return"symbol"==typeof t?t:t+""}(t))in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i}($t,"styles",[function(e,t,i){var n=wt(St(e),"styles",i);return n}(Xe=$t,0,Xe),d`
      :host {
      }
    `]),window.customCards&&window.customCards.push({type:pe,name:me,description:"Eine Schichtplan-Karte für Arbeitszeiten",preview:!0}),!customElements.get(pe))try{customElements.define(pe,$t)}catch(e){}})();
//# sourceMappingURL=tgshiftschedule-card.js.map