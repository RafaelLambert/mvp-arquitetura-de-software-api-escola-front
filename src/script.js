const fetchAllStudents = async () => {
  const url = `http://127.0.0.1:5000/student/students`;

  const response = await fetch(url);
  if (response.status === 200) {
    
    const data = await response.json();
    return data.students || [];
  } else {
    return [];
  }
};

const fetchStudentByName = async (name) => {
  const url = `http://127.0.0.1:5000/student/student?name=` + name;

  const response = await fetch(url);
  if (response.status === 200) {
    return await response.json();
  } else {
    return null;
  }
};

const fetchPostStudent = async (inputName, inputCpf, inputGradeLevel, inputZipCode, inputAddress) => {
  const formData = new FormData();
  formData.append("name", inputName);
  formData.append("cpf", inputCpf);
  formData.append("grade_level", inputGradeLevel);
  formData.append("cep", inputZipCode);
  formData.append("address", inputAddress);

  console.log("FormData being sent:");
  for (const [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`);
  }

  try {
    const response = await fetch("http://localhost:5000/student/student", {
      method: "POST",
      body: formData,
    });
    console.log("----------------");
    console.log(response);

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    const data = await response.json();
    return data.id; // retorna o ID gerado
  } catch (err) {
    console.error("Erro 1:", err);
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

const fetchPostGrade = async (studentId) => {
  const gradeUrl = 'http://127.0.0.1:5000/grade/grade';
  
  const formData = new FormData(); 
  formData.append("student_id", studentId);

  try {

    const gradeResponse = await fetch(gradeUrl, {
      method: 'POST',
      body: formData
    });
    

    if (gradeResponse.ok) {
      // alert("Grade added successfully for the student!");
      return true;
    } else {
      const errorData = await gradeResponse.json();
      alert(`Error adding grade: ${errorData.message || 'Unknown error'}`);
      return false;
    }

  } catch (error) {
    console.error('Error posting grade:', error);
    alert("Error trying to add the grade. Please try again later.");
    return false;
  }
};


const fetchRollbackPostGrade = async (student, grade) => {
  try {
    
    const formData = new FormData();
    formData.append('student_id', student.id);
    formData.append('grade_1', grade.grade_1);
    formData.append('grade_2', grade.grade_2);
    formData.append('grade_3', grade.grade_3);
    formData.append('grade_4', grade.grade_4);
    formData.append('final_average', grade.final_average);
    
    const response = await fetch(`http://127.0.0.1:5000/grade/grade/rollback`, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json(); // ou response.text() dependendo do que o servidor retorna
  } catch (error) {
    console.error('Error during grade rollback:', error);
    throw error; // Re-lança o erro para que o chamador possa lidar com ele
  }
};

const fetchDeleteGradesByStudentId = async (studentId) => {
  const url = `http://127.0.0.1:5000/grade/grade?student_id=${encodeURIComponent(studentId)}`;

  const response = await fetch(url, {
    method: 'DELETE'
  });

  if (!response.ok) {
    alert("Failed to delete student notes. Operation aborted.");
    getStudentList();
    return false;
  }

  return true;
};

const fetchDeleteStudentById = async (studentId) => {
  const url = `http://127.0.0.1:5000/student/student?id=${encodeURIComponent(studentId)}`;

  const response = await fetch(url, {
    method: 'DELETE'
  });
  if (!response.ok) {
    return false;
  }

  return true;
};

const fetchDeleteStudentByIdWithRollback = async (studentId, student, grade) => {

  const url = `http://127.0.0.1:5000/student/student?id=${encodeURIComponent(studentId)}`;

  const response = await fetch(url, {
    method: 'DELETE'
  });

  if (!response.ok) {
    console.log(response);
    alert("Could not delete student.");

    // ⚠️ Rollback: recria as notas
    // await fetchRollbackPostGrade(student, grade);

    // alert("Failed to delete student. Notes have been restored.");
    getStudentList();
    return false;
  }

  return true;
};

const fetchPostUser = async (cpf) => {
  
  const formData = new FormData(); 
  formData.append("cpf", cpf);
  formData.append("password", "A1bc23");
  formData.append("user_type", "s");

  try {
      const response = await fetch('http://127.0.0.1:5000/auth/user', {
          method: 'POST',
          body: formData
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Error registering user.');
      }

      const newUser = await response.json();
      console.log('Usuário cadastrado com sucesso:', newUser);
      alert('user successfully registered!!!');
      // Redireciona ou limpa formulário, como preferir:
      // window.location.href = 'login.html';
    return true;
  } catch (error) {
      console.error('Error registering user:', error);
      alert(error.message);
      return false;
  }
};

const fetchDeleteUserByCPFWithRollback = async(studentCPf, student, grade) => {

  const url = `http://127.0.0.1:5000/auth/user?cpf=${encodeURIComponent(studentCPf)}`;
  console.log(url);
  const response = await fetch(url, {
    method: 'DELETE'
  });

  if (!response.ok) {
    console.log(response);

    // ⚠️ Rollback: recria as notas
    // await fetchRollbackPostGrade(student, grade);

    alert("Failed to delete student. Notes have been restored.");
    getStudentList();
    return false;
  }

  return true;
}


/*
  --------------------------------------------------------------------------------------
  Função para obter a lista de students existente do servidor via requisição GET
  --------------------------------------------------------------------------------------
*/
const getAllStudentsWithGrades = async () => {
  try {
    const students = await fetchAllStudents();

    if (!students || students.length === 0) {
      alert("No students found.");
      clearTableRows();
      return;
    }

    
    const studentsWithGrades = await Promise.all(
      students.map(async (student) => {
        const notes = await fetchNotesByStudentId(student.id);
        return {
          ...student,
          ...notes
        };
      })
    );

    clearTableRows();
    studentsWithGrades.forEach((s) => {
      insertList(
        s.student_id,
        s.name,
        s.cpf,
        s.enrollment,
        s.grade_level,
        s.grade_1,
        s.grade_2,
        s.grade_3,
        s.grade_4,
        s.final_average
      );
    });
  } catch (error) {
    console.error('Error:', error);
    alert("An error occurred while fetching students and grades.");
  }
};


/*
  --------------------------------------------------------------------------------------
  Função para buscar estudantes pelo nome
  --------------------------------------------------------------------------------------
*/
const getStudentByName = async () => {
  const studentName = document.getElementById('searchInput').value.trim();

  if (!searchInput) {
      alert("Please enter a name to search!");
      return;
  }

  try{
    const student = await fetchStudentByName(studentName);
    if (!student) {
      alert("No students found with the given name.");
      clearSearch();
      return;
    }

    const notes = await fetchNotesByStudentId(student.id);

    clearTableRows();
    insertList(
      student.id,
      student.name,
      student.cpf,
      student.enrollment,
      student.grade_level,
      notes.grade_1,
      notes.grade_2,
      notes.grade_3,
      notes.grade_4,
      notes.final_average
    );
  }catch(error){
    console.error('Error:', error);
    alert("An error occurred while searching for students.");
  }

};

const getJustStudentByName = async () => {
  const studentName = document.getElementById('searchInput').value.trim();

  if (!searchInput) {
      alert("Please enter a name to search!");
      return;
  }

  try{
    const student = await fetchStudentByName(studentName);
    if (!student) {
      alert("No students found with the given name.");
      clearInputs();
      return;
    }

    const notes = await fetchNotesByStudentId(student.id);

    clearInputs();
    insertInput(
      student.name,
      student.cpf,
      student.enrollment,
      student.grade_level,
      student.cep,
      student.address
    );
  }catch(error){
    console.error('Error:', error);
    alert("An error occurred while searching for students.");
  }

};

/*
  --------------------------------------------------------------------------------------
  Função para colocar um student na lista do servidor via requisição POST
  --------------------------------------------------------------------------------------
*/


/*
  --------------------------------------------------------------------------------------
  Função para Alterar um student da lista do servidor via requisição Put
  --------------------------------------------------------------------------------------
*/
const putGradeStudent = async (studentId, inputGrade1, inputGrade2, inputGrade3, inputGrade4) => {

  const formData = new FormData();

  formData.append('grade_1', inputGrade1);
  formData.append('grade_2', inputGrade2);
  formData.append('grade_3', inputGrade3);
  formData.append('grade_4', inputGrade4);

  const url = 'http://127.0.0.1:5000/grade/grade?student_id=' + encodeURIComponent(studentId);

  fetch(url, {
    method: 'put',
    body: formData
  })
  .then((response) => response.json())
  .catch((error) => {
    console.error('Error:', error);
  });
}

const putStudentForm =  async () => {

  const inputName = document.getElementById('name').value.trim();
  let inputZipCode = document.getElementById('cep').value.trim();
  const inputAddress = document.getElementById('address').value.trim();

  if (!inputName || !inputZipCode || !inputAddress) {
      alert("Please fill in the required fields.");
      return;
  }

  if(!isValidCEP(inputZipCode)){
    alert("Please enter a valid CPF.");
    return;
  }
  
  inputZipCode = inputZipCode.replace( /(\d{5})(\d{3})/, '$1-$2');
  
  const formData = new FormData();
  formData.append('cep', inputZipCode);
  formData.append('address', inputAddress);

  const url = `http://127.0.0.1:5000/student/student?name=${inputName}`;

    try {
        const response = await fetch(url, {
            method: "PUT",
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Error updating student data.");
        }

        const updatedStudent = await response.json();
        alert("Student successfully updated!!!");
        console.log(updatedStudent);

    } catch (error) {
        console.error("Erro:", error);
        alert(error.message || "Unknown error while updating the student.");
    }

};

/*
  --------------------------------------------------------------------------------------
  Função para deletar um student da lista do servidor via requisição DELETE
  --------------------------------------------------------------------------------------
*/
const deleteStudent = async (studentName) => {
  if (!studentName) {
    alert("Invalid student name.");
    return;
  }

  try {
    // 1. Buscar aluno para pegar o ID
    const student = await fetchStudentByName(studentName);
    
    if (!student || !student.id) {
      alert("Student not found.");
      return;
    }

    const studentId = student.id;
    const studentCPf = student.cpf;

    const grade = await fetchNotesByStudentId(studentId);

    // 2. Deletar notas primeiro
    const gradeDeleted = await fetchDeleteGradesByStudentId(studentId);
    if(!gradeDeleted) return;

    // 3. Deletar aluno depois
    const studentDeleted = await fetchDeleteStudentByIdWithRollback(studentId, student, grade);
    if (!studentDeleted) return;

    // 4. Deletar Usuário
    const userDeleted = await fetchDeleteUserByCPFWithRollback(studentCPf, student, grade);
    if(!userDeleted) return;

    alert(`Student "${studentName}" and their notes have been deleted.`);
  } catch (error) {
    console.error('Error:', error);
    alert("An error occurred while deleting the student and their notes.");
  }
};


/*
  --------------------------------------------------------------------------------------
  Função para limpar o campo de busca e exibir todos os estudantes
  --------------------------------------------------------------------------------------
*/
const clearSearch = () => {
  document.getElementById('searchInput').value = ""; // Limpa o campo de busca
  clearTableRows(); // Retorna todos os estudantes
};

/*
  --------------------------------------------------------------------------------------
  Função para criar um botão com evento
  --------------------------------------------------------------------------------------
*/
const createButton = (text, className, onClickAction) => {
  const button = document.createElement("button");
  button.textContent = text;
  button.className = className;
  button.onclick = onClickAction;
  return button;
};


/*
  --------------------------------------------------------------------------------------
  Função para inserir os botões de save e delete, com suas respectivas funções, para cada student da lista
  --------------------------------------------------------------------------------------
*/
const insertButtons = (parent, studentId,studentName) => {
  // Criação do botão salvar
  const saveButton = createButton("Save", "save-btn", () => {
      if (confirm("Salvar novas notas?")) {
          handleSaveAction(studentId);
      }
  });

  // Criação do botão excluir
  const deleteButton = createButton("Delete", "delete-btn", () => {
      if (confirm("Você tem certeza?")) {
          handleDeleteAction(studentName, parent.parentElement);
      }
  });

  // Adicionar botões ao elemento pai
  parent.appendChild(saveButton);
  parent.appendChild(deleteButton);
};

/*
  --------------------------------------------------------------------------------------
  Função para salvar alterações (chamada no evento do botão Save)
  --------------------------------------------------------------------------------------
*/
const handleSaveAction = (studentId) => {
  const grades = [...document.querySelectorAll(`[id^="grade"][id$="_${studentId}"]`)].map(input => input.value);

  if (grades.every(isValidGrade)) {
      
      putGradeStudent(studentId, ...grades);
      getAllStudentsWithGrades();
      alert("Grades saved successfully!");
  } else {
      alert("Please enter valid grades (0 to 10) before saving.");
  }
};

/*
  --------------------------------------------------------------------------------------
  Função para deletar aluno (chamada no evento do botão Delete)
  --------------------------------------------------------------------------------------
*/
const handleDeleteAction = (studentName, rowElement) => {
  if (confirm("Are you sure you want to delete this student?")) {
    deleteStudent(studentName);
    rowElement.remove();
    alert("Student removed successfully!");
}
};

 
/*
  --------------------------------------------------------------------------------------
  Função para preparar o formulário de cadastro do studnet
  --------------------------------------------------------------------------------------
*/
const postStudentForm = async () => {
  
  console.log("postStudentForm called");
  let inputName = document.getElementById('name').value.trim();
  let inputCpf = document.getElementById('cpf').value.trim();
  let inputGradeLevel = document.getElementById('grade-level').value.trim();
  let inputZipCode = document.getElementById('zip-code').value.trim();
  let inputAddress = document.getElementById('address').value.trim();

  inputCpf = inputCpf.toString();

  if (!inputName) {
    alert("Please enter the student's name!");
    return;
  } 
  if (!isValidCPF(inputCpf)){
    alert("please enter with a valid CPF")
    return;
  }
  if(inputGradeLevel == 'select'  ){
    alert("Please select the student's grade level.");
    return;
  } 
  inputCpf = inputCpf.replace( /(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  inputZipCode = inputZipCode.replace( /(\d{5})(\d{3})/, '$1-$2');

  const studentId = await fetchPostStudent(inputName, inputCpf, inputGradeLevel, inputZipCode, inputAddress);  
  if(studentId === null){
    alert("Student not registered!");
    return;
  }  

  let isGradePosted = false;

  isGradePosted = await fetchPostGrade(studentId);

  if(!isGradePosted){
    alert("Error registering student");
    fetchDeleteStudentById(studentId);
    return;
  }

  const isUserPosted = await fetchPostUser(inputCpf);
  if(!isUserPosted){
    alert("Error registering grades");
    fetchDeleteGradesByStudentId(studentId);
    fetchDeleteStudentById(studentId);
    return;
  }

  alert("Student, user, and grades successfully registered!!!")

}

/*
  --------------------------------------------------------------------------------------
  Função para inserir items na lista apresentada
  --------------------------------------------------------------------------------------
*/
const insertList = (id, name, cpf, gradeLevel, enrollment, grade1, grade2, grade3, grade4, finalGrade) => {

  const table = document.getElementById("studentTable");
  const row = table.insertRow();
  row.setAttribute("tabindex", "0");

  // Adiciona células de texto com os dados do aluno
  const studentData = [name, cpf, gradeLevel, enrollment];
  studentData.forEach(data => {
      const cell = row.insertCell();
      cell.textContent = data;
      cell.setAttribute("tabindex", "0");
  });

  // Adiciona células de input para as notas
  [grade1, grade2, grade3, grade4].forEach((grade, index) => {
      const input = document.createElement("input");
      input.id = `grade${index + 1}_${id}`;
      input.className = "student-grade";
      input.type = "number";
      input.min="0" 
      input.max="10" 
      input.step="0.01" 
      input.required 
      input.title="A nota deve estar entre 0 e 10."
      input.value = grade;
      row.insertCell().appendChild(input);
  });

  // Adiciona a nota final
  const finalGradeCell = row.insertCell();
  finalGradeCell.textContent = finalGrade;
  finalGradeCell.setAttribute("tabindex", "0");

  // Adiciona os botões de ação
  const actionsCell = row.insertCell();
  insertButtons(actionsCell, id, name);
};

const insertInput = (name, cpf, gradeLevel, enrollment, cep, address) => {
  
  document.getElementById('name').value = name;
  document.getElementById('cpf').value = cpf;
  document.getElementById('gradeLevel').value = gradeLevel;
  document.getElementById('enrollment').value = enrollment;
  document.getElementById('cep').value = cep;
  document.getElementById('address').value = address;
};

const clearAllInputs = () => {
  document.getElementById('searchInput').value = "";
  clearInputs();
}

const clearInputs = () =>{
  
  document.getElementById('name').value = "";
  document.getElementById('cpf').value = "";
  document.getElementById('gradeLevel').value = "";
  document.getElementById('enrollment').value = "";
  document.getElementById('cep').value = "";
  document.getElementById('address').value = "";
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
};

const isValidCEP = (cep) => {
  // Remove tudo que não for número
  const cleanedCEP = cep.replace(/\D/g, '');

  // Verifica se tem exatamente 8 dígitos numéricos
  if (cleanedCEP.length !== 8) {
      return false;
  }

  // Formata o CEP para o padrão nnnnn-nnn
  const formattedCEP = cleanedCEP.replace(/(\d{5})(\d{3})/, '$1-$2');

  // Confirma se o resultado final está no formato correto
  const cepRegex = /^\d{5}-\d{3}$/;
  return cepRegex.test(formattedCEP);
};

const isCepOnlyNumbers = (cep) => {

}

/*
  --------------------------------------------------------------------------------------
  Função para inserir items na lista apresentada
  --------------------------------------------------------------------------------------
*/
const isValidGrade = (grade) => {
  const num = parseFloat(grade);
  return !isNaN(num) && num >= 0 && num <= 10;
};

const clearTableRows = () => {

  const table = document.getElementById('studentTable');  // Substitua 'myTable' pelo id da sua tabela
  const rows = table.getElementsByTagName('tr');

  console.log(rows.length);
  // Começa do índice 1 para não remover o título (primeira linha)
  for (let i = rows.length - 1; i > 0; i--) {
    table.deleteRow(i);
  }
};

const getCepByViaCEP = async (cep) => {


  const onlyNumbers = /^[0-9]+$/;
  const cepValid = /^[0-9]{8}$/;
  try {

    if(!onlyNumbers.test(cep.value) || !cepValid.test(cep.value)){
      alert("please just use number and chek cep size");
      throw {cep_error: 'cep invalid'}
    }

    const response = await fetch(`https://viacep.com.br/ws/${cep.value}/json/`);

    if(!response.ok){
      throw await response.json();
    }

    const data = await response.json();

    
    document.getElementById('address').value = data.logradouro;

    console.log("VALIDEI")
  }catch(error){
    document.getElementById('zip-code').value = "";
    document.getElementById('address').value = "";
    console.error("Erro ao buscar o CEP:", error);
  }
}

/*
--------------------------------------------------------------------------------------
Chamada da função para carregamento inicial dos dados
--------------------------------------------------------------------------------------
*/
window.onload = () => {
  const currentPath = window.location.pathname;

  if (currentPath.endsWith("student-home.html")) {
      // Só roda esse trecho se estiver na página student-home
      console.log("Estamos na página do estudante!");

      const student = JSON.parse(localStorage.getItem("student"));
      const grade = JSON.parse(localStorage.getItem("grade"));
      console.log(student);
      if (student && grade) {

        document.getElementById('studentName').innerText = student.name;
        document.getElementById('studentCPf').innerText = student.cpf;
        document.getElementById('StudentEnrollment').innerText = student.enrollment;
        document.getElementById('grade_1').innerText = grade.grade_1;
        document.getElementById('grade_2').innerText = grade.grade_2;
        document.getElementById('grade_3').innerText = grade.grade_3;
        document.getElementById('grade_4').innerText = grade.grade_4;
        document.getElementById('finalAverage').innerText = grade.final_average;        
      }
  }
};
