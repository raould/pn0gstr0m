# Makefile for Multi-Puck Pong (Atari 2600)
# Requires: GHC (Haskell), cc65 (6502 toolchain)

# Compiler settings
GHC = ghc
CC65 = cc65
CA65 = ca65
LD65 = ld65

# Haskell sources
HS_SOURCES = AtariEDSL.hs CodeGen.hs
HS_MAIN = CodeGen.hs

# C sources
C_SOURCES = multipuck.c
C_GENERATED = generated.c

# Output files
CODEGEN_EXE = codegen
ROM_FILE = multipuck.bin
ASM_FILE = multipuck.s
OBJ_FILE = multipuck.o

# Atari 2600 configuration
ATARI_CFG = atari2600.cfg
TARGET = atari2600

# Default target
all: rom

# Build the Haskell code generator
$(CODEGEN_EXE): $(HS_SOURCES)
	@echo "Building Haskell code generator..."
	$(GHC) -O2 $(HS_MAIN) -o $(CODEGEN_EXE)

# Generate C code from Haskell EDSL
$(C_GENERATED): $(CODEGEN_EXE)
	@echo "Generating C code with cycle verification..."
	./$(CODEGEN_EXE) > $(C_GENERATED)
	@echo "Generated code:"
	@cat $(C_GENERATED)

# Compile C to 6502 assembly
$(ASM_FILE): $(C_SOURCES)
	@echo "Compiling C to 6502 assembly (cc65)..."
	$(CC65) -t $(TARGET) -O $(C_SOURCES) -o $(ASM_FILE)

# Assemble 6502 assembly to object
$(OBJ_FILE): $(ASM_FILE)
	@echo "Assembling 6502 code (ca65)..."
	$(CA65) -t $(TARGET) $(ASM_FILE) -o $(OBJ_FILE)

# Link object file to ROM
$(ROM_FILE): $(OBJ_FILE)
	@echo "Linking to ROM (ld65)..."
	$(LD65) -t $(TARGET) $(OBJ_FILE) -o $(ROM_FILE)
	@echo "ROM created: $(ROM_FILE)"
	@ls -lh $(ROM_FILE)

# Complete build
rom: $(ROM_FILE)
	@echo ""
	@echo "================================================"
	@echo "Multi-Puck Pong ROM ready!"
	@echo "================================================"
	@echo "ROM file: $(ROM_FILE)"
	@echo "Size: $$(stat -f%z $(ROM_FILE) 2>/dev/null || stat -c%s $(ROM_FILE)) bytes"
	@echo ""
	@echo "To run:"
	@echo "  stella $(ROM_FILE)"
	@echo "  or"
	@echo "  open with any Atari 2600 emulator"
	@echo "================================================"

# Generate code without building ROM
generate: $(C_GENERATED)

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -f $(CODEGEN_EXE) *.hi *.o $(ASM_FILE) $(OBJ_FILE) $(ROM_FILE) $(C_GENERATED)
	@echo "Clean complete."

# Run in Stella emulator (if installed)
run: $(ROM_FILE)
	@echo "Launching Stella emulator..."
	@if command -v stella > /dev/null; then \
		stella $(ROM_FILE); \
	else \
		echo "Stella emulator not found. Install with:"; \
		echo "  brew install stella    (macOS)"; \
		echo "  apt-get install stella (Linux)"; \
	fi

# Verify cycle counts (Haskell only)
verify: $(CODEGEN_EXE)
	@echo "Running cycle verification..."
	./$(CODEGEN_EXE)
	@echo ""
	@echo "✓ All cycle budgets verified at compile time!"

# Show ROM information
info: $(ROM_FILE)
	@echo "ROM Information:"
	@echo "  File: $(ROM_FILE)"
	@echo "  Size: $$(stat -f%z $(ROM_FILE) 2>/dev/null || stat -c%s $(ROM_FILE)) bytes"
	@hexdump -C $(ROM_FILE) | head -n 10
	@echo "  ..."

# Development: watch for changes and rebuild
# Requires: entr (install with: brew install entr)
watch:
	@echo "Watching for changes (requires 'entr')..."
	@ls $(HS_SOURCES) $(C_SOURCES) | entr -c make rom

# Help
help:
	@echo "Multi-Puck Pong for Atari 2600"
	@echo ""
	@echo "Targets:"
	@echo "  make all       - Build everything (default)"
	@echo "  make rom       - Build the Atari 2600 ROM"
	@echo "  make generate  - Generate C code from Haskell EDSL"
	@echo "  make verify    - Verify cycle budgets only"
	@echo "  make run       - Build and run in Stella emulator"
	@echo "  make clean     - Remove build artifacts"
	@echo "  make info      - Show ROM information"
	@echo "  make watch     - Auto-rebuild on file changes"
	@echo "  make help      - Show this message"
	@echo ""
	@echo "Prerequisites:"
	@echo "  GHC (Haskell):  https://www.haskell.org/ghcup/"
	@echo "  cc65 (6502):    https://cc65.github.io/"
	@echo "  Stella (emu):   https://stella-emu.github.io/"

# Quick test build
test: verify
	@echo "✓ Type-level verification passed"
	@echo "Building ROM..."
	@make rom

.PHONY: all rom generate clean run verify info watch help test
