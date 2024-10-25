import {
  Component,
  ElementRef,
  ViewChild,
  OnInit,
  Renderer2,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, CommonModule, MatIconModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  selectedTool: string = 'pencil';
  selectedColor: string = '#000000';
  pencilSize: number = 5;
  eraserSize: number = 10;
  drawing = false;

  @ViewChild('canvasRef', { static: true })
  canvas!: ElementRef<HTMLCanvasElement>;
  ctx!: CanvasRenderingContext2D;

  // For scaling and translating canvas position
  scaleX: number = 1;
  scaleY: number = 1;

  constructor(private renderer: Renderer2) {}

  ngOnInit() {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    this.ctx = canvasEl.getContext('2d')!;
    this.setCanvasSize();
    this.setCursor('pencil'); // Default to pencil cursor

    // Listen for window resize events to ensure the canvas size is correct
    window.addEventListener('resize', this.setCanvasSize.bind(this));
  }

  setCanvasSize() {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;

    // Set canvas width and height
    canvasEl.width = window.innerWidth - 200;
    canvasEl.height = window.innerHeight - 100;

    // Use getBoundingClientRect to calculate the scaling factor
    const rect = canvasEl.getBoundingClientRect();
    this.scaleX = canvasEl.width / rect.width;
    this.scaleY = canvasEl.height / rect.height;

    this.ctx.lineWidth = this.pencilSize;
    this.ctx.lineCap = 'round';
    this.ctx.strokeStyle = this.selectedColor;
  }

  // Get the correct relative position for drawing
  getRelativePosition(event: MouseEvent | TouchEvent) {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    const rect = canvasEl.getBoundingClientRect();

    let x, y;
    if (event instanceof MouseEvent) {
      // Mouse Event
      x = (event.clientX - rect.left) * this.scaleX;
      y = (event.clientY - rect.top) * this.scaleY;
    } else {
      // Touch Event (for mobile/touch devices)
      const touch = event.touches[0];
      x = (touch.clientX - rect.left) * this.scaleX;
      y = (touch.clientY - rect.top) * this.scaleY;
    }
    
    return { x, y };
  }

  setTool(tool: string) {
    this.selectedTool = tool;
    if (tool === 'eraser') {
      this.ctx.strokeStyle = '#FFFFFF'; // Eraser color
      this.setCursor('eraser');
    } else if (tool === 'pencil') {
      this.ctx.strokeStyle = this.selectedColor;
      this.setCursor('pencil');
    } else {
      this.setCursor('default');
    }
  }

  setColor() {
    if (this.selectedTool !== 'eraser') {
      this.ctx.strokeStyle = this.selectedColor;
    }
  }

  setPencilSize() {
    this.ctx.lineWidth = this.pencilSize;
  }

  setEraserSize(size: number) {
    this.eraserSize = size;
    this.ctx.lineWidth = size;
  }

  setCursor(tool: string) {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    if (tool === 'pencil') {
      this.renderer.setStyle(
        canvasEl,
        'cursor',
        'url(data:image/svg+xml;base64,<<Base64_encoded_pencil_svg>>), auto'
      );
    } else if (tool === 'eraser') {
      this.renderer.setStyle(
        canvasEl,
        'cursor',
        'url(data:image/svg+xml;base64,<<Base64_encoded_eraser_svg>>), auto'
      );
    } else {
      this.renderer.setStyle(canvasEl, 'cursor', 'default');
    }
  }

  startDrawing(event: MouseEvent | TouchEvent) {
    this.drawing = true;
    const { x, y } = this.getRelativePosition(event);
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
  }

  draw(event: MouseEvent | TouchEvent) {
    if (!this.drawing) return;
    const { x, y } = this.getRelativePosition(event);
    this.ctx.lineTo(x, y);
    this.ctx.stroke();
  }

  stopDrawing() {
    this.drawing = false;
    this.ctx.closePath();
  }

  resetCanvas() {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    this.ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    this.selectedTool = 'reset'; // Mark reset as selected
  }

  saveCanvas() {
    const canvasEl: HTMLCanvasElement = this.canvas.nativeElement;
    const link = document.createElement('a');
    link.download = 'artwork.png';
    link.href = canvasEl.toDataURL();
    link.click();
  }
}
