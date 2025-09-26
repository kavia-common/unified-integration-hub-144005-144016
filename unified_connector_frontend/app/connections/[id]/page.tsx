"use client";

import React, { useEffect, useState } from "react";
import { browseContainers, getItemComments, getItemDetail, listItemsInContainer } from "../../../lib/api/connectors";
import Spinner from "../../../components/Spinner";
import ErrorBanner from "../../../components/ErrorBanner";

type Container = { id: string; name: string; type?: string };
type Item = { id: string; title: string; type?: string };

export default function ConnectionDetail({ params }: { params: { id: string } }) {
  const connectionId = decodeURIComponent(params.id);
  const [containers, setContainers] = useState<Container[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedContainer, setSelectedContainer] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [itemDetail, setItemDetail] = useState<any>(null);
  const [comments, setComments] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"detail" | "comments" | "raw">("detail");

  async function loadContainers() {
    setLoading(true);
    setError(null);
    const resp = await browseContainers(connectionId);
    if (resp.status === "ok") {
      setContainers(resp.data);
    } else {
      setError(resp.message);
    }
    setLoading(false);
  }

  async function loadItems(containerId: string) {
    setLoading(true);
    setError(null);
    const resp = await listItemsInContainer(connectionId, containerId);
    if (resp.status === "ok") {
      setItems(resp.data);
    } else {
      setError(resp.message);
    }
    setLoading(false);
  }

  async function loadItemDetail(itemId: string) {
    setLoading(true);
    setError(null);
    const [detailResp, commentsResp] = await Promise.all([
      getItemDetail(connectionId, itemId),
      getItemComments(connectionId, itemId),
    ]);
    if (detailResp.status === "ok") setItemDetail(detailResp.data);
    else setError(detailResp.message);

    if (commentsResp.status === "ok") setComments(commentsResp.data);
    else if (commentsResp.status === "error") setComments([]);

    setLoading(false);
  }

  useEffect(() => {
    loadContainers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionId]);

  return (
    <div className="section">
      <div className="card">
        <div className="cardHeader">
          <div>
            <div className="small">Connections / {connectionId}</div>
            <h1 className="h1">Connection Browser</h1>
            <p className="lead">Explore containers and items for this connection. View details, comments, and raw JSON.</p>
          </div>
          <a className="btn btnSecondary" href="/dashboard">Back</a>
        </div>
      </div>

      {error && <div style={{ marginTop: 12 }}><ErrorBanner message={error} onClose={() => setError(null)} /></div>}

      <div className="grid2" style={{ marginTop: 12 }}>
        <aside className="card">
          <div className="cardHeader">
            <h2 className="h2">Containers</h2>
            {loading ? <Spinner /> : <span className="updated">Updated</span>}
          </div>
          <div className="stack-8">
            {containers.map((c) => (
              <button
                key={c.id}
                className="btn btnSecondary fullOnMobile"
                onClick={() => {
                  setSelectedContainer(c.id);
                  setSelectedItem(null);
                  setItemDetail(null);
                  setComments(null);
                  loadItems(c.id);
                }}
                aria-label={`Select container ${c.name}`}
              >
                {c.name}
              </button>
            ))}
            {containers.length === 0 && <div className="small">No containers.</div>}
          </div>
        </aside>

        <section className="card">
          <div className="cardHeader">
            <h2 className="h2">Items</h2>
            {selectedContainer ? <span className="small">Container: {selectedContainer}</span> : <span className="small">Select a container</span>}
          </div>

          {!selectedContainer ? (
            <div className="small">Choose a container to list its items.</div>
          ) : (
            <div className="grid2">
              <div>
                <div className="stack-8">
                  {items.map((it) => (
                    <button
                      key={it.id}
                      className="btn btnSecondary fullOnMobile"
                      onClick={() => {
                        setSelectedItem(it.id);
                        loadItemDetail(it.id);
                      }}
                      aria-label={`Open item ${it.title}`}
                    >
                      {it.title}
                    </button>
                  ))}
                  {items.length === 0 && <div className="small">No items.</div>}
                </div>
              </div>
              <div>
                <div className="card">
                  <div className="row" style={{ gap: 8, marginBottom: 8 }}>
                    <button className={`btn ${tab==="detail" ? "btnPrimary" : "btnSecondary"}`} onClick={() => setTab("detail")}>Detail</button>
                    <button className={`btn ${tab==="comments" ? "btnPrimary" : "btnSecondary"}`} onClick={() => setTab("comments")}>Comments</button>
                    <button className={`btn ${tab==="raw" ? "btnPrimary" : "btnSecondary"}`} onClick={() => setTab("raw")}>Raw JSON</button>
                  </div>

                  {loading && <div className="row" style={{ gap: 8 }}><Spinner /><span className="small">Loading item…</span></div>}

                  {!loading && !selectedItem && <div className="small">Select an item to view details.</div>}

                  {!loading && selectedItem && tab === "detail" && (
                    <div className="stack-8">
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Item Detail</h3>
                      <pre style={{ whiteSpace: "pre-wrap", background: "#F9FAFB", padding: 12, borderRadius: 8, border: "1px solid var(--border-subtle)" }}>
                        {JSON.stringify(itemDetail || {}, null, 2)}
                      </pre>
                    </div>
                  )}

                  {!loading && selectedItem && tab === "comments" && (
                    <div className="stack-8">
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Comments</h3>
                      {comments && comments.length > 0 ? (
                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                          {comments.map((c, idx) => (
                            <li key={idx} className="small">{typeof c === "string" ? c : JSON.stringify(c)}</li>
                          ))}
                        </ul>
                      ) : (
                        <div className="small">No comments.</div>
                      )}
                    </div>
                  )}

                  {!loading && selectedItem && tab === "raw" && (
                    <div className="stack-8">
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Raw JSON</h3>
                      <pre style={{ whiteSpace: "pre-wrap", background: "#F9FAFB", padding: 12, borderRadius: 8, border: "1px solid var(--border-subtle)" }}>
                        {JSON.stringify({ detail: itemDetail, comments }, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
