@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul 2>&1

REM ============================================================
REM  Disclosed Companies — Inicializacao modo PRODUCAO (Windows)
REM  Banco: MariaDB  |  Profile: prod
REM ============================================================

echo.
echo  ██████╗ ██╗███████╗ ██████╗██╗      ██████╗ ███████╗███████╗██████╗
echo  ██╔══██╗██║██╔════╝██╔════╝██║     ██╔═══██╗██╔════╝██╔════╝██╔══██╗
echo  ██║  ██║██║███████╗██║     ██║     ██║   ██║███████╗█████╗  ██║  ██║
echo  ██║  ██║██║╚════██║██║     ██║     ██║   ██║╚════██║██╔══╝  ██║  ██║
echo  ██████╔╝██║███████║╚██████╗███████╗╚██████╔╝███████║███████╗██████╔╝
echo  ╚═════╝ ╚═╝╚══════╝ ╚═════╝╚══════╝ ╚═════╝ ╚══════╝╚══════╝╚═════╝
echo.
echo  Disclosed Companies - Modo PRODUCAO
echo  ============================================================
echo.

REM --- Verificar se Java esta instalado ---
where java >nul 2>&1
if %errorlevel% neq 0 (
    echo  [ERRO] Java nao encontrado no PATH!
    echo.
    echo  Instale o Java 21+ em: https://adoptium.net/
    echo  Ou defina a variavel JAVA_HOME corretamente.
    echo.
    pause
    exit /b 1
)

REM --- Verificar versao do Java ---
for /f "tokens=3" %%v in ('java -version 2^>^&1 ^| findstr /i "version"') do (
    set JAVA_VERSION=%%v
)
echo  [OK] Java encontrado: !JAVA_VERSION!

REM --- Verificar se MySQL/MariaDB esta instalado ---
where mysql >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo  [AVISO] mysql.exe nao encontrado no PATH.
    echo  Certifique-se que MariaDB esta instalado e no PATH.
    echo  Continuando sem validar conexao com banco...
    echo.
    goto :START_APP
)

REM --- Verificar conexao com o banco de dados ---
echo  [..] Verificando banco de dados disclosed_companies...
mysql -u dc_user -pdc_pass123 -e "USE disclosed_companies; SELECT 1;" >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo  [ERRO] Nao foi possivel conectar ao banco 'disclosed_companies'!
    echo.
    echo  Solucoes possiveis:
    echo    1. Verifique se o MariaDB esta rodando (services.msc)
    echo    2. Execute o script de configuracao:
    echo       mysql -u root -p ^< setup-mariadb.sh
    echo    3. Ou siga o guia: INSTALACAO_WINDOWS.md
    echo.
    set /p CONTINUAR="Deseja tentar iniciar mesmo assim? (S/N): "
    if /i "!CONTINUAR!" neq "S" (
        pause
        exit /b 1
    )
)
echo  [OK] Banco de dados acessivel.

:START_APP
REM --- Verificar se mvnw.cmd existe ---
if not exist "mvnw.cmd" (
    echo.
    echo  [ERRO] mvnw.cmd nao encontrado!
    echo  Execute este script a partir da pasta raiz do projeto.
    echo.
    pause
    exit /b 1
)

REM --- Definir variaveis de ambiente ---
set SPRING_PROFILES_ACTIVE=prod

REM --- Permitir override de senha via variavel de ambiente ---
if not defined DB_PASSWORD (
    set DB_PASSWORD=dc_pass123
)

echo.
echo  [INFO] Configuracao:
echo    Profile  : prod
echo    Database : MariaDB - localhost:3306/disclosed_companies
echo    Usuario  : dc_user
echo    Acesse   : http://localhost:8080
echo.
echo  [INFO] Dados sao PERSISTENTES - nao serao perdidos ao reiniciar.
echo  [INFO] Para parar: Ctrl+C
echo.
echo  ============================================================
echo  Iniciando aplicacao...
echo  ============================================================
echo.

REM --- Iniciar aplicacao ---
call mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=prod

REM --- Mensagem ao encerrar ---
echo.
echo  [INFO] Aplicacao encerrada.
pause
