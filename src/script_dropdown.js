document.addEventListener('DOMContentLoaded', function() {
    const dropdownBtns = document.querySelectorAll('.dropdown-btn');
    let hoverTimeout;
    let activeDropdown = null;

    dropdownBtns.forEach(btn => {
        const dropdownDiv = btn.parentElement;
        const dropdownContent = btn.nextElementSibling;
        
        // Hover para abrir
        dropdownDiv.addEventListener('mouseenter', function() {
            clearTimeout(hoverTimeout);
            if (activeDropdown && activeDropdown !== dropdownContent) {
                activeDropdown.style.display = 'none';
            }
            dropdownContent.style.display = 'block';
            activeDropdown = dropdownContent;
        });
        
        // Hover para fechar com delay
        dropdownDiv.addEventListener('mouseleave', function() {
            hoverTimeout = setTimeout(() => {
                dropdownContent.style.display = 'none';
                if (activeDropdown === dropdownContent) {
                    activeDropdown = null;
                }
            }, 200); // 200ms de delay
        });

        // Acessibilidade por teclado
        btn.addEventListener('focus', function() {
            clearTimeout(hoverTimeout);
            if (activeDropdown && activeDropdown !== dropdownContent) {
                activeDropdown.style.display = 'none';
            }
            dropdownContent.style.display = 'block';
            activeDropdown = dropdownContent;
        });

        // Fechar ao sair do dropdown (teclado)
        dropdownDiv.addEventListener('focusout', function(e) {
            if (!dropdownDiv.contains(e.relatedTarget)) {
                hoverTimeout = setTimeout(() => {
                    dropdownContent.style.display = 'none';
                    if (activeDropdown === dropdownContent) {
                        activeDropdown = null;
                    }
                }, 100);
            }
        });
    });

    // Fechar todos os dropdowns ao clicar fora
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown-div')) {
            const allDropdowns = document.querySelectorAll('.dropdown-container');
            allDropdowns.forEach(dropdown => {
                dropdown.style.display = 'none';
            });
            activeDropdown = null;
        }
    });
});

function logout() {
    // Remove todos os itens de armazenamento local
    localStorage.clear();
    
    // Remove cookies (se estiver usando)
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Redireciona para a página de login
    window.location.href = 'index.html';
};

document.addEventListener("DOMContentLoaded", () => {
    const routes = {
        "grades-link": "school-secretary-student-grade.html",
        "manage-account-link": "school-secretary-student-update.html",
        "new-register-link": "school-secretary-student-sign-up.html"
    };

    for (const [id, url] of Object.entries(routes)) {
        const link = document.getElementById(id);
        if (link) {
            link.addEventListener("click", (event) => {
                event.preventDefault(); // impede comportamento padrão
                window.location.href = url; // navega via JS
            });
        }
    }
});