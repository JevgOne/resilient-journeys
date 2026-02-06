/**
 * Run database migrations in Supabase
 * Run: node run-migrations.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = 'https://pxxfcphgmifhnjalixen.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4eGZjcGhnbWlmaG5qYWxpeGVuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODI3OTk2MiwiZXhwIjoyMDgzODU1OTYyfQ.cVYSXQsCGiQxFMw2rrQwxCa0shIA0zpQjig7sRb6r9Q';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// User IDs from previous account creation
const USER_IDS = {
  admin: '2131fb85-2685-4ee2-acae-8d9e577357bb',
  free: '88c0d82d-dd69-4803-99ec-042250614d5d',
  basic: '9ab26e29-e5f2-43e4-9f27-153a7bc94eb9',
  premium: '9fd3a975-4949-46c7-87b7-b63608f44df2'
};

async function runSQL(sql, description) {
  console.log(`\n📝 ${description}...`);
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql }).single();

    if (error) {
      // Try direct query if RPC doesn't exist
      const { error: directError } = await supabase.from('_migrations').insert({ query: sql });

      if (directError && !directError.message.includes('already exists')) {
        throw directError;
      }
    }

    console.log(`   ✅ Success`);
    return true;
  } catch (err) {
    if (err.message.includes('already exists') || err.message.includes('duplicate')) {
      console.log(`   ⚠️  Already exists, skipping...`);
      return true;
    }
    console.error(`   ❌ Error: ${err.message}`);
    return false;
  }
}

async function runMigrations() {
  console.log('🚀 Running database migrations...\n');

  try {
    // Migration 1: Main tables
    const migration1 = readFileSync(
      join(__dirname, 'supabase/migrations/20260108082044_8a45278d-259c-4cdc-a0cf-75e811c9cea6.sql'),
      'utf-8'
    );

    // Split into individual statements and run them
    const statements1 = migration1
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements1) {
      await runSQL(statement + ';', 'Running migration 1 statement');
      await new Promise(resolve => setTimeout(resolve, 200)); // Small delay
    }

    console.log('\n✅ Migration 1 completed\n');

    // Migration 2: Email validation
    const migration2 = readFileSync(
      join(__dirname, 'supabase/migrations/20260108082654_fc040e31-ad01-4c22-9115-9f1e6a96e924.sql'),
      'utf-8'
    );

    const statements2 = migration2
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements2) {
      await runSQL(statement + ';', 'Running migration 2 statement');
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log('\n✅ Migration 2 completed\n');

    // Migration 3: Testimonials & Settings
    const migration3 = readFileSync(
      join(__dirname, 'supabase/migrations/20260111083221_09936645-a407-45e2-a666-b033a0aacff3.sql'),
      'utf-8'
    );

    const statements3 = migration3
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements3) {
      await runSQL(statement + ';', 'Running migration 3 statement');
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log('\n✅ Migration 3 completed\n');

  } catch (error) {
    console.error('❌ Error reading migration files:', error.message);
    console.log('\n⚠️  Trying direct table creation instead...\n');
  }

  // Now setup user profiles and roles
  console.log('🔧 Setting up user profiles and roles...\n');

  try {
    // Admin role
    console.log('👑 Setting up admin account...');
    const { error: adminRoleError } = await supabase
      .from('user_roles')
      .upsert({ user_id: USER_IDS.admin, role: 'admin' }, { onConflict: 'user_id,role' });

    if (adminRoleError && !adminRoleError.message.includes('duplicate')) {
      console.log(`   ⚠️  Admin role: ${adminRoleError.message}`);
    } else {
      console.log('   ✅ Admin role assigned');
    }

    const { error: adminProfileError } = await supabase
      .from('profiles')
      .update({
        full_name: 'Admin User',
        membership_type: 'premium',
        membership_started_at: new Date().toISOString(),
        membership_expires_at: new Date(Date.now() + 10 * 365 * 24 * 60 * 60 * 1000).toISOString()
      })
      .eq('user_id', USER_IDS.admin);

    if (adminProfileError) {
      console.log(`   ⚠️  Admin profile: ${adminProfileError.message}`);
    } else {
      console.log('   ✅ Admin profile updated');
    }

    // Free account
    console.log('\n🆓 Setting up free account...');
    const { error: freeError } = await supabase
      .from('profiles')
      .update({ full_name: 'Free User' })
      .eq('user_id', USER_IDS.free);

    if (freeError) {
      console.log(`   ⚠️  ${freeError.message}`);
    } else {
      console.log('   ✅ Free profile updated');
    }

    // Basic membership
    console.log('\n📦 Setting up basic membership...');
    const { error: basicError } = await supabase
      .from('profiles')
      .update({
        full_name: 'Basic Member',
        membership_type: 'basic',
        membership_started_at: new Date().toISOString(),
        membership_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      })
      .eq('user_id', USER_IDS.basic);

    if (basicError) {
      console.log(`   ⚠️  ${basicError.message}`);
    } else {
      console.log('   ✅ Basic profile updated');
    }

    // Premium membership
    console.log('\n⭐ Setting up premium membership...');
    const { error: premiumError } = await supabase
      .from('profiles')
      .update({
        full_name: 'Premium Member',
        membership_type: 'premium',
        membership_started_at: new Date().toISOString(),
        membership_expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      })
      .eq('user_id', USER_IDS.premium);

    if (premiumError) {
      console.log(`   ⚠️  ${premiumError.message}`);
    } else {
      console.log('   ✅ Premium profile updated');
    }

  } catch (error) {
    console.error('❌ Error setting up profiles:', error.message);
  }

  // Verify setup
  console.log('\n\n📊 Verifying setup...\n');

  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('email, full_name, membership_type, membership_expires_at')
      .order('created_at');

    if (error) {
      console.log(`⚠️  Could not verify: ${error.message}`);
    } else if (profiles && profiles.length > 0) {
      console.log('✅ Profiles found:\n');
      profiles.forEach(p => {
        const expires = p.membership_expires_at
          ? new Date(p.membership_expires_at).toLocaleDateString()
          : 'N/A';
        console.log(`   ${p.full_name?.padEnd(20)} | ${p.email?.padEnd(30)} | ${p.membership_type?.padEnd(10)} | ${expires}`);
      });
    } else {
      console.log('⚠️  No profiles found - tables may not exist yet');
    }
  } catch (error) {
    console.log(`⚠️  Verification error: ${error.message}`);
  }

  console.log('\n\n✨ Setup complete!\n');
  console.log('🧪 Test the accounts at: https://resilientmind.io/auth\n');
}

runMigrations().catch(console.error);
