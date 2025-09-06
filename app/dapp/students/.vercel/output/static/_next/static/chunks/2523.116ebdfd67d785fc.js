"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[2523],{25322:(e,t,i)=>{var r=i(28312),o=i(745),a=i(97265),s=i(54166);let n=(0,r.AH)`
  :host {
    display: block;
    width: var(--local-width);
    height: var(--local-height);
  }

  :host([data-object-fit='cover']) img {
    object-fit: cover;
    object-position: center center;
  }

  :host([data-object-fit='contain']) img {
    object-fit: contain;
    object-position: center center;
  }

  img {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: inherit;
  }
`;var c=function(e,t,i,r){var o,a=arguments.length,s=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,r);else for(var n=e.length-1;n>=0;n--)(o=e[n])&&(s=(a<3?o(s):a>3?o(t,i,s):o(t,i))||s);return a>3&&s&&Object.defineProperty(t,i,s),s};let l=class extends r.WF{constructor(){super(...arguments),this.src="./path/to/image.jpg",this.alt="Image",this.size=void 0,this.objectFit="cover"}render(){return this.objectFit&&(this.dataset.objectFit=this.objectFit),this.style.cssText=`
      --local-width: ${this.size?`var(--wui-icon-size-${this.size});`:"100%"};
      --local-height: ${this.size?`var(--wui-icon-size-${this.size});`:"100%"};
      `,(0,r.qy)`<img src=${this.src} alt=${this.alt} @error=${this.handleImageError} />`}handleImageError(){this.dispatchEvent(new CustomEvent("onLoadError",{bubbles:!0,composed:!0}))}};l.styles=[a.W5,a.ck,n],c([(0,o.MZ)()],l.prototype,"src",void 0),c([(0,o.MZ)()],l.prototype,"alt",void 0),c([(0,o.MZ)()],l.prototype,"size",void 0),c([(0,o.MZ)()],l.prototype,"objectFit",void 0),l=c([(0,s.E)("wui-image")],l)},60464:(e,t,i)=>{i(25322)},92523:(e,t,i)=>{i.r(t),i.d(t,{W3mBuyInProgressView:()=>V,W3mOnRampActivityView:()=>b,W3mOnRampProvidersView:()=>G,W3mOnrampFiatSelectView:()=>T,W3mOnrampTokensView:()=>U,W3mOnrampWidget:()=>eo,W3mWhatIsABuyView:()=>J});var r=i(28312),o=i(745),a=i(51882),s=i(24259),n=i(43520),c=i(47584),l=i(74623),u=i(11076),p=i(96641),d=i(52515);i(98160),i(22724),i(49625);var h=i(65819);i(36698),i(60464),i(72873);let w=(0,r.AH)`
  :host {
    width: 100%;
  }

  :host > wui-flex {
    width: 100%;
    padding: var(--wui-spacing-s);
    border-radius: var(--wui-border-radius-xs);
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: var(--wui-spacing-s);
  }

  :host > wui-flex:hover {
    background-color: var(--wui-color-gray-glass-002);
  }

  .purchase-image-container {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    width: var(--wui-icon-box-size-lg);
    height: var(--wui-icon-box-size-lg);
  }

  .purchase-image-container wui-image {
    width: 100%;
    height: 100%;
    position: relative;
    border-radius: calc(var(--wui-icon-box-size-lg) / 2);
  }

  .purchase-image-container wui-image::after {
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    position: absolute;
    inset: 0;
    border-radius: calc(var(--wui-icon-box-size-lg) / 2);
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-005);
  }

  .purchase-image-container wui-icon-box {
    position: absolute;
    right: 0;
    bottom: 0;
    transform: translate(20%, 20%);
  }
