
/*
  --------------------------------------------------------------------------------------
  Função para buscar usuário pelo cpf
  --------------------------------------------------------------------------------------
*/
const getUserByCpf = async () => {
    const inputUserCPF = document.getElementById('user-cpf').value.trim();
    const inputPassword = document.getElementById('password').value.trim();

    if (!isValidCPF(inputUserCPF)) {
        alert("invalid CPF.");
        return;
    }

    const formData = new FormData();
    formData.append('cpf', inputUserCPF);
    formData.append('password', inputPassword);
    
    console.log(inputUserCPF);
    console.log(inputPassword);
    // if (!isValidCPF) {
    //     alert("Please enter a valid cpf to search!");        
    //     return;
    // }
  
    let url = 'http://127.0.0.1:5000/auth/user/login';
    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });

        console.log(response);
        console.log("Body já usado?", response.bodyUsed); 

        if(response.status === 200){
            
            response.json().then((data) => {              
                
                handleUserAuthentication(data);
            })
          }else if(response.status === 404){
            alert("No user found with this CPF.");
            clearSearch();
        }        

    } catch (error) {
        console.error('Erro complete:', error);
        alert(`Erro capturado: ${error.message || error}`);
        // clearSearch();
    }
  
};

/*
  --------------------------------------------------------------------------------------
  Função para buscar estudante pelo CPF
  --------------------------------------------------------------------------------------
*/
const getStudentByCpf = async (cpf) => {

    const formData = new FormData();
    formData.append('cpf', cpf);

    const url = 'http://127.0.0.1:5000/student/student/cpf';

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(response.status === 404 
                ? "Nenhum estudante encontrado com este CPF." 
                : "Erro ao buscar estudante.");
        }

        const student = await response.json();
        console.log("Estudante encontrado:", student);

        return student;

    } catch (error) {
        console.error('Erro ao buscar estudante:', error);
        alert(error.message || "Ocorreu um erro durante a busca.");
        return null;
    }
};

const fetchNotesByStudentId = async (studentId) => {
    const url = `http://127.0.0.1:5000/grade/grade?student_id=` + encodeURIComponent(studentId);
  
    const response = await fetch(url);
    if (response.status === 200) {
      return await response.json();
    } else {
      return {
        grade_1: '-',
        grade_2: '-',
        grade_3: '-',
        grade_4: '-',
        final_average: '-'
      };
    }
};


/*
 * Processa a autenticação do usuário
 * @param {Object} userData - Dados do usuário retornados pela API
 */
const handleUserAuthentication = async (userData) => {
    
    alert("Looking for user")
    // Verifica se o objeto userData existe e tem o tipo de usuári
    if (!userData || !userData.user_type) {
        alert("Dados de usuário inválidos!");
        return;
    }
 

    localStorage.setItem('authToken', userData.id);
    
    // Mapeamento de redirecionamentos
    const redirectPaths = {
        't': 'school-secretary-student-grade.html',
        's': 'student-home.html',
        'a': 'admin-dashboard.html' // Exemplo para admin
    };

    const userType = userData.user_type;
    const targetPage = redirectPaths[userType];

    if (!targetPage) {
        alert("Unknown user type.");
        return;
    }

    if (userType === 's') {
        console.log(userData.cpf)
        const student = await getStudentByCpf(userData.cpf);
        if (!student) return;
        
        const grade = await fetchNotesByStudentId(student.id)
        if(!grade) return;

        // Armazena apenas se o estudante for válido
        localStorage.setItem('student', JSON.stringify(student));
        localStorage.setItem('grade', JSON.stringify(grade));
        console.log(localStorage);
    }

    alert(`Login successfull`);
    window.location.href = targetPage;
}

const isValidCPF = (cpf) => {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/\D/g, '');
  
    // Verifica se o CPF tem 11 dígitos ou é uma sequência repetida (ex.: "11111111111")
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) {
        return false;
    }
  
    // Valida os dígitos verificadores
    const calcDigit = (base) => {
        let sum = 0;
        for (let i = 0; i < base; i++) {
            sum += parseInt(cpf[i]) * (base + 1 - i);
        }
        const digit = sum % 11;
        return digit < 2 ? 0 : (11-digit);
    };
  
    const digit1 = calcDigit(9);
    const digit2 = calcDigit(10);
  
    return digit1 === parseInt(cpf[9]) && digit2 === parseInt(cpf[10]);
}

