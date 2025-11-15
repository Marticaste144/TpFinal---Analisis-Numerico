

/* ==========================================================
   DEMOGRAPHIQ ANALYTICS
   Simulador de Crecimiento Poblacional (1900–2050)
   Modelo Exponencial realista
   ========================================================== */

const modelos = {
  "Argentina": { P0: 46000000, r: 0.0095, r2: 0.921, rmse: 3360000 },
  "Brasil": { P0: 214000000, r: 0.0078, r2: 0.908, rmse: 16400000 },
  "Paraguay": { P0: 7200000, r: 0.012, r2: 0.914, rmse: 525000 },
  "Uruguay": { P0: 3500000, r: 0.0055, r2: 0.974, rmse: 116000 },
  "MERCOSUR": { P0: 274000000, r: 0.0082, r2: 0.912, rmse: 20400000 }
};

/* ==========================================================
   MODELO EXPONENCIAL P(t) = P0 * e^(r * (t - t0))
   ========================================================== */
function proyectarPoblacionExponencial(P0, r, anio, anioBase = 2025) {
  return P0 * Math.exp(r * (anio - anioBase));
}

/* ==========================================================
   SIMULADOR PRINCIPAL
   ========================================================== */
// ================== SIMULADOR MULTI-IDIOMA ==================
if (document.getElementById("simular")) {
  document.getElementById("simular").addEventListener("click", () => {
    const pais = document.getElementById("pais").value;
    const anioInicio = parseInt(document.getElementById("anioInicio").value);
    const anioFin = parseInt(document.getElementById("anioFin").value);

    const modelo = modelos[pais];
    const anios = [];
    const poblaciones = [];
    const superior = [];
    const inferior = [];

    for (let t = anioInicio; t <= anioFin; t++) {
      const P = proyectarPoblacionExponencial(modelo.P0, modelo.r, t);
      poblaciones.push(P);
      anios.push(t);
      superior.push(P + modelo.rmse);
      inferior.push(Math.max(P - modelo.rmse, 0));
    }

    const incremento = poblaciones[poblaciones.length - 1] - poblaciones[0];
    const prom = incremento / (anioFin - anioInicio);

    // Idioma actual desde el selector
    const langSelect = document.getElementById("language");
    const lang = (langSelect && langSelect.value) || "es";

    // Locale numérico por idioma
    const locales = {
      es: "es-AR",
      pt: "pt-BR",
      en: "en-US"
    };
    const locale = locales[lang] || "es-AR";

    const format = (value) =>
      value.toLocaleString(locale, { maximumFractionDigits: 0 });

    // Textos por idioma
    let outputHtml = "";

    if (lang === "pt") {
      outputHtml = `
        <strong>${pais}</strong><br>
        População ${anioInicio}: ${format(poblaciones[0])} hab.<br>
        População ${anioFin}: ${format(
          poblaciones[poblaciones.length - 1]
        )} hab.<br>
        Incremento total: ${format(incremento)} hab.<br>
        Crescimento médio anual: ${format(prom)} hab/ano<br>
        <small>Modelo exponencial — R² = ${modelo.r2.toFixed(3)}</small>
      `;
    } else if (lang === "en") {
      outputHtml = `
        <strong>${pais}</strong><br>
        Population ${anioInicio}: ${format(poblaciones[0])} inhabitants<br>
        Population ${anioFin}: ${format(
          poblaciones[poblaciones.length - 1]
        )} inhabitants<br>
        Total increase: ${format(incremento)} inhabitants<br>
        Average annual growth: ${format(prom)} people/year<br>
        <small>Exponential model — R² = ${modelo.r2.toFixed(3)}</small>
      `;
    } else {
      // Español (default)
      outputHtml = `
        <strong>${pais}</strong><br>
        Población ${anioInicio}: ${format(poblaciones[0])} hab.<br>
        Población ${anioFin}: ${format(
          poblaciones[poblaciones.length - 1]
        )} hab.<br>
        Incremento total: ${format(incremento)} hab.<br>
        Crecimiento anual promedio: ${format(prom)} hab/año<br>
        <small>Modelo: Exponencial — R² = ${modelo.r2.toFixed(3)}</small>
      `;
    }

    document.getElementById("output").innerHTML = outputHtml;

    // ====== Gráfico también adaptado al idioma ======
    const chartTexts = {
      es: {
        main: `Proyección de población (${pais}) — Modelo Exponencial`,
        upper: "Banda superior (+RMSE)",
        lower: "Banda inferior (-RMSE)",
        yTitle: "Población (habitantes)",
        xTitle: "Año"
      },
      pt: {
        main: `Projeção de população (${pais}) — Modelo Exponencial`,
        upper: "Faixa superior (+RMSE)",
        lower: "Faixa inferior (-RMSE)",
        yTitle: "População (habitantes)",
        xTitle: "Ano"
      },
      en: {
        main: `Population projection (${pais}) — Exponential Model`,
        upper: "Upper band (+RMSE)",
        lower: "Lower band (-RMSE)",
        yTitle: "Population (inhabitants)",
        xTitle: "Year"
      }
    };

    const ct = chartTexts[lang] || chartTexts.es;

    const ctx = document.getElementById("grafico").getContext("2d");
    if (window.chartPoblacion) window.chartPoblacion.destroy();

    window.chartPoblacion = new Chart(ctx, {
      type: "line",
      data: {
        labels: anios,
        datasets: [
          {
            label: ct.main,
            data: poblaciones,
            borderColor: "#00c3ff",
            backgroundColor: "rgba(0,195,255,0.2)",
            borderWidth: 3,
            fill: false,
            tension: 0.25
          },
          {
            label: ct.upper,
            data: superior,
            borderColor: "rgba(11,48,74,0.3)",
            borderDash: [6, 6],
            borderWidth: 2,
            fill: false
          },
          {
            label: ct.lower,
            data: inferior,
            borderColor: "rgba(11,48,74,0.3)",
            borderDash: [6, 6],
            borderWidth: 2,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom" }
        },
        scales: {
          y: {
            title: { display: true, text: ct.yTitle },
            ticks: {
              callback: (v) => v.toLocaleString(locale)
            }
          },
          x: {
            title: { display: true, text: ct.xTitle }
          }
        }
      }
    });
  });
}


/* ==========================================================
   VALIDACIÓN DEL MODELO
   ========================================================== */
if (document.getElementById("graficoValidacion")) {
  const ctxVal = document.getElementById("graficoValidacion").getContext("2d");
  new Chart(ctxVal, {
    type: "bar",
    data: {
      labels: Object.keys(modelos),
      datasets: [{
        label: "Coeficiente de determinación R²",
        data: Object.values(modelos).map(m => m.r2),
        backgroundColor: ["#0b304a","#1f4e6d","#2c6f91","#3b93b6","#00c3ff"]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "Validación del modelo por mínimos cuadrados (LS)",
          font: { size: 18 }
        },
        legend: { display: false }
      },
      scales: {
        y: { min: 0.85, max: 1, title: { display: true, text: "R²" } }
      }
    }
  });

  // Tabla de validación
  if (document.getElementById("tablaModelos")) {
    const tbody = document.querySelector("#tablaModelos tbody");
    Object.entries(modelos).forEach(([pais, datos]) => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${pais}</td>
        <td>${datos.P0.toExponential(2)}</td>
        <td>${datos.r.toExponential(3)}</td>
        <td>${datos.r2.toFixed(3)}</td>
        <td>${datos.rmse.toExponential(2)}</td>
      `;
      tbody.appendChild(fila);
    });
  }
}

/* ==========================================================
   🌍 CAMBIO DE IDIOMA FUNCIONAL (ES / PT / EN)
   ========================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const selector = document.getElementById("language");
  if (!selector) return;

  const traducciones = {
    es: {
      inicio: "Inicio",
      simulador: "Simulador",
      validacion: "Validación",
      nosotros: "Nosotros",
      contacto: "Contacto",
      titulo: "Analítica Demográfica Avanzada",
      subtitulo: "Proyecciones poblacionales del MERCOSUR mediante modelos de mínimos cuadrados y análisis predictivo.",
      frase: "Modelamos el futuro con datos.",
      boton: "Probar Simulador",
      mision: "Nuestra misión",
      textoMision: "En DemographIQ Analytics utilizamos modelos matemáticos y herramientas de ciencia de datos para analizar y proyectar el crecimiento poblacional de América del Sur.",
      hacemos: "Qué hacemos",
      textoHacemos: "Desarrollamos modelos predictivos, visualizaciones interactivas y simuladores web accesibles para gobiernos e instituciones educativas.",
      pie: "© 2025 DemographIQ Analytics | Proyecto académico"
    },
    pt: {
      inicio: "Início",
      simulador: "Simulador",
      validacion: "Validação",
      nosotros: "Nós",
      contacto: "Contato",
      titulo: "Análise Demográfica Avançada",
      subtitulo: "Projeções populacionais do MERCOSUL usando modelos de mínimos quadrados e análise preditiva.",
      frase: "Modelamos o futuro com dados.",
      boton: "Testar Simulador",
      mision: "Nossa missão",
      textoMision: "Na DemographIQ Analytics usamos modelos matemáticos e ferramentas de ciência de dados para projetar o crescimento populacional da América do Sul.",
      hacemos: "O que fazemos",
      textoHacemos: "Desenvolvemos modelos preditivos, visualizações interativas e simuladores web para governos e instituições de ensino.",
      pie: "© 2025 DemographIQ Analytics | Projeto acadêmico"
    },
    en: {
      inicio: "Home",
      simulador: "Simulator",
      validacion: "Validation",
      nosotros: "About Us",
      contacto: "Contact",
      titulo: "Advanced Demographic Analytics",
      subtitulo: "Population projections for MERCOSUR using least squares models and predictive analysis.",
      frase: "We model the future with data.",
      boton: "Try Simulator",
      mision: "Our Mission",
      textoMision: "At DemographIQ Analytics, we use mathematical models and data science tools to analyze and project population growth in South America.",
      hacemos: "What We Do",
      textoHacemos: "We develop predictive models, interactive visualizations and web simulators for governments and educational institutions.",
      pie: "© 2025 DemographIQ Analytics | Academic project"
    }
  };

  const links = document.querySelectorAll("nav a");

  function aplicarIdioma(lang) {
    const t = traducciones[lang];
    if (!t) return;

    if (links[0]) links[0].querySelector(".text").textContent = t.inicio;
    if (links[1]) links[1].querySelector(".text").textContent = t.simulador;
    if (links[2]) links[2].querySelector(".text").textContent = t.validacion;
    if (links[3]) links[3].querySelector(".text").textContent = t.nosotros;
    if (links[4]) links[4].querySelector(".text").textContent = t.contacto;

    if (document.getElementById("tituloPrincipal")) document.getElementById("tituloPrincipal").textContent = t.titulo;
    if (document.getElementById("subtituloPrincipal")) document.getElementById("subtituloPrincipal").textContent = t.subtitulo;
    if (document.getElementById("fraseAnimada")) document.getElementById("fraseAnimada").textContent = t.frase;
    if (document.getElementById("btnSimulador")) document.getElementById("btnSimulador").textContent = t.boton;
    if (document.getElementById("tituloMision")) document.getElementById("tituloMision").textContent = t.mision;
    if (document.getElementById("textoMision")) document.getElementById("textoMision").textContent = t.textoMision;
    if (document.getElementById("tituloHacemos")) document.getElementById("tituloHacemos").textContent = t.hacemos;
    if (document.getElementById("textoHacemos")) document.getElementById("textoHacemos").textContent = t.textoHacemos;
    if (document.querySelector("footer p")) document.querySelector("footer p").textContent = t.pie;
  }

  const idiomaGuardado = localStorage.getItem("idioma") || "es";
  selector.value = idiomaGuardado;
  aplicarIdioma(idiomaGuardado);

  selector.addEventListener("change", () => {
    const lang = selector.value;
    localStorage.setItem("idioma", lang);
    aplicarIdioma(lang);
  });
});

/* ============================================================
   SISTEMA MULTI-IDIOMA DEMOGRAPHIQ — ES / EN / PT
   ============================================================ */

/* ============================================
   1) Diccionario de traducciones
   ============================================ */
const translations = {
    es: {
        /* NAV */
        nav_home: "Inicio",
        nav_simulator: "Simulador",
        nav_validation: "Validación",
        nav_about: "Nosotros",
        nav_contact: "Contacto",

        /* HERO */
        hero_title: "Analítica Demográfica Avanzada",
        hero_description: "Proyecciones poblacionales del MERCOSUR mediante modelos de mínimos cuadrados y análisis predictivo.",
        hero_tagline: "Modelamos el futuro con datos.",
        hero_button: "Probar Simulador",

        /* MISION */
        mission_title: "Nuestra misión",
        mission_text: "En DemographIQ Analytics utilizamos modelos matemáticos y herramientas de ciencia de datos para analizar y proyectar el crecimiento poblacional de América del Sur. Nuestro objetivo es ofrecer predicciones claras y científicamente validadas para la planificación estratégica regional.",

        /* QUE HACEMOS */
        whatwedo_title: "Qué hacemos",
        whatwedo_text: "Desarrollamos modelos predictivos, visualizaciones interactivas y simuladores web accesibles para gobiernos, instituciones educativas y empresas que buscan comprender y planificar el crecimiento poblacional en el MERCOSUR.",

        /* NOSOTROS */
        about_title: "Quiénes Somos",
        about_company: "DemographIQ Analytics",
        about_slogan: "Analítica demográfica y modelado poblacional",
        about_p1: "En DemographIQ Analytics nos especializamos en el análisis de datos poblacionales y en el desarrollo de modelos predictivos aplicados al crecimiento demográfico del MERCOSUR. Integramos técnicas estadísticas, inteligencia artificial y herramientas computacionales para ofrecer proyecciones precisas y confiables.",
        about_p2: "Nuestra misión es transformar los datos en conocimiento estratégico que contribuya a la planificación social, económica y territorial de la región. A través de nuestros modelos de estimación y simuladores interactivos, buscamos brindar soluciones que apoyen la toma de decisiones basadas en evidencia.",

        /* CONTACTO */
        contact_title: "Contacto",
        contact_email_label: "📧 contacto@demographiq.com",
        contact_location: "📍 Buenos Aires, Argentina",
        contact_social_title: "Seguinos en nuestras redes",
        social_linkedin: "LinkedIn",
        social_github: "GitHub",
        social_instagram: "Instagram",
        social_youtube: "YouTube",

        /* SIMULADOR */
        sim_title: "Simulador de Crecimiento Poblacional",
        sim_description: "Seleccioná un país y un rango de años para proyectar la población con márgenes de incertidumbre.",
        sim_label_country: "País:",
        sim_label_start: "Año inicial:",
        sim_label_end: "Año final:",
        sim_button: "Simular",

        country_arg: "Argentina",
        country_uru: "Uruguay",
        country_bra: "Brasil",
        country_par: "Paraguay",
        country_mercosur: "MERCOSUR (Total)",

        /* VALIDACION */
        val_title: "Validación del Modelo LS",
        val_description: "Los modelos lineales fueron ajustados mediante mínimos cuadrados (LS) utilizando datos históricos 1900–2025. El siguiente gráfico muestra el coeficiente de determinación (R²) para cada país, indicando la calidad del ajuste.",
        val_table_title: "Resumen de Parámetros del Modelo",
        val_col_country: "País",
        val_col_intercept: "Intercepto (a)",
        val_col_slope: "Pendiente (b)",
        val_col_r2: "R²",
        val_col_rmse: "RMSE",

        /* FOOTER */
        footer_text: "© 2025 DemographIQ Analytics | Proyecto académico"
    },


    /* ============================================
       PORTUGUÉS
       ============================================ */
    pt: {
        nav_home: "Início",
        nav_simulator: "Simulador",
        nav_validation: "Validação",
        nav_about: "Nós",
        nav_contact: "Contato",

        hero_title: "Análise Demográfica Avançada",
        hero_description: "Projeções populacionais do MERCOSUL usando modelos de mínimos quadrados e análise preditiva.",
        hero_tagline: "Modelamos o futuro com dados.",
        hero_button: "Testar Simulador",

        mission_title: "Nossa missão",
        mission_text: "Na DemographIQ Analytics utilizamos modelos matemáticos e ciência de dados para analisar e projetar o crescimento populacional da América do Sul. Nosso objetivo é fornecer previsões claras e cientificamente validadas para o planejamento estratégico regional.",

        whatwedo_title: "O que fazemos",
        whatwedo_text: "Desenvolvemos modelos preditivos, visualizações interativas e simuladores acessíveis para governos, instituições educacionais e empresas que buscam entender e planejar o crescimento populacional no MERCOSUL.",

        about_title: "Quem Somos",
        about_company: "DemographIQ Analytics",
        about_slogan: "Análise demográfica e modelagem populacional",
        about_p1: "Na DemographIQ Analytics somos especializados em análise de dados populacionais e desenvolvimento de modelos preditivos aplicados ao crescimento demográfico do MERCOSUL.",
        about_p2: "Nossa missão é transformar dados em conhecimento estratégico para apoiar decisões fundamentadas em evidências.",

        contact_title: "Contato",
        contact_email_label: "📧 contato@demographiq.com",
        contact_location: "📍 Buenos Aires, Argentina",
        contact_social_title: "Siga-nos nas redes",
        social_linkedin: "LinkedIn",
        social_github: "GitHub",
        social_instagram: "Instagram",
        social_youtube: "YouTube",

        sim_title: "Simulador de Crescimento Populacional",
        sim_description: "Selecione um país e um intervalo de anos para projetar a população com margens de incerteza.",
        sim_label_country: "País:",
        sim_label_start: "Ano inicial:",
        sim_label_end: "Ano final:",
        sim_button: "Simular",

        country_arg: "Argentina",
        country_uru: "Uruguai",
        country_bra: "Brasil",
        country_par: "Paraguai",
        country_mercosur: "MERCOSUL (Total)",

        val_title: "Validação do Modelo LS",
        val_description: "Os modelos lineares foram ajustados por mínimos quadrados utilizando dados históricos 1900–2025. O gráfico mostra o R² indicando a qualidade do ajuste.",
        val_table_title: "Resumo dos Parâmetros do Modelo",
        val_col_country: "País",
        val_col_intercept: "Intercepto (a)",
        val_col_slope: "Inclinação (b)",
        val_col_r2: "R²",
        val_col_rmse: "RMSE",

        footer_text: "© 2025 DemographIQ Analytics | Projeto acadêmico"
    },


    /* ============================================
       INGLÉS
       ============================================ */
    en: {
        nav_home: "Home",
        nav_simulator: "Simulator",
        nav_validation: "Validation",
        nav_about: "About Us",
        nav_contact: "Contact",

        hero_title: "Advanced Demographic Analytics",
        hero_description: "Population projections for MERCOSUR using least-squares models and predictive analysis.",
        hero_tagline: "We model the future with data.",
        hero_button: "Try Simulator",

        mission_title: "Our Mission",
        mission_text: "At DemographIQ Analytics we use mathematical models and data science tools to analyze and project population growth in South America.",

        whatwedo_title: "What We Do",
        whatwedo_text: "We develop predictive models, interactive visualizations, and web simulators for governments, institutions, and companies planning population dynamics in MERCOSUR.",

        about_title: "Who We Are",
        about_company: "DemographIQ Analytics",
        about_slogan: "Demographic analytics & population modeling",
        about_p1: "We specialize in population data analysis and predictive modeling for MERCOSUR demographic trends.",
        about_p2: "Our mission is to transform data into strategic insights that support evidence-based decision making.",

        contact_title: "Contact",
        contact_email_label: "📧 contact@demographiq.com",
        contact_location: "📍 Buenos Aires, Argentina",
        contact_social_title: "Follow us on social media",
        social_linkedin: "LinkedIn",
        social_github: "GitHub",
        social_instagram: "Instagram",
        social_youtube: "YouTube",

        sim_title: "Population Growth Simulator",
        sim_description: "Select a country and a year range to project population with uncertainty margins.",
        sim_label_country: "Country:",
        sim_label_start: "Start year:",
        sim_label_end: "End year:",
        sim_button: "Simulate",

        country_arg: "Argentina",
        country_uru: "Uruguay",
        country_bra: "Brazil",
        country_par: "Paraguay",
        country_mercosur: "MERCOSUR (Total)",

        val_title: "LS Model Validation",
        val_description: "Linear models were fitted using least-squares (LS) with historical data (1900–2025). The chart shows R² for each country.",
        val_table_title: "Model Parameter Summary",
        val_col_country: "Country",
        val_col_intercept: "Intercept (a)",
        val_col_slope: "Slope (b)",
        val_col_r2: "R²",
        val_col_rmse: "RMSE",

        footer_text: "© 2025 DemographIQ Analytics | Academic project"
    }
};


/* ============================================
   2) FUNCIÓN PRINCIPAL DE TRADUCCIÓN
   ============================================ */
function applyTranslations(lang) {
    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (translations[lang] && translations[lang][key]) {
            el.innerHTML = translations[lang][key];
        }
    });
}


/* ============================================
   3) GESTIÓN DEL SELECTOR DE IDIOMA
   ============================================ */
const languageSelector = document.getElementById("language");

if (languageSelector) {
    languageSelector.addEventListener("change", function () {
        const selectedLang = this.value;
        localStorage.setItem("lang", selectedLang);
        applyTranslations(selectedLang);
    });
}


/* ============================================
   4) DETECCIÓN AUTOMÁTICA DEL IDIOMA + RECORDATORIO
   ============================================ */
(function initializeLanguage() {
    let lang = localStorage.getItem("lang");

    if (!lang) {
        const browserLang = navigator.language.slice(0, 2);
        if (["es", "en", "pt"].includes(browserLang)) {
            lang = browserLang;
        } else {
            lang = "es"; // idioma por defecto
        }
        localStorage.setItem("lang", lang);
    }

    if (languageSelector) {
        languageSelector.value = lang;
    }

    applyTranslations(lang);
})();

document.addEventListener("DOMContentLoaded", () => {

  // ------- Menú hamburguesa -------
  const toggle = document.getElementById("menuToggle");
  const nav = document.getElementById("mainNav");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      nav.classList.toggle("active");
    });
  }

});

document.addEventListener("DOMContentLoaded", () => {

  const menuToggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");



  menuToggle.addEventListener("click", () => {
    mobileMenu.classList.toggle("active");
});

});
