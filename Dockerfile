# Define a imagem base
FROM nginx:latest

# Copia o código-fonte para o diretório do nginx
COPY src/ /usr/share/nginx/html

# Expõe a porta 80
EXPOSE 80

# Define o comando de execução do nginx
CMD ["nginx", "-g", "daemon off;"]