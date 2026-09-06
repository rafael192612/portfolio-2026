import { validateWorks, safeUrl } from "../assets/js/works/works-data.js";
import { openWorkModal } from "../assets/js/works/works-modal.js";

const fixture = {
  id: "fixture-local", title: "Fixture técnica <img src=x onerror=alert(1)>",
  description: "Teste local de texto seguro e conteúdo longo. ".repeat(30),
  technologies: ["HTML", "<script>alert(1)</script>"],
  problem: "Conteúdo extenso para verificar rolagem. ".repeat(20),
  solution: "Solução de teste", challenges: "Teste de teclado", github: "https://github.com/",
};
const output = document.querySelector("#results");
let failed = 0;
function check(name, condition) {
  output.textContent += `${condition ? "PASS" : "FAIL"} ${name}\n`;
  if (!condition) failed++;
}
check("Estado vazio", validateWorks([]).length === 0);
check("Cadastro válido", validateWorks([fixture]).length === 1);
check("ID obrigatório", validateWorks([{ ...fixture, id: undefined }]).length === 0);
check("ID duplicado", validateWorks([fixture, fixture]).length === 1);
check("Título obrigatório", validateWorks([{ ...fixture, title: " " }]).length === 0);
check("Descrição obrigatória", validateWorks([{ ...fixture, description: "" }]).length === 0);
check("Tecnologias como array", validateWorks([{ ...fixture, technologies: "HTML" }]).length === 0);
check("HTTPS válido", safeUrl("https://example.com/") === "https://example.com/");
check("JavaScript rejeitado", safeUrl("javascript:alert(1)") === "");
check("Data rejeitado", safeUrl("data:text/html,test") === "");
check("Credenciais rejeitadas", safeUrl("https://user:pass@example.com/") === "");
check("HTTP externo rejeitado", safeUrl("http://example.com/") === "");
check("Asset local", safeUrl("../assets/logo/Vector.svg", { local: true }) === new URL("../assets/logo/Vector.svg", document.baseURI).href);
check("Gradiente malicioso rejeitado", validateWorks([{ ...fixture, gradient: "url(https://example.com/)" }])[0].gradient === "");
check("Galeria inválida omitida", validateWorks([{ ...fixture, gallery: ["javascript:alert(1)"] }])[0].gallery.length === 0);
const button = document.querySelector("#open");
const work = validateWorks([fixture])[0];
button.addEventListener("click", () => openWorkModal(work, button));
openWorkModal(work, button);
check("Texto não vira HTML", !document.querySelector(".project-modal__panel script, .project-modal__panel img"));
check("Foco inicial", document.activeElement.matches(".project-modal__close"));
check("Fundo isolado", document.querySelector("main").inert);
document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
check("Escape fecha", document.querySelector("[data-project-modal]").hidden);
check("Foco restaurado", document.activeElement === button);
check("Inert restaurado", !document.querySelector("main").inert);
output.textContent += failed ? `\n${failed} falha(s).` : "\nVerificações automáticas concluídas; testar Tab/Shift+Tab, overlay, rolagem e zoom manualmente.";
