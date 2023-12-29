all: examples

build-%:
	@cd $(shell echo $@ | sed s/^build-//) && yarn && yarn build

examples: build-hello-world-haiku build-transcription build-chatgpt-clone
	
.PHONY: examples