`;var m=function(e,t,i,r){var o,a=arguments.length,s=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,r);else for(var n=e.length-1;n>=0;n--)(o=e[n])&&(s=(a<3?o(s):a>3?o(t,i,s):o(t,i))||s);return a>3&&s&&Object.defineProperty(t,i,s),s};let g=class extends r.WF{constructor(){super(...arguments),this.disabled=!1,this.color="inherit",this.label="Bought",this.purchaseValue="",this.purchaseCurrency="",this.date="",this.completed=!1,this.inProgress=!1,this.failed=!1,this.onClick=null,this.symbol=""}firstUpdated(){this.icon||this.fetchTokenImage()}render(){return(0,r.qy)`
      <wui-flex>
        ${this.imageTemplate()}
        <wui-flex flexDirection="column" gap="4xs" flexGrow="1">
          <wui-flex gap="xxs" alignItems="center" justifyContent="flex-start">
            ${this.statusIconTemplate()}
            <wui-text variant="paragraph-500" color="fg-100"> ${this.label}</wui-text>
          </wui-flex>
          <wui-text variant="small-400" color="fg-200">
            + ${this.purchaseValue} ${this.purchaseCurrency}
          </wui-text>
        </wui-flex>
        ${this.inProgress?(0,r.qy)`<wui-loading-spinner color="fg-200" size="md"></wui-loading-spinner>`:(0,r.qy)`<wui-text variant="micro-700" color="fg-300"><span>${this.date}</span></wui-text>`}
      </wui-flex>
    `}async fetchTokenImage(){await h.N._fetchTokenImage(this.purchaseCurrency)}statusIconTemplate(){return this.inProgress?null:this.completed?this.boughtIconTemplate():this.errorIconTemplate()}errorIconTemplate(){return(0,r.qy)`<wui-icon-box
      size="xxs"
      iconColor="error-100"
      backgroundColor="error-100"
      background="opaque"
      icon="close"
      borderColor="wui-color-bg-125"
    ></wui-icon-box>`}imageTemplate(){let e=this.icon||`https://avatar.vercel.sh/andrew.svg?size=50&text=${this.symbol}`;return(0,r.qy)`<wui-flex class="purchase-image-container">
      <wui-image src=${e}></wui-image>
    </wui-flex>`}boughtIconTemplate(){return(0,r.qy)`<wui-icon-box
      size="xxs"
      iconColor="success-100"
      backgroundColor="success-100"
      background="opaque"
      icon="arrowBottom"
      borderColor="wui-color-bg-125"
    ></wui-icon-box>`}};g.styles=[w],m([(0,o.MZ)({type:Boolean})],g.prototype,"disabled",void 0),m([(0,o.MZ)()],g.prototype,"color",void 0),m([(0,o.MZ)()],g.prototype,"label",void 0),m([(0,o.MZ)()],g.prototype,"purchaseValue",void 0),m([(0,o.MZ)()],g.prototype,"purchaseCurrency",void 0),m([(0,o.MZ)()],g.prototype,"date",void 0),m([(0,o.MZ)({type:Boolean})],g.prototype,"completed",void 0),m([(0,o.MZ)({type:Boolean})],g.prototype,"inProgress",void 0),m([(0,o.MZ)({type:Boolean})],g.prototype,"failed",void 0),m([(0,o.MZ)()],g.prototype,"onClick",void 0),m([(0,o.MZ)()],g.prototype,"symbol",void 0),m([(0,o.MZ)()],g.prototype,"icon",void 0),g=m([(0,d.EM)("w3m-onramp-activity-item")],g);let y=(0,r.AH)`
  :host > wui-flex {
    height: 500px;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-width: none;
    padding: var(--wui-spacing-m);
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }

  :host > wui-flex::-webkit-scrollbar {
    display: none;
  }

  :host > wui-flex > wui-flex {
    width: 100%;
  }

  wui-transaction-list-item-loader {
    width: 100%;
  }
`;var f=function(e,t,i,r){var o,a=arguments.length,s=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,r);else for(var n=e.length-1;n>=0;n--)(o=e[n])&&(s=(a<3?o(s):a>3?o(t,i,s):o(t,i))||s);return a>3&&s&&Object.defineProperty(t,i,s),s};let b=class extends r.WF{constructor(){super(),this.unsubscribe=[],this.selectedOnRampProvider=n.aG.state.selectedProvider,this.loading=!1,this.coinbaseTransactions=c.W.state.coinbaseTransactions,this.tokenImages=l.j.state.tokenImages,this.unsubscribe.push(n.aG.subscribeKey("selectedProvider",e=>{this.selectedOnRampProvider=e}),l.j.subscribeKey("tokenImages",e=>this.tokenImages=e),()=>{clearTimeout(this.refetchTimeout)},c.W.subscribe(e=>{this.coinbaseTransactions={...e.coinbaseTransactions}})),c.W.clearCursor(),this.fetchTransactions()}render(){return(0,r.qy)`
      <wui-flex flexDirection="column" .padding=${["0","s","s","s"]} gap="xs">
        ${this.loading?this.templateLoading():this.templateTransactionsByYear()}
      </wui-flex>
    `}templateTransactions(e){return e?.map(e=>{let t=s.r.formatDate(e?.metadata?.minedAt),i=e.transfers[0],o=i?.fungible_info;if(!o)return null;let n=o?.icon?.url||this.tokenImages?.[o.symbol||""];return(0,r.qy)`
        <w3m-onramp-activity-item
          label="Bought"
          .completed=${"ONRAMP_TRANSACTION_STATUS_SUCCESS"===e.metadata.status}
          .inProgress=${"ONRAMP_TRANSACTION_STATUS_IN_PROGRESS"===e.metadata.status}
          .failed=${"ONRAMP_TRANSACTION_STATUS_FAILED"===e.metadata.status}
          purchaseCurrency=${(0,a.J)(o.symbol)}
          purchaseValue=${i.quantity.numeric}
          date=${t}
          icon=${(0,a.J)(n)}
          symbol=${(0,a.J)(o.symbol)}
        ></w3m-onramp-activity-item>
      `})}templateTransactionsByYear(){return Object.keys(this.coinbaseTransactions).sort().reverse().map(e=>{let t=parseInt(e,10);return Array(12).fill(null).map((e,t)=>t).reverse().map(e=>{let i=d.tt.getTransactionGroupTitle(t,e),o=this.coinbaseTransactions[t]?.[e];return o?(0,r.qy)`
          <wui-flex flexDirection="column">
            <wui-flex
              alignItems="center"
              flexDirection="row"
              .padding=${["xs","s","s","s"]}
            >
              <wui-text variant="paragraph-500" color="fg-200">${i}</wui-text>
            </wui-flex>
            <wui-flex flexDirection="column" gap="xs">
              ${this.templateTransactions(o)}
            </wui-flex>
          </wui-flex>
        `:null})})}async fetchTransactions(){await this.fetchCoinbaseTransactions()}async fetchCoinbaseTransactions(){let e=u.U.state.address,t=p.H.state.projectId;if(!e)throw Error("No address found");if(!t)throw Error("No projectId found");this.loading=!0,await c.W.fetchTransactions(e,"coinbase"),this.loading=!1,this.refetchLoadingTransactions()}refetchLoadingTransactions(){let e=new Date;if(0===(this.coinbaseTransactions[e.getFullYear()]?.[e.getMonth()]||[]).filter(e=>"ONRAMP_TRANSACTION_STATUS_IN_PROGRESS"===e.metadata.status).length)return void clearTimeout(this.refetchTimeout);this.refetchTimeout=setTimeout(async()=>{let e=u.U.state.address;await c.W.fetchTransactions(e,"coinbase"),this.refetchLoadingTransactions()},3e3)}templateLoading(){return Array(7).fill((0,r.qy)` <wui-transaction-list-item-loader></wui-transaction-list-item-loader> `).map(e=>e)}};b.styles=y,f([(0,o.wk)()],b.prototype,"selectedOnRampProvider",void 0),f([(0,o.wk)()],b.prototype,"loading",void 0),f([(0,o.wk)()],b.prototype,"coinbaseTransactions",void 0),f([(0,o.wk)()],b.prototype,"tokenImages",void 0),b=f([(0,d.EM)("w3m-onramp-activity-view")],b);var v=i(14098),x=i(33806);i(546),i(97102),i(75293);let k=(0,r.AH)`
  :host > wui-grid {
    max-height: 360px;
    overflow: auto;
  }

  wui-flex {
    transition: opacity var(--wui-ease-out-power-1) var(--wui-duration-md);
    will-change: opacity;
  }

  wui-grid::-webkit-scrollbar {
    display: none;
  }

  wui-flex.disabled {
    opacity: 0.3;
    pointer-events: none;
    user-select: none;
  }
