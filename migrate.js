const fs = require('fs');
const path = require('path');

const optionsHtmlPath = path.join(__dirname, 'extension', 'options.html');
const optionsJsPath = path.join(__dirname, 'extension', 'options.js');
const dashboardPagePath = path.join(__dirname, 'website', 'src', 'app', 'dashboard', 'page.tsx');

const htmlContent = fs.readFileSync(optionsHtmlPath, 'utf8');
const jsContent = fs.readFileSync(optionsJsPath, 'utf8');

// Extract body inner HTML
const bodyMatch = htmlContent.match(/<body>([\s\S]*?)<script src="options.js"><\/script>[\s\S]*?<\/body>/);
let innerHtml = bodyMatch ? bodyMatch[1] : '';

// Replace icon.png with /icon.png
innerHtml = innerHtml.replace(/src="icon.png"/g, 'src="/icon.png"');

// Replace chrome.storage.local with customStorage
let modifiedJs = jsContent.replace(/chrome\.storage\.local\./g, 'customStorage.');

// Prepare the Next.js page content
const pageContent = `
"use client";

import React, { useEffect } from 'react';
import './dashboard.css';

export default function Dashboard() {
  useEffect(() => {
    const EXTENSION_ID = "iikfkgaamfbbcglnimebghifbgeofoln";
    const customStorage = {
        get: (keys, callback) => {
            if (window.chrome && window.chrome.runtime) {
                window.chrome.runtime.sendMessage(EXTENSION_ID, { action: "getData", keys }, (response) => {
                    if (window.chrome.runtime && window.chrome.runtime.lastError) {
                        console.error("Extension not connected:", window.chrome.runtime.lastError);
                        callback({});
                    } else {
                        callback(response || {});
                    }
                });
            } else {
                console.warn("Chrome runtime not available.");
                callback({});
            }
        },
        set: (data, callback) => {
            if (window.chrome && window.chrome.runtime) {
                window.chrome.runtime.sendMessage(EXTENSION_ID, { action: "setData", data }, (response) => {
                    if (window.chrome.runtime && window.chrome.runtime.lastError) {
                        console.error("Extension not connected:", window.chrome.runtime.lastError);
                    }
                    if (callback) callback();
                });
            } else {
                console.warn("Chrome runtime not available.");
                if (callback) callback();
            }
        }
    };

    // Inject JS logic
    ${modifiedJs}

  }, []);

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      <div className="dashboard-container" dangerouslySetInnerHTML={{ __html: \`${innerHtml.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\` }} />
    </>
  );
}
`;

fs.writeFileSync(dashboardPagePath, pageContent);
console.log('Successfully generated page.tsx');
