import{a as ut}from"./chunk-XO4MH7KM.mjs";import{a as ht}from"./chunk-5XOBKDLL.mjs";import"./chunk-SS4FF4DJ.mjs";import{a as yt}from"./chunk-MKFK4MVT.mjs";import"./chunk-OADDNPEB.mjs";import"./chunk-SPJMNTTA.mjs";import"./chunk-OWJUZ7TE.mjs";import"./chunk-SUDHTYQN.mjs";import"./chunk-6XODBXN5.mjs";import"./chunk-ABXA2HOG.mjs";import"./chunk-OXL26JQW.mjs";import"./chunk-XJT3CF22.mjs";import"./chunk-MW7CVTBC.mjs";import"./chunk-NVEORRSS.mjs";import"./chunk-5SWD2QAU.mjs";import"./chunk-ODVQFJVX.mjs";import"./chunk-IFZPXJGJ.mjs";import"./chunk-MM7XHQCH.mjs";import"./chunk-43ZOLS2F.mjs";import{o as j}from"./chunk-U6PWSEAI.mjs";import"./chunk-MA7QUKCW.mjs";import{O as it,T as st,U as ct,V as lt,W as dt,X as ft,Y as mt,Z as pt,i as Z,k as rt,u as X}from"./chunk-PI4FTPSL.mjs";import{b as H}from"./chunk-OOVTRAKB.mjs";import{a as r}from"./chunk-L27A2YCO.mjs";import{a as z}from"./chunk-SP2CHFBE.mjs";var gt=r(()=>({domains:new Map,transitions:[]}),"createDefaultData"),Y=gt(),Mt=r(()=>Y.domains,"getDomains"),zt=r(()=>Y.transitions,"getTransitions"),Lt=r(t=>{if(t)for(let e of t){let n=e.domain,o=(e.items??[]).map(c=>({label:c.label}));Y.domains.set(n,{name:n,items:o})}},"setDomains"),Nt=r(t=>{t&&(Y.transitions=t.filter(e=>e.from===e.to?(H.warn(`Cynefin: self-loop transition on domain "${e.from}" is not meaningful and will be skipped.`),!1):!0).map(e=>({from:e.from,to:e.to,label:e.label||void 0})))},"setTransitions"),Pt=r(()=>j({...rt.cynefin,...X().cynefin}),"getConfig"),It=r(()=>{st(),Y=gt()},"clear"),q={getDomains:Mt,getTransitions:zt,setDomains:Lt,setTransitions:Nt,getConfig:Pt,clear:It,setAccTitle:ct,getAccTitle:lt,setDiagramTitle:mt,getDiagramTitle:pt,getAccDescription:ft,setAccDescription:dt},Wt=r(t=>{ut(t,q),q.setDomains(t.domains),q.setTransitions(t.transitions)},"populate"),Rt={parse:r(async t=>{let e=await ht("cynefin",t);H.debug(e),Wt(e)},"parse")};function G(t){let e=t+1831565813|0;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}z(G,"seededRandom");r(G,"seededRandom");function $t(t){let e=0;for(let n=0;n<t.length;n++){let o=t.charCodeAt(n);e=(e<<5)-e+o,e|=0}return e}z($t,"hashString");r($t,"hashString");function bt(t,e){return typeof t=="number"&&Number.isFinite(t)&&t!==0?t:$t(e)}z(bt,"resolveSeed");r(bt,"resolveSeed");function wt(t,e,n,o){let c=t/2,m=o??t*.015,v=7,R=e/v,d=[];for(let a=0;a<=v;a++){let p=G(n+a*17)*m*2-m;d.push({x:c+p,y:a*R})}let D=`M${d[0].x},${d[0].y}`;for(let a=0;a<d.length-1;a++){let p=d[a],s=d[a+1],f=(p.y+s.y)/2,b=a%2===0?1:-1,h=m*1.5*b*G(n+a*31+7),F=p.x+h,V=f,_=s.x-h;D+=` C${F},${V} ${_},${f} ${s.x},${s.y}`}return D}z(wt,"generateFoldPath");r(wt,"generateFoldPath");function Ct(t,e,n,o){let c=e/2,m=o??e*.015,v=7,R=t/v,d=[];for(let a=0;a<=v;a++){let p=G(n+a*23)*m*2-m;d.push({x:a*R,y:c+p})}let D=`M${d[0].x},${d[0].y}`;for(let a=0;a<d.length-1;a++){let p=d[a],s=d[a+1],f=(p.x+s.x)/2,b=a%2===0?1:-1,h=m*1.5*b*G(n+a*37+11),F=f,V=p.y+h,_=f,L=s.y-h;D+=` C${F},${V} ${_},${L} ${s.x},${s.y}`}return D}z(Ct,"generateHorizontalBoundary");r(Ct,"generateHorizontalBoundary");function vt(t,e){let n=t/2,o=e*.5,c=e,m=t*.03;return[`M${n},${o}`,`C${n+m},${o+(c-o)*.2}`,`${n-m*1.5},${o+(c-o)*.55}`,`${n+m*.5},${o+(c-o)*.75}`,`C${n-m},${o+(c-o)*.85}`,`${n+m*.3},${o+(c-o)*.95}`,`${n},${c}`].join(" ")}z(vt,"generateCliffPath");r(vt,"generateCliffPath");function Dt(t,e,n,o){return[`M${t-n},${e}`,`A${n},${o} 0 1,1 ${t+n},${e}`,`A${n},${o} 0 1,1 ${t-n},${e}`,"Z"].join(" ")}z(Dt,"generateConfusionPath");r(Dt,"generateConfusionPath");var xt={complex:{model:"Probe \u2192 Sense \u2192 Respond",practice:"Emergent Practices"},complicated:{model:"Sense \u2192 Analyse \u2192 Respond",practice:"Good Practices"},clear:{model:"Sense \u2192 Categorise \u2192 Respond",practice:"Best Practices"},chaotic:{model:"Act \u2192 Sense \u2192 Respond",practice:"Novel Practices"},confusion:{model:"",practice:"Disorder"}},Ft=r((t,e)=>{let n=t/2,o=e/2;return{complex:{cx:n/2,cy:o/2,x:0,y:0,w:n,h:o},complicated:{cx:n+n/2,cy:o/2,x:n,y:0,w:n,h:o},chaotic:{cx:n/2,cy:o+o/2,x:0,y:o,w:n,h:o},clear:{cx:n+n/2,cy:o+o/2,x:n,y:o,w:n,h:o},confusion:{cx:n,cy:o,x:n*.7,y:o*.7,w:n*.6,h:o*.6}}},"getDomainLayouts"),Vt=r(()=>{let t=Z(),e=X();return j(t,e.themeVariables).cynefin},"getCynefinDomainColors"),J=3,_t=r((t,e,n,o)=>{let c=o.db,m=c.getDomains(),v=c.getTransitions(),R=c.getDiagramTitle(),d=c.getAccTitle(),D=c.getAccDescription(),a=c.getConfig(),p=Vt();H.debug("Rendering Cynefin diagram");let s=a.width,f=a.height,b=a.padding,h=a.showDomainDescriptions,F=a.boundaryAmplitude,V=s+b*2,_=f+b*2,L={complex:p.complexBg,complicated:p.complicatedBg,clear:p.clearBg,chaotic:p.chaoticBg,confusion:p.confusionBg},k=yt(e);it(k,_,V,a.useMaxWidth??!0),k.attr("viewBox",`0 0 ${V} ${_}`),d&&k.append("title").text(d),D&&k.append("desc").text(D);let T=k.append("g").attr("transform",`translate(${b}, ${b})`),E=Ft(s,f),K=bt(a.seed,e),kt=T.append("g").attr("class","cynefin-backgrounds"),U=["complex","complicated","chaotic","clear"];for(let l of U){let i=E[l];kt.append("rect").attr("class","cynefinDomain").attr("x",i.x).attr("y",i.y).attr("width",i.w).attr("height",i.h).attr("fill",L[l]).attr("fill-opacity",.4).attr("stroke","none")}let Q=T.append("g").attr("class","cynefin-boundaries");Q.append("path").attr("class","cynefinBoundary").attr("d",wt(s,f,K,F)).attr("fill","none"),Q.append("path").attr("class","cynefinBoundary").attr("d",Ct(s,f,K+100,F)).attr("fill","none"),Q.append("path").attr("class","cynefinCliff").attr("d",vt(s,f)).attr("fill","none");let Tt=s*.15,At=f*.15;T.append("path").attr("class","cynefinConfusion").attr("d",Dt(s/2,f/2,Tt,At)).attr("fill",L.confusion).attr("fill-opacity",.5);let tt=T.append("g").attr("class","cynefin-labels");for(let l of U){let i=E[l];tt.append("text").attr("class","cynefinDomainLabel").attr("x",i.cx).attr("y",h?i.cy-30:i.cy).attr("text-anchor","middle").attr("dominant-baseline","middle").text(l.charAt(0).toUpperCase()+l.slice(1))}if(tt.append("text").attr("class","cynefinDomainLabel").attr("x",s/2).attr("y",h?f/2-10:f/2).attr("text-anchor","middle").attr("dominant-baseline","middle").text("Confusion"),h){let l=T.append("g").attr("class","cynefin-subtitles");for(let i of U){let u=E[i],y=xt[i];l.append("text").attr("class","cynefinSubtitle").attr("x",u.cx).attr("y",u.cy-10).attr("text-anchor","middle").attr("dominant-baseline","middle").text(y.model),l.append("text").attr("class","cynefinSubtitle").attr("x",u.cx).attr("y",u.cy+5).attr("text-anchor","middle").attr("dominant-baseline","middle").text(y.practice)}l.append("text").attr("class","cynefinSubtitle").attr("x",s/2).attr("y",f/2+8).attr("text-anchor","middle").attr("dominant-baseline","middle").text(xt.confusion.practice)}let et=T.append("g").attr("class","cynefin-items"),A=26,nt=10,Bt=["complex","complicated","chaotic","clear","confusion"];for(let l of Bt){let i=m.get(l);if(!i||i.items.length===0)continue;let u=E[l],y=l==="confusion",N=i.items,P=0;y&&i.items.length>J&&(P=i.items.length-J,N=i.items.slice(0,J));let B;if(y){let g=h?22:14;B=u.cy+g}else B=u.cy+(h?25:15);if([...N].forEach((g,S)=>{let w=B+S*(A+4),M=et.append("g"),I=M.append("text").attr("class","cynefinItemText").attr("x",0).attr("y",A/2).attr("text-anchor","middle").attr("dominant-baseline","central").text(g.label),$=g.label.length*7,x=I.node();if(x&&typeof x.getBBox=="function"){let O=x.getBBox();O.width>0&&($=O.width)}let C=$+nt*2,W=u.cx-C/2;M.attr("transform",`translate(${W}, ${w})`),M.insert("rect","text").attr("class","cynefinItem").attr("x",0).attr("y",0).attr("width",C).attr("height",A).attr("rx",4).attr("ry",4).attr("fill",L[l]).attr("fill-opacity",.95),I.attr("x",C/2).attr("y",A/2)}),P>0){let g=B+N.length*(A+4),S=`+${P} more`,w=et.append("g"),M=w.append("text").attr("class","cynefinItemText").attr("x",0).attr("y",A/2).attr("text-anchor","middle").attr("dominant-baseline","central").text(S),I=S.length*7,$=M.node();if($&&typeof $.getBBox=="function"){let W=$.getBBox();W.width>0&&(I=W.width)}let x=I+nt*2,C=u.cx-x/2;w.attr("transform",`translate(${C}, ${g})`),w.insert("rect","text").attr("class","cynefinItemOverflow").attr("x",0).attr("y",0).attr("width",x).attr("height",A).attr("rx",4).attr("ry",4).attr("fill",L[l]).attr("fill-opacity",.6),M.attr("x",x/2).attr("y",A/2)}}if(v.length>0){let l=k.select("defs").empty()?k.append("defs"):k.select("defs"),i=`cynefin-arrow-${e}`;l.append("marker").attr("id",i).attr("viewBox","0 0 10 10").attr("refX",9).attr("refY",5).attr("markerWidth",6).attr("markerHeight",6).attr("orient","auto-start-reverse").append("path").attr("d","M 0 0 L 10 5 L 0 10 z").attr("class","cynefinArrowHead");let u=T.append("g").attr("class","cynefin-arrows");v.forEach(y=>{let N=E[y.from],P=E[y.to];if(!N||!P)return;if(y.from===y.to){H.warn(`Cynefin renderer: skipping self-loop on domain "${y.from}"`);return}let B=N.cx,g=N.cy,S=P.cx,w=P.cy,M=(B+S)/2,I=(g+w)/2,$=S-B,x=w-g,C=Math.sqrt($*$+x*x),W=C*.15,O=-x/C,St=$/C,ot=M+O*W,at=I+St*W;u.append("path").attr("class","cynefinArrowLine").attr("d",`M${B},${g} Q${ot},${at} ${S},${w}`).attr("fill","none").attr("marker-end",`url(#${i})`),y.label&&u.append("text").attr("class","cynefinArrowLabel").attr("x",ot).attr("y",at-6).attr("text-anchor","middle").attr("dominant-baseline","auto").text(y.label)})}R&&T.append("text").attr("class","cynefinTitle").attr("x",s/2).attr("y",-b/2).attr("text-anchor","middle").attr("dominant-baseline","middle").text(R)},"draw"),Et={draw:_t},Ht=r(()=>{let t=Z(),e=X();return j(t,e.themeVariables).cynefin},"getCynefinTheme"),Gt=r(()=>{let t=Ht();return`
	.cynefinDomain {
		stroke: none;
	}
	.cynefinDomainLabel {
		font-size: ${t.domainFontSize}px;
		font-weight: bold;
		fill: ${t.labelColor};
	}
	.cynefinSubtitle {
		font-size: ${t.itemFontSize-1}px;
		fill: ${t.textColor};
		font-style: italic;
	}
	.cynefinItem {
		fill-opacity: 0.95;
		stroke: ${t.boundaryColor};
		stroke-width: 1;
	}
	.cynefinItemText {
		font-size: ${t.itemFontSize}px;
		fill: ${t.textColor};
	}
	.cynefinItemOverflow {
		fill-opacity: 0.6;
		stroke: ${t.boundaryColor};
		stroke-width: 1;
		stroke-dasharray: 3 2;
	}
	.cynefinBoundary {
		stroke: ${t.boundaryColor};
		stroke-width: ${t.boundaryWidth};
		stroke-dasharray: 6 3;
	}
	.cynefinCliff {
		stroke: ${t.cliffColor};
		stroke-width: ${t.cliffWidth};
	}
	.cynefinConfusion {
		stroke: ${t.boundaryColor};
		stroke-width: 1.5;
		stroke-dasharray: 4 2;
	}
	.cynefinArrowLine {
		stroke: ${t.arrowColor};
		stroke-width: ${t.arrowWidth};
		fill: none;
	}
	.cynefinArrowHead {
		fill: ${t.arrowColor};
		stroke: none;
	}
	.cynefinArrowLabel {
		font-size: ${t.itemFontSize-1}px;
		fill: ${t.textColor};
	}
	.cynefinTitle {
		font-size: ${t.domainFontSize+2}px;
		font-weight: bold;
		fill: ${t.labelColor};
	}
	`},"styles"),Yt=Gt,Jt={parser:Rt,db:q,renderer:Et,styles:Yt};export{Jt as diagram};
