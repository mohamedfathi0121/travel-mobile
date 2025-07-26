import {
  ScrollView,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import * as DocumentPicker from "expo-document-picker";
import { ThemedText} from "../../../components/ThemedText";
import { ThemedView } from "../../../components/ThemedView";
import { useThemeColor } from "../../../hooks/useThemeColor";

const complaintSchema = z.object({
  complaintType: z.string().min(1, "Complaint type is required"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(5, "Message must be at least 5 characters"),
});

type Company = {
  id: number;
  name: string;
  email: string;
};

type BaseTrip = {
  company_id: number;
  companies: Company[];
};

type TripSchedule = {
  date: string;
  base_trips: BaseTrip[];
};

type Booking = {
  id: number;
  trip_schedules: TripSchedule[];
};

const SendComplaintScreen = ({ userId }: { userId: string }) => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [attachment, setAttachment] = useState<any>(null);

  const textPrimary = useThemeColor({}, "textPrimary");
  const textSecondary = useThemeColor({}, "textSecondary");
  const buttonPrimary = useThemeColor({}, "buttonPrimary");
  const buttonPrimaryText = useThemeColor({}, "buttonPrimaryText");
  const inputBg = useThemeColor({}, "input");
  const bg = useThemeColor({}, "background");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(complaintSchema),
  });

  useEffect(() => {
    const fetchCompanies = async () => {
      const { data: bookings, error } = await supabase
        .from("bookings")
        .select(`
          id,
          trip_schedules!inner (
            date,
            base_trips!inner (
              company_id,
              companies (
                id,
                name,
                email
              )
            )
          )
        `)
        .eq("user_id", userId);

      if (error || !bookings) return;

      const today = new Date();
      const completed = bookings.filter((b: Booking) =>
        b.trip_schedules?.some((s) => new Date(s.date) < today)
      );

      const uniqueCompanies: Company[] = [];
      const ids = new Set<number>();

      for (const booking of completed) {
        for (const schedule of booking.trip_schedules || []) {
          for (const trip of schedule.base_trips || []) {
            for (const company of trip.companies || []) {
              if (!ids.has(company.id)) {
                uniqueCompanies.push(company);
                ids.add(company.id);
              }
            }
          }
        }
      }

      setCompanies(uniqueCompanies);
    };

    fetchCompanies();
  }, [userId]);

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({});
    if (!result.canceled) {
      setAttachment(result.assets[0]);
    }
  };

  const uploadAttachment = async () => {
    if (!attachment) return null;
    const response = await fetch(attachment.uri);
    const blob = await response.blob();
    const ext = attachment.name.split(".").pop();
    const fileName = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("complaints_attachments").upload(fileName, blob);
    if (error) return null;
    const { data } = supabase.storage.from("complaints_attachments").getPublicUrl(fileName);
    return data?.publicUrl || null;
  };

  const onSubmit = async (data: any) => {
    if (!selectedCompany) return;
    const attachmentUrl = await uploadAttachment();
    await supabase.from("complaints").insert({
      user_id: userId,
      company_id: selectedCompany.id,
      complaint_type: data.complaintType,
      subject: data.subject,
      message: data.message,
      email_to: selectedCompany.email,
      attachment_url: attachmentUrl,
    });
  };

  return (
    
    <ScrollView className="flex-1 px-4 pt-8 bg-background">
      <ThemedText className="text-xl font-bold text-textPrimary mb-4">Send Complaint</ThemedText>

      <ThemedText className="text-sm text-textPrimary mb-2">Select Company</ThemedText>
      <ThemedView className="flex-row flex-wrap gap-2 mb-2">
        {companies.map((c) => (
          <TouchableOpacity
            key={c.id}
            onPress={() => setSelectedCompany(c)}
            className={`px-3 py-2 rounded-full ${
              selectedCompany?.id === c.id ? "bg-buttonPrimary" : "bg-input"
            }`}
          >
            <ThemedText className={`text-sm ${
              selectedCompany?.id === c.id ? "text-white" : "text-textPrimary"
            }`}>
              {c.name}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ThemedView>

      <ThemedText className="text-sm text-textPrimary mb-1">Complaint Type</ThemedText>
      <Controller
        control={control}
        name="complaintType"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="Complaint type"
            placeholderTextColor={textSecondary}
            value={value}
            onChangeText={onChange}
            className="bg-input text-textPrimary px-4 py-3 rounded-md mb-1"
          />
        )}
      />
      {errors.complaintType && (
        <ThemedText className="text-red-500 text-xs mb-2">
          {errors.complaintType.message}
        </ThemedText>
      )}

      <ThemedText className="text-sm text-textPrimary mb-1">Subject</ThemedText>
      <Controller
        control={control}
        name="subject"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="Subject"
            placeholderTextColor={textSecondary}
            value={value}
            onChangeText={onChange}
            className="bg-input text-textPrimary px-4 py-3 rounded-md mb-1"
          />
        )}
      />
      {errors.subject && (
        <ThemedText className="text-red-500 text-xs mb-2">
          {errors.subject.message}
        </ThemedText>
      )}

      <ThemedText className="text-sm text-textPrimary mb-1">Message</ThemedText>
      <Controller
        control={control}
        name="message"
        render={({ field: { onChange, value } }) => (
          <TextInput
            placeholder="Write your complaint here..."
            placeholderTextColor={textSecondary}
            value={value}
            onChangeText={onChange}
            multiline
            numberOfLines={4}
            className="bg-input text-textPrimary px-4 py-3 rounded-md mb-2 h-28 text-sm"
          />
        )}
      />
      {errors.message && (
        <ThemedText className="text-red-500 text-xs mb-2">
          {errors.message.message}
        </ThemedText>
      )}

      <TouchableOpacity
        onPress={pickDocument}
        className="bg-input py-3 px-4 rounded-md mt-2"
      >
        <ThemedText className="text-textPrimary">
          {attachment ? `Selected: ${attachment.name}` : "Attach File (Optional)"}
        </ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleSubmit(onSubmit)}
        className="bg-buttonPrimary py-3 rounded-md mt-4"
      >
        <ThemedText className="text-center text-buttonPrimaryText font-medium">
          Submit Complaint
        </ThemedText>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SendComplaintScreen;