`;var C=function(e,t,i,r){var o,a=arguments.length,s=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,r);else for(var n=e.length-1;n>=0;n--)(o=e[n])&&(s=(a<3?o(s):a>3?o(t,i,s):o(t,i))||s);return a>3&&s&&Object.defineProperty(t,i,s),s};let T=class extends r.WF{constructor(){super(),this.unsubscribe=[],this.selectedCurrency=n.aG.state.paymentCurrency,this.currencies=n.aG.state.paymentCurrencies,this.currencyImages=l.j.state.currencyImages,this.checked=v.o.state.isLegalCheckboxChecked,this.unsubscribe.push(n.aG.subscribe(e=>{this.selectedCurrency=e.paymentCurrency,this.currencies=e.paymentCurrencies}),l.j.subscribeKey("currencyImages",e=>this.currencyImages=e),v.o.subscribeKey("isLegalCheckboxChecked",e=>{this.checked=e}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let{termsConditionsUrl:e,privacyPolicyUrl:t}=p.H.state,i=p.H.state.features?.legalCheckbox,o=!!(e||t)&&!!i&&!this.checked;return(0,r.qy)`
      <w3m-legal-checkbox></w3m-legal-checkbox>
      <wui-flex
        flexDirection="column"
        .padding=${["0","s","s","s"]}
        gap="xs"
        class=${(0,a.J)(o?"disabled":void 0)}
      >
        ${this.currenciesTemplate(o)}
      </wui-flex>
      <w3m-legal-footer></w3m-legal-footer>
    `}currenciesTemplate(e=!1){return this.currencies.map(t=>(0,r.qy)`
        <wui-list-item
          imageSrc=${(0,a.J)(this.currencyImages?.[t.id])}
          @click=${()=>this.selectCurrency(t)}
          variant="image"
          tabIdx=${(0,a.J)(e?-1:void 0)}
        >
          <wui-text variant="paragraph-500" color="fg-100">${t.id}</wui-text>
        </wui-list-item>
      `)}selectCurrency(e){e&&(n.aG.setPaymentCurrency(e),x.W.close())}};T.styles=k,C([(0,o.wk)()],T.prototype,"selectedCurrency",void 0),C([(0,o.wk)()],T.prototype,"currencies",void 0),C([(0,o.wk)()],T.prototype,"currencyImages",void 0),C([(0,o.wk)()],T.prototype,"checked",void 0),T=C([(0,d.EM)("w3m-onramp-fiat-select-view")],T);var I=i(90906),$=i(19628),R=i(35558),A=i(32836),P=i(54846),O=i(76610),j=i(11501),W=i(45312),M=i(34735);i(21330),i(19804);let E=(0,r.AH)`
  button {
    padding: var(--wui-spacing-s);
    border-radius: var(--wui-border-radius-xs);
    border: none;
    outline: none;
    background-color: var(--wui-color-gray-glass-002);
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: var(--wui-spacing-s);
    transition: background-color var(--wui-ease-out-power-1) var(--wui-duration-md);
    will-change: background-color;
  }

  button:hover {
    background-color: var(--wui-color-gray-glass-005);
  }

  .provider-image {
    width: var(--wui-spacing-3xl);
    min-width: var(--wui-spacing-3xl);
    height: var(--wui-spacing-3xl);
    border-radius: calc(var(--wui-border-radius-xs) - calc(var(--wui-spacing-s) / 2));
    position: relative;
    overflow: hidden;
  }

  .provider-image::after {
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    position: absolute;
    inset: 0;
    border-radius: calc(var(--wui-border-radius-xs) - calc(var(--wui-spacing-s) / 2));
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-005);
  }

  .network-icon {
    width: var(--wui-spacing-m);
    height: var(--wui-spacing-m);
    border-radius: calc(var(--wui-spacing-m) / 2);
    overflow: hidden;
    box-shadow:
      0 0 0 3px var(--wui-color-gray-glass-002),
      0 0 0 3px var(--wui-color-modal-bg);
    transition: box-shadow var(--wui-ease-out-power-1) var(--wui-duration-md);
    will-change: box-shadow;
  }

  button:hover .network-icon {
    box-shadow:
      0 0 0 3px var(--wui-color-gray-glass-005),
      0 0 0 3px var(--wui-color-modal-bg);
  }
