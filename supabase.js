import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://iklzpmnhifxwgmqydths.supabase.co"; // من لوحة التحكم
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlrbHpwbW5oaWZ4d2dtcXlkdGhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNzk4ODUsImV4cCI6MjA2Nzc1NTg4NX0.s3bDETdC3u-BvjHcnCUqD4QV2HcVCxZjwuvsKwPUI0Y"; // انسخه من Settings > API

export const supabase = createClient(supabaseUrl, supabaseKey);
