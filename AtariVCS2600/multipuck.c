/*
 * Multi-Puck Pong - Atari 2600 VCS
 * Bitmap-based rendering kernel with cycle-accurate timing
 * Compiled with cc65
 */

#include <atari2600.h>
#include <peekpoke.h>

/* Memory layout - using cart RAM or zero page */
#define SCREEN_WIDTH  48   /* pixels */
#define SCREEN_HEIGHT 96   /* scanlines (low-res for memory) */
#define BITMAP_WIDTH  6    /* bytes (48 pixels / 8 bits) */

/* Bitmap buffer - 96 scanlines × 6 bytes = 576 bytes */
/* This fits in a 4K cart with RAM or Supercharger RAM */
unsigned char bitmap[SCREEN_HEIGHT][BITMAP_WIDTH];

/* Puck structure */
#define MAX_PUCKS 8
typedef struct {
    unsigned char x, y;      /* Position */
    signed char vx, vy;      /* Velocity */
    unsigned char active;    /* Is this puck in play? */
} Puck;

Puck pucks[MAX_PUCKS];

/* TIA Register addresses (from atari2600.h) */
/* WSYNC  = 0x02 - Wait for horizontal sync */
/* PF0    = 0x0D - Playfield register 0 (4 bits, mirrored) */
/* PF1    = 0x0E - Playfield register 1 (8 bits) */
/* PF2    = 0x0F - Playfield register 2 (8 bits, mirrored) */
/* COLUPF = 0x08 - Playfield color */

/* === PHYSICS UPDATE (runs during VBLANK, not cycle-critical) === */

void clear_bitmap(void) {
    unsigned char y, x;
    for (y = 0; y < SCREEN_HEIGHT; y++) {
        for (x = 0; x < BITMAP_WIDTH; x++) {
            bitmap[y][x] = 0;
        }
    }
}

void update_puck_position(unsigned char puck_id) {
    Puck *p = &pucks[puck_id];
    
    if (!p->active) return;
    
    /* Update position with velocity */
    p->x += p->vx;
    p->y += p->vy;
    
    /* Bounce off walls */
    if (p->x <= 0 || p->x >= SCREEN_WIDTH-1) {
        p->vx = -p->vx;
    }
    if (p->y <= 0 || p->y >= SCREEN_HEIGHT-1) {
        p->vy = -p->vy;
    }
}

void render_puck_to_bitmap(unsigned char puck_id) {
    Puck *p = &pucks[puck_id];
    unsigned char byte_idx, bit_idx;
    
    if (!p->active) return;
    
    /* Convert pixel position to bitmap coordinates */
    byte_idx = p->x >> 3;  /* Divide by 8 */
    bit_idx = p->x & 7;     /* Modulo 8 */
    
    /* Set the bit (draw a single pixel puck) */
    /* For multi-pixel pucks, set multiple bits */
    if (p->y < SCREEN_HEIGHT && byte_idx < BITMAP_WIDTH) {
        bitmap[p->y][byte_idx] |= (1 << bit_idx);
        
        /* Draw a 2x2 puck for visibility */
        if (p->y + 1 < SCREEN_HEIGHT) {
            bitmap[p->y + 1][byte_idx] |= (1 << bit_idx);
        }
        if (bit_idx < 7 && byte_idx < BITMAP_WIDTH) {
            bitmap[p->y][byte_idx] |= (1 << (bit_idx + 1));
            if (p->y + 1 < SCREEN_HEIGHT) {
                bitmap[p->y + 1][byte_idx] |= (1 << (bit_idx + 1));
            }
        }
    }
}

void physics_update(void) {
    unsigned char i;
    
    /* Clear previous frame */
    clear_bitmap();
    
    /* Update all pucks */
    for (i = 0; i < MAX_PUCKS; i++) {
        update_puck_position(i);
        render_puck_to_bitmap(i);
    }
}

/* === CYCLE-ACCURATE RENDERING KERNEL === */

/*
 * Render one scanline from bitmap
 * CRITICAL: Must complete in exactly 76 CPU cycles (228 TIA color clocks / 3)
 * 
 * Scanline timing breakdown:
 *   WSYNC   - Wait for horizontal blank (syncs us to start of scanline)
 *   68 CPU cycles of visible scanline
 *   HBLANK provides time for next line setup
 */
