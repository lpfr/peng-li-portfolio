"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";

type PreviewState = {
  active: boolean;
  title: string;
  tags: string;
  image: string;
  x: number;
  y: number;
};

export default function PortfolioEffects() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [preview, setPreview] = useState<PreviewState>({
    active: false,
    title: "",
    tags: "",
    image: "",
    x: 0,
    y: 0
  });

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".identitySection h2 span").forEach((word, index) => {
        gsap.fromTo(
          word,
          { yPercent: 120, opacity: 0, scaleY: 1.18, transformOrigin: "50% 100%" },
          {
            yPercent: 0,
            opacity: 1,
            scaleY: 1,
            duration: 1.1,
            ease: "expo.out",
            delay: index * 0.08,
            scrollTrigger: {
              trigger: ".identitySection",
              start: "top 62%",
              end: "bottom 45%",
              toggleActions: "play none none reverse"
            }
          }
        );
      });

      gsap.utils.toArray<HTMLElement>("section:not(.hero), footer").forEach((section) => {
        const children = section.querySelectorAll(
          ".sectionKicker, h2, .openingStoryText > *, .openingCapability, .sectionLead, .studioFlow > *, .studioMeta, .darkLead, .skillCloud, .coordinatesMini, .workIndex, .glimpseGrid, .processGrid, .siteFooter > *"
        );

        gsap.fromTo(
          children.length ? children : section,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.08,
            scrollTrigger: {
              trigger: section,
              start: "top 74%",
              once: true
            }
          }
        );
      });

      gsap.to(".floatingPaperGuide", {
        y: -10,
        rotate: 7,
        duration: 2.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            scrub: 1.1
          }
        })
        .fromTo(
          ".floatingPaperGuide",
          { x: 0, y: 0, rotate: -18, scale: 0.82, opacity: 0 },
          { x: "-14vw", y: "26vh", rotate: 42, scale: 1, opacity: 0.52, ease: "none" },
          0
        )
        .to(
          ".floatingPaperGuide",
          { x: "-58vw", y: "118vh", rotate: -26, scale: 0.72, opacity: 0.42, ease: "none" },
          0.28
        )
        .to(
          ".floatingPaperGuide",
          { x: "-20vw", y: "232vh", rotate: 64, scale: 0.46, opacity: 0.28, ease: "none" },
          0.62
        )
        .to(
          ".floatingPaperGuide",
          { x: "-64vw", y: "360vh", rotate: 120, scale: 0.28, opacity: 0, ease: "none" },
          0.86
        );

      gsap.utils.toArray<HTMLElement>(".glimpseBlock").forEach((block, index) => {
        gsap.to(block, {
          y: index % 2 === 0 ? -42 : 34,
          ease: "none",
          scrollTrigger: {
            trigger: ".visualGlimpse",
            start: "top bottom",
            end: "bottom top",
            scrub: 1
          }
        });
      });

      const magneticTargets = gsap.utils.toArray<HTMLElement>(
        ".handButton, .calibrateButton, .siteFooter a"
      );

      magneticTargets.forEach((target) => {
        const onMove = (event: MouseEvent) => {
          const rect = target.getBoundingClientRect();
          const x = event.clientX - (rect.left + rect.width / 2);
          const y = event.clientY - (rect.top + rect.height / 2);
          gsap.to(target, { x: x * 0.18, y: y * 0.32, duration: 0.35, ease: "power3.out" });
        };
        const onLeave = () => {
          gsap.to(target, { x: 0, y: 0, duration: 0.55, ease: "elastic.out(1, 0.45)" });
        };

        target.addEventListener("mousemove", onMove);
        target.addEventListener("mouseleave", onLeave);
      });
    });

    return () => context.revert();
  }, []);

  useEffect(() => {
    if (!previewRef.current) return;

    gsap.to(previewRef.current, {
      x: preview.x + 26,
      y: preview.y + 26,
      opacity: preview.active ? 1 : 0,
      scale: preview.active ? 1 : 0.92,
      duration: 0.28,
      ease: "power3.out"
    });
  }, [preview]);

  useEffect(() => {
    const rows = Array.from(document.querySelectorAll<HTMLElement>(".workRow"));

    const cleanups = rows.map((row) => {
      const onEnter = (event: MouseEvent) => {
        setPreview({
          active: true,
          title: row.dataset.title ?? "",
          tags: row.dataset.tags ?? "",
          image: row.dataset.preview ?? "",
          x: event.clientX,
          y: event.clientY
        });
      };
      const onMove = (event: MouseEvent) => {
        setPreview((current) => ({
          ...current,
          x: event.clientX,
          y: event.clientY
        }));
      };
      const onLeave = () => {
        setPreview((current) => ({ ...current, active: false }));
      };

      row.addEventListener("mouseenter", onEnter);
      row.addEventListener("mousemove", onMove);
      row.addEventListener("mouseleave", onLeave);

      return () => {
        row.removeEventListener("mouseenter", onEnter);
        row.removeEventListener("mousemove", onMove);
        row.removeEventListener("mouseleave", onLeave);
      };
    });

    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);

  return (
    <div className="workPreview" ref={previewRef} aria-hidden="true">
      <div
        className="workPreviewImage"
        style={preview.image ? { backgroundImage: `url(${preview.image})` } : undefined}
      />
      <p>{preview.title}</p>
      <span>{preview.tags}</span>
    </div>
  );
}