`;var S=function(e,t,i,r){var o,a=arguments.length,s=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,r);else for(var n=e.length-1;n>=0;n--)(o=e[n])&&(s=(a<3?o(s):a>3?o(t,i,s):o(t,i))||s);return a>3&&s&&Object.defineProperty(t,i,s),s};let _=class extends r.WF{constructor(){super(...arguments),this.disabled=!1,this.color="inherit",this.label="",this.feeRange="",this.loading=!1,this.onClick=null}render(){return(0,r.qy)`
      <button ?disabled=${this.disabled} @click=${this.onClick} ontouchstart>
        <wui-visual name=${(0,a.J)(this.name)} class="provider-image"></wui-visual>
        <wui-flex flexDirection="column" gap="4xs">
          <wui-text variant="paragraph-500" color="fg-100">${this.label}</wui-text>
          <wui-flex alignItems="center" justifyContent="flex-start" gap="l">
            <wui-text variant="tiny-500" color="fg-100">
              <wui-text variant="tiny-400" color="fg-200">Fees</wui-text>
              ${this.feeRange}
            </wui-text>
            <wui-flex gap="xxs">
              <wui-icon name="bank" size="xs" color="fg-150"></wui-icon>
              <wui-icon name="card" size="xs" color="fg-150"></wui-icon>
            </wui-flex>
            ${this.networksTemplate()}
          </wui-flex>
        </wui-flex>
        ${this.loading?(0,r.qy)`<wui-loading-spinner color="fg-200" size="md"></wui-loading-spinner>`:(0,r.qy)`<wui-icon name="chevronRight" color="fg-200" size="sm"></wui-icon>`}
      </button>
    `}networksTemplate(){let e=I.W.getAllRequestedCaipNetworks(),t=e?.filter(e=>e?.assets?.imageId)?.slice(0,5);return(0,r.qy)`
      <wui-flex class="networks">
        ${t?.map(e=>(0,r.qy)`
            <wui-flex class="network-icon">
              <wui-image src=${(0,a.J)(M.$.getNetworkImage(e))}></wui-image>
            </wui-flex>
          `)}
      </wui-flex>
    `}};_.styles=[E],S([(0,o.MZ)({type:Boolean})],_.prototype,"disabled",void 0),S([(0,o.MZ)()],_.prototype,"color",void 0),S([(0,o.MZ)()],_.prototype,"name",void 0),S([(0,o.MZ)()],_.prototype,"label",void 0),S([(0,o.MZ)()],_.prototype,"feeRange",void 0),S([(0,o.MZ)({type:Boolean})],_.prototype,"loading",void 0),S([(0,o.MZ)()],_.prototype,"onClick",void 0),_=S([(0,d.EM)("w3m-onramp-provider-item")],_),i(82786);let q=(0,r.AH)`
  wui-flex {
    border-top: 1px solid var(--wui-color-gray-glass-005);
  }

  a {
    text-decoration: none;
    color: var(--wui-color-fg-175);
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--wui-spacing-3xs);
  }
