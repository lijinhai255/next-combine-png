(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[405],{5557:function(e,r,s){(window.__NEXT_P=window.__NEXT_P||[]).push(["/",function(){return s(6616)}])},6616:function(e,r,s){"use strict";s.r(r),s.d(r,{default:function(){return n}});var a=s(5893),t=s(7294);function n(){let[e,r]=(0,t.useState)(!1),[s,n]=(0,t.useState)(null),[l,i]=(0,t.useState)(null),[c,d]=(0,t.useState)(null),[o,m]=(0,t.useState)(null),[u,h]=(0,t.useState)([]),[g,x]=(0,t.useState)(!1),f=async()=>{try{x(!0),i(null);let e=await fetch("https://gif-converter.lijinhai255.workers.dev/api/images",{method:"GET",headers:{Accept:"application/json"}}),r=await e.json();if(!e.ok)throw Error(r.error||"Server error: ".concat(e.status));if(r.success&&r.images)h(r.images);else throw Error("Invalid response format")}catch(e){console.error("Error fetching images:",e),i(e.message)}finally{x(!1)}};return(0,t.useEffect)(()=>{f()},[]),(0,a.jsxs)("div",{className:"p-8 max-w-3xl mx-auto",children:[(0,a.jsx)("h1",{className:"text-3xl font-bold mb-6",children:"Image Converter Test"}),(0,a.jsxs)("div",{className:"mb-8",children:[(0,a.jsx)("h2",{className:"text-2xl font-semibold mb-4",children:"Original Images:"}),g?(0,a.jsx)("div",{className:"text-gray-600",children:"Loading images..."}):(0,a.jsx)("div",{className:"grid grid-cols-3 gap-4",children:u.map(e=>(0,a.jsxs)("div",{className:"p-4 bg-white border-2 border-gray-200 rounded-lg",children:[(0,a.jsx)("div",{className:"bg-gray-100 p-2 rounded-md",children:(0,a.jsx)("img",{src:e.url,alt:e.name,className:"w-full h-32 object-contain border border-gray-300",loading:"lazy"})}),(0,a.jsx)("div",{className:"mt-2 text-sm text-center text-gray-600",children:e.name})]},e.name))})]}),l&&(0,a.jsxs)("div",{className:"mb-6 p-4 bg-red-50 border border-red-200 rounded-lg",children:[(0,a.jsx)("div",{className:"font-semibold text-red-600",children:"Error:"}),(0,a.jsx)("div",{className:"text-red-700",children:l})]})]})}}},function(e){e.O(0,[774,888,179],function(){return e(e.s=5557)}),_N_E=e.O()}]);