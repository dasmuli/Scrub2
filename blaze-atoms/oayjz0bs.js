/*! Built with http://stenciljs.com */
const{h:t}=window.BlazeAtoms;class e{componentWillLoad(){this.tabs=Array.from(this.elem.querySelectorAll("blaze-tab"))}currentTab(){return this.tabs.findIndex(t=>t.open)}openTab(t){this.tabs[t].disabled||(this.tabs=this.tabs.map(t=>(t.open=!1,t)),this.tabs[t].open=!0)}render(){const e=this.type?`c-tabs--${this.type}`:"";return t("div",{class:`c-tabs ${e}`},t("div",{class:"c-tabs__nav"},t("div",{class:"c-tabs__headings"},this.tabs.map((e,a)=>{const s=e.disabled?"c-tab-heading--disabled":"",i=e.open?"c-tab-heading--active":"";return t("div",{class:`c-tab-heading ${s} ${i}`,onClick:()=>this.openTab(a)},e.header)}))),t("slot",null))}static get is(){return"blaze-tabs"}static get properties(){return{currentTab:{method:!0},elem:{elementRef:!0},openTab:{method:!0},tabs:{state:!0},type:{type:String,attr:"type"}}}}export{e as BlazeTabs};