/*! For license information please see tgshiftschedule-card.js.LICENSE.txt */
(()=>{"use strict";var t,e,i={},n={};function r(t){var e=n[t];if(void 0!==e)return e.exports;var s=n[t]={exports:{}};return i[t](s,s.exports,r),s.exports}r.m=i,r.d=(t,e)=>{for(var i in e)r.o(e,i)&&!r.o(t,i)&&Object.defineProperty(t,i,{enumerable:!0,get:e[i]})},r.f={},r.e=t=>Promise.all(Object.keys(r.f).reduce(((e,i)=>(r.f[i](t,e),e)),[])),r.u=t=>t+".tgshiftschedule-card.js",r.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(t){if("object"==typeof window)return window}}(),r.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),t={},e="tgshiftschedule-card:",r.l=(i,n,s,a)=>{if(t[i])t[i].push(n);else{var o,l;if(void 0!==s)for(var c=document.getElementsByTagName("script"),d=0;d<c.length;d++){var h=c[d];if(h.getAttribute("src")==i||h.getAttribute("data-webpack")==e+s){o=h;break}}o||(l=!0,(o=document.createElement("script")).charset="utf-8",o.timeout=120,r.nc&&o.setAttribute("nonce",r.nc),o.setAttribute("data-webpack",e+s),o.src=i),t[i]=[n];var u=(e,n)=>{o.onerror=o.onload=null,clearTimeout(f);var r=t[i];if(delete t[i],o.parentNode&&o.parentNode.removeChild(o),r&&r.forEach((t=>t(n))),e)return e(n)},f=setTimeout(u.bind(null,void 0,{type:"timeout",target:o}),12e4);o.onerror=u.bind(null,o.onerror),o.onload=u.bind(null,o.onload),l&&document.head.appendChild(o)}},r.r=t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},(()=>{var t;r.g.importScripts&&(t=r.g.location+"");var e=r.g.document;if(!t&&e&&(e.currentScript&&"SCRIPT"===e.currentScript.tagName.toUpperCase()&&(t=e.currentScript.src),!t)){var i=e.getElementsByTagName("script");if(i.length)for(var n=i.length-1;n>-1&&(!t||!/^http(s?):/.test(t));)t=i[n--].src}if(!t)throw new Error("Automatic publicPath is not supported in this browser");t=t.replace(/^blob:/,"").replace(/#.*$/,"").replace(/\?.*$/,"").replace(/\/[^\/]+$/,"/"),r.p=t})(),(()=>{var t={792:0};r.f.j=(e,i)=>{var n=r.o(t,e)?t[e]:void 0;if(0!==n)if(n)i.push(n[2]);else{var s=new Promise(((i,r)=>n=t[e]=[i,r]));i.push(n[2]=s);var a=r.p+r.u(e),o=new Error;r.l(a,(i=>{if(r.o(t,e)&&(0!==(n=t[e])&&(t[e]=void 0),n)){var s=i&&("load"===i.type?"missing":i.type),a=i&&i.target&&i.target.src;o.message="Loading chunk "+e+" failed.\n("+s+": "+a+")",o.name="ChunkLoadError",o.type=s,o.request=a,n[1](o)}}),"chunk-"+e,e)}};var e=(e,i)=>{var n,s,[a,o,l]=i,c=0;if(a.some((e=>0!==t[e]))){for(n in o)r.o(o,n)&&(r.m[n]=o[n]);l&&l(r)}for(e&&e(i);c<a.length;c++)s=a[c],r.o(t,s)&&t[s]&&t[s][0](),t[s]=0},i=self.webpackChunktgshiftschedule_card=self.webpackChunktgshiftschedule_card||[];i.forEach(e.bind(null,0)),i.push=e.bind(null,i.push.bind(i))})();const s=globalThis,a=s.ShadowRoot&&(void 0===s.ShadyCSS||s.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,o=Symbol(),l=new WeakMap;class c{constructor(t,e,i){if(this._$cssResult$=!0,i!==o)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(a&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=l.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&l.set(e,t))}return t}toString(){return this.cssText}}const d=t=>new c("string"==typeof t?t:t+"",void 0,o),h=(t,...e)=>{const i=1===t.length?t[0]:e.reduce(((e,i,n)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[n+1]),t[0]);return new c(i,t,o)},u=a?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return d(e)})(t):t,{is:f,defineProperty:g,getOwnPropertyDescriptor:p,getOwnPropertyNames:m,getOwnPropertySymbols:y,getPrototypeOf:b}=Object,_=globalThis,v=_.trustedTypes,w=v?v.emptyScript:"",$=_.reactiveElementPolyfillSupport,x=(t,e)=>t,C={toAttribute(t,e){switch(e){case Boolean:t=t?w:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},k=(t,e)=>!f(t,e),E={attribute:!0,type:String,converter:C,reflect:!1,useDefault:!1,hasChanged:k};Symbol.metadata??=Symbol("metadata"),_.litPropertyMetadata??=new WeakMap;class S extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=E){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),n=this.getPropertyDescriptor(t,i,e);void 0!==n&&g(this.prototype,t,n)}}static getPropertyDescriptor(t,e,i){const{get:n,set:r}=p(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:n,set(e){const s=n?.call(this);r?.call(this,e),this.requestUpdate(t,s,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??E}static _$Ei(){if(this.hasOwnProperty(x("elementProperties")))return;const t=b(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(x("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(x("properties"))){const t=this.properties,e=[...m(t),...y(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(u(t))}else void 0!==t&&e.push(u(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise((t=>this.enableUpdating=t)),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach((t=>t(this)))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,e)=>{if(a)t.adoptedStyleSheets=e.map((t=>t instanceof CSSStyleSheet?t:t.styleSheet));else for(const i of e){const e=document.createElement("style"),n=s.litNonce;void 0!==n&&e.setAttribute("nonce",n),e.textContent=i.cssText,t.appendChild(e)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach((t=>t.hostConnected?.()))}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach((t=>t.hostDisconnected?.()))}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),n=this.constructor._$Eu(t,i);if(void 0!==n&&!0===i.reflect){const r=(void 0!==i.converter?.toAttribute?i.converter:C).toAttribute(e,i.type);this._$Em=t,null==r?this.removeAttribute(n):this.setAttribute(n,r),this._$Em=null}}_$AK(t,e){const i=this.constructor,n=i._$Eh.get(t);if(void 0!==n&&this._$Em!==n){const t=i.getPropertyOptions(n),r="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:C;this._$Em=n,this[n]=r.fromAttribute(e,t.type)??this._$Ej?.get(n)??null,this._$Em=null}}requestUpdate(t,e,i){if(void 0!==t){const n=this.constructor,r=this[t];if(i??=n.getPropertyOptions(t),!((i.hasChanged??k)(r,e)||i.useDefault&&i.reflect&&r===this._$Ej?.get(t)&&!this.hasAttribute(n._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:n,wrapped:r},s){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,s??e??this[t]),!0!==r||void 0!==s)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===n&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,n=this[e];!0!==t||this._$AL.has(e)||void 0===n||this.C(e,void 0,i,n)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach((t=>t.hostUpdate?.())),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach((t=>t.hostUpdated?.())),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach((t=>this._$ET(t,this[t]))),this._$EM()}updated(t){}firstUpdated(t){}}S.elementStyles=[],S.shadowRootOptions={mode:"open"},S[x("elementProperties")]=new Map,S[x("finalized")]=new Map,$?.({ReactiveElement:S}),(_.reactiveElementVersions??=[]).push("2.1.0");const M=globalThis,A=M.trustedTypes,D=A?A.createPolicy("lit-html",{createHTML:t=>t}):void 0,O="$lit$",T=`lit$${Math.random().toFixed(9).slice(2)}$`,U="?"+T,j=`<${U}>`,P=document,R=()=>P.createComment(""),B=t=>null===t||"object"!=typeof t&&"function"!=typeof t,N=Array.isArray,H="[ \t\n\f\r]",I=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,W=/-->/g,L=/>/g,z=RegExp(`>|${H}(?:([^\\s"'>=/]+)(${H}*=${H}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),F=/'/g,V=/"/g,q=/^(?:script|style|textarea|title)$/i,K=t=>(e,...i)=>({_$litType$:t,strings:e,values:i}),Y=K(1),G=(K(2),K(3),Symbol.for("lit-noChange")),J=Symbol.for("lit-nothing"),Z=new WeakMap,Q=P.createTreeWalker(P,129);function X(t,e){if(!N(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==D?D.createHTML(e):e}const tt=(t,e)=>{const i=t.length-1,n=[];let r,s=2===e?"<svg>":3===e?"<math>":"",a=I;for(let e=0;e<i;e++){const i=t[e];let o,l,c=-1,d=0;for(;d<i.length&&(a.lastIndex=d,l=a.exec(i),null!==l);)d=a.lastIndex,a===I?"!--"===l[1]?a=W:void 0!==l[1]?a=L:void 0!==l[2]?(q.test(l[2])&&(r=RegExp("</"+l[2],"g")),a=z):void 0!==l[3]&&(a=z):a===z?">"===l[0]?(a=r??I,c=-1):void 0===l[1]?c=-2:(c=a.lastIndex-l[2].length,o=l[1],a=void 0===l[3]?z:'"'===l[3]?V:F):a===V||a===F?a=z:a===W||a===L?a=I:(a=z,r=void 0);const h=a===z&&t[e+1].startsWith("/>")?" ":"";s+=a===I?i+j:c>=0?(n.push(o),i.slice(0,c)+O+i.slice(c)+T+h):i+T+(-2===c?e:h)}return[X(t,s+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),n]};class et{constructor({strings:t,_$litType$:e},i){let n;this.parts=[];let r=0,s=0;const a=t.length-1,o=this.parts,[l,c]=tt(t,e);if(this.el=et.createElement(l,i),Q.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(n=Q.nextNode())&&o.length<a;){if(1===n.nodeType){if(n.hasAttributes())for(const t of n.getAttributeNames())if(t.endsWith(O)){const e=c[s++],i=n.getAttribute(t).split(T),a=/([.?@])?(.*)/.exec(e);o.push({type:1,index:r,name:a[2],strings:i,ctor:"."===a[1]?at:"?"===a[1]?ot:"@"===a[1]?lt:st}),n.removeAttribute(t)}else t.startsWith(T)&&(o.push({type:6,index:r}),n.removeAttribute(t));if(q.test(n.tagName)){const t=n.textContent.split(T),e=t.length-1;if(e>0){n.textContent=A?A.emptyScript:"";for(let i=0;i<e;i++)n.append(t[i],R()),Q.nextNode(),o.push({type:2,index:++r});n.append(t[e],R())}}}else if(8===n.nodeType)if(n.data===U)o.push({type:2,index:r});else{let t=-1;for(;-1!==(t=n.data.indexOf(T,t+1));)o.push({type:7,index:r}),t+=T.length-1}r++}}static createElement(t,e){const i=P.createElement("template");return i.innerHTML=t,i}}function it(t,e,i=t,n){if(e===G)return e;let r=void 0!==n?i._$Co?.[n]:i._$Cl;const s=B(e)?void 0:e._$litDirective$;return r?.constructor!==s&&(r?._$AO?.(!1),void 0===s?r=void 0:(r=new s(t),r._$AT(t,i,n)),void 0!==n?(i._$Co??=[])[n]=r:i._$Cl=r),void 0!==r&&(e=it(t,r._$AS(t,e.values),r,n)),e}class nt{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,n=(t?.creationScope??P).importNode(e,!0);Q.currentNode=n;let r=Q.nextNode(),s=0,a=0,o=i[0];for(;void 0!==o;){if(s===o.index){let e;2===o.type?e=new rt(r,r.nextSibling,this,t):1===o.type?e=new o.ctor(r,o.name,o.strings,this,t):6===o.type&&(e=new ct(r,this,t)),this._$AV.push(e),o=i[++a]}s!==o?.index&&(r=Q.nextNode(),s++)}return Q.currentNode=P,n}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class rt{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,n){this.type=2,this._$AH=J,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=n,this._$Cv=n?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=it(this,t,e),B(t)?t===J||null==t||""===t?(this._$AH!==J&&this._$AR(),this._$AH=J):t!==this._$AH&&t!==G&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>N(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==J&&B(this._$AH)?this._$AA.nextSibling.data=t:this.T(P.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,n="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=et.createElement(X(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===n)this._$AH.p(e);else{const t=new nt(n,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=Z.get(t.strings);return void 0===e&&Z.set(t.strings,e=new et(t)),e}k(t){N(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,n=0;for(const r of t)n===e.length?e.push(i=new rt(this.O(R()),this.O(R()),this,this.options)):i=e[n],i._$AI(r),n++;n<e.length&&(this._$AR(i&&i._$AB.nextSibling,n),e.length=n)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t&&t!==this._$AB;){const e=t.nextSibling;t.remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class st{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,n,r){this.type=1,this._$AH=J,this._$AN=void 0,this.element=t,this.name=e,this._$AM=n,this.options=r,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=J}_$AI(t,e=this,i,n){const r=this.strings;let s=!1;if(void 0===r)t=it(this,t,e,0),s=!B(t)||t!==this._$AH&&t!==G,s&&(this._$AH=t);else{const n=t;let a,o;for(t=r[0],a=0;a<r.length-1;a++)o=it(this,n[i+a],e,a),o===G&&(o=this._$AH[a]),s||=!B(o)||o!==this._$AH[a],o===J?t=J:t!==J&&(t+=(o??"")+r[a+1]),this._$AH[a]=o}s&&!n&&this.j(t)}j(t){t===J?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class at extends st{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===J?void 0:t}}class ot extends st{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==J)}}class lt extends st{constructor(t,e,i,n,r){super(t,e,i,n,r),this.type=5}_$AI(t,e=this){if((t=it(this,t,e,0)??J)===G)return;const i=this._$AH,n=t===J&&i!==J||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,r=t!==J&&(i===J||n);n&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class ct{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){it(this,t)}}const dt=M.litHtmlPolyfillSupport;dt?.(et,rt),(M.litHtmlVersions??=[]).push("3.3.0");const ht=globalThis;class ut extends S{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const n=i?.renderBefore??e;let r=n._$litPart$;if(void 0===r){const t=i?.renderBefore??null;n._$litPart$=r=new rt(e.insertBefore(R(),t),t,void 0,i??{})}return r._$AI(t),r})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return G}}ut._$litElement$=!0,ut.finalized=!0,ht.litElementHydrateSupport?.({LitElement:ut});const ft=ht.litElementPolyfillSupport;ft?.({LitElement:ut}),(ht.litElementVersions??=[]).push("4.2.0");const gt="2025.12-0035",pt="tgshiftschedule-card",mt="TG Schichtplan Card",yt="true";function bt(t,e,i){return(e=function(t){var e=function(t){if("object"!=typeof t||!t)return t;var e=t[Symbol.toPrimitive];if(void 0!==e){var i=e.call(t,"string");if("object"!=typeof i)return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(t);return"symbol"==typeof e?e:e+""}(e))in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}class _t{constructor(t,e,i,n){this.cardName=t||this.constructor.cardName||null,this.debugMode=e||this.constructor.debugMode||"true",this.className=i||this.constructor.className||null,this.version=n||this.constructor.version||null,this.getCardInfoString=[`%c${this.cardName}%c${this.version}%c`,"background: #9c27b0; color: white; padding: 2px 6px; border-top-left-radius: 12px; border-bottom-left-radius: 12px; font-weight: bold;","background: #00bcd4; color: white; padding: 2px 6px; border-top-right-radius: 12px; border-bottom-right-radius: 12px; font-weight: bold;",""]}_debug(...t){if(!this.debugMode)return;let e=null,i=null,n=null,r=null;Array.isArray(t[0])&&1===t[0].length&&t[0][0]&&"object"==typeof t[0][0]&&t[0][0].constructor&&(t[0][0].cardName||t[0][0].constructor.className)?(r=t[0][0],t=t.slice(1)):r=this,e=r.constructor.className?r.constructor.className:r.tagName?r.tagName.toLowerCase().replace(/[^a-z0-9]/g,""):r.constructor.name&&r.constructor.name.length>2?r.constructor.name:r.cardName?r.cardName:"unknownClass",n=r.cardName||this.cardName||"unknownCard";const s=this.debugMode.split(",").map((t=>t.trim().toLowerCase()));if(!("true"===s[0].toLowerCase()?!s.slice(1).includes(e.toLowerCase()):s.includes(e.toLowerCase())))return;if(!i)try{const t=(new Error).stack.split("\n")[2],e=[/at\s+\w+\.(\w+)/,/(\w+)@/,/(\w+)\s+\(/,/at\s+(\w+)/];for(const n of e){const e=t.match(n);if(e){i=e[1];break}}}catch(t){i=null}i=i||"unknownMethod";let a=`[${n}]:[${e}]:[${i}]`;for(;a.length<50;)a+=" "}}function vt(t,e,i){return(e=function(t){var e=function(t){if("object"!=typeof t||!t)return t;var e=t[Symbol.toPrimitive];if(void 0!==e){var i=e.call(t,"string");if("object"!=typeof i)return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(t);return"symbol"==typeof e?e:e+""}(e))in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}bt(_t,"cardName",mt),bt(_t,"debugMode",yt),bt(_t,"className","TgCardHelper"),bt(_t,"version",gt);class wt extends ut{constructor(){super(),this.dM=`${this.constructor.className}: `,this.cardName=this.constructor.cardName,this.version=this.constructor.version,this.debugMode=this.constructor.debugMode,this.useDummyData=this.constructor.useDummyData,this.showVersion=this.constructor.showVersion,this.tgCardHelper=new _t(this.constructor.cardName,this.constructor.debugMode),this.getCardInfoString=this.tgCardHelper.getCardInfoString,this._debug("SuperBase-Konstruktor wird aufgerufen")}registerMeForChangeNotifys(t="",e=this){const i=`${this.dM||"?: "}registerMeForChangeNotifys() `;this._debug(`${i} Aufruf`,{eventTypes:t,that:e}),this.dispatchEvent(new CustomEvent("registerMeForChanges",{bubbles:!0,composed:!0,detail:{component:e,callback:this._handleOnChangeNotifys.bind(this),eventType:t,immediately:!0}}))}_handleOnChangeNotifys(t){const e=`${this.dM||"?: "}_handleOnChangeNotifys() `;this._debug(`${e}aufgerufen`,{eventdata:t});for(const i of Object.keys(t)){const n="_handleOnChangeNotify_"+i.charAt(0).toUpperCase()+i.slice(1);"function"==typeof this[n]?(this._debug(`${e} ${n} aufgerufen`,{eventdata:t[i]}),this[n](t[i])):this._debug(`${e} ${n} nicht gefunden`,{eventdata:t[i]})}}_debug(...t){this.tgCardHelper._debug([this],...t)}}var $t,xt,Ct,kt,Et,St,Mt,At;function Dt(t,e,i,n){var r=Ot(Tt(1&n?t.prototype:t),e,i);return 2&n&&"function"==typeof r?function(t){return r.apply(i,t)}:r}function Ot(){return Ot="undefined"!=typeof Reflect&&Reflect.get?Reflect.get.bind():function(t,e,i){var n=function(t,e){for(;!{}.hasOwnProperty.call(t,e)&&null!==(t=Tt(t)););return t}(t,e);if(n){var r=Object.getOwnPropertyDescriptor(n,e);return r.get?r.get.call(arguments.length<3?t:i):r.value}},Ot.apply(null,arguments)}function Tt(t){return Tt=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(t){return t.__proto__||Object.getPrototypeOf(t)},Tt(t)}function Ut(t,e,i){return(e=function(t){var e=function(t){if("object"!=typeof t||!t)return t;var e=t[Symbol.toPrimitive];if(void 0!==e){var i=e.call(t,"string");if("object"!=typeof i)return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(t);return"symbol"==typeof e?e:e+""}(e))in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}vt(wt,"cardName",mt),vt(wt,"version",gt),vt(wt,"debugMode",yt),vt(wt,"useDummyData","false"),vt(wt,"showVersion",!1),vt(wt,"className","SuperBase"),vt(wt,"properties",{hass:{type:Object},config:{type:Object}}),vt(wt,"styles",[h`
      :host {
        display: block;
      }
    `]);class jt extends wt{constructor(){super(),this.dM=`${this.constructor.className}: `,this._selectedTab=0,this._debug("CardBase-Modul wird geladen"),this.informAtChangesClients=[],this._registeredEventTypes=new Set,this.addEventListener("registerMeForChanges",this._onRegisterMeForChanges.bind(this))}async firstUpdated(){this._debug("CardBase firstUpdated: Start"),await super.firstUpdated(),this._debug("CardBase firstUpdated: Ende")}setConfig(t){if(this._debug("setConfig wird aufgerufen mit:",t),!t)throw new Error("Keine Konfiguration angegeben");const e=!this.config||0===Object.keys(this.config).length;this.config=e?{...this.getDefaultConfig(),...t}:{...this.config,...t},this._debug("config nach setConfig:",this.config)}getDefaultConfig(){return this._debug("getDefaultConfig wird aufgerufen"),{entity:"",numberOfMonths:14,initialDisplayedMonths:2,selectedCalendar:"a",calendars:[{shortcut:"a",name:"Kalender A",color:"#ff9800",enabled:!0,statusRelevant:!0},{shortcut:"b",name:"Kalender B",color:"#ff0000",enabled:!1,statusRelevant:!0},{shortcut:"c",name:"Kalender C",color:"#00ff00",enabled:!1,statusRelevant:!0},{shortcut:"d",name:"Kalender D",color:"#0000ff",enabled:!1,statusRelevant:!0},{shortcut:"e",name:"Kalender E",color:"#ffff00",enabled:!1,statusRelevant:!0}],holidays:{neujahr:!0,heilige_drei_koenige:!0,tag_der_arbeit:!0,friedensfest:!0,mariae_himmelfahrt:!0,tag_der_deutschen_einheit:!0,reformationstag:!0,allerheiligen:!0,weihnachten_1:!0,weihnachten_2:!0,karfreitag:!0,ostermontag:!0,christi_himmelfahrt:!0,pfingstmontag:!0,fronleichnam:!0,busstag:!0}}}render(t=""){return this._debug("render wird aufgerufen"),html`
      <ha-card>
        <div class="card-content">${t}</div>
        ${this.showVersion?html` <div class="version">Version: ${this.version}</div> `:""}
      </ha-card>
    `}_onRegisterMeForChanges(t){this._debug("Registrierungsanfrage empfangen",{component:t.target,detail:t.detail});const{component:e,callback:i,eventType:n="",immediately:r=!1}=t.detail;e&&"function"==typeof i?(this.registerInformAtChangesClients(e,n,r,i),this._debug("Komponente erfolgreich registriert",{component:e.tagName||e.constructor.name,eventType:n})):this._debug("Registrierung fehlgeschlagen",{componentExists:!!e,hasCallback:"function"==typeof i})}registerInformAtChangesClients(t,e="",i=!1,n=null){const r=`${this.dM||"?: "}registerInformAtChangesClients() `;this._debug(`${r}Anfrage`,{me:t,newEventType:e});const s=Array.isArray(e)?e.map((t=>t.toLowerCase())).sort():"string"==typeof e?e.split(",").map((t=>t.trim().toLowerCase())).filter((t=>t.length>0)).sort():[],a=this.informAtChangesClients.find((e=>e.me===t));let o=[];a&&(o=Array.isArray(a.eventType)?a.eventType.map((t=>t.toLowerCase())).sort():"string"==typeof a.eventType?a.eventType.split(",").map((t=>t.trim().toLowerCase())).filter((t=>t.length>0)).sort():[]);const l=s.filter((t=>!o.includes(t)));if(a&&0===l.length)return this._debug(`${r}Client war bereits mit allen Typen registriert`,{me:t,requestedEventTypes:s,existingEventTypes:o}),!1;if(a){const e=[...o,...l].sort();a.eventType=e,this._debug(`${r}Neue EventTypes hinzugefügt`,{me:t,newEventTypes:l,existingEventTypes:o,combinedEventTypes:e})}else this.informAtChangesClients.push({me:t,eventType:l,callback:n}),this._debug(`${r}Neuer Informer registriert`,{me:t,newEventTypes:l,totalObservers:this.informAtChangesClients.length});return l.forEach((e=>{this._registeredEventTypes.has(e)?this._debug(`${r}Listener für EventType bereits vorhanden`,{eventType:e}):(this._debug(`${r}Füge Listener für EventType hinzu`,{eventType:e}),this.addEventListener(e+"-event",this._notifyClientsAtChanges.bind(this)),this._registeredEventTypes.add(e));const n="_onRegisterMeFor_"+e.charAt(0).toUpperCase()+e.slice(1);this._debug(`${r}Registriere Komponente für EnvSniffer-Änderungen`,{fkt:n}),"function"==typeof this[n]&&this[n](i,t)})),!0}_notifyClientsAtChanges(t){this._debug("_notifyClientsAtChanges() Anfrage",{event:t});const e=t.type.replace("-event",""),i="_on"+e.charAt(0).toUpperCase()+e.slice(1);this._debug("_notifyClientsAtChanges() EventType extrahiert",{originalEventType:t.type,extractedEventType:e,clients:this.informAtChangesClients,fkt:i}),this.informAtChangesClients.forEach((n=>{if(e&&n.eventType.includes(e)&&n.me&&(n.me instanceof Element||n.me.nodeType)&&(document.contains(n.me)||n.me.isConnected)){const r="function"==typeof this[i]?this[i](n.me,t):t.detail||{},s={[e]:r};if(r&&n.callback&&"function"==typeof n.callback)try{this._debug("_notifyClientsAtChanges() Client benachrichtigen",{client:n.me.constructor.name,eventType:e,data:s}),n.callback(s)}catch(t){}}}))}}function Pt(){return Pt="undefined"!=typeof Reflect&&Reflect.get?Reflect.get.bind():function(t,e,i){var n=function(t,e){for(;!{}.hasOwnProperty.call(t,e)&&null!==(t=Rt(t)););return t}(t,e);if(n){var r=Object.getOwnPropertyDescriptor(n,e);return r.get?r.get.call(arguments.length<3?t:i):r.value}},Pt.apply(null,arguments)}function Rt(t){return Rt=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(t){return t.__proto__||Object.getPrototypeOf(t)},Rt(t)}function Bt(t,e,i){return(e=function(t){var e=function(t){if("object"!=typeof t||!t)return t;var e=t[Symbol.toPrimitive];if(void 0!==e){var i=e.call(t,"string");if("object"!=typeof i)return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(t);return"symbol"==typeof e?e:e+""}(e))in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}$t=jt,Ut(jt,"className","CardBase"),Ut(jt,"properties",{...Dt($t,"properties",$t),_selectedTab:{type:Number}}),Ut(jt,"styles",[Dt($t,"styles",$t),h`
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
    `]);class Nt extends wt{constructor(){super(),this._debug("ViewBase-Konstruktor: Start"),this.config={},this.epgData=[],this._loading=!1,this._error=null,this._debug("ViewBase-Konstruktor: Initialisierung abgeschlossen")}async firstUpdated(){this._debug("ViewBase firstUpdated: Start"),await super.firstUpdated(),this._debug("ViewBase firstUpdated: Ende")}async _loadData(){if(this._debug("ViewBase _loadData wird aufgerufen"),this._dataProvider&&this.config.entity){this._loading=!0,this._error=null;try{this._debug("Starte _fetchViewData mit Konfiguration:",this.config);const t=await this._fetchViewData(this.config);this.epgData=t,this._debug("_fetchViewData erfolgreich:",t)}catch(t){this._error=t,this._debug("Fehler in _fetchViewData:",t)}finally{this._loading=!1}}else this._debug("ViewBase _loadData: Übersprungen - dataProvider oder entity fehlt",{dataProvider:!!this._dataProvider,entity:this.config.entity,config:this.config})}async _fetchViewData(t){throw new Error("_fetchViewData muss in der abgeleiteten Klasse implementiert werden")}render(){return this._loading?this._renderLoading():this._error?this._renderError():this._renderContent()}_renderLoading(){return html`<div class="loading">Lade Daten...</div>`}_renderError(){return html`<div class="error">${this._error}</div>`}_renderContent(){return html`<div>Keine Daten verfügbar</div>`}}function Ht(){return Ht="undefined"!=typeof Reflect&&Reflect.get?Reflect.get.bind():function(t,e,i){var n=function(t,e){for(;!{}.hasOwnProperty.call(t,e)&&null!==(t=It(t)););return t}(t,e);if(n){var r=Object.getOwnPropertyDescriptor(n,e);return r.get?r.get.call(arguments.length<3?t:i):r.value}},Ht.apply(null,arguments)}function It(t){return It=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(t){return t.__proto__||Object.getPrototypeOf(t)},It(t)}function Wt(t,e,i){return(e=function(t){var e=function(t){if("object"!=typeof t||!t)return t;var e=t[Symbol.toPrimitive];if(void 0!==e){var i=e.call(t,"string");if("object"!=typeof i)return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(t);return"symbol"==typeof e?e:e+""}(e))in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}xt=Nt,Bt(Nt,"className","ViewBase"),Bt(Nt,"properties",{config:{type:Object},epgData:{type:Array},_loading:{type:Boolean},_error:{type:Object}}),Bt(Nt,"styles",[function(t,e,i){var n=Pt(Rt(t),"styles",i);return n}(xt,0,xt),h`
      :host {
        display: block;
      }
    `]);class Lt extends Nt{static get properties(){return{...super.properties,hass:{type:Object},config:{type:Object},lovelace:{type:Object},_workingDays:{type:Object},_storageWarning:{type:Object},_configWarning:{type:Object},_statusWarning:{type:Object},_displayedMonths:{type:Number},_startMonthOffset:{type:Number},_selectedCalendar:{type:String}}}constructor(){super(),this._workingDays={},this._storageWarning=null,this._configWarning=null,this._statusWarning=null,this._knownEntityIds=null,this._cleanupDone=!1,this._displayedMonths=2,this._startMonthOffset=0,this._isWriting=!1,this._writeLockTimer=null,this._selectedCalendar=null,this._holidayCache={},this._cachedHolidayEntities=null,this._editorModeCache=null,this._editorModeCacheTime=0,this._saveDebounceTimer=null}formatTwoDigits(t){return String(t).padStart(2,"0")}_isInEditorMode(){const t=Date.now();if(null!==this._editorModeCache&&t-this._editorModeCacheTime<5e3)return this._editorModeCache;let e=!1;if("undefined"!=typeof window&&window.location&&"1"===new URLSearchParams(window.location.search).get("edit")&&(e=!0),e||!0===this.lovelace?.editMode&&(e=!0),e||"undefined"==typeof document||document.querySelector("hui-dialog-edit-card")&&(e=!0),!e){let t=this,i=0;const n=20;for(;t&&i<n;){if("hui-dialog-edit-card"===t.tagName?.toLowerCase()){e=!0;break}if(t.classList?.contains("card-editor")||t.classList?.contains("hui-card-editor")||t.classList?.contains("edit-mode")||t.classList?.contains("hui-card-config-editor")||"true"===t.getAttribute?.("data-card-editor")||t.tagName?.toLowerCase().includes("editor")||"hui-card-element-editor"===t.tagName?.toLowerCase()){e=!0;break}if(t.id&&(t.id.includes("editor")||t.id.includes("config"))){e=!0;break}if(t.hasAttribute&&(t.hasAttribute("data-card-editor")||t.hasAttribute("data-editor"))){e=!0;break}t=t.parentElement||t.parentNode,i++}}if(!e){const t=this.getRootNode();if(t&&t!==document){const i=t.host;i&&("hui-dialog-edit-card"===i.tagName?.toLowerCase()||i.classList?.contains("card-editor")||i.classList?.contains("hui-card-editor")||i.classList?.contains("edit-mode")||i.classList?.contains("hui-card-config-editor")||"hui-card-element-editor"===i.tagName?.toLowerCase())&&(e=!0)}}if(!e&&"undefined"!=typeof window&&window.location){const t=window.location.href||window.location.pathname;t&&(t.includes("/config/lovelace/dashboards")||t.includes("/editor"))&&(e=!0)}return this._editorModeCache=e,this._editorModeCacheTime=t,e}_getContrastColor(t){if(!t)return"#000000";const e=t.replace("#","");return(.299*parseInt(e.substr(0,2),16)+.587*parseInt(e.substr(2,2),16)+.114*parseInt(e.substr(4,2),16))/255>.5?"#000000":"#ffffff"}_getEasterDate(t){const e=t%19,i=Math.floor(t/100),n=t%100,r=Math.floor(i/4),s=i%4,a=Math.floor((i+8)/25),o=(19*e+i-r-Math.floor((i-a+1)/3)+15)%30,l=(32+2*s+2*Math.floor(n/4)-o-n%4)%7,c=Math.floor((e+11*o+22*l)/451),d=Math.floor((o+l-7*c+114)/31);return new Date(t,d-1,(o+l-7*c+114)%31+1)}_isHoliday(t,e,i){const n=`${t}-${String(e+1).padStart(2,"0")}`;if(this._holidayCache[n]&&void 0!==this._holidayCache[n][i])return this._holidayCache[n][i];this._holidayCache[n]||(this._holidayCache[n]={});let r=!1;if(this._hass&&this._hass.states){this._cachedHolidayEntities||(this._cachedHolidayEntities=Object.keys(this._hass.states).filter((t=>t.startsWith("sensor.")&&(t.includes("holiday")||t.includes("feiertag"))&&"on"===this._hass.states[t].state)));const n=this._cachedHolidayEntities;if(n.length>0)for(const s of n){const n=this._hass.states[s];if(n&&n.attributes){const s=`${t}-${String(e+1).padStart(2,"0")}-${String(i).padStart(2,"0")}`,a=`${String(i).padStart(2,"0")}.${String(e+1).padStart(2,"0")}.${t}`,o=["dates","holidays","feiertage","date","next_date","upcoming"];for(const t of o)if(n.attributes[t]){const e=n.attributes[t];if(Array.isArray(e)){if(e.some((t=>t===s||t===a||t.includes(s)||t.includes(a)))){r=!0;break}}else if("string"==typeof e&&(e.includes(s)||e.includes(a))){r=!0;break}}}}}const s=this.config?.holidays||{},a=t=>!1!==s[t],o=this._getEasterDate(t),l=[{month:0,day:1,key:"neujahr"},{month:0,day:6,key:"heilige_drei_koenige"},{month:4,day:1,key:"tag_der_arbeit"},{month:7,day:8,key:"friedensfest"},{month:7,day:15,key:"mariae_himmelfahrt"},{month:9,day:3,key:"tag_der_deutschen_einheit"},{month:9,day:31,key:"reformationstag"},{month:10,day:1,key:"allerheiligen"},{month:11,day:25,key:"weihnachten_1"},{month:11,day:26,key:"weihnachten_2"}];if(!r)for(const t of l)if(e===t.month&&i===t.day&&a(t.key)){r=!0;break}if(!r){const n=o.getTime(),s=864e5,l=new Date(t,10,23).getDay(),c=new Date(t,10,23-(l<=3?3-l:l+7-3)),d=[{date:new Date(n-2*s),key:"karfreitag"},{date:new Date(n+1*s),key:"ostermontag"},{date:new Date(n+39*s),key:"christi_himmelfahrt"},{date:new Date(n+50*s),key:"pfingstmontag"},{date:new Date(n+60*s),key:"fronleichnam"},{date:c,key:"busstag"}];for(const n of d)if(n.date.getFullYear()===t&&n.date.getMonth()===e&&n.date.getDate()===i&&a(n.key)){r=!0;break}}return this._holidayCache[n][i]=r,r}_isWeekend(t,e,i){const n=new Date(t,e,i).getDay();return 0===n||6===n}set hass(t){if(this._isWriting)return this._hass=t,void this.requestUpdate();const e=this._hass?.states[this._config?.entity]?.state,i=t?.states[this._config?.entity]?.state;let n=e!==i;if(!n&&this._config&&this._knownEntityIds)for(let e=1;e<this._knownEntityIds.length;e++){const i=this._knownEntityIds[e],r=this._hass?.states[i]?.state,s=t?.states[i]?.state;if(r!==s){n=!0;break}}this._hass=t,this._cachedHolidayEntities=null,this._config&&(n&&this.loadWorkingDays(),this.checkConfigEntity(),this.checkStatusEntity()),this.requestUpdate()}set config(t){if(this._config=t,t&&t.initialDisplayedMonths){const e=t.numberOfMonths||14;this._displayedMonths=Math.min(t.initialDisplayedMonths,e)}else t&&t.numberOfMonths&&!this._displayedMonths?this._displayedMonths=t.numberOfMonths:t&&t.numberOfMonths&&(this._displayedMonths=Math.min(this._displayedMonths||2,t.numberOfMonths));this._config=t;const e=this._getAllCalendars();t&&t.selectedCalendar?e.some((e=>e.shortcut===t.selectedCalendar))?this._selectedCalendar=t.selectedCalendar:e.length>0||e.length>0?(this._selectedCalendar=e[0].shortcut,t&&(t.selectedCalendar=this._selectedCalendar,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0})))):(this._selectedCalendar=null,t&&(t.selectedCalendar=null)):e.length>0?(this._selectedCalendar=e[0].shortcut,t&&(t.selectedCalendar=this._selectedCalendar,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:t},bubbles:!0,composed:!0})))):(this._selectedCalendar=null,t&&(t.selectedCalendar=null)),this._hass&&(this.loadWorkingDays(),this.checkConfigEntity(),this.checkStatusEntity(),this.saveConfigToEntity()),this.requestUpdate()}async loadWorkingDays(){if(!this._hass||!this._config||!this._config.entity)return;const t=this.getAllEntityMaxLengths(),e=[],i=this._config.entity,n=this.findAdditionalEntities(i);this._knownEntityIds=[i,...n];for(const i of this._knownEntityIds){const n=this._hass.states[i];n&&n.state&&""!==n.state.trim()&&(e.push(n.state),n.state.length,t[i])}if(this._knownEntityIds&&this._knownEntityIds.slice(1),e.length>0){const t=e.join(";");this.parseWorkingDays(t)}else this._workingDays={};if(this.checkStorageUsage(),Object.keys(this._workingDays).length>0&&!this._cleanupDone){this._cleanupDone=!0;const t=this._config.numberOfMonths||2,e=new Date,i=e.getMonth()+1,n=e.getFullYear();let r,s;1===i?(r=12,s=(n-1)%100):(r=i-1,s=n%100);const a=[];a.push({year:s,month:r});for(let e=0;e<t;e++){const t=new Date(n,i-1+e,1),r=t.getFullYear()%100,s=t.getMonth()+1;a.push({year:r,month:s})}let o=!1;for(const t of Object.keys(this._workingDays)){const e=t.split(":");if(2===e.length){const i=parseInt(e[0]),n=parseInt(e[1]),r=a.some((t=>t.year===i&&t.month===n));r||(delete this._workingDays[t],o=!0)}else delete this._workingDays[t],o=!0}if(o){const t=this.serializeWorkingDays();try{await this._hass.callService("input_text","set_value",{entity_id:this._config.entity,value:t})}catch(t){}}}this.requestUpdate()}_parseWorkingDaysIntoObject(t,e){if(!t||""===t.trim())return;const i=t.split(";").filter((t=>""!==t.trim()));for(const t of i){const i=t.trim();if(!i)continue;const n=i.split(":");if(2===n.length){const t=n[0].trim(),i=n[1].trim();if(t&&i){const n=parseInt(t);if(!isNaN(n)&&n>=1&&n<=12){const t=(new Date).getFullYear()%100;e[`${this.formatTwoDigits(t)}:${this.formatTwoDigits(n)}`]=this._parseDaysWithElements(i)}}}else if(n.length>=3){const t=parseInt(n[0].trim()),i=parseInt(n[1].trim());if(t<=12&&i>12){const r=t,s=i,a=n.slice(2).join(":");a&&r>=1&&r<=12&&!isNaN(s)&&(e[`${this.formatTwoDigits(s)}:${this.formatTwoDigits(r)}`]=this._parseDaysWithElements(a))}else if(t>12&&i<=12){const r=t,s=i,a=n.slice(2).join(":");a&&s>=1&&s<=12&&!isNaN(r)&&(e[`${this.formatTwoDigits(r)}:${this.formatTwoDigits(s)}`]=this._parseDaysWithElements(a))}}}}_parseDaysWithElements(t){const e={},i=t.split(",").filter((t=>""!==t.trim()));for(const t of i){const i=t.trim();if(!i)continue;const n=i.match(/^(\d+)([a-z]*)$/i);if(n){const t=parseInt(n[1]),i=(n[2]||"").split("").filter((t=>""!==t.trim()));!isNaN(t)&&t>=1&&t<=31&&(e[t]?e[t]=[...new Set([...e[t],...i])]:e[t]=i)}}return e}parseWorkingDays(t){this._workingDays={},this._parseWorkingDaysIntoObject(t,this._workingDays)}findAdditionalEntities(t){const e=[];if(!this._hass||!this._hass.states)return e;const i=t.split(".");if(2!==i.length)return e;const[n,r]=i;for(let t=1;t<=999;t++){const i=`${n}.${r}_${String(t).padStart(3,"0")}`;if(!this._hass.states[i])break;e.push(i)}return e}getEntityMaxLength(t){if(!this._hass||!this._hass.states||!t)return null;const e=this._hass.states[t];if(!e||!e.attributes)return null;const i=e.attributes.max;return null!=i?parseInt(i):null}getAllEntityMaxLengths(){const t={};if(!this._hass||!this._config||!this._config.entity)return t;const e=this._config.entity,i=this.getEntityMaxLength(e);null!==i&&(t[e]=i);const n=this.findAdditionalEntities(e);for(const e of n){const i=this.getEntityMaxLength(e);null!==i&&(t[e]=i)}return t}checkStorageUsage(t=null){if(!this._hass||!this._config||!this._config.entity)return this._storageWarning=null,void this.requestUpdate();let e;e=this._knownEntityIds&&this._knownEntityIds.length>0?[...this._knownEntityIds]:[this._config.entity,...this.findAdditionalEntities(this._config.entity)];const i=this.getAllEntityMaxLengths();if(0===Object.keys(i).length)return this._storageWarning=null,void this.requestUpdate();let n=0,r=0;if(null!=t)n=t;else for(const t of e){const e=this._hass.states[t];e&&e.state&&(n+=e.state.length)}for(const t of e){const e=i[t];null!=e&&(r+=e)}if(0===r)return this._storageWarning=null,void this.requestUpdate();const s=n/r*100;this._storageWarning=s>=90?{show:!0,currentLength:n,maxLength:r,percentage:Math.round(10*s)/10}:null,this.requestUpdate()}getConfigEntityId(){return this._config&&this._config.entity?this._config.entity+"_config":null}getStatusEntityId(){return this._config&&this._config.entity?this._config.entity+"_status":null}checkConfigEntity(){if(!this._config||!this._config.entity)return this._configWarning=null,void this.requestUpdate();const t=this.getConfigEntityId();return t?this._hass?(this._hass.states[t]?this._configWarning&&"size"===this._configWarning.type||(this._configWarning=null):this._configWarning={show:!0,type:"missing",configEntityId:t},void this.requestUpdate()):(this._isInEditorMode()?this._configWarning={show:!0,type:"missing",configEntityId:t}:this._configWarning=null,void this.requestUpdate()):(this._configWarning=null,void this.requestUpdate())}_renderMissingEntityWarning(t,e,i=255,n=!1){const r=t.replace("input_text.","");return Y`
      <div class="storage-warning">
        <div class="warning-icon">⚠️</div>
        <div class="warning-content">
          <div class="warning-title">${e} fehlt!</div>
          <div class="warning-message">
            Die Entity <code>${t}</code> wurde nicht gefunden.
          </div>
          <div class="warning-action">
            Bitte legen Sie diese Entity über die UI an:
            <ul>
              <li>Einstellungen → Automatisierungen &amp; Szenen → Hilfsmittel</li>
              <li>Hinzufügen → Text</li>
              <li>Name: <code>${r}</code></li>
              <li>Maximale Länge: <code>${i}</code> Zeichen</li>
            </ul>
          </div>
        </div>
      </div>
    `}checkStatusEntity(){if(!this._config||!this._config.entity)return this._statusWarning=null,void this.requestUpdate();const t=this.getStatusEntityId();if(!t)return this._statusWarning=null,void this.requestUpdate();if(!this._hass)return this._isInEditorMode()?this._statusWarning={show:!0,type:"missing",statusEntityId:t}:this._statusWarning=null,void this.requestUpdate();const e=this._hass.states[t];this._statusWarning=e?null:{show:!0,type:"missing",statusEntityId:t},this.requestUpdate()}async saveConfigToEntity(){if(!this._hass||!this._config||!this._config.entity)return;const t=this.getConfigEntityId();if(!t)return;if(!this._hass.states[t])return void this.checkConfigEntity();const e=[];if(this._config.calendars)for(const t of this._config.calendars)if(t&&t.shortcut&&(!0===t.enabled||"true"===t.enabled||1===t.enabled)){const i=[t.shortcut,t.name||`Schicht ${t.shortcut.toUpperCase()}`];if(t.timeRanges&&Array.isArray(t.timeRanges)){const e=t.timeRanges[0];if(e&&Array.isArray(e)&&e.length>=2){const t=e[0]&&""!==e[0].trim()?e[0].trim():null,n=e[1]&&""!==e[1].trim()?e[1].trim():null;t&&n?i.push(t,n):i.push(null,null)}else i.push(null,null);const n=t.timeRanges[1];if(n&&Array.isArray(n)&&n.length>=2){const t=n[0]&&""!==n[0].trim()?n[0].trim():null,e=n[1]&&""!==n[1].trim()?n[1].trim():null;t&&e?i.push(t,e):i.push(null,null)}else i.push(null,null)}else i.push(null,null,null,null);const n=!1!==t.statusRelevant?1:0;i.push(n),e.push(i)}let i,n=JSON.stringify(e);n.startsWith("[")&&n.endsWith("]")&&(n=n.slice(1,-1));do{i=n.length,n=n.replace(/,null,/g,",,"),n=n.replace(/,null\]/g,",]"),n=n.replace(/\[null,/g,"[,"),n=n.replace(/,null$/g,",")}while(n.length!==i);n=n.replace(/","/g,","),n=n.replace(/\["/g,"["),n=n.replace(/"\]/g,"]"),n=n.replace(/,"/g,","),n=n.replace(/",/g,",");const r=n.length,s=this.getEntityMaxLength(t);if(null!==s&&r>s){const e=r/s*100;return this._configWarning={show:!0,type:"size",configEntityId:t,currentLength:r,maxLength:s,percentage:Math.round(10*e)/10},void this.requestUpdate()}try{await this._hass.callService("input_text","set_value",{entity_id:t,value:n}),this._configWarning=null,this.requestUpdate()}catch(t){this.checkConfigEntity()}}serializeWorkingDays(){const t=[],e=Object.keys(this._workingDays).sort(((t,e)=>{const[i,n]=t.split(":").map((t=>parseInt(t))),[r,s]=e.split(":").map((t=>parseInt(t)));return i!==r?i-r:n-s}));for(const i of e){const e=this._workingDays[i];if(!e||"object"!=typeof e||Array.isArray(e))continue;const n=Object.keys(e).map((t=>parseInt(t))).filter((t=>!isNaN(t))).sort(((t,e)=>t-e));if(n.length>0){const r=n.map((t=>{const i=e[t],n=this.formatTwoDigits(t);return Array.isArray(i)&&i.length>0?n+[...i].sort().join(""):n})).join(",");t.push(`${i}:${r}`)}}return t.join(";")}async distributeDataToEntities(t){if(this._hass&&this._config&&this._config.entity){this._isWriting=!0,this._writeLockTimer&&(clearTimeout(this._writeLockTimer),this._writeLockTimer=null);try{let e;if(this._knownEntityIds&&this._knownEntityIds.length>0){e=[...this._knownEntityIds];const t=this.findAdditionalEntities(this._config.entity),i=this._knownEntityIds.length-1;if(t.length>i){const n=t.slice(i);e.push(...n),this._knownEntityIds=[...e]}}else{e=[this._config.entity];const t=this.findAdditionalEntities(this._config.entity);e.push(...t),this._knownEntityIds=[...e]}const i={};let n=0;for(const t of e){const e=this.getEntityMaxLength(t);null!==e?(i[t]=e,n+=e):(i[t]=255,n+=255)}if(t&&t.length,!t||""===t.trim()){for(const t of e)try{await this._hass.callService("input_text","set_value",{entity_id:t,value:""})}catch(t){}return void(this._writeLockTimer=setTimeout((()=>{this._isWriting=!1,this._writeLockTimer=null}),5e3))}const r={};let s=0,a=t;for(;a.length>0&&s<e.length;){const t=e[s],n=i[t],o=Math.min(a.length,n),l=a.substring(0,o);r[t]=l,a=a.substring(o),a.length>0&&s++}if(a.length>0){const t=this.findAdditionalEntities(this._config.entity),n=this._knownEntityIds?this._knownEntityIds.length-1:0;if(t.length>n){const o=t.slice(n);e.push(...o),this._knownEntityIds=[...e];for(const t of o){const e=this.getEntityMaxLength(t);i[t]=null!==e?e:255}for(s=e.length-o.length;a.length>0&&s<e.length;){const t=e[s],n=i[t],o=Math.min(a.length,n),l=a.substring(0,o);r[t]=l,a=a.substring(o),a.length>0&&s++}}}for(const t of e){const e=r[t]||"",n=i[t];if(e.length>n){const i=e.substring(0,n);try{await this._hass.callService("input_text","set_value",{entity_id:t,value:i})}catch(t){}}else try{await this._hass.callService("input_text","set_value",{entity_id:t,value:e})}catch(t){}}const o=this.findAdditionalEntities(this._config.entity);for(const t of o)if(!(t in r))try{await this._hass.callService("input_text","set_value",{entity_id:t,value:""})}catch(t){}a.length}catch(t){}finally{this._writeLockTimer=setTimeout((()=>{this._isWriting=!1,this._writeLockTimer=null}),5e3)}}}async toggleDay(t,e,i=null){const n=parseInt(t),r=parseInt(e);if(isNaN(n)||isNaN(r))return;const s=new Date,a=s.getMonth()+1,o=s.getFullYear(),l=o%100;i||(i=l);const c=parseInt(i);let d=!1;if(d=1===a?12===n&&c===(o-1)%100:n===a-1&&c===l,d)return;if(!this._hass||!this._config||!this._config.entity)return;const h=`${this.formatTwoDigits(c)}:${this.formatTwoDigits(n)}`;this._workingDays[h]&&!Array.isArray(this._workingDays[h])||(this._workingDays[h]={});const u=this._getSelectedCalendarShortcut();if(!u)return;this._workingDays[h][r]||(this._workingDays[h][r]=[]);const f=[...this._workingDays[h][r]||[]],g=f.indexOf(u);g>-1?(f.splice(g,1),0===f.length?(delete this._workingDays[h][r],0===Object.keys(this._workingDays[h]).length&&delete this._workingDays[h]):this._workingDays[h][r]=f):f.includes(u)||(f.push(u),this._workingDays[h][r]=f),this._updateDayButtonDirectly(n,r,c,h,f),this._scheduleDebouncedSave()}_scheduleDebouncedSave(){const t=this._getSaveDebounceTime();0!==t?(this._saveDebounceTimer&&(clearTimeout(this._saveDebounceTimer),this._saveDebounceTimer=null),this._saveDebounceTimer=setTimeout((()=>{this._saveDebounceTimer=null,this._saveToHA()}),t)):this._saveToHA()}async _saveToHA(){try{const t=this.serializeWorkingDays();await this.distributeDataToEntities(t),this.checkStorageUsage(t.length)}catch(t){console.error("[TG Schichtplan] Fehler beim Speichern:",t)}}_getSaveDebounceTime(){return this._config&&"number"==typeof this._config.saveDebounceTime?Math.max(0,this._config.saveDebounceTime):300}_updateDayButtonDirectly(t,e,i,n,r){if(!this.shadowRoot)return void this.requestUpdate();const s=this.shadowRoot.querySelector(`button[data-month="${t}"][data-day="${e}"][data-year="${i}"]`);if(!s)return void this.requestUpdate();const a=this._getSelectedCalendarShortcut(),o=a&&r.includes(a),l=this._getCalendarByShortcut(a);let c=null;const d=["a","b","c","d","e"];for(const t of d)if(r.includes(t)){const e=this._getCalendarByShortcut(t);if(e&&e.enabled){c=t;break}}let h=null;if(o&&l&&l.enabled?h=a:c&&(h=c),null!==h?s.classList.add("working"):s.classList.remove("working"),h){const t=this._getCalendarByShortcut(h);t&&t.color?s.style.backgroundColor=t.color:s.style.backgroundColor=""}else s.style.backgroundColor="";const u=s.querySelector(".shifts-container");u&&Array.from(u.querySelectorAll(".shift-indicator")),u&&(u.innerHTML="");const f=r.filter((t=>t!==h)).map((t=>{const e=this._getCalendarByShortcut(t);if(e&&e.enabled&&e.color){const i=document.createElement("span");return i.className="shift-indicator",i.style.backgroundColor=e.color,i.title=e.name||`Schicht ${t.toUpperCase()}`,i}return null})).filter((t=>null!==t));if(f.length>0)if(u)f.forEach((t=>u.appendChild(t)));else{const t=document.createElement("div");t.className="shifts-container",s.appendChild(t),f.forEach((e=>t.appendChild(e)))}else u&&u.remove()}getDaysInMonth(t,e){return new Date(t,e+1,0).getDate()}getFirstDayOfMonth(t,e){return new Date(t,e,1).getDay()}getWeekNumber(t){const e=new Date(Date.UTC(t.getFullYear(),t.getMonth(),t.getDate())),i=e.getUTCDay()||7;e.setUTCDate(e.getUTCDate()+4-i);const n=new Date(Date.UTC(e.getUTCFullYear(),0,1));return Math.ceil(((e-n)/864e5+1)/7)}getMonthName(t){return["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"][t]}renderDay(t,e,i,n,r,s,a,o){const l=new Date,c=l.getDate(),d=l.getMonth(),h=l.getFullYear(),u=this._getDayElements(n,t),f=a===h&&o===d&&t===c,g=this._getSelectedCalendarShortcut(),p=g&&u.includes(g),m=this._getCalendarByShortcut(g);let y="",b=null;const _=["a","b","c","d","e"];for(const t of _)if(u.includes(t)){const e=this._getCalendarByShortcut(t);if(e&&e.enabled){b=t;break}}let v=null;p&&m&&m.enabled?v=g:b&&(v=b);const w=null!==v;if(v){const t=this._getCalendarByShortcut(v);t&&t.color&&(y=`background-color: ${t.color};`)}const $=this._isWeekend(a,o,t),x=this._isHoliday(a,o,t),C=u.filter((t=>t!==v)).map((t=>{const e=this._getCalendarByShortcut(t);return e&&e.enabled&&e.color?Y`
                <span
                  class="shift-indicator"
                  style="background-color: ${e.color};"
                  title="${e.name||`Schicht ${t.toUpperCase()}`}">
                </span>
              `:null})).filter((t=>null!==t));return Y`
      <td>
        <button
          class="day-button ${w?"working":""} ${f?"today":""} ${s?"readonly":""} ${$?"weekend":""} ${x?"holiday":""}"
          style="${y}"
          @click=${n=>{s||(this.toggleDay(e,t,i),setTimeout((()=>{if(n.target.blur(),this.shadowRoot){const t=this.shadowRoot.querySelector(".calendar-wrapper");t?(t.hasAttribute("tabindex")||t.setAttribute("tabindex","-1"),t.focus()):this.focus&&this.focus()}}),0))}}
          ?disabled=${s}
          data-month="${e}"
          data-day="${t}"
          data-year="${i}">
          <span class="day-number">${t}</span>
          ${C.length>0?Y`<div class="shifts-container">${C}</div>`:""}
        </button>
      </td>
    `}renderMonth(t,e){const i=this.getDaysInMonth(t,e),n=(this.getFirstDayOfMonth(t,e)+6)%7,r=e+1,s=t%100,a=`${this.formatTwoDigits(s)}:${this.formatTwoDigits(r)}`;let o=[];this._workingDays[a]&&(Array.isArray(this._workingDays[a])?o=this._workingDays[a].map((t=>parseInt(t))).filter((t=>!isNaN(t))):"object"==typeof this._workingDays[a]&&(o=Object.keys(this._workingDays[a]).map((t=>parseInt(t))).filter((t=>!isNaN(t)))));const l=new Date,c=(l.getDate(),l.getMonth()),d=l.getFullYear();let h=!1;h=0===c?11===e&&t===d-1:e===c-1&&t===d;const u=[];let f=1;const g=new Date(t,e,1),p=this.getWeekNumber(g),m=[Y`<td class="week-label">${p}</td>`];for(let t=0;t<n;t++)m.push(Y`<td></td>`);for(let l=n;l<7&&f<=i;l++)m.push(this.renderDay(f,r,s,a,o,h,t,e)),f++;for(u.push(Y`<tr>${m}</tr>`);f<=i;){const n=new Date(t,e,f),l=this.getWeekNumber(n),c=[Y`<td class="week-label">${l}</td>`];for(let n=0;n<7;n++)f<=i?(c.push(this.renderDay(f,r,s,a,o,h,t,e)),f++):c.push(Y`<td></td>`);u.push(Y`<tr>${c}</tr>`)}return Y`
      <div class="month-container">
        <div class="month-header">${this.getMonthName(e)} ${t}</div>
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
    `}changeDisplayedMonths(t){const e=this._config?.numberOfMonths||14,i=Math.max(1,Math.min(e,(this._displayedMonths||2)+t));i!==this._displayedMonths&&(this._displayedMonths=i,this.requestUpdate())}changeStartMonth(t){const e=this._config?.numberOfMonths||14,i=this._displayedMonths||2,n=this._startMonthOffset||0,r=e-i,s=Math.max(-1,Math.min(r,n+t));s!==n&&(this._startMonthOffset=s,this.requestUpdate())}getNavigationBounds(){const t=this._config?.numberOfMonths||14,e=this._displayedMonths||2,i=this._startMonthOffset||0;return{canGoBack:i>-1,canGoForward:i<t-e}}_getSelectedCalendarShortcut(){if(null!==this._selectedCalendar&&void 0!==this._selectedCalendar&&""!==this._selectedCalendar)return this._selectedCalendar;if(this._config?.selectedCalendar)return this._selectedCalendar=this._config.selectedCalendar,this._selectedCalendar;const t=this._getAllCalendars();return t.length>0?t[0].shortcut:null}_getCalendarByShortcut(t){return this._config?.calendars&&this._config.calendars.find((e=>e.shortcut===t))||null}_getAllCalendars(){return this._config?.calendars?this._config.calendars.filter((t=>t&&t.shortcut&&(!0===t.enabled||"true"===t.enabled||1===t.enabled))).sort(((t,e)=>t.shortcut.localeCompare(e.shortcut))):[]}_getSelectedCalendarValue(){const t=this._getAllCalendars();return 0===t.length?(null!==this._selectedCalendar&&(this._selectedCalendar=null,this._config&&(this._config.selectedCalendar=null),this.requestUpdate()),null):null===this._selectedCalendar||void 0===this._selectedCalendar?(this._selectedCalendar=t[0].shortcut,this._config&&(this._config.selectedCalendar=this._selectedCalendar),this.requestUpdate(),this._selectedCalendar):(t.some((t=>t.shortcut===this._selectedCalendar))||(this._selectedCalendar=t[0].shortcut,this._config&&(this._config.selectedCalendar=this._selectedCalendar),this.requestUpdate()),this._selectedCalendar)}_onCalendarSelectedByIndex(t){if(""!==t&&null!=t){const e=this._selectedCalendar;this._selectedCalendar=t,this._config&&(this._config={...this._config,selectedCalendar:t},this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:!0,composed:!0})),this.saveConfigToEntity()),this.shadowRoot&&e!==t?this._updateAllDayButtonsForCalendarChange():this.requestUpdate()}}_updateAllDayButtonsForCalendarChange(){if(!this.shadowRoot)return;const t=this.shadowRoot.querySelectorAll("button.day-button"),e=this._getSelectedCalendarShortcut(),i=this._getCalendarByShortcut(e);t.forEach((t=>{const n=t.getAttribute("data-month"),r=parseInt(t.getAttribute("data-day")),s=t.getAttribute("data-year");if(!n||!r||!s)return;const a=`${s}:${n}`,o=this._getDayElements(a,r),l=e&&o.includes(e);let c=null;const d=["a","b","c","d","e"];for(const t of d)if(o.includes(t)){const e=this._getCalendarByShortcut(t);if(e&&e.enabled){c=t;break}}let h=null;if(l&&i&&i.enabled?h=e:c&&(h=c),null!==h?t.classList.add("working"):t.classList.remove("working"),h){const e=this._getCalendarByShortcut(h);e&&e.color?t.style.backgroundColor=e.color:t.style.backgroundColor=""}else t.style.backgroundColor="";const u=t.querySelector(".shifts-container");u&&(u.innerHTML="");const f=o.filter((t=>t!==h)).map((t=>{const e=this._getCalendarByShortcut(t);if(e&&e.enabled&&e.color){const i=document.createElement("span");return i.className="shift-indicator",i.style.backgroundColor=e.color,i.title=e.name||`Schicht ${t.toUpperCase()}`,i}return null})).filter((t=>null!==t));if(f.length>0)if(u)f.forEach((t=>u.appendChild(t)));else{const e=document.createElement("div");e.className="shifts-container",t.appendChild(e),f.forEach((t=>e.appendChild(t)))}else u&&u.remove()}))}_getDayElements(t,e){return this._workingDays[t]&&"object"==typeof this._workingDays[t]?Array.isArray(this._workingDays[t])?[]:this._workingDays[t][e]||[]:[]}shouldUpdate(t){return["hass","config","_workingDays","_displayedMonths","_startMonthOffset","_selectedCalendar","_storageWarning","_configWarning","_statusWarning"].some((e=>t.has(e)))}render(){if(!this._config||!this._config.entity)return Y`<div class="error">Keine Entity konfiguriert</div>`;const t=this._config.numberOfMonths||14,e=this._displayedMonths||2,i=this._startMonthOffset||0,n=new Date,r=[];for(let t=0;t<e;t++){const e=new Date(n.getFullYear(),n.getMonth()+i+t,1),s=e.getFullYear(),a=e.getMonth();r.push({year:s,month:a})}const s=this._isInEditorMode(),a=this._storageWarning&&this._storageWarning.show,o=this._configWarning&&this._configWarning.show&&("size"===this._configWarning.type||"missing"===this._configWarning.type&&s),l=this._statusWarning&&this._statusWarning.show&&s,c=this.getNavigationBounds();return Y`
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
        ${o&&"size"===this._configWarning.type?Y`
              <div class="storage-warning">
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
                      <li>Entity <code>${this._configWarning.configEntityId.replace("input_text.","")}</code> bearbeiten</li>
                      <li>Maximale Länge auf mindestens <code>${Math.ceil(1.2*this._configWarning.currentLength)}</code> Zeichen erhöhen</li>
                    </ul>
                  </div>
                </div>
              </div>
            `:""}
        ${o&&"missing"===this._configWarning.type?this._renderMissingEntityWarning(this._configWarning.configEntityId,"Konfigurations-Entity",255,!0):""}
        ${l?this._renderMissingEntityWarning(this._statusWarning.statusEntityId,"Status-Entity",255,!1):""}
        <div class="menu-bar">
          <button
            class="menu-button navigation-button"
            @click=${()=>this.changeStartMonth(-1)}
            ?disabled=${!c.canGoBack}
            title="Vorheriger Monat">
            ←
          </button>
          <button
            class="menu-button decrease-button"
            @click=${()=>this.changeDisplayedMonths(-1)}
            ?disabled=${e<=1}
            title="Weniger Monate anzeigen">
            −
          </button>
          <div class="menu-number">${e}</div>
          <button
            class="menu-button increase-button"
            @click=${()=>this.changeDisplayedMonths(1)}
            ?disabled=${e>=t}
            title="Mehr Monate anzeigen">
            +
          </button>
          <button
            class="menu-button navigation-button"
            @click=${()=>this.changeStartMonth(1)}
            ?disabled=${!c.canGoForward}
            title="Nächster Monat">
            →
          </button>
          ${(()=>{const t=this._getAllCalendars(),e=this._getSelectedCalendarValue();return Y`
                <div class="calendar-selector">
                  <ha-select
                    .value=${e||"a"}
                    @selected=${e=>{try{if(e&&("function"==typeof e.stopPropagation&&e.stopPropagation(),"function"==typeof e.stopImmediatePropagation&&e.stopImmediatePropagation()),!e||!e.detail)return;const i=e.detail.index;if(null!=i&&i>=0&&t&&t[i]){const e=t[i];e&&e.shortcut&&"function"==typeof this._onCalendarSelectedByIndex&&this._onCalendarSelectedByIndex(e.shortcut)}}catch(t){console.error("Error in calendar selection handler:",t)}}}
                    naturalMenuWidth
                    fixedMenuPosition
                  >
                    ${t.map((t=>{const e=t.color||"",i=t.color?this._getContrastColor(t.color):"";return Y`
                        <mwc-list-item
                          value="${t.shortcut}"
                          data-calendar-color="${e}"
                          data-calendar-text-color="${i}"
                          style="${e?`--calendar-bg-color: ${e}; --calendar-text-color: ${i};`:""}">
                          ${t.name||`Schicht ${t.shortcut.toUpperCase()}`}
                        </mwc-list-item>
                      `}))}
                  </ha-select>
                </div>
              `})()}
        </div>
        <div class="calendar-container">
          ${r.map((({year:t,month:e})=>this.renderMonth(t,e)))}
        </div>
      </div>
    `}}function zt(){return zt="undefined"!=typeof Reflect&&Reflect.get?Reflect.get.bind():function(t,e,i){var n=function(t,e){for(;!{}.hasOwnProperty.call(t,e)&&null!==(t=Ft(t)););return t}(t,e);if(n){var r=Object.getOwnPropertyDescriptor(n,e);return r.get?r.get.call(arguments.length<3?t:i):r.value}},zt.apply(null,arguments)}function Ft(t){return Ft=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(t){return t.__proto__||Object.getPrototypeOf(t)},Ft(t)}function Vt(t,e,i){return(e=function(t){var e=function(t){if("object"!=typeof t||!t)return t;var e=t[Symbol.toPrimitive];if(void 0!==e){var i=e.call(t,"string");if("object"!=typeof i)return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(t);return"symbol"==typeof e?e:e+""}(e))in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}Ct=Lt,Wt(Lt,"className","ShiftScheduleView"),Wt(Lt,"DEFAULT_SELECTED_DAY_COLOR","#ff9800"),Wt(Lt,"CALENDARS",[{shortcut:"a",name:"Schicht A",defaultColor:"#ff9800"},{shortcut:"b",name:"Schicht B",defaultColor:"#ff0000"},{shortcut:"c",name:"Schicht C",defaultColor:"#00ff00"},{shortcut:"d",name:"Schicht D",defaultColor:"#0000ff"},{shortcut:"e",name:"Schicht E",defaultColor:"#ffff00"}]),Wt(Lt,"styles",[function(t,e,i){var n=Ht(It(t),"styles",i);return n}(Ct,0,Ct)||[],h`
      :host {
        display: block;
        --tgshiftschedule-default-selected-day-color: ${d(Ct.DEFAULT_SELECTED_DAY_COLOR)};
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
      .day-button.working:not([style*="background-color"]) {
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
    `]),customElements.get("shiftschedule-view")||customElements.define("shiftschedule-view",Lt);class qt extends jt{static get properties(){return{...super.properties,config:{type:Object},hass:{type:Object},lovelace:{type:Object},_view:{type:Object},_viewType:{type:String}}}static getConfigElement(){return document.createElement(`${pt}-editor`)}static getStubConfig(){return{entity:"",numberOfMonths:14,initialDisplayedMonths:2,useElements:!1,selectedElement:null,elements:[{benennung:"Element 1",aktiv:!0,color:"#ff0000",shortcut:"1"},{benennung:"Element 2",aktiv:!0,color:"#00ff00",shortcut:"2"},{benennung:"Element 3",aktiv:!0,color:"#0000ff",shortcut:"3"},{benennung:"Element 4",aktiv:!0,color:"#ffff00",shortcut:"4"}]}}constructor(){super(),this._debug("CardImpl-Modul wird geladen"),this.config=this.getDefaultConfig(),this._debug("CardImpl-Konstruktor: Initialisierung abgeschlossen")}getDefaultConfig(){return this._debug("CardImpl getDefaultConfig wird aufgerufen"),{entity:"",numberOfMonths:14,initialDisplayedMonths:2,selectedCalendar:"a",calendars:[{shortcut:"a",name:"Kalender A",color:"#ff9800",enabled:!0,statusRelevant:!0},{shortcut:"b",name:"Kalender B",color:"#ff0000",enabled:!1,statusRelevant:!0},{shortcut:"c",name:"Kalender C",color:"#00ff00",enabled:!1,statusRelevant:!0},{shortcut:"d",name:"Kalender D",color:"#0000ff",enabled:!1,statusRelevant:!0},{shortcut:"e",name:"Kalender E",color:"#ffff00",enabled:!1,statusRelevant:!0}]}}setConfig(t){if(this._debug("setConfig wird aufgerufen mit:",t),!t)throw new Error("Keine Konfiguration vorhanden");const e=this.getDefaultConfig();this.config={...e,...t,selectedCalendar:void 0!==t?.selectedCalendar?t.selectedCalendar:this.config?.selectedCalendar||e.selectedCalendar},this._debug("config nach setConfig:",this.config),this._viewType="ShiftScheduleView";try{this._view?this._debug("setConfig: Aktualisiere bestehende ShiftSchedule-View"):(this._debug("setConfig: Erstelle neue ShiftSchedule-View"),this._view=document.createElement("shiftschedule-view"),this._view.addEventListener("config-changed",(t=>{this._debug("config-changed Event von ShiftSchedule-View empfangen:",t.detail),t.detail&&t.detail.config&&(this.config=t.detail.config,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this.config},bubbles:!0,composed:!0})))})),this._hass&&(this._debug("setConfig: Übergebe gespeicherten hass an ShiftSchedule-View"),this._view.hass=this._hass),this.lovelace&&(this._debug("setConfig: Übergebe lovelace an ShiftSchedule-View"),this._view.lovelace=this.lovelace)),this._view.config=this.config,this._debug("setConfig: View initialisiert/aktualisiert:",{viewType:this._viewType,config:this.config})}catch(t){throw this._debug("setConfig: Fehler bei View-Initialisierung:",t),new Error(`Fehler bei der View-Initialisierung: ${t.message}`)}}set hass(t){this._hass=t,this._view?this._view.hass=t:this._debug("set hass: View noch nicht initialisiert, speichere hass für später")}set lovelace(t){this._lovelace=t,this._view&&(this._view.lovelace=t)}get lovelace(){return this._lovelace}get hass(){return this._hass}firstUpdated(){this._debug("firstUpdated wird aufgerufen"),this._view&&this._view.firstUpdated(),this._debug("firstUpdated abgeschlossen")}render(){if(!this._view)return Y`<div class="error">Keine View verfügbar</div>`;try{return Y`${this._view}`}catch(t){return this._debug("render: Fehler beim Rendern der View:",t),Y`<div class="error">Fehler beim Rendern: ${t.message}</div>`}}}function Kt(t,e,i){return(e=function(t){var e=function(t){if("object"!=typeof t||!t)return t;var e=t[Symbol.toPrimitive];if(void 0!==e){var i=e.call(t,"string");if("object"!=typeof i)return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(t);return"symbol"==typeof e?e:e+""}(e))in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}function Yt(t,e,i,n){var r=Gt(Jt(1&n?t.prototype:t),e,i);return 2&n&&"function"==typeof r?function(t){return r.apply(i,t)}:r}function Gt(){return Gt="undefined"!=typeof Reflect&&Reflect.get?Reflect.get.bind():function(t,e,i){var n=function(t,e){for(;!{}.hasOwnProperty.call(t,e)&&null!==(t=Jt(t)););return t}(t,e);if(n){var r=Object.getOwnPropertyDescriptor(n,e);return r.get?r.get.call(arguments.length<3?t:i):r.value}},Gt.apply(null,arguments)}function Jt(t){return Jt=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(t){return t.__proto__||Object.getPrototypeOf(t)},Jt(t)}kt=qt,Vt(qt,"className","CardImpl"),Vt(qt,"styles",[function(t,e,i){var n=zt(Ft(t),"styles",i);return n}(kt,0,kt),h`
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
    `]);class Zt extends wt{constructor(t={}){super(),this._debug("[EditorBase] EditorBase-Konstruktor wird aufgerufen"),this.config={type:"custom:tgeditor-card",...t},this._debug("[EditorBase] EditorBase config nach Konstruktor:",this.config)}async firstUpdated(){this._debug("[EditorBase] EditorBase firstUpdated wird aufgerufen"),await super.firstUpdated(),this._debug("[EditorBase] EditorBase firstUpdated abgeschlossen")}async loadHaForm(){if(this._debug("[EditorBase] EditorBase loadHaForm wird aufgerufen"),customElements.get("ha-form"))this._debug("[EditorBase] EditorBase ha-form bereits geladen");else{this._debug("[EditorBase] EditorBase ha-form nicht gefunden, lade custom-card-helpers");try{const t=await r.e(356).then(r.bind(r,356));this._debug("[EditorBase] EditorBase custom-card-helpers geladen"),await t.loadHaForm(),this._debug("[EditorBase] EditorBase ha-form geladen")}catch(t){throw t}}}getDefaultConfig(){throw this._debug("[EditorBase] EditorBase getDefaultConfig wird aufgerufen"),new Error("getDefaultConfig muss in der abgeleiteten Klasse implementiert werden")}getStubConfig(){return this._debug("[EditorBase] EditorBase getStubConfig wird aufgerufen"),this.getDefaultConfig()}setConfig(t){if(this._debug("[EditorBase] EditorBase setConfig wird aufgerufen mit:",t),!t)throw new Error("Keine Konfiguration angegeben");const e=!this.config||0===Object.keys(this.config).length;this.config=e?{...this.getDefaultConfig(),...t}:{...this.config,...t},this._debug("[EditorBase] EditorBase config nach setConfig:",this.config)}}function Qt(t,e,i){return(e=function(t){var e=function(t){if("object"!=typeof t||!t)return t;var e=t[Symbol.toPrimitive];if(void 0!==e){var i=e.call(t,"string");if("object"!=typeof i)return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(t);return"symbol"==typeof e?e:e+""}(e))in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}function Xt(t,e,i,n){var r=te(ee(1&n?t.prototype:t),e,i);return 2&n&&"function"==typeof r?function(t){return r.apply(i,t)}:r}function te(){return te="undefined"!=typeof Reflect&&Reflect.get?Reflect.get.bind():function(t,e,i){var n=function(t,e){for(;!{}.hasOwnProperty.call(t,e)&&null!==(t=ee(t)););return t}(t,e);if(n){var r=Object.getOwnPropertyDescriptor(n,e);return r.get?r.get.call(arguments.length<3?t:i):r.value}},te.apply(null,arguments)}function ee(t){return ee=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(t){return t.__proto__||Object.getPrototypeOf(t)},ee(t)}Kt(Zt,"properties",{...Yt(Et=Zt,"properties",Et),_selectedTab:{type:Number}}),Kt(Zt,"styles",[Yt(Et,"styles",Et),h`
      :host {
        display: block;
      }
      .editor-container {
        padding: 16px;
      }
    `]);class ie extends Zt{constructor(){super({entity:"",numberOfMonths:14,initialDisplayedMonths:2,selectedCalendar:"a",calendars:[{shortcut:"a",name:"Schicht A",color:"#ff9800",enabled:!0,statusRelevant:!0},{shortcut:"b",name:"Schicht B",color:"#ff0000",enabled:!1,statusRelevant:!0},{shortcut:"c",name:"Schicht C",color:"#00ff00",enabled:!1,statusRelevant:!0},{shortcut:"d",name:"Schicht D",color:"#0000ff",enabled:!1,statusRelevant:!0},{shortcut:"e",name:"Schicht E",color:"#ffff00",enabled:!1,statusRelevant:!0}],holidays:{neujahr:!0,heilige_drei_koenige:!0,tag_der_arbeit:!0,friedensfest:!0,mariae_himmelfahrt:!0,tag_der_deutschen_einheit:!0,reformationstag:!0,allerheiligen:!0,weihnachten_1:!0,weihnachten_2:!0,karfreitag:!0,ostermontag:!0,christi_himmelfahrt:!0,pfingstmontag:!0,fronleichnam:!0,busstag:!0}}),this._debug("EditorImpl-Modul wird geladen")}async firstUpdated(){this._debug("EditorImpl firstUpdated wird aufgerufen"),await super.firstUpdated(),this._debug("EditorImpl firstUpdated abgeschlossen")}render(){if(this._debug("EditorImpl render wird aufgerufen"),!this.hass)return this._debug("EditorImpl render: Kein hass"),Y`<div>Loading...</div>`;this._debug("EditorImpl render mit config:",this.config),this.config.calendars&&Array.isArray(this.config.calendars)||(this.config.calendars=[{shortcut:"a",name:"Schicht A",color:"#ff9800",enabled:!1,statusRelevant:!0},{shortcut:"b",name:"Schicht B",color:"#ff0000",enabled:!1,statusRelevant:!0},{shortcut:"c",name:"Schicht C",color:"#00ff00",enabled:!1,statusRelevant:!0},{shortcut:"d",name:"Schicht D",color:"#0000ff",enabled:!1,statusRelevant:!0},{shortcut:"e",name:"Schicht E",color:"#ffff00",enabled:!1,statusRelevant:!0}]);const t=new Map;return this.config.calendars.forEach((e=>t.set(e.shortcut,e))),this.config.calendars=[{shortcut:"a",name:"Schicht A",color:"#ff9800",enabled:!1,statusRelevant:!0},{shortcut:"b",name:"Schicht B",color:"#ff0000",enabled:!1,statusRelevant:!0},{shortcut:"c",name:"Schicht C",color:"#00ff00",enabled:!1,statusRelevant:!0},{shortcut:"d",name:"Schicht D",color:"#0000ff",enabled:!1,statusRelevant:!0},{shortcut:"e",name:"Schicht E",color:"#ffff00",enabled:!1,statusRelevant:!0}].map((e=>{const i=t.get(e.shortcut);return i?{...e,...i,shortcut:e.shortcut,statusRelevant:void 0===i.statusRelevant||i.statusRelevant}:e})),Y`
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
            ${this.config.calendars.map(((t,e)=>this._renderCalendar(e,t)))}
          </div>
        </div>
        <div class="elements-section">
          ${this._renderHolidays()}
        </div>
      </div>
    `}_updateUseElements(t){this.config={...this.config,useElements:t},this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this.config},bubbles:!0,composed:!0})),this.requestUpdate()}_getColorOptions(){return[{value:"#ff0000",name:"Rot"},{value:"#00ff00",name:"Grün"},{value:"#0000ff",name:"Blau"},{value:"#ffff00",name:"Gelb"},{value:"#ff00ff",name:"Magenta"},{value:"#00ffff",name:"Cyan"},{value:"#ff8800",name:"Orange"},{value:"#8800ff",name:"Violett"},{value:"#0088ff",name:"Hellblau"},{value:"#ff0088",name:"Pink"},{value:"#88ff00",name:"Lime"},{value:"#008888",name:"Türkis"},{value:"#888888",name:"Grau"},{value:"#000000",name:"Schwarz"},{value:"#ffffff",name:"Weiß"}]}_validateTime(t){return!t||""===t.trim()||/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/.test(t.trim())}_validateTimeRange(t){if(!t||!Array.isArray(t)||t.length<2)return{isValid:!0,message:""};const e=t[0],i=t[1],n=e&&""!==e.trim(),r=i&&""!==i.trim();if(!n&&!r)return{isValid:!0,message:""};if(n&&r){const t=this._validateTime(e),n=this._validateTime(i);return t?n?{isValid:!0,message:""}:{isValid:!1,message:"Ungültiges Format für Endzeit. Bitte HH:MM verwenden (z.B. 17:00)"}:{isValid:!1,message:"Ungültiges Format für Startzeit. Bitte HH:MM verwenden (z.B. 08:30)"}}return n&&!r?{isValid:!1,message:"Bitte auch die Endzeit angeben"}:!n&&r?{isValid:!1,message:"Bitte auch die Startzeit angeben"}:{isValid:!0,message:""}}_renderCalendar(t,e){const i=this._getColorOptions(),n=e.color||"#ff0000",r=e.timeRanges||[[null,null],[null,null]],s=e.name||`Schicht ${e.shortcut.toUpperCase()}`,a=e.enabled||!1,o=this._validateTimeRange(r[0]),l=this._validateTimeRange(r[1]),c=!r[0]||!r[0][0]||this._validateTime(r[0][0]),d=!r[0]||!r[0][1]||this._validateTime(r[0][1]),h=!r[1]||!r[1][0]||this._validateTime(r[1][0]),u=!r[1]||!r[1][1]||this._validateTime(r[1][1]),f=!c||!o.isValid,g=!d||!o.isValid,p=!h||!l.isValid,m=!u||!l.isValid;return Y`
      <details class="calendar-item">
        <summary class="calendar-summary">
          <span class="calendar-summary-title">Schicht ${e.shortcut.toUpperCase()}: ${s}</span>
          <span class="calendar-summary-status">
            ${a?Y`<span class="status-badge status-enabled">Aktiviert</span>`:Y`<span class="status-badge status-disabled">Deaktiviert</span>`}
          </span>
        </summary>
        <div class="calendar-fields">
          <ha-textfield
            label="Name"
            .value=${e.name||""}
            maxlength="30"
            @input=${t=>this._updateCalendar(e.shortcut,"name",t.target.value)}
          ></ha-textfield>
          <div class="switch-item">
            <label class="switch-label">Aktiviert</label>
            <ha-switch
              .checked=${e.enabled||!1}
              @change=${t=>this._updateCalendar(e.shortcut,"enabled",t.target.checked)}
            ></ha-switch>
          </div>
          <div class="switch-item">
            <label class="switch-label">Status relevant</label>
            <ha-switch
              .checked=${!1!==e.statusRelevant}
              @change=${t=>this._updateCalendar(e.shortcut,"statusRelevant",t.target.checked)}
            ></ha-switch>
          </div>
          <div class="color-selector">
            <div class="color-selector-label">Farbe</div>
            <ha-combo-box
              label="Farbe"
              .value=${n}
              .items=${i.map((t=>({value:t.value,label:`${t.name} (${t.value})`})))}
              @value-changed=${t=>{const i=t.detail?.value;i&&this._updateCalendar(e.shortcut,"color",i)}}
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
                @input=${t=>{const i=t.target.value.trim()||null,n=!i||this._validateTime(i);this._updateTimeRange(e.shortcut,0,0,i),setTimeout((()=>{const i=this.config.calendars?.find((t=>t.shortcut===e.shortcut)),r=i?.timeRanges?.[0]||[null,null],s=this._validateTimeRange(r),a=!n||!s.isValid;t.target.error=a,t.target.helper=a?s.message||"Ungültiges Format. Bitte HH:MM verwenden (z.B. 08:30)":"",this.requestUpdate()}),0)}}
                @blur=${t=>{const i=t.target.value.trim()||null,n=!i||this._validateTime(i),r=this.config.calendars?.find((t=>t.shortcut===e.shortcut)),s=r?.timeRanges?.[0]||[null,null],a=this._validateTimeRange(s),o=!n||!a.isValid;t.target.error=o,t.target.helper=o?a.message||"Ungültiges Format. Bitte HH:MM verwenden (z.B. 08:30)":"",this.requestUpdate()}}
              ></ha-textfield>
              <span class="time-separator">-</span>
              <ha-textfield
                label="Endzeit 1"
                .value=${r[0]&&r[0][1]?r[0][1]:""}
                placeholder="HH:MM"
                pattern="^([0-1][0-9]|2[0-3]):[0-5][0-9]$"
                .error=${g}
                .helper=${g?o.message||"Ungültiges Format. Bitte HH:MM verwenden (z.B. 17:00)":""}
                @input=${t=>{const i=t.target.value.trim()||null,n=!i||this._validateTime(i);this._updateTimeRange(e.shortcut,0,1,i),setTimeout((()=>{const i=this.config.calendars?.find((t=>t.shortcut===e.shortcut)),r=i?.timeRanges?.[0]||[null,null],s=this._validateTimeRange(r),a=!n||!s.isValid;t.target.error=a,t.target.helper=a?s.message||"Ungültiges Format. Bitte HH:MM verwenden (z.B. 17:00)":"",this.requestUpdate()}),0)}}
                @blur=${t=>{const i=t.target.value.trim()||null,n=!i||this._validateTime(i),r=this.config.calendars?.find((t=>t.shortcut===e.shortcut)),s=r?.timeRanges?.[0]||[null,null],a=this._validateTimeRange(s),o=!n||!a.isValid;t.target.error=o,t.target.helper=o?a.message||"Ungültiges Format. Bitte HH:MM verwenden (z.B. 17:00)":"",this.requestUpdate()}}
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
                @input=${t=>{const i=t.target.value.trim()||null,n=!i||this._validateTime(i);this._updateTimeRange(e.shortcut,1,0,i),setTimeout((()=>{const i=this.config.calendars?.find((t=>t.shortcut===e.shortcut)),r=i?.timeRanges?.[1]||[null,null],s=this._validateTimeRange(r),a=!n||!s.isValid;t.target.error=a,t.target.helper=a?s.message||"Ungültiges Format. Bitte HH:MM verwenden (z.B. 08:30)":"",this.requestUpdate()}),0)}}
                @blur=${t=>{const i=t.target.value.trim()||null,n=!i||this._validateTime(i),r=this.config.calendars?.find((t=>t.shortcut===e.shortcut)),s=r?.timeRanges?.[1]||[null,null],a=this._validateTimeRange(s),o=!n||!a.isValid;t.target.error=o,t.target.helper=o?a.message||"Ungültiges Format. Bitte HH:MM verwenden (z.B. 08:30)":"",this.requestUpdate()}}
              ></ha-textfield>
              <span class="time-separator">-</span>
              <ha-textfield
                label="Endzeit 2"
                .value=${r[1]&&r[1][1]?r[1][1]:""}
                placeholder="HH:MM"
                pattern="^([0-1][0-9]|2[0-3]):[0-5][0-9]$"
                .error=${m}
                .helper=${m?l.message||"Ungültiges Format. Bitte HH:MM verwenden (z.B. 17:00)":""}
                @input=${t=>{const i=t.target.value.trim()||null,n=!i||this._validateTime(i);this._updateTimeRange(e.shortcut,1,1,i),setTimeout((()=>{const i=this.config.calendars?.find((t=>t.shortcut===e.shortcut)),r=i?.timeRanges?.[1]||[null,null],s=this._validateTimeRange(r),a=!n||!s.isValid;t.target.error=a,t.target.helper=a?s.message||"Ungültiges Format. Bitte HH:MM verwenden (z.B. 17:00)":"",this.requestUpdate()}),0)}}
                @blur=${t=>{const i=t.target.value.trim()||null,n=!i||this._validateTime(i),r=this.config.calendars?.find((t=>t.shortcut===e.shortcut)),s=r?.timeRanges?.[1]||[null,null],a=this._validateTimeRange(s),o=!n||!a.isValid;t.target.error=o,t.target.helper=o?a.message||"Ungültiges Format. Bitte HH:MM verwenden (z.B. 17:00)":"",this.requestUpdate()}}
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
          ${[{key:"neujahr",label:"Neujahr (1. Januar)"},{key:"heilige_drei_koenige",label:"Heilige Drei Könige (6. Januar)"},{key:"tag_der_arbeit",label:"Tag der Arbeit (1. Mai)"},{key:"friedensfest",label:"Friedensfest (8. August)"},{key:"mariae_himmelfahrt",label:"Mariä Himmelfahrt (15. August)"},{key:"tag_der_deutschen_einheit",label:"Tag der Deutschen Einheit (3. Oktober)"},{key:"reformationstag",label:"Reformationstag (31. Oktober)"},{key:"allerheiligen",label:"Allerheiligen (1. November)"},{key:"weihnachten_1",label:"1. Weihnachtsfeiertag (25. Dezember)"},{key:"weihnachten_2",label:"2. Weihnachtsfeiertag (26. Dezember)"},{key:"karfreitag",label:"Karfreitag"},{key:"ostermontag",label:"Ostermontag"},{key:"christi_himmelfahrt",label:"Christi Himmelfahrt"},{key:"pfingstmontag",label:"Pfingstmontag"},{key:"fronleichnam",label:"Fronleichnam"},{key:"busstag",label:"Buß- und Bettag"}].map((t=>Y`
            <div class="holiday-switch-item">
              <label class="holiday-label">${t.label}</label>
              <ha-switch
                .checked=${!1!==this.config.holidays[t.key]}
                @change=${e=>this._updateHoliday(t.key,e.target.checked)}
              ></ha-switch>
            </div>
          `))}
        </div>
      </details>
    `}_updateHoliday(t,e){this.config.holidays||(this.config.holidays={});const i={...this.config,holidays:{...this.config.holidays,[t]:e}};this.config=i,this.requestUpdate(),setTimeout((()=>{this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:i},bubbles:!0,composed:!0}))}),0)}_updateTimeRange(t,e,i,n){this.config.calendars||(this.config.calendars=[{shortcut:"a",name:"Schicht A",color:"#ff9800",enabled:!1},{shortcut:"b",name:"Schicht B",color:"#ff0000",enabled:!1},{shortcut:"c",name:"Schicht C",color:"#00ff00",enabled:!1},{shortcut:"d",name:"Schicht D",color:"#0000ff",enabled:!1},{shortcut:"e",name:"Schicht E",color:"#ffff00",enabled:!1}]);const r=this.config.calendars.map((r=>{if(r.shortcut===t){const t=(r.timeRanges||[[null,null],[null,null]]).map(((t,r)=>{if(r===e){const e=[...t];return e[i]=n||null,e}return t}));return{...r,timeRanges:t}}return r})),s={...this.config,calendars:r};this.config=s,this.requestUpdate(),setTimeout((()=>{this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:s},bubbles:!0,composed:!0}))}),0)}_updateCalendar(t,e,i){this.config.calendars||(this.config.calendars=[{shortcut:"a",name:"Schicht A",color:"#ff9800",enabled:!1},{shortcut:"b",name:"Schicht B",color:"#ff0000",enabled:!1},{shortcut:"c",name:"Schicht C",color:"#00ff00",enabled:!1},{shortcut:"d",name:"Schicht D",color:"#0000ff",enabled:!1},{shortcut:"e",name:"Schicht E",color:"#ffff00",enabled:!1}]);const n=this.config.calendars.map((n=>n.shortcut===t?{...n,[e]:i}:n)),r={...this.config,calendars:n};this.config=r,this.requestUpdate(),setTimeout((()=>{this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:r},bubbles:!0,composed:!0}))}),0)}_computeLabel(t){switch(t.name){case"entity":return"Entity (input_text)";case"numberOfMonths":return"Maximale Anzahl Monate";case"initialDisplayedMonths":return"Standardwert sichtbare Monate";default:return t.name}}_valueChanged(t){this._debug("EditorImpl _valueChanged wird aufgerufen mit:",t.detail);const e=t.detail.value;void 0!==e.initialDisplayedMonths&&void 0!==e.numberOfMonths?e.initialDisplayedMonths=Math.min(e.initialDisplayedMonths,e.numberOfMonths):void 0!==e.initialDisplayedMonths&&this.config.numberOfMonths?e.initialDisplayedMonths=Math.min(e.initialDisplayedMonths,this.config.numberOfMonths):void 0!==e.numberOfMonths&&this.config.initialDisplayedMonths&&this.config.initialDisplayedMonths>e.numberOfMonths&&(e.initialDisplayedMonths=e.numberOfMonths),this.config={...this.config,...e},this._debug("EditorImpl config nach _valueChanged:",this.config),this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this.config},bubbles:!0,composed:!0}))}static getConfigElement(){return document.createElement(`${pt}-editor`)}static getStubConfig(){return{entity:"",numberOfMonths:14,initialDisplayedMonths:2,useElements:!1,selectedElement:null,elements:[{benennung:"Element 1",aktiv:!0,color:"#ff0000",shortcut:"1"},{benennung:"Element 2",aktiv:!0,color:"#00ff00",shortcut:"2"},{benennung:"Element 3",aktiv:!0,color:"#0000ff",shortcut:"3"},{benennung:"Element 4",aktiv:!0,color:"#ffff00",shortcut:"4"}],holidays:{neujahr:!0,heilige_drei_koenige:!0,tag_der_arbeit:!0,friedensfest:!0,mariae_himmelfahrt:!0,tag_der_deutschen_einheit:!0,reformationstag:!0,allerheiligen:!0,weihnachten_1:!0,weihnachten_2:!0,karfreitag:!0,ostermontag:!0,christi_himmelfahrt:!0,pfingstmontag:!0,fronleichnam:!0,busstag:!0}}}_getBasicSchema(){return[{name:"entity",selector:{entity:{domain:"input_text"}}},{name:"numberOfMonths",selector:{number:{min:1,max:14,step:1,mode:"box"}}},{name:"initialDisplayedMonths",selector:{number:{min:1,max:14,step:1,mode:"box"}}}]}}function ne(){return ne="undefined"!=typeof Reflect&&Reflect.get?Reflect.get.bind():function(t,e,i){var n=function(t,e){for(;!{}.hasOwnProperty.call(t,e)&&null!==(t=re(t)););return t}(t,e);if(n){var r=Object.getOwnPropertyDescriptor(n,e);return r.get?r.get.call(arguments.length<3?t:i):r.value}},ne.apply(null,arguments)}function re(t){return re=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(t){return t.__proto__||Object.getPrototypeOf(t)},re(t)}Qt(ie,"properties",{...Xt(St=ie,"properties",St)}),Qt(ie,"styles",[Xt(St,"styles",St),h`
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
    `]);class se extends ie{constructor(){super()}}function ae(){return ae="undefined"!=typeof Reflect&&Reflect.get?Reflect.get.bind():function(t,e,i){var n=function(t,e){for(;!{}.hasOwnProperty.call(t,e)&&null!==(t=oe(t)););return t}(t,e);if(n){var r=Object.getOwnPropertyDescriptor(n,e);return r.get?r.get.call(arguments.length<3?t:i):r.value}},ae.apply(null,arguments)}function oe(t){return oe=Object.setPrototypeOf?Object.getPrototypeOf.bind():function(t){return t.__proto__||Object.getPrototypeOf(t)},oe(t)}(function(t,e,i){(e=function(t){var e=function(t){if("object"!=typeof t||!t)return t;var e=t[Symbol.toPrimitive];if(void 0!==e){var i=e.call(t,"string");if("object"!=typeof i)return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(t);return"symbol"==typeof e?e:e+""}(e))in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i})(se,"styles",[function(t,e,i){var n=ne(re(t),"styles",i);return n}(Mt=se,0,Mt),h`
      :host {
        display: block;
        padding-top: 2px;
        padding-bottom: 2px;
        padding-left: 16px;
        padding-right: 16px;
      }
    `]),customElements.get(`${pt}-editor`)||customElements.define(`${pt}-editor`,se);class le extends qt{constructor(){super()}connectedCallback(){super.connectedCallback()}disconnectedCallback(){super.disconnectedCallback()}}if(function(t,e,i){(e=function(t){var e=function(t){if("object"!=typeof t||!t)return t;var e=t[Symbol.toPrimitive];if(void 0!==e){var i=e.call(t,"string");if("object"!=typeof i)return i;throw new TypeError("@@toPrimitive must return a primitive value.")}return String(t)}(t);return"symbol"==typeof e?e:e+""}(e))in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i}(le,"styles",[function(t,e,i){var n=ae(oe(t),"styles",i);return n}(At=le,0,At),h`
      :host {
      }
    `]),window.customCards&&window.customCards.push({type:pt,name:mt,description:"Eine Schichtplan-Karte für Arbeitszeiten",preview:!0}),!customElements.get(pt))try{customElements.define(pt,le)}catch(t){}})();
//# sourceMappingURL=tgshiftschedule-card.js.map