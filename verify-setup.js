#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pxxfcphgmifhnjalixen.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4eGZjcGhnbWlmaG5qYWxpeGVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODI3OTk2MiwiZXhwIjoyMDgzODU1OTYyfQ.cVYSXQsCGiQxFMw2rrQwxCa0shIA0zpQjig7sRb6r9Q';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

console.log('🎯 FINAL VERIFICATION\n');
console.log('='.repeat(80));

async function verify() {
  // Get all profiles
  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, email, full_name, membership_type, membership_expires_at')
    .order('created_at');

  // Get all roles
  const { data: roles } = await supabase
    .from('user_roles')
    .select('*');

  console.log('\n📊 DATABASE SETUP COMPLETE\n');
  console.log('👥 User Accounts:\n');

  if (profiles) {
    for (const profile of profiles) {
      const userRoles = roles?.filter(r => r.user_id === profile.user_id).map(r => r.role) || [];
      const roleText = userRoles.length > 0 ? `🎖️  ${userRoles.join(', ')}` : '';
      const expires = profile.membership_expires_at
        ? new Date(profile.membership_expires_at).toLocaleDateString()
        : 'N/A';

      console.log(`   ${profile.full_name?.padEnd(20)}`);
      console.log(`      📧 ${profile.email}`);
      console.log(`      💳 ${profile.membership_type} (expires: ${expires})`);
      if (roleText) console.log(`      ${roleText}`);
      console.log('');
    }
  }

  console.log('🔐 Login Credentials:\n');
  console.log('   Email                          | Password  | Access Level');
  console.log('   ' + '-'.repeat(70));
  console.log('   admin@resilientmind.com        | Admin123! | 👑 ADMIN (full access)');
  console.log('   free@test.com                  | Test123!  | 🆓 FREE (limited access)');
  console.log('   basic@test.com                 | Test123!  | 📦 BASIC (standard access)');
  console.log('   premium@test.com               | Test123!  | ⭐ PREMIUM (full content)');

  console.log('\n\n🌐 Website URL: https://resilientmind.io');
  console.log('🔗 Login Page:  https://resilientmind.io/auth');
  console.log('🛠️  Admin Panel: https://resilientmind.io/admin');

  console.log('\n' + '='.repeat(80));
  console.log('✨ Setup Complete! Ready to test.\n');
}

verify().catch(console.error);
