import{B as f,R as m,n as y,bi as v,bj as B,t as k,D as w,T as P,b as p,g as d,h as s,e as u,y as r,O as c,x as t,P as $,K as C,w as h,I as D,J as A,N as S,be as I,ag as K}from"./index-D0duNJla.js";var T=`
    .p-panel {
        display: block;
        border: 1px solid dt('panel.border.color');
        border-radius: dt('panel.border.radius');
        background: dt('panel.background');
        color: dt('panel.color');
    }

    .p-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: dt('panel.header.padding');
        background: dt('panel.header.background');
        color: dt('panel.header.color');
        border-style: solid;
        border-width: dt('panel.header.border.width');
        border-color: dt('panel.header.border.color');
        border-radius: dt('panel.header.border.radius');
    }

    .p-panel-toggleable .p-panel-header {
        padding: dt('panel.toggleable.header.padding');
    }

    .p-panel-title {
        line-height: 1;
        font-weight: dt('panel.title.font.weight');
    }

    .p-panel-content {
        padding: dt('panel.content.padding');
    }

    .p-panel-footer {
        padding: dt('panel.footer.padding');
    }
`,L={root:function(n){var g=n.props;return["p-panel p-component",{"p-panel-toggleable":g.toggleable}]},header:"p-panel-header",title:"p-panel-title",headerActions:"p-panel-header-actions",pcToggleButton:"p-panel-toggle-button",contentContainer:"p-panel-content-container",content:"p-panel-content",footer:"p-panel-footer"},N=f.extend({name:"panel",style:T,classes:L}),E={name:"BasePanel",extends:k,props:{header:String,toggleable:Boolean,collapsed:Boolean,toggleButtonProps:{type:Object,default:function(){return{severity:"secondary",text:!0,rounded:!0}}}},style:N,provide:function(){return{$pcPanel:this,$parentInstance:this}}},j={name:"Panel",extends:E,inheritAttrs:!1,emits:["update:collapsed","toggle"],data:function(){return{d_collapsed:this.collapsed}},watch:{collapsed:function(n){this.d_collapsed=n}},methods:{toggle:function(n){this.d_collapsed=!this.d_collapsed,this.$emit("update:collapsed",this.d_collapsed),this.$emit("toggle",{originalEvent:n,value:this.d_collapsed})},onKeyDown:function(n){(n.code==="Enter"||n.code==="NumpadEnter"||n.code==="Space")&&(this.toggle(n),n.preventDefault())}},computed:{buttonAriaLabel:function(){return this.toggleButtonProps&&this.toggleButtonProps.ariaLabel?this.toggleButtonProps.ariaLabel:this.header},dataP:function(){return w({toggleable:this.toggleable})}},components:{PlusIcon:B,MinusIcon:v,Button:y},directives:{ripple:m}},V=["data-p"],M=["data-p"],O=["id"],R=["id","aria-labelledby"];function z(e,n,g,J,l,a){var b=P("Button");return d(),p("div",t({class:e.cx("root"),"data-p":a.dataP},e.ptmi("root")),[s("div",t({class:e.cx("header"),"data-p":a.dataP},e.ptm("header")),[r(e.$slots,"header",{id:e.$id+"_header",class:C(e.cx("title")),collapsed:l.d_collapsed},function(){return[e.header?(d(),p("span",t({key:0,id:e.$id+"_header",class:e.cx("title")},e.ptm("title")),$(e.header),17,O)):c("",!0)]}),s("div",t({class:e.cx("headerActions")},e.ptm("headerActions")),[r(e.$slots,"icons"),e.toggleable?r(e.$slots,"togglebutton",{key:0,collapsed:l.d_collapsed,toggleCallback:function(i){return a.toggle(i)},keydownCallback:function(i){return a.onKeyDown(i)}},function(){return[u(b,t({id:e.$id+"_header",class:e.cx("pcToggleButton"),"aria-label":a.buttonAriaLabel,"aria-controls":e.$id+"_content","aria-expanded":!l.d_collapsed,unstyled:e.unstyled,onClick:n[0]||(n[0]=function(o){return a.toggle(o)}),onKeydown:n[1]||(n[1]=function(o){return a.onKeyDown(o)})},e.toggleButtonProps,{pt:e.ptm("pcToggleButton")}),{icon:h(function(o){return[r(e.$slots,e.$slots.toggleicon?"toggleicon":"togglericon",{collapsed:l.d_collapsed},function(){return[(d(),D(A(l.d_collapsed?"PlusIcon":"MinusIcon"),t({class:o.class},e.ptm("pcToggleButton").icon),null,16,["class"]))]})]}),_:3},16,["id","class","aria-label","aria-controls","aria-expanded","unstyled","pt"])]}):c("",!0)],16)],16,M),u(K,t({name:"p-toggleable-content"},e.ptm("transition")),{default:h(function(){return[S(s("div",t({id:e.$id+"_content",class:e.cx("contentContainer"),role:"region","aria-labelledby":e.$id+"_header"},e.ptm("contentContainer")),[s("div",t({class:e.cx("content")},e.ptm("content")),[r(e.$slots,"default")],16),e.$slots.footer?(d(),p("div",t({key:0,class:e.cx("footer")},e.ptm("footer")),[r(e.$slots,"footer")],16)):c("",!0)],16,R),[[I,!l.d_collapsed]])]}),_:3},16)],16,V)}j.render=z;export{j as s};
