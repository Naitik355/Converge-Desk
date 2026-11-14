import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { request } from "../api/client";
import {
  acceptProjectInvitation,
  getProjectInvitationDetails,
} from "../api/projects";

export function AcceptProjectInvitationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [invitation, setInvitation] = useState(null);
  const [invitationLoading, setInvitationLoading] = useState(true);
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadInvitation() {
      if (!token) {
        setError("This invitation link is missing its token.");
        setInvitationLoading(false);
        return;
      }

      try {
        const details = await getProjectInvitationDetails(token);
        if (!cancelled) setInvitation(details);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load invitation details.",
          );
        }
      } finally {
        if (!cancelled) setInvitationLoading(false);
      }
    }

    loadInvitation();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("This invitation link is missing its token.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        if (!invitation?.email) {
          throw new Error(
            "Invitation details are not available. Please reopen your invitation link.",
          );
        }

        await request("/accounts/signup/", {
          method: "POST",
          body: JSON.stringify({
            username,
            email: invitation.email,
            password,
          }),
        });
      }

      if (mode === "signup" || mode === "login") {
        await request("/accounts/login/", {
          method: "POST",
          body: JSON.stringify({ username, password }),
        });
      }

      await acceptProjectInvitation(token);
      setMessage("Invitation accepted! Redirecting to your projects…");
      setTimeout(() => navigate("/projects"), 1000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not accept the invitation.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#070b10] p-6">
      <section className="w-full max-w-md rounded-3xl border border-slate-800 bg-[#0d131c] p-8 shadow-2xl">
        <h1 className="text-xl font-bold text-white">
          Accept Project Invitation
        </h1>
        {invitationLoading ? (
          <p className="mt-3 text-sm text-slate-400">
            Loading invitation details…
          </p>
        ) : invitation ? (
          <div className="mt-3 rounded-xl bg-[#080d14] border border-slate-800 p-4 text-sm text-slate-200">
            <p>
              You've been invited to join{" "}
              <strong className="text-emerald-400">{invitation.project_name}</strong>.
            </p>
            <p className="mt-1 text-slate-300">
              Invited email: <strong className="text-slate-100">{invitation.email}</strong>
            </p>
            <p className="mt-1 text-slate-300">
              Role: <strong className="capitalize text-emerald-400">{invitation.role}</strong>
            </p>
          </div>
        ) : null}
        <p className="mt-3 text-xs text-slate-400">
          {mode === "signup"
            ? "Create an account using the email address that was invited."
            : "Sign in using the account associated with this invitation."}
        </p>

        <div className="mt-5 flex gap-2 p-1 bg-[#080d14] rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
              mode === "login" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
              mode === "signup" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Create account
          </button>
        </div>

        <form onSubmit={submit} className="mt-5 space-y-4">
          {mode === "signup" && (
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Email address
              <input
                type="email"
                required
                value={invitation?.email || email}
                onChange={(event) => setEmail(event.target.value)}
                readOnly={Boolean(invitation?.email)}
                className="mt-1 w-full bg-[#080d14] text-slate-100 border border-slate-800 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </label>
          )}

          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
            Username
            <input
              required
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-1 w-full bg-[#080d14] text-slate-100 border border-slate-800 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </label>

          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full bg-[#080d14] text-slate-100 border border-slate-800 rounded-xl p-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </label>

          {error && (
            <p role="alert" className="text-xs text-rose-400 bg-rose-950/40 border border-rose-800/60 p-2.5 rounded-xl">
              {error}
            </p>
          )}

          {message && (
            <p role="status" className="text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 p-2.5 rounded-xl">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 transition-colors shadow-lg shadow-emerald-950/40"
          >
            {loading
              ? "Please wait…"
              : mode === "signup"
                ? "Create account and accept"
                : "Sign in and accept"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-slate-400">
          Need help? Return to the{" "}
          <Link to="/login" className="underline text-emerald-400 hover:text-emerald-300">
            login page
          </Link>
          .
        </p>
      </section>
    </main>
  );
}
