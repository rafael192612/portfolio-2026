(() => {
        try {
          const savedTheme = localStorage.getItem("vertex-theme");
          const systemTheme = matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
          document.documentElement.dataset.theme = savedTheme === "light" || savedTheme === "dark" ? savedTheme : systemTheme;
        } catch {
          document.documentElement.dataset.theme = "dark";
        }
      })();