`,D=class extends r.WF{render(){let{termsConditionsUrl:e,privacyPolicyUrl:t}=p.H.state;return e||t?(0,r.qy)`
      <wui-flex
        .padding=${["m","s","s","s"]}
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap="s"
      >
        <wui-text color="fg-250" variant="small-400" align="center">
          We work with the best providers to give you the lowest fees and best support. More options
          coming soon!
        </wui-text>

        ${this.howDoesItWorkTemplate()}
      </wui-flex>
    `:null}howDoesItWorkTemplate(){return(0,r.qy)` <wui-link @click=${this.onWhatIsBuy.bind(this)}>
      <wui-icon size="xs" color="accent-100" slot="iconLeft" name="helpCircle"></wui-icon>
      How does it work?
    </wui-link>`}onWhatIsBuy(){let e=I.W.state.activeChain;A.E.sendEvent({type:"track",event:"SELECT_WHAT_IS_A_BUY",properties:{isSmartAccount:(0,P.lj)(e)===W.Vl.ACCOUNT_TYPES.SMART_ACCOUNT}}),$.I.push("WhatIsABuy")}};D.styles=[q],D=function(e,t,i,r){var o,a=arguments.length,s=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,r);else for(var n=e.length-1;n>=0;n--)(o=e[n])&&(s=(a<3?o(s):a>3?o(t,i,s):o(t,i))||s);return a>3&&s&&Object.defineProperty(t,i,s),s}([(0,d.EM)("w3m-onramp-providers-footer")],D);var N=function(e,t,i,r){var o,a=arguments.length,s=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,r);else for(var n=e.length-1;n>=0;n--)(o=e[n])&&(s=(a<3?o(s):a>3?o(t,i,s):o(t,i))||s);return a>3&&s&&Object.defineProperty(t,i,s),s};let G=class extends r.WF{constructor(){super(),this.unsubscribe=[],this.providers=n.aG.state.providers,this.unsubscribe.push(n.aG.subscribeKey("providers",e=>{this.providers=e}))}firstUpdated(){Promise.all(this.providers.map(async e=>"coinbase"===e.name?await this.getCoinbaseOnRampURL():Promise.resolve(e?.url))).then(e=>{this.providers=this.providers.map((t,i)=>({...t,url:e[i]||""}))})}render(){return(0,r.qy)`
      <wui-flex flexDirection="column" .padding=${["0","s","s","s"]} gap="xs">
        ${this.onRampProvidersTemplate()}
      </wui-flex>
      <w3m-onramp-providers-footer></w3m-onramp-providers-footer>
    `}onRampProvidersTemplate(){return this.providers.filter(e=>e.supportedChains.includes(I.W.state.activeChain??"eip155")).map(e=>(0,r.qy)`
          <w3m-onramp-provider-item
            label=${e.label}
            name=${e.name}
            feeRange=${e.feeRange}
            @click=${()=>{this.onClickProvider(e)}}
            ?disabled=${!e.url}
            data-testid=${`onramp-provider-${e.name}`}
          ></w3m-onramp-provider-item>
        `)}onClickProvider(e){let t=I.W.state.activeChain;n.aG.setSelectedProvider(e),$.I.push("BuyInProgress"),R.w.openHref(e.url,"popupWindow","width=600,height=800,scrollbars=yes"),A.E.sendEvent({type:"track",event:"SELECT_BUY_PROVIDER",properties:{provider:e.name,isSmartAccount:(0,P.lj)(t)===W.Vl.ACCOUNT_TYPES.SMART_ACCOUNT}})}async getCoinbaseOnRampURL(){let e=u.U.state.address,t=I.W.state.activeCaipNetwork;if(!e)throw Error("No address found");if(!t?.name)throw Error("No network found");let i=O.oU.WC_COINBASE_PAY_SDK_CHAIN_NAME_MAP[t.name]??O.oU.WC_COINBASE_PAY_SDK_FALLBACK_CHAIN,r=n.aG.state.purchaseCurrency,o=r?[r.symbol]:n.aG.state.purchaseCurrencies.map(e=>e.symbol);return await j.T.generateOnRampURL({defaultNetwork:i,destinationWallets:[{address:e,blockchains:O.oU.WC_COINBASE_PAY_SDK_CHAINS,assets:o}],partnerUserId:e,purchaseAmount:n.aG.state.purchaseAmount})}};N([(0,o.wk)()],G.prototype,"providers",void 0),G=N([(0,d.EM)("w3m-onramp-providers-view")],G);let z=(0,r.AH)`
  :host > wui-grid {
    max-height: 360px;
    overflow: auto;
  }

  wui-flex {
    transition: opacity var(--wui-ease-out-power-1) var(--wui-duration-md);
    will-change: opacity;
  }

  wui-grid::-webkit-scrollbar {
    display: none;
  }

  wui-flex.disabled {
    opacity: 0.3;
    pointer-events: none;
    user-select: none;
  }
`;var B=function(e,t,i,r){var o,a=arguments.length,s=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,r);else for(var n=e.length-1;n>=0;n--)(o=e[n])&&(s=(a<3?o(s):a>3?o(t,i,s):o(t,i))||s);return a>3&&s&&Object.defineProperty(t,i,s),s};let U=class extends r.WF{constructor(){super(),this.unsubscribe=[],this.selectedCurrency=n.aG.state.purchaseCurrencies,this.tokens=n.aG.state.purchaseCurrencies,this.tokenImages=l.j.state.tokenImages,this.checked=v.o.state.isLegalCheckboxChecked,this.unsubscribe.push(n.aG.subscribe(e=>{this.selectedCurrency=e.purchaseCurrencies,this.tokens=e.purchaseCurrencies}),l.j.subscribeKey("tokenImages",e=>this.tokenImages=e),v.o.subscribeKey("isLegalCheckboxChecked",e=>{this.checked=e}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let{termsConditionsUrl:e,privacyPolicyUrl:t}=p.H.state,i=p.H.state.features?.legalCheckbox,o=!!(e||t)&&!!i&&!this.checked;return(0,r.qy)`
      <w3m-legal-checkbox></w3m-legal-checkbox>
      <wui-flex
        flexDirection="column"
        .padding=${["0","s","s","s"]}
        gap="xs"
        class=${(0,a.J)(o?"disabled":void 0)}
      >
        ${this.currenciesTemplate(o)}
      </wui-flex>
      <w3m-legal-footer></w3m-legal-footer>
    `}currenciesTemplate(e=!1){return this.tokens.map(t=>(0,r.qy)`
        <wui-list-item
          imageSrc=${(0,a.J)(this.tokenImages?.[t.symbol])}
          @click=${()=>this.selectToken(t)}
          variant="image"
          tabIdx=${(0,a.J)(e?-1:void 0)}
        >
          <wui-flex gap="3xs" alignItems="center">
            <wui-text variant="paragraph-500" color="fg-100">${t.name}</wui-text>
            <wui-text variant="small-400" color="fg-200">${t.symbol}</wui-text>
          </wui-flex>
        </wui-list-item>
      `)}selectToken(e){e&&(n.aG.setPurchaseCurrency(e),x.W.close())}};U.styles=z,B([(0,o.wk)()],U.prototype,"selectedCurrency",void 0),B([(0,o.wk)()],U.prototype,"tokens",void 0),B([(0,o.wk)()],U.prototype,"tokenImages",void 0),B([(0,o.wk)()],U.prototype,"checked",void 0),U=B([(0,d.EM)("w3m-onramp-token-select-view")],U);var L=i(14796),Z=i(5517),F=i(7478);i(54279),i(19284);let H=(0,r.AH)`
  @keyframes shake {
    0% {
      transform: translateX(0);
    }
    25% {
      transform: translateX(3px);
    }
    50% {
      transform: translateX(-3px);
    }
    75% {
      transform: translateX(3px);
    }
    100% {
      transform: translateX(0);
    }
  }

  wui-flex:first-child:not(:only-child) {
    position: relative;
  }

  wui-loading-thumbnail {
    position: absolute;
  }

  wui-visual {
    width: var(--wui-wallet-image-size-lg);
    height: var(--wui-wallet-image-size-lg);
    border-radius: calc(var(--wui-border-radius-5xs) * 9 - var(--wui-border-radius-xxs));
    position: relative;
    overflow: hidden;
  }

  wui-visual::after {
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    position: absolute;
    inset: 0;
    border-radius: calc(var(--wui-border-radius-5xs) * 9 - var(--wui-border-radius-xxs));
    box-shadow: inset 0 0 0 1px var(--wui-color-gray-glass-005);
  }

  wui-icon-box {
    position: absolute;
    right: calc(var(--wui-spacing-3xs) * -1);
    bottom: calc(var(--wui-spacing-3xs) * -1);
    opacity: 0;
    transform: scale(0.5);
    transition:
      opacity var(--wui-ease-out-power-2) var(--wui-duration-lg),
      transform var(--wui-ease-out-power-2) var(--wui-duration-lg);
    will-change: opacity, transform;
  }

  wui-text[align='center'] {
    width: 100%;
    padding: 0px var(--wui-spacing-l);
  }

  [data-error='true'] wui-icon-box {
    opacity: 1;
    transform: scale(1);
  }

  [data-error='true'] > wui-flex:first-child {
    animation: shake 250ms cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  }

  [data-retry='false'] wui-link {
    display: none;
  }

  [data-retry='true'] wui-link {
    display: block;
    opacity: 1;
  }

  wui-link {
    padding: var(--wui-spacing-4xs) var(--wui-spacing-xxs);
  }
