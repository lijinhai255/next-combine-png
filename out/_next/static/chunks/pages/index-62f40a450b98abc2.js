(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[405],{5557:function(e,s,t){(window.__NEXT_P=window.__NEXT_P||[]).push(["/",function(){return t(6616)}])},6616:function(e,s,t){"use strict";t.r(s),t.d(s,{default:function(){return a}});var n=t(5893),r=t(7294);function a(){let[e,s]=(0,r.useState)(!1),[t,a]=(0,r.useState)(null),[l,o]=(0,r.useState)(null),[i,c]=(0,r.useState)(null),d=async()=>{try{s(!0),o(null),c(null);let e=new Blob(["test data"],{type:"image/png"}),t=new FormData;t.append("image",e,"test.png"),console.log("Sending request...");let n=await fetch("https://gif-converter.lijinhai255.workers.dev/api/gif-converter",{method:"POST",headers:{Accept:"application/json"},body:t});console.log("Response status:",n.status);let r=await n.json();if(console.log("Response data:",r),!n.ok)throw c(r.debug||{}),Error(r.details||"Server error: ".concat(n.status));if(r.success&&r.image)a(r.image),c(r.debug||{});else throw Error("Invalid response format")}catch(e){console.error("Error creating GIF:",e),o(e.message)}finally{s(!1)}};return(0,n.jsxs)("div",{className:"p-4",children:[(0,n.jsx)("h1",{className:"text-2xl font-bold mb-4",children:"Image Converter Test"}),(0,n.jsx)("button",{onClick:d,disabled:e,className:"bg-blue-500 text-white px-4 py-2 rounded mb-4 disabled:bg-gray-400",children:e?"Processing...":"Test Conversion"}),l&&(0,n.jsxs)("div",{className:"text-red-500 mb-4 p-4 bg-red-50 rounded",children:[(0,n.jsx)("div",{className:"font-bold",children:"Error:"}),(0,n.jsx)("div",{children:l})]}),i&&(0,n.jsxs)("div",{className:"mb-4 p-4 bg-gray-50 rounded",children:[(0,n.jsx)("div",{className:"font-bold",children:"Debug Info:"}),(0,n.jsx)("pre",{className:"whitespace-pre-wrap",children:JSON.stringify(i,null,2)})]}),t&&(0,n.jsxs)("div",{children:[(0,n.jsx)("h2",{className:"text-xl font-bold mb-2",children:"Processed Image:"}),(0,n.jsx)("img",{src:t,alt:"Processed",className:"w-96"})]})]})}}},function(e){e.O(0,[774,888,179],function(){return e(e.s=5557)}),_N_E=e.O()}]);