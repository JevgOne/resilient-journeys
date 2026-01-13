/**
 * Script to create test accounts in Supabase
 * Run: node create-test-accounts.js
 */

import { createClient } from '@supabase/supabase-js';

// Supabase credentials from .env
const supabaseUrl = 'https://pxxfcphgmifhnjalixen.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // You'll need the service role key

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_KEY not found in environment variables');
  console.log('\n📋 To get your service key:');
  console.log('1. Go to: https://supabase.com/dashboard/project/pxxfcphgmifhnjalixen/settings/api');
  console.log('2. Copy the "service_role" key (not the anon key!)');
  console.log('3. Run: export SUPABASE_SERVICE_KEY="your-service-key-here"');
  console.log('4. Then run this script again\n');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const testAccounts = [
  {
    email: 'admin@resilientmind.com',
    password: 'Admin123!',
    name: 'Admin User',
    role: 'admin',
    membership: 'premium'
  },
  {
    email: 'free@test.com',
    password: 'Test123!',
    name: 'Free User',
    role: null,
    membership: 'free'
  },
  {
    email: 'basic@test.com',
    password: 'Test123!',
    name: 'Basic Member',
    role: null,
    membership: 'basic'
  },
  {
    email: 'premium@test.com',
    password: 'Test123!',
    name: 'Premium Member',
    role: null,
    membership: 'premium'
  }
];

async function createTestAccounts() {
  console.log('🚀 Creating test accounts in Supabase...\n');

  for (const account of testAccounts) {
    try {
      console.log(`📧 Creating: ${account.email}`);

      // Create user using admin API
      const { data: user, error: signUpError } = await supabase.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
        user_metadata: {
          full_name: account.name
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          console.log(`   ⚠️  Already exists, skipping...`);
          continue;
        }
        throw signUpError;
      }

      console.log(`   ✅ User created: ${user.user.id}`);

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: account.name,
          membership_type: account.membership,
          membership_started_at: account.membership !== 'free' ? new Date().toISOString() : null,
          membership_expires_at: account.membership !== 'free'
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
            : null
        })
        .eq('user_id', user.user.id);

      if (profileError) {
        console.log(`   ⚠️  Profile update failed: ${profileError.message}`);
      } else {
        console.log(`   ✅ Profile updated (${account.membership} membership)`);
      }

      // Assign admin role if needed
      if (account.role === 'admin') {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: user.user.id,
            role: 'admin'
          });

        if (roleError && !roleError.message.includes('duplicate')) {
          console.log(`   ⚠️  Admin role assignment failed: ${roleError.message}`);
        } else {
          console.log(`   ✅ Admin role assigned`);
        }
      }

      console.log('');
    } catch (error) {
      console.error(`   ❌ Error creating ${account.email}:`, error.message);
      console.log('');
    }
  }

  console.log('✨ Done! Test accounts created.\n');
  console.log('📋 Test Account Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  testAccounts.forEach(acc => {
    console.log(`${acc.name.padEnd(20)} | ${acc.email.padEnd(30)} | ${acc.password}`);
  });
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Run the script
createTestAccounts().catch(console.error);