`;var K=function(e,t,i,r){var o,a=arguments.length,s=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,r);else for(var n=e.length-1;n>=0;n--)(o=e[n])&&(s=(a<3?o(s):a>3?o(t,i,s):o(t,i))||s);return a>3&&s&&Object.defineProperty(t,i,s),s};let V=class extends r.WF{constructor(){super(),this.unsubscribe=[],this.selectedOnRampProvider=n.aG.state.selectedProvider,this.uri=L.x.state.wcUri,this.ready=!1,this.showRetry=!1,this.buffering=!1,this.error=!1,this.startTime=null,this.isMobile=!1,this.onRetry=void 0,this.unsubscribe.push(n.aG.subscribeKey("selectedProvider",e=>{this.selectedOnRampProvider=e})),this.watchTransactions()}disconnectedCallback(){this.intervalId&&clearInterval(this.intervalId)}render(){let e="Continue in external window";this.error?e="Buy failed":this.selectedOnRampProvider&&(e=`Buy in ${this.selectedOnRampProvider?.label}`);let t=this.error?"Buy can be declined from your side or due to and error on the provider app":`We’ll notify you once your Buy is processed`;return(0,r.qy)`
      <wui-flex
        data-error=${(0,a.J)(this.error)}
        data-retry=${this.showRetry}
        flexDirection="column"
        alignItems="center"
        .padding=${["3xl","xl","xl","xl"]}
        gap="xl"
      >
        <wui-flex justifyContent="center" alignItems="center">
          <wui-visual
            name=${(0,a.J)(this.selectedOnRampProvider?.name)}
            size="lg"
            class="provider-image"
          >
          </wui-visual>

          ${this.error?null:this.loaderTemplate()}

          <wui-icon-box
            backgroundColor="error-100"
            background="opaque"
            iconColor="error-100"
            icon="close"
            size="sm"
            border
            borderColor="wui-color-bg-125"
          ></wui-icon-box>
        </wui-flex>

        <wui-flex flexDirection="column" alignItems="center" gap="xs">
          <wui-text variant="paragraph-500" color=${this.error?"error-100":"fg-100"}>
            ${e}
          </wui-text>
          <wui-text align="center" variant="small-500" color="fg-200">${t}</wui-text>
        </wui-flex>

        ${this.error?this.tryAgainTemplate():null}
      </wui-flex>

      <wui-flex .padding=${["0","xl","xl","xl"]} justifyContent="center">
        <wui-link @click=${this.onCopyUri} color="fg-200">
          <wui-icon size="xs" color="fg-200" slot="iconLeft" name="copy"></wui-icon>
          Copy link
        </wui-link>
      </wui-flex>
    `}watchTransactions(){this.selectedOnRampProvider&&"coinbase"===this.selectedOnRampProvider.name&&(this.startTime=Date.now(),this.initializeCoinbaseTransactions())}async initializeCoinbaseTransactions(){await this.watchCoinbaseTransactions(),this.intervalId=setInterval(()=>this.watchCoinbaseTransactions(),4e3)}async watchCoinbaseTransactions(){try{let e=u.U.state.address;if(!e)throw Error("No address found");(await j.T.fetchTransactions({account:e,onramp:"coinbase"})).data.filter(e=>new Date(e.metadata.minedAt)>new Date(this.startTime)||"ONRAMP_TRANSACTION_STATUS_IN_PROGRESS"===e.metadata.status).length?(clearInterval(this.intervalId),$.I.replace("OnRampActivity")):this.startTime&&Date.now()-this.startTime>=18e4&&(clearInterval(this.intervalId),this.error=!0)}catch(e){Z.P.showError(e)}}onTryAgain(){this.selectedOnRampProvider&&(this.error=!1,R.w.openHref(this.selectedOnRampProvider.url,"popupWindow","width=600,height=800,scrollbars=yes"))}tryAgainTemplate(){return this.selectedOnRampProvider?.url?(0,r.qy)`<wui-button size="md" variant="accent" @click=${this.onTryAgain.bind(this)}>
      <wui-icon color="inherit" slot="iconLeft" name="refresh"></wui-icon>
      Try again
    </wui-button>`:null}loaderTemplate(){let e=F.W.state.themeVariables["--w3m-border-radius-master"],t=e?parseInt(e.replace("px",""),10):4;return(0,r.qy)`<wui-loading-thumbnail radius=${9*t}></wui-loading-thumbnail>`}onCopyUri(){if(!this.selectedOnRampProvider?.url){Z.P.showError("No link found"),$.I.goBack();return}try{R.w.copyToClopboard(this.selectedOnRampProvider.url),Z.P.showSuccess("Link copied")}catch{Z.P.showError("Failed to copy")}}};V.styles=H,K([(0,o.wk)()],V.prototype,"intervalId",void 0),K([(0,o.wk)()],V.prototype,"selectedOnRampProvider",void 0),K([(0,o.wk)()],V.prototype,"uri",void 0),K([(0,o.wk)()],V.prototype,"ready",void 0),K([(0,o.wk)()],V.prototype,"showRetry",void 0),K([(0,o.wk)()],V.prototype,"buffering",void 0),K([(0,o.wk)()],V.prototype,"error",void 0),K([(0,o.wk)()],V.prototype,"startTime",void 0),K([(0,o.MZ)({type:Boolean})],V.prototype,"isMobile",void 0),K([(0,o.MZ)()],V.prototype,"onRetry",void 0),V=K([(0,d.EM)("w3m-buy-in-progress-view")],V);let J=class extends r.WF{render(){return(0,r.qy)`
      <wui-flex
        flexDirection="column"
        .padding=${["xxl","3xl","xl","3xl"]}
        alignItems="center"
        gap="xl"
      >
        <wui-visual name="onrampCard"></wui-visual>
        <wui-flex flexDirection="column" gap="xs" alignItems="center">
          <wui-text align="center" variant="paragraph-500" color="fg-100">
            Quickly and easily buy digital assets!
          </wui-text>
          <wui-text align="center" variant="small-400" color="fg-200">
            Simply select your preferred onramp provider and add digital assets to your account
            using your credit card or bank transfer
          </wui-text>
        </wui-flex>
        <wui-button @click=${$.I.goBack}>
          <wui-icon size="sm" color="inherit" name="add" slot="iconLeft"></wui-icon>
          Buy
        </wui-button>
      </wui-flex>
    `}};J=function(e,t,i,r){var o,a=arguments.length,s=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,r);else for(var n=e.length-1;n>=0;n--)(o=e[n])&&(s=(a<3?o(s):a>3?o(t,i,s):o(t,i))||s);return a>3&&s&&Object.defineProperty(t,i,s),s}([(0,d.EM)("w3m-what-is-a-buy-view")],J),i(65759);let Y=(0,r.AH)`
  :host {
    width: 100%;
  }

  wui-loading-spinner {
    position: absolute;
    top: 50%;
    right: 20px;
    transform: translateY(-50%);
  }

  .currency-container {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: var(--wui-spacing-1xs);
    height: 40px;
    padding: var(--wui-spacing-xs) var(--wui-spacing-1xs) var(--wui-spacing-xs)
      var(--wui-spacing-xs);
    min-width: 95px;
    border-radius: var(--FULL, 1000px);
    border: 1px solid var(--wui-color-gray-glass-002);
    background: var(--wui-color-gray-glass-002);
    cursor: pointer;
  }

  .currency-container > wui-image {
    height: 24px;
    width: 24px;
    border-radius: 50%;
  }