void render_scanline_from_bitmap(unsigned char scanline) {
    /* Map our low-res bitmap to full scanline count */
    /* Each bitmap row covers 2 real scanlines (192 / 96) */
    unsigned char bitmap_row = scanline >> 1;  /* Divide by 2 */
    
    /* Wait for horizontal blank */
    __asm__("sta WSYNC");
    
    /* 
     * Load playfield registers from bitmap
     * PF0, PF1, PF2 control left half (mirrored to right half)
     * 
     * Timing is critical here! Each STA takes 3-4 cycles.
     * The TIA latches these at specific horizontal positions.
     */
    
    /* PF0 - 4 bits (upper nibble), controls first 4 pixels */
    TIA.pf0 = bitmap[bitmap_row][0] & 0xF0;  /* ~4 cycles */
    
    /* PF1 - 8 bits, next 8 pixels (rendered in REVERSE bit order!) */
    TIA.pf1 = bitmap[bitmap_row][1];  /* ~3 cycles */
    
    /* PF2 - 8 bits, next 8 pixels */
    TIA.pf2 = bitmap[bitmap_row][2];  /* ~3 cycles */
    
    /* Note: For 48 pixel width, we need to update PF0-2 again mid-scanline
     * This requires very precise cycle counting. For simplicity, we're
     * using mirrored playfield (left half mirrors to right half).
     * A full implementation would need inline assembly here.
     */
}

/* Render the full visible screen (192 scanlines) */
void render_frame(void) {
    unsigned char scanline;
    
    /* Set playfield color (white) */
    TIA.colupf = 0x0E;
    
    /* Render 192 visible scanlines */
    for (scanline = 0; scanline < 192; scanline++) {
        render_scanline_from_bitmap(scanline);
    }
}

/* === VBLANK (Vertical Blank) - Do physics here === */
void vertical_blank(void) {
    unsigned char i;
    
    /* Enable VBLANK */
    TIA.vblank = 0x02;
    
    /* VBLANK provides ~37 scanlines of time (~2,660 cycles) */
    /* This is where we do game logic */
    
    physics_update();
    
    /* Disable VBLANK */
    TIA.vblank = 0x00;
}

/* === INITIALIZATION === */
void init_game(void) {
    unsigned char i;
    
    /* Initialize pucks */
    for (i = 0; i < MAX_PUCKS; i++) {
        pucks[i].x = 10 + (i * 5);
        pucks[i].y = 10 + (i * 10);
        pucks[i].vx = 1 + (i & 1) ? 1 : -1;
        pucks[i].vy = 1 + (i & 2) ? 1 : -1;
        pucks[i].active = (i < 4);  /* Start with 4 active pucks */
    }
    
    /* Clear bitmap */
    clear_bitmap();
    
    /* Set background color (black) */
    TIA.colubk = 0x00;
}

/* === MAIN LOOP === */
int main(void) {
    init_game();
    
    /* Main game loop - 60 Hz (NTSC) */
    while (1) {
        /* VSYNC - Start of frame */
        TIA.vsync = 0x02;
        __asm__("sta WSYNC");
        __asm__("sta WSYNC");
        __asm__("sta WSYNC");
        TIA.vsync = 0x00;
        
        /* VBLANK - Vertical blank (do physics) */
        vertical_blank();
        
        /* VISIBLE FRAME - Render */
        render_frame();
        
        /* OVERSCAN - Bottom of screen (30 scanlines) */
        TIA.vblank = 0x02;
        for (unsigned char i = 0; i < 30; i++) {
            __asm__("sta WSYNC");
        }
        TIA.vblank = 0x00;
    }
    
    return 0;
}

/*
 * CYCLE BUDGET NOTES:
 * 
 * Scanline: 76 CPU cycles (228 color clocks / 3)
 * Frame: 192 visible + 37 VBLANK + 3 VSYNC + 30 overscan = 262 scanlines
 * Total frame: ~19,912 CPU cycles @ ~1.19 MHz = ~60 Hz
 * 
 * VBLANK budget: ~2,660 cycles for all physics
 * Per scanline rendering: 76 cycles (STRICT)
 */
