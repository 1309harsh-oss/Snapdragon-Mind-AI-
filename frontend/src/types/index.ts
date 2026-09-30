export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface SourceChunk {
  document_id: string;
  filename: string;
  content: string;
  similarity: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  backend_used: string;
  latency_ms: number;
  tokens_count: number;
  sources?: SourceChunk[];
  created_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  model_id: string;
  processing_mode: string;
  created_at: string;
  updated_at: string;
  messages: Message[];
}

export interface DocumentItem {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  page_count: number;
  status: string;
  summary?: string;
  extracted_text_preview?: string;
  processing_time_ms: number;
  created_at: string;
  action_items?: string[];
  entities?: { entity: string; type: string }[];
  chunks_count?: number;
}

export interface AIModel {
  id: string;
  name: string;
  model_type: string;
  size_gb: number;
  quantization: string;
  context_length: number;
  backend: string;
  is_local: boolean;
  status: string;
  is_active: boolean;
}

export interface SystemTelemetry {
  cpu_percent: number;
  memory_percent: number;
  memory_used_gb: number;
  memory_total_gb: number;
  active_backend: string;
  npu_status: string;
  hardware_acceleration: string;
  total_requests: number;
  local_ratio: number;
  demo_mode: boolean;
  telemetry_status?: string;
  timestamp: string;
}

export interface DeviceInfo {
  os_system: string;
  os_release: string;
  architecture: string;
  processor: string;
  python_arch: string;
  is_arm64: boolean;
  is_windows: boolean;
  hardware_acceleration: string;
  npu_status: string;
  onnx_providers: string[];
  demo_mode: boolean;
}

export interface WorkloadRouting {
  task: string;
  preferred_backend: string;
  fallback_backend: string;
  hardware_target: 'NPU' | 'GPU' | 'CPU';
  rationale: string;
}

export interface BenchmarkResult {
  id: string;
  test_name: string;
  backend: string;
  duration_ms: number;
  throughput: number;
  latency_avg_ms: number;
  memory_mb: number;
  success_count: number;
  fail_count: number;
  report_json: any;
  created_at: string;
}

export interface PrivacyStatus {
  local_processing_only: boolean;
  cloud_requests_blocked: number;
  local_documents_count: number;
  encryption_status: string;
  data_retention_days: number;
  privacy_badge: string;
}