`;var Q=function(e,t,i,r){var o,a=arguments.length,s=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,r);else for(var n=e.length-1;n>=0;n--)(o=e[n])&&(s=(a<3?o(s):a>3?o(t,i,s):o(t,i))||s);return a>3&&s&&Object.defineProperty(t,i,s),s};let X=class extends r.WF{constructor(){super(),this.unsubscribe=[],this.type="Token",this.value=0,this.currencies=[],this.selectedCurrency=this.currencies?.[0],this.currencyImages=l.j.state.currencyImages,this.tokenImages=l.j.state.tokenImages,this.unsubscribe.push(n.aG.subscribeKey("purchaseCurrency",e=>{e&&"Fiat"!==this.type&&(this.selectedCurrency=this.formatPurchaseCurrency(e))}),n.aG.subscribeKey("paymentCurrency",e=>{e&&"Token"!==this.type&&(this.selectedCurrency=this.formatPaymentCurrency(e))}),n.aG.subscribe(e=>{"Fiat"===this.type?this.currencies=e.purchaseCurrencies.map(this.formatPurchaseCurrency):this.currencies=e.paymentCurrencies.map(this.formatPaymentCurrency)}),l.j.subscribe(e=>{this.currencyImages={...e.currencyImages},this.tokenImages={...e.tokenImages}}))}firstUpdated(){n.aG.getAvailableCurrencies()}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){let e=this.selectedCurrency?.symbol||"",t=this.currencyImages[e]||this.tokenImages[e];return(0,r.qy)`<wui-input-text type="number" size="lg" value=${this.value}>
      ${this.selectedCurrency?(0,r.qy)` <wui-flex
            class="currency-container"
            justifyContent="space-between"
            alignItems="center"
            gap="xxs"
            @click=${()=>x.W.open({view:`OnRamp${this.type}Select`})}
          >
            <wui-image src=${(0,a.J)(t)}></wui-image>
            <wui-text color="fg-100">${this.selectedCurrency.symbol}</wui-text>
          </wui-flex>`:(0,r.qy)`<wui-loading-spinner></wui-loading-spinner>`}
    </wui-input-text>`}formatPaymentCurrency(e){return{name:e.id,symbol:e.id}}formatPurchaseCurrency(e){return{name:e.name,symbol:e.symbol}}};X.styles=Y,Q([(0,o.MZ)({type:String})],X.prototype,"type",void 0),Q([(0,o.MZ)({type:Number})],X.prototype,"value",void 0),Q([(0,o.wk)()],X.prototype,"currencies",void 0),Q([(0,o.wk)()],X.prototype,"selectedCurrency",void 0),Q([(0,o.wk)()],X.prototype,"currencyImages",void 0),Q([(0,o.wk)()],X.prototype,"tokenImages",void 0),X=Q([(0,d.EM)("w3m-onramp-input")],X);let ee=(0,r.AH)`
  :host > wui-flex {
    width: 100%;
    max-width: 360px;
  }

  :host > wui-flex > wui-flex {
    border-radius: var(--wui-border-radius-l);
    width: 100%;
  }

  .amounts-container {
    width: 100%;
  }
