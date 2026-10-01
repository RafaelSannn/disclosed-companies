# 🪟 Guia de Instalação — Windows (Disclosed Companies)

Guia completo para rodar o **Disclosed Companies** em modo produção no Windows, usando MariaDB como banco de dados.

---

## 📋 Pré-requisitos

| Componente | Versão mínima | Link |
|---|---|---|
| Java (JDK) | 21+ | https://adoptium.net/ |
| MariaDB | 10.6+ | https://mariadb.org/download/ |
| Git (opcional) | qualquer | https://git-scm.com/ |

---

## 1. Instalar o Java 21

1. Acesse: **https://adoptium.net/**
2. Selecione **Java 21 (LTS)** → Windows → x64 → `.msi`
3. Execute o instalador → marque ✅ **"Set JAVA_HOME"** e ✅ **"Add to PATH"**
4. Verifique no Prompt de Comando:
   ```cmd
   java -version
   ```
   Deve exibir: `openjdk version "21.x.x"`

---

## 2. Instalar o MariaDB

1. Acesse: **https://mariadb.org/download/**
2. Selecione **MariaDB Server** → Windows → MSI Package
3. Durante a instalação:
   - Defina uma senha para o usuário `root` (anote-a!)
   - Marque ✅ **"Install as service"** (inicia automaticamente com o Windows)
   - Marque ✅ **"Add to PATH"**
4. Verifique no Prompt de Comando:
   ```cmd
   mysql --version
   ```

---

## 3. Configurar o Banco de Dados

Abra o **Prompt de Comando como Administrador** e execute:

```cmd
mysql -u root -p
```

Digite a senha do `root` quando solicitado. Depois copie e cole os comandos abaixo:

```sql
-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS disclosed_companies
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Criar usuário
CREATE USER IF NOT EXISTS 'dc_user'@'localhost' IDENTIFIED BY 'dc_pass123';

-- Conceder permissões
GRANT ALL PRIVILEGES ON disclosed_companies.* TO 'dc_user'@'localhost';

-- Aplicar alterações
FLUSH PRIVILEGES;

-- Verificar
SHOW DATABASES;
SELECT user, host FROM mysql.user WHERE user = 'dc_user';

EXIT;
```

### Verificar conexão

```cmd
mysql -u dc_user -pdc_pass123 -e "USE disclosed_companies; SELECT 'Conexao OK';"
```

Deve exibir: `Conexao OK`

---

## 4. Configurar o Projeto

### 4.1 Clonar ou baixar o projeto

```cmd
git clone git@github.com:RafaelSannn/disclosed-companies.git
cd disclosed-companies
```

Ou baixe o ZIP pelo GitHub e extraia.

### 4.2 Criar o arquivo de configuração de produção

Crie o arquivo `src\main\resources\application-prod.properties` com o conteúdo:

```properties
# ==========================================
# Configuração PRODUÇÃO - MariaDB (Windows)
# ==========================================
spring.datasource.url=jdbc:mariadb://localhost:3306/disclosed_companies?useSSL=false&serverTimezone=America/Fortaleza&characterEncoding=UTF-8
spring.datasource.username=dc_user
spring.datasource.password=dc_pass123
spring.datasource.driver-class-name=org.mariadb.jdbc.Driver

# JPA / Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MariaDBDialect
spring.jpa.properties.hibernate.format_sql=false

# Servidor
server.port=8080

# Logs
logging.level.br.com.projeto.disclosedcompanies=INFO
logging.level.org.springframework.security=WARN
logging.file.name=disclosed-companies.log
```

> ⚠️ **Importante:** este arquivo está no `.gitignore` e **não** é enviado ao GitHub por segurança.

---

## 5. Iniciar a Aplicação

### Opção A — Script automático (recomendado)

Dê duplo clique em:

```
start-prod.bat
```

O script irá:
1. ✅ Verificar se Java está instalado
2. ✅ Verificar conexão com MariaDB
3. ✅ Iniciar a aplicação no perfil `prod`

### Opção B — Linha de comando manual

Abra o Prompt de Comando na pasta do projeto:

```cmd
set SPRING_PROFILES_ACTIVE=prod
mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=prod
```

### Opção C — Usando JAR compilado (mais rápido na segunda execução)

```cmd
REM Compilar e gerar o JAR
mvnw.cmd clean package -DskipTests

REM Executar o JAR
java -jar target\disclosed-companies-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

---

## 6. Acessar a Aplicação

Após iniciar, acesse no navegador:

```
http://localhost:8080
```

### Credenciais de demonstração (dados de teste)

| Tipo | Email | Senha |
|---|---|---|
| Visitante | `joao@email.com` | `123456` |
| Visitante | `maria@email.com` | `123456` |
| Empresa | `tech@empresa.com` | `123456` |
| Empresa | `clean@empresa.com` | `123456` |

> Para carregar os dados de demonstração no MariaDB, execute:
> ```cmd
> mysql -u dc_user -pdc_pass123 disclosed_companies < setup-dados-teste.sql
> ```

---

## 7. Gerenciar o Serviço MariaDB

### Verificar se está rodando

```cmd
sc query MariaDB
```

### Iniciar manualmente

```cmd
net start MariaDB
```

### Parar

```cmd
net stop MariaDB
```

### Via interface gráfica

1. Pressione `Win + R` → digite `services.msc`
2. Encontre **MariaDB** na lista
3. Clique com botão direito → Iniciar / Parar

---

## 8. Solução de Problemas

### ❌ `java` não reconhecido

- Reinstale o JDK 21 marcando "Add to PATH"
- Ou defina manualmente: `set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.x.x`

### ❌ `mysql` não reconhecido

- Adicione ao PATH: `C:\Program Files\MariaDB X.X\bin`
- Ou abra via MySQL Command Line Client no Menu Iniciar

### ❌ Erro de conexão com banco

```
Access denied for user 'dc_user'@'localhost'
```

Solução:
```sql
-- Execute como root:
ALTER USER 'dc_user'@'localhost' IDENTIFIED BY 'dc_pass123';
FLUSH PRIVILEGES;
```

### ❌ Porta 8080 em uso

```cmd
REM Descobrir qual processo usa a porta:
netstat -ano | findstr :8080

REM Encerrar o processo (substitua PID pelo número):
taskkill /PID 12345 /F
```

### ❌ Erro `JAVA_HOME` não definido

```cmd
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.x.x.x-hotspot
set PATH=%JAVA_HOME%\bin;%PATH%
```

---

## 9. Configuração com DBeaver (opcional)

Para visualizar o banco de dados graficamente:

1. Baixe DBeaver: **https://dbeaver.io/download/**
2. Nova conexão → **MariaDB**
3. Configurações:
   - Host: `localhost`
   - Porta: `3306`
   - Banco: `disclosed_companies`
   - Usuário: `dc_user`
   - Senha: `dc_pass123`

---

## 📞 Suporte

- **Email:** rafael.santana.sb@gmail.com
- **GitHub:** https://github.com/RafaelSannn/disclosed-companies
