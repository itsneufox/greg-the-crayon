const revealItems = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  { threshold: 0.18 }
);

revealItems.forEach(item => observer.observe(item));

const hero = document.querySelector(".hero");
const relic = document.querySelector(".greg-relic");
const marks = document.querySelectorAll(".mark");
const returnLink = document.querySelector("[data-return-link]");
const conversionRite = document.querySelector("[data-conversion-rite]");

if (returnLink) {
  const params = new URLSearchParams(window.location.search);
  const from = params.get("from");
  const label = params.get("label");

  if (from && label) {
    returnLink.href = from;
    returnLink.textContent = `Return to ${label}`;
  }
}

if (conversionRite) {
  const steps = Array.from(conversionRite.querySelectorAll("[data-step]"));
  const progressWrap = conversionRite.querySelector("[data-conversion-progress]");
  const progress = conversionRite.querySelector("[data-conversion-count]");
  const certificate = conversionRite.querySelector("[data-certificate]");
  const reset = conversionRite.querySelector("[data-conversion-reset]");
  const nameStep = conversionRite.querySelector("[data-name-step]");
  const nameInput = conversionRite.querySelector("[data-convert-name]");
  const start = conversionRite.querySelector("[data-start-conversion]");
  const certificateName = conversionRite.querySelector("[data-certificate-name]");
  const certificateDate = conversionRite.querySelector("[data-certificate-date]");
  const certificateDownload = conversionRite.querySelector("[data-certificate-download]");
  const feedback = conversionRite.querySelector("[data-conversion-feedback]");
  const feedbackMessages = [
    "Greg likes you. The wrapper rustles in approval.",
    "Greg likes you. The Toaster Council objects, which is customary.",
    "Greg likes you. The vending machine remains unpaid and strangely proud.",
    "Greg likes you. The socks accept your position as politically cautious.",
    "Greg likes you. Dinner has been spared from the forbidden colour H.",
    "Greg likes you. The microwave heard the nod and filed it under maybe."
  ];
  let currentStep = 0;

  const showNameEntry = () => {
    currentStep = 0;
    if (nameStep) {
      nameStep.hidden = false;
    }
    if (progressWrap) {
      progressWrap.hidden = true;
    }
    if (certificate) {
      certificate.hidden = true;
      certificate.setAttribute("aria-hidden", "true");
    }
    if (feedback) {
      feedback.hidden = true;
      feedback.textContent = "";
    }
    steps.forEach(step => step.classList.remove("is-active"));
  };

  const showStep = index => {
    if (nameStep) {
      nameStep.hidden = true;
    }
    if (progressWrap) {
      progressWrap.hidden = false;
    }
    if (certificate) {
      certificate.hidden = true;
      certificate.setAttribute("aria-hidden", "true");
    }
    if (feedback) {
      feedback.hidden = true;
      feedback.textContent = "";
    }

    steps.forEach((step, stepIndex) => {
      step.classList.toggle("is-active", stepIndex === index);
    });

    if (progress) {
      progress.textContent = `Question ${index + 1} of ${steps.length}`;
    }
  };

  conversionRite.querySelectorAll("[data-conversion-next]").forEach(button => {
    button.addEventListener("click", () => {
      const answeredStep = currentStep;
      currentStep += 1;

      if (feedback) {
        feedback.textContent = feedbackMessages[answeredStep] || "Greg likes you. The answer is wrong, but accepted.";
        feedback.hidden = false;
      }

      if (currentStep >= steps.length) {
        steps.forEach(step => step.classList.remove("is-active"));
        if (progress) {
          progress.textContent = "Rite complete";
        }
        if (feedback) {
          feedback.hidden = true;
        }
        if (certificateName) {
          const name = nameInput && nameInput.value.trim() ? nameInput.value.trim() : "Bearer of the Damp Wrapper";
          certificateName.textContent = name;
        }
        if (certificateDate) {
          certificateDate.textContent = new Date().toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric"
          });
        }
        if (certificate) {
          certificate.hidden = false;
          certificate.setAttribute("aria-hidden", "false");
          certificate.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        return;
      }

      showStep(currentStep);
    });
  });

  if (reset) {
    reset.addEventListener("click", () => {
      showNameEntry();
      if (nameInput) {
        nameInput.focus();
      }
    });
  }

  if (certificateDownload) {
    certificateDownload.addEventListener("click", () => {
      const name = certificateName ? certificateName.textContent.trim() : "Bearer of the Damp Wrapper";
      const date = certificateDate ? certificateDate.textContent.trim() : new Date().toLocaleDateString();
      const fileSafeName = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "greg-convert";
      const canvas = document.createElement("canvas");
      const scale = 2;
      const width = 1600;
      const height = 1300;
      canvas.width = width * scale;
      canvas.height = height * scale;

      const context = canvas.getContext("2d");
      context.scale(scale, scale);

      const drawText = (text, x, y, options = {}) => {
        context.save();
        context.fillStyle = options.color || "#1b1713";
        context.font = options.font || "32px Georgia, serif";
        context.textAlign = options.align || "left";
        context.textBaseline = options.baseline || "alphabetic";
        context.fillText(text, x, y);
        context.restore();
      };

      const wrapText = (text, x, y, maxWidth, lineHeight, options = {}) => {
        context.save();
        context.fillStyle = options.color || "#1b1713";
        context.font = options.font || "34px Georgia, serif";
        context.textAlign = options.align || "left";
        const words = text.split(" ");
        let line = "";
        let currentY = y;

        words.forEach(word => {
          const testLine = line ? `${line} ${word}` : word;
          if (context.measureText(testLine).width > maxWidth && line) {
            context.fillText(line, x, currentY);
            line = word;
            currentY += lineHeight;
            return;
          }
          line = testLine;
        });

        if (line) {
          context.fillText(line, x, currentY);
        }

        context.restore();
        return currentY + lineHeight;
      };

      const drawFitText = (text, x, y, maxWidth, options = {}) => {
        const minSize = options.minSize || 34;
        let size = options.size || 68;

        context.save();
        context.textAlign = options.align || "center";
        context.fillStyle = options.color || "#1b1713";

        do {
          context.font = `${options.weight || "900"} ${size}px ${options.family || "Georgia, serif"}`;
          if (context.measureText(text).width <= maxWidth) {
            break;
          }
          size -= 2;
        } while (size > minSize);

        context.fillText(text, x, y);
        context.restore();
      };

      const panel = { x: 82, y: 72, width: 1436, height: 1156 };
      context.fillStyle = "#f7eddd";
      context.fillRect(0, 0, width, height);
      context.fillStyle = "#fffaf2";
      context.fillRect(panel.x, panel.y, panel.width, panel.height);

      context.strokeStyle = "#b12d62";
      context.lineWidth = 10;
      context.strokeRect(panel.x, panel.y, panel.width, panel.height);
      context.strokeStyle = "#d6b45f";
      context.lineWidth = 4;
      context.strokeRect(panel.x + 24, panel.y + 24, panel.width - 48, panel.height - 48);
      context.strokeStyle = "rgba(96, 62, 31, .22)";
      context.lineWidth = 1;
      for (let x = panel.x + 58; x < panel.x + panel.width - 58; x += 42) {
        context.beginPath();
        context.moveTo(x, panel.y + 58);
        context.lineTo(x, panel.y + panel.height - 58);
        context.stroke();
      }

      const gradient = context.createRadialGradient(800, 238, 20, 800, 238, 480);
      gradient.addColorStop(0, "rgba(233, 180, 76, .28)");
      gradient.addColorStop(1, "rgba(233, 180, 76, 0)");
      context.fillStyle = gradient;
      context.fillRect(panel.x + 36, panel.y + 36, panel.width - 72, panel.height - 72);

      drawText("Church of Greg the Crayon", 800, 152, {
        align: "center",
        color: "#603e1f",
        font: "700 32px Inter, Arial, sans-serif"
      });
      drawText("Certificate of Mild Conversion", 800, 246, {
        align: "center",
        color: "#171310",
        font: "900 74px Georgia, serif"
      });
      drawText("This certifies that", 800, 330, {
        align: "center",
        color: "rgba(23, 19, 16, .72)",
        font: "36px Georgia, serif"
      });
      drawFitText(name, 800, 424, 1000, {
        align: "center",
        color: "#b12d62",
        family: "Georgia, serif",
        minSize: 36,
        size: 68,
        weight: "900"
      });

      context.strokeStyle = "rgba(96, 62, 31, .42)";
      context.lineWidth = 3;
      context.beginPath();
      context.moveTo(370, 452);
      context.lineTo(1230, 452);
      context.stroke();

      const body = "has stood before the imaginary microwave of witness, acknowledged Greg the Crayon as spiritually crayon-shaped, renounced aggressive cupboards except where toasters are under legal review, accepted that the Debt remains unpaid and personally irrelevant, agreed to treat lost socks as politically complex, and withheld the forbidden colour H from dinner conversation.";
      const bodyBottom = wrapText(body, 800, 520, 1180, 40, {
        align: "center",
        font: "29px Georgia, serif"
      });

      const metaY = Math.max(bodyBottom + 34, 704);
      const drawMetaBox = (x, label, value) => {
        context.strokeStyle = "rgba(96, 62, 31, .28)";
        context.lineWidth = 2;
        context.strokeRect(x, metaY, 430, 116);
        drawText(label, x + 215, metaY + 42, {
          align: "center",
          color: "#b12d62",
          font: "800 20px Inter, Arial, sans-serif"
        });
        drawText(value, x + 215, metaY + 84, {
          align: "center",
          color: "#171310",
          font: "800 32px Georgia, serif"
        });
      };
      drawMetaBox(326, "DATE OF MILD CONVERSION", date);
      drawMetaBox(844, "AMOUNT NOT PAID", "\u20ac3.47");

      const sealX = 800;
      const sealY = metaY + 192;
      context.strokeStyle = "#b12d62";
      context.lineWidth = 7;
      context.beginPath();
      context.arc(sealX, sealY, 64, 0, Math.PI * 2);
      context.stroke();
      context.lineWidth = 2;
      context.beginPath();
      context.arc(sealX, sealY, 50, 0, Math.PI * 2);
      context.stroke();
      drawText("G", sealX, sealY + 22, {
        align: "center",
        color: "#b12d62",
        font: "900 76px Georgia, serif"
      });
      drawText("Rock. Crayon. Chaos. Order. Whatever.", sealX, sealY + 96, {
        align: "center",
        color: "#603e1f",
        font: "30px Georgia, serif"
      });

      const sigY = panel.y + panel.height - 80;
      context.strokeStyle = "rgba(96, 62, 31, .46)";
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(232, sigY - 26);
      context.lineTo(640, sigY - 26);
      context.moveTo(960, sigY - 26);
      context.lineTo(1368, sigY - 26);
      context.stroke();
      drawText("Witnessed by the Ventilation System", 436, sigY + 18, {
        align: "center",
        font: "25px Georgia, serif"
      });
      drawText("Recorded by the Damp Wrapper Office", 1164, sigY + 18, {
        align: "center",
        font: "25px Georgia, serif"
      });

      canvas.toBlob(blob => {
        if (!blob) {
          return;
        }
        const pngUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = pngUrl;
        link.download = `${fileSafeName}-greg-certificate.png`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(pngUrl);
      }, "image/png");
    });
  }

  if (start) {
    start.addEventListener("click", () => {
      showStep(currentStep);
    });
  }

  showNameEntry();
}

if (hero && relic) {
  hero.addEventListener("pointermove", event => {
    const rect = hero.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    relic.style.transform = `translate(${x * 12}px, ${y * 10}px)`;
    marks.forEach((mark, index) => {
      const depth = (index + 1) * 7;
      mark.style.transform = `translate(${x * depth}px, ${y * depth}px) rotate(-11deg)`;
    });
  });

  hero.addEventListener("pointerleave", () => {
    relic.style.transform = "";
    marks.forEach(mark => {
      mark.style.transform = "";
    });
  });
}