`;var et=function(e,t,i,r){var o,a=arguments.length,s=a<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,r);else for(var n=e.length-1;n>=0;n--)(o=e[n])&&(s=(a<3?o(s):a>3?o(t,i,s):o(t,i))||s);return a>3&&s&&Object.defineProperty(t,i,s),s};let ei={USD:"$",EUR:"€",GBP:"\xa3"},er=[100,250,500,1e3],eo=class extends r.WF{constructor(){super(),this.unsubscribe=[],this.disabled=!1,this.caipAddress=I.W.state.activeCaipAddress,this.loading=x.W.state.loading,this.paymentCurrency=n.aG.state.paymentCurrency,this.paymentAmount=n.aG.state.paymentAmount,this.purchaseAmount=n.aG.state.purchaseAmount,this.quoteLoading=n.aG.state.quotesLoading,this.unsubscribe.push(I.W.subscribeKey("activeCaipAddress",e=>this.caipAddress=e),x.W.subscribeKey("loading",e=>{this.loading=e}),n.aG.subscribe(e=>{this.paymentCurrency=e.paymentCurrency,this.paymentAmount=e.paymentAmount,this.purchaseAmount=e.purchaseAmount,this.quoteLoading=e.quotesLoading}))}disconnectedCallback(){this.unsubscribe.forEach(e=>e())}render(){return(0,r.qy)`
      <wui-flex flexDirection="column" justifyContent="center" alignItems="center">
        <wui-flex flexDirection="column" alignItems="center" gap="xs">
          <w3m-onramp-input
            type="Fiat"
            @inputChange=${this.onPaymentAmountChange.bind(this)}
            .value=${this.paymentAmount||0}
          ></w3m-onramp-input>
          <w3m-onramp-input
            type="Token"
            .value=${this.purchaseAmount||0}
            .loading=${this.quoteLoading}
          ></w3m-onramp-input>
          <wui-flex justifyContent="space-evenly" class="amounts-container" gap="xs">
            ${er.map(e=>(0,r.qy)`<wui-button
                  variant=${this.paymentAmount===e?"accent":"neutral"}
                  size="md"
                  textVariant="paragraph-600"
                  fullWidth
                  @click=${()=>this.selectPresetAmount(e)}
                  >${`${ei[this.paymentCurrency?.id||"USD"]} ${e}`}</wui-button
                >`)}
          </wui-flex>
          ${this.templateButton()}
        </wui-flex>
      </wui-flex>
    `}templateButton(){return this.caipAddress?(0,r.qy)`<wui-button
          @click=${this.getQuotes.bind(this)}
          variant="main"
          fullWidth
          size="lg"
          borderRadius="xs"
        >
          Get quotes
        </wui-button>`:(0,r.qy)`<wui-button
          @click=${this.openModal.bind(this)}
          variant="accent"
          fullWidth
          size="lg"
          borderRadius="xs"
        >
          Connect wallet
        </wui-button>`}getQuotes(){this.loading||x.W.open({view:"OnRampProviders"})}openModal(){x.W.open({view:"Connect"})}async onPaymentAmountChange(e){n.aG.setPaymentAmount(Number(e.detail)),await n.aG.getQuote()}async selectPresetAmount(e){n.aG.setPaymentAmount(e),await n.aG.getQuote()}};eo.styles=ee,et([(0,o.MZ)({type:Boolean})],eo.prototype,"disabled",void 0),et([(0,o.wk)()],eo.prototype,"caipAddress",void 0),et([(0,o.wk)()],eo.prototype,"loading",void 0),et([(0,o.wk)()],eo.prototype,"paymentCurrency",void 0),et([(0,o.wk)()],eo.prototype,"paymentAmount",void 0),et([(0,o.wk)()],eo.prototype,"purchaseAmount",void 0),et([(0,o.wk)()],eo.prototype,"quoteLoading",void 0),eo=et([(0,d.EM)("w3m-onramp-widget")],eo)}}]);