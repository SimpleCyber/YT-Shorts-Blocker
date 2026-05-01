"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useFocusData } from "../../lib/FocusDataContext";

interface CustomBlockPageProps {
  isAdminUnlocked: boolean;
}

export default function CustomBlockPage({
  isAdminUnlocked,
}: CustomBlockPageProps) {
  const { data, updateData } = useFocusData();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local editor state (synced from context on mount)
  const [mode, setMode] = useState<"default" | "custom">(
    data.customBlockPage?.mode || "default",
  );
  const [imageUrl, setImageUrl] = useState(
    data.customBlockPage?.imageUrl || "",
  );
  const [header, setHeader] = useState(data.customBlockPage?.header || "");
  const [subtitle, setSubtitle] = useState(
    data.customBlockPage?.subtitle || "",
  );
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [saved, setSaved] = useState(false);
  const [localPreview, setLocalPreview] = useState(""); // For instant preview before upload completes
  const [isEditing, setIsEditing] = useState(false);

  // Sync from context only on mount to prevent real-time Firestore updates from interfering with typing
  useEffect(() => {
    if (data.customBlockPage && mode === "default" && !header && !subtitle) {
      setMode(data.customBlockPage.mode || "default");
      setImageUrl(data.customBlockPage.imageUrl || "");
      setHeader(data.customBlockPage.header || "");
      setSubtitle(data.customBlockPage.subtitle || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImageUpload = useCallback(async (file: File) => {
    if (file.size > 3 * 1024 * 1024) {
      setUploadError("Image must be under 3MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select a valid image file");
      return;
    }

    setUploadError("");
    setUploading(true);

    // Instant local preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setLocalPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      // Convert to base64 for upload
      const base64 = await new Promise<string>((resolve) => {
        const r = new FileReader();
        r.onload = (e) => resolve(e.target?.result as string);
        r.readAsDataURL(file);
      });

      const res = await fetch("/api/upload-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64 }),
      });

      if (!res.ok) throw new Error("Upload failed");

      const { url } = await res.json();
      setImageUrl(url);
      setLocalPreview(""); // Clear local preview, use Cloudinary URL
    } catch (err) {
      setUploadError("Failed to upload image. Please try again.");
      setLocalPreview("");
    } finally {
      setUploading(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleImageUpload(file);
    },
    [handleImageUpload],
  );

  const handleSave = () => {
    const currentVersion = data.customBlockPage?.version || 0;
    updateData({
      customBlockPage: {
        mode,
        imageUrl,
        header,
        subtitle,
        version: currentVersion + 1,
      },
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const removeImage = () => {
    setImageUrl("");
    setLocalPreview("");
  };

  const previewImage = localPreview || imageUrl;
  const hasChanges =
    mode !== (data.customBlockPage?.mode || "default") ||
    imageUrl !== (data.customBlockPage?.imageUrl || "") ||
    header !== (data.customBlockPage?.header || "") ||
    subtitle !== (data.customBlockPage?.subtitle || "");

  // Locked state for non-premium
  if (!isAdminUnlocked) {
    return (
      <section className="view-section active">
        <h1 className="page-title">Custom Block Page</h1>
        <p className="page-desc">
          Personalize the screen users see when a site is blocked.
        </p>
        <div
          className="card"
          style={{ textAlign: "center", padding: "60px 20px" }}
        >
          <i
            className="fas fa-paint-brush"
            style={{
              fontSize: "48px",
              color: "var(--primary)",
              marginBottom: "20px",
              display: "block",
            }}
          ></i>
          <h3>Premium Feature</h3>
          <p style={{ color: "var(--text-muted)", marginTop: "12px" }}>
            Upgrade to Unlimited to customize your block page with your own
            images, headers, and subtitles.
          </p>
          <button
            className="btn-premium"
            style={{
              marginTop: "20px",
              padding: "12px 32px",
              fontSize: "14px",
            }}
          >
            Go Unlimited
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="view-section active">
      <style>{`
        .cbp-container {
          animation: fadeIn 0.3s ease;
        }

        /* ── Live Preview ── */
        .cbp-preview-frame {
          width: 100%;
          aspect-ratio: 16 / 9;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid var(--border);
          box-shadow: 0 8px 32px rgba(0,0,0,0.08);
          position: relative;
          background: radial-gradient(circle at top right, #1e293b, #0f172a);
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          font-family: 'Outfit', sans-serif;
          margin-bottom: 32px;
        }

        .cbp-preview-left {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 8% 6%;
          border-right: 1px solid rgba(255,255,255,0.1);
          overflow: hidden;
        }

        .cbp-preview-left-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          z-index: 0;
        }

        .cbp-preview-left-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 100%);
          z-index: 1;
        }

        .cbp-preview-left-content {
          position: relative;
          z-index: 2;
        }

        /* Default mode left panel styles */
        .cbp-preview-brand {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 3px;
          color: #6366f1;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .cbp-preview-quote {
          font-size: clamp(14px, 2.5vw, 26px);
          line-height: 1.25;
          font-weight: 700;
          margin-bottom: 10px;
          background: linear-gradient(to bottom right, #fff, #94a3b8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .cbp-preview-author {
          font-size: 11px;
          color: #94a3b8;
          font-weight: 300;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .cbp-preview-author::before {
          content: '';
          width: 20px;
          height: 1px;
          background: #6366f1;
        }

        .cbp-preview-tip {
          margin-top: auto;
          padding: 12px;
          background: rgba(30, 41, 59, 0.7);
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .cbp-preview-tip-title {
          font-size: 9px;
          color: #f59e0b;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .cbp-preview-tip-text {
          font-size: 9px;
          color: #94a3b8;
          line-height: 1.4;
        }

        /* Custom mode left panel styles */
        .cbp-custom-header {
          font-size: clamp(18px, 3vw, 36px);
          font-weight: 700;
          color: #fff;
          text-shadow: 0 2px 12px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.4);
          line-height: 1.2;
          margin-bottom: 10px;
          word-break: break-word;
        }

        .cbp-custom-subtitle {
          font-size: clamp(11px, 1.5vw, 16px);
          color: rgba(255,255,255,0.85);
          text-shadow: 0 1px 8px rgba(0,0,0,0.4);
          line-height: 1.5;
          font-weight: 400;
          word-break: break-word;
        }

        /* Right panel (timer mock) */
        .cbp-preview-right {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(255,255,255,0.02);
          gap: 8px;
        }

        .cbp-mock-timer {
          font-size: clamp(28px, 5vw, 52px);
          font-weight: 700;
          color: #f8fafc;
          font-variant-numeric: tabular-nums;
        }

        .cbp-mock-label {
          font-size: 10px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 2px;
        }

        .cbp-mock-hourglass {
          width: 60px;
          height: 80px;
          margin-bottom: 8px;
          opacity: 0.2;
        }

        /* ── Inline Editing ── */
        .cbp-inline-input {
          background: transparent;
          border: 1px dashed transparent;
          border-radius: 8px;
          color: #fff;
          width: 100%;
          outline: none;
          transition: all 0.2s;
          padding: 8px 12px;
          margin-left: -12px;
          font-family: inherit;
        }

        .cbp-inline-input:focus, .cbp-inline-input:hover {
          background: rgba(0, 0, 0, 0.4);
          border-color: var(--primary);
        }

        .cbp-inline-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .cbp-inline-header {
          font-size: clamp(18px, 3vw, 36px);
          font-weight: 700;
          text-shadow: 0 2px 12px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.4);
          line-height: 1.2;
          margin-bottom: 10px;
        }

        .cbp-inline-subtitle {
          font-size: clamp(11px, 1.5vw, 16px);
          text-shadow: 0 1px 8px rgba(0,0,0,0.4);
          line-height: 1.5;
          font-weight: 400;
        }

        .cbp-preview-left.editable:hover .cbp-upload-btn {
          opacity: 1;
          transform: translateY(0);
        }

        .cbp-upload-btn {
          position: absolute;
          top: 20px;
          right: 20px;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          color: white;
          border: 1px solid rgba(255,255,255,0.2);
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          opacity: 0;
          transform: translateY(-5px);
          transition: all 0.2s ease;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .cbp-upload-btn:hover {
          background: var(--primary);
          border-color: var(--primary);
        }
           .cbp-save-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        .cbp-saved-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: var(--success);
          animation: cbpSlideIn 0.3s ease;
        }

        .cbp-empty-bg {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.2);
          border: 2px dashed rgba(255,255,255,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.5);
          font-size: 14px;
          font-weight: 600;
          z-index: 0;
          margin: 16px;
          border-radius: 12px;
        }
      `}</style>

      <div className="cbp-container">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "32px",
          }}
        >
          <div>
            <h1
              className="page-title"
              style={{
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              Custom Block Page
              <div
                className="tooltip-container"
                style={{ display: "inline-flex", position: "relative", zIndex: 9999 }}
              >
                <i
                  className="fas fa-question-circle tooltip-icon"
                  style={{ color: "var(--text-muted)", fontSize: "16px" }}
                ></i>
                <div
                  className="tooltip-content"
                  style={{ fontWeight: 400, fontSize: "13px", zIndex: 9999 }}
                >
                  <b>What is this for?</b>
                  <br />
                  1. If enabled, the block screen will use your custom image,
                  header, and subtitle on the left side.
                  <br />
                  <br />
                  2. If disabled, it falls back to the default layout
                  (motivational quotes and focus tips).
                </div>
              </div>
            </h1>
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: "14px",
                marginTop: "4px",
              }}
            >
              Personalize the screen users see when a site is blocked.
            </p>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              background: "var(--bg-card)",
              padding: "10px 16px",
              borderRadius: "10px",
              border: "1px solid var(--border)",
            }}
          >
            <span
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "var(--text-main)",
              }}
            >
              Enable
            </span>
            <label className="switch">
              <input
                type="checkbox"
                checked={mode === "custom"}
                onChange={(e) => {
                  const newMode = e.target.checked ? "custom" : "default";
                  setMode(newMode);
                  // Auto-save on toggle
                  const currentVersion = data.customBlockPage?.version || 0;
                  updateData({
                    customBlockPage: {
                      mode: newMode,
                      imageUrl,
                      header,
                      subtitle,
                      version: currentVersion + 1,
                    },
                  });
                  setSaved(true);
                  setTimeout(() => setSaved(false), 2500);
                }}
              />
              <span className="slider"></span>
            </label>
          </div>
        </div>

        {/* ── Live Preview ── */}
        <div className="cbp-preview-frame">
          {/* Left Panel */}
          <div
            className={`cbp-preview-left ${mode === "custom" ? "editable" : ""}`}
          >
            {mode === "custom" && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                    e.target.value = "";
                  }}
                />

                {previewImage ? (
                  <div
                    className="cbp-preview-left-bg"
                    style={{ backgroundImage: `url(${previewImage})` }}
                  />
                ) : (
                  <div className="cbp-empty-bg">
                    <i className="fas fa-image" style={{ marginRight: 8 }}></i>{" "}
                    No Background
                  </div>
                )}
                <div className="cbp-preview-left-overlay" />

                {!isEditing && (
                  <button 
                    className="cbp-upload-btn"
                    onClick={() => setIsEditing(true)}
                  >
                    <i className="fas fa-pencil-alt"></i> Edit Content
                  </button>
                )}

                {isEditing && (
                  <button 
                    className="cbp-upload-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    {uploading ? (
                      <><i className="fas fa-circle-notch fa-spin"></i> Uploading...</>
                    ) : (
                      <><i className="fas fa-camera"></i> Change Background</>
                    )}
                  </button>
                )}

                {uploadError && (
                  <div
                    style={{
                      position: "absolute",
                      top: 60,
                      right: 20,
                      background: "rgba(239,68,68,0.9)",
                      color: "white",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      zIndex: 10,
                    }}
                  >
                    {uploadError}
                  </div>
                )}
              </>
            )}

            <div
              className="cbp-preview-left-content"
              style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                justifyContent: "center",
              }}
            >
              {mode === "default" ? (
                <>
                  <div className="cbp-preview-brand">FocusShield</div>
                  <div className="cbp-preview-quote">
                    &quot;Distraction is the thief of time.&quot;
                  </div>
                  <div className="cbp-preview-author">Marcus Aurelius</div>
                  <div style={{ marginTop: "auto", paddingTop: "24px" }}>
                    <div className="cbp-preview-tip">
                      <div className="cbp-preview-tip-title">💡 FOCUS TIP</div>
                      <div className="cbp-preview-tip-text">
                        It takes an average of 23 minutes to regain full focus
                        after a distraction.
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <input
                    className="cbp-inline-input cbp-inline-header"
                    type="text"
                    value={header}
                    onChange={(e) => setHeader(e.target.value.slice(0, 80))}
                    placeholder="Enter Custom Header..."
                  />
                  <input
                    className="cbp-inline-input cbp-inline-subtitle"
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value.slice(0, 150))}
                    placeholder="Enter subtitle message..."
                  />
                </>
              )}
            </div>
          </div>

          {/* Right Panel (Static Timer Mock) */}
          <div className="cbp-preview-right">
            <svg
              className="cbp-mock-hourglass"
              viewBox="0 0 60 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="4" y="2" width="52" height="6" rx="3" fill="#94a3b8" />
              <rect x="4" y="72" width="52" height="6" rx="3" fill="#94a3b8" />
              <path
                d="M10 8 L10 30 L30 45 L50 30 L50 8"
                stroke="#94a3b8"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M10 72 L10 50 L30 45 L50 50 L50 72"
                stroke="#94a3b8"
                strokeWidth="2"
                fill="none"
              />
            </svg>
            <div className="cbp-mock-timer">60</div>
            <div className="cbp-mock-label">seconds left</div>
          </div>
        </div>

        {/* ── Save Bar ── */}
        <div className="cbp-save-bar">
          {saved && (
            <div className="cbp-saved-badge">
              <i className="fas fa-check-circle" /> Saved & synced to extension
            </div>
          )}
          <button
            className="cbp-save-btn"
            onClick={handleSave}
            disabled={uploading || (!isEditing && hasChanges === false)}
          >
            <i className="fas fa-save" /> Save Changes
          </button>
        </div>
      </div>
    </section>
  );
}
