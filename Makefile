REGISTRY := $(or ${REGISTRY},'')
NAME     := ${REGISTRY}datalake/server
TAG      := $$(git describe --tags --long)
IMG      := ${NAME}:${TAG}
LATEST   := ${NAME}:latest
DATE     := $$(date '+%Y%m%dT%H%M00')
DOCKER_BUILD_ARGS := --build-arg http_proxy=${http_proxy} --build-arg https_proxy=${https_proxy}
TARGET   := release
AUDIT_TARGET := audit

build:
	echo "\nbuilding ${NAME} image\n"
	@docker build ${DOCKER_BUILD_ARGS} \
		--build-arg BUILD_DATE=${DATE} \
		--target=${TARGET} \
		-t ${IMG} .
	@docker tag ${IMG} ${LATEST}

audit:
	@docker build ${DOCKER_BUILD_ARGS} \
		--build-arg BUILD_DATE=${DATE} \
		--target=${AUDIT_TARGET} \
		-t ${IMG} .

push:
	@docker push ${NAME}

login:
	@docker log -u ${DOCKER_USER} -p ${DOCKER_PASS}

