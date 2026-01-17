# Makefile for Papillon V8
SHELL := bash

# --- OS Detection ---
UNAME_S := $(shell uname -s)
ifeq ($(UNAME_S),Darwin)
    DETECTED_OS := macOS
    OS_VERSION := $(shell sw_vers -productVersion)
else ifneq (,$(findstring MINGW,$(UNAME_S)))
    DETECTED_OS := Windows
    OS_VERSION := $(shell cmd //c ver | sed -n 's/.*\[Version \([^]]*\)\].*/\1/p')
else ifneq (,$(findstring MSYS,$(UNAME_S)))
    DETECTED_OS := Windows
    OS_VERSION := $(shell cmd //c ver | sed -n 's/.*\[Version \([^]]*\)\].*/\1/p')
else ifeq ($(UNAME_S),Linux)
    DETECTED_OS := Linux
    OS_VERSION := $(shell uname -r)
else
    DETECTED_OS := Unknown
    OS_VERSION := Unknown
endif

# --- Tool Detection ---
HAS_GIT := $(shell command -v git 2> /dev/null)
HAS_NODE := $(shell command -v node 2> /dev/null)
HAS_BUN := $(shell command -v bun 2> /dev/null)
HAS_XCODE := $(shell xcode-select -p 2> /dev/null)
HAS_PODS := $(shell command -v pod 2> /dev/null)
HAS_BREW := $(shell command -v brew 2> /dev/null)

.PHONY: install

install:
	@clear
	@echo "\033[0;32m"
	@echo "    ____  ___    ____  ____  __    __    ____  _   __"
	@echo "   / __ \/   |  / __ \/  _/ / /   / /   / __ \/ | / /"
	@echo "  / /_/ / /| | / /_/ // /  / /   / /   / / / /  |/ / "
	@echo " / ____/ ___ |/ ____// /  / /___/ /___/ /_/ / /|  /  "
	@echo "/_/   /_/  |_/_/   /___/ /_____/_____/\____/_/ |_/   "
	@echo "\033[0m"
	@echo " \033[1;37mOS détecté : \033[1;36m$(DETECTED_OS)\033[0m"
	@echo " \033[1;37mVersion détectée : \033[1;36m$(OS_VERSION)\033[0m"
	@echo ""
	@echo " \033[1;34m📦 Vérification des pré-requis :\033[0m"
	@COUNT=0; \
	TOTAL=0; \
	MISSING=0; \
	echo ""; \
	\
	TOTAL=$$((TOTAL+1)); if [ -n "$(HAS_GIT)" ]; then echo "   ✅ Git"; COUNT=$$((COUNT+1)); else echo "   ❌ Git"; MISSING=$$((MISSING+1)); fi; \
	TOTAL=$$((TOTAL+1)); if [ -n "$(HAS_NODE)" ]; then echo "   ✅ Node.js"; COUNT=$$((COUNT+1)); else echo "   ❌ Node.js"; MISSING=$$((MISSING+1)); fi; \
	TOTAL=$$((TOTAL+1)); if [ -n "$(HAS_BUN)" ]; then echo "   ✅ Bun"; COUNT=$$((COUNT+1)); else echo "   ❌ Bun"; MISSING=$$((MISSING+1)); fi; \
	\
	if [ "$(DETECTED_OS)" = "macOS" ]; then \
		TOTAL=$$((TOTAL+1)); if [ -n "$(HAS_XCODE)" ]; then echo "   ✅ Xcode"; COUNT=$$((COUNT+1)); else echo "   ❌ Xcode"; MISSING=$$((MISSING+1)); fi; \
		TOTAL=$$((TOTAL+1)); if [ -n "$(HAS_PODS)" ]; then echo "   ✅ CocoaPods"; COUNT=$$((COUNT+1)); else echo "   ❌ CocoaPods"; MISSING=$$((MISSING+1)); fi; \
		TOTAL=$$((TOTAL+1)); if [ -n "$(HAS_BREW)" ]; then echo "   ✅ Homebrew"; COUNT=$$((COUNT+1)); else echo "   ❌ Homebrew"; MISSING=$$((MISSING+1)); fi; \
	fi; \
	\
	echo ""; \
	echo "   \033[1;33m$$COUNT/$$TOTAL pré-requis installés.\033[0m"; \
	echo ""; \
	\
	if [ $$MISSING -gt 0 ]; then \
		read -p "   ⚠️  Certains pré-requis sont manquants. Voulez-vous continuer ? (y/N) " CONFIRM; \
		if [ "$$CONFIRM" != "y" ] && [ "$$CONFIRM" != "Y" ]; then \
			echo "   🛑 Installation annulée."; \
			exit 1; \
		fi; \
	fi; \
	echo ""; \
	echo ""; \
	\
	echo " \033[1;34m📂 Vérification du projet :\033[0m"; \
	echo ""; \
	if [ -d ".git" ]; then echo "   ✅ Dépôt Git détecté"; else echo "   ❌ Pas de dépôt Git"; exit 1; fi; \
	if [ -f "package.json" ]; then \
		PROJECT_VERSION=$$(grep '"version":' package.json | cut -d '"' -f 4); \
		echo "   ✅ Papillon v$$PROJECT_VERSION détecté"; \
	else \
		echo "   ❌ Version de Papillon introuvable"; \
		exit 1; \
	fi; \
	echo ""; \
	\
	read -p "   🚀 Tout est prêt ! Continuer l'installation ? (Y/n) " CONFIRM_INSTALL; \
	if [ "$$CONFIRM_INSTALL" = "n" ] || [ "$$CONFIRM_INSTALL" = "N" ]; then \
		echo "   🛑 Installation annulée."; \
		exit 1; \
	fi; \
	echo ""; \
	echo "   📦 Installation des dépendances..."; \
	bun install --legacy-peer-deps --silent --no-progress > /dev/null 2>&1 || true; \
	echo ""; \
	echo "   🏗️  Prébuild de l'application..."; \
	echo "n" | bunx expo prebuild --platform all --no-install > /dev/null 2>&1 || true; \
	git restore ios/Podfile ios/Papillon.xcodeproj/project.pbxproj > /dev/null 2>&1 || true; \
	echo "   ✅ Prébuild réussi"; \
	if [ "$(DETECTED_OS)" = "macOS" ]; then \
		echo ""; \
		echo "   🍎 Installation des Pods..."; \
		cd ios && pod install > /dev/null 2>&1 || echo "   ❌ Erreur lors de l'installation des Pods"; \
		echo "   ✅ Pods installés"; \
	fi; \
	echo ""; \
	echo "   ✅ Dépendances installées"; \
	if [ "$(DETECTED_OS)" = "macOS" ]; then \
		echo ""; \
		echo "   🍎 Pour lancer l'application iOS :     \033[1;36mmake ios\033[0m"; \
	fi; \
	echo "   🤖 Pour lancer l'application Android : \033[1;36mmake android\033[0m"; \
	echo ""

ios:
	bun run ios

android:
	bun run android

start:
	bun start
