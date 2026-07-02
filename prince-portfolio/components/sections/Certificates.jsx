"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { certificates } from "@/data/certificates";
import { scrollFadeUp, viewportOnce } from "@/lib/motion";

/* eslint-disable @next/next/no-img-element */

function isPdf(file) {
  return file?.split("?")[0].toLowerCase().endsWith(".pdf");
}

function CertificatePreview({ certificate }) {
  if (isPdf(certificate.file)) {
    return (
      <iframe
        title={`${certificate.title} preview`}
        src={`${certificate.file}#toolbar=0&navpanes=0&scrollbar=0&page=1&view=FitH`}
        tabIndex={-1}
        aria-hidden="true"
        className="h-full w-full pointer-events-none border-0 bg-background"
      />
    );
  }

  return (
    <Image
      src={certificate.image}
      alt={`${certificate.title} certificate thumbnail`}
      fill
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
    />
  );
}

function CertificateModal({ certificate, triggerRef, onClose }) {
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!certificate) return;

    const previousOverflow = document.body.style.overflow;
    const triggerElement = triggerRef.current;

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab" || !modalRef.current) return;

      const focusable = modalRef.current.querySelectorAll(
        'a[href], button:not([disabled]), iframe, object, [tabindex]:not([tabindex="-1"])',
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (!first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      triggerElement?.focus();
    };
  }, [certificate, onClose, triggerRef]);

  return (
    <AnimatePresence>
      {certificate ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={onClose}
        >
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="certificate-modal-title"
            className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-2xl"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-border px-4 py-3 sm:px-5">
              <div>
                <h3
                  id="certificate-modal-title"
                  className="text-base font-medium text-foreground"
                >
                  {certificate.title}
                </h3>
                <p className="mt-1 text-sm text-muted">
                  {certificate.issuer} - {certificate.date}
                </p>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                aria-label="Close certificate viewer"
                onClick={onClose}
                className="inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted transition-colors duration-200 hover:bg-surface-raised hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-auto bg-background p-4">
              {isPdf(certificate.file) ? (
                <iframe
                  title={`${certificate.title} certificate`}
                  src={certificate.file}
                  className="h-[75vh] w-full rounded-lg border border-border bg-surface"
                />
              ) : (
                <img
                  src={certificate.file}
                  alt={`${certificate.title} certificate from ${certificate.issuer}`}
                  className="mx-auto h-auto max-w-none rounded-lg"
                />
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default function Certificates() {
  const [activeCertificate, setActiveCertificate] = useState(null);
  const triggerRef = useRef(null);

  const openCertificate = (certificate, event) => {
    triggerRef.current = event.currentTarget;
    setActiveCertificate(certificate);
  };

  const closeCertificate = () => setActiveCertificate(null);

  return (
    <section
      id="certificates"
      aria-labelledby="certificates-heading"
      className="border-t border-border px-6 py-24 md:px-12 md:py-32 lg:px-20"
    >
      <div className="mx-auto max-w-5xl">
        <motion.p
          custom={0}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={scrollFadeUp}
          className="mb-4 text-sm font-medium tracking-wide text-accent uppercase"
        >
          Credentials
        </motion.p>

        <motion.h2
          id="certificates-heading"
          custom={0.05}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={scrollFadeUp}
          className="font-heading text-3xl leading-tight tracking-tight text-foreground sm:text-4xl"
        >
          Certificates
        </motion.h2>

        {certificates.length > 0 ? (
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {certificates.map((certificate, index) => (
              <motion.li
                key={`${certificate.title}-${certificate.issuer}`}
                custom={0.1 + index * 0.05}
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
                variants={scrollFadeUp}
              >
                <article
                  className="group relative flex h-full w-full flex-col overflow-hidden rounded-lg border border-border bg-surface text-left transition-[background-color,border-color,box-shadow,transform] duration-200 hover:-translate-y-1 hover:border-muted hover:bg-surface-raised hover:shadow-xl"
                >
                  <button
                    type="button"
                    onClick={(event) => openCertificate(certificate, event)}
                    aria-label={`View ${certificate.title} certificate`}
                    className="absolute inset-0 z-10 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  />
                  <span className="relative block aspect-[4/3] w-full overflow-hidden border-b border-border bg-background">
                    <CertificatePreview certificate={certificate} />
                  </span>
                  <span className="flex flex-1 flex-col p-5">
                    <span className="text-base font-medium leading-snug text-foreground">
                      {certificate.title}
                    </span>
                    <span className="mt-3 text-sm leading-relaxed text-muted">
                      {certificate.issuer} - {certificate.date}
                    </span>
                  </span>
                </article>
              </motion.li>
            ))}
          </ul>
        ) : (
          <motion.div
            custom={0.1}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
            variants={scrollFadeUp}
            className="mt-12 rounded-lg border border-border bg-surface p-5 text-sm leading-relaxed text-muted"
          >
            Add entries to data/certificates.js to show certificates here.
          </motion.div>
        )}
      </div>

      <CertificateModal
        certificate={activeCertificate}
        triggerRef={triggerRef}
        onClose={closeCertificate}
      />
    </section>
  );
}
